import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ApprovalStatusBadge } from './ApprovalStatusBadge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { FileEdit, Send, RefreshCw, MessageSquare, Filter, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { approvalService, type ApprovalStatus } from '@/services/approvalService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface SubmissionEntry {
  id: string;
  entry_date: string;
  scope: string;
  category: string;
  quantity: number;
  unit: string;
  approval_status: ApprovalStatus | null;
  submitted_at: string | null;
  review_notes: string | null;
  created_at: string;
}

export function MySubmissions() {
  const [entries, setEntries] = useState<SubmissionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEntry, setSelectedEntry] = useState<SubmissionEntry | null>(null);
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [resubmitMessage, setResubmitMessage] = useState('');
  const [viewingFeedback, setViewingFeedback] = useState<SubmissionEntry | null>(null);

  const fetchMySubmissions = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('emissions_entries')
        .select('id, entry_date, scope, category, quantity, unit, approval_status, submitted_at, review_notes, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('approval_status', statusFilter as ApprovalStatus);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching submissions:', error);
        toast.error('Failed to load submissions');
        return;
      }

      setEntries((data || []) as SubmissionEntry[]);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMySubmissions();
  }, [statusFilter]);

  const handleResubmit = async () => {
    if (!selectedEntry) return;
    
    setIsResubmitting(true);
    try {
      const result = await approvalService.submitForReview(selectedEntry.id, resubmitMessage);
      
      if (result.success) {
        toast.success('Entry resubmitted for review');
        setSelectedEntry(null);
        setResubmitMessage('');
        fetchMySubmissions();
      } else {
        toast.error(result.error || 'Failed to resubmit');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsResubmitting(false);
    }
  };

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'scope_1': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'scope_2': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'scope_3': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return '';
    }
  };

  const getStatusCounts = () => {
    const counts = {
      all: entries.length,
      draft: entries.filter(e => e.approval_status === 'draft').length,
      pending_review: entries.filter(e => e.approval_status === 'pending_review').length,
      changes_requested: entries.filter(e => e.approval_status === 'changes_requested').length,
      approved: entries.filter(e => e.approval_status === 'approved').length,
      rejected: entries.filter(e => e.approval_status === 'rejected').length,
    };
    return counts;
  };

  const counts = getStatusCounts();

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Submissions</CardTitle>
              <CardDescription>
                Track the status of your emissions data entries
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ({counts.all})</SelectItem>
                  <SelectItem value="draft">Draft ({counts.draft})</SelectItem>
                  <SelectItem value="pending_review">Pending ({counts.pending_review})</SelectItem>
                  <SelectItem value="changes_requested">Changes Requested ({counts.changes_requested})</SelectItem>
                  <SelectItem value="approved">Approved ({counts.approved})</SelectItem>
                  <SelectItem value="rejected">Rejected ({counts.rejected})</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={fetchMySubmissions}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Status Summary Cards */}
          {counts.changes_requested > 0 && (
            <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">
                  {counts.changes_requested} {counts.changes_requested === 1 ? 'entry requires' : 'entries require'} your attention
                </span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Review the feedback and resubmit with the requested changes.
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileEdit className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No submissions yet</p>
              <p className="text-sm">Your emissions data entries will appear here.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {format(new Date(entry.entry_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getScopeColor(entry.scope)}>
                          {entry.scope.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{entry.category}</TableCell>
                      <TableCell className="text-right font-mono">
                        {entry.quantity.toLocaleString()} {entry.unit}
                      </TableCell>
                      <TableCell>
                        <ApprovalStatusBadge status={entry.approval_status || 'draft'} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {entry.submitted_at 
                          ? format(new Date(entry.submitted_at), 'MMM d, HH:mm')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Feedback button for entries with review notes */}
                          {entry.review_notes && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setViewingFeedback(entry)}
                              className="gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              Feedback
                            </Button>
                          )}
                          
                          {/* Resubmit button for changes_requested or rejected */}
                          {(entry.approval_status === 'changes_requested' || entry.approval_status === 'rejected') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedEntry(entry)}
                              className="gap-1"
                            >
                              <Send className="h-4 w-4" />
                              Resubmit
                            </Button>
                          )}
                          
                          {/* Submit button for drafts */}
                          {entry.approval_status === 'draft' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedEntry(entry)}
                              className="gap-1"
                            >
                              <Send className="h-4 w-4" />
                              Submit
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resubmit Dialog */}
      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEntry?.approval_status === 'draft' ? 'Submit for Review' : 'Resubmit Entry'}
            </DialogTitle>
            <DialogDescription>
              {selectedEntry?.approval_status === 'changes_requested' 
                ? 'Address the reviewer feedback and resubmit for approval.'
                : 'Submit this entry for supervisor review.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedEntry?.review_notes && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Previous Feedback:</p>
              <p className="text-sm text-muted-foreground">{selectedEntry.review_notes}</p>
            </div>
          )}
          
          <div className="py-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a note for the reviewer..."
              value={resubmitMessage}
              onChange={(e) => setResubmitMessage(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedEntry(null)} disabled={isResubmitting}>
              Cancel
            </Button>
            <Button onClick={handleResubmit} disabled={isResubmitting}>
              {isResubmitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Feedback Dialog */}
      <Dialog open={!!viewingFeedback} onOpenChange={() => setViewingFeedback(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reviewer Feedback</DialogTitle>
            <DialogDescription>
              Feedback for your {viewingFeedback?.category} entry from {viewingFeedback?.entry_date ? format(new Date(viewingFeedback.entry_date), 'MMM d, yyyy') : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{viewingFeedback?.review_notes}</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingFeedback(null)}>
              Close
            </Button>
            {(viewingFeedback?.approval_status === 'changes_requested' || viewingFeedback?.approval_status === 'rejected') && (
              <Button onClick={() => {
                setSelectedEntry(viewingFeedback);
                setViewingFeedback(null);
              }}>
                Resubmit Entry
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
