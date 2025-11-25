import React, { useState, useEffect } from 'react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

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

const QuickWinsSection: React.FC = () => {
  const [quickWins, setQuickWins] = useState<QuickWin[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Medium':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <GlassmorphismCard variant="light" className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-24 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </GlassmorphismCard>
    );
  }

  return (
    <GlassmorphismCard variant="light" className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-amber-100">
          <Zap className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h4 className="font-medium">Quick Wins</h4>
          <p className="text-sm text-muted-foreground">High-impact actions you can complete in under 5 minutes</p>
        </div>
      </div>

      {quickWins.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Great job! No quick actions needed right now.</p>
          <p className="text-xs mt-1">Check back later for new opportunities.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quickWins.map((win, index) => (
            <motion.div
              key={win.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-lg border bg-gradient-to-r from-background to-accent/10 hover:border-primary/50 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">
                      {win.category}
                    </Badge>
                    <Badge className={`text-xs border ${getImpactColor(win.impact)}`}>
                      {win.impact} Impact
                    </Badge>
                  </div>
                  <h5 className="font-medium mb-1">{win.title}</h5>
                  <p className="text-sm text-muted-foreground mb-3">{win.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{win.estimatedMinutes} min</span>
                    <TrendingUp className="h-3 w-3 ml-2" />
                    <span>Quick win</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAction(win)}
                  className="flex-shrink-0"
                >
                  {win.actionLabel}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </GlassmorphismCard>
  );
};

export default QuickWinsSection;
