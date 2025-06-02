
interface LCAResult {
  productName: string;
  functionalUnit: string;
  totalGWP: number; // Global Warming Potential in kg CO2e
  lifeCycleStages: {
    rawMaterials: number;
    manufacturing: number;
    transportation: number;
    usePhase: number;
    endOfLife: number;
  };
  impactCategories: {
    climateChange: number;
    acidification: number;
    eutrophication: number;
    ozoneDepletion: number;
    resourceDepletion: number;
  };
  dataQuality: number;
  uncertainty: number;
}

interface LCAComparison {
  products: LCAResult[];
  winner: string;
  improvementPotential: {
    stage: string;
    potential: number;
    recommendations: string[];
  }[];
}

class LCAService {
  private lcaDatabase: Map<string, any> = new Map();

  async calculateProductLCA(
    productSpec: {
      name: string;
      materials: { type: string; quantity: number; unit: string }[];
      energy: { source: string; amount: number; unit: string }[];
      transportation: { mode: string; distance: number }[];
      lifespan: number; // years
      endOfLifeScenario: string;
    }
  ): Promise<LCAResult> {
    let rawMaterials = 0;
    let manufacturing = 0;
    let transportation = 0;
    let usePhase = 0;
    let endOfLife = 0;

    // Calculate raw materials impact
    for (const material of productSpec.materials) {
      const factor = await this.getMaterialFactor(material.type);
      rawMaterials += material.quantity * factor;
    }

    // Calculate manufacturing impact
    for (const energy of productSpec.energy) {
      const factor = await this.getEnergyFactor(energy.source);
      manufacturing += energy.amount * factor;
    }

    // Calculate transportation impact
    for (const transport of productSpec.transportation) {
      const factor = await this.getTransportFactor(transport.mode);
      transportation += transport.distance * factor;
    }

    // Calculate use phase (if applicable)
    usePhase = this.calculateUsePhase(productSpec);

    // Calculate end of life
    endOfLife = await this.calculateEndOfLife(productSpec);

    const totalGWP = rawMaterials + manufacturing + transportation + usePhase + endOfLife;

    return {
      productName: productSpec.name,
      functionalUnit: '1 unit',
      totalGWP,
      lifeCycleStages: {
        rawMaterials,
        manufacturing,
        transportation,
        usePhase,
        endOfLife
      },
      impactCategories: {
        climateChange: totalGWP,
        acidification: totalGWP * 0.15, // Simplified correlation
        eutrophication: totalGWP * 0.08,
        ozoneDepletion: totalGWP * 0.002,
        resourceDepletion: totalGWP * 0.25
      },
      dataQuality: 75, // Would be calculated based on data sources
      uncertainty: 15 // Percentage uncertainty
    };
  }

  private async getMaterialFactor(materialType: string): Promise<number> {
    const factors = {
      'steel': 2.1, // kg CO2e/kg
      'aluminum': 8.9,
      'plastic': 3.4,
      'glass': 0.85,
      'concrete': 0.15,
      'wood': -0.9 // negative due to carbon sequestration
    };
    
    return factors[materialType as keyof typeof factors] || 2.0; // default factor
  }

  private async getEnergyFactor(energySource: string): Promise<number> {
    const factors = {
      'grid-electricity': 0.385, // kg CO2e/kWh
      'natural-gas': 0.202,
      'renewable': 0.05,
      'coal': 0.82
    };
    
    return factors[energySource as keyof typeof factors] || 0.385;
  }

  private async getTransportFactor(transportMode: string): Promise<number> {
    const factors = {
      'truck': 0.12, // kg CO2e/km
      'ship': 0.015,
      'rail': 0.03,
      'air': 0.5
    };
    
    return factors[transportMode as keyof typeof factors] || 0.12;
  }

  private calculateUsePhase(productSpec: any): number {
    // Simplified use phase calculation
    // In reality, this would depend heavily on the product type
    return 0; // Many products have minimal use-phase emissions
  }

  private async calculateEndOfLife(productSpec: any): Promise<number> {
    const scenarios = {
      'recycling': -0.5, // Credit for recycling
      'landfill': 0.1,
      'incineration': 0.3,
      'composting': -0.2
    };
    
    const factor = scenarios[productSpec.endOfLifeScenario as keyof typeof scenarios] || 0.1;
    const totalMass = productSpec.materials.reduce((sum: number, m: any) => sum + m.quantity, 0);
    
    return totalMass * factor;
  }

  compareProducts(products: LCAResult[]): LCAComparison {
    const sortedProducts = [...products].sort((a, b) => a.totalGWP - b.totalGWP);
    const winner = sortedProducts[0].productName;
    
    const improvementPotential = this.identifyImprovements(products[0]);
    
    return {
      products: sortedProducts,
      winner,
      improvementPotential
    };
  }

  private identifyImprovements(product: LCAResult): LCAComparison['improvementPotential'] {
    const stages = Object.entries(product.lifeCycleStages)
      .map(([stage, value]) => ({ stage, value }))
      .sort((a, b) => b.value - a.value);
    
    return stages.slice(0, 3).map(stage => ({
      stage: stage.stage,
      potential: (stage.value / product.totalGWP) * 100,
      recommendations: this.getStageRecommendations(stage.stage)
    }));
  }

  private getStageRecommendations(stage: string): string[] {
    const recommendations = {
      rawMaterials: [
        'Consider alternative materials with lower carbon footprint',
        'Increase use of recycled content',
        'Optimize material efficiency and reduce waste'
      ],
      manufacturing: [
        'Implement energy efficiency measures',
        'Transition to renewable energy sources',
        'Optimize production processes'
      ],
      transportation: [
        'Optimize logistics and reduce transport distances',
        'Use more efficient transport modes',
        'Consolidate shipments'
      ],
      usePhase: [
        'Improve product energy efficiency',
        'Extend product lifespan',
        'Provide user guidance for optimal operation'
      ],
      endOfLife: [
        'Design for recyclability',
        'Improve material separation',
        'Partner with recycling facilities'
      ]
    };
    
    return recommendations[stage as keyof typeof recommendations] || [];
  }

  generateLCAReport(result: LCAResult): string {
    const hotspots = Object.entries(result.lifeCycleStages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    return `
Product LCA Report: ${result.productName}

Carbon Footprint: ${result.totalGWP.toFixed(2)} kg CO2e per ${result.functionalUnit}

Lifecycle Breakdown:
${Object.entries(result.lifeCycleStages)
  .map(([stage, value]) => `- ${stage}: ${value.toFixed(2)} kg CO2e (${((value/result.totalGWP)*100).toFixed(1)}%)`)
  .join('\n')}

Environmental Hotspots:
${hotspots.map(([stage, value]) => 
  `• ${stage}: ${((value/result.totalGWP)*100).toFixed(1)}% of total impact`
).join('\n')}

Data Quality: ${result.dataQuality}% (±${result.uncertainty}% uncertainty)

Key Improvement Opportunities:
${this.identifyImprovements(result)
  .slice(0, 3)
  .map(imp => `• ${imp.stage}: ${imp.potential.toFixed(1)}% reduction potential`)
  .join('\n')}
    `.trim();
  }
}

export const lcaService = new LCAService();
