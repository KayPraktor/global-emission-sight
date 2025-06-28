
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
import { 
  StaggeredContainer, 
  HoverScale, 
  FadeIn, 
  AnimatedCounter,
  LoadingSkeleton 
} from '@/components/ui/animated-elements';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { InteractiveChart } from '@/components/ui/interactive-chart';
import { AdvancedDataTable } from '@/components/ui/advanced-data-table';

// Sample data for the advanced table
const sampleTableData = [
  { id: 1, source: 'Electricity', emissions: 1250.5, scope: 'Scope 2', status: 'Verified', lastUpdated: '2025-01-15' },
  { id: 2, source: 'Natural Gas', emissions: 890.2, scope: 'Scope 1', status: 'Pending', lastUpdated: '2025-01-14' },
  { id: 3, source: 'Business Travel', emissions: 456.8, scope: 'Scope 3', status: 'Verified', lastUpdated: '2025-01-13' },
  { id: 4, source: 'Waste', emissions: 123.4, scope: 'Scope 3', status: 'Draft', lastUpdated: '2025-01-12' },
];

const tableColumns = [
  { key: 'source' as keyof typeof sampleTableData[0], label: 'Emission Source', sortable: true },
  { 
    key: 'emissions' as keyof typeof sampleTableData[0], 
    label: 'Emissions (tCO₂e)', 
    sortable: true,
    render: (value: number) => <AnimatedCounter value={value} suffix=" tCO₂e" className="font-mono" />
  },
  { key: 'scope' as keyof typeof sampleTableData[0], label: 'Scope', filterable: true },
  { 
    key: 'status' as keyof typeof sampleTableData[0], 
    label: 'Status', 
    render: (value: string) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        value === 'Verified' ? 'bg-green-100 text-green-800' :
        value === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {value}
      </span>
    )
  },
  { key: 'lastUpdated' as keyof typeof sampleTableData[0], label: 'Last Updated', sortable: true },
];

// Sample chart data
const chartData = [
  { month: 'Jan', scope1: 890, scope2: 1250, scope3: 580 },
  { month: 'Feb', scope1: 920, scope2: 1180, scope3: 620 },
  { month: 'Mar', scope1: 850, scope2: 1320, scope3: 590 },
  { month: 'Apr', scope1: 880, scope2: 1280, scope3: 640 },
  { month: 'May', scope1: 820, scope2: 1200, scope3: 570 },
];

const chartYKeys = [
  { key: 'scope1', label: 'Scope 1', color: '#ef4444' },
  { key: 'scope2', label: 'Scope 2', color: '#3b82f6' },
  { key: 'scope3', label: 'Scope 3', color: '#10b981' },
];

