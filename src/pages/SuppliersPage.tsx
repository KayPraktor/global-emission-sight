import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { SupplierDashboard } from '@/components/Suppliers/SupplierDashboard';

export default function SuppliersPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader 
        title="Supplier Management"
        subtitle="Track and engage with suppliers on emissions data and sustainability goals"
      />
      
      <SupplierDashboard />
    </div>
  );
}
