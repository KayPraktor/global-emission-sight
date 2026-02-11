import { supabase } from "@/integrations/supabase/client";

// All 15 GHG Protocol Scope 3 categories
export interface Scope3Category {
  category_number: number;
  name: string;
  description: string;
  is_upstream: boolean;
  default_emission_factor: number;
  emission_factor_unit: string;
  methodology_guidance: string;
}

export interface Scope3Summary {
  category_number: number;
  category_name: string;
  emissions_tco2e: number;
  data_quality: string;
  supplier_data_percentage: number;
  spend_based_percentage: number;
  industry_average_percentage: number;
}

export interface Scope3CalculationInput {
  category_number: number;
  activity_data: number;
  unit: string;
  emission_factor?: number;
  supplier_id?: string;
  data_quality?: 'primary' | 'secondary' | 'estimated' | 'spend_based';
}

export interface Scope3Hotspot {
  category_number: number;
  category_name: string;
  emissions_tco2e: number;
  percentage_of_total: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  top_contributors: {
    name: string;
    emissions: number;
    type: 'supplier' | 'activity';
  }[];
  reduction_potential: number;
  recommended_actions: string[];
}

// EEIO emission factors by industry sector (kgCO2e per USD spent)
const EEIO_FACTORS: Record<string, Record<string, number>> = {
  'Manufacturing': {
    'Electronics': 0.42,
    'Machinery': 0.35,
    'Chemicals': 0.65,
    'Metals': 0.55,
    'Plastics': 0.48,
    'Textiles': 0.38,
    'Food Products': 0.45,
    'Paper': 0.32,
    'Other': 0.40
  },
  'Services': {
    'Professional Services': 0.12,
    'IT Services': 0.15,
    'Financial Services': 0.08,
    'Healthcare': 0.22,
    'Education': 0.10,
    'Other': 0.14
  },
  'Transportation': {
    'Air Freight': 1.25,
    'Road Freight': 0.18,
    'Rail Freight': 0.04,
    'Sea Freight': 0.02,
    'Courier': 0.45,
    'Other': 0.25
  },
  'Utilities': {
    'Electricity': 0.52,
    'Natural Gas': 0.24,
    'Water': 0.05,
    'Waste Management': 0.35,
    'Other': 0.30
  },
  'Construction': {
    'Building Materials': 0.42,
    'Construction Services': 0.28,
    'Other': 0.35
  },
  'Other': {
    'General': 0.30
  }
};

class Scope3Service {
  // Get all Scope 3 categories
  async getCategories(): Promise<Scope3Category[]> {
    const { data, error } = await supabase
      .from('scope3_categories')
      .select('*')
      .order('category_number');
    
    if (error) throw error;
    return data || [];
  }

  // Get upstream categories (1-8)
  async getUpstreamCategories(): Promise<Scope3Category[]> {
    const { data, error } = await supabase
      .from('scope3_categories')
      .select('*')
      .eq('is_upstream', true)
      .order('category_number');
    
    if (error) throw error;
    return data || [];
  }

  // Get downstream categories (9-15)
  async getDownstreamCategories(): Promise<Scope3Category[]> {
    const { data, error } = await supabase
      .from('scope3_categories')
      .select('*')
      .eq('is_upstream', false)
      .order('category_number');
    
    if (error) throw error;
    return data || [];
  }

  // Get organization Scope 3 summary
  async getOrganizationScope3Summary(
    organizationId: string,
    year: number
  ): Promise<Scope3Summary[]> {
    const { data, error } = await supabase
      .from('organization_scope3_summary')
      .select(`
        category_number,
        emissions_tco2e,
        data_quality,
        supplier_data_percentage,
        spend_based_percentage,
        industry_average_percentage
      `)
      .eq('organization_id', organizationId)
      .eq('reporting_year', year);
    
    if (error) throw error;

    // Get category names
    const categories = await this.getCategories();
    const categoryMap = new Map(categories.map(c => [c.category_number, c.name]));

    const realData = (data || []).map(item => ({
      category_number: item.category_number,
      category_name: categoryMap.get(item.category_number) || `Category ${item.category_number}`,
      emissions_tco2e: Number(item.emissions_tco2e) || 0,
      data_quality: item.data_quality || 'estimated',
      supplier_data_percentage: Number(item.supplier_data_percentage) || 0,
      spend_based_percentage: Number(item.spend_based_percentage) || 100,
      industry_average_percentage: Number(item.industry_average_percentage) || 0
    }));

    // Return empty array if no real data
    if (realData.length === 0 || realData.every(d => d.emissions_tco2e === 0)) {
      return [];
    }

    return realData;
  }

