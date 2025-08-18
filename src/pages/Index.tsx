import React, { useState } from 'react';
import EmissionsOverview from '@/components/Dashboard/EmissionsOverview';
import EmissionsChart from '@/components/Dashboard/EmissionsChart';
import { EnhancedCard as Card, EnhancedCardContent as CardContent, EnhancedCardHeader as CardHeader, EnhancedCardTitle as CardTitle } from '@/components/ui/enhanced-card';
import { PageHeader, PageHeaderDateFilter, PageHeaderExport } from '@/components/ui/page-header';
import { CheckCircle2, Info, AlertTriangle, PlusCircle, ChevronDown, ChevronUp, FileSpreadsheet } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { StaggeredContainer, HoverScale, FadeIn, AnimatedCounter, LoadingSkeleton } from '@/components/ui/animated-elements';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { InteractiveChart } from '@/components/ui/interactive-chart';
import { AdvancedDataTable } from '@/components/ui/advanced-data-table';

// Import new Phase 3 components
import { InteractiveButton, LikeButton, CopyButton } from '@/components/ui/micro-interactions';
import { SkeletonCard, StatusIndicator, ProgressBar } from '@/components/ui/loading-states';
import { StaggeredList, SlideIn } from '@/components/ui/page-transitions';
import { Tooltip, EmptyState } from '@/components/ui/feedback-system';
import { useAnimatedToast, useOnboarding } from '@/hooks/useMicroInteractions';
import { PerformanceMonitor } from '@/components/ui/performance-monitor';
import { VirtualList } from '@/components/ui/virtual-list';
import { useAdvancedCache } from '@/hooks/useAdvancedCache';
import TopDrivers from '@/components/Dashboard/TopDrivers';
import InsightsNextActions from '@/components/Dashboard/InsightsNextActions';
import TargetsWidget from '@/components/Dashboard/TargetsWidget';
import EmissionsTimeline from '@/components/Dashboard/EmissionsTimeline';
import { SectionHeader } from '@/components/ui/section-header';
import { StrategyMetrics } from '@/components/Dashboard/StrategyMetrics';
import { BarChart3, Target as TargetIcon, Shield, Clock } from 'lucide-react';

