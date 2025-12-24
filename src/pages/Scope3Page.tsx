import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/ui/page-header';
import { Scope3Dashboard } from '@/components/Scope3/Scope3Dashboard';
import { SupplierDashboard } from '@/components/Suppliers/SupplierDashboard';

export default function Scope3Page() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader 
        title="Scope 3 & Supply Chain"
        subtitle="Manage your value chain emissions and supplier engagement"
      />

      <Tabs defaultValue="scope3" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scope3">Scope 3 Emissions</TabsTrigger>
          <TabsTrigger value="suppliers">Supplier Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="scope3">
          <Scope3Dashboard />
        </TabsContent>

        <TabsContent value="suppliers">
          <SupplierDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
