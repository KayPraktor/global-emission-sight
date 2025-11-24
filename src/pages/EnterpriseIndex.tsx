import React, { useEffect } from 'react';
import { PageHeader, PageHeaderDateFilter, PageHeaderExport } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, BarChart3, Brain, Shield, Target, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import ExecutiveCommandCenter from '@/components/Enterprise/ExecutiveCommandCenter';
import AIInsightsPanel from '@/components/Enterprise/AIInsightsPanel';
import AdvancedScenarioPlanning from '@/components/Enterprise/AdvancedScenarioPlanning';
import ComplianceIntelligence from '@/components/Enterprise/ComplianceIntelligence';
import { enterpriseKPIService } from '@/services/enterpriseKPIService';
import { enterpriseAIService } from '@/services/enterpriseAIService';
import { scenarioModelingService } from '@/services/scenarioModelingService';
import { enterpriseComplianceService } from '@/services/enterpriseComplianceService';
import { useAuth } from '@/contexts/AuthContext';

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

const EnterpriseIndex = () => {
  const { organization } = useAuth();
  
  // Fetch KPIs
  const { data: kpis = [], isLoading: isLoadingKPIs } = useQuery({
    queryKey: ['enterprise-kpis', organization?.id],
    queryFn: () => organization?.id ? enterpriseKPIService.calculateKPIs(organization.id) : Promise.resolve([]),
    enabled: !!organization?.id,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Fetch AI Insights
  const { data: insights = [], isLoading: isLoadingInsights } = useQuery({
    queryKey: ['enterprise-insights', organization?.id],
    queryFn: () => organization?.id ? enterpriseAIService.aggregateInsights(organization.id) : Promise.resolve([]),
    enabled: !!organization?.id,
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
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
        enterpriseComplianceService.getDeadlines(organization.id, 90) // Next 90 days
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

  const handleNewReport = () => {
    toast.success("Creating new enterprise report...", {
      description: "Advanced analytics and predictions are being generated."
    });
  };

  const isLoading = isLoadingKPIs || isLoadingInsights || isLoadingScenarios || isLoadingCompliance;

  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      <motion.div variants={fadeInUp}>
        <PageHeader 
          title="Enterprise Carbon Management Platform" 
          actions={
            <>
              <PageHeaderDateFilter defaultValue="Jan - May 2025" />
              <PageHeaderExport />
              <Button size="sm" onClick={handleNewReport}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Enterprise Report
              </Button>
            </>
          }
        />
      </motion.div>

      <Tabs defaultValue="executive" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="executive">
            <Target className="w-4 h-4 mr-2" />
            Executive Command
          </TabsTrigger>
          <TabsTrigger value="ai-insights">
            <Brain className="w-4 h-4 mr-2" />
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

        <TabsContent value="executive">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <ExecutiveCommandCenter kpis={kpis} />
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