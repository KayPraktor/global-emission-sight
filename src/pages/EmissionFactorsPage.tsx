import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FactorsTable } from '@/components/EmissionFactors/FactorsTable';
import { CustomFactorForm } from '@/components/EmissionFactors/CustomFactorForm';
import { RegionalComparison } from '@/components/EmissionFactors/RegionalComparison';
import { BulkImportDialog } from '@/components/EmissionFactors/BulkImportDialog';
import { EEIOFactorsTable } from '@/components/EmissionFactors/EEIOFactorsTable';
import { Database, Plus, GitCompare, DollarSign } from 'lucide-react';

const EmissionFactorsPage = () => {
  const [activeTab, setActiveTab] = useState('browse');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Emission Factors Management</h1>
            <p className="text-muted-foreground">
              Browse standard factors, create custom factors, and compare regional variations
            </p>
          </div>
          <BulkImportDialog />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-xl grid-cols-4">
            <TabsTrigger value="browse" className="gap-2">
              <Database className="h-4 w-4" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="eeio" className="gap-2">
              <DollarSign className="h-4 w-4" />
              EEIO Factors
            </TabsTrigger>
            <TabsTrigger value="custom" className="gap-2">
              <Plus className="h-4 w-4" />
              Custom
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-2">
              <GitCompare className="h-4 w-4" />
              Compare
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-6">
            <FactorsTable />
          </TabsContent>

          <TabsContent value="eeio" className="mt-6">
            <EEIOFactorsTable />
          </TabsContent>

          <TabsContent value="custom" className="mt-6">
            <CustomFactorForm />
          </TabsContent>

          <TabsContent value="compare" className="mt-6">
            <RegionalComparison />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default EmissionFactorsPage;
