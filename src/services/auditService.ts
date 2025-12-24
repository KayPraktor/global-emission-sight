import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export type AuditAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'export' 
  | 'view' 
  | 'approve' 
  | 'reject' 
  | 'login' 
  | 'logout'
  | 'submit'
  | 'generate';

export type EntityType = 
  | 'emissions_entry' 
  | 'report' 
  | 'goal' 
  | 'facility' 
  | 'user' 
  | 'approval'
  | 'emission_factor'
  | 'scenario'
  | 'settings';

export interface AuditLog {
  id: string;
  user_id: string | null;
  organization_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Json | null;
  new_values: Json | null;
  metadata: Json | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

export interface AuditLogFilters {
  action?: AuditAction;
  entityType?: EntityType;
  userId?: string;
  startDate?: string;
  endDate?: string;
  entityId?: string;
  searchTerm?: string;
}

class AuditService {
  /**
   * Log an audit event
   */
  async logAction(
    action: AuditAction,
    entityType: EntityType,
    entityId?: string,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>,
    metadata?: Record<string, unknown>
  ): Promise<string | null> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;

      // Get user's organization
      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', userData.user.id)
        .single();

      if (!orgMember) return null;

      const { data, error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: userData.user.id,
          organization_id: orgMember.organization_id,
          action: action as string,
          entity_type: entityType as string,
          entity_id: entityId || null,
          old_values: oldValues || null,
          new_values: newValues || null,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
          },
        })
        .select('id')
        .single();

      if (error) {
        console.error('Failed to log audit event:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('Audit logging error:', error);
      return null;
    }
  }

  /**
   * Get audit logs with filtering
   */
  async getAuditLogs(
    filters: AuditLogFilters = {},
    limit = 50,
    offset = 0
  ): Promise<{ logs: AuditLog[]; total: number }> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (filters.action) {
        query = query.eq('action', filters.action);
      }

      if (filters.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }

      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }

      if (filters.entityId) {
        query = query.eq('entity_id', filters.entityId);
      }

      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      const { data, error, count } = await query
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Fetch user details for the logs
      const userIds = [...new Set((data || []).map(log => log.user_id).filter(Boolean))];
      
      let userMap: Record<string, { email: string; full_name: string }> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email, full_name')
          .in('id', userIds);
        
        if (profiles) {
          userMap = profiles.reduce((acc, p) => {
            acc[p.id] = { email: p.email, full_name: p.full_name };
            return acc;
          }, {} as Record<string, { email: string; full_name: string }>);
        }
      }

      const logs: AuditLog[] = (data || []).map(log => ({
        ...log,
        action: log.action as AuditAction,
        entity_type: log.entity_type as EntityType,
        user_email: log.user_id ? userMap[log.user_id]?.email : undefined,
        user_name: log.user_id ? userMap[log.user_id]?.full_name : undefined,
      }));

      return { logs, total: count || 0 };
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      return { logs: [], total: 0 };
    }
  }

  /**
   * Get history for a specific entity
   */
  async getEntityHistory(
    entityType: EntityType,
    entityId: string
  ): Promise<AuditLog[]> {
    const { logs } = await this.getAuditLogs(
      { entityType, entityId },
      100,
      0
    );
    return logs;
  }

  /**
   * Get recent activity for the current user
   */
  async getMyRecentActivity(limit = 20): Promise<AuditLog[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [];

      const { logs } = await this.getAuditLogs(
        { userId: userData.user.id },
        limit,
        0
      );
      return logs;
    } catch (error) {
      console.error('Failed to fetch user activity:', error);
      return [];
    }
  }

  /**
   * Get audit statistics for dashboard
   */
  async getAuditStats(): Promise<{
    totalActions: number;
    actionsToday: number;
    actionsByType: Record<string, number>;
    topUsers: { userId: string; name: string; count: number }[];
  }> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { logs: allLogs, total } = await this.getAuditLogs({}, 1000, 0);
      
      const todayLogs = allLogs.filter(
        log => new Date(log.created_at) >= today
      );

      const actionsByType: Record<string, number> = {};
      const userCounts: Record<string, { name: string; count: number }> = {};

      allLogs.forEach(log => {
        // Count by action type
        actionsByType[log.action] = (actionsByType[log.action] || 0) + 1;

        // Count by user
        if (log.user_id) {
          if (!userCounts[log.user_id]) {
            userCounts[log.user_id] = {
              name: log.user_name || log.user_email || 'Unknown',
              count: 0,
            };
          }
          userCounts[log.user_id].count++;
        }
      });

      const topUsers = Object.entries(userCounts)
        .map(([userId, data]) => ({ userId, ...data }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalActions: total,
        actionsToday: todayLogs.length,
        actionsByType,
        topUsers,
      };
    } catch (error) {
      console.error('Failed to get audit stats:', error);
      return {
        totalActions: 0,
        actionsToday: 0,
        actionsByType: {},
        topUsers: [],
      };
    }
  }

  /**
   * Export audit logs as CSV
   */
  async exportAuditLogs(filters: AuditLogFilters = {}): Promise<string> {
    const { logs } = await this.getAuditLogs(filters, 10000, 0);

    const headers = [
      'Timestamp',
      'User',
      'Action',
      'Entity Type',
      'Entity ID',
      'Details',
    ];

    const rows = logs.map(log => [
      new Date(log.created_at).toISOString(),
      log.user_name || log.user_email || log.user_id || 'System',
      log.action,
      log.entity_type,
      log.entity_id || '',
      JSON.stringify(log.metadata || {}),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return csvContent;
  }

  /**
   * Get action display label
   */
  getActionLabel(action: AuditAction): string {
    const labels: Record<AuditAction, string> = {
      create: 'Created',
      update: 'Updated',
      delete: 'Deleted',
      export: 'Exported',
      view: 'Viewed',
      approve: 'Approved',
      reject: 'Rejected',
      login: 'Logged In',
      logout: 'Logged Out',
      submit: 'Submitted',
      generate: 'Generated',
    };
    return labels[action] || action;
  }

  /**
   * Get entity type display label
   */
  getEntityTypeLabel(entityType: EntityType): string {
    const labels: Record<EntityType, string> = {
      emissions_entry: 'Emissions Entry',
      report: 'Report',
      goal: 'Goal',
      facility: 'Facility',
      user: 'User',
      approval: 'Approval Request',
      emission_factor: 'Emission Factor',
      scenario: 'Scenario',
      settings: 'Settings',
    };
    return labels[entityType] || entityType;
  }
}

export const auditService = new AuditService();
