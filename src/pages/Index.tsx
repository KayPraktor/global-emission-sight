
import React, { useState } from 'react';
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
import { CheckCircle2, Clock, Info, AlertTriangle, PlusCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Index = () => {
  const [showAll, setShowAll] = useState(false);
  
  const handleNewReport = () => {
    toast.success("Creating new report...", {
      description: "Your new emissions report is being prepared."
    });
  };
  
  return (
    <motion.div 
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={stagger}
    >
      <motion.div variants={fadeInUp}>
        <PageHeader 
          title="Carbon Emissions Dashboard" 
          subtitle="Track, analyze, and reduce your organization's carbon footprint"
          actions={
            <>
              <PageHeaderDateFilter defaultValue="Jan - May 2025" />
              <PageHeaderExport />
              <Button size="sm" onClick={handleNewReport}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Report
              </Button>
            </>
          }
        />
      </motion.div>
      
      <motion.div variants={fadeInUp}>
        <EmissionsOverview />
      </motion.div>
      
      <motion.div variants={fadeInUp}>
        <EmissionsChart />
      </motion.div>
      
      <motion.div 
        variants={stagger}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6"
      >
        <motion.div variants={fadeInUp}>
          <Card variant="gradient" className="card-hover bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 hover:bg-white hover:shadow-sm rounded-md transition-all">
                  <span className="text-sm">GHG Protocol</span>
                  <span className="text-sm font-medium text-green-500 flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                    Compliant
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-white hover:shadow-sm rounded-md transition-all">
                  <span className="text-sm">ISO 14064</span>
                  <span className="text-sm font-medium text-green-500 flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
                    Compliant
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-white hover:shadow-sm rounded-md transition-all">
                  <span className="text-sm">CDP Reporting</span>
                  <span className="text-sm font-medium text-amber-500 flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
                    In Progress
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-white hover:shadow-sm rounded-md transition-all">
                  <span className="text-sm">TCFD Alignment</span>
                  <span className="text-sm font-medium text-amber-500 flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-1.5"></span>
                    Partial
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <Card variant="gradient" className="card-hover bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2 text-blue-600" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 hover:bg-white hover:shadow-sm rounded-md transition-all">
                  <span className="text-sm">Q2 Data Collection</span>
                  <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">June 30, 2025</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-white hover:shadow-sm rounded-md transition-all">
                  <span className="text-sm">CDP Submission</span>
                  <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">July 15, 2025</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-white hover:shadow-sm rounded-md transition-all">
                  <span className="text-sm">Annual Report</span>
                  <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Dec 31, 2025</span>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-white hover:shadow-sm rounded-md transition-all">
                  <span className="text-sm">SBTi Validation</span>
                  <span className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Mar 1, 2026</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={fadeInUp}>
          <Card variant="gradient" className="card-hover bg-gradient-to-br from-amber-50 to-amber-100 hover:shadow-lg transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                Emission Hotspots
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-2 hover:bg-white hover:shadow-sm rounded-md transition-all">
                  <span className="text-sm">Purchased Electricity</span>
                  <div className="flex items-center">
                    <div className="w-20 h-2 bg-gray-200 rounded mr-2">
                      <div className="h-2 bg-red-500 rounded" style={{ width: '80%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-red-500">High</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-white hover:shadow-sm rounded-md transition-all">
                  <span className="text-sm">Business Travel</span>
                  <div className="flex items-center">
                    <div className="w-20 h-2 bg-gray-200 rounded mr-2">
                      <div className="h-2 bg-amber-500 rounded" style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-amber-500">Medium</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-white hover:shadow-sm rounded-md transition-all">
                  <span className="text-sm">Natural Gas</span>
                  <div className="flex items-center">
                    <div className="w-20 h-2 bg-gray-200 rounded mr-2">
                      <div className="h-2 bg-amber-500 rounded" style={{ width: '55%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-amber-500">Medium</span>
                  </div>
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-white hover:shadow-sm rounded-md transition-all">
                  <span className="text-sm">Waste Generation</span>
                  <div className="flex items-center">
                    <div className="w-20 h-2 bg-gray-200 rounded mr-2">
                      <div className="h-2 bg-green-500 rounded" style={{ width: '30%' }}></div>
                    </div>
                    <span className="text-sm font-medium text-green-500">Low</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      
      {showAll && (
        <motion.div 
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6"
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeInUp} className="col-span-1 lg:col-span-3">
            <Card variant="gradient" className="card-hover bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center">
                  <Info className="h-4 w-4 mr-2 text-purple-500" />
                  Sustainability Strategy Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-medium text-sm text-gray-600 mb-2">Renewable Energy</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-bold text-purple-700">42%</span>
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12% YoY</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Current: 42%</span>
                      <span>Target: 75% by 2030</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-medium text-sm text-gray-600 mb-2">Carbon Neutrality</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-bold text-purple-700">28%</span>
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+8% YoY</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Current: 28%</span>
                      <span>Target: 100% by 2040</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-medium text-sm text-gray-600 mb-2">EV Fleet</h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-bold text-purple-700">15%</span>
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+10% YoY</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Current: 15%</span>
                      <span>Target: 100% by 2035</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
      
      <div className="flex justify-center mt-4">
        <Button 
          variant="outline" 
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-2"
        >
          {showAll ? (
            <>Show Less <ChevronUp className="h-4 w-4" /></>
          ) : (
            <>Show More <ChevronDown className="h-4 w-4" /></>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default Index;
