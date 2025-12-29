import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { analyticsService, AnalyticsSummary } from '@/services/analyticsService';
import EmissionsOverview from '@/components/Dashboard/EmissionsOverview';
import EmissionsChart from '@/components/Dashboard/EmissionsChart';
import { EnhancedCard as Card, EnhancedCardContent as CardContent, EnhancedCardHeader as CardHeader, EnhancedCardTitle as CardTitle } from '@/components/ui/enhanced-card';
import { PageHeader, PageHeaderDateFilter, PageHeaderExport } from '@/components/ui/page-header';
import { CheckCircle2, Info, AlertTriangle, PlusCircle, ChevronRight, ChevronDown, ChevronUp, BarChart3, Target as TargetIcon, Shield, Clock, FileSpreadsheet, Activity, Bell, Zap, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { StaggeredContainer, HoverScale, FadeIn, AnimatedCounter, LoadingSkeleton } from '@/components/ui/animated-elements';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { InteractiveChart } from '@/components/ui/interactive-chart';
import { AdvancedDataTable } from '@/components/ui/advanced-data-table';

// Import new Phase 3 components
import { InteractiveButton, LikeButton, CopyButton } from '@/components/ui/micro-interactions';
import { SkeletonCard, StatusIndicator, ProgressBar } from '@/components/ui/loading-states';
import { StaggeredList, SlideIn } from '@/components/ui/page-transitions';
import { Tooltip, EmptyState } from '@/components/ui/feedback-system';
import { useAnimatedToast, useOnboarding } from '@/hooks/useMicroInteractions';
import { PerformanceMonitor } from '@/components/ui/performance-monitor';
import { VirtualList } from '@/components/ui/virtual-list';
import { useAdvancedCache } from '@/hooks/useAdvancedCache';
import TopDrivers from '@/components/Dashboard/TopDrivers';
import InsightsNextActions from '@/components/Dashboard/InsightsNextActions';
import EnhancedTargetsWidget from '@/components/Dashboard/EnhancedTargetsWidget';
import { IndustryKPIPanel } from '@/components/Industry/IndustryKPIPanel';
import StrategicIntelligencePanel from '@/components/Dashboard/StrategicIntelligencePanel';
import EmissionsTimeline from '@/components/Dashboard/EmissionsTimeline';
import { DataQualityWidget } from '@/components/Dashboard/DataQualityWidget';
import { QualityAlertsWidget } from '@/components/Dashboard/QualityAlertsWidget';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { SampleDataBadge } from '@/components/ui/sample-data-badge';
import ValueTrackingWidget from '@/components/Dashboard/ValueTrackingWidget';
import RealtimeNotificationsPanel from '@/components/Dashboard/RealtimeNotificationsPanel';
import QuickWinsSection from '@/components/Dashboard/QuickWinsSection';
import PersonalizedWelcome from '@/components/Dashboard/PersonalizedWelcome';
import SeedDataButton from '@/components/Dashboard/SeedDataButton';
import FirstTimeWelcome from '@/components/onboarding/FirstTimeWelcome';
import { DashboardCustomizer, WidgetConfig } from '@/components/Dashboard/DashboardCustomizer';
import { DraggableWidget } from '@/components/Dashboard/DraggableWidget';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';
import { ViewSelector } from '@/components/Enterprise/ViewSelector';

// Widget configuration for customization
const WIDGET_CONFIGS: WidgetConfig[] = [
  { id: 'overview', name: 'Emissions Overview', description: 'Total emissions summary by scope', icon: <Activity className="w-4 h-4" />, defaultVisible: true },
  { id: 'chart', name: 'Emissions Chart', description: 'Monthly emissions visualization', icon: <BarChart3 className="w-4 h-4" />, defaultVisible: true },
  { id: 'timeline', name: 'Emissions Timeline', description: 'Historical emissions trend', icon: <TrendingUp className="w-4 h-4" />, defaultVisible: true },
  { id: 'quickWins', name: 'Quick Wins', description: 'Actionable reduction opportunities', icon: <Zap className="w-4 h-4" />, defaultVisible: true },
  { id: 'notifications', name: 'Live Activity', description: 'Real-time updates and notifications', icon: <Bell className="w-4 h-4" />, defaultVisible: true },
  { id: 'compliance', name: 'Compliance Status', description: 'Regulatory framework adherence', icon: <Shield className="w-4 h-4" />, defaultVisible: true },
  { id: 'deadlines', name: 'Upcoming Deadlines', description: 'Critical submission dates', icon: <Clock className="w-4 h-4" />, defaultVisible: true },
  { id: 'dataQuality', name: 'Data Quality', description: 'Data completeness metrics', icon: <CheckCircle2 className="w-4 h-4" />, defaultVisible: true },
  { id: 'industryKPIs', name: 'Industry KPIs', description: 'Sector-specific metrics', icon: <TargetIcon className="w-4 h-4" />, defaultVisible: true },
  { id: 'performance', name: 'Performance Intelligence', description: 'Strategic insights and tracking', icon: <BarChart3 className="w-4 h-4" />, defaultVisible: true },
];

// Sample data for the advanced table
const sampleTableData = [{
  id: 1,
  source: 'Electricity',
  emissions: 1250.5,
  scope: 'Scope 2',
  status: 'Verified',
  lastUpdated: '2025-01-15'
}, {
  id: 2,
  source: 'Natural Gas',
  emissions: 890.2,
  scope: 'Scope 1',
  status: 'Pending',
  lastUpdated: '2025-01-14'
}, {
  id: 3,
  source: 'Business Travel',
  emissions: 456.8,
  scope: 'Scope 3',
  status: 'Verified',
  lastUpdated: '2025-01-13'
}, {
  id: 4,
  source: 'Waste',
  emissions: 123.4,
  scope: 'Scope 3',
  status: 'Draft',
  lastUpdated: '2025-01-12'
}];
const tableColumns = [{
  key: 'source' as keyof typeof sampleTableData[0],
  label: 'Emission Source',
  sortable: true
}, {
  key: 'emissions' as keyof typeof sampleTableData[0],
  label: 'Emissions (tCO₂e)',
  sortable: true,
  render: (value: number) => <AnimatedCounter value={value} suffix=" tCO₂e" className="font-mono" />
}, {
  key: 'scope' as keyof typeof sampleTableData[0],
  label: 'Scope',
  filterable: true
}, {
  key: 'status' as keyof typeof sampleTableData[0],
  label: 'Status',
  render: (value: string) => <span className={`px-2 py-1 rounded-full text-xs font-medium ${value === 'Verified' ? 'bg-green-100 text-green-800' : value === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
        {value}
      </span>
}, {
  key: 'lastUpdated' as keyof typeof sampleTableData[0],
  label: 'Last Updated',
  sortable: true
}];

// Sample chart data
const chartData = [{
  month: 'Jan',
  scope1: 890,
  scope2: 1250,
  scope3: 580
}, {
  month: 'Feb',
  scope1: 920,
  scope2: 1180,
  scope3: 620
}, {
  month: 'Mar',
  scope1: 850,
  scope2: 1320,
  scope3: 590
}, {
  month: 'Apr',
  scope1: 880,
  scope2: 1280,
  scope3: 640
}, {
  month: 'May',
  scope1: 820,
  scope2: 1200,
  scope3: 570
}];
const chartYKeys = [{
  key: 'scope1',
  label: 'Scope 1',
  color: '#ef4444'
}, {
  key: 'scope2',
  label: 'Scope 2',
  color: '#3b82f6'
}, {
  key: 'scope3',
  label: 'Scope 3',
  color: '#10b981'
}];

// Deadline navigation mapping
const DEADLINE_ROUTES = {
  'Q2 Data Collection': '/data-entry',
  'CDP Submission': '/enterprise', 
  'Annual Report': '/reports',
  'SBTi Validation': '/goals'
} as const;

// Sample deadlines data
const UPCOMING_DEADLINES = [
  {
    task: 'Q2 Data Collection',
    date: 'June 30, 2025',
    urgency: 'high' as const,
    days: 42
  }, 
  {
    task: 'CDP Submission',
    date: 'July 15, 2025',
    urgency: 'medium' as const,
    days: 57
  }, 
  {
    task: 'Annual Report',
    date: 'Dec 31, 2025',
    urgency: 'low' as const,
    days: 226
  }, 
  {
    task: 'SBTi Validation',
    date: 'Mar 1, 2026',
    urgency: 'low' as const,
    days: 287
  }
];
const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [likedCards, setLikedCards] = useState<Set<string>>(new Set());
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null);
  const { addToast } = useAnimatedToast();
  const { startOnboarding } = useOnboarding();

  // Dashboard customization hook
  const {
    layout,
    savedViews,
    currentView,
    isCustomizeMode,
    setIsCustomizeMode,
    updateLayout,
    saveLayout,
    selectView,
    deleteView,
    setDefaultView,
    isWidgetVisible,
    toggleWidgetVisibility,
  } = useDashboardLayout();

  // Add performance optimization features
  const cache = useAdvancedCache<any>({
    ttl: 10 * 60 * 1000,
    enableLogging: true
  });

  // Fetch analytics data on mount with real-time updates
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const data = await analyticsService.getAnalyticsSummary(6);
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        addToast("Failed to load analytics data", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();

    // Set up real-time subscription for emissions changes
    const channel = supabase
      .channel('dashboard-emissions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emissions_entries'
        },
        () => {
          // Refetch analytics when emissions entries change
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNewReport = async () => {
    setIsLoading(true);
    addToast("Creating new report...", "info");

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      addToast("Report created successfully!", "success");
    }, 2000);
  };
  const handleCardLike = (cardId: string, liked: boolean) => {
    const newLikedCards = new Set(likedCards);
    if (liked) {
      newLikedCards.add(cardId);
    } else {
      newLikedCards.delete(cardId);
    }
    setLikedCards(newLikedCards);
    addToast(liked ? "Added to favorites" : "Removed from favorites", "info");
  };

  const handleDeadlineClick = (deadline: typeof UPCOMING_DEADLINES[0]) => {
    const route = DEADLINE_ROUTES[deadline.task as keyof typeof DEADLINE_ROUTES];
    if (route) {
      toast.success(`Navigating to ${deadline.task}`, {
        description: "Opening the relevant section for this deadline.",
      });
      navigate(route);
    }
  };
  return <div className="space-y-6">
      {/* Performance Monitor */}
      <PerformanceMonitor componentName="Dashboard" />
      
      {/* Personalized Welcome Message */}
      <PersonalizedWelcome />

      <FadeIn>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight">Carbon Emissions Dashboard</h1>
              <p className="text-muted-foreground mt-1">Track, analyze, and reduce your organization's carbon footprint</p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Selector */}
              <ViewSelector
                views={savedViews}
                currentView={currentView}
                onSelectView={selectView}
                onSaveView={saveLayout}
                onDeleteView={deleteView}
                onSetDefault={setDefaultView}
              />
              
              {/* Dashboard Customizer */}
              <DashboardCustomizer
                widgets={WIDGET_CONFIGS}
                currentLayout={layout}
                onLayoutChange={updateLayout}
                onSave={saveLayout}
                isCustomizeMode={isCustomizeMode}
                onCustomizeModeChange={setIsCustomizeMode}
              />
              
              <PageHeaderDateFilter defaultValue="Jan - May 2025" />
              <PageHeaderExport />
              <HoverScale>
                <InteractiveButton onClick={handleNewReport} loading={isLoading} className="bg-primary hover:bg-primary/90">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {isLoading ? 'Creating...' : 'New Report'}
                </InteractiveButton>
              </HoverScale>
              <Tooltip content="Start interactive tour">
                <InteractiveButton variant="outline" onClick={startOnboarding}>
                  Help
                </InteractiveButton>
              </Tooltip>
            </div>
          </div>
        </div>
      </FadeIn>
      
      {/* Emissions Overview Widget */}
      {isWidgetVisible('overview') && (
        <DraggableWidget
          id="overview"
          title="Emissions Overview"
          isCustomizeMode={isCustomizeMode}
          isVisible={isWidgetVisible('overview')}
          onRemove={() => toggleWidgetVisibility('overview')}
        >
          <SlideIn direction="up" delay={0.1}>
            {isLoading ? (
              <SkeletonCard />
            ) : (
              <EmissionsOverview 
                totalEmissions={analyticsData?.totalEmissions || 0}
                scope1Total={analyticsData?.scope1Total || 0}
                scope2Total={analyticsData?.scope2Total || 0}
                scope3Total={analyticsData?.scope3Total || 0}
                previousPeriodTotal={analyticsData?.previousPeriodTotal || 0}
                changePercentage={analyticsData?.changePercentage || 0}
                hasData={!!analyticsData && analyticsData.totalEmissions > 0}
                monthlyData={analyticsData?.monthlyData}
              />
            )}
          </SlideIn>
        </DraggableWidget>
      )}
      
      {/* Emissions Chart Widget */}
      {isWidgetVisible('chart') && (
        <DraggableWidget
          id="chart"
          title="Emissions Chart"
          isCustomizeMode={isCustomizeMode}
          isVisible={isWidgetVisible('chart')}
          onRemove={() => toggleWidgetVisibility('chart')}
        >
          <SlideIn direction="up" delay={0.2}>
            {isLoading ? (
              <SkeletonCard />
            ) : (
              <EmissionsChart 
                monthlyData={analyticsData?.monthlyData || []}
                categoryBreakdown={analyticsData?.categoryBreakdown || []}
                hasData={!!analyticsData && analyticsData.totalEmissions > 0}
              />
            )}
          </SlideIn>
        </DraggableWidget>
      )}

      {/* Emissions Timeline Widget */}
      {isWidgetVisible('timeline') && (
        <DraggableWidget
          id="timeline"
          title="Emissions Timeline"
          isCustomizeMode={isCustomizeMode}
          isVisible={isWidgetVisible('timeline')}
          onRemove={() => toggleWidgetVisibility('timeline')}
        >
          <SlideIn direction="up" delay={0.35}>
            {isLoading ? (
              <SkeletonCard />
            ) : (
              <EmissionsTimeline 
                monthlyData={analyticsData?.monthlyData || []}
                hasData={!!analyticsData && analyticsData.totalEmissions > 0}
              />
            )}
          </SlideIn>
        </DraggableWidget>
      )}

      {/* Advanced Data Table with loading states */}
      <SlideIn direction="up" delay={0.4}>
        <div className="hidden" aria-hidden />
      </SlideIn>
      
      {/* Quick Wins & Live Activity */}
      {(isWidgetVisible('quickWins') || isWidgetVisible('notifications')) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isWidgetVisible('quickWins') && (
            <DraggableWidget
              id="quickWins"
              title="Quick Wins"
              isCustomizeMode={isCustomizeMode}
              isVisible={isWidgetVisible('quickWins')}
              onRemove={() => toggleWidgetVisibility('quickWins')}
            >
              <QuickWinsSection />
            </DraggableWidget>
          )}
          {isWidgetVisible('notifications') && (
            <DraggableWidget
              id="notifications"
              title="Live Activity"
              isCustomizeMode={isCustomizeMode}
              isVisible={isWidgetVisible('notifications')}
              onRemove={() => toggleWidgetVisibility('notifications')}
            >
              <RealtimeNotificationsPanel />
            </DraggableWidget>
          )}
        </div>
      )}

      {/* Primary Actions Section - Compliance & Deadlines */}
      {(isWidgetVisible('compliance') || isWidgetVisible('deadlines')) && (
        <>
          <SectionHeader
            icon={Shield}
            title="Primary Actions"
            subtitle="Critical compliance and deadline management"
            helpText="Monitor your organization's compliance status and upcoming regulatory deadlines to ensure continuous adherence to carbon reporting standards."
            lastUpdated="2025-01-15T14:30:00Z"
          />
          
          <StaggeredList className="grid grid-cols-1 lg:grid-cols-2 gap-6" staggerDelay={0.1}>
            {isWidgetVisible('compliance') && (
              <DraggableWidget
                id="compliance"
                title="Compliance Status"
                isCustomizeMode={isCustomizeMode}
                isVisible={isWidgetVisible('compliance')}
                onRemove={() => toggleWidgetVisibility('compliance')}
              >
                <GlassmorphismCard variant="light" className="p-6 space-y-4 relative group h-full flex flex-col">
                  <div className="absolute top-4 right-4">
                    <LikeButton initialLiked={likedCards.has('compliance-card')} onToggle={liked => handleCardLike('compliance-card', liked)} />
                  </div>
                  <div className="flex items-center pb-2 border-b border-border/30">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 mr-3">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">Compliance Status</h4>
                        <SampleDataBadge />
                      </div>
                      <p className="text-xs text-muted-foreground">Regulatory framework adherence</p>
                    </div>
                  </div>
                  <div className="space-y-3 flex-1">
                    {[{
                    name: 'GHG Protocol',
                    status: 'Compliant',
                    color: 'green',
                    progress: 100,
                    icon: CheckCircle2
                  }, {
                    name: 'ISO 14064',
                    status: 'Compliant',
                    color: 'green',
                    progress: 100,
                    icon: CheckCircle2
                  }, {
                    name: 'CDP Reporting',
                    status: 'In Progress',
                    color: 'amber',
                    progress: 75,
                    icon: Clock
                  }, {
                    name: 'TCFD Alignment',
                    status: 'Partial',
                    color: 'amber',
                    progress: 60,
                    icon: AlertTriangle
                  }].map((item, index) => <motion.div key={index} whileHover={{
                    scale: 1.02,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)'
                  }} className="p-3 bg-white/50 rounded-lg space-y-2 transition-all duration-200 hover:shadow-sm">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <item.icon className={`h-3.5 w-3.5 ${
                              item.color === 'green' ? 'text-green-500' : 
                              item.color === 'amber' ? 'text-amber-500' : 
                              'text-gray-500'
                            }`} />
                            <span className="text-sm font-medium">{item.name}</span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            item.color === 'green' ? 'bg-green-100 text-green-700 border border-green-200' : 
                            item.color === 'amber' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                            'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                        <ProgressBar value={item.progress} showLabel={false} className="h-1.5" />
                      </motion.div>)}
                  </div>
                </GlassmorphismCard>
              </DraggableWidget>
            )}
            
            {isWidgetVisible('deadlines') && (
              <DraggableWidget
                id="deadlines"
                title="Upcoming Deadlines"
                isCustomizeMode={isCustomizeMode}
                isVisible={isWidgetVisible('deadlines')}
                onRemove={() => toggleWidgetVisibility('deadlines')}
              >
                <GlassmorphismCard variant="light" className="p-6 space-y-4 relative group h-full flex flex-col">
                  <div className="absolute top-4 right-4">
                    <LikeButton initialLiked={likedCards.has('deadlines-card')} onToggle={liked => handleCardLike('deadlines-card', liked)} />
                  </div>
                  <div className="flex items-center pb-2 border-b border-border/30">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 mr-3">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">Upcoming Deadlines</h4>
                        <SampleDataBadge />
                      </div>
                      <p className="text-xs text-muted-foreground">Critical regulatory submissions</p>
                    </div>
                  </div>
                  <div className="space-y-3 flex-1">
                    {UPCOMING_DEADLINES.map((item, index) => (
                      <Tooltip key={index} content={`Priority: ${item.urgency} • ${item.days} days remaining • Click to navigate`}>
                        <motion.div 
                          whileHover={{
                            scale: 1.02,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)'
                          }} 
                          className="flex justify-between items-center p-3 bg-white/50 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm group/deadline"
                          onClick={() => handleDeadlineClick(item)}
                          role="button"
                          tabIndex={0}
                          aria-label={`Navigate to ${item.task} deadline details`}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleDeadlineClick(item);
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              item.urgency === 'high' ? 'bg-red-500 shadow-red-500/50 shadow-sm' : 
                              item.urgency === 'medium' ? 'bg-amber-500 shadow-amber-500/50 shadow-sm' : 
                              'bg-green-500 shadow-green-500/50 shadow-sm'
                            }`} />
                            <div>
                              <span className="text-sm font-medium text-foreground group-hover/deadline:text-primary transition-colors">
                                {item.task}
                              </span>
                              <div className="text-xs text-muted-foreground">{item.days} days left</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium border border-blue-200">
                              {item.date}
                            </span>
                            <ChevronRight className="h-3 w-3 text-muted-foreground group-hover/deadline:text-primary transition-colors" />
                          </div>
                        </motion.div>
                      </Tooltip>
                    ))}
                  </div>
                </GlassmorphismCard>
              </DraggableWidget>
            )}
          </StaggeredList>
        </>
      )}

      {/* Data Quality Section */}
      {isWidgetVisible('dataQuality') && (
        <DraggableWidget
          id="dataQuality"
          title="Data Quality"
          isCustomizeMode={isCustomizeMode}
          isVisible={isWidgetVisible('dataQuality')}
          onRemove={() => toggleWidgetVisibility('dataQuality')}
        >
          <SectionHeader
            icon={Shield}
            title="Data Quality Overview"
            subtitle="Monitor your data completeness and accuracy"
            helpText="Track high-level data quality metrics."
            lastUpdated="2025-01-15T14:30:00Z"
          />
          <StaggeredList className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4" staggerDelay={0.1}>
            <DataQualityWidget />
            <GlassmorphismCard variant="light" className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Detailed Quality Analysis</h3>
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Access comprehensive data quality metrics, validation rules, and improvement recommendations.
                </p>
                <Button onClick={() => navigate('/analytics?tab=quality')} className="w-full">
                  View Full Quality Dashboard
                </Button>
              </div>
            </GlassmorphismCard>
          </StaggeredList>
        </DraggableWidget>
      )}

      {/* Industry-Specific KPIs */}
      {isWidgetVisible('industryKPIs') && (
        <DraggableWidget
          id="industryKPIs"
          title="Industry KPIs"
          isCustomizeMode={isCustomizeMode}
          isVisible={isWidgetVisible('industryKPIs')}
          onRemove={() => toggleWidgetVisibility('industryKPIs')}
        >
          <SectionHeader
            icon={BarChart3}
            title="Industry KPIs"
            subtitle="Performance metrics tailored to your industry"
            helpText="These KPIs are automatically selected based on your organization's industry."
            lastUpdated="2025-01-15T14:30:00Z"
          />
          <SlideIn direction="up" delay={0.3}>
            <IndustryKPIPanel />
          </SlideIn>
        </DraggableWidget>
      )}

      {/* Performance Intelligence Section - Collapsible */}
      <motion.div 
        initial={false}
        className="space-y-4"
      >
        <div 
          className="flex items-center justify-between cursor-pointer group p-4 rounded-lg hover:bg-muted/50 transition-colors"
          onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowAdvancedAnalytics(!showAdvancedAnalytics);
            }
          }}
          aria-expanded={showAdvancedAnalytics}
          aria-controls="performance-intelligence-content"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Performance Intelligence</h3>
              <p className="text-sm text-muted-foreground">Value delivery tracking and strategic insights</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SampleDataBadge />
            <span className="text-sm text-muted-foreground">
              {showAdvancedAnalytics ? 'Collapse' : 'Expand'}
            </span>
            {showAdvancedAnalytics ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </div>
        </div>

        <AnimatePresence>
          {showAdvancedAnalytics && (
            <motion.div
              id="performance-intelligence-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-6 overflow-hidden"
            >

              {/* Value Tracking Widget */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <ValueTrackingWidget />
              </motion.div>

              {/* Top row: Key Drivers Analysis */}
              <StaggeredList className="grid grid-cols-1 lg:grid-cols-2 gap-6" staggerDelay={0.1}>
                <TopDrivers categoryBreakdown={analyticsData?.categoryBreakdown || []} />
                <InsightsNextActions />
              </StaggeredList>
              
              {/* Enhanced Targets Widget */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <EnhancedTargetsWidget />
              </motion.div>

              {/* Strategic Intelligence Panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <StrategicIntelligencePanel />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* First Time Welcome Modal */}
      <FirstTimeWelcome />

      {/* Empty state - show when no real data exists */}
      {!isLoading && (!analyticsData || analyticsData.totalEmissions === 0) && (
        <SlideIn direction="up" delay={0.5}>
          <SeedDataButton />
        </SlideIn>
      )}
    </div>;
};
export default Index;