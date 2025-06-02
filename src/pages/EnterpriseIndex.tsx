
import React, { useEffect, useState } from 'react';
import { PageHeader, PageHeaderDateFilter, PageHeaderExport } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, TrendingUp, AlertTriangle, Target, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import AdvancedMetricsCard from '@/components/Dashboard/AdvancedMetricsCard';
import PredictiveChart from '@/components/Dashboard/PredictiveChart';
import ComplianceCalendar from '@/components/Dashboard/ComplianceCalendar';
import { predictiveModelingService } from '@/services/predictiveModelingService';
import { benchmarkingService } from '@/services/benchmarkingService';
import { complianceService } from '@/services/complianceService';
import { dataQualityService } from '@/services/dataQualityService';

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
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [complianceDeadlines, setComplianceDeadlines] = useState<any[]>([]);
  
  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      // Initialize all services
      await benchmarkingService.loadBenchmarkData();
      await complianceService.loadComplianceFrameworks();
      
      // Generate sample forecast data
      const historicalData = [
        { period: '2024-01', value: 1250 },
        { period: '2024-02', value: 1180 },
        { period: '2024-03', value: 1320 },
        { period: '2024-04', value: 1290 },
        { period: '2024-05', value: 1150 }
      ];
      
      const forecast = predictiveModelingService.generateEmissionsForecast(historicalData, 6);
      const combinedData = [
        ...historicalData.map(d => ({ ...d, actual: d.value, predicted: d.value, upperBound: d.value, lowerBound: d.value })),
        ...forecast.map(f => ({ ...f, target: 1000 }))
      ];
      
      setForecastData(combinedData);
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

  const advancedMetrics = [
    {
      title: 'Total Emissions (Scope 1+2+3)',
      value: 12450,
      unit: 'tCO2e',
      trend: 'down' as const,
      trendValue: -8.2,
      confidence: 92,
      benchmark: { value: 15800, percentile: 25 },
      quality: 87,
      status: 'good' as const
    },
    {
      title: 'Emissions Intensity',
      value: 2.4,
      unit: 'tCO2e/$M revenue',
      trend: 'down' as const,
      trendValue: -12.5,
      confidence: 85,
      benchmark: { value: 3.8, percentile: 35 },
      quality: 82,
      status: 'good' as const
    },
    {
      title: 'Data Quality Score',
      value: 84,
      unit: '%',
      trend: 'up' as const,
      trendValue: 6.8,
      confidence: 96,
      quality: 91,
      status: 'good' as const
    },
    {
      title: 'Compliance Score',
      value: 78,
      unit: '%',
      trend: 'stable' as const,
      trendValue: 2.1,
      confidence: 88,
      quality: 79,
      status: 'warning' as const
    }
  ];

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
          subtitle="Advanced analytics, predictive modeling, and enterprise-grade carbon management"
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

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Executive Overview</TabsTrigger>
          <TabsTrigger value="analytics">Predictive Analytics</TabsTrigger>
          <TabsTrigger value="benchmarking">Industry Benchmarking</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Management</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <motion.div variants={stagger} className="space-y-6">
            <motion.div variants={fadeInUp}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {advancedMetrics.map((metric, index) => (
                  <AdvancedMetricsCard key={index} metric={metric} />
                ))}
              </div>
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <PredictiveChart 
                data={forecastData}
                title="Emissions Forecast with Confidence Intervals"
                unit="tCO2e"
              />
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent value="analytics">
          <motion.div variants={stagger} className="space-y-6">
            <motion.div variants={fadeInUp}>
              <PredictiveChart 
                data={forecastData}
                title="12-Month Emissions Trajectory"
                unit="tCO2e"
              />
            </motion.div>
            
            <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Scenario Analysis
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Business as Usual</span>
                    <span className="text-sm font-medium text-red-600">+5.2% by 2025</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Moderate Reduction</span>
                    <span className="text-sm font-medium text-amber-600">-20% by 2025</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Aggressive Reduction</span>
                    <span className="text-sm font-medium text-green-600">-50% by 2025</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Target className="w-5 h-5 mr-2 text-purple-600" />
                  Goal Trajectory
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current Trajectory</span>
                    <span className="text-sm font-medium">12,450 tCO2e</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">2030 Target</span>
                    <span className="text-sm font-medium">6,225 tCO2e</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Gap to Target</span>
                    <span className="text-sm font-medium text-red-600">-50% required</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent value="benchmarking">
          <motion.div variants={stagger} className="space-y-6">
            <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Industry Position</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">25th</div>
                  <div className="text-sm text-muted-foreground">Percentile</div>
                  <div className="text-xs mt-2">Top quartile performance</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Peer Comparison</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">-36%</div>
                  <div className="text-sm text-muted-foreground">vs Industry Median</div>
                  <div className="text-xs mt-2">Below industry average</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Best Practice Gap</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">-12%</div>
                  <div className="text-sm text-muted-foreground">Additional Potential</div>
                  <div className="text-xs mt-2">To reach top 10%</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </TabsContent>

        <TabsContent value="compliance">
          <motion.div variants={fadeInUp}>
            <ComplianceCalendar deadlines={complianceDeadlines} />
          </motion.div>
        </TabsContent>

        <TabsContent value="quality">
          <motion.div variants={stagger} className="space-y-6">
            <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-emerald-600" />
                  ML-Powered Validation
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Anomalies Detected</span>
                    <span className="text-sm font-medium">3 this month</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Auto-Corrections</span>
                    <span className="text-sm font-medium">12 applied</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Confidence Score</span>
                    <span className="text-sm font-medium text-green-600">92%</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-rose-50 to-rose-100 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-rose-600" />
                  Quality Issues
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Missing Data Points</span>
                    <span className="text-sm font-medium">2.3%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Stale Data Sources</span>
                    <span className="text-sm font-medium">1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Validation Failures</span>
                    <span className="text-sm font-medium text-red-600">0.8%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default EnterpriseIndex;
