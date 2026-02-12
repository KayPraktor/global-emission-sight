import { supabase } from '@/integrations/supabase/client';

export interface EnterpriseKPI {
  id: string;
  title: string;
  value: string;
  unit: string;
  change: number;
  target: number;
  status: 'on-track' | 'at-risk' | 'off-track';
  trend: 'up' | 'down' | 'stable';
  category: 'emissions' | 'financial' | 'compliance' | 'performance';
}

export class EnterpriseKPIService {
  async calculateKPIs(organizationId: string, startDate?: string, endDate?: string): Promise<EnterpriseKPI[]> {
    try {
      // Fetch emissions data for the organization
      const { data: emissions, error: emissionsError } = await supabase
        .from('emissions_entries')
        .select('*, calculations(*)')
        .eq('organization_id', organizationId)
        .gte('entry_date', startDate || new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString())
        .lte('entry_date', endDate || new Date().toISOString());

      if (emissionsError) throw emissionsError;

      // Fetch goals for targets
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('organization_id', organizationId);

      if (goalsError) throw goalsError;

      // Fetch quality metrics
      const { data: qualityMetrics, error: qualityError } = await supabase
        .from('quality_tracking')
        .select('*')
        .eq('organization_id', organizationId)
        .order('metric_date', { ascending: false })
        .limit(2);

      if (qualityError) throw qualityError;

      // Fetch facilities for carbon intensity calculation
      const { data: facilities, error: facilitiesError } = await supabase
        .from('facilities')
        .select('*')
        .eq('organization_id', organizationId);

      if (facilitiesError) throw facilitiesError;

      // Calculate total emissions
      const totalEmissions = emissions?.reduce((sum, entry) => {
        const calculation = Array.isArray(entry.calculations) && entry.calculations.length > 0 
          ? entry.calculations[0] 
          : null;
        return sum + (calculation?.calculated_emissions || 0);
      }, 0) || 0;

      // Calculate scope breakdowns
      const scope1 = emissions?.filter(e => e.scope === 'S1').reduce((sum, entry) => {
        const calculation = Array.isArray(entry.calculations) && entry.calculations.length > 0 
          ? entry.calculations[0] 
          : null;
        return sum + (calculation?.calculated_emissions || 0);
      }, 0) || 0;

      const scope2 = emissions?.filter(e => e.scope === 'S2').reduce((sum, entry) => {
        const calculation = Array.isArray(entry.calculations) && entry.calculations.length > 0 
          ? entry.calculations[0] 
          : null;
        return sum + (calculation?.calculated_emissions || 0);
      }, 0) || 0;

      const scope3 = emissions?.filter(e => e.scope === 'S3').reduce((sum, entry) => {
        const calculation = Array.isArray(entry.calculations) && entry.calculations.length > 0 
          ? entry.calculations[0] 
          : null;
        return sum + (calculation?.calculated_emissions || 0);
      }, 0) || 0;

      // Calculate previous period emissions for trend
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { data: previousEmissions } = await supabase
        .from('emissions_entries')
        .select('*, calculations(*)')
        .eq('organization_id', organizationId)
        .lte('entry_date', sixMonthsAgo.toISOString());

      const previousTotal = previousEmissions?.reduce((sum, entry) => {
        const calculation = Array.isArray(entry.calculations) && entry.calculations.length > 0 
          ? entry.calculations[0] 
          : null;
        return sum + (calculation?.calculated_emissions || 0);
      }, 0) || 0;

      const emissionsChange = previousTotal > 0 ? ((totalEmissions - previousTotal) / previousTotal) * 100 : 0;

      // Calculate carbon cost (assuming $50 per tCO2e)
      const carbonCost = totalEmissions * 50;

      // Calculate compliance score from quality metrics
      const latestQuality = qualityMetrics?.[0];
      const complianceScore = latestQuality?.overall_score || 0;
      const previousQuality = qualityMetrics?.[1];
      const qualityChange = previousQuality ? 
        ((latestQuality?.overall_score || 0) - (previousQuality.overall_score || 0)) : 0;

      // Calculate carbon intensity (emissions per revenue)
      const totalRevenue = facilities?.reduce((sum, f) => sum + (f.annual_revenue || 0), 0) || 1;
      const carbonIntensity = totalEmissions / (totalRevenue / 1000000); // tCO2e per million revenue

      // Calculate net zero progress
      const netZeroGoal = goals?.find(g => g.title.toLowerCase().includes('net zero') || g.title.toLowerCase().includes('carbon neutral'));
      const netZeroProgress = netZeroGoal?.progress_percentage || 0;
      const netZeroTarget = netZeroGoal?.target_emissions || totalEmissions * 0.5;

      // Risk exposure based on non-compliance
      const criticalIssues = latestQuality?.critical_issues || 0;
      const riskExposure = criticalIssues * 10000; // $10k per critical issue

      const kpis: EnterpriseKPI[] = [
        {
          id: '1',
          title: 'Total Portfolio Emissions',
          value: totalEmissions.toFixed(2),
          unit: 'tCO2e',
          change: emissionsChange,
          target: netZeroTarget || totalEmissions * 0.5,
          status: emissionsChange < 0 ? 'on-track' : emissionsChange > 10 ? 'off-track' : 'at-risk',
          trend: emissionsChange < -5 ? 'down' : emissionsChange > 5 ? 'up' : 'stable',
          category: 'emissions'
        },
        {
          id: '2',
          title: 'Carbon Cost Exposure',
          value: (carbonCost / 1000000).toFixed(2),
          unit: 'M USD',
          change: emissionsChange,
          target: (carbonCost * 0.7) / 1000000,
          status: emissionsChange < 0 ? 'on-track' : 'at-risk',
          trend: emissionsChange < -5 ? 'down' : emissionsChange > 5 ? 'up' : 'stable',
          category: 'financial'
        },
        {
          id: '3',
          title: 'Compliance Score',
          value: complianceScore.toFixed(1),
          unit: '%',
          change: qualityChange,
          target: 95,
          status: complianceScore >= 90 ? 'on-track' : complianceScore >= 75 ? 'at-risk' : 'off-track',
          trend: qualityChange > 0 ? 'up' : qualityChange < 0 ? 'down' : 'stable',
          category: 'compliance'
        },
        {
          id: '4',
          title: 'Carbon Intensity',
          value: carbonIntensity.toFixed(2),
          unit: 'tCO2e/M$',
          change: emissionsChange,
          target: carbonIntensity * 0.6,
          status: emissionsChange < -10 ? 'on-track' : 'at-risk',
          trend: emissionsChange < -5 ? 'down' : emissionsChange > 5 ? 'up' : 'stable',
          category: 'performance'
        },
        {
          id: '5',
          title: 'Net Zero Progress',
          value: netZeroProgress.toFixed(1),
          unit: '%',
          change: netZeroProgress > 0 ? 5 : 0,
          target: 100,
          status: netZeroProgress >= 50 ? 'on-track' : netZeroProgress >= 25 ? 'at-risk' : 'off-track',
          trend: netZeroProgress > 0 ? 'up' : 'stable',
          category: 'emissions'
        },
        {
          id: '6',
          title: 'Risk Exposure',
          value: (riskExposure / 1000).toFixed(1),
          unit: 'K USD',
          change: criticalIssues > 5 ? 15 : -10,
          target: 0,
          status: criticalIssues === 0 ? 'on-track' : criticalIssues < 5 ? 'at-risk' : 'off-track',
          trend: criticalIssues > 5 ? 'up' : criticalIssues > 0 ? 'stable' : 'down',
          category: 'financial'
        }
      ];

      // Save metrics to database for historical tracking
      await this.saveMetrics(organizationId, {
        total_emissions: totalEmissions,
        carbon_cost: carbonCost,
        compliance_score: complianceScore,
        carbon_intensity: carbonIntensity,
        net_zero_progress: netZeroProgress,
        risk_exposure: riskExposure,
        scope_1_emissions: scope1,
        scope_2_emissions: scope2,
        scope_3_emissions: scope3
      });

      return kpis;
    } catch (error) {
      console.error('Error calculating KPIs:', error);
      throw error;
    }
  }

  async saveMetrics(organizationId: string, metrics: any) {
    const { error } = await supabase
      .from('enterprise_metrics')
      .upsert({
        organization_id: organizationId,
        metric_date: new Date().toISOString().split('T')[0],
        ...metrics
      }, {
        onConflict: 'organization_id,metric_date'
      });

    if (error) {
      console.error('Error saving metrics:', error);
    }
  }

  async getMetricsHistory(organizationId: string, days: number = 30): Promise<any[]> {
    const { data, error } = await supabase
      .from('enterprise_metrics')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('metric_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('metric_date', { ascending: true });

    if (error) {
      console.error('Error fetching metrics history:', error);
      return [];
    }

    return data || [];
  }
}

export const enterpriseKPIService = new EnterpriseKPIService();
