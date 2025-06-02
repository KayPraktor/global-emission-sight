
interface ForecastResult {
  period: string;
  predicted: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
}

interface ScenarioAnalysis {
  scenario: string;
  description: string;
  assumptions: string[];
  forecast: ForecastResult[];
  reductionPotential: number;
}

class PredictiveModelingService {
  generateEmissionsForecast(
    historicalData: { period: string; value: number }[],
    periods: number = 12
  ): ForecastResult[] {
    if (historicalData.length < 3) {
      throw new Error('Insufficient historical data for forecasting');
    }

    const values = historicalData.map(d => d.value);
    const trend = this.calculateTrend(values);
    const seasonality = this.calculateSeasonality(values);
    
    const forecast: ForecastResult[] = [];
    
    for (let i = 1; i <= periods; i++) {
      const baseValue = values[values.length - 1];
      const trendComponent = trend * i;
      const seasonalComponent = seasonality[i % seasonality.length] || 0;
      
      const predicted = Math.max(0, baseValue + trendComponent + seasonalComponent);
      const confidence = Math.max(60 - i * 2, 30); // Decreasing confidence over time
      const variance = predicted * 0.15; // 15% variance assumption
      
      forecast.push({
        period: this.getNextPeriod(historicalData[historicalData.length - 1].period, i),
        predicted,
        confidence,
        upperBound: predicted + variance,
        lowerBound: Math.max(0, predicted - variance)
      });
    }
    
    return forecast;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n + 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, i) => sum + (i + 1) * y, 0);
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }

  private calculateSeasonality(values: number[]): number[] {
    // Simple seasonal decomposition for monthly data
    const seasonalPeriod = Math.min(12, values.length);
    const seasonal = new Array(seasonalPeriod).fill(0);
    
    for (let i = 0; i < values.length; i++) {
      seasonal[i % seasonalPeriod] += values[i];
    }
    
    const cycles = Math.floor(values.length / seasonalPeriod);
    return seasonal.map(s => s / cycles);
  }

  private getNextPeriod(lastPeriod: string, offset: number): string {
    const date = new Date(lastPeriod);
    date.setMonth(date.getMonth() + offset);
    return date.toISOString().substring(0, 7); // YYYY-MM format
  }

  generateScenarioAnalysis(
    historicalData: { period: string; value: number }[],
    targetReduction: number = 0.5 // 50% reduction target
  ): ScenarioAnalysis[] {
    const baselineForecast = this.generateEmissionsForecast(historicalData);
    
    return [
      {
        scenario: 'Business as Usual',
        description: 'Continue current practices with no additional reduction measures',
        assumptions: ['No new efficiency measures', 'Current growth rate maintained'],
        forecast: baselineForecast,
        reductionPotential: 0
      },
      {
        scenario: 'Moderate Reduction',
        description: 'Implement cost-effective reduction measures',
        assumptions: ['Energy efficiency improvements', '20% renewable energy'],
        forecast: baselineForecast.map(f => ({
          ...f,
          predicted: f.predicted * 0.8,
          upperBound: f.upperBound * 0.8,
          lowerBound: f.lowerBound * 0.8
        })),
        reductionPotential: 20
      },
      {
        scenario: 'Aggressive Reduction',
        description: 'Comprehensive transformation to low-carbon operations',
        assumptions: ['100% renewable energy', 'Process optimization', 'Carbon offsets'],
        forecast: baselineForecast.map(f => ({
          ...f,
          predicted: f.predicted * (1 - targetReduction),
          upperBound: f.upperBound * (1 - targetReduction),
          lowerBound: f.lowerBound * (1 - targetReduction)
        })),
        reductionPotential: targetReduction * 100
      }
    ];
  }

  calculateGoalTrajectory(
    currentEmissions: number,
    targetEmissions: number,
    targetYear: number,
    currentYear: number = new Date().getFullYear()
  ): { year: number; required: number; recommended: number }[] {
    const yearsRemaining = targetYear - currentYear;
    const totalReduction = currentEmissions - targetEmissions;
    const annualReduction = totalReduction / yearsRemaining;
    
    const trajectory = [];
    for (let i = 0; i <= yearsRemaining; i++) {
      const year = currentYear + i;
      const required = currentEmissions - (annualReduction * i);
      const recommended = required * 0.9; // Recommend staying ahead of target
      
      trajectory.push({ year, required, recommended });
    }
    
    return trajectory;
  }
}

export const predictiveModelingService = new PredictiveModelingService();