const Index = () => {
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleNewReport = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Creating new report...", {
        description: "Your new emissions report is being prepared."
      });
    }, 2000);
  };
  
  return (
    <div className="space-y-6">
      <FadeIn>
        <PageHeader 
          title="Carbon Emissions Dashboard" 
          subtitle="Track, analyze, and reduce your organization's carbon footprint"
          actions={
            <>
              <PageHeaderDateFilter defaultValue="Jan - May 2025" />
              <PageHeaderExport />
              <HoverScale>
                <Button size="sm" onClick={handleNewReport} disabled={isLoading}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {isLoading ? 'Creating...' : 'New Report'}
                </Button>
              </HoverScale>
            </>
          }
        />
      </FadeIn>
      
      <FadeIn delay={0.1}>
        <EmissionsOverview />
      </FadeIn>
      
      <FadeIn delay={0.2}>
        <EmissionsChart />
      </FadeIn>

      {/* Enhanced Interactive Chart */}
      <FadeIn delay={0.3}>
        <InteractiveChart
          data={chartData}
          title="Monthly Emissions Breakdown"
          xKey="month"
          yKeys={chartYKeys}
          unit="tCO₂e"
          showBrush={true}
          showReference={true}
          referenceValue={1000}
          onDataPointClick={(data) => console.log('Chart clicked:', data)}
          onExport={() => console.log('Export chart')}
        />
      </FadeIn>

      {/* Advanced Data Table */}
      <FadeIn delay={0.4}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Emissions Data</h3>
          <AdvancedDataTable
            data={sampleTableData}
            columns={tableColumns}
            onRowSelect={(rows) => console.log('Selected rows:', rows)}
            onExport={(data) => console.log('Export data:', data)}
          />
        </div>
      </FadeIn>
      
      <StaggeredContainer className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <GlassmorphismCard variant="light" className="p-6 space-y-4">
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
            <h4 className="font-medium">Compliance Status</h4>
          </div>
          <div className="space-y-3">
            {[
              { name: 'GHG Protocol', status: 'Compliant', color: 'green' },
              { name: 'ISO 14064', status: 'Compliant', color: 'green' },
              { name: 'CDP Reporting', status: 'In Progress', color: 'yellow' },
              { name: 'TCFD Alignment', status: 'Partial', color: 'yellow' },
            ].map((item, index) => (
              <HoverScale key={index} className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                <span className="text-sm font-medium">{item.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.color === 'green' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.status}
                </span>
              </HoverScale>
            ))}
          </div>
        </GlassmorphismCard>
        
        <GlassmorphismCard variant="colored" className="p-6 space-y-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            <h4 className="font-medium">Upcoming Deadlines</h4>
          </div>
          <div className="space-y-3">
            {[
              { task: 'Q2 Data Collection', date: 'June 30, 2025' },
              { task: 'CDP Submission', date: 'July 15, 2025' },
              { task: 'Annual Report', date: 'Dec 31, 2025' },
              { task: 'SBTi Validation', date: 'Mar 1, 2026' },
            ].map((item, index) => (
              <HoverScale key={index} className="flex justify-between items-center p-3 bg-white/30 rounded-lg">
                <span className="text-sm font-medium">{item.task}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {item.date}
                </span>
              </HoverScale>
            ))}
          </div>
        </GlassmorphismCard>
        
        <GlassmorphismCard variant="dark" className="p-6 space-y-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
            <h4 className="font-medium text-white">Emission Hotspots</h4>
          </div>
          <div className="space-y-3">
            {[
              { source: 'Purchased Electricity', intensity: 80, level: 'High' },
              { source: 'Business Travel', intensity: 60, level: 'Medium' },
              { source: 'Natural Gas', intensity: 55, level: 'Medium' },
              { source: 'Waste Generation', intensity: 30, level: 'Low' },
            ].map((item, index) => (
              <HoverScale key={index} className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                <span className="text-sm font-medium text-white">{item.source}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${
                        item.level === 'High' ? 'bg-red-500' :
                        item.level === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.intensity}%` }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.level === 'High' ? 'bg-red-100 text-red-800' :
                    item.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.level}
                  </span>
                </div>
              </HoverScale>
            ))}
          </div>
        </GlassmorphismCard>
      </StaggeredContainer>
      
      {showAll && (
        <FadeIn>
          <GlassmorphismCard variant="light" className="p-6 mt-6">
            <div className="flex items-center mb-4">
              <Info className="h-5 w-5 mr-2 text-purple-500" />
              <h4 className="font-medium text-lg">Sustainability Strategy Progress</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Renewable Energy', current: 42, target: 75, trend: 12 },
                { title: 'Carbon Neutrality', current: 28, target: 100, trend: 8 },
                { title: 'EV Fleet', current: 15, target: 100, trend: 10 },
              ].map((item, index) => (
                <div key={index} className="bg-white/50 p-4 rounded-lg">
                  <h5 className="font-medium text-sm text-gray-600 mb-2">{item.title}</h5>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-purple-700">
                      <AnimatedCounter value={item.current} suffix="%" />
                    </span>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      +{item.trend}% YoY
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <motion.div 
                      className="bg-purple-500 h-2 rounded-full" 
                      initial={{ width: 0 }}
                      animate={{ width: `${item.current}%` }}
                      transition={{ duration: 1.5, delay: index * 0.3 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Current: {item.current}%</span>
                    <span>Target: {item.target}%</span>
                  </div>
                </div>
              ))}
            </div>
          </GlassmorphismCard>
        </FadeIn>
      )}
      
      <div className="flex justify-center mt-6">
        <HoverScale>
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
        </HoverScale>
      </div>
    </div>
  );
};

export default Index;
