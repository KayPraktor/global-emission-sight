/**
 * Spend-Based Emission Estimation Service
 * Uses EEIO (Environmentally Extended Input-Output) methodology
 * Based on EPA and EXIOBASE emission factors
 */

// EEIO emission factors by NAICS-like categories (kgCO2e per USD)
// Source: EPA USEEIO model and industry studies
const EEIO_EMISSION_FACTORS: Record<string, Record<string, {
  factor: number;
  uncertainty: number;
  source: string;
  year: number;
}>> = {
  'Agriculture & Food': {
    'Crop Production': { factor: 0.85, uncertainty: 0.25, source: 'EPA USEEIO', year: 2023 },
    'Animal Production': { factor: 1.45, uncertainty: 0.30, source: 'EPA USEEIO', year: 2023 },
    'Food Manufacturing': { factor: 0.55, uncertainty: 0.20, source: 'EPA USEEIO', year: 2023 },
    'Beverages': { factor: 0.42, uncertainty: 0.18, source: 'EPA USEEIO', year: 2023 },
    'Food Services': { factor: 0.38, uncertainty: 0.15, source: 'EPA USEEIO', year: 2023 },
  },
  'Manufacturing': {
    'Chemical Manufacturing': { factor: 0.72, uncertainty: 0.25, source: 'EPA USEEIO', year: 2023 },
    'Pharmaceutical Manufacturing': { factor: 0.45, uncertainty: 0.20, source: 'EPA USEEIO', year: 2023 },
    'Plastics & Rubber': { factor: 0.58, uncertainty: 0.22, source: 'EPA USEEIO', year: 2023 },
    'Metal Manufacturing': { factor: 0.68, uncertainty: 0.25, source: 'EPA USEEIO', year: 2023 },
    'Machinery Manufacturing': { factor: 0.42, uncertainty: 0.18, source: 'EPA USEEIO', year: 2023 },
    'Electronics Manufacturing': { factor: 0.52, uncertainty: 0.20, source: 'EPA USEEIO', year: 2023 },
    'Automotive Manufacturing': { factor: 0.48, uncertainty: 0.22, source: 'EPA USEEIO', year: 2023 },
    'Aerospace Manufacturing': { factor: 0.55, uncertainty: 0.25, source: 'EPA USEEIO', year: 2023 },
    'Textile Manufacturing': { factor: 0.45, uncertainty: 0.20, source: 'EPA USEEIO', year: 2023 },
    'Paper Manufacturing': { factor: 0.38, uncertainty: 0.18, source: 'EPA USEEIO', year: 2023 },
    'General Manufacturing': { factor: 0.50, uncertainty: 0.22, source: 'Industry Average', year: 2023 },
  },
  'Energy & Utilities': {
    'Electricity Generation': { factor: 0.92, uncertainty: 0.15, source: 'EPA eGRID', year: 2023 },
    'Natural Gas Distribution': { factor: 0.28, uncertainty: 0.12, source: 'EPA USEEIO', year: 2023 },
    'Water & Sewage': { factor: 0.18, uncertainty: 0.10, source: 'EPA USEEIO', year: 2023 },
    'Waste Management': { factor: 0.42, uncertainty: 0.20, source: 'EPA USEEIO', year: 2023 },
    'Renewable Energy': { factor: 0.05, uncertainty: 0.02, source: 'IEA', year: 2023 },
  },
  'Transportation & Logistics': {
    'Air Transportation': { factor: 1.85, uncertainty: 0.25, source: 'ICAO', year: 2023 },
    'Rail Transportation': { factor: 0.08, uncertainty: 0.05, source: 'EPA USEEIO', year: 2023 },
    'Trucking': { factor: 0.25, uncertainty: 0.10, source: 'EPA USEEIO', year: 2023 },
    'Maritime Shipping': { factor: 0.04, uncertainty: 0.02, source: 'IMO', year: 2023 },
    'Warehousing & Storage': { factor: 0.15, uncertainty: 0.08, source: 'EPA USEEIO', year: 2023 },
    'Courier & Delivery': { factor: 0.55, uncertainty: 0.18, source: 'Industry Average', year: 2023 },
    'Public Transit': { factor: 0.12, uncertainty: 0.06, source: 'EPA USEEIO', year: 2023 },
  },
  'Construction': {
    'Building Construction': { factor: 0.35, uncertainty: 0.15, source: 'EPA USEEIO', year: 2023 },
    'Heavy & Civil Engineering': { factor: 0.45, uncertainty: 0.18, source: 'EPA USEEIO', year: 2023 },
    'Construction Materials': { factor: 0.52, uncertainty: 0.20, source: 'EPA USEEIO', year: 2023 },
    'Cement & Concrete': { factor: 0.85, uncertainty: 0.22, source: 'GCCA', year: 2023 },
    'Steel & Iron': { factor: 0.72, uncertainty: 0.25, source: 'World Steel', year: 2023 },
  },
  'Professional Services': {
    'Legal Services': { factor: 0.08, uncertainty: 0.04, source: 'EPA USEEIO', year: 2023 },
    'Accounting Services': { factor: 0.07, uncertainty: 0.03, source: 'EPA USEEIO', year: 2023 },
    'Management Consulting': { factor: 0.10, uncertainty: 0.05, source: 'EPA USEEIO', year: 2023 },
    'Engineering Services': { factor: 0.12, uncertainty: 0.06, source: 'EPA USEEIO', year: 2023 },
    'IT Services': { factor: 0.15, uncertainty: 0.07, source: 'Industry Average', year: 2023 },
    'Marketing & Advertising': { factor: 0.11, uncertainty: 0.05, source: 'EPA USEEIO', year: 2023 },
    'R&D Services': { factor: 0.14, uncertainty: 0.07, source: 'EPA USEEIO', year: 2023 },
  },
  'Financial Services': {
    'Banking': { factor: 0.06, uncertainty: 0.03, source: 'PCAF', year: 2023 },
    'Insurance': { factor: 0.05, uncertainty: 0.02, source: 'PCAF', year: 2023 },
    'Investment Management': { factor: 0.08, uncertainty: 0.04, source: 'PCAF', year: 2023 },
    'Real Estate': { factor: 0.18, uncertainty: 0.08, source: 'EPA USEEIO', year: 2023 },
  },
  'Healthcare': {
    'Hospitals': { factor: 0.28, uncertainty: 0.12, source: 'Health Care Without Harm', year: 2023 },
    'Medical Equipment': { factor: 0.35, uncertainty: 0.15, source: 'EPA USEEIO', year: 2023 },
    'Pharmaceuticals': { factor: 0.45, uncertainty: 0.18, source: 'EPA USEEIO', year: 2023 },
    'Healthcare Services': { factor: 0.22, uncertainty: 0.10, source: 'EPA USEEIO', year: 2023 },
  },
  'Retail & Wholesale': {
    'General Merchandise': { factor: 0.18, uncertainty: 0.08, source: 'EPA USEEIO', year: 2023 },
    'Food & Beverage Retail': { factor: 0.25, uncertainty: 0.10, source: 'EPA USEEIO', year: 2023 },
    'Electronics Retail': { factor: 0.22, uncertainty: 0.10, source: 'EPA USEEIO', year: 2023 },
    'Wholesale Trade': { factor: 0.15, uncertainty: 0.07, source: 'EPA USEEIO', year: 2023 },
    'E-commerce': { factor: 0.28, uncertainty: 0.12, source: 'Industry Average', year: 2023 },
  },
  'Technology': {
    'Software Development': { factor: 0.12, uncertainty: 0.06, source: 'Industry Average', year: 2023 },
    'Data Centers': { factor: 0.45, uncertainty: 0.15, source: 'IEA', year: 2023 },
    'Telecommunications': { factor: 0.18, uncertainty: 0.08, source: 'EPA USEEIO', year: 2023 },
    'Hardware Manufacturing': { factor: 0.55, uncertainty: 0.20, source: 'EPA USEEIO', year: 2023 },
    'Cloud Services': { factor: 0.25, uncertainty: 0.10, source: 'Industry Average', year: 2023 },
  },
};