  // Calculate emissions for a category
  async calculateCategoryEmissions(input: Scope3CalculationInput): Promise<number> {
    // If emission factor provided, use it directly
    if (input.emission_factor) {
      return input.activity_data * input.emission_factor;
    }

    // Get default factor from category
    const { data: category } = await supabase
      .from('scope3_categories')
      .select('default_emission_factor')
      .eq('category_number', input.category_number)
      .single();

    const factor = category?.default_emission_factor || 0.3;
    return input.activity_data * factor;
  }

  // Calculate spend-based emissions using EEIO factors
  calculateSpendBasedEmissions(
    spend: number,
    industry: string,
    sector: string
  ): number {
    const industryFactors = EEIO_FACTORS[industry] || EEIO_FACTORS['Other'];
    const factor = industryFactors[sector] || industryFactors['General'] || 0.30;
    return spend * factor;
  }

  // Get EEIO factor for a category
  getEEIOFactor(industry: string, sector: string): number {
    const industryFactors = EEIO_FACTORS[industry] || EEIO_FACTORS['Other'];
    return industryFactors[sector] || industryFactors['General'] || 0.30;
  }

  // Get all available EEIO industries
  getEEIOIndustries(): string[] {
    return Object.keys(EEIO_FACTORS);
  }

  // Get sectors for an industry
  getEEIOSectors(industry: string): string[] {
    return Object.keys(EEIO_FACTORS[industry] || EEIO_FACTORS['Other']);
  }

  // Identify Scope 3 hotspots
  async identifyHotspots(
    organizationId: string,
    year: number
  ): Promise<Scope3Hotspot[]> {
    const summary = await this.getOrganizationScope3Summary(organizationId, year);
    const totalEmissions = summary.reduce((sum, cat) => sum + cat.emissions_tco2e, 0);

    if (totalEmissions === 0) {
      return [];
    }

    // Get suppliers for top contributors
    const { data: suppliers } = await supabase
      .from('supplier_emissions')
      .select(`
        allocated_emissions,
        supplier:suppliers(name, industry)
      `)
      .eq('organization_id', organizationId)
      .eq('reporting_year', year)
      .order('allocated_emissions', { ascending: false })
      .limit(10);

    const hotspots: Scope3Hotspot[] = summary
      .filter(cat => cat.emissions_tco2e > 0)
      .sort((a, b) => b.emissions_tco2e - a.emissions_tco2e)
      .slice(0, 5)
      .map(cat => {
        const percentage = (cat.emissions_tco2e / totalEmissions) * 100;
        
        return {
          category_number: cat.category_number,
          category_name: cat.category_name,
          emissions_tco2e: cat.emissions_tco2e,
          percentage_of_total: percentage,
          trend: 'stable' as const,
          top_contributors: (suppliers || []).slice(0, 3).map((s: any) => ({
            name: s.supplier?.name || 'Unknown',
            emissions: Number(s.allocated_emissions) || 0,
            type: 'supplier' as const
          })),
          reduction_potential: this.estimateReductionPotential(cat.category_number),
          recommended_actions: this.getRecommendedActions(cat.category_number)
        };
      });

    return hotspots;
  }

  // Estimate reduction potential by category
  private estimateReductionPotential(categoryNumber: number): number {
    const potentials: Record<number, number> = {
      1: 25, // Purchased goods - supplier engagement
      2: 15, // Capital goods - longer asset life
      3: 20, // Fuel/energy - renewable transition
      4: 30, // Upstream transport - mode shift
      5: 35, // Waste - circular economy
      6: 40, // Business travel - virtual meetings
      7: 25, // Commuting - remote work
      8: 20, // Leased assets - efficiency
      9: 25, // Downstream transport
      10: 15, // Processing
      11: 30, // Product use - design
      12: 40, // End-of-life - recyclability
      13: 20, // Downstream leased
      14: 25, // Franchises
      15: 20  // Investments
    };
    return potentials[categoryNumber] || 20;
  }

