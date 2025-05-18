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
        <EnhancedPageHeader 
          title="Emissions Analytics" 
          subtitle="In-depth analysis of your emissions data and trends"
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
