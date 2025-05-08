
import React from 'react';
import Navbar from '@/components/Navbar';
import EmissionsOverview from '@/components/Dashboard/EmissionsOverview';
import EmissionsChart from '@/components/Dashboard/EmissionsChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Clock, Info, AlertTriangle } from 'lucide-react';

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Carbon Emissions Dashboard</h1>
            <p className="text-gray-500">Track, analyze, and reduce your organization's carbon footprint</p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="bg-carbon/10 text-carbon px-3 py-1 rounded-full text-sm font-medium">
              Last updated: May 8, 2025
            </span>
          </div>
        </div>
        
        <EmissionsOverview />
        <EmissionsChart />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <Card>
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
          
          <Card>
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
          
          <Card>
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
      </main>
      
      <footer className="border-t border-gray-200 py-4 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">© 2025 CarbonTrack. All rights reserved.</p>
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

export default Index;
