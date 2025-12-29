import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, BarChart3 } from 'lucide-react';
import CSRDDashboard from '@/components/Compliance/CSRDDashboard';
import ISSBReadinessAssessment from '@/components/Compliance/ISSBReadinessAssessment';

const CompliancePage: React.FC = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Tabs defaultValue="csrd" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="csrd" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            CSRD / ESRS E1
          </TabsTrigger>
          <TabsTrigger value="issb" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            ISSB S2
          </TabsTrigger>
        </TabsList>

        <TabsContent value="csrd" className="mt-6">
          <CSRDDashboard />
        </TabsContent>

        <TabsContent value="issb" className="mt-6">
          <ISSBReadinessAssessment />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompliancePage;
