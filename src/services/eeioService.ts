import { supabase } from '@/integrations/supabase/client';
import type { EEIOFactor, SpendEstimationInput, SpendEstimationResult, SupplierSpendInput, SupplierEmissionResult, CURRENCY_RATES } from '@/types/eeio';

// Re-export currency rates
export { CURRENCY_RATES } from '@/types/eeio';

class EEIOService {
  /**
   * Get all unique industries from the EEIO database
   */
  async getIndustries(): Promise<string[]> {
    const { data, error } = await supabase
      .from('eeio_emission_factors')
      .select('industry')
      .order('industry');
    
    if (error) {
      console.error('Error fetching industries:', error);
      return [];
    }
    
    const uniqueIndustries = [...new Set(data?.map(d => d.industry) || [])];
    return uniqueIndustries;
  }

  /**
   * Get sectors for a specific industry
   */
  async getSectors(industry: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('eeio_emission_factors')
      .select('sector')
      .eq('industry', industry)
      .order('sector');
    
    if (error) {
      console.error('Error fetching sectors:', error);
      return [];
    }
    
    const uniqueSectors = [...new Set(data?.map(d => d.sector) || [])];
    return uniqueSectors;
  }

  /**
   * Get all unique regions from the EEIO database
   */
  async getRegions(): Promise<string[]> {
    const { data, error } = await supabase
      .from('eeio_emission_factors')
      .select('region')
      .order('region');
    
    if (error) {
      console.error('Error fetching regions:', error);
      return [];
    }
    
    const uniqueRegions = [...new Set(data?.map(d => d.region) || [])];
    return uniqueRegions;
  }

  /**
   * Get emission factor with regional preference
   * Falls back to Global if region-specific factor not found
   */
  async getEmissionFactor(
    industry: string,
    sector?: string,
    region?: string
  ): Promise<EEIOFactor | null> {
    let query = supabase
      .from('eeio_emission_factors')
      .select('*')
      .eq('industry', industry);
    
    if (sector) {
      query = query.eq('sector', sector);
    }

    // Try to get region-specific factor first
    if (region && region !== 'Global') {
      const { data: regionData } = await query.eq('region', region).limit(1);
      if (regionData && regionData.length > 0) {
        return regionData[0] as EEIOFactor;
      }
    }

    // Fall back to Global
    const { data: globalData, error } = await query.eq('region', 'Global').limit(1);
    
    if (error) {
      console.error('Error fetching emission factor:', error);
      return null;
    }
    
    return (globalData?.[0] as EEIOFactor) || null;
  }

  /**
   * Get factors by NAICS code
   */
  async getFactorsByNAICS(naicsCode: string): Promise<EEIOFactor[]> {
    const { data, error } = await supabase
      .from('eeio_emission_factors')
      .select('*')
      .eq('naics_code', naicsCode)
      .order('region');
    
    if (error) {
      console.error('Error fetching factors by NAICS:', error);
      return [];
    }
    
    return (data as EEIOFactor[]) || [];
  }

  /**
   * Get recommended factors for a Scope 3 category
   */
  async getScope3CategoryFactors(categoryNumber: number): Promise<EEIOFactor[]> {
    const { data, error } = await supabase
      .from('eeio_emission_factors')
      .select('*')
      .contains('applicable_scope3_categories', [categoryNumber])
      .order('industry')
      .order('sector');
    
    if (error) {
      console.error('Error fetching Scope 3 category factors:', error);
      return [];
    }
    
    return (data as EEIOFactor[]) || [];
  }

  /**
   * Search factors by keyword
   */
  async searchFactors(searchTerm: string): Promise<EEIOFactor[]> {
    const { data, error } = await supabase
      .from('eeio_emission_factors')
      .select('*')
      .or(`industry.ilike.%${searchTerm}%,sector.ilike.%${searchTerm}%,naics_code.ilike.%${searchTerm}%`)
      .order('industry')
      .order('sector')
      .limit(100);
    
    if (error) {
      console.error('Error searching factors:', error);
      return [];
    }
    
    return (data as EEIOFactor[]) || [];
  }

