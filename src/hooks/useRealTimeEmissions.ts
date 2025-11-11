import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { analyticsService, AnalyticsSummary } from '@/services/analyticsService';

/**
 * Hook to subscribe to real-time emissions data updates
 */
export const useRealTimeEmissions = (monthsBack: number = 6) => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initial data fetch
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const summary = await analyticsService.getAnalyticsSummary(monthsBack);
        setData(summary);
        setError(null);
      } catch (err) {
        console.error('Error fetching emissions data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription
    const channel = supabase
      .channel('emissions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'emissions_entries'
        },
        () => {
          // Refetch data when emissions entries change
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calculations'
        },
        () => {
          // Refetch data when calculations change
          fetchData();
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [monthsBack]);

  return { data, isLoading, error, refetch: async () => {
    try {
      setIsLoading(true);
      const summary = await analyticsService.getAnalyticsSummary(monthsBack);
      setData(summary);
      setError(null);
    } catch (err) {
      console.error('Error fetching emissions data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }};
};
