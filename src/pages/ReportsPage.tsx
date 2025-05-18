
import React from 'react';
import EmissionsReport from '@/components/Reports/EmissionsReport';

const ReportsPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Emissions Reports</h1>
          <p className="text-gray-500">View, analyze, and export your emissions data</p>
        </div>
        
        <EmissionsReport />
      </main>
    </div>
  );
};

export default ReportsPage;
