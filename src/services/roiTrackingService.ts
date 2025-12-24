import { supabase } from "@/integrations/supabase/client";
import { carbonCreditService } from "./carbonCreditService";

export type ROIPeriodType = 'monthly' | 'quarterly' | 'yearly';

export interface ROITracking {
  id: string;
  organization_id: string | null;
  user_id: string;
  period: ROIPeriodType;
  period_start: string;
  period_end: string;
  platform_cost: number;
  time_saved_hours: number;
  estimated_hourly_rate: number;
  time_savings_value: number;
  carbon_credits_value: number;
  carbon_credits_change: number;
  compliance_savings: number;
  penalty_avoidance: number;
  data_quality_savings: number;
  report_automation_savings: number;
  total_roi_value: number;
  roi_percentage: number;
  emissions_tracked: number;
  entries_processed: number;
  reports_generated: number;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface ROICalculation {
  periodStart: Date;
  periodEnd: Date;
  platformCost: number;
  timeSavedHours: number;
  hourlyRate: number;
  timeSavingsValue: number;
  carbonCreditsValue: number;
  carbonCreditsChange: number;
  complianceSavings: number;
  penaltyAvoidance: number;
  dataQualitySavings: number;
  reportAutomationSavings: number;
  totalValue: number;
  roiPercentage: number;
  emissionsTracked: number;
  entriesProcessed: number;
  reportsGenerated: number;
}

export interface ROISummary {
  totalROIValue: number;
  totalPlatformCost: number;
  netROI: number;
  roiPercentage: number;
  averageMonthlyROI: number;
  bestMonth: { period: string; roi: number } | null;
  worstMonth: { period: string; roi: number } | null;
  trend: 'up' | 'down' | 'stable';
  monthlyHistory: { period: string; roi: number; value: number }[];
}

const PLATFORM_MONTHLY_COST = 499; // Default platform cost
const DEFAULT_HOURLY_RATE = 75;

export const roiTrackingService = {
  async calculatePeriodROI(
    periodStart: Date,
    periodEnd: Date,
    period: ROIPeriodType = 'monthly'
  ): Promise<ROICalculation> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return this.getEmptyCalculation(periodStart, periodEnd);
    }

    // Get emissions entries for the period
    const { data: entries } = await supabase
      .from('emissions_entries')
      .select('quantity, scope')
      .gte('entry_date', periodStart.toISOString().split('T')[0])
      .lte('entry_date', periodEnd.toISOString().split('T')[0]);

