import { supabase } from '@/integrations/supabase/client';

export interface ScenarioAnalysis {
  id: string;
  name: string;
  description: string;
  probability: number;
  impact: string;
  actions: Array<{
    title: string;
    description: string;
    impact: string;
    cost: string;
    timeline: string;
  }>;
  baselineEmissions?: number;
  projectedEmissions?: any;
  confidence?: string;
}

export class ScenarioModelingService {
  async generateScenarios(organizationId: string): Promise<ScenarioAnalysis[]> {
    try {
      // Fetch current emissions data
      const { data: emissions, error: emissionsError } = await supabase
        .from('emissions_entries')
        .select('*, calculations(*)')
        .eq('organization_id', organizationId);

      if (emissionsError) throw emissionsError;

      // Calculate baseline
      const currentYear = new Date().getFullYear();
      const baselineEmissions = emissions?.reduce((sum, entry) => {
        const calculation = Array.isArray(entry.calculations) && entry.calculations.length > 0 
          ? entry.calculations[0] 
          : null;
        return sum + (calculation?.calculated_emissions || 0);
      }, 0) || 0;

      // Fetch goals for target setting
      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('organization_id', organizationId);

      const netZeroGoal = goals?.find(g => g.title.toLowerCase().includes('net zero'));
      const targetYear = netZeroGoal ? new Date(netZeroGoal.target_date).getFullYear() : currentYear + 10;

      const scenarios: ScenarioAnalysis[] = [];

      // Scenario 1: Business as Usual
      const bauGrowthRate = 0.02; // 2% annual growth
      const bauProjections = this.projectEmissions(baselineEmissions, currentYear, targetYear, bauGrowthRate);
      
      scenarios.push({
        id: 'bau',
        name: 'Business as Usual',
        description: 'Continue current operations without significant changes',
        probability: 0.70,
        impact: `Emissions reach ${(baselineEmissions * Math.pow(1 + bauGrowthRate, targetYear - currentYear)).toFixed(0)} tCO2e by ${targetYear}`,
        baselineEmissions,
        projectedEmissions: bauProjections,
        confidence: 'high',
        actions: [
          {
            title: 'Maintain Current Operations',
            description: 'No significant changes to operations or energy sources',
            impact: `+${(bauGrowthRate * 100).toFixed(1)}% annual growth`,
            cost: '$0',
            timeline: 'Ongoing'
          }
        ]
      });

      // Scenario 2: Moderate Efficiency Improvements
      const moderateReduction = -0.05; // 5% annual reduction
      const moderateProjections = this.projectEmissions(baselineEmissions, currentYear, targetYear, moderateReduction);
      
      scenarios.push({
        id: 'moderate',
        name: 'Moderate Efficiency Improvements',
        description: 'Implement energy efficiency measures and optimize operations',
        probability: 0.60,
        impact: `Reduce emissions to ${(baselineEmissions * Math.pow(1 + moderateReduction, targetYear - currentYear)).toFixed(0)} tCO2e by ${targetYear}`,
        baselineEmissions,
        projectedEmissions: moderateProjections,
        confidence: 'high',
        actions: [
          {
            title: 'Energy Efficiency Upgrades',
            description: 'LED lighting, HVAC optimization, building insulation',
            impact: '-15% energy consumption',
            cost: '$50K - $200K',
            timeline: '6-12 months'
          },
          {
            title: 'Operational Optimization',
            description: 'Process improvements and waste reduction',
            impact: '-10% operational emissions',
            cost: '$25K - $100K',
            timeline: '3-6 months'
          }
        ]
      });

      // Scenario 3: Aggressive Decarbonization
      const aggressiveReduction = -0.15; // 15% annual reduction
      const aggressiveProjections = this.projectEmissions(baselineEmissions, currentYear, targetYear, aggressiveReduction);
      
      scenarios.push({
        id: 'aggressive',
        name: 'Aggressive Decarbonization',
        description: 'Comprehensive carbon reduction program including renewable energy',
        probability: 0.40,
        impact: `Reduce emissions to ${(baselineEmissions * Math.pow(1 + aggressiveReduction, targetYear - currentYear)).toFixed(0)} tCO2e by ${targetYear}`,
        baselineEmissions,
        projectedEmissions: aggressiveProjections,
        confidence: 'medium',
        actions: [
          {
            title: 'Renewable Energy Transition',
            description: '80% renewable energy through PPAs and on-site solar',
            impact: '-60% Scope 2 emissions',
            cost: '$500K - $2M',
            timeline: '18-24 months'
          },
          {
            title: 'Fleet Electrification',
            description: 'Replace 50% of fleet with electric vehicles',
            impact: '-40% transportation emissions',
            cost: '$300K - $1M',
            timeline: '12-18 months'
          },
          {
            title: 'Supply Chain Engagement',
            description: 'Work with top suppliers to reduce Scope 3 emissions',
            impact: '-20% Scope 3 emissions',
            cost: '$100K - $300K',
            timeline: '12-24 months'
          }
        ]
      });

      // Scenario 4: Net Zero Pathway
      const netZeroReduction = -0.25; // 25% annual reduction
      const netZeroProjections = this.projectEmissions(baselineEmissions, currentYear, targetYear, netZeroReduction);
      
      scenarios.push({
        id: 'net-zero',
        name: 'Net Zero Pathway',
        description: 'Comprehensive transformation to achieve net-zero emissions',
        probability: 0.25,
        impact: `Achieve net-zero emissions by ${targetYear}`,
        baselineEmissions,
        projectedEmissions: netZeroProjections,
        confidence: 'medium',
        actions: [
          {
            title: '100% Renewable Energy',
            description: 'Complete transition to renewable energy sources',
            impact: '-100% Scope 2 emissions',
            cost: '$1M - $5M',
            timeline: '24-36 months'
          },
          {
            title: 'Carbon Capture & Offsets',
            description: 'Invest in high-quality carbon removal projects',
            impact: 'Offset residual emissions',
            cost: '$200K - $800K annually',
            timeline: 'Ongoing'
          },
          {
            title: 'Circular Economy Model',
            description: 'Redesign operations for zero waste and circularity',
            impact: '-80% Scope 3 emissions',
            cost: '$500K - $2M',
            timeline: '36-48 months'
          }
        ]
      });

      // Save scenarios to database
      await this.saveScenarios(organizationId, scenarios, currentYear, targetYear);

      return scenarios;
    } catch (error) {
      console.error('Error generating scenarios:', error);
      return [];
    }
  }

