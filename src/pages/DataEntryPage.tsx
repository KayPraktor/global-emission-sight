
import React from 'react';
import Navbar from '@/components/Navbar';
import EmissionsForm from '@/components/EmissionsForm/EmissionsForm';

const DataEntryPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Emissions Data Entry</h1>
          <p className="text-gray-500">Record and manage your organization's emissions data</p>
        </div>
        
        <EmissionsForm />
      </main>
      
      <footer className="border-t border-gray-200 py-4 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">© 2025 BARYON. All rights reserved.</p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <a href="#" className="text-sm text-gray-500 hover:text-carbon">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-carbon">Terms of Service</a>
            <a href="#" className="text-sm text-gray-500 hover:text-carbon">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DataEntryPage;
