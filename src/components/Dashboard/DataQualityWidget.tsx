import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { dataQualityService, type DataQualityScore } from '@/services/dataQualityService';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight,
  Shield,
  Sparkles,
  Target,
  Clock
} from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/animated-elements';

// Metric card component
interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  index: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, icon: Icon, index }) => {
  const getMetricStyles = (score: number) => {
    if (score >= 80) return {
      border: 'border-l-emerald-500',
      bg: 'from-emerald-500/5 to-transparent',
      iconBg: 'bg-emerald-500/10',
      iconText: 'text-emerald-600',
      progressColor: 'bg-emerald-500'
    };
    if (score >= 60) return {
      border: 'border-l-amber-500',
      bg: 'from-amber-500/5 to-transparent',
      iconBg: 'bg-amber-500/10',
      iconText: 'text-amber-600',
      progressColor: 'bg-amber-500'
    };
    return {
      border: 'border-l-destructive',
      bg: 'from-destructive/5 to-transparent',
      iconBg: 'bg-destructive/10',
      iconText: 'text-destructive',
      progressColor: 'bg-destructive'
    };
  };

  const styles = getMetricStyles(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`
        p-3 rounded-xl border border-l-4 ${styles.border}
        bg-gradient-to-r ${styles.bg}
        transition-all duration-200 hover:shadow-sm
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${styles.iconBg}`}>
            <Icon className={`h-3.5 w-3.5 ${styles.iconText}`} />
          </div>
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <span className="text-sm font-semibold">{value}%</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </motion.div>
  );
};

// Loading skeleton
const QualitySkeleton = () => (
  <div className="space-y-4">
    <div className="p-4 rounded-xl border animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-24 bg-muted rounded"></div>
        <div className="h-8 w-8 bg-muted rounded-full"></div>
      </div>
      <div className="h-10 w-20 bg-muted rounded mb-2"></div>
      <div className="h-3 w-32 bg-muted rounded"></div>
    </div>
    <div className="space-y-3">
      {[0, 1, 2].map(i => (
        <div key={i} className="p-3 rounded-xl border animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-muted rounded-lg"></div>
              <div className="h-4 w-20 bg-muted rounded"></div>
            </div>
            <div className="h-4 w-10 bg-muted rounded"></div>
          </div>
          <div className="h-1.5 bg-muted rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

// Empty state
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-8"
  >
    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-3">
      <Shield className="h-7 w-7 text-muted-foreground" />
    </div>
    <h4 className="font-medium text-foreground mb-1">No data to assess</h4>
    <p className="text-sm text-muted-foreground">
      Add emissions data to see quality metrics
    </p>
  </motion.div>
);

export const DataQualityWidget: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [qualityScore, setQualityScore] = useState<DataQualityScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadQualityScore();
    }
  }, [user]);

  const loadQualityScore = async () => {
    if (!user) return;

    try {
      const score = await dataQualityService.calculateDataQuality(user.id);
      setQualityScore(score);
    } catch (error) {
      console.error('Error loading quality score:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOverallStyles = (score: number) => {
    if (score >= 80) return {
      bg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5',
      text: 'text-emerald-600',
      icon: CheckCircle,
      label: 'Excellent',
      glow: 'shadow-emerald-500/20'
    };
    if (score >= 60) return {
      bg: 'bg-gradient-to-br from-amber-500/20 to-amber-500/5',
      text: 'text-amber-600',
      icon: AlertTriangle,
      label: 'Good',
      glow: ''
    };
    return {
      bg: 'bg-gradient-to-br from-destructive/20 to-destructive/5',
      text: 'text-destructive',
      icon: AlertTriangle,
      label: 'Needs Improvement',
      glow: ''
    };
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header with gradient */}
      <div className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-inset ring-primary/20">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Data Quality</h4>
              <p className="text-xs text-muted-foreground">Completeness & accuracy metrics</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/analytics?tab=quality')}
            className="text-xs"
          >
            Details
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <QualitySkeleton />
        ) : !qualityScore ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {/* Overall Score Card */}
            {(() => {
              const styles = getOverallStyles(qualityScore.overall);
              const IconComponent = styles.icon;
              return (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`
                    p-4 rounded-xl ${styles.bg} 
                    border transition-all duration-300
                    ${qualityScore.overall >= 80 ? 'shadow-lg ' + styles.glow : ''}
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-muted-foreground">Overall Score</span>
                    <div className={`p-1.5 rounded-lg ${styles.bg}`}>
                      <IconComponent className={`h-4 w-4 ${styles.text}`} />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-bold ${styles.text}`}>
                      <AnimatedCounter value={qualityScore.overall} suffix="%" />
                    </span>
                    <Badge variant="outline" className={`${styles.text} border-current`}>
                      {styles.label}
                    </Badge>
                  </div>
                  {qualityScore.overall >= 80 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-1.5 mt-2 text-xs text-emerald-600"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Your data quality is excellent!</span>
                    </motion.div>
                  )}
                </motion.div>
              );
            })()}

            {/* Metric Breakdown */}
            <div className="space-y-2">
              <MetricCard
                label="Completeness"
                value={qualityScore.completeness}
                icon={Target}
                index={0}
              />
              <MetricCard
                label="Accuracy"
                value={qualityScore.accuracy}
                icon={CheckCircle}
                index={1}
              />
              <MetricCard
                label="Freshness"
                value={qualityScore.freshness}
                icon={Clock}
                index={2}
              />
            </div>

            {/* Action Alert */}
            <AnimatePresence>
              {qualityScore.overall < 70 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-3 rounded-xl border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-500/10 to-transparent border"
                >
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Action Required</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                        Review and improve your data entries to meet quality standards.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
