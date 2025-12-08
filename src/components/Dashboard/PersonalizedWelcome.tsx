import React, { useState, useEffect } from 'react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Target, Shield, TrendingUp, ChevronRight, Sparkles, Factory, Zap, Landmark, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { industries, getIndustryTip } from '@/data/industryConfig';

interface WelcomeMessage {
  priority: 'compliance' | 'quality' | 'goal' | 'default';
  greeting: string;
  message: string;
  urgentItem?: string;
  actionLabel: string;
  actionUrl: string;
  icon: React.ElementType;
  severity: 'error' | 'warning' | 'info';
}

const PersonalizedWelcome: React.FC = () => {
  const [welcomeMessage, setWelcomeMessage] = useState<WelcomeMessage | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [industryTip, setIndustryTip] = useState<string | null>(null);
  const [industryName, setIndustryName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const generateWelcomeMessage = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        setUserName(profile?.full_name?.split(' ')[0] || 'there');

        const { data: orgMember } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();

        if (!orgMember) return;

        // Get organization industry for personalized tips
        const { data: orgData } = await supabase
          .from('organizations')
          .select('industry, sub_industry')
          .eq('id', orgMember.organization_id)
          .single();

        if (orgData?.industry) {
          const tip = getIndustryTip(orgData.industry);
          setIndustryTip(tip);
          const industryConfig = industries.find(i => i.id === orgData.industry);
          setIndustryName(industryConfig?.name || null);
        }

        // Check 1: Urgent compliance deadlines (within 7 days)
        const { data: urgentDeadlines } = await supabase
          .from('compliance_deadlines')
          .select('*')
          .eq('organization_id', orgMember.organization_id)
          .in('status', ['pending', 'in-progress'])
          .gte('due_date', new Date().toISOString())
          .lte('due_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('due_date', { ascending: true })
          .limit(1);

        if (urgentDeadlines && urgentDeadlines.length > 0) {
          const deadline = urgentDeadlines[0];
          const daysUntil = formatDistanceToNow(new Date(deadline.due_date), { addSuffix: false });
          setWelcomeMessage({
            priority: 'compliance',
            greeting: `Urgent: Compliance Deadline Approaching`,
            message: `Your ${deadline.title} deadline is coming up in ${daysUntil}. Let's make sure you're on track.`,
            urgentItem: deadline.title,
            actionLabel: 'Review Compliance',
            actionUrl: '/enterprise',
            icon: Shield,
            severity: 'error'
          });
          setLoading(false);
          return;
        }

        // Check 2: Critical data quality issues
        const { data: qualityData } = await supabase
          .from('quality_tracking')
          .select('overall_score, critical_issues, warnings')
          .eq('user_id', user.id)
          .order('metric_date', { ascending: false })
          .limit(1)
          .single();

        if (qualityData && (qualityData.overall_score < 70 || (qualityData.critical_issues || 0) > 0)) {
          setWelcomeMessage({
            priority: 'quality',
            greeting: `Data Quality Needs Attention`,
            message: `Your data quality score is at ${qualityData.overall_score}%. ${qualityData.critical_issues || 0} critical issues need immediate attention to ensure accurate reporting.`,
            urgentItem: `${qualityData.critical_issues || 0} critical issues`,
            actionLabel: 'Fix Quality Issues',
            actionUrl: '/analytics?tab=quality',
            icon: AlertTriangle,
            severity: 'warning'
          });
          setLoading(false);
          return;
        }

        // Check 3: At-risk goals
        const { data: atRiskGoals } = await supabase
          .from('goals')
          .select('*')
          .eq('organization_id', orgMember.organization_id)
          .eq('status', 'at_risk')
          .order('target_date', { ascending: true })
          .limit(1);

        if (atRiskGoals && atRiskGoals.length > 0) {
          const goal = atRiskGoals[0];
          setWelcomeMessage({
            priority: 'goal',
            greeting: `Goal At Risk`,
            message: `Your goal "${goal.title}" is at risk of missing its target. Current progress: ${goal.progress_percentage || 0}%. Let's get it back on track.`,
            urgentItem: goal.title,
            actionLabel: 'Review Goals',
            actionUrl: '/goals',
            icon: Target,
            severity: 'warning'
          });
          setLoading(false);
          return;
        }

        // Default: Positive message
        const { count: totalEmissions } = await supabase
          .from('emissions_entries')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', orgMember.organization_id);

        setWelcomeMessage({
          priority: 'default',
          greeting: `Everything's Looking Good`,
          message: `You're tracking ${totalEmissions || 0} emissions entries. Keep up the great work on your carbon management journey!`,
          actionLabel: 'View Dashboard',
          actionUrl: '/',
          icon: TrendingUp,
          severity: 'info'
        });
      } catch (error) {
        console.error('Error generating welcome message:', error);
      } finally {
        setLoading(false);
      }
    };

    generateWelcomeMessage();
  }, []);

  if (loading || !welcomeMessage) {
    return (
      <GlassmorphismCard variant="light" className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </div>
      </GlassmorphismCard>
    );
  }

  const Icon = welcomeMessage.icon;
  const getBgGradient = () => {
    switch (welcomeMessage.severity) {
      case 'error':
        return 'from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20';
      case 'warning':
        return 'from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20';
      default:
        return 'from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20';
    }
  };

  const getIconColor = () => {
    switch (welcomeMessage.severity) {
      case 'error':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-3"
    >
      <GlassmorphismCard variant="light" className={`p-6 bg-gradient-to-r ${getBgGradient()} border-2`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            <div className={`p-3 rounded-lg bg-background/50 ${getIconColor()}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold">
                  Welcome back, {userName}! <Sparkles className="h-4 w-4 inline text-primary" />
                </h3>
                {welcomeMessage.severity !== 'info' && (
                  <Badge variant={welcomeMessage.severity === 'error' ? 'destructive' : 'secondary'}>
                    {welcomeMessage.severity === 'error' ? 'Urgent' : 'Attention Needed'}
                  </Badge>
                )}
              </div>
              <h4 className="font-medium text-foreground mb-1">{welcomeMessage.greeting}</h4>
              <p className="text-sm text-muted-foreground">{welcomeMessage.message}</p>
              {welcomeMessage.urgentItem && (
                <div className="mt-3 p-2 bg-background/50 rounded border inline-block">
                  <p className="text-xs font-medium">Priority: {welcomeMessage.urgentItem}</p>
                </div>
              )}
            </div>
          </div>
          <Button
            onClick={() => navigate(welcomeMessage.actionUrl)}
            variant={welcomeMessage.severity === 'error' ? 'default' : 'outline'}
            className="flex-shrink-0"
          >
            {welcomeMessage.actionLabel}
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </GlassmorphismCard>

      {/* Industry Tip */}
      {industryTip && industryName && welcomeMessage.severity === 'info' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
            <Factory className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground">{industryName} Tip</p>
              <p className="text-sm">{industryTip}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PersonalizedWelcome;