  private projectEmissions(baseline: number, startYear: number, endYear: number, growthRate: number): any {
    const projections: any = {};
    for (let year = startYear; year <= endYear; year++) {
      const yearsFromStart = year - startYear;
      projections[year] = baseline * Math.pow(1 + growthRate, yearsFromStart);
    }
    return projections;
  }

  private async saveScenarios(organizationId: string, scenarios: ScenarioAnalysis[], baselineYear: number, targetYear: number) {
    const scenariosToSave = scenarios.map(scenario => ({
      organization_id: organizationId,
      scenario_name: scenario.name,
      description: scenario.description,
      baseline_emissions: scenario.baselineEmissions || 0,
      baseline_year: baselineYear,
      target_year: targetYear,
      projected_emissions: scenario.projectedEmissions,
      projected_costs: {},
      interventions: scenario.actions,
      probability: scenario.probability,
      impact_score: scenario.probability * 100,
      confidence_level: scenario.confidence || 'medium'
    }));

    const { error } = await supabase
      .from('enterprise_scenarios')
      .upsert(scenariosToSave, {
        onConflict: 'organization_id,scenario_name'
      });

    if (error) {
      console.error('Error saving scenarios:', error);
    }
  }

  async getScenarios(organizationId: string): Promise<ScenarioAnalysis[]> {
    const { data, error } = await supabase
      .from('enterprise_scenarios')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching scenarios:', error);
      return [];
    }

    return data?.map(s => ({
      id: s.id,
      name: s.scenario_name,
      description: s.description || '',
      probability: s.probability || 0,
      impact: `Projected emissions: ${Object.values(s.projected_emissions || {}).pop()} tCO2e`,
      actions: (s.interventions as any) || [],
      baselineEmissions: s.baseline_emissions,
      projectedEmissions: s.projected_emissions,
      confidence: s.confidence_level
    })) || [];
  }
}

export const scenarioModelingService = new ScenarioModelingService();