// Scope 3 category mapping to EEIO sectors
const SCOPE3_CATEGORY_MAPPING: Record<number, string[]> = {
  1: ['Manufacturing', 'Retail & Wholesale', 'Agriculture & Food'], // Purchased goods
  2: ['Manufacturing', 'Construction'], // Capital goods
  3: ['Energy & Utilities'], // Fuel and energy
  4: ['Transportation & Logistics'], // Upstream transport
  5: ['Energy & Utilities'], // Waste
  6: ['Transportation & Logistics'], // Business travel
  7: ['Transportation & Logistics'], // Commuting
  8: ['Construction', 'Professional Services'], // Upstream leased
  9: ['Transportation & Logistics'], // Downstream transport
  10: ['Manufacturing'], // Processing
  11: ['Energy & Utilities'], // Use of products
  12: ['Energy & Utilities'], // End of life
  13: ['Construction'], // Downstream leased
  14: ['Retail & Wholesale', 'Professional Services'], // Franchises
  15: ['Financial Services'], // Investments
};

export interface SpendEstimationInput {
  spend: number;
  currency: string;
  industry: string;
  sector?: string;
  scope3Category?: number;
}

export interface SpendEstimationResult {
  emissions_kgco2e: number;
  emissions_tco2e: number;
  emission_factor: number;
  uncertainty_lower: number;
  uncertainty_upper: number;
  methodology: string;
  data_quality: 'high' | 'medium' | 'low';
  source: string;
  year: number;
}

