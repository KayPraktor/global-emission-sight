import { supabase } from '@/integrations/supabase/client';

export interface DataQualityScore {
  overall: number;
  completeness: number;
  accuracy: number;
  freshness: number;
  consistency: number;
}

export interface DataQualityMetrics {
  date: string;
  totalEntries: number;
  completeEntries: number;
  completenessScore: number;
  validationErrors: number;
  dataFreshnessDays: number;
  lastEntryDate: string | null;
  scope1Completeness: number;
  scope2Completeness: number;
  scope3Completeness: number;
  missingFields: string[];
}

export interface ValidationError {
  entry_id: string;
  field: string;
  error: string;
  severity: 'error' | 'warning';
}

class DataQualityService {
  async calculateDataQuality(userId: string): Promise<DataQualityScore> {
    try {
      // Get all emissions entries
      const { data: entries, error } = await supabase
        .from('emissions_entries')
        .select('*, calculations(*), facilities(*)')
        .eq('user_id', userId);

      if (error) throw error;
      if (!entries || entries.length === 0) {
        return {
          overall: 0,
          completeness: 0,
          accuracy: 0,
          freshness: 0,
          consistency: 0,
        };
      }

      // Calculate completeness (required fields present)
      const completeEntries = entries.filter(e => 
        e.entry_date && e.scope && e.category && e.quantity && 
        e.unit && e.emission_factor_id && e.calculations?.length > 0
      );
      const completeness = (completeEntries.length / entries.length) * 100;

      // Calculate accuracy (verified entries)
      const verifiedEntries = entries.filter(e => e.is_verified);
      const accuracy = (verifiedEntries.length / entries.length) * 100;

      // Calculate freshness (days since last entry)
      const dates = entries.map(e => new Date(e.entry_date).getTime());
      const mostRecent = Math.max(...dates);
      const daysSinceLastEntry = Math.floor((Date.now() - mostRecent) / (1000 * 60 * 60 * 24));
      const freshness = Math.max(0, 100 - (daysSinceLastEntry * 2)); // Decrease 2% per day

      // Calculate consistency (data quality scores)
      const avgQualityScore = entries.reduce((sum, e) => sum + (e.data_quality_score || 0), 0) / entries.length;
      const consistency = avgQualityScore * 100;

      // Overall score (weighted average)
      const overall = (
        completeness * 0.35 +
        accuracy * 0.25 +
        freshness * 0.20 +
        consistency * 0.20
      );

      return {
        overall: Math.round(overall),
        completeness: Math.round(completeness),
        accuracy: Math.round(accuracy),
        freshness: Math.round(freshness),
        consistency: Math.round(consistency),
      };
    } catch (error) {
      console.error('Error calculating data quality:', error);
      throw error;
    }
  }

  async validateEntries(userId: string): Promise<ValidationError[]> {
    try {
      const { data: entries, error } = await supabase
        .from('emissions_entries')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      const errors: ValidationError[] = [];

      entries?.forEach(entry => {
        // Required field validation
        if (!entry.entry_date) {
          errors.push({
            entry_id: entry.id,
            field: 'entry_date',
            error: 'Entry date is required',
            severity: 'error',
          });
        }

        if (!entry.emission_factor_id) {
          errors.push({
            entry_id: entry.id,
            field: 'emission_factor_id',
            error: 'Emission factor is required',
            severity: 'error',
          });
        }

        if (!entry.quantity || entry.quantity <= 0) {
          errors.push({
            entry_id: entry.id,
            field: 'quantity',
            error: 'Quantity must be greater than 0',
            severity: 'error',
          });
        }

        // Optional field warnings
        if (!entry.facility_id) {
          errors.push({
            entry_id: entry.id,
            field: 'facility_id',
            error: 'Facility not specified',
            severity: 'warning',
          });
        }

        if (!entry.activity_type) {
          errors.push({
            entry_id: entry.id,
            field: 'activity_type',
            error: 'Activity type not specified',
            severity: 'warning',
          });
        }

        // Data freshness warning
        const entryDate = new Date(entry.entry_date);
        const daysSinceEntry = Math.floor((Date.now() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceEntry > 90) {
          errors.push({
            entry_id: entry.id,
            field: 'entry_date',
            error: `Entry is ${daysSinceEntry} days old`,
            severity: 'warning',
          });
        }
      });

      return errors;
    } catch (error) {
      console.error('Error validating entries:', error);
      throw error;
    }
  }
}

export const dataQualityService = new DataQualityService();
