import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Clock, TrendingUp, ChevronRight, Eye, X, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useCelebrationContext } from '@/contexts/CelebrationContext';
import { SuccessPulse, CardSuccessGlow } from '@/components/ui/celebration-effects';
interface QuickWin {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  impact: 'High' | 'Medium' | 'Low';
  actionLabel: string;
  actionUrl: string;
  category: string;
}

// Live indicator component
const LiveIndicator = () => (
  <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 rounded-full">
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
    </span>
    <span className="text-xs font-medium text-amber-600">ACTIVE</span>
  </div>
);

// Quick win card component
interface QuickWinCardProps {
  win: QuickWin;
  index: number;
  onAction: (win: QuickWin) => void;
  onDismiss?: (win: QuickWin) => void;
  onComplete?: (win: QuickWin) => void;
  isCompleting?: boolean;
}

const QuickWinCard: React.FC<QuickWinCardProps> = ({ win, index, onAction, onDismiss, onComplete, isCompleting }) => {
  const [isHovered, setIsHovered] = useState(false);
  const getImpactStyles = (impact: string) => {
    switch (impact) {
      case 'High':
        return {
          border: 'border-l-emerald-500',
          bg: 'from-emerald-500/5 to-transparent',
          iconBg: 'bg-emerald-500/10',
          iconText: 'text-emerald-600',
          badge: 'bg-emerald-100 text-emerald-700 border-emerald-200'
        };
      case 'Medium':
        return {
          border: 'border-l-primary',
          bg: 'from-primary/5 to-transparent',
          iconBg: 'bg-primary/10',
          iconText: 'text-primary',
          badge: 'bg-primary/10 text-primary border-primary/20'
        };
      default:
        return {
          border: 'border-l-muted-foreground',
          bg: 'from-muted/50 to-transparent',
          iconBg: 'bg-muted',
          iconText: 'text-muted-foreground',
          badge: 'bg-muted text-muted-foreground border-muted'
        };
    }
  };

  const styles = getImpactStyles(win.impact);

  return (
    <CardSuccessGlow trigger={isCompleting || false}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={isCompleting ? { scale: [1, 1.02, 1], opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20, scale: 0.95 }}
        transition={{ delay: index * 0.1, duration: 0.3 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          relative p-4 rounded-xl border border-l-4 ${styles.border}
          bg-gradient-to-r ${styles.bg}
          transition-all duration-200 cursor-pointer
          hover:shadow-md hover:scale-[1.01] hover:border-primary/30
          ${isCompleting ? 'ring-2 ring-emerald-500/50' : ''}
        `}
        onClick={() => onAction(win)}
      >
        {/* Completion overlay */}
        <AnimatePresence>
          {isCompleting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 rounded-xl bg-emerald-500/10 flex items-center justify-center z-10"
            >
              <SuccessPulse trigger={true}>
                <div className="p-3 rounded-full bg-emerald-500 text-white">
                  <Check className="h-6 w-6" />
                </div>
              </SuccessPulse>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-start gap-3">
          {/* Icon container */}
          <div className={`p-2.5 rounded-xl ${styles.iconBg} ring-1 ring-inset ring-black/5`}>
            <Zap className={`h-4 w-4 ${styles.iconText}`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="outline" className="text-xs px-1.5 py-0">
                {win.category}
              </Badge>
              <Badge className={`text-xs border ${styles.badge}`}>
                {win.impact} Impact
              </Badge>
            </div>
            <h5 className="font-medium text-sm mb-1">{win.title}</h5>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{win.description}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {win.estimatedMinutes} min
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Quick win
              </span>
            </div>
          </div>

          {/* Hover action buttons */}
          <AnimatePresence>
            {isHovered && !isCompleting && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-1"
              >
                {onComplete && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onComplete(win);
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction(win);
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {onDismiss && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(win);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Default chevron when not hovered */}
          {!isHovered && !isCompleting && (
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </motion.div>
    </CardSuccessGlow>
  );
};

// Empty state component
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-10"
  >
    <motion.div
      animate={{ y: [0, -5, 0] }}
      transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 mb-4"
    >
      <Zap className="h-8 w-8 text-emerald-500" />
    </motion.div>
    <h4 className="font-medium text-foreground mb-1">All caught up!</h4>
    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
      No quick actions needed right now. Check back later for new opportunities.
    </p>
  </motion.div>
);

// Loading skeleton
const QuickWinSkeleton = () => (
  <div className="space-y-3">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="p-4 rounded-xl border border-l-4 border-l-muted animate-pulse"
        style={{ animationDelay: `${i * 100}ms` }}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-muted"></div>
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <div className="h-4 w-16 bg-muted rounded"></div>
              <div className="h-4 w-20 bg-muted rounded"></div>
            </div>
            <div className="h-4 w-3/4 bg-muted rounded"></div>
            <div className="h-3 w-1/2 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const QuickWinsSection: React.FC = () => {
  const [quickWins, setQuickWins] = useState<QuickWin[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const navigate = useNavigate();
  
  // Try to use celebration context, with fallback
  let celebration: ReturnType<typeof useCelebrationContext> | null = null;
  try {
    celebration = useCelebrationContext();
  } catch {
    // Context not available, celebrations will be skipped
  }
  useEffect(() => {
    const generateQuickWins = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: orgMember } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();

        if (!orgMember) return;

        const wins: QuickWin[] = [];

        // Check for high-priority insights that are actionable
        const { data: insights } = await supabase
          .from('emissions_insights')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_dismissed', false)
          .eq('is_actioned', false)
          .in('priority', ['high', 'critical'])
          .limit(5);

        insights?.forEach(insight => {
          if (insight.category === 'reduction' || insight.category === 'opportunity') {
            wins.push({
              id: insight.id,
              title: insight.title,
              description: insight.recommendation || 'Review and implement this recommendation',
              estimatedMinutes: 3,
              impact: insight.priority === 'critical' ? 'High' : 'Medium',
              actionLabel: 'Review Insight',
              actionUrl: '/analytics?tab=insights',
              category: 'Reduction'
            });
          }
        });

        // Check for unacknowledged anomalies
        const { data: anomalies } = await supabase
          .from('emissions_anomalies')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_acknowledged', false)
          .eq('severity', 'high')
          .limit(3);

        if (anomalies && anomalies.length > 0) {
          wins.push({
            id: 'acknowledge-anomalies',
            title: 'Acknowledge Data Anomalies',
            description: `${anomalies.length} high-priority anomalies need your attention`,
            estimatedMinutes: 2,
            impact: 'High',
            actionLabel: 'Review Anomalies',
            actionUrl: '/analytics?tab=anomalies',
            category: 'Data Quality'
          });
        }

        // Check for upcoming deadlines needing attention
        const { data: deadlines } = await supabase
          .from('compliance_deadlines')
          .select('*')
          .eq('organization_id', orgMember.organization_id)
          .eq('status', 'pending')
          .lte('due_date', new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString())
          .order('due_date', { ascending: true })
          .limit(1);

        if (deadlines && deadlines.length > 0) {
          const deadline = deadlines[0];
          wins.push({
            id: deadline.id,
            title: 'Update Compliance Progress',
            description: `${deadline.title} is due soon - update completion status`,
            estimatedMinutes: 5,
            impact: 'High',
            actionLabel: 'Update Progress',
            actionUrl: '/enterprise',
            category: 'Compliance'
          });
        }

        // Check for data quality issues
        const { data: qualityData } = await supabase
          .from('quality_tracking')
          .select('overall_score, completeness_score')
          .eq('user_id', user.id)
          .order('metric_date', { ascending: false })
          .limit(1)
          .single();

        if (qualityData && qualityData.overall_score < 80) {
          wins.push({
            id: 'improve-quality',
            title: 'Improve Data Quality',
            description: 'Review missing fields and complete partial entries',
            estimatedMinutes: 4,
            impact: 'Medium',
            actionLabel: 'View Quality Report',
            actionUrl: '/analytics?tab=quality',
            category: 'Data Quality'
          });
        }

        // Check for goals needing updates
        const { data: goals } = await supabase
          .from('goals')
          .select('*')
          .eq('organization_id', orgMember.organization_id)
          .eq('status', 'in_progress')
          .is('progress_percentage', null)
          .limit(1);

        if (goals && goals.length > 0) {
          wins.push({
            id: 'update-goal',
            title: 'Update Goal Progress',
            description: 'Set progress percentage for active goals',
            estimatedMinutes: 3,
            impact: 'Medium',
            actionLabel: 'Update Goals',
            actionUrl: '/goals',
            category: 'Goals'
          });
        }

        // Sort by impact and take top 3
        const prioritized = wins
          .sort((a, b) => {
            const impactOrder = { High: 3, Medium: 2, Low: 1 };
            return impactOrder[b.impact] - impactOrder[a.impact];
          })
          .slice(0, 3);

        setQuickWins(prioritized);
      } catch (error) {
        console.error('Error generating quick wins:', error);
      } finally {
        setLoading(false);
      }
    };

    generateQuickWins();
  }, []);

  const handleAction = (win: QuickWin) => {
    toast.success('Opening action...', {
      description: `${win.title} - Estimated time: ${win.estimatedMinutes} min`
    });
    navigate(win.actionUrl);
  };

  const handleComplete = (win: QuickWin) => {
    setCompletingId(win.id);
    
    // Trigger celebration
    if (celebration) {
      const newCount = completedCount + 1;
      setCompletedCount(newCount);
      
      // Check for streak milestone
      if (newCount >= 3) {
        celebration.celebrateCompletion({
          type: 'milestone',
          title: 'Quick Win Streak!',
          subtitle: `${newCount} actions completed - You're on fire!`,
          isFirstTime: newCount === 3
        });
      } else {
        celebration.celebrateCompletion({
          type: 'quick-win',
          title: win.title,
          isFirstTime: newCount === 1
        });
      }
    }
    
    // Remove card after animation
    setTimeout(() => {
      setQuickWins(prev => prev.filter(w => w.id !== win.id));
      setCompletingId(null);
      toast.success('Quick win completed! 🎉', {
        description: `Great job completing: ${win.title}`
      });
    }, 1000);
  };

  const handleDismiss = (win: QuickWin) => {
    setQuickWins(prev => prev.filter(w => w.id !== win.id));
    toast.info('Quick win dismissed');
  };
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header with gradient */}
      <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 ring-1 ring-inset ring-amber-500/20">
              <Zap className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Quick Wins</h4>
              <p className="text-xs text-muted-foreground">High-impact actions under 5 minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {quickWins.length > 0 && (
              <Badge variant="secondary" className="font-mono">
                {quickWins.length}
              </Badge>
            )}
            <LiveIndicator />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <QuickWinSkeleton />
        ) : quickWins.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {quickWins.map((win, index) => (
                <QuickWinCard
                  key={win.id}
                  win={win}
                  index={index}
                  onAction={handleAction}
                  onDismiss={handleDismiss}
                  onComplete={handleComplete}
                  isCompleting={completingId === win.id}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickWinsSection;
