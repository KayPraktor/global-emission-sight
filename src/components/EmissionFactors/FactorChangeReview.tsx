import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Brain,
  FileText,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  getPendingReviews,
  approveReview,
  rejectReview,
  getSignificanceBadgeVariant,
  FactorChangeReview as FactorChangeReviewType
} from '@/services/factorAutoUpdateService';

export function FactorChangeReview() {
  const [reviews, setReviews] = useState<FactorChangeReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<FactorChangeReviewType | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await getPendingReviews();
      setReviews(data);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      toast.error('Failed to load pending reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedReview || !dialogAction) return;

    try {
      setProcessing(selectedReview.id);
      if (dialogAction === 'approve') {
        await approveReview(selectedReview.id, reviewNotes);
        toast.success('Factor update approved and applied');
      } else {
        await rejectReview(selectedReview.id, reviewNotes);
        toast.success('Factor update rejected');
      }
      setReviews(prev => prev.filter(r => r.id !== selectedReview.id));
      setSelectedReview(null);
      setDialogAction(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Action failed:', error);
      toast.error('Failed to process review');
    } finally {
      setProcessing(null);
    }
  };

  const openDialog = (review: FactorChangeReviewType, action: 'approve' | 'reject') => {
    setSelectedReview(review);
    setDialogAction(action);
    setReviewNotes('');
  };

  const getChangeIcon = (change: number | null) => {
    if (!change) return null;
    if (change > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    return <TrendingDown className="h-4 w-4 text-green-500" />;
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Pending Factor Updates
                {reviews.length > 0 && (
                  <Badge variant="secondary">{reviews.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Review AI-analyzed emission factor changes before applying
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p>No pending reviews</p>
              <p className="text-sm">All factor updates have been processed</p>
            </div>
          ) : (
            reviews.map(review => (
              <div
                key={review.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium flex items-center gap-2">
                      {review.factor_name}
                      <Badge variant={getSignificanceBadgeVariant(review.ai_significance)}>
                        {review.ai_significance || 'unknown'}
                      </Badge>
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(review, 'reject')}
                      disabled={processing === review.id}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openDialog(review, 'approve')}
                      disabled={processing === review.id}
                    >
                      {processing === review.id ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      )}
                      Approve
                    </Button>
                  </div>
                </div>

                {/* Value change display */}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Old Value</p>
                    <p className="font-mono font-medium">
                      {review.old_value?.toFixed(4) || 'N/A'}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">New Value</p>
                    <p className="font-mono font-medium">
                      {review.new_value.toFixed(4)}
                    </p>
                  </div>
                  {review.change_percentage && (
                    <div className="flex items-center gap-1 ml-auto">
                      {getChangeIcon(review.change_percentage)}
                      <span className={`font-medium ${
                        review.change_percentage > 0 ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {review.change_percentage > 0 ? '+' : ''}
                        {review.change_percentage.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* AI Analysis */}
                {review.ai_impact_assessment && (
                  <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <Brain className="h-4 w-4 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary">AI Analysis</p>
                      <p className="text-sm text-muted-foreground">
                        {review.ai_impact_assessment}
                      </p>
                      {review.ai_confidence && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Confidence: {review.ai_confidence}%
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Affected entries warning */}
                {review.affected_entries_count > 0 && (
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span>
                      This change will affect {review.affected_entries_count} emission entries
                    </span>
                  </div>
                )}

                {/* Recommendation badge */}
                {review.ai_recommendation && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Recommendation:</span>
                    <Badge variant={
                      review.ai_recommendation === 'auto_apply' ? 'default' :
                      review.ai_recommendation === 'investigate' ? 'destructive' :
                      'secondary'
                    }>
                      {review.ai_recommendation.replace('_', ' ')}
                    </Badge>
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedReview && !!dialogAction} onOpenChange={() => {
        setSelectedReview(null);
        setDialogAction(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'approve' ? 'Approve' : 'Reject'} Factor Update
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'approve'
                ? 'This will apply the new emission factor value to your database.'
                : 'This will reject the update and keep the existing factor value.'}
            </DialogDescription>
          </DialogHeader>

          {selectedReview && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedReview.factor_name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedReview.old_value?.toFixed(4) || 'N/A'} → {selectedReview.new_value.toFixed(4)}
                  {selectedReview.change_percentage && (
                    <span className={
                      selectedReview.change_percentage > 0 ? 'text-red-500' : 'text-green-500'
                    }>
                      {' '}({selectedReview.change_percentage > 0 ? '+' : ''}
                      {selectedReview.change_percentage.toFixed(1)}%)
                    </span>
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Review Notes (optional)</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add any notes about this decision..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedReview(null);
                setDialogAction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant={dialogAction === 'approve' ? 'default' : 'destructive'}
              onClick={handleAction}
              disabled={processing !== null}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : dialogAction === 'approve' ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              {dialogAction === 'approve' ? 'Approve & Apply' : 'Reject Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
