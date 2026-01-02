import React, { useState, useEffect } from 'react';
import { Target, AlertTriangle, Info, ExternalLink, Lightbulb, TrendingDown, Activity, Bot, Calculator, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Insight {
  id: string;
  category: string;
  priority: string;
  title: string;
  finding: string | null;
  impact: string | null;
  recommendation: string | null;
  generated_at?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
}

// Insight card component
interface InsightCardProps {
  insight: Insight;
  index: number;
  onView: () => void;
  onDismiss?: () => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, index, onView, onDismiss }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'reduction':
        return TrendingDown;
      case 'efficiency':
        return Activity;
      case 'opportunity':
        return Lightbulb;
      case 'risk':
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'critical':
        return {
          border: 'border-l-destructive',
          bg: 'from-destructive/5 to-transparent',
          iconBg: 'bg-destructive/10',
          iconText: 'text-destructive',
          badge: 'destructive' as const
        };
      case 'medium':
        return {
          border: 'border-l-amber-500',
          bg: 'from-amber-500/5 to-transparent',
          iconBg: 'bg-amber-500/10',
          iconText: 'text-amber-600',
          badge: 'secondary' as const
        };
      default:
        return {
          border: 'border-l-primary',
          bg: 'from-primary/5 to-transparent',
          iconBg: 'bg-primary/10',
          iconText: 'text-primary',
          badge: 'outline' as const
        };
    }
  };

  const getInsightSource = (insight: Insight): 'ai' | 'rule-based' => {
    if (insight.metadata && typeof insight.metadata === 'object' && 'source' in insight.metadata) {
      return insight.metadata.source === 'rule-based' ? 'rule-based' : 'ai';
    }
    return 'ai';
  };

  const isRecent = insight.generated_at
    ? new Date().getTime() - new Date(insight.generated_at).getTime() < 60000
    : false;

  const Icon = getCategoryIcon(insight.category);
  const styles = getPriorityStyles(insight.priority);
  const source = getInsightSource(insight);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onView}
      className={`
        relative p-4 rounded-xl border border-l-4 ${styles.border}
        bg-gradient-to-r ${styles.bg}
        transition-all duration-200 cursor-pointer
        hover:shadow-md hover:scale-[1.01] hover:border-primary/30
        ${isRecent ? 'ring-2 ring-primary/20 ring-offset-2' : ''}
      `}
    >
      {/* New badge for recent insights */}
      {isRecent && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2"
        >
          <Badge className="bg-primary text-primary-foreground shadow-lg text-xs">
            New
          </Badge>
        </motion.div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon container */}
        <div className={`p-2.5 rounded-xl ${styles.iconBg} ring-1 ring-inset ring-black/5`}>
          <Icon className={`h-4 w-4 ${styles.iconText}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge variant={styles.badge} className="text-xs">
              {insight.priority}
            </Badge>
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              {source === 'ai' ? (
                <><Bot className="h-3 w-3" /> AI</>
              ) : (
                <><Calculator className="h-3 w-3" /> Stats</>
              )}
            </Badge>
          </div>
          <h5 className="font-medium text-sm mb-1">{insight.title}</h5>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {insight.recommendation || insight.finding || 'View details for more information'}
          </p>
        </div>

        {/* Hover action buttons */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-1"
            >
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
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
                    onDismiss();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
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
      animate={{ rotate: [0, 10, -10, 0] }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4"
    >
      <Lightbulb className="h-8 w-8 text-primary" />
    </motion.div>
    <h4 className="font-medium text-foreground mb-1">No insights yet</h4>
    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
      Add emissions data to receive AI-powered insights and recommendations.
    </p>
  </motion.div>
);

// Loading skeleton
const InsightSkeleton = () => (
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
              <div className="h-4 w-14 bg-muted rounded"></div>
              <div className="h-4 w-12 bg-muted rounded"></div>
            </div>
            <div className="h-4 w-3/4 bg-muted rounded"></div>
            <div className="h-3 w-full bg-muted rounded"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const InsightsNextActions: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch real AI-generated insights
        const { data, error } = await supabase
          .from('emissions_insights')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_dismissed', false)
          .order('priority', { ascending: true })
          .order('generated_at', { ascending: false })
          .limit(3);

        if (error) throw error;

        if (!data || data.length === 0) {
          // If no insights exist, trigger generation
          await supabase.functions.invoke('generate-emissions-insights');
          toast.info('Generating AI insights for your data...');
        } else {
          setInsights(data);
        }
      } catch (error) {
        console.error('Error fetching insights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();

    // Set up real-time subscription
    const channel = supabase
      .channel('insights-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emissions_insights'
        },
        () => {
          fetchInsights();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleViewAll = () => {
    navigate('/analytics?tab=insights');
  };

  const handleDismissInsight = async (insightId: string) => {
    try {
      await supabase
        .from('emissions_insights')
        .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
        .eq('id', insightId);
      
      setInsights(prev => prev.filter(i => i.id !== insightId));
      toast.info('Insight dismissed');
    } catch (error) {
      console.error('Error dismissing insight:', error);
    }
  };

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header with gradient */}
      <div className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-inset ring-primary/20">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">AI Insights & Actions</h4>
              <p className="text-xs text-muted-foreground">Personalized recommendations from your data</p>
            </div>
          </div>
          {insights.length > 0 && (
            <Badge variant="secondary" className="font-mono">
              {insights.length}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <InsightSkeleton />
        ) : insights.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                index={index}
                onView={() => navigate('/analytics?tab=insights')}
                onDismiss={() => handleDismissInsight(insight.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {insights.length > 0 && (
        <div className="px-4 pb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-between hover:bg-primary/5" 
            onClick={handleViewAll}
          >
            View all recommendations
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default InsightsNextActions;
