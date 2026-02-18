import React, { useState, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import EmissionsOverview from '@/components/Dashboard/EmissionsOverview';
import EmissionsChart from '@/components/Dashboard/EmissionsChart';
import { PageHeaderDateFilter } from '@/components/ui/page-header';
import { PlusCircle, ChevronDown, ChevronUp, BarChart3, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { StaggeredContainer, HoverScale, FadeIn } from '@/components/ui/animated-elements';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { InteractiveButton } from '@/components/ui/micro-interactions';
import { SkeletonCard, ProgressBar } from '@/components/ui/loading-states';
import { StaggeredList, SlideIn } from '@/components/ui/page-transitions';
import { useAnimatedToast, useOnboarding } from '@/hooks/useMicroInteractions';
import { PerformanceMonitor } from '@/components/ui/performance-monitor';
import { useAdvancedCache } from '@/hooks/useAdvancedCache';
import TopDrivers from '@/components/Dashboard/TopDrivers';
import InsightsNextActions from '@/components/Dashboard/InsightsNextActions';
import EnhancedTargetsWidget from '@/components/Dashboard/EnhancedTargetsWidget';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import PersonalizedWelcome from '@/components/Dashboard/PersonalizedWelcome';
import SeedDataButton from '@/components/Dashboard/SeedDataButton';
import FirstTimeWelcome from '@/components/onboarding/FirstTimeWelcome';
import { OrganizationSetupBanner } from '@/components/onboarding/OrganizationSetupBanner';
import { DashboardCustomizer } from '@/components/Dashboard/DashboardCustomizer';
import { DraggableWidget } from '@/components/Dashboard/DraggableWidget';
import { useDashboardLayout } from '@/hooks/useDashboardLayout';
import { CelebrationProvider } from '@/contexts/CelebrationContext';
import { Skeleton } from '@/components/ui/skeleton';

// Extracted config & data hook
import { WIDGET_CONFIGS } from '@/config/dashboardConfig';
import { useDashboardData } from '@/hooks/useDashboardData';
import { ComplianceStatusWidget } from '@/components/Dashboard/ComplianceStatusWidget';

// Lazy load heavy dashboard widgets
const EmissionsTimeline = lazy(() => import('@/components/Dashboard/EmissionsTimeline'));
const QuickWinsSection = lazy(() => import('@/components/Dashboard/QuickWinsSection'));
const RealtimeNotificationsPanel = lazy(() => import('@/components/Dashboard/RealtimeNotificationsPanel'));
const StrategicIntelligencePanel = lazy(() => import('@/components/Dashboard/StrategicIntelligencePanel'));
const IndustryKPIPanel = lazy(() =>
  import('@/components/Industry/IndustryKPIPanel').then(m => ({ default: m.IndustryKPIPanel }))
);
const DataQualityWidget = lazy(() =>
  import('@/components/Dashboard/DataQualityWidget').then(m => ({ default: m.DataQualityWidget }))
);
const ValueTrackingWidget = lazy(() => import('@/components/Dashboard/ValueTrackingWidget'));

const WidgetSkeleton: React.FC<{ height?: string }> = ({ height = 'h-48' }) => (
  <div className={`rounded-xl border bg-card p-6 ${height}`}>
    <div className="space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
    </div>
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const { addToast } = useAnimatedToast();

  // Data hook
  const { isLoading, analyticsData, frameworkStatuses, deadlines } = useDashboardData(6);

  // Dashboard customization
  const {
    layout,
    savedViews,
    currentView,
    isCustomizeMode,
    setIsCustomizeMode,
    updateLayout,
    saveLayout,
    selectView,
    deleteView,
    setDefaultView,
    isWidgetVisible,
    toggleWidgetVisibility,
  } = useDashboardLayout();

  const cache = useAdvancedCache<any>({ ttl: 10 * 60 * 1000, enableLogging: true });

  const handleNewReport = async () => {
    addToast("Creating new report...", "info");
    setTimeout(() => addToast("Report created successfully!", "success"), 2000);
  };

  return (
    <CelebrationProvider>
      <div className="space-y-6">
        <PerformanceMonitor componentName="Dashboard" />
        <OrganizationSetupBanner />
        <PersonalizedWelcome />

        <FadeIn>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <h1 className="text-2xl font-bold tracking-tight">Carbon Emissions Dashboard</h1>
                <p className="text-muted-foreground mt-1">Track, analyze, and reduce your organization's carbon footprint</p>
              </div>
              <div className="flex items-center gap-3">
                <DashboardCustomizer
                  widgets={WIDGET_CONFIGS}
                  currentLayout={layout}
                  onLayoutChange={updateLayout}
                  onSave={saveLayout}
                  isCustomizeMode={isCustomizeMode}
                  onCustomizeModeChange={setIsCustomizeMode}
                  views={savedViews}
                  currentView={currentView}
                  onSelectView={selectView}
                  onDeleteView={deleteView}
                  onSetDefault={setDefaultView}
                />
                <PageHeaderDateFilter defaultValue="Jan - May 2025" />
                <HoverScale>
                  <InteractiveButton onClick={handleNewReport} loading={isLoading} className="bg-primary hover:bg-primary/90">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {isLoading ? 'Creating...' : 'New Report'}
                  </InteractiveButton>
                </HoverScale>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Emissions Overview */}
        {isWidgetVisible('overview') && (
          <DraggableWidget id="overview" title="Emissions Overview" isCustomizeMode={isCustomizeMode} isVisible onRemove={() => toggleWidgetVisibility('overview')}>
            <SlideIn direction="up" delay={0.1}>
              {isLoading ? <SkeletonCard /> : (
                <EmissionsOverview
                  totalEmissions={analyticsData?.totalEmissions || 0}
                  scope1Total={analyticsData?.scope1Total || 0}
                  scope2Total={analyticsData?.scope2Total || 0}
                  scope3Total={analyticsData?.scope3Total || 0}
                  previousPeriodTotal={analyticsData?.previousPeriodTotal || 0}
                  changePercentage={analyticsData?.changePercentage || 0}
                  hasData={!!analyticsData && analyticsData.totalEmissions > 0}
                  monthlyData={analyticsData?.monthlyData}
                />
              )}
            </SlideIn>
          </DraggableWidget>
        )}

        {/* Emissions Chart */}
        {isWidgetVisible('chart') && (
          <DraggableWidget id="chart" title="Emissions Chart" isCustomizeMode={isCustomizeMode} isVisible onRemove={() => toggleWidgetVisibility('chart')}>
            <SlideIn direction="up" delay={0.2}>
              {isLoading ? <SkeletonCard /> : (
                <EmissionsChart
                  monthlyData={analyticsData?.monthlyData || []}
                  categoryBreakdown={analyticsData?.categoryBreakdown || []}
                  hasData={!!analyticsData && analyticsData.totalEmissions > 0}
                />
              )}
            </SlideIn>
          </DraggableWidget>
        )}

        {/* Emissions Timeline */}
        {isWidgetVisible('timeline') && (
          <DraggableWidget id="timeline" title="Emissions Timeline" isCustomizeMode={isCustomizeMode} isVisible onRemove={() => toggleWidgetVisibility('timeline')}>
            <SlideIn direction="up" delay={0.35}>
              {isLoading ? <SkeletonCard /> : (
                <Suspense fallback={<WidgetSkeleton height="h-24" />}>
                  <EmissionsTimeline monthlyData={analyticsData?.monthlyData || []} hasData={!!analyticsData && analyticsData.totalEmissions > 0} />
                </Suspense>
              )}
            </SlideIn>
          </DraggableWidget>
        )}

        {/* Quick Wins & Live Activity */}
        {(isWidgetVisible('quickWins') || isWidgetVisible('notifications')) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {isWidgetVisible('quickWins') && (
              <DraggableWidget id="quickWins" title="Quick Wins" isCustomizeMode={isCustomizeMode} isVisible onRemove={() => toggleWidgetVisibility('quickWins')}>
                <Suspense fallback={<WidgetSkeleton height="h-64" />}><QuickWinsSection /></Suspense>
              </DraggableWidget>
            )}
            {isWidgetVisible('notifications') && (
              <DraggableWidget id="notifications" title="Live Activity" isCustomizeMode={isCustomizeMode} isVisible onRemove={() => toggleWidgetVisibility('notifications')}>
                <Suspense fallback={<WidgetSkeleton height="h-64" />}><RealtimeNotificationsPanel /></Suspense>
              </DraggableWidget>
            )}
          </div>
        )}

        {/* Compliance & Deadlines — Extracted Widget */}
        {(isWidgetVisible('compliance') || isWidgetVisible('deadlines')) && (
          <ComplianceStatusWidget
            frameworkStatuses={frameworkStatuses}
            deadlines={deadlines}
            isCustomizeMode={isCustomizeMode}
            isWidgetVisible={isWidgetVisible}
            toggleWidgetVisibility={toggleWidgetVisibility}
          />
        )}

        {/* Data Quality */}
        {isWidgetVisible('dataQuality') && (
          <DraggableWidget id="dataQuality" title="Data Quality" isCustomizeMode={isCustomizeMode} isVisible onRemove={() => toggleWidgetVisibility('dataQuality')}>
            <SectionHeader icon={Shield} title="Data Quality Overview" subtitle="Monitor your data completeness and accuracy" helpText="Track high-level data quality metrics." lastUpdated="2025-01-15T14:30:00Z" />
            <StaggeredList className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4" staggerDelay={0.1}>
              <Suspense fallback={<WidgetSkeleton />}><DataQualityWidget /></Suspense>
              <GlassmorphismCard variant="light" className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Detailed Quality Analysis</h3>
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">Access comprehensive data quality metrics, validation rules, and improvement recommendations.</p>
                  <Button onClick={() => navigate('/analytics?tab=quality')} className="w-full">View Full Quality Dashboard</Button>
                </div>
              </GlassmorphismCard>
            </StaggeredList>
          </DraggableWidget>
        )}

        {/* Industry KPIs */}
        {isWidgetVisible('industryKPIs') && (
          <DraggableWidget id="industryKPIs" title="Industry KPIs" isCustomizeMode={isCustomizeMode} isVisible onRemove={() => toggleWidgetVisibility('industryKPIs')}>
            <SectionHeader icon={BarChart3} title="Industry KPIs" subtitle="Performance metrics tailored to your industry" helpText="These KPIs are automatically selected based on your organization's industry." lastUpdated="2025-01-15T14:30:00Z" />
            <SlideIn direction="up" delay={0.3}>
              <Suspense fallback={<WidgetSkeleton height="h-64" />}><IndustryKPIPanel /></Suspense>
            </SlideIn>
          </DraggableWidget>
        )}

        {/* Performance Intelligence */}
        {(isWidgetVisible('performance') || isCustomizeMode) && (
          <DraggableWidget id="performance" title="Performance Intelligence" isCustomizeMode={isCustomizeMode} isVisible={isWidgetVisible('performance')} onRemove={() => toggleWidgetVisibility('performance')}>
            <motion.div initial={false} className="space-y-4">
              <div
                className="flex items-center justify-between cursor-pointer group p-4 rounded-lg hover:bg-muted/50 transition-colors"
                onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
                role="button" tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowAdvancedAnalytics(!showAdvancedAnalytics); } }}
                aria-expanded={showAdvancedAnalytics} aria-controls="performance-intelligence-content"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10"><BarChart3 className="h-5 w-5 text-primary" /></div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Performance Intelligence</h3>
                    <p className="text-sm text-muted-foreground">Value delivery tracking and strategic insights</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{showAdvancedAnalytics ? 'Collapse' : 'Expand'}</span>
                  {showAdvancedAnalytics ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                </div>
              </div>

              <AnimatePresence>
                {showAdvancedAnalytics && (
                  <motion.div id="performance-intelligence-content" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="space-y-6 overflow-hidden">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                      <Suspense fallback={<WidgetSkeleton />}><ValueTrackingWidget /></Suspense>
                    </motion.div>
                    <StaggeredList className="grid grid-cols-1 lg:grid-cols-2 gap-6" staggerDelay={0.1}>
                      <TopDrivers categoryBreakdown={analyticsData?.categoryBreakdown || []} />
                      <InsightsNextActions />
                    </StaggeredList>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
                      <EnhancedTargetsWidget />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.4 }}>
                      <Suspense fallback={<WidgetSkeleton height="h-96" />}><StrategicIntelligencePanel /></Suspense>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </DraggableWidget>
        )}

        <FirstTimeWelcome />

        {!isLoading && (!analyticsData || analyticsData.totalEmissions === 0) && (
          <SlideIn direction="up" delay={0.5}><SeedDataButton /></SlideIn>
        )}
      </div>
    </CelebrationProvider>
  );
};
export default Index;
