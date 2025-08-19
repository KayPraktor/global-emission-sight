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
        <GlassmorphismCard variant="light" className="p-6 space-y-4 relative group">
          <div className="absolute top-4 right-4">
            <LikeButton initialLiked={likedCards.has('compliance-card')} onToggle={liked => handleCardLike('compliance-card', liked)} />
          </div>
          <div className="flex items-center pb-2 border-b border-border/30">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 mr-3">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Compliance Status</h4>
              <p className="text-xs text-muted-foreground">Regulatory framework adherence</p>
            </div>
          </div>
          <div className="space-y-3">
            {[{
            name: 'GHG Protocol',
            status: 'Compliant',
            color: 'green',
            progress: 100,
            icon: CheckCircle2
          }, {
            name: 'ISO 14064',
            status: 'Compliant',
            color: 'green',
            progress: 100,
            icon: CheckCircle2
          }, {
            name: 'CDP Reporting',
            status: 'In Progress',
            color: 'amber',
            progress: 75,
            icon: Clock
          }, {
            name: 'TCFD Alignment',
            status: 'Partial',
            color: 'amber',
            progress: 60,
            icon: AlertTriangle
          }].map((item, index) => <motion.div key={index} whileHover={{
            scale: 1.02,
            backgroundColor: 'rgba(255, 255, 255, 0.8)'
          }} className="p-3 bg-white/50 rounded-lg space-y-2 transition-all duration-200 hover:shadow-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <item.icon className={`h-3.5 w-3.5 ${
                      item.color === 'green' ? 'text-green-500' : 
                      item.color === 'amber' ? 'text-amber-500' : 
                      'text-gray-500'
                    }`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    item.color === 'green' ? 'bg-green-100 text-green-700 border border-green-200' : 
                    item.color === 'amber' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 
                    'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <ProgressBar value={item.progress} showLabel={false} className="h-1.5" />
              </motion.div>)}
          </div>
        </GlassmorphismCard>
        
        <GlassmorphismCard variant="light" className="p-6 space-y-4 relative group">
          <div className="absolute top-4 right-4">
            <LikeButton initialLiked={likedCards.has('deadlines-card')} onToggle={liked => handleCardLike('deadlines-card', liked)} />
          </div>
          <div className="flex items-center pb-2 border-b border-border/30">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 mr-3">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Upcoming Deadlines</h4>
              <p className="text-xs text-muted-foreground">Critical regulatory submissions</p>
            </div>
          </div>
          <div className="space-y-3">
            {[{
            task: 'Q2 Data Collection',
            date: 'June 30, 2025',
            urgency: 'high',
            days: 42
          }, {
            task: 'CDP Submission',
            date: 'July 15, 2025',
            urgency: 'medium',
            days: 57
          }, {
            task: 'Annual Report',
            date: 'Dec 31, 2025',
            urgency: 'low',
            days: 226
          }, {
            task: 'SBTi Validation',
            date: 'Mar 1, 2026',
            urgency: 'low',
            days: 287
          }].map((item, index) => <Tooltip key={index} content={`Priority: ${item.urgency} • ${item.days} days remaining`}>
                <motion.div whileHover={{
              scale: 1.02,
              backgroundColor: 'rgba(255, 255, 255, 0.8)'
            }} className="flex justify-between items-center p-3 bg-white/50 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      item.urgency === 'high' ? 'bg-red-500 shadow-red-500/50 shadow-sm' : 
                      item.urgency === 'medium' ? 'bg-amber-500 shadow-amber-500/50 shadow-sm' : 
                      'bg-green-500 shadow-green-500/50 shadow-sm'
                    }`} />
                    <div>
                      <span className="text-sm font-medium text-foreground">{item.task}</span>
                      <div className="text-xs text-muted-foreground">{item.days} days left</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium border border-blue-200">
                      {item.date}
                    </span>
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
        subtitle="Comprehensive view of emission trends, targets, and key performance indicators"
        helpText="Analyze your emission patterns, identify top contributors, and track progress toward your sustainability targets."
        lastUpdated="2025-01-15T12:15:00Z"
      />

      <div className="space-y-6 mt-6">
        {/* Top row: Drivers and Insights */}
        <StaggeredList className="grid grid-cols-1 lg:grid-cols-2 gap-6" staggerDelay={0.1}>
          <TopDrivers />
          <InsightsNextActions />
        </StaggeredList>
        
        {/* Bottom row: Targets chart full width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <TargetsWidget />
        </motion.div>
      </div>
      
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