import React, { useEffect, useState } from 'react';
import { PageHeader, PageHeaderDateFilter, PageHeaderExport } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Download, BarChart3, Brain, Shield, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import ExecutiveCommandCenter from '@/components/Enterprise/ExecutiveCommandCenter';
import AIInsightsPanel from '@/components/Enterprise/AIInsightsPanel';
import AdvancedScenarioPlanning from '@/components/Enterprise/AdvancedScenarioPlanning';
import ComplianceIntelligence from '@/components/Enterprise/ComplianceIntelligence';
import { predictiveModelingService } from '@/services/predictiveModelingService';
import { benchmarkingService } from '@/services/benchmarkingService';
import { complianceService } from '@/services/complianceService';
import { executiveKPIs, aiInsights, scenarioAnalyses } from '@/utils/enterpriseData';

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
  const [complianceDeadlines, setComplianceDeadlines] = useState<any[]>([]);
  
  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      await benchmarkingService.loadBenchmarkData();
      await complianceService.loadComplianceFrameworks();
      setComplianceDeadlines(complianceService.getUpcomingDeadlines(60));
    } catch (error) {
      console.error('Failed to initialize services:', error);
    }
  };

  const handleNewReport = () => {
    toast.success("Creating new enterprise report...", {
      description: "Advanced analytics and predictions are being generated."
    });
  };

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
          <ExecutiveCommandCenter kpis={executiveKPIs} />
        </TabsContent>

        <TabsContent value="ai-insights">
          <AIInsightsPanel insights={aiInsights} />
        </TabsContent>

        <TabsContent value="scenarios">
          <AdvancedScenarioPlanning scenarios={scenarioAnalyses} />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceIntelligence deadlines={complianceDeadlines} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default EnterpriseIndex;