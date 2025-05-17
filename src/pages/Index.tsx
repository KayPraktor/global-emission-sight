
import React from 'react';
import EmissionsOverview from '@/components/Dashboard/EmissionsOverview';
import EmissionsChart from '@/components/Dashboard/EmissionsChart';
import { 
  EnhancedCard as Card,
  EnhancedCardContent as CardContent,
  EnhancedCardHeader as CardHeader,
  EnhancedCardTitle as CardTitle 
} from '@/components/ui/enhanced-card';
import { PageHeader, PageHeaderDateFilter, PageHeaderExport } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Info, AlertTriangle, PlusCircle } from 'lucide-react';

const Index = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Carbon Emissions Dashboard" 
        subtitle="Track, analyze, and reduce your organization's carbon footprint"
        actions={
          <>
            <PageHeaderDateFilter defaultValue="Jan - May 2025" />
            <PageHeaderExport />
            <Button size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Report
            </Button>
          </>
        }
      />
      
      <EmissionsOverview />
      <EmissionsChart />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 animate-fade-in">
        <Card variant="gradient" className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">GHG Protocol</span>
                <span className="text-sm font-medium text-green-500">Compliant</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">ISO 14064</span>
                <span className="text-sm font-medium text-green-500">Compliant</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">CDP Reporting</span>
                <span className="text-sm font-medium text-amber-500">In Progress</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">TCFD Alignment</span>
                <span className="text-sm font-medium text-amber-500">Partial</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card variant="gradient" className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2 text-ocean" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Q2 Data Collection</span>
                <span className="text-sm font-medium">June 30, 2025</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">CDP Submission</span>
                <span className="text-sm font-medium">July 15, 2025</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Annual Report</span>
                <span className="text-sm font-medium">Dec 31, 2025</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">SBTi Validation</span>
                <span className="text-sm font-medium">Mar 1, 2026</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card variant="gradient" className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
              Emission Hotspots
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Purchased Electricity</span>
                <span className="text-sm font-medium text-red-500">High</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Business Travel</span>
                <span className="text-sm font-medium text-amber-500">Medium</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Natural Gas</span>
                <span className="text-sm font-medium text-amber-500">Medium</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Waste Generation</span>
                <span className="text-sm font-medium text-green-500">Low</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
