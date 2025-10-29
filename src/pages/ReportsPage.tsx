
import React from 'react';
import EmissionsReport from '@/components/Reports/EmissionsReport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReportTemplates from '@/components/Reports/ReportTemplates';
import { SampleDataBadge } from '@/components/ui/sample-data-badge';

const ReportsPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Emissions Reports</h1>
          <p className="text-gray-500">View, analyze, and export your emissions data</p>
        </div>
        
        <Tabs defaultValue="templates" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="data">Data Reports</TabsTrigger>
            <TabsTrigger value="templates">Report Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="data">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <SampleDataBadge />
                <span className="text-sm text-muted-foreground">The data shown below is for demonstration purposes</span>
              </div>
              <EmissionsReport />
            </div>
          </TabsContent>
          
          <TabsContent value="templates">
            <ReportTemplates />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ReportsPage;
