
import React from 'react';
import { Link } from 'react-router-dom';
import EmissionsReport from '@/components/Reports/EmissionsReport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReportTemplates from '@/components/Reports/ReportTemplates';
import IndustryReportTemplates from '@/components/Reports/IndustryReportTemplates';
import { SampleDataBadge } from '@/components/ui/sample-data-badge';
import { MonthlyReportGenerator } from '@/components/Reports/MonthlyReportGenerator';
import ComprehensiveReportGenerator from '@/components/Reports/ComprehensiveReportGenerator';
import { Settings } from 'lucide-react';

const ReportsPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Emissions Reports</h1>
          <p className="text-gray-500">View, analyze, and export your emissions data</p>
        </div>
        
        <Tabs defaultValue="monthly" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="comprehensive">Quarterly & Annual</TabsTrigger>
            <TabsTrigger value="data">Data Reports</TabsTrigger>
            <TabsTrigger value="industry">Industry Templates</TabsTrigger>
            <TabsTrigger value="templates">All Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="monthly" className="space-y-6">
            <MonthlyReportGenerator />
            <Link 
              to="/settings?tab=branding" 
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Settings className="h-4 w-4" />
              Customize report branding in Settings
            </Link>
          </TabsContent>
          
          <TabsContent value="comprehensive" className="space-y-6">
            <ComprehensiveReportGenerator />
            <Link 
              to="/settings?tab=branding" 
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Settings className="h-4 w-4" />
              Customize report branding in Settings
            </Link>
          </TabsContent>
          
          <TabsContent value="data">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <SampleDataBadge />
                <span className="text-sm text-muted-foreground">The data shown below is for demonstration purposes</span>
              </div>
              <EmissionsReport />
            </div>
          </TabsContent>

          <TabsContent value="industry">
            <IndustryReportTemplates />
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
