import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AnomalyDetectionPanel } from '@/components/Analytics/AnomalyDetectionPanel';
import { AIInsightsPanel } from '@/components/Analytics/AIInsightsPanel';
import { BenchmarkingDashboard } from '@/components/Analytics/BenchmarkingDashboard';
import { DataQualityDashboard } from '@/components/Analytics/DataQualityDashboard';
import AnalyticsAdvanced from '@/components/Analytics/AnalyticsAdvanced';
import { LineChart, AlertTriangle, Sparkles, Target, Download, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { exportForecastsToCSV, exportAnomaliesToCSV, exportInsightsToCSV } from '@/utils/csvExport';
import { toast } from 'sonner';

const AdvancedAnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState('forecasting');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    document.title = 'Advanced Analytics | Carbon Emissions Tracker';
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch data based on active tab
      if (activeTab === 'forecasting') {
        const { data } = await supabase
          .from('emissions_forecasts')
          .select('*')
          .eq('user_id', user.id);
        
        if (data) {
          exportForecastsToCSV(data);
          toast.success('Forecasts exported successfully');
        }
      } else if (activeTab === 'anomalies') {
        const { data } = await supabase
          .from('emissions_anomalies')
          .select('*')
          .eq('user_id', user.id);
        
        if (data) {
          exportAnomaliesToCSV(data);
          toast.success('Anomalies exported successfully');
        }
      } else if (activeTab === 'insights') {
        const { data } = await supabase
          .from('emissions_insights')
          .select('*')
          .eq('user_id', user.id);
        
        if (data) {
          exportInsightsToCSV(data);
          toast.success('Insights exported successfully');
        }
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Predictive insights, anomaly detection, and AI-powered recommendations for emissions management
          </p>
        </div>
        <Button onClick={handleExport} disabled={exporting} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          {exporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
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
          <TabsTrigger value="quality" className="gap-2">
            <Shield className="h-4 w-4" />
            Data Quality
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

        <TabsContent value="quality" className="space-y-6">
          <DataQualityDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsPage;
