import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { getSyncLogs, SyncLog } from '@/services/factorAutoUpdateService';

export function SyncHistoryLog() {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await getSyncLogs();
      setLogs(data);
    } catch (error) {
      console.error('Failed to load logs:', error);
      toast.error('Failed to load sync history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      case 'partial': return 'secondary';
      default: return 'outline';
    }
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
    <Card>
      <CardHeader>
        <CardTitle>Sync History</CardTitle>
        <CardDescription>
          View recent emission factor synchronization operations
        </CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3" />
            <p>No sync history yet</p>
            <p className="text-sm">Sync a data source to see activity here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map(log => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(log.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {log.source?.name || 'Unknown Source'}
                      </span>
                      <Badge variant={getStatusBadgeVariant(log.status)}>
                        {log.status}
                      </Badge>
                      <Badge variant="outline">
                        {log.sync_type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(log.started_at), { addSuffix: true })}
                      {log.duration_ms && (
                        <span className="ml-2">
                          • {(log.duration_ms / 1000).toFixed(1)}s
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm">
                  {log.status === 'completed' ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span>Fetched: <strong className="text-foreground">{log.factors_fetched}</strong></span>
                        <span>New: <strong className="text-green-600">{log.factors_new}</strong></span>
                        <span>Updated: <strong className="text-amber-600">{log.factors_updated}</strong></span>
                      </div>
                    </div>
                  ) : log.status === 'failed' && log.errors ? (
                    <span className="text-red-500 text-xs">
                      {(log.errors as { message?: string }).message || 'Unknown error'}
                    </span>
                  ) : log.status === 'running' ? (
                    <span className="text-blue-500">In progress...</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
