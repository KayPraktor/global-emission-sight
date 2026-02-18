/**
 * @file useDashboardData
 * @description Custom hook that encapsulates all data-fetching and real-time
 * subscription logic for the main dashboard (Index.tsx).
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { analyticsService, AnalyticsSummary } from '@/services/analyticsService';
import { complianceTrackingService, FrameworkStatus, UpcomingDeadline } from '@/services/complianceTrackingService';

export interface DashboardData {
  isLoading: boolean;
  analyticsData: AnalyticsSummary | null;
  frameworkStatuses: FrameworkStatus[];
  deadlines: UpcomingDeadline[];
}

/**
 * Fetches analytics, compliance statuses, and deadlines on mount, then
 * subscribes to real-time changes on `emissions_entries` to auto-refresh.
 *
 * @param monthsBack - Number of months of history to fetch (default 6)
 * @returns {DashboardData}
 */
export const useDashboardData = (monthsBack = 6): DashboardData => {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummary | null>(null);
  const [frameworkStatuses, setFrameworkStatuses] = useState<FrameworkStatus[]>([]);
  const [deadlines, setDeadlines] = useState<UpcomingDeadline[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const data = await analyticsService.getAnalyticsSummary(monthsBack);
        setAnalyticsData(data);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: membership } = await supabase
            .from('organization_members')
            .select('organization_id')
            .eq('user_id', user.id)
            .limit(1)
            .maybeSingle();

          if (membership?.organization_id) {
            const [statuses, deadlineData] = await Promise.allSettled([
              complianceTrackingService.getFrameworkStatuses(membership.organization_id),
              complianceTrackingService.getUpcomingDeadlines(membership.organization_id),
            ]);
            if (statuses.status === 'fulfilled') setFrameworkStatuses(statuses.value);
            if (deadlineData.status === 'fulfilled') setDeadlines(deadlineData.value);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();

    const channel = supabase
      .channel('dashboard-emissions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emissions_entries' }, () => {
        fetchAll();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [monthsBack]);

  return { isLoading, analyticsData, frameworkStatuses, deadlines };
};
