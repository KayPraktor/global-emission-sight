import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Lightbulb, TrendingDown, AlertCircle, CheckCircle2, X, RefreshCw, Bot, Calculator } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Insight {
  id: string;
  category: string;
  priority: string;
  title: string;
  finding: string;
  impact: string;
  recommendation: string;
  expected_benefit: string;
  timeframe: string;
  is_dismissed: boolean;
  is_actioned: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
}

const getInsightSourceFromMetadata = (metadata: unknown): 'ai' | 'rule-based' => {
  if (metadata && typeof metadata === 'object' && 'source' in metadata) {
    return (metadata as { source?: string }).source === 'rule-based' ? 'rule-based' : 'ai';
  }
  return 'ai';
};

export function AIInsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [lastSource, setLastSource] = useState<'ai' | 'rule-based' | null>(null);

  useEffect(() => {
    loadInsights();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('insights')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emissions_insights' }, () => {
        loadInsights();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadInsights = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('emissions_insights')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_dismissed', false)
        .order('priority', { ascending: false })
        .order('generated_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInsights = async () => {
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to generate insights');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-emissions-insights`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const data = await response.json();
      setLastSource(data.source || 'ai');
      
      await loadInsights();
      
      if (data.source === 'rule-based') {
        toast.success('Insights generated using statistical analysis');
      } else {
        toast.success('AI insights generated successfully');
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate insights');
    } finally {
      setGenerating(false);
    }
  };

  const getInsightSource = (insight: Insight): 'ai' | 'rule-based' => {
    return getInsightSourceFromMetadata(insight.metadata);
  };

  const handleDismiss = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('emissions_insights')
        .update({ is_dismissed: true, dismissed_at: new Date().toISOString() })
        .eq('id', insightId);

      if (error) throw error;
      setInsights(prev => prev.filter(i => i.id !== insightId));
      toast.success('Insight dismissed');
    } catch (error) {
      console.error('Error dismissing insight:', error);
      toast.error('Failed to dismiss insight');
    }
  };

  const handleMarkActioned = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('emissions_insights')
        .update({ is_actioned: true, actioned_at: new Date().toISOString() })
        .eq('id', insightId);

      if (error) throw error;
      setInsights(prev => prev.map(i => i.id === insightId ? { ...i, is_actioned: true } : i));
      toast.success('Marked as actioned');
    } catch (error) {
      console.error('Error updating insight:', error);
      toast.error('Failed to update insight');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'efficiency': return <TrendingDown className="h-4 w-4" />;
      case 'reduction': return <TrendingDown className="h-4 w-4" />;
      case 'risk': return <AlertCircle className="h-4 w-4" />;
      case 'opportunity': return <Lightbulb className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI-Powered Insights
              {lastSource && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {lastSource === 'ai' ? (
                          <><Bot className="h-3 w-3 mr-1" /> AI</>
                        ) : (
                          <><Calculator className="h-3 w-3 mr-1" /> Statistical</>
                        )}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      {lastSource === 'ai' 
                        ? 'Generated using AI analysis'
                        : 'Generated using rule-based statistical analysis'}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </CardTitle>
            <CardDescription>
              Personalized recommendations based on your emissions data
            </CardDescription>
          </div>
          <Button
            onClick={handleGenerateInsights}
            disabled={generating}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
            Generate Insights
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              No insights available yet. Click "Generate Insights" to analyze your emissions data.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => (
              <Collapsible key={insight.id}>
                <Card className={insight.is_actioned ? 'opacity-60' : ''}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="mt-1">
                            {getCategoryIcon(insight.category)}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={getPriorityColor(insight.priority)}>
                                {insight.priority}
                              </Badge>
                              <Badge variant="outline">{insight.category}</Badge>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge variant="secondary" className="text-xs">
                                      {getInsightSource(insight) === 'ai' ? (
                                        <><Bot className="h-3 w-3 mr-1" /> AI</>
                                      ) : (
                                        <><Calculator className="h-3 w-3 mr-1" /> Stats</>
                                      )}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {getInsightSource(insight) === 'ai'
                                      ? 'AI-generated insight'
                                      : 'Rule-based statistical insight'}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              {insight.is_actioned && (
                                <Badge variant="secondary">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Actioned
                                </Badge>
                              )}
                            </div>
                            <h4 className="font-semibold">{insight.title}</h4>
                            <CollapsibleTrigger asChild>
                              <Button variant="link" className="h-auto p-0 text-sm">
                                View details →
                              </Button>
                            </CollapsibleTrigger>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!insight.is_actioned && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkActioned(insight.id)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDismiss(insight.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <CollapsibleContent className="space-y-3 pt-2">
                        <div className="pl-7 space-y-2 text-sm">
                          <div>
                            <p className="font-medium text-muted-foreground">Finding:</p>
                            <p>{insight.finding}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Impact:</p>
                            <p>{insight.impact}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Recommendation:</p>
                            <p>{insight.recommendation}</p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div>
                              <p className="font-medium text-muted-foreground">Expected Benefit:</p>
                              <p className="text-green-600 font-semibold">{insight.expected_benefit}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-muted-foreground">Timeframe:</p>
                              <p>{insight.timeframe}</p>
                            </div>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </CardContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