class SpendBasedEstimationService {
  // Get available industries
  getIndustries(): string[] {
    return Object.keys(EEIO_EMISSION_FACTORS);
  }

  // Get sectors for an industry
  getSectors(industry: string): string[] {
    return Object.keys(EEIO_EMISSION_FACTORS[industry] || {});
  }

  // Get emission factor for industry/sector
  getEmissionFactor(industry: string, sector?: string): {
    factor: number;
    uncertainty: number;
    source: string;
    year: number;
  } | null {
    const industryFactors = EEIO_EMISSION_FACTORS[industry];
    if (!industryFactors) return null;

    if (sector && industryFactors[sector]) {
      return industryFactors[sector];
    }

    // Return average for industry if no specific sector
    const factors = Object.values(industryFactors);
    const avgFactor = factors.reduce((sum, f) => sum + f.factor, 0) / factors.length;
    const avgUncertainty = factors.reduce((sum, f) => sum + f.uncertainty, 0) / factors.length;

    return {
      factor: avgFactor,
      uncertainty: avgUncertainty,
      source: 'Industry Average',
      year: 2023
    };
  }

  // Convert currency to USD (simplified - in production use real exchange rates)
  private convertToUSD(amount: number, currency: string): number {
    const exchangeRates: Record<string, number> = {
      'USD': 1,
      'EUR': 1.08,
      'GBP': 1.27,
      'JPY': 0.0067,
      'CAD': 0.74,
      'AUD': 0.65,
      'CHF': 1.12,
      'CNY': 0.14,
      'INR': 0.012,
      'BRL': 0.20,
    };
    return amount * (exchangeRates[currency] || 1);
  }

