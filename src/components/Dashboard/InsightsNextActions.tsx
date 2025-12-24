import React, { useState, useEffect } from 'react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Target, AlertTriangle, Info, ExternalLink, Lightbulb, TrendingDown, Activity, Bot, Calculator } from 'lucide-react';
import { DataFreshness } from '@/components/ui/data-freshness';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Insight {
  id: string;
  category: string;
  priority: string;
  title: string;
  finding: string | null;
  impact: string | null;
  recommendation: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
}

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

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getInsightSource = (insight: Insight): 'ai' | 'rule-based' => {
    if (insight.metadata && typeof insight.metadata === 'object' && 'source' in insight.metadata) {
      return insight.metadata.source === 'rule-based' ? 'rule-based' : 'ai';
    }
    return 'ai';
  };

  const handleViewAll = () => {
    navigate('/analytics?tab=insights');
  };

  if (loading) {
    return (
      <GlassmorphismCard variant="light" className="p-6 space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </GlassmorphismCard>
    );
  }

  return (
    <GlassmorphismCard variant="light" className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Lightbulb className="h-5 w-5 text-primary" />
          <div>
            <h4 className="font-medium">AI Insights & Actions</h4>
            <p className="text-sm text-muted-foreground">Personalized recommendations from your data</p>
          </div>
        </div>
        <DataFreshness lastUpdated={new Date()} />
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Add emissions data to receive AI-powered insights</p>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {insights.map((insight) => {
              const Icon = getCategoryIcon(insight.category);
              return (
                <li key={insight.id} className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate('/analytics?tab=insights')}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{insight.title}</div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {insight.recommendation || insight.finding || 'View details for more information'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getPriorityColor(insight.priority)} className="flex-shrink-0">
                      {insight.priority}
                    </Badge>
                    <Badge variant="outline" className="flex-shrink-0 text-xs">
                      {getInsightSource(insight) === 'ai' ? (
                        <><Bot className="h-3 w-3 mr-1" /> AI</>
                      ) : (
                        <><Calculator className="h-3 w-3 mr-1" /> Stats</>
                      )}
                    </Badge>
            <Button variant="ghost" size="sm" className="w-full justify-between" onClick={handleViewAll}>
              View all {insights.length} recommendations
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </GlassmorphismCard>
  );
};

export default InsightsNextActions;
