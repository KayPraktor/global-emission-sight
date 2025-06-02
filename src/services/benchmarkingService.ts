
interface BenchmarkData {
  industry: string;
  naicsCode: string;
  metrics: {
    emissionsPerRevenue: number; // tCO2e per $M revenue
    emissionsPerEmployee: number; // tCO2e per employee
    emissionsPerSqFt: number; // tCO2e per sq ft
    scope1Percentage: number;
    scope2Percentage: number;
    scope3Percentage: number;
  };
  percentiles: {
    p25: number;
    p50: number; // median
    p75: number;
    p90: number;
  };
  sampleSize: number;
  lastUpdated: string;
}

interface PeerComparison {
  yourValue: number;
  industryMedian: number;
  percentileRank: number;
  performance: 'top-quartile' | 'above-average' | 'below-average' | 'bottom-quartile';
  gapAnalysis: string;
  opportunities: string[];
}

class BenchmarkingService {
  private benchmarkData: Map<string, BenchmarkData> = new Map();

  async loadBenchmarkData(): Promise<void> {
    // In a real implementation, this would load from a comprehensive database
    const industries: BenchmarkData[] = [
      {
        industry: 'Manufacturing - Automotive',
        naicsCode: '3361',
        metrics: {
          emissionsPerRevenue: 45.2,
          emissionsPerEmployee: 12.8,
          emissionsPerSqFt: 0.089,
          scope1Percentage: 35,
          scope2Percentage: 45,
          scope3Percentage: 20
        },
        percentiles: {
          p25: 28.1,
          p50: 45.2,
          p75: 62.8,
          p90: 89.5
        },
        sampleSize: 156,
        lastUpdated: '2024-03-01'
      },
      {
        industry: 'Technology - Software',
        naicsCode: '5415',
        metrics: {
          emissionsPerRevenue: 2.1,
          emissionsPerEmployee: 3.2,
          emissionsPerSqFt: 0.015,
          scope1Percentage: 5,
          scope2Percentage: 25,
          scope3Percentage: 70
        },
        percentiles: {
          p25: 1.2,
          p50: 2.1,
          p75: 3.8,
          p90: 6.2
        },
        sampleSize: 89,
        lastUpdated: '2024-02-15'
      }
    ];

    industries.forEach(industry => {
      this.benchmarkData.set(industry.naicsCode, industry);
    });
  }

  compareToIndustry(
    naicsCode: string,
    yourEmissions: number,
    metric: 'emissionsPerRevenue' | 'emissionsPerEmployee' | 'emissionsPerSqFt'
  ): PeerComparison | null {
    const benchmark = this.benchmarkData.get(naicsCode);
    if (!benchmark) return null;

    const industryMedian = benchmark.metrics[metric];
    const percentiles = benchmark.percentiles;
    
    let percentileRank = 50;
    let performance: PeerComparison['performance'] = 'below-average';
    
    if (yourEmissions <= percentiles.p25) {
      percentileRank = 25;
      performance = 'top-quartile';
    } else if (yourEmissions <= percentiles.p50) {
      percentileRank = 37.5;
      performance = 'above-average';
    } else if (yourEmissions <= percentiles.p75) {
      percentileRank = 62.5;
      performance = 'below-average';
    } else {
      percentileRank = 87.5;
      performance = 'bottom-quartile';
    }

    const gapToMedian = yourEmissions - industryMedian;
    const gapPercentage = (gapToMedian / industryMedian) * 100;
    
    const gapAnalysis = gapToMedian > 0 
      ? `${gapPercentage.toFixed(1)}% above industry median`
      : `${Math.abs(gapPercentage).toFixed(1)}% below industry median`;

    const opportunities = this.generateOpportunities(performance, benchmark);

    return {
      yourValue: yourEmissions,
      industryMedian,
      percentileRank,
      performance,
      gapAnalysis,
      opportunities
    };
  }

  private generateOpportunities(
    performance: PeerComparison['performance'],
    benchmark: BenchmarkData
  ): string[] {
    const opportunities = [];

    if (performance === 'bottom-quartile' || performance === 'below-average') {
      opportunities.push('Implement energy management system (ISO 50001)');
      opportunities.push('Conduct energy audit to identify efficiency opportunities');
      
      if (benchmark.metrics.scope2Percentage > 30) {
        opportunities.push('Transition to renewable energy sources');
      }
      
      if (benchmark.metrics.scope3Percentage > 50) {
        opportunities.push('Engage suppliers on emission reduction initiatives');
        opportunities.push('Optimize supply chain and logistics');
      }
    }

    if (performance === 'top-quartile') {
      opportunities.push('Share best practices with industry peers');
      opportunities.push('Consider more ambitious science-based targets');
      opportunities.push('Explore carbon negative initiatives');
    }

    return opportunities;
  }

  getIndustryTrends(naicsCode: string): {
    trend: 'improving' | 'stable' | 'worsening';
    annualChange: number;
    description: string;
  } {
    // This would analyze historical benchmark data
    return {
      trend: 'improving',
      annualChange: -3.2, // 3.2% annual improvement
      description: 'Industry emissions intensity has improved by 3.2% annually over the past 3 years'
    };
  }

  generateBenchmarkReport(
    naicsCode: string,
    companyData: {
      emissions: number;
      revenue: number;
      employees: number;
      sqFt: number;
    }
  ): string {
    const revenueComparison = this.compareToIndustry(
      naicsCode,
      companyData.emissions / (companyData.revenue / 1000000),
      'emissionsPerRevenue'
    );

    const employeeComparison = this.compareToIndustry(
      naicsCode,
      companyData.emissions / companyData.employees,
      'emissionsPerEmployee'
    );

    if (!revenueComparison || !employeeComparison) {
      return 'Benchmark data not available for this industry.';
    }

    return `
Industry Benchmark Report

Revenue Intensity: ${revenueComparison.gapAnalysis}
Employee Intensity: ${employeeComparison.gapAnalysis}

Performance Summary:
- Revenue-based ranking: ${revenueComparison.performance}
- Employee-based ranking: ${employeeComparison.performance}

Key Opportunities:
${revenueComparison.opportunities.map(o => `• ${o}`).join('\n')}

Industry Context:
This analysis is based on ${this.benchmarkData.get(naicsCode)?.sampleSize} peer companies in your industry.
    `.trim();
  }
}

export const benchmarkingService = new BenchmarkingService();