  // Estimate emissions from spend data
  estimateEmissions(input: SpendEstimationInput): SpendEstimationResult {
    // Convert spend to USD
    const spendUSD = this.convertToUSD(input.spend, input.currency);

    // Get appropriate emission factor
    const factorData = this.getEmissionFactor(input.industry, input.sector);
    
    if (!factorData) {
      // Use default factor if industry not found
      const defaultFactor = 0.30;
      const emissions = spendUSD * defaultFactor;
      
      return {
        emissions_kgco2e: emissions,
        emissions_tco2e: emissions / 1000,
        emission_factor: defaultFactor,
        uncertainty_lower: emissions * 0.5,
        uncertainty_upper: emissions * 1.5,
        methodology: 'Spend-based estimation using default factor',
        data_quality: 'low',
        source: 'Default',
        year: 2023
      };
    }

    const emissions = spendUSD * factorData.factor;
    const uncertaintyRange = emissions * factorData.uncertainty;

    // Determine data quality based on uncertainty
    let dataQuality: 'high' | 'medium' | 'low' = 'medium';
    if (factorData.uncertainty <= 0.10) dataQuality = 'high';
    else if (factorData.uncertainty >= 0.25) dataQuality = 'low';

    return {
      emissions_kgco2e: emissions,
      emissions_tco2e: emissions / 1000,
      emission_factor: factorData.factor,
      uncertainty_lower: emissions - uncertaintyRange,
      uncertainty_upper: emissions + uncertaintyRange,
      methodology: `Spend-based estimation using EEIO factors for ${input.industry}${input.sector ? ` - ${input.sector}` : ''}`,
      data_quality: dataQuality,
      source: factorData.source,
      year: factorData.year
    };
  }

  // Estimate emissions for a Scope 3 category from spend
  estimateScope3CategoryEmissions(
    spend: number,
    currency: string,
    scope3Category: number,
    supplierIndustry?: string
  ): SpendEstimationResult {
    // Get recommended industries for this Scope 3 category
    const recommendedIndustries = SCOPE3_CATEGORY_MAPPING[scope3Category] || ['Manufacturing'];
    
    // Use supplier industry if provided and valid, otherwise use first recommended
    const industry = supplierIndustry && EEIO_EMISSION_FACTORS[supplierIndustry]
      ? supplierIndustry
      : recommendedIndustries[0];

    return this.estimateEmissions({
      spend,
      currency,
      industry,
      scope3Category
    });
  }

  // Batch estimate for multiple suppliers
  batchEstimate(
    suppliers: Array<{
      name: string;
      spend: number;
      currency: string;
      industry: string;
      sector?: string;
    }>
  ): Array<{
    name: string;
    result: SpendEstimationResult;
  }> {
    return suppliers.map(supplier => ({
      name: supplier.name,
      result: this.estimateEmissions({
        spend: supplier.spend,
        currency: supplier.currency,
        industry: supplier.industry,
        sector: supplier.sector
      })
    }));
  }

  // Get data quality assessment for organization
  assessDataQualityMix(
    estimations: SpendEstimationResult[]
  ): {
    primaryPercentage: number;
    spendBasedPercentage: number;
    overallQuality: 'high' | 'medium' | 'low';
    recommendations: string[];
  } {
    if (estimations.length === 0) {
      return {
        primaryPercentage: 0,
        spendBasedPercentage: 100,
        overallQuality: 'low',
        recommendations: ['Start collecting primary data from suppliers']
      };
    }

    const qualityCounts = { high: 0, medium: 0, low: 0 };
    estimations.forEach(e => qualityCounts[e.data_quality]++);

    const total = estimations.length;
    const recommendations: string[] = [];

    // Determine overall quality
    let overallQuality: 'high' | 'medium' | 'low' = 'medium';
    if (qualityCounts.high / total >= 0.5) overallQuality = 'high';
    else if (qualityCounts.low / total >= 0.5) overallQuality = 'low';

    // Generate recommendations
    if (overallQuality === 'low') {
      recommendations.push('Prioritize collecting primary data from major suppliers');
      recommendations.push('Use product-level emission factors where available');
    }
    if (qualityCounts.low > qualityCounts.high) {
      recommendations.push('Improve industry categorization for better estimation accuracy');
    }

    return {
      primaryPercentage: 0, // All spend-based is 0% primary
      spendBasedPercentage: 100,
      overallQuality,
      recommendations
    };
  }

  // Get recommended sectors for a Scope 3 category
  getRecommendedSectors(scope3Category: number): {
    industry: string;
    sectors: string[];
  }[] {
    const industries = SCOPE3_CATEGORY_MAPPING[scope3Category] || ['Manufacturing'];
    
    return industries.map(industry => ({
      industry,
      sectors: this.getSectors(industry)
    }));
  }
}

export const spendBasedEstimation = new SpendBasedEstimationService();
