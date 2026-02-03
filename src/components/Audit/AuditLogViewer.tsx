import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Download,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Eye,
  Radio,
} from 'lucide-react';
import {
  auditService,
  AuditLog,
  AuditLogFilters,
  AuditAction,
  EntityType,
} from '@/services/auditService';
import { toast } from 'sonner';
import { EntityHistoryPanel } from './EntityHistoryPanel';
import { useRealTimeAuditLogs } from '@/hooks/useRealTimeAuditLogs';

const ITEMS_PER_PAGE = 20;

const actionColors: Record<AuditAction, string> = {
  create: 'bg-green-500/10 text-green-600 border-green-500/20',
  update: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  delete: 'bg-red-500/10 text-red-600 border-red-500/20',
  export: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  view: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  approve: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  reject: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  login: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  logout: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  submit: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  generate: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
};

export const AuditLogViewer: React.FC = () => {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Use real-time hook for audit logs
  const {
    logs,
    total,
    isLoading: loading,
    refetch: fetchLogs,
    newLogCount,
    clearNewLogCount,
  } = useRealTimeAuditLogs({
    filters,
    limit: ITEMS_PER_PAGE,
    offset: page * ITEMS_PER_PAGE,
  });

  // Clear new log count when page changes
  React.useEffect(() => {
    clearNewLogCount();
  }, [page, clearNewLogCount]);

  const handleExport = async () => {
    try {
      const csv = await auditService.exportAuditLogs(filters);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Audit logs exported');
    } catch (error) {
      toast.error('Failed to export logs');
    }
  };

  const handleFilterChange = (key: keyof AuditLogFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
    }));
    setPage(0);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-semibold">Audit Trail</CardTitle>
            {newLogCount > 0 && (
              <Badge variant="default" className="animate-pulse bg-green-500">
                <Radio className="h-3 w-3 mr-1" />
                {newLogCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm" onClick={fetchLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>

        {showFilters && (
          <div className="px-6 pb-4 border-b">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Action</label>
                <Select
                  value={filters.action || 'all'}
                  onValueChange={(v) => handleFilterChange('action', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All actions</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="export">Export</SelectItem>
                    <SelectItem value="approve">Approve</SelectItem>
                    <SelectItem value="reject">Reject</SelectItem>
                    <SelectItem value="submit">Submit</SelectItem>
                    <SelectItem value="generate">Generate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Entity Type</label>
                <Select
                  value={filters.entityType || 'all'}
                  onValueChange={(v) => handleFilterChange('entityType', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="emissions_entry">Emissions Entry</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                    <SelectItem value="goal">Goal</SelectItem>
                    <SelectItem value="facility">Facility</SelectItem>
                    <SelectItem value="approval">Approval</SelectItem>
                    <SelectItem value="scenario">Scenario</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Start Date</label>
                <Input
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">End Date</label>
                <Input
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit logs found</p>
              <p className="text-sm">Audit logs will appear here as actions are performed</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">
                        {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {log.user_name || 'Unknown'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {log.user_email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={actionColors[log.action as AuditAction] || ''}
                        >
                          {auditService.getActionLabel(log.action as AuditAction)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {auditService.getEntityTypeLabel(log.entity_type as EntityType)}
                        </span>
                        {log.entity_id && (
                          <span className="text-xs text-muted-foreground block font-mono">
                            {log.entity_id.slice(0, 8)}...
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <span className="text-sm text-muted-foreground truncate block">
                          {log.metadata ? 
                            JSON.stringify(log.metadata).slice(0, 50) + '...' : 
                            '-'
                          }
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {page * ITEMS_PER_PAGE + 1} to{' '}
                  {Math.min((page + 1) * ITEMS_PER_PAGE, total)} of {total} entries
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">
                    Page {page + 1} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {selectedLog && (
        <EntityHistoryPanel
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};