  // Get recommended actions by category
  private getRecommendedActions(categoryNumber: number): string[] {
    const actions: Record<number, string[]> = {
      1: [
        'Engage top suppliers to set science-based targets',
        'Switch to low-carbon alternatives for key materials',
        'Implement sustainable procurement policies'
      ],
      2: [
        'Extend asset lifetimes through maintenance',
        'Purchase refurbished or remanufactured equipment',
        'Lease instead of buy to improve utilization'
      ],
      3: [
        'Switch to renewable energy sources',
        'Reduce grid electricity consumption',
        'Install on-site solar/wind generation'
      ],
      4: [
        'Shift from air to sea/rail freight',
        'Consolidate shipments to improve efficiency',
        'Partner with low-carbon logistics providers'
      ],
      5: [
        'Implement zero-waste-to-landfill programs',
        'Improve recycling and composting rates',
        'Reduce packaging waste at source'
      ],
      6: [
        'Replace air travel with video conferencing',
        'Use rail for short/medium distances',
        'Implement sustainable travel policies'
      ],
      7: [
        'Offer remote/hybrid work options',
        'Provide EV charging at workplace',
        'Incentivize public transit and cycling'
      ],
      8: [
        'Improve energy efficiency of leased assets',
        'Negotiate green lease clauses',
        'Monitor and optimize asset utilization'
      ],
      9: [
        'Optimize distribution network',
        'Use electric delivery vehicles',
        'Implement customer pickup options'
      ],
      10: [
        'Design for manufacturing efficiency',
        'Provide low-carbon processing guidance',
        'Partner with efficient processors'
      ],
      11: [
        'Design energy-efficient products',
        'Enable repair and refurbishment',
        'Provide usage optimization guidance'
      ],
      12: [
        'Design for recyclability and disassembly',
        'Implement take-back programs',
        'Use recyclable/biodegradable materials'
      ],
      13: [
        'Retrofit leased assets for efficiency',
        'Include green clauses in lease agreements',
        'Monitor tenant energy usage'
      ],
      14: [
        'Require franchisees to report emissions',
        'Set franchise sustainability standards',
        'Provide low-carbon operations training'
      ],
      15: [
        'Screen investments for climate risk',
        'Divest from high-carbon assets',
        'Engage portfolio companies on climate'
      ]
    };
    return actions[categoryNumber] || ['Review and assess emission reduction opportunities'];
  }

  // Save Scope 3 summary for a category
  async saveScope3Summary(
    organizationId: string,
    year: number,
    categoryNumber: number,
    data: Partial<Scope3Summary>
  ): Promise<void> {
    const { error } = await supabase
      .from('organization_scope3_summary')
      .upsert([{
        organization_id: organizationId,
        reporting_year: year,
        category_number: categoryNumber,
        emissions_tco2e: data.emissions_tco2e || 0,
        data_quality: (data.data_quality || 'estimated') as 'primary' | 'secondary' | 'estimated' | 'spend_based',
        supplier_data_percentage: data.supplier_data_percentage || 0,
        spend_based_percentage: data.spend_based_percentage || 100,
        industry_average_percentage: data.industry_average_percentage || 0,
        last_calculated: new Date().toISOString()
      }], {
        onConflict: 'organization_id,reporting_year,category_number'
      });

    if (error) throw error;
  }

  // Calculate total Scope 3 emissions
  async getTotalScope3Emissions(
    organizationId: string,
    year: number
  ): Promise<{ total: number; upstream: number; downstream: number }> {
    const summary = await this.getOrganizationScope3Summary(organizationId, year);
    
    let upstream = 0;
    let downstream = 0;

    summary.forEach(cat => {
      if (cat.category_number <= 8) {
        upstream += cat.emissions_tco2e;
      } else {
        downstream += cat.emissions_tco2e;
      }
    });

    return {
      total: upstream + downstream,
      upstream,
      downstream
    };
  }

  // Get data quality score for organization
  async getDataQualityScore(
    organizationId: string,
    year: number
  ): Promise<{ score: number; breakdown: Record<string, number> }> {
    const summary = await this.getOrganizationScope3Summary(organizationId, year);
    
    if (summary.length === 0) {
      return { score: 0, breakdown: {} };
    }

    const qualityWeights: Record<string, number> = {
      'primary': 100,
      'secondary': 75,
      'estimated': 50,
      'spend_based': 25
    };

    let totalScore = 0;
    const breakdown: Record<string, number> = {
      'primary': 0,
      'secondary': 0,
      'estimated': 0,
      'spend_based': 0
    };

    summary.forEach(cat => {
      const quality = cat.data_quality || 'estimated';
      totalScore += qualityWeights[quality] || 50;
      breakdown[quality] = (breakdown[quality] || 0) + 1;
    });

    return {
      score: Math.round(totalScore / summary.length),
      breakdown
    };
  }
}

export const scope3Service = new Scope3Service();
