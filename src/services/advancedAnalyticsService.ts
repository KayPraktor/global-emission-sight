import { supabase } from '@/integrations/supabase/client';
import { predictiveModelingService } from './predictiveModelingService';

export interface ForecastResult {
  period: Date;
  scope: string;
  predicted_emissions: number;
  confidence_score: number;
  upper_bound: number;
  lower_bound: number;
}

export interface TrendAnalysis {
  trend: 'improving' | 'worsening' | 'stable';
  velocity: number; // tCO2e change per month
  acceleration: number; // change in velocity
  seasonality: boolean;
  avgMonthlyEmissions: number;
}

class AdvancedAnalyticsService {
  async generateEmissionsForecast(userId: string, periods: number = 12): Promise<ForecastResult[]> {
    try {
      // Get historical emissions data
      const { data: historicalData, error } = await supabase
        .from('emissions_entries')
        .select('entry_date, scope, calculations(calculated_emissions)')
        .eq('user_id', userId)
        .order('entry_date', { ascending: true });

      if (error) throw error;
      if (!historicalData || historicalData.length < 3) {
        throw new Error('Insufficient data for forecasting. Need at least 3 months of historical data.');
      }

      // Aggregate by month and scope
      const monthlyData = this.aggregateByMonth(historicalData);
      
      // Generate forecast for each scope
      const forecasts: ForecastResult[] = [];
      const scopes = ['S1', 'S2', 'S3'];

      for (const scope of scopes) {
        const scopeData = monthlyData.filter(d => d.scope === scope);
        if (scopeData.length === 0) continue;

        // Use predictive modeling service
        const historicalDataFormatted = scopeData.map(d => ({
          period: d.period,
          value: d.emissions
        }));
        
        const prediction = predictiveModelingService.generateEmissionsForecast(
          historicalDataFormatted,
          periods
        );

        // Calculate confidence based on data quality
        const confidenceScore = this.calculateConfidence(scopeData.length);

        // Generate forecast results
        const lastDate = new Date(scopeData[scopeData.length - 1].period);
        
        for (let i = 0; i < prediction.length; i++) {
          const forecastDate = new Date(lastDate);
          forecastDate.setMonth(forecastDate.getMonth() + i + 1);

          const predicted = prediction[i].predicted || 0;
          const margin = predicted * (1 - confidenceScore);

          forecasts.push({
            period: forecastDate,
            scope,
            predicted_emissions: predicted,
            confidence_score: confidenceScore,
            upper_bound: predicted + margin,
            lower_bound: Math.max(0, predicted - margin),
          });
        }
      }

      // Store forecasts in database
      await this.storeForecastsInDB(userId, forecasts);

      return forecasts;
    } catch (error) {
      console.error('Error generating forecast:', error);
      throw error;
    }
  }

  async getHistoricalTrendAnalysis(userId: string, months: number = 6): Promise<TrendAnalysis> {
    try {
      const { data, error } = await supabase
        .from('emissions_entries')
        .select('entry_date, calculations(calculated_emissions)')
        .eq('user_id', userId)
        .gte('entry_date', new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('entry_date', { ascending: true });

      if (error) throw error;
      if (!data || data.length < 2) {
        return {
          trend: 'stable',
          velocity: 0,
          acceleration: 0,
          seasonality: false,
          avgMonthlyEmissions: 0,
        };
      }

      const monthlyData = this.aggregateByMonth(data);
      const emissions = monthlyData.map(d => d.emissions);
      
      // Calculate velocity (linear regression slope)
      const velocity = this.calculateVelocity(emissions);
      
      // Calculate acceleration (change in velocity)
      const midpoint = Math.floor(emissions.length / 2);
      const firstHalf = emissions.slice(0, midpoint);
      const secondHalf = emissions.slice(midpoint);
      const acceleration = this.calculateVelocity(secondHalf) - this.calculateVelocity(firstHalf);

      // Determine trend
      let trend: 'improving' | 'worsening' | 'stable' = 'stable';
      if (velocity < -5) trend = 'improving';
      else if (velocity > 5) trend = 'worsening';

      // Check for seasonality (basic check)
      const seasonality = this.detectSeasonality(emissions);

      return {
        trend,
        velocity,
        acceleration,
        seasonality,
        avgMonthlyEmissions: emissions.reduce((a, b) => a + b, 0) / emissions.length,
      };
    } catch (error) {
      console.error('Error analyzing trends:', error);
      throw error;
    }
  }

  async calculateEmissionsMomentum(userId: string): Promise<{ velocity: number; acceleration: number }> {
    const analysis = await this.getHistoricalTrendAnalysis(userId, 12);
    return {
      velocity: analysis.velocity,
      acceleration: analysis.acceleration,
    };
  }

  // Helper methods
  private aggregateByMonth(data: any[]): Array<{ period: string; scope: string; emissions: number }> {
    const monthlyMap = new Map<string, { scope: string; emissions: number }>();

    data.forEach(entry => {
      const date = new Date(entry.entry_date);
      const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const scope = entry.scope || 'S1';
      const key = `${period}-${scope}`;
      
      const emissions = entry.calculations?.[0]?.calculated_emissions || 0;
      
      if (monthlyMap.has(key)) {
        monthlyMap.get(key)!.emissions += emissions;
      } else {
        monthlyMap.set(key, { scope, emissions });
      }
    });

    return Array.from(monthlyMap.entries())
      .map(([key, value]) => ({ period: key.split('-').slice(0, 2).join('-'), ...value }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }

  private calculateConfidence(dataPoints: number): number {
    // Confidence increases with more data points
    if (dataPoints >= 24) return 0.85;
    if (dataPoints >= 12) return 0.75;
    if (dataPoints >= 6) return 0.65;
    return 0.55;
  }

  private calculateVelocity(values: number[]): number {
    if (values.length < 2) return 0;
    
    // Simple linear regression slope
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  private detectSeasonality(values: number[]): boolean {
    if (values.length < 12) return false;
    
    // Simple check: compare variance of same months across years
    const monthlyAvgs = new Array(12).fill(0);
    const monthlyCount = new Array(12).fill(0);
    
    values.forEach((value, index) => {
      const month = index % 12;
      monthlyAvgs[month] += value;
      monthlyCount[month]++;
    });
    
    monthlyAvgs.forEach((sum, i) => {
      monthlyAvgs[i] = monthlyCount[i] > 0 ? sum / monthlyCount[i] : 0;
    });
    
    const overallAvg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = monthlyAvgs.reduce((sum, avg) => sum + Math.pow(avg - overallAvg, 2), 0) / 12;
    
    // If variance is high, likely seasonal
    return variance > overallAvg * 0.2;
  }

  private async storeForecastsInDB(userId: string, forecasts: ForecastResult[]): Promise<void> {
    // Delete old forecasts first
    await supabase
      .from('emissions_forecasts')
      .delete()
      .eq('user_id', userId);

    // Insert new forecasts
    const records = forecasts.map(f => ({
      user_id: userId,
      period: f.period.toISOString().split('T')[0],
      scope: f.scope,
      predicted_emissions: f.predicted_emissions,
      confidence_score: f.confidence_score,
      upper_bound: f.upper_bound,
      lower_bound: f.lower_bound,
      model_version: 'v1.0',
    }));

    const { error } = await supabase
      .from('emissions_forecasts')
      .insert(records);

    if (error) {
      console.error('Error storing forecasts:', error);
    }
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();