    // Get reports generated
    const { count: reportsCount } = await supabase
      .from('reports')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString());

    // Get carbon credits portfolio value
    const portfolioSummary = await carbonCreditService.getPortfolioSummary();

    // Calculate metrics
    const entriesProcessed = entries?.length || 0;
    const emissionsTracked = entries?.reduce((sum, e) => sum + e.quantity, 0) || 0;
    const reportsGenerated = reportsCount || 0;

    // Time savings calculations (estimates based on automation)
    const timePerManualEntry = 15; // minutes
    const timePerAutomatedEntry = 2; // minutes
    const timeSavedPerEntry = (timePerManualEntry - timePerAutomatedEntry) / 60; // hours
    const timeSavedHours = entriesProcessed * timeSavedPerEntry;

    const hourlyRate = DEFAULT_HOURLY_RATE;
    const timeSavingsValue = timeSavedHours * hourlyRate;

    // Report automation savings
    const manualReportTime = 8; // hours
    const automatedReportTime = 0.5; // hours
    const reportTimeSaved = reportsGenerated * (manualReportTime - automatedReportTime);
    const reportAutomationSavings = reportTimeSaved * hourlyRate;

    // Data quality savings (fewer errors = less rework)
    const errorReductionFactor = 0.15; // 15% of time saved from fewer errors
    const dataQualitySavings = timeSavingsValue * errorReductionFactor;

    // Compliance savings (avoiding penalties, faster audits)
    const complianceBaseSavings = entriesProcessed > 0 ? 500 : 0;
    const complianceSavings = complianceBaseSavings;

    // Penalty avoidance (estimated based on proper tracking)
    const penaltyAvoidance = emissionsTracked > 0 ? Math.min(emissionsTracked * 0.5, 2000) : 0;

    // Carbon credits value and change
    const carbonCreditsValue = portfolioSummary.totalValue;
    const carbonCreditsChange = portfolioSummary.unrealizedGainLoss;

    // Platform cost
    const platformCost = period === 'monthly' 
      ? PLATFORM_MONTHLY_COST 
      : period === 'quarterly' 
        ? PLATFORM_MONTHLY_COST * 3 
        : PLATFORM_MONTHLY_COST * 12;

    // Total ROI value
    const totalValue = 
      timeSavingsValue + 
      reportAutomationSavings + 
      dataQualitySavings + 
      complianceSavings + 
      penaltyAvoidance + 
      carbonCreditsChange;

    const roiPercentage = platformCost > 0 ? ((totalValue - platformCost) / platformCost) * 100 : 0;

    return {
      periodStart,
      periodEnd,
      platformCost,
      timeSavedHours,
      hourlyRate,
      timeSavingsValue,
      carbonCreditsValue,
      carbonCreditsChange,
      complianceSavings,
      penaltyAvoidance,
      dataQualitySavings,
      reportAutomationSavings,
      totalValue,
      roiPercentage,
      emissionsTracked,
      entriesProcessed,
      reportsGenerated,
    };
  },

  getEmptyCalculation(periodStart: Date, periodEnd: Date): ROICalculation {
    return {
      periodStart,
      periodEnd,
      platformCost: PLATFORM_MONTHLY_COST,
      timeSavedHours: 0,
      hourlyRate: DEFAULT_HOURLY_RATE,
      timeSavingsValue: 0,
      carbonCreditsValue: 0,
      carbonCreditsChange: 0,
      complianceSavings: 0,
      penaltyAvoidance: 0,
      dataQualitySavings: 0,
      reportAutomationSavings: 0,
      totalValue: 0,
      roiPercentage: 0,
      emissionsTracked: 0,
      entriesProcessed: 0,
      reportsGenerated: 0,
    };
  },

  async saveROISnapshot(calculation: ROICalculation, period: ROIPeriodType): Promise<ROITracking | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return null;

    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', userData.user.id)
      .single();

    const { data, error } = await (supabase
      .from('roi_tracking' as any)
      .insert({
        user_id: userData.user.id,
        organization_id: orgMember?.organization_id || null,
        period,
        period_start: calculation.periodStart.toISOString().split('T')[0],
        period_end: calculation.periodEnd.toISOString().split('T')[0],
        platform_cost: calculation.platformCost,
        time_saved_hours: calculation.timeSavedHours,
        estimated_hourly_rate: calculation.hourlyRate,
        carbon_credits_value: calculation.carbonCreditsValue,
        carbon_credits_change: calculation.carbonCreditsChange,
        compliance_savings: calculation.complianceSavings,
        penalty_avoidance: calculation.penaltyAvoidance,
        data_quality_savings: calculation.dataQualitySavings,
        report_automation_savings: calculation.reportAutomationSavings,
        total_roi_value: calculation.totalValue,
        roi_percentage: calculation.roiPercentage,
        emissions_tracked: calculation.emissionsTracked,
        entries_processed: calculation.entriesProcessed,
        reports_generated: calculation.reportsGenerated,
      } as any)
      .select()
      .single()) as { data: ROITracking | null; error: any };

    if (error) {
      console.error('Failed to save ROI snapshot:', error);
      return null;
    }

    return data;
  },

  async getROIHistory(limit: number = 12): Promise<ROITracking[]> {
    const { data, error } = await (supabase
      .from('roi_tracking' as any)
      .select('*')
      .order('period_end', { ascending: false })
      .limit(limit)) as { data: ROITracking[] | null; error: any };

    if (error) {
      console.error('Failed to fetch ROI history:', error);
      return [];
    }

    return data || [];
  },

  async getROISummary(): Promise<ROISummary> {
    const history = await this.getROIHistory(12);
    
    if (history.length === 0) {
      return {
        totalROIValue: 0,
        totalPlatformCost: 0,
        netROI: 0,
        roiPercentage: 0,
        averageMonthlyROI: 0,
        bestMonth: null,
        worstMonth: null,
        trend: 'stable',
        monthlyHistory: [],
      };
    }

    const totalROIValue = history.reduce((sum, h) => sum + h.total_roi_value, 0);
    const totalPlatformCost = history.reduce((sum, h) => sum + h.platform_cost, 0);
    const netROI = totalROIValue - totalPlatformCost;
    const roiPercentage = totalPlatformCost > 0 ? (netROI / totalPlatformCost) * 100 : 0;
    const averageMonthlyROI = history.length > 0 ? netROI / history.length : 0;

    const sortedByROI = [...history].sort((a, b) => b.roi_percentage - a.roi_percentage);
    const bestMonth = sortedByROI[0] ? {
      period: `${sortedByROI[0].period_start} to ${sortedByROI[0].period_end}`,
      roi: sortedByROI[0].roi_percentage,
    } : null;
    const worstMonth = sortedByROI[sortedByROI.length - 1] ? {
      period: `${sortedByROI[sortedByROI.length - 1].period_start} to ${sortedByROI[sortedByROI.length - 1].period_end}`,
      roi: sortedByROI[sortedByROI.length - 1].roi_percentage,
    } : null;

    // Calculate trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (history.length >= 2) {
      const recentAvg = (history[0].roi_percentage + (history[1]?.roi_percentage || 0)) / 2;
      const olderAvg = (history[history.length - 1].roi_percentage + (history[history.length - 2]?.roi_percentage || 0)) / 2;
      if (recentAvg > olderAvg * 1.1) trend = 'up';
      else if (recentAvg < olderAvg * 0.9) trend = 'down';
    }

    const monthlyHistory = history
      .map(h => ({
        period: h.period_start,
        roi: h.roi_percentage,
        value: h.total_roi_value,
      }))
      .reverse();

    return {
      totalROIValue,
      totalPlatformCost,
      netROI,
      roiPercentage,
      averageMonthlyROI,
      bestMonth,
      worstMonth,
      trend,
      monthlyHistory,
    };
  },

  async generateMonthlyROI(): Promise<ROITracking | null> {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const calculation = await this.calculatePeriodROI(periodStart, periodEnd, 'monthly');
    return this.saveROISnapshot(calculation, 'monthly');
  },

  async getProjectedAnnualROI(): Promise<{
    projectedValue: number;
    projectedCost: number;
    projectedNet: number;
    projectedPercentage: number;
    confidence: number;
  }> {
    const history = await this.getROIHistory(6);
    
    if (history.length === 0) {
      return {
        projectedValue: 0,
        projectedCost: PLATFORM_MONTHLY_COST * 12,
        projectedNet: -PLATFORM_MONTHLY_COST * 12,
        projectedPercentage: -100,
        confidence: 0,
      };
    }

    const avgMonthlyValue = history.reduce((sum, h) => sum + h.total_roi_value, 0) / history.length;
    const avgMonthlyCost = history.reduce((sum, h) => sum + h.platform_cost, 0) / history.length;

    const projectedValue = avgMonthlyValue * 12;
    const projectedCost = avgMonthlyCost * 12;
    const projectedNet = projectedValue - projectedCost;
    const projectedPercentage = projectedCost > 0 ? (projectedNet / projectedCost) * 100 : 0;
    const confidence = Math.min(history.length / 6, 1) * 100;

    return {
      projectedValue,
      projectedCost,
      projectedNet,
      projectedPercentage,
      confidence,
    };
  },
};