// Sample data for the advanced table
const sampleTableData = [{
  id: 1,
  source: 'Electricity',
  emissions: 1250.5,
  scope: 'Scope 2',
  status: 'Verified',
  lastUpdated: '2025-01-15'
}, {
  id: 2,
  source: 'Natural Gas',
  emissions: 890.2,
  scope: 'Scope 1',
  status: 'Pending',
  lastUpdated: '2025-01-14'
}, {
  id: 3,
  source: 'Business Travel',
  emissions: 456.8,
  scope: 'Scope 3',
  status: 'Verified',
  lastUpdated: '2025-01-13'
}, {
  id: 4,
  source: 'Waste',
  emissions: 123.4,
  scope: 'Scope 3',
  status: 'Draft',
  lastUpdated: '2025-01-12'
}];
const tableColumns = [{
  key: 'source' as keyof typeof sampleTableData[0],
  label: 'Emission Source',
  sortable: true
}, {
  key: 'emissions' as keyof typeof sampleTableData[0],
  label: 'Emissions (tCO₂e)',
  sortable: true,
  render: (value: number) => <AnimatedCounter value={value} suffix=" tCO₂e" className="font-mono" />
}, {
  key: 'scope' as keyof typeof sampleTableData[0],
  label: 'Scope',
  filterable: true
}, {
  key: 'status' as keyof typeof sampleTableData[0],
  label: 'Status',
  render: (value: string) => <span className={`px-2 py-1 rounded-full text-xs font-medium ${value === 'Verified' ? 'bg-green-100 text-green-800' : value === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
        {value}
      </span>
}, {
  key: 'lastUpdated' as keyof typeof sampleTableData[0],
  label: 'Last Updated',
  sortable: true
}];

// Sample chart data
const chartData = [{
  month: 'Jan',
  scope1: 890,
  scope2: 1250,
  scope3: 580
}, {
  month: 'Feb',
  scope1: 920,
  scope2: 1180,
  scope3: 620
}, {
  month: 'Mar',
  scope1: 850,
  scope2: 1320,
  scope3: 590
}, {
  month: 'Apr',
  scope1: 880,
  scope2: 1280,
  scope3: 640
}, {
  month: 'May',
  scope1: 820,
  scope2: 1200,
  scope3: 570
}];
const chartYKeys = [{
  key: 'scope1',
  label: 'Scope 1',
  color: '#ef4444'
}, {
  key: 'scope2',
  label: 'Scope 2',
  color: '#3b82f6'
}, {
  key: 'scope3',
  label: 'Scope 3',
  color: '#10b981'
}];
const Index = () => {
  const [showAll, setShowAll] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [likedCards, setLikedCards] = useState<Set<string>>(new Set());
  const {
    addToast
  } = useAnimatedToast();
  const {
    startOnboarding
  } = useOnboarding();

  // Add performance optimization features
  const cache = useAdvancedCache<any>({
    ttl: 10 * 60 * 1000,
    enableLogging: true
  });
  const handleNewReport = async () => {
    setIsLoading(true);
    addToast("Creating new report...", "info");

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      addToast("Report created successfully!", "success");
    }, 2000);
  };
  const handleCardLike = (cardId: string, liked: boolean) => {
    const newLikedCards = new Set(likedCards);
    if (liked) {
      newLikedCards.add(cardId);
    } else {
      newLikedCards.delete(cardId);
    }
    setLikedCards(newLikedCards);
    addToast(liked ? "Added to favorites" : "Removed from favorites", "info");
  };
  return <div className="space-y-6">
      {/* Performance Monitor */}
      <PerformanceMonitor componentName="Dashboard" />
      
      <FadeIn>
        <PageHeader title="Carbon Emissions Dashboard" subtitle="Track, analyze, and reduce your organization's carbon footprint" actions={<>
              <PageHeaderDateFilter defaultValue="Jan - May 2025" />
              <PageHeaderExport />
              <HoverScale>
                <InteractiveButton onClick={handleNewReport} loading={isLoading} className="bg-primary hover:bg-primary/90">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  {isLoading ? 'Creating...' : 'New Report'}
                </InteractiveButton>
              </HoverScale>
              <Tooltip content="Start interactive tour">
                <InteractiveButton variant="outline" onClick={startOnboarding}>
                  Help
                </InteractiveButton>
              </Tooltip>
            </>} />
      </FadeIn>
      
      <SlideIn direction="up" delay={0.1}>
        <EmissionsOverview />
      </SlideIn>
      
      <SlideIn direction="up" delay={0.2}>
        <EmissionsChart />
      </SlideIn>

      {/* Enhanced Interactive Chart with micro-interactions */}
      <SlideIn direction="up" delay={0.3}>
        <div className="relative">
        <InteractiveChart data={chartData} title="Monthly Emissions Breakdown" xKey="month" yKeys={chartYKeys} unit="tCO₂e" showBrush={true} showReference={true} referenceValue={1000} variant="consumer" onDataPointClick={data => {
          addToast(`Clicked on ${data.month} data`, "info");
        }} onExport={() => addToast("Chart exported successfully", "success")} />
          <div className="absolute top-4 right-4 flex gap-2">
            <LikeButton initialLiked={likedCards.has('emissions-chart')} onToggle={liked => handleCardLike('emissions-chart', liked)} />
            <CopyButton text="Monthly Emissions Data: Chart exported" />
          </div>
        </div>
      </SlideIn>

      <SlideIn direction="up" delay={0.35}>
        <EmissionsTimeline />
      </SlideIn>

      {/* Advanced Data Table with loading states */}
      <SlideIn direction="up" delay={0.4}>
        <div className="hidden" aria-hidden />
      </SlideIn>
      
      {/* Primary Actions Section */}
      <SectionHeader
        icon={Shield}
        title="Primary Actions"
        subtitle="Critical compliance and deadline management"
        helpText="Monitor your organization's compliance status and upcoming regulatory deadlines to ensure continuous adherence to carbon reporting standards."
        lastUpdated="2025-01-15T14:30:00Z"
      />
      
      <StaggeredList className="grid grid-cols-1 lg:grid-cols-2 gap-6" staggerDelay={0.1}>
        <GlassmorphismCard variant="light" className="p-6 space-y-4 relative">
          <div className="absolute top-4 right-4">
            <LikeButton initialLiked={likedCards.has('compliance-card')} onToggle={liked => handleCardLike('compliance-card', liked)} />
          </div>
          <div className="flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
            <h4 className="font-medium">Compliance Status</h4>
          </div>
          <div className="space-y-3">
            {[{
            name: 'GHG Protocol',
            status: 'Compliant',
            color: 'green',
            progress: 100
          }, {
            name: 'ISO 14064',
            status: 'Compliant',
            color: 'green',
            progress: 100
          }, {
            name: 'CDP Reporting',
            status: 'In Progress',
            color: 'yellow',
            progress: 75
          }, {
            name: 'TCFD Alignment',
            status: 'Partial',
            color: 'yellow',
            progress: 60
          }].map((item, index) => <motion.div key={index} whileHover={{
            scale: 1.02
          }} className="p-3 bg-white/50 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${item.color === 'green' ? 'bg-green-100 text-green-800' : item.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                    {item.status}
                  </span>
                </div>
                <ProgressBar value={item.progress} showLabel={false} className="h-1" />
              </motion.div>)}
          </div>
        </GlassmorphismCard>
        
        <GlassmorphismCard variant="colored" className="p-6 space-y-4 relative">
          <div className="absolute top-4 right-4">
            <LikeButton initialLiked={likedCards.has('deadlines-card')} onToggle={liked => handleCardLike('deadlines-card', liked)} />
          </div>
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            <h4 className="font-medium">Upcoming Deadlines</h4>
          </div>
          <div className="space-y-3">
            {[{
            task: 'Q2 Data Collection',
            date: 'June 30, 2025',
            urgency: 'high'
          }, {
            task: 'CDP Submission',
            date: 'July 15, 2025',
            urgency: 'medium'
          }, {
            task: 'Annual Report',
            date: 'Dec 31, 2025',
            urgency: 'low'
          }, {
            task: 'SBTi Validation',
            date: 'Mar 1, 2026',
            urgency: 'low'
          }].map((item, index) => <Tooltip key={index} content={`Priority: ${item.urgency}`}>
                <motion.div whileHover={{
              scale: 1.02,
              x: 5
            }} className="flex justify-between items-center p-3 bg-white/30 rounded-lg cursor-pointer">
                  <span className="text-sm font-medium">{item.task}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {item.date}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${item.urgency === 'high' ? 'bg-red-500' : item.urgency === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  </div>
                </motion.div>
              </Tooltip>)}
          </div>
        </GlassmorphismCard>
      </StaggeredList>

      {/* Performance Analysis Section */}
      <SectionHeader
        icon={BarChart3}
        title="Performance Analysis"
        subtitle="Analyze emission drivers and track progress against targets"
        helpText="Identify your top emission sources and monitor performance against your carbon reduction targets to optimize your sustainability strategy."
        lastUpdated="2025-01-15T12:15:00Z"
      />

      <StaggeredList className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6" staggerDelay={0.1}>
        <TopDrivers />
        <InsightsNextActions />
        <TargetsWidget />
      </StaggeredList>
      
      {/* Strategic Insights Section */}
      <SectionHeader
        icon={TargetIcon}
        title="Strategic Insights"
        subtitle="Long-term sustainability planning and progress tracking"
        helpText="Monitor progress toward your strategic sustainability goals and get actionable insights to accelerate your carbon reduction journey."
        lastUpdated="2025-01-15T11:45:00Z"
      />
      
      {showAll && <SlideIn direction="up">
          <StrategyMetrics 
            onCardLike={handleCardLike}
            likedCards={likedCards}
          />
        </SlideIn>}

      <div className="flex justify-center mt-6">
        <InteractiveButton variant="outline" onClick={() => setShowAll(!showAll)}>
          {showAll ? <>Show Less <ChevronUp className="h-4 w-4 ml-2" /></> : <>Show Strategic Insights <ChevronDown className="h-4 w-4 ml-2" /></>}
        </InteractiveButton>
      </div>

      {/* Empty state example (conditionally shown) */}
      {sampleTableData.length === 0 && <EmptyState icon={FileSpreadsheet} title="No emissions data found" description="Start by adding your first emissions record to see analytics and insights." action={{
      label: "Add Emissions Data",
      onClick: handleNewReport
    }} />}
    </div>;
};
export default Index;