
import React from 'react';
import EmissionsForm from '@/components/EmissionsForm/EmissionsForm';

const DataEntryPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Emissions Data Entry</h1>
          <p className="text-gray-500">Record and manage your organization's emissions data</p>
        </div>
        
        <EmissionsForm />
      </main>
    </div>
  );
};

export default DataEntryPage;
