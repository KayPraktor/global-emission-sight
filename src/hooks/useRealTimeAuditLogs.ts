import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { auditService, AuditLog, AuditLogFilters } from '@/services/auditService';

interface UseRealTimeAuditLogsOptions {
  filters?: AuditLogFilters;
  limit?: number;
  offset?: number;
  enabled?: boolean;
}

interface UseRealTimeAuditLogsResult {
  logs: AuditLog[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  newLogCount: number;
  clearNewLogCount: () => void;
}

/**
 * Hook to subscribe to real-time audit log updates
 */
export const useRealTimeAuditLogs = ({
  filters = {},
  limit = 50,
  offset = 0,
  enabled = true,
}: UseRealTimeAuditLogsOptions = {}): UseRealTimeAuditLogsResult => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newLogCount, setNewLogCount] = useState(0);

  const fetchLogs = useCallback(async () => {
    if (!enabled) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const result = await auditService.getAuditLogs(filters, limit, offset);
      setLogs(result.logs);
      setTotal(result.total);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch audit logs');
    } finally {
      setIsLoading(false);
    }
  }, [filters, limit, offset, enabled]);

  const clearNewLogCount = useCallback(() => {
    setNewLogCount(0);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    
    fetchLogs();

    // Set up real-time subscription
    const channel = supabase
      .channel('audit-logs-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'audit_logs',
        },
        async (payload) => {
          // Increment new log counter
          setNewLogCount((prev) => prev + 1);

          // Fetch user details for the new log
          const newLog = payload.new as AuditLog;
          
          // If we're on page 0 and no filters that would exclude this log
          if (offset === 0) {
            // Fetch user profile for the new log
            if (newLog.user_id) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('email, full_name')
                .eq('id', newLog.user_id)
                .single();

              if (profile) {
                newLog.user_email = profile.email;
                newLog.user_name = profile.full_name;
              }
            }

            // Check if log matches current filters
            const matchesFilters = checkLogMatchesFilters(newLog, filters);
            
            if (matchesFilters) {
              setLogs((prevLogs) => {
                // Add new log at the beginning, remove last if exceeds limit
                const updatedLogs = [newLog, ...prevLogs];
                if (updatedLogs.length > limit) {
                  updatedLogs.pop();
                }
                return updatedLogs;
              });
              setTotal((prev) => prev + 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, offset, limit, filters, fetchLogs]);

  return {
    logs,
    total,
    isLoading,
    error,
    refetch: fetchLogs,
    newLogCount,
    clearNewLogCount,
  };
};

/**
 * Check if a log entry matches the current filters
 */
function checkLogMatchesFilters(log: AuditLog, filters: AuditLogFilters): boolean {
  if (filters.action && log.action !== filters.action) {
    return false;
  }
  if (filters.entityType && log.entity_type !== filters.entityType) {
    return false;
  }
  if (filters.userId && log.user_id !== filters.userId) {
    return false;
  }
  if (filters.entityId && log.entity_id !== filters.entityId) {
    return false;
  }
  if (filters.startDate && new Date(log.created_at) < new Date(filters.startDate)) {
    return false;
  }
  if (filters.endDate && new Date(log.created_at) > new Date(filters.endDate)) {
    return false;
  }
  return true;
}
