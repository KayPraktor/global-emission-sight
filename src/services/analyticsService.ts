import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export interface MonthlyEmissions {
  month: string;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

export interface ScopeBreakdown {
  scope: 'scope_1' | 'scope_2' | 'scope_3';
  total: number;
  percentage: number;
}

export interface CategoryBreakdown {
  category: string;
  value: number;
  scope: string;
}

export interface FacilityEmissions {
  facility_id: string;
  facility_name: string;
  total_emissions: number;
  scope1: number;
  scope2: number;
  scope3: number;
}

export interface AnalyticsSummary {
  totalEmissions: number;
  scope1Total: number;
  scope2Total: number;
  scope3Total: number;
  monthlyData: MonthlyEmissions[];
  categoryBreakdown: CategoryBreakdown[];
  facilityBreakdown: FacilityEmissions[];
  previousPeriodTotal: number;
  changePercentage: number;
}

class AnalyticsService {
  /**
   * Fetches aggregated emissions data for the dashboard overview.
   *
   * @description Queries `emissions_entries` (joined with `calculations` and
   * `facilities`) for the authenticated user over a rolling window, then
   * computes monthly totals, scope breakdowns, category breakdowns,
   * facility breakdowns, and period-over-period change.
   *
   * @param monthsBack - Number of months of history to include (default 6)
   * @returns {Promise<AnalyticsSummary>} Aggregated summary object
   * @throws {Error} If user is not authenticated or query fails
   */
  async getAnalyticsSummary(monthsBack: number = 6): Promise<AnalyticsSummary> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Calculate date range
    const endDate = endOfMonth(new Date());
    const startDate = startOfMonth(subMonths(new Date(), monthsBack - 1));

    // Fetch all emissions entries with calculations
    const { data: entries, error } = await supabase
      .from('emissions_entries')
      .select(`
        *,
        calculations(calculated_emissions),
        facilities(name)
      `)
      .eq('user_id', user.id)
      .gte('entry_date', startDate.toISOString())
      .lte('entry_date', endDate.toISOString())
      .order('entry_date', { ascending: true });

    if (error) {
      console.error('Error fetching emissions data:', error);
      throw error;
    }

    if (!entries || entries.length === 0) {
      return this.getEmptyAnalytics(monthsBack);
    }

    // Calculate monthly aggregations
    const monthlyData = this.aggregateMonthlyData(entries, monthsBack);
    
    // Calculate scope totals
    const scopeTotals = this.calculateScopeTotals(entries);
    
    // Calculate category breakdown
    const categoryBreakdown = this.calculateCategoryBreakdown(entries);
    
    // Calculate facility breakdown
    const facilityBreakdown = this.calculateFacilityBreakdown(entries);
    
    // Calculate previous period comparison
    const currentTotal = scopeTotals.scope1 + scopeTotals.scope2 + scopeTotals.scope3;
    const previousPeriodTotal = await this.getPreviousPeriodTotal(user.id, monthsBack);
    const changePercentage = previousPeriodTotal > 0 
      ? ((currentTotal - previousPeriodTotal) / previousPeriodTotal) * 100 
      : 0;

    return {
      totalEmissions: currentTotal,
      scope1Total: scopeTotals.scope1,
      scope2Total: scopeTotals.scope2,
      scope3Total: scopeTotals.scope3,
      monthlyData,
      categoryBreakdown,
      facilityBreakdown,
      previousPeriodTotal,
      changePercentage,
    };
  }

  private aggregateMonthlyData(entries: any[], monthsBack: number): MonthlyEmissions[] {
    const monthlyMap = new Map<string, { scope1: number; scope2: number; scope3: number }>();

    // Initialize all months
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthKey = format(date, 'MMM yyyy');
      monthlyMap.set(monthKey, { scope1: 0, scope2: 0, scope3: 0 });
    }

    // Aggregate emissions by month and scope
    entries.forEach((entry) => {
      const monthKey = format(new Date(entry.entry_date), 'MMM yyyy');
      const emissions = entry.calculations?.[0]?.calculated_emissions || 0;
      
      if (monthlyMap.has(monthKey)) {
        const data = monthlyMap.get(monthKey)!;
        // Support both scope formats: S1/S2/S3 and scope_1/scope_2/scope_3
        if (entry.scope === 'S1' || entry.scope === 'scope_1') data.scope1 += emissions;
        else if (entry.scope === 'S2' || entry.scope === 'scope_2') data.scope2 += emissions;
        else if (entry.scope === 'S3' || entry.scope === 'scope_3') data.scope3 += emissions;
      }
    });

    // Convert to array format
    return Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      scope1: parseFloat(data.scope1.toFixed(2)),
      scope2: parseFloat(data.scope2.toFixed(2)),
      scope3: parseFloat(data.scope3.toFixed(2)),
      total: parseFloat((data.scope1 + data.scope2 + data.scope3).toFixed(2)),
    }));
  }

  private calculateScopeTotals(entries: any[]): { scope1: number; scope2: number; scope3: number } {
    const totals = { scope1: 0, scope2: 0, scope3: 0 };

    entries.forEach((entry) => {
      const emissions = entry.calculations?.[0]?.calculated_emissions || 0;
      // Support both scope formats: S1/S2/S3 and scope_1/scope_2/scope_3
      if (entry.scope === 'S1' || entry.scope === 'scope_1') totals.scope1 += emissions;
      else if (entry.scope === 'S2' || entry.scope === 'scope_2') totals.scope2 += emissions;
      else if (entry.scope === 'S3' || entry.scope === 'scope_3') totals.scope3 += emissions;
    });

    return {
      scope1: parseFloat(totals.scope1.toFixed(2)),
      scope2: parseFloat(totals.scope2.toFixed(2)),
      scope3: parseFloat(totals.scope3.toFixed(2)),
    };
  }

  private calculateCategoryBreakdown(entries: any[]): CategoryBreakdown[] {
    const categoryMap = new Map<string, { value: number; scope: string }>();

    entries.forEach((entry) => {
      const emissions = entry.calculations?.[0]?.calculated_emissions || 0;
      const category = entry.category || 'Other';
      
      if (categoryMap.has(category)) {
        const data = categoryMap.get(category)!;
        data.value += emissions;
      } else {
        categoryMap.set(category, {
          value: emissions,
          scope: entry.scope.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        });
      }
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        value: parseFloat(data.value.toFixed(2)),
        scope: data.scope,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 categories
  }

  private calculateFacilityBreakdown(entries: any[]): FacilityEmissions[] {
    const facilityMap = new Map<string, { name: string; scope1: number; scope2: number; scope3: number }>();

    entries.forEach((entry) => {
      if (!entry.facility_id) return;
      
      const emissions = entry.calculations?.[0]?.calculated_emissions || 0;
      const facilityName = entry.facilities?.name || 'Unknown Facility';

      if (facilityMap.has(entry.facility_id)) {
        const data = facilityMap.get(entry.facility_id)!;
        // Support both scope formats: S1/S2/S3 and scope_1/scope_2/scope_3
        if (entry.scope === 'S1' || entry.scope === 'scope_1') data.scope1 += emissions;
        else if (entry.scope === 'S2' || entry.scope === 'scope_2') data.scope2 += emissions;
        else if (entry.scope === 'S3' || entry.scope === 'scope_3') data.scope3 += emissions;
      } else {
        facilityMap.set(entry.facility_id, {
          name: facilityName,
          scope1: (entry.scope === 'S1' || entry.scope === 'scope_1') ? emissions : 0,
          scope2: (entry.scope === 'S2' || entry.scope === 'scope_2') ? emissions : 0,
          scope3: (entry.scope === 'S3' || entry.scope === 'scope_3') ? emissions : 0,
        });
      }
    });

    return Array.from(facilityMap.entries())
      .map(([facility_id, data]) => ({
        facility_id,
        facility_name: data.name,
        total_emissions: parseFloat((data.scope1 + data.scope2 + data.scope3).toFixed(2)),
        scope1: parseFloat(data.scope1.toFixed(2)),
        scope2: parseFloat(data.scope2.toFixed(2)),
        scope3: parseFloat(data.scope3.toFixed(2)),
      }))
      .sort((a, b) => b.total_emissions - a.total_emissions);
  }

  private async getPreviousPeriodTotal(userId: string, monthsBack: number): Promise<number> {
    const endDate = startOfMonth(subMonths(new Date(), monthsBack));
    const startDate = startOfMonth(subMonths(endDate, monthsBack));

    const { data: entries, error } = await supabase
      .from('emissions_entries')
      .select('calculations(calculated_emissions)')
      .eq('user_id', userId)
      .gte('entry_date', startDate.toISOString())
      .lt('entry_date', endDate.toISOString());

    if (error || !entries) {
      return 0;
    }

    const total = entries.reduce((sum, entry: any) => {
      return sum + (entry.calculations?.[0]?.calculated_emissions || 0);
    }, 0);

    return parseFloat(total.toFixed(2));
  }

  private getEmptyAnalytics(monthsBack: number): AnalyticsSummary {
    const monthlyData: MonthlyEmissions[] = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      monthlyData.push({
        month: format(date, 'MMM yyyy'),
        scope1: 0,
        scope2: 0,
        scope3: 0,
        total: 0,
      });
    }

    return {
      totalEmissions: 0,
      scope1Total: 0,
      scope2Total: 0,
      scope3Total: 0,
      monthlyData,
      categoryBreakdown: [],
      facilityBreakdown: [],
      previousPeriodTotal: 0,
      changePercentage: 0,
    };
  }
}

export const analyticsService = new AnalyticsService();
