import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnomalyDetectionPanel } from '@/components/Analytics/AnomalyDetectionPanel';
import { AIInsightsPanel } from '@/components/Analytics/AIInsightsPanel';
import { BenchmarkingDashboard } from '@/components/Analytics/BenchmarkingDashboard';
import AnalyticsAdvanced from '@/components/Analytics/AnalyticsAdvanced';
import { LineChart, AlertTriangle, Sparkles, Target } from 'lucide-react';

const AdvancedAnalyticsPage = () => {
  useEffect(() => {
    document.title = 'Advanced Analytics | Carbon Emissions Tracker';
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
        <p className="text-muted-foreground">
          Predictive insights, anomaly detection, and AI-powered recommendations for emissions management
        </p>
      </div>

      <Tabs defaultValue="forecasting" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecasting" className="gap-2">
            <LineChart className="h-4 w-4" />
            Forecasting
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Anomalies
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="benchmarking" className="gap-2">
            <Target className="h-4 w-4" />
            Benchmarking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="forecasting" className="space-y-6">
          <AnalyticsAdvanced />
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-6">
          <AnomalyDetectionPanel />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <AIInsightsPanel />
        </TabsContent>

        <TabsContent value="benchmarking" className="space-y-6">
          <BenchmarkingDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsPage;
