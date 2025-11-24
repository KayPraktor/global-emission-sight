import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Progress } from '@/components/ui/progress';
import { Wrench, Sparkles, BarChart3, Shield, Target, Loader2 } from 'lucide-react';
import ExecutiveCommandCenter from '@/components/Enterprise/ExecutiveCommandCenter';
import AIInsightsPanel from '@/components/Enterprise/AIInsightsPanel';
import AdvancedScenarioPlanning from '@/components/Enterprise/AdvancedScenarioPlanning';
import ComplianceIntelligence from '@/components/Enterprise/ComplianceIntelligence';
import { ViewSelector } from '@/components/Enterprise/ViewSelector';
import { CustomizableKPIGrid } from '@/components/Enterprise/CustomizableKPIGrid';
import { enterpriseKPIService } from '@/services/enterpriseKPIService';
import { enterpriseAIService } from '@/services/enterpriseAIService';
import { scenarioModelingService } from '@/services/scenarioModelingService';
import { enterpriseComplianceService } from '@/services/enterpriseComplianceService';
import { dashboardPreferencesService, DashboardPreference, DashboardLayout } from '@/services/dashboardPreferencesService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const EnterpriseIndex = () => {
  const { organization } = useAuth();
  const [customizeMode, setCustomizeMode] = useState(false);
  const [currentView, setCurrentView] = useState<DashboardPreference | null>(null);
  const [localLayout, setLocalLayout] = useState<DashboardLayout>({
    pinnedKPIs: [],
    widgetOrder: ['kpis', 'insights', 'scenarios', 'compliance'],
    hiddenWidgets: []
  });

  // Fetch dashboard preferences
  const { data: dashboardViews = [], refetch: refetchViews } = useQuery({
    queryKey: ['dashboard-preferences', organization?.id],
    queryFn: () => organization?.id ? dashboardPreferencesService.getPreferences(organization.id) : Promise.resolve([]),
    enabled: !!organization?.id
  });

  // Load default view on mount
  useEffect(() => {
    if (!organization?.id) return;
    
    const loadDefaultView = async () => {
      const defaultView = await dashboardPreferencesService.getDefaultPreference(organization.id);
      if (defaultView) {
        setCurrentView(defaultView);
        setLocalLayout(defaultView.layout_config);
      }
    };
    
    loadDefaultView();
  }, [organization?.id]);

  // Fetch KPIs
  const { data: kpis = [], isLoading: isLoadingKPIs } = useQuery({
    queryKey: ['enterprise-kpis', organization?.id],
    queryFn: () => organization?.id ? enterpriseKPIService.calculateKPIs(organization.id) : Promise.resolve([]),
    enabled: !!organization?.id,
    refetchInterval: 5 * 60 * 1000,
  });

  // Fetch AI Insights
  const { data: insights = [], isLoading: isLoadingInsights } = useQuery({
    queryKey: ['enterprise-insights', organization?.id],
    queryFn: () => organization?.id ? enterpriseAIService.aggregateInsights(organization.id) : Promise.resolve([]),
    enabled: !!organization?.id,
    refetchInterval: 10 * 60 * 1000,
  });

  // Fetch Scenarios
  const { data: scenarios = [], isLoading: isLoadingScenarios } = useQuery({
    queryKey: ['enterprise-scenarios', organization?.id],
    queryFn: () => organization?.id ? scenarioModelingService.generateScenarios(organization.id) : Promise.resolve([]),
    enabled: !!organization?.id,
  });

  // Fetch Compliance Data
  const { data: complianceData, isLoading: isLoadingCompliance } = useQuery({
    queryKey: ['enterprise-compliance', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return { frameworks: [], deadlines: [] };
      const [frameworks, deadlines] = await Promise.all([
        enterpriseComplianceService.getFrameworks(organization.id),
        enterpriseComplianceService.getDeadlines(organization.id, 90)
      ]);
      return { frameworks, deadlines };
    },
    enabled: !!organization?.id,
  });

  useEffect(() => {
    if (organization?.id) {
      enterpriseComplianceService.initializeFrameworks(organization.id);
    }
  }, [organization?.id]);

  const handleToggleCustomize = () => {
    if (customizeMode) {
      toast.info('Customize mode disabled', {
        description: 'Save your changes as a view to keep them'
      });
    } else {
      toast.info('Customize mode enabled', {
        description: 'Pin KPIs and rearrange widgets'
      });
    }
    setCustomizeMode(!customizeMode);
  };

  const handleTogglePin = (kpiId: string) => {
    setLocalLayout(prev => ({
      ...prev,
      pinnedKPIs: prev.pinnedKPIs.includes(kpiId)
        ? prev.pinnedKPIs.filter(id => id !== kpiId)
        : [...prev.pinnedKPIs, kpiId]
    }));
  };

  const handleReorderKPIs = (sourceIndex: number, destinationIndex: number) => {
    toast.info('Drag and drop reordering coming soon!');
  };

  const handleSaveView = async (viewName: string, isDefault: boolean) => {
    if (!organization?.id) return;
    
    await dashboardPreferencesService.savePreference(
      organization.id,
      viewName,
      localLayout,
      isDefault
    );
    
    await refetchViews();
    
    if (isDefault) {
      const newDefaultView = await dashboardPreferencesService.getDefaultPreference(organization.id);
      if (newDefaultView) {
        setCurrentView(newDefaultView);
      }
    }
  };

  const handleSelectView = (view: DashboardPreference | null) => {
    setCurrentView(view);
    if (view) {
      setLocalLayout(view.layout_config);
    } else {
      setLocalLayout({
        pinnedKPIs: [],
        widgetOrder: ['kpis', 'insights', 'scenarios', 'compliance'],
        hiddenWidgets: []
      });
    }
  };

  const handleDeleteView = async (viewId: string) => {
    await dashboardPreferencesService.deletePreference(viewId);
    await refetchViews();
    
    if (currentView?.id === viewId) {
      setCurrentView(null);
      setLocalLayout({
        pinnedKPIs: [],
        widgetOrder: ['kpis', 'insights', 'scenarios', 'compliance'],
        hiddenWidgets: []
      });
    }
  };

  const handleSetDefault = async (viewId: string) => {
    if (!organization?.id) return;
    
    await dashboardPreferencesService.setDefaultPreference(viewId, organization.id);
    await refetchViews();
    
    const newDefaultView = dashboardViews.find(v => v.id === viewId);
    if (newDefaultView) {
      setCurrentView({ ...newDefaultView, is_default: true });
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const isLoading = isLoadingKPIs || isLoadingInsights || isLoadingScenarios || isLoadingCompliance;

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      {/* Header with View Selector */}
      <motion.div variants={fadeInUp}>
        <GlassmorphismCard variant="light" className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Enterprise Command Center
              </h1>
              <p className="text-muted-foreground">
                Real-time strategic intelligence and decision support
              </p>
            </div>
            <div className="flex items-center gap-2">
              <ViewSelector
                views={dashboardViews}
                currentView={currentView}
                onSelectView={handleSelectView}
                onSaveView={handleSaveView}
                onDeleteView={handleDeleteView}
                onSetDefault={handleSetDefault}
              />
              <Button
                variant={customizeMode ? 'default' : 'outline'}
                size="sm"
                onClick={handleToggleCustomize}
                className="gap-2"
              >
                <Wrench className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {customizeMode ? 'Exit Customize' : 'Customize'}
                </span>
              </Button>
            </div>
          </div>
          {customizeMode && (
            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg animate-fade-in">
              <p className="text-sm text-foreground">
                <strong>Customize Mode:</strong> Pin your favorite KPIs to keep them at the top. 
                Don't forget to save your layout as a custom view!
              </p>
            </div>
          )}
        </GlassmorphismCard>
      </motion.div>

      <Tabs defaultValue="executive" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="executive">
            <Target className="w-4 h-4 mr-2" />
            Executive Command
          </TabsTrigger>
          <TabsTrigger value="ai-insights">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="scenarios">
            <BarChart3 className="w-4 h-4 mr-2" />
            Scenario Planning
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <Shield className="w-4 h-4 mr-2" />
            Compliance Intelligence
          </TabsTrigger>
        </TabsList>

        <TabsContent value="executive" className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <motion.div variants={fadeInUp}>
                <GlassmorphismCard variant="light" className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Executive Command Center</h3>
                      <p className="text-muted-foreground">&nbsp;</p>
                    </div>
                  </div>

                  <CustomizableKPIGrid
                    kpis={kpis}
                    pinnedKPIs={localLayout.pinnedKPIs}
                    customizeMode={customizeMode}
                    onTogglePin={handleTogglePin}
                    onReorder={handleReorderKPIs}
                  />
                </GlassmorphismCard>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <GlassmorphismCard variant="light" className="p-6">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-primary" />
                    Net Zero Progress Tracker
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-card border border-border rounded-lg">
                        <div className="text-2xl font-bold">34%</div>
                        <div className="text-sm text-muted-foreground">Progress to Net Zero</div>
                        <Progress value={34} className="mt-2 h-2" />
                      </div>
                      
                      <div className="text-center p-4 bg-card border border-border rounded-lg">
                        <div className="text-2xl font-bold">2030</div>
                        <div className="text-sm text-muted-foreground">Target Year</div>
                        <div className="text-xs mt-1 text-muted-foreground">6 years remaining</div>
                      </div>
                      
                      <div className="text-center p-4 bg-card border border-border rounded-lg">
                        <div className="text-2xl font-bold">66%</div>
                        <div className="text-sm text-muted-foreground">Reduction Required</div>
                        <div className="text-xs mt-1 text-muted-foreground">16,200 tCO₂e</div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">2024 Annual Reduction Target</span>
                        <span className="text-sm text-muted-foreground">2,450 tCO₂e</span>
                      </div>
                      <Progress value={68} className="h-3" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>1,666 tCO₂e achieved</span>
                        <span>68% complete</span>
                      </div>
                    </div>
                  </div>
                </GlassmorphismCard>
              </motion.div>
            </>
          )}
        </TabsContent>

        <TabsContent value="ai-insights">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <AIInsightsPanel insights={insights} />
          )}
        </TabsContent>

        <TabsContent value="scenarios">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <AdvancedScenarioPlanning scenarios={scenarios} />
          )}
        </TabsContent>

        <TabsContent value="compliance">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <ComplianceIntelligence 
              frameworks={complianceData?.frameworks || []} 
              deadlines={complianceData?.deadlines || []} 
            />
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default EnterpriseIndex;
