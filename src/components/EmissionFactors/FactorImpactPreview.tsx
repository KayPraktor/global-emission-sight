import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getAllReviews, FactorChangeReview } from '@/services/factorAutoUpdateService';

interface ImpactSummary {
  totalReviews: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  autoAppliedCount: number;
  totalAffectedEntries: number;
  avgChangePercentage: number;
  criticalCount: number;
  highCount: number;
}

export function FactorImpactPreview() {
  const [reviews, setReviews] = useState<FactorChangeReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ImpactSummary | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await getAllReviews(100);
      setReviews(data);
      calculateSummary(data);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      toast.error('Failed to load impact data');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data: FactorChangeReview[]) => {
    const pendingReviews = data.filter(r => r.status === 'pending');
    const changesWithPercentage = data.filter(r => r.change_percentage !== null);
    
    setSummary({
      totalReviews: data.length,
      pendingCount: data.filter(r => r.status === 'pending').length,
      approvedCount: data.filter(r => r.status === 'approved').length,
      rejectedCount: data.filter(r => r.status === 'rejected').length,
      autoAppliedCount: data.filter(r => r.status === 'auto_applied').length,
      totalAffectedEntries: pendingReviews.reduce((sum, r) => sum + r.affected_entries_count, 0),
      avgChangePercentage: changesWithPercentage.length > 0
        ? changesWithPercentage.reduce((sum, r) => sum + Math.abs(r.change_percentage || 0), 0) / changesWithPercentage.length
        : 0,
      criticalCount: data.filter(r => r.ai_significance === 'critical').length,
      highCount: data.filter(r => r.ai_significance === 'high').length,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Impact Overview</CardTitle>
        <CardDescription>
          Summary of emission factor changes and their potential impact
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-muted/50 rounded-lg text-center">
            <p className="text-2xl font-bold">{summary.totalReviews}</p>
            <p className="text-sm text-muted-foreground">Total Changes</p>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg text-center">
            <p className="text-2xl font-bold text-amber-600">{summary.pendingCount}</p>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg text-center">
            <p className="text-2xl font-bold text-green-600">{summary.approvedCount + summary.autoAppliedCount}</p>
            <p className="text-sm text-muted-foreground">Applied</p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg text-center">
            <p className="text-2xl font-bold text-red-600">{summary.rejectedCount}</p>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </div>
        </div>

        {/* Risk Summary */}
        {(summary.criticalCount > 0 || summary.highCount > 0) && (
          <div className="p-4 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h4 className="font-medium">Attention Required</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {summary.criticalCount > 0 && (
                <span className="mr-4">
                  <Badge variant="destructive">{summary.criticalCount} Critical</Badge>
                </span>
              )}
              {summary.highCount > 0 && (
                <span>
                  <Badge variant="secondary">{summary.highCount} High Priority</Badge>
                </span>
              )}
            </p>
          </div>
        )}

        {/* Impact Metrics */}
        <div className="space-y-3">
          <h4 className="font-medium">Impact Metrics</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm text-muted-foreground">Affected Entries (Pending)</span>
              <span className="font-medium">{summary.totalAffectedEntries.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <span className="text-sm text-muted-foreground">Avg. Change Magnitude</span>
              <div className="flex items-center gap-1">
                {summary.avgChangePercentage > 5 ? (
                  <TrendingUp className="h-4 w-4 text-amber-500" />
                ) : summary.avgChangePercentage > 0 ? (
                  <Minus className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-green-500" />
                )}
                <span className="font-medium">{summary.avgChangePercentage.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent High-Impact Changes */}
        {reviews.filter(r => r.status === 'pending' && (r.ai_significance === 'critical' || r.ai_significance === 'high')).length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">High-Impact Pending Changes</h4>
            <div className="space-y-2">
              {reviews
                .filter(r => r.status === 'pending' && (r.ai_significance === 'critical' || r.ai_significance === 'high'))
                .slice(0, 5)
                .map(review => (
                  <div key={review.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{review.factor_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {review.affected_entries_count} entries affected
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={review.ai_significance === 'critical' ? 'destructive' : 'secondary'}>
                        {review.ai_significance}
                      </Badge>
                      {review.change_percentage && (
                        <span className={`text-sm font-mono ${
                          review.change_percentage > 0 ? 'text-red-500' : 'text-green-500'
                        }`}>
                          {review.change_percentage > 0 ? '+' : ''}
                          {review.change_percentage.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
