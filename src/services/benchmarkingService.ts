import { supabase } from '@/integrations/supabase/client';

interface BenchmarkData {
  industry: string;
  naicsCode: string;
  metricType: string;
  unit: string;
  percentiles: {
    p10?: number;
    p25: number;
    p50: number;
    p75: number;
    p90?: number;
  };
  sampleSize: number;
  lastUpdated: string;
  source?: string;
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
  private benchmarkData: Map<string, BenchmarkData[]> = new Map();

  async loadBenchmarkData(): Promise<void> {
    const { data, error } = await supabase
      .from('industry_benchmarks')
      .select('*')
      .order('year', { ascending: false });

    if (error) {
      throw new Error(`Failed to load benchmark data: ${error.message}`);
    }

    this.benchmarkData.clear();

    (data || []).forEach(row => {
      const entry: BenchmarkData = {
        industry: row.industry,
        naicsCode: row.naics_code,
        metricType: row.metric_type,
        unit: row.unit,
        percentiles: {
          p10: row.p10 ?? undefined,
          p25: row.p25 ?? 0,
          p50: row.p50 ?? 0,
          p75: row.p75 ?? 0,
          p90: row.p90 ?? undefined,
        },
        sampleSize: row.sample_size ?? 0,
        lastUpdated: row.last_updated ?? '',
        source: row.source ?? undefined,
      };

      const existing = this.benchmarkData.get(row.naics_code) || [];
      existing.push(entry);
      this.benchmarkData.set(row.naics_code, existing);
    });
  }

  compareToIndustry(
    naicsCode: string,
    yourEmissions: number,
    metric: string
  ): PeerComparison | null {
    const benchmarks = this.benchmarkData.get(naicsCode);
    if (!benchmarks) return null;

    const benchmark = benchmarks.find(b => b.metricType === metric);
    if (!benchmark) return null;

    const percentiles = benchmark.percentiles;
    const industryMedian = percentiles.p50;

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
    const gapPercentage = industryMedian > 0 ? (gapToMedian / industryMedian) * 100 : 0;

    const gapAnalysis = gapToMedian > 0
      ? `${gapPercentage.toFixed(1)}% above industry median`
      : `${Math.abs(gapPercentage).toFixed(1)}% below industry median`;

    const opportunities = this.generateOpportunities(performance);

    return {
      yourValue: yourEmissions,
      industryMedian,
      percentileRank,
      performance,
      gapAnalysis,
      opportunities
    };
  }

  private generateOpportunities(performance: PeerComparison['performance']): string[] {
    const opportunities = [];

    if (performance === 'bottom-quartile' || performance === 'below-average') {
      opportunities.push('Implement energy management system (ISO 50001)');
      opportunities.push('Conduct energy audit to identify efficiency opportunities');
      opportunities.push('Transition to renewable energy sources');
      opportunities.push('Engage suppliers on emission reduction initiatives');
    }

    if (performance === 'top-quartile') {
      opportunities.push('Share best practices with industry peers');
      opportunities.push('Consider more ambitious science-based targets');
      opportunities.push('Explore carbon negative initiatives');
    }

    return opportunities;
  }

  getAvailableNaicsCodes(): string[] {
    return Array.from(this.benchmarkData.keys());
  }

  getBenchmarksForIndustry(naicsCode: string): BenchmarkData[] {
    return this.benchmarkData.get(naicsCode) || [];
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
      return 'Benchmark data not available for this industry. Please add benchmark data first.';
    }

    const benchmarks = this.benchmarkData.get(naicsCode);
    const sampleSize = benchmarks?.[0]?.sampleSize || 0;

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
This analysis is based on ${sampleSize} peer companies in your industry.
    `.trim();
  }
}

export const benchmarkingService = new BenchmarkingService();
