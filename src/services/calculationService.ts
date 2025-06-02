
import { EmissionFactor, CalculationResult, LocationSpecificData } from '@/types/calculations';

class CalculationService {
  private emissionFactors: Map<string, EmissionFactor[]> = new Map();
  private locationData: Map<string, LocationSpecificData> = new Map();

  async getEmissionFactor(
    activityType: string, 
    region?: string, 
    methodology?: string
  ): Promise<EmissionFactor | null> {
    const factors = this.emissionFactors.get(activityType) || [];
    
    // Priority: region-specific, then methodology-specific, then default
    let factor = factors.find(f => f.region === region && f.methodology === methodology);
    if (!factor) factor = factors.find(f => f.region === region);
    if (!factor) factor = factors.find(f => f.methodology === methodology);
    if (!factor) factor = factors[0];
    
    return factor || null;
  }

  calculateEmissions(
    activityData: number,
    activityType: string,
    location?: string,
    methodology: string = 'GHG Protocol'
  ): Promise<CalculationResult> {
    return new Promise(async (resolve) => {
      const factor = await this.getEmissionFactor(activityType, location, methodology);
      
      if (!factor) {
        throw new Error(`No emission factor found for ${activityType}`);
      }

      const value = activityData * factor.value;
      const uncertainty = Math.sqrt(
        Math.pow(factor.uncertainty || 0, 2) + 
        Math.pow(0.05, 2) // 5% data uncertainty assumption
      );

      const confidence = this.calculateConfidence(factor, activityData);

      resolve({
        value,
        unit: factor.unit,
        uncertainty,
        confidence,
        method: methodology,
        factors: [factor],
        timestamp: new Date().toISOString()
      });
    });
  }

  private calculateConfidence(factor: EmissionFactor, activityData: number): number {
    let confidence = 100;
    
    // Reduce confidence based on factor age
    const ageInDays = (Date.now() - new Date(factor.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays > 365) confidence -= 10;
    if (ageInDays > 730) confidence -= 20;
    
    // Reduce confidence based on data quality
    if (!factor.region) confidence -= 15;
    if (factor.uncertainty && factor.uncertainty > 0.2) confidence -= 10;
    
    return Math.max(confidence, 30);
  }

  async loadEmissionFactors(): Promise<void> {
    // Load comprehensive emission factors database
    const factors: EmissionFactor[] = [
      {
        id: 'electricity-us-avg',
        name: 'Electricity - US Average',
        value: 0.386,
        unit: 'kg CO2e/kWh',
        source: 'EPA eGRID 2023',
        region: 'US',
        country: 'United States',
        methodology: 'GHG Protocol',
        uncertainty: 0.05,
        lastUpdated: '2023-12-01'
      },
      {
        id: 'natural-gas-combustion',
        name: 'Natural Gas Combustion',
        value: 0.0531,
        unit: 'kg CO2e/kWh',
        source: 'IPCC 2021',
        methodology: 'GHG Protocol',
        uncertainty: 0.02,
        lastUpdated: '2023-06-01'
      }
    ];

    // Group by activity type for quick lookup
    factors.forEach(factor => {
      const key = factor.name.toLowerCase().split(' - ')[0];
      if (!this.emissionFactors.has(key)) {
        this.emissionFactors.set(key, []);
      }
      this.emissionFactors.get(key)!.push(factor);
    });
  }
}

export const calculationService = new CalculationService();
