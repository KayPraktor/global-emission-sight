import React, { useState, useEffect } from 'react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, DollarSign, TrendingUp, Award, Target, Zap } from 'lucide-react';
import { DataFreshness } from '@/components/ui/data-freshness';
import { supabase } from '@/integrations/supabase/client';
import { AnimatedCounter } from '@/components/ui/animated-elements';

interface ValueMetrics {
  timeSavedHours: number;
  costSavings: number;
  dataQualityScore: number;
  dataQualityImprovement: number;
  automatedTasks: number;
  deadlinesTracked: number;
}

const ValueTrackingWidget: React.FC = () => {
  const [metrics, setMetrics] = useState<ValueMetrics>({
    timeSavedHours: 0,
    costSavings: 0,
    dataQualityScore: 0,
    dataQualityImprovement: 0,
    automatedTasks: 0,
    deadlinesTracked: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchValueMetrics = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get data quality metrics
        const { data: qualityData } = await supabase
          .from('quality_tracking')
          .select('overall_score')
          .eq('user_id', user.id)
          .order('metric_date', { ascending: false })
          .limit(2);

        // Get compliance deadlines tracked
        const { data: { organization_id } } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();

        const { count: deadlinesCount } = await supabase
          .from('compliance_deadlines')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organization_id);

        // Get automated insights count
        const { count: insightsCount } = await supabase
          .from('emissions_insights')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_dismissed', false);

        // Calculate metrics
        const currentQuality = qualityData?.[0]?.overall_score || 0;
        const previousQuality = qualityData?.[1]?.overall_score || currentQuality;
        const qualityImprovement = currentQuality - previousQuality;

        // Estimate time saved: 2 hours per insight + 0.5 hours per tracked deadline
        const timeSaved = (insightsCount || 0) * 2 + (deadlinesCount || 0) * 0.5;

        // Estimate cost savings: $150/hour * time saved
        const costSavings = timeSaved * 150;

        setMetrics({
          timeSavedHours: Math.round(timeSaved),
          costSavings: Math.round(costSavings),
          dataQualityScore: Math.round(currentQuality),
          dataQualityImprovement: Math.round(qualityImprovement),
          automatedTasks: insightsCount || 0,
          deadlinesTracked: deadlinesCount || 0
        });
      } catch (error) {
        console.error('Error fetching value metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchValueMetrics();
  }, []);

  const valueCards = [
    {
      icon: Clock,
      label: 'Time Saved This Month',
      value: metrics.timeSavedHours,
      unit: 'hours',
      color: 'text-blue-500',
      bgColor: 'bg-blue-100',
      description: 'Automation and AI recommendations'
    },
    {
      icon: DollarSign,
      label: 'Cost Savings',
      value: metrics.costSavings,
      unit: '$',
      prefix: '$',
      color: 'text-green-500',
      bgColor: 'bg-green-100',
      description: 'Based on $150/hr average rate'
    },
    {
      icon: Award,
      label: 'Data Quality Score',
      value: metrics.dataQualityScore,
      unit: '%',
      suffix: '%',
      color: 'text-purple-500',
      bgColor: 'bg-purple-100',
      description: 'Current data quality rating',
      trend: metrics.dataQualityImprovement > 0 ? 'up' : metrics.dataQualityImprovement < 0 ? 'down' : 'stable',
      trendValue: Math.abs(metrics.dataQualityImprovement)
    },
    {
      icon: Zap,
      label: 'Automated Insights',
      value: metrics.automatedTasks,
      unit: 'tasks',
      color: 'text-amber-500',
      bgColor: 'bg-amber-100',
      description: 'AI-powered recommendations'
    },
    {
      icon: Target,
      label: 'Deadlines Tracked',
      value: metrics.deadlinesTracked,
      unit: 'deadlines',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100',
      description: 'Compliance deadlines monitored'
    }
  ];

  if (loading) {
    return (
      <GlassmorphismCard variant="light" className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </GlassmorphismCard>
    );
  }

  return (
    <GlassmorphismCard variant="light" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-5 w-5 text-primary" />
          <div>
            <h4 className="font-medium">Value Delivered</h4>
            <p className="text-sm text-muted-foreground">Track the ROI of your carbon management platform</p>
          </div>
        </div>
        <DataFreshness lastUpdated={new Date()} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {valueCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-background/50 rounded-lg p-4 border hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
              <div className="flex items-baseline gap-1">
                {card.prefix && <span className="text-2xl font-bold">{card.prefix}</span>}
                <AnimatedCounter 
                  value={card.value} 
                  className="text-2xl font-bold"
                  suffix={card.suffix}
                />
                {card.trend && card.trendValue > 0 && (
                  <Badge variant={card.trend === 'up' ? 'default' : 'secondary'} className="text-xs">
                    {card.trend === 'up' ? '↑' : '↓'} {card.trendValue}%
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{card.description}</p>
            </div>
          );
        })}
      </div>

      {/* ROI Summary */}
      <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Monthly Platform ROI</p>
            <p className="text-xs text-muted-foreground">Value delivered vs. platform cost</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              {metrics.costSavings > 0 ? Math.round((metrics.costSavings / 299) * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Based on $299/mo pricing</p>
          </div>
        </div>
        {metrics.costSavings > 299 && (
          <Progress value={100} className="mt-3" />
        )}
      </div>
    </GlassmorphismCard>
  );
};

export default ValueTrackingWidget;