  /**
   * Get all factors with optional filters
   */
  async getAllFactors(filters?: {
    industry?: string;
    sector?: string;
    region?: string;
    dataQualityTier?: string;
  }): Promise<EEIOFactor[]> {
    let query = supabase
      .from('eeio_emission_factors')
      .select('*')
      .order('industry')
      .order('sector')
      .order('region');
    
    if (filters?.industry) {
      query = query.eq('industry', filters.industry);
    }
    if (filters?.sector) {
      query = query.eq('sector', filters.sector);
    }
    if (filters?.region) {
      query = query.eq('region', filters.region);
    }
    if (filters?.dataQualityTier) {
      query = query.eq('data_quality_tier', filters.dataQualityTier);
    }
    
    const { data, error } = await query.limit(500);
    
    if (error) {
      console.error('Error fetching all factors:', error);
      return [];
    }
    
    return (data as EEIOFactor[]) || [];
  }

  /**
   * Convert spend to USD
   */
  convertToUSD(amount: number, currency: string): number {
    const { CURRENCY_RATES } = require('@/types/eeio');
    const rate = CURRENCY_RATES[currency] || 1.0;
    return amount * rate;
  }

  /**
   * Calculate emissions from spend data
   */
  async calculateSpendEmissions(input: SpendEstimationInput): Promise<SpendEstimationResult> {
    const factor = await this.getEmissionFactor(input.industry, input.sector, input.region);
    
    if (!factor) {
      return {
        emissions: 0,
        emissionsUnit: 'tCO2e',
        factor: null,
        uncertainty: { lower: 0, upper: 0 },
        dataQuality: 'estimated',
        methodology: 'No matching emission factor found',
      };
    }

    // Convert spend to USD
    const spendUSD = this.convertToUSD(input.spend, input.currency);
    
    // Calculate emissions: spend (USD) * factor (kgCO2e/USD) / 1000 = tCO2e
    const emissions = (spendUSD * factor.factor_value) / 1000;
    
    // Calculate uncertainty range
    const uncertaintyFactor = factor.uncertainty || 0.2;
    const lower = emissions * (1 - uncertaintyFactor);
    const upper = emissions * (1 + uncertaintyFactor);

    return {
      emissions: Math.round(emissions * 100) / 100,
      emissionsUnit: 'tCO2e',
      factor,
      uncertainty: {
        lower: Math.round(lower * 100) / 100,
        upper: Math.round(upper * 100) / 100,
      },
      dataQuality: (factor.data_quality_tier as 'primary' | 'secondary' | 'estimated') || 'secondary',
      methodology: factor.methodology || 'EEIO calculation',
    };
  }

  /**
   * Batch calculate emissions for multiple suppliers
   */
  async batchCalculate(suppliers: SupplierSpendInput[]): Promise<SupplierEmissionResult[]> {
    const results: SupplierEmissionResult[] = [];
    
    for (const supplier of suppliers) {
      const estimation = await this.calculateSpendEmissions({
        spend: supplier.spend,
        currency: supplier.currency,
        industry: supplier.industry,
        sector: supplier.sector,
        region: supplier.region,
      });
      
      results.push({
        ...estimation,
        supplierName: supplier.supplierName,
        spend: supplier.spend,
        currency: supplier.currency,
      });
    }
    
    return results;
  }

  /**
   * Get factor statistics
   */
  async getFactorStats(): Promise<{
    totalFactors: number;
    industries: number;
    regions: number;
    avgUncertainty: number;
  }> {
    const { data, error } = await supabase
      .from('eeio_emission_factors')
      .select('industry, region, uncertainty');
    
    if (error || !data) {
      return { totalFactors: 0, industries: 0, regions: 0, avgUncertainty: 0 };
    }
    
    const uniqueIndustries = new Set(data.map(d => d.industry));
    const uniqueRegions = new Set(data.map(d => d.region));
    const avgUncertainty = data.reduce((sum, d) => sum + (d.uncertainty || 0.2), 0) / data.length;
    
    return {
      totalFactors: data.length,
      industries: uniqueIndustries.size,
      regions: uniqueRegions.size,
      avgUncertainty: Math.round(avgUncertainty * 100) / 100,
    };
  }
}

export const eeioService = new EEIOService();
