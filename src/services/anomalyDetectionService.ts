import { supabase } from '@/integrations/supabase/client';

export interface Anomaly {
  id: string;
  entry_id: string;
  anomaly_type: 'spike' | 'drop' | 'pattern_break' | 'seasonal_deviation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  z_score: number;
  expected_value: number;
  actual_value: number;
  deviation_percentage: number;
  description: string;
  recommendation: string;
  is_acknowledged: boolean;
  detected_at: string;
}

class AnomalyDetectionService {
  async detectAnomalies(userId: string, lookbackDays: number = 90): Promise<Anomaly[]> {
    try {
      // Get historical emissions data
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);

      const { data: entries, error } = await supabase
        .from('emissions_entries')
        .select('id, entry_date, scope, category, calculations(calculated_emissions)')
        .eq('user_id', userId)
        .gte('entry_date', cutoffDate.toISOString())
        .order('entry_date', { ascending: true });

      if (error) throw error;
      if (!entries || entries.length < 5) return []; // Need minimum data

      const anomalies: Anomaly[] = [];

      // Calculate statistics for each scope/category combination
      const groups = this.groupByScopeCategory(entries);

      for (const [key, groupData] of Object.entries(groups)) {
        const values = groupData.map(e => e.emissions);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const stdDev = Math.sqrt(
          values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
        );

        // Check each entry for anomalies
        for (const entry of groupData) {
          const zScore = stdDev > 0 ? (entry.emissions - mean) / stdDev : 0;
          
          if (Math.abs(zScore) > 2) {
            const deviation = ((entry.emissions - mean) / mean) * 100;
            
            let anomalyType: Anomaly['anomaly_type'];
            let severity: Anomaly['severity'];
            let description: string;
            let recommendation: string;

            if (zScore > 3) {
              anomalyType = 'spike';
              severity = 'critical';
              description = `Critical spike detected: ${entry.emissions.toFixed(2)} tCO2e (${deviation.toFixed(1)}% above normal)`;
              recommendation = 'Immediate investigation required. Check for data entry errors, unusual operations, or equipment malfunctions.';
            } else if (zScore > 2.5) {
              anomalyType = 'spike';
              severity = 'high';
              description = `Significant spike: ${entry.emissions.toFixed(2)} tCO2e (${deviation.toFixed(1)}% above normal)`;
              recommendation = 'Review operations and verify data accuracy. Consider investigating contributing factors.';
            } else if (zScore < -3) {
              anomalyType = 'drop';
              severity = 'high';
              description = `Unusual drop: ${entry.emissions.toFixed(2)} tCO2e (${Math.abs(deviation).toFixed(1)}% below normal)`;
              recommendation = 'Verify data completeness. Could indicate missing data or positive operational changes worth documenting.';
            } else if (zScore < -2) {
              anomalyType = 'drop';
              severity = 'medium';
              description = `Lower than expected: ${entry.emissions.toFixed(2)} tCO2e (${Math.abs(deviation).toFixed(1)}% below normal)`;
              recommendation = 'Confirm data accuracy and document any efficiency improvements.';
            } else {
              anomalyType = zScore > 0 ? 'spike' : 'drop';
              severity = 'low';
              description = `Mild deviation: ${entry.emissions.toFixed(2)} tCO2e (${Math.abs(deviation).toFixed(1)}% from normal)`;
              recommendation = 'Monitor for patterns. May be normal variation.';
            }

            anomalies.push({
              id: '', // Will be set after DB insert
              entry_id: entry.id,
              anomaly_type: anomalyType,
              severity,
              z_score: zScore,
              expected_value: mean,
              actual_value: entry.emissions,
              deviation_percentage: deviation,
              description,
              recommendation,
              is_acknowledged: false,
              detected_at: new Date().toISOString(),
            });
          }
        }
      }

      // Store anomalies in database
      if (anomalies.length > 0) {
        await this.storeAnomaliesInDB(userId, anomalies);
      }

      return anomalies;
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      throw error;
    }
  }

  async analyzeEntry(entryId: string): Promise<Anomaly | null> {
    try {
      // Get the entry and its context
      const { data: entry, error: entryError } = await supabase
        .from('emissions_entries')
        .select('*, calculations(calculated_emissions)')
        .eq('id', entryId)
        .single();

      if (entryError || !entry) throw entryError;

      // Get similar entries for comparison
      const { data: similarEntries, error: similarError } = await supabase
        .from('emissions_entries')
        .select('calculations(calculated_emissions)')
        .eq('user_id', entry.user_id)
        .eq('scope', entry.scope)
        .eq('category', entry.category)
        .neq('id', entryId)
        .limit(50);

      if (similarError || !similarEntries || similarEntries.length < 3) return null;

      const values = similarEntries.map(e => e.calculations?.[0]?.calculated_emissions || 0);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const stdDev = Math.sqrt(
        values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
      );

      const actualValue = entry.calculations?.[0]?.calculated_emissions || 0;
      const zScore = stdDev > 0 ? (actualValue - mean) / stdDev : 0;

      if (Math.abs(zScore) > 2) {
        const deviation = ((actualValue - mean) / mean) * 100;
        
        return {
          id: '',
          entry_id: entryId,
          anomaly_type: zScore > 0 ? 'spike' : 'drop',
          severity: Math.abs(zScore) > 3 ? 'critical' : Math.abs(zScore) > 2.5 ? 'high' : 'medium',
          z_score: zScore,
          expected_value: mean,
          actual_value: actualValue,
          deviation_percentage: deviation,
          description: `${zScore > 0 ? 'Spike' : 'Drop'} detected: ${Math.abs(deviation).toFixed(1)}% from normal`,
          recommendation: 'Review this entry for accuracy and investigate causes.',
          is_acknowledged: false,
          detected_at: new Date().toISOString(),
        };
      }

      return null;
    } catch (error) {
      console.error('Error analyzing entry:', error);
      return null;
    }
  }

  async acknowledgeAnomaly(anomalyId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('emissions_anomalies')
      .update({
        is_acknowledged: true,
        acknowledged_at: new Date().toISOString(),
        acknowledged_by: userId,
      })
      .eq('id', anomalyId);

    if (error) {
      console.error('Error acknowledging anomaly:', error);
      throw error;
    }
  }

  async getUnacknowledgedAnomalies(userId: string): Promise<Anomaly[]> {
    const { data, error } = await supabase
      .from('emissions_anomalies')
      .select('*')
      .eq('user_id', userId)
      .eq('is_acknowledged', false)
      .order('severity', { ascending: false })
      .order('detected_at', { ascending: false });

    if (error) {
      console.error('Error fetching anomalies:', error);
      throw error;
    }

    return (data || []) as Anomaly[];
  }

  // Helper methods
  private groupByScopeCategory(entries: any[]): Record<string, Array<{ id: string; emissions: number }>> {
    const groups: Record<string, Array<{ id: string; emissions: number }>> = {};

    entries.forEach(entry => {
      const key = `${entry.scope}-${entry.category}`;
      const emissions = entry.calculations?.[0]?.calculated_emissions || 0;

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push({
        id: entry.id,
        emissions,
      });
    });

    return groups;
  }

  private async storeAnomaliesInDB(userId: string, anomalies: Anomaly[]): Promise<void> {
    // Check for existing anomalies for these entries
    const entryIds = anomalies.map(a => a.entry_id);
    const { data: existing } = await supabase
      .from('emissions_anomalies')
      .select('entry_id')
      .in('entry_id', entryIds);

    const existingIds = new Set(existing?.map(e => e.entry_id) || []);
    
    // Only insert new anomalies
    const newAnomalies = anomalies
      .filter(a => !existingIds.has(a.entry_id))
      .map(a => ({
        user_id: userId,
        entry_id: a.entry_id,
        anomaly_type: a.anomaly_type,
        severity: a.severity,
        z_score: a.z_score,
        expected_value: a.expected_value,
        actual_value: a.actual_value,
        deviation_percentage: a.deviation_percentage,
        description: a.description,
        recommendation: a.recommendation,
      }));

    if (newAnomalies.length > 0) {
      const { error } = await supabase
        .from('emissions_anomalies')
        .insert(newAnomalies);

      if (error) {
        console.error('Error storing anomalies:', error);
      }
    }
  }
}

export const anomalyDetectionService = new AnomalyDetectionService();
