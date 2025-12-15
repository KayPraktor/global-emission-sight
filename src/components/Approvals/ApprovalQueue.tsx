import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ApprovalStatusBadge } from './ApprovalStatusBadge';
import { ApprovalActions } from './ApprovalActions';
import { approvalService, type EmissionsEntryWithApproval, type ApprovalStatus } from '@/services/approvalService';
import { format } from 'date-fns';
import { CheckCircle, XCircle, Loader2, Filter, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ApprovalQueue() {
  const [entries, setEntries] = useState<EmissionsEntryWithApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'all'>('pending_review');
  const [isBulkLoading, setIsBulkLoading] = useState(false);

  const fetchEntries = async () => {
    setIsLoading(true);
    const data = statusFilter === 'all' 
      ? await approvalService.getEntriesWithApprovalStatus()
      : await approvalService.getEntriesWithApprovalStatus(statusFilter);
    setEntries(data);
    setSelectedIds(new Set());
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, [statusFilter]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingIds = entries
        .filter(e => e.approval_status === 'pending_review')
        .map(e => e.id);
      setSelectedIds(new Set(pendingIds));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    setIsBulkLoading(true);
    const result = await approvalService.bulkApprove(Array.from(selectedIds));
    setIsBulkLoading(false);
    
    if (result.success) {
      toast.success(`${selectedIds.size} entries approved`);
      fetchEntries();
    } else {
      toast.error(result.error || 'Bulk approval failed');
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.size === 0) return;
    const reason = prompt('Please provide a reason for rejecting these entries:');
    if (!reason) return;
    
    setIsBulkLoading(true);
    const result = await approvalService.bulkReject(Array.from(selectedIds), reason);
    setIsBulkLoading(false);
    
    if (result.success) {
      toast.success(`${selectedIds.size} entries rejected`);
      fetchEntries();
    } else {
      toast.error(result.error || 'Bulk rejection failed');
    }
  };

  const pendingEntries = entries.filter(e => e.approval_status === 'pending_review');
  const allPendingSelected = pendingEntries.length > 0 && 
    pendingEntries.every(e => selectedIds.has(e.id));

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'scope_1': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'scope_2': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'scope_3': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default: return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Approval Queue</CardTitle>
            <CardDescription>
              Review and approve emissions data entries submitted by your team
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ApprovalStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entries</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="changes_requested">Changes Requested</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchEntries}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {selectedIds.size > 0 && (
          <div className="mb-4 p-3 bg-muted rounded-lg flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} entry(ies) selected
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={handleBulkApprove}
                disabled={isBulkLoading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isBulkLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                Approve All
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBulkReject}
                disabled={isBulkLoading}
              >
                {isBulkLoading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                Reject All
              </Button>
            </div>
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
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
            <p className="text-lg font-medium">No entries to review</p>
            <p className="text-sm">All caught up! Check back later for new submissions.</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={allPendingSelected}
                      onCheckedChange={handleSelectAll}
                      disabled={pendingEntries.length === 0}
                    />
                  </TableHead>
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
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(entry.id)}
                        onCheckedChange={(checked) => handleSelectOne(entry.id, !!checked)}
                        disabled={entry.approval_status !== 'pending_review'}
                      />
                    </TableCell>
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
                      <ApprovalStatusBadge status={entry.approval_status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {entry.submitted_at 
                        ? format(new Date(entry.submitted_at), 'MMM d, HH:mm')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.approval_status === 'pending_review' ? (
                        <ApprovalActions
                          entryId={entry.id}
                          onActionComplete={fetchEntries}
                          compact
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {entry.review_notes ? `"${entry.review_notes.slice(0, 30)}..."` : '-'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
