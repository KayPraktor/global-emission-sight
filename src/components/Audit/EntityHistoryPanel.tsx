import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Clock,
  User,
  FileText,
  ArrowRight,
  History,
} from 'lucide-react';
import {
  auditService,
  AuditLog,
  AuditAction,
  EntityType,
} from '@/services/auditService';

interface EntityHistoryPanelProps {
  log: AuditLog;
  onClose: () => void;
}

export const EntityHistoryPanel: React.FC<EntityHistoryPanelProps> = ({
  log,
  onClose,
}) => {
  const [history, setHistory] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (log.entity_id) {
      fetchHistory();
    }
  }, [log.entity_id]);

  const fetchHistory = async () => {
    if (!log.entity_id) return;
    setLoading(true);
    try {
      const logs = await auditService.getEntityHistory(
        log.entity_type as EntityType,
        log.entity_id
      );
      setHistory(logs);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderJsonDiff = (oldVal: unknown, newVal: unknown) => {
    if (!oldVal && !newVal) return null;

    const oldObj = typeof oldVal === 'object' ? oldVal : {};
    const newObj = typeof newVal === 'object' ? newVal : {};

    const allKeys = new Set([
      ...Object.keys(oldObj || {}),
      ...Object.keys(newObj || {}),
    ]);

    return (
      <div className="space-y-2">
        {Array.from(allKeys).map((key) => {
          const oldValue = (oldObj as Record<string, unknown>)?.[key];
          const newValue = (newObj as Record<string, unknown>)?.[key];
          const changed = JSON.stringify(oldValue) !== JSON.stringify(newValue);

          if (!changed) return null;

          return (
            <div key={key} className="text-sm">
              <span className="font-medium text-muted-foreground">{key}:</span>
              <div className="flex items-center gap-2 ml-4 mt-1">
                <span className="text-red-500 line-through text-xs font-mono bg-red-500/10 px-2 py-1 rounded">
                  {oldValue !== undefined ? JSON.stringify(oldValue) : 'null'}
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <span className="text-green-500 text-xs font-mono bg-green-500/10 px-2 py-1 rounded">
                  {newValue !== undefined ? JSON.stringify(newValue) : 'null'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Sheet open={true} onOpenChange={() => onClose()}>
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Log Details
          </SheetTitle>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history" disabled={!log.entity_id}>
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-6 pr-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Timestamp</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(log.created_at), 'PPpp')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">User</p>
                      <p className="text-sm text-muted-foreground">
                        {log.user_name || log.user_email || log.user_id || 'System'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Action</p>
                      <Badge variant="outline" className="mt-1">
                        {auditService.getActionLabel(log.action as AuditAction)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Entity Info */}
                <div className="space-y-2">
                  <h4 className="font-medium">Entity Information</h4>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <span>{auditService.getEntityTypeLabel(log.entity_type as EntityType)}</span>
                    </div>
                    {log.entity_id && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">ID:</span>
                        <span className="font-mono text-xs">{log.entity_id}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Changes */}
                {(log.old_values || log.new_values) && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium">Changes</h4>
                      <div className="bg-muted/50 rounded-lg p-3">
                        {renderJsonDiff(log.old_values, log.new_values)}
                      </div>
                    </div>
                  </>
                )}

                {/* Metadata */}
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="font-medium">Additional Details</h4>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <pre className="text-xs font-mono whitespace-pre-wrap overflow-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <ScrollArea className="h-[calc(100vh-200px)]">
              {loading ? (
                <div className="space-y-3 pr-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No history available</p>
                </div>
              ) : (
                <div className="space-y-3 pr-4">
                  {history.map((historyLog, index) => (
                    <div
                      key={historyLog.id}
                      className={`relative pl-6 pb-4 ${
                        index < history.length - 1 ? 'border-l-2 border-muted ml-2' : ''
                      }`}
                    >
                      <div className="absolute -left-[5px] top-0 w-3 h-3 rounded-full bg-primary" />
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {auditService.getActionLabel(historyLog.action as AuditAction)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(historyLog.created_at), 'MMM dd, HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          by {historyLog.user_name || historyLog.user_email || 'Unknown'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
