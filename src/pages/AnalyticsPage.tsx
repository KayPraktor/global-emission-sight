
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MetricsCards from '@/components/Analytics/MetricsCards';
import AnalyticsOverview from '@/components/Analytics/AnalyticsOverview';
import AnalyticsTrends from '@/components/Analytics/AnalyticsTrends';
import AnalyticsSources from '@/components/Analytics/AnalyticsSources';
import AnalyticsAdvanced from '@/components/Analytics/AnalyticsAdvanced';
import FilterPanel from '@/components/Analytics/FilterPanel';
import ActiveFilters from '@/components/Analytics/ActiveFilters';
import EnhancedPageHeader from '@/components/Analytics/EnhancedPageHeader';
import { AnalyticsFilterProvider, useAnalyticsFilters } from '@/contexts/AnalyticsFilterContext';
import ProcessFlowMap from '@/components/Productivity/ProcessFlowMap';
import { SampleDataBadge } from '@/components/ui/sample-data-badge';

const AnalyticsContent: React.FC = () => {
  const { filters, updateFilters } = useAnalyticsFilters();
  
  const handleFilterChange = (newFilters: {
    facility: string;
    department: string;
    project: string;
  }) => {
    updateFilters(newFilters);
  };
  
  const handleDateRangeChange = (dateRange: { from: Date; to: Date }) => {
    updateFilters({ dateRange });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      
      
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">Emissions Analytics</h1>
                <SampleDataBadge />
              </div>
              <p className="text-muted-foreground mt-1">In-depth analysis of your emissions data and trends</p>
            </div>
          </div>
        </div>
        <EnhancedPageHeader 
          title="" 
          subtitle=""
          onDateRangeChange={handleDateRangeChange}
        />
        
        <FilterPanel onFilterChange={handleFilterChange} />
        <ActiveFilters />
        
        <MetricsCards />
        
        <Tabs defaultValue="overview" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Emission Trends</TabsTrigger>
            <TabsTrigger value="sources">Emission Sources</TabsTrigger>
            <TabsTrigger value="process">Process Flow</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <AnalyticsOverview />
          </TabsContent>
          
          <TabsContent value="trends">
            <AnalyticsTrends />
          </TabsContent>
          
          <TabsContent value="sources">
            <AnalyticsSources />
          </TabsContent>
          
          <TabsContent value="process">
            <ProcessFlowMap />
          </TabsContent>
          
          <TabsContent value="advanced">
            <AnalyticsAdvanced />
          </TabsContent>
        </Tabs>
      </main>
      
      
    </div>
  );
};

const AnalyticsPage: React.FC = () => {
  return (
    <AnalyticsFilterProvider>
      <AnalyticsContent />
    </AnalyticsFilterProvider>
  );
};

export default AnalyticsPage;
