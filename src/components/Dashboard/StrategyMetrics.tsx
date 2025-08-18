import React from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Leaf, Zap, Car } from 'lucide-react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { ProgressBar } from '@/components/ui/loading-states';
import { AnimatedCounter } from '@/components/ui/animated-elements';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ContextualHelp } from '@/components/ui/contextual-help';
import { DataFreshness } from '@/components/ui/data-freshness';
import { LikeButton } from '@/components/ui/micro-interactions';

interface StrategyMetric {
  id: string;
  title: string;
  description: string;
  current: number;
  target: number;
  trend: number;
  icon: React.ElementType;
  category: string;
  benchmark?: number;
  lastUpdated: string;
}

interface StrategyMetricsProps {
  onCardLike?: (cardId: string, liked: boolean) => void;
  likedCards?: Set<string>;
}

export const StrategyMetrics: React.FC<StrategyMetricsProps> = ({ 
  onCardLike,
  likedCards = new Set()
}) => {
  const metrics: StrategyMetric[] = [
    {
      id: 'renewable-energy',
      title: 'Renewable Energy',
      description: 'Percentage of total energy consumption from renewable sources',
      current: 42,
      target: 75,
      trend: 12,
      icon: Zap,
      category: 'Energy Transition',
      benchmark: 35,
      lastUpdated: '2025-01-15T10:30:00Z'
    },
    {
      id: 'carbon-neutrality',
      title: 'Carbon Neutrality Progress',
      description: 'Progress toward achieving net-zero emissions by 2030',
      current: 28,
      target: 100,
      trend: 8,
      icon: Leaf,
      category: 'Climate Goals',
      benchmark: 22,
      lastUpdated: '2025-01-15T09:15:00Z'
    },
    {
      id: 'ev-fleet',
      title: 'Electric Vehicle Fleet',
      description: 'Percentage of company fleet converted to electric vehicles',
      current: 15,
      target: 100,
      trend: 10,
      icon: Car,
      category: 'Transportation',
      benchmark: 12,
      lastUpdated: '2025-01-14T16:45:00Z'
    }
  ];

  return (
    <GlassmorphismCard variant="light" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-primary" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold">Sustainability Strategy Progress</h3>
              <ContextualHelp content="Track your organization's progress toward key sustainability goals and targets. Metrics include renewable energy adoption, carbon neutrality progress, and fleet electrification." />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor key initiatives and compare against industry benchmarks
            </p>
          </div>
        </div>
        {onCardLike && (
          <LikeButton 
            initialLiked={likedCards.has('strategy-metrics')} 
            onToggle={(liked) => onCardLike('strategy-metrics', liked)} 
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((metric, index) => {
          const progressPercent = (metric.current / metric.target) * 100;
          const benchmarkPercent = metric.benchmark ? (metric.benchmark / metric.target) * 100 : 0;
          const Icon = metric.icon;
          
          return (
            <motion.div
              key={metric.id}
              className="bg-card/50 backdrop-blur-sm p-5 rounded-lg border border-border/50"
              whileHover={{ scale: 1.02, y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {metric.category}
                  </span>
                </div>
                <DataFreshness lastUpdated={metric.lastUpdated} className="text-xs" />
              </div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="cursor-help">
                      <h4 className="font-semibold text-base mb-1">{metric.title}</h4>
                      <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                        {metric.description}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{metric.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">
                    <AnimatedCounter value={metric.current} suffix="%" />
                  </span>
                  <div className="flex items-center gap-2">
                    {metric.trend > 0 && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full cursor-help">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +{metric.trend}% YoY
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Year-over-year growth: +{metric.trend}%</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <ProgressBar 
                    value={progressPercent} 
                    showLabel={false} 
                    className="h-2"
                  />
                  
                  {metric.benchmark && (
                    <div className="relative">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Industry avg: {metric.benchmark}%</span>
                        <span 
                          className={metric.current > metric.benchmark ? 'text-green-600' : 'text-amber-600'}
                        >
                          {metric.current > metric.benchmark ? 'Above' : 'Below'} average
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                  <span>Current: {metric.current}%</span>
                  <span>Target: {metric.target}%</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </GlassmorphismCard>
  );
};

export default StrategyMetrics;