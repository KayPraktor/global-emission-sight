import { supabase } from '@/integrations/supabase/client';
import { EmissionsFormData } from '@/components/EmissionsForm/EmissionsWizard';
import { FacilityInsert, EmissionFactorInsert, EmissionsEntryInsert } from '@/types/database';
import { fullFormSchema } from '@/schemas/emissionsSchema';
import { trackDataEntry } from '@/services/analyticsTrackingService';

export class EmissionsService {
  /**
   * Validates and saves emissions data to the database
   */
  static async saveEmissionsData(formData: EmissionsFormData): Promise<{ success: boolean; error?: string }> {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Validate form data
      const validationResult = fullFormSchema.safeParse(formData);
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new Error(`Validation failed: ${errors}`);
      }

      // Parse facility type to enum
      const facilityTypeMap: Record<string, string> = {
        'Office': 'office',
        'Warehouse': 'warehouse',
        'Factory': 'factory',
        'Retail': 'retail',
        'Data Center': 'datacenter',
        'Other': 'other',
      };
      
      const mappedFacilityType = facilityTypeMap[formData.facilityType] || 'other';

      // 1. Create or get facility
      let facility;
      
      if (formData.facilityId) {
        // Use existing facility
        const { data: existingFacility, error: facilityError } = await supabase
          .from('facilities')
          .select()
          .eq('id', formData.facilityId)
          .eq('user_id', user.id)
          .single();
        
        if (facilityError || !existingFacility) {
          throw new Error('Selected facility not found');
        }
        
        facility = existingFacility;
      } else {
        // Create new facility
        const facilityData: FacilityInsert = {
          user_id: user.id,
          name: formData.facilityName,
          facility_type: mappedFacilityType as any,
          country_code: 'US', // Default - can be extracted from address in the future
          city: '', // Can be parsed from address
          address: formData.address,
          metadata: {
            organizationName: formData.organizationName,
            operationalBoundaries: formData.operationalBoundaries,
            operationalHours: formData.operationalHours,
            productionVolume: formData.productionVolume,
            equipmentInfo: formData.equipmentInfo,
            fuelSpecifications: formData.fuelSpecifications,
            processDetails: formData.processDetails,
          },
        };

        const { data: newFacility, error: facilityError } = await supabase
          .from('facilities')
          .insert(facilityData)
          .select()
          .single();

        if (facilityError) {
          throw new Error(`Failed to create facility: ${facilityError.message}`);
        }
        
        facility = newFacility;
      }

      // 2. Create emission factors
      const emissionFactorIds: string[] = [];
      for (const factor of formData.emissionFactors) {
        // Map scope based on source type
        const scopeMap: Record<string, string> = {
          'electricity': 'S2',
          'natural-gas': 'S1',
          'diesel': 'S1',
          'gasoline': 'S1',
          'propane': 'S1',
        };
        const scope = scopeMap[factor.source] || 'S1';

        // Map unit to EF unit enum
        const efUnitMap: Record<string, string> = {
          'kg CO2e/kWh': 'kgCO2e/kWh',
          'kg CO2e/therm': 'kgCO2e/kg',
          'kg CO2e/liter': 'kgCO2e/L',
          'kg CO2e/gallon': 'kgCO2e/L',
          'kg CO2e/kg': 'kgCO2e/kg',
        };
        const efUnit = efUnitMap[factor.unit] || 'kgCO2e/kg';

        const emissionFactorData: EmissionFactorInsert = {
          user_id: user.id,
          name: `${factor.source} - ${factor.methodology}`,
          category: factor.source,
          scope: scope as any,
          factor_value: factor.factor,
          unit: efUnit as any,
          source: factor.methodology,
          methodology: factor.methodology,
          is_custom: true,
        };

        const { data: emissionFactor, error: factorError } = await supabase
          .from('emission_factors')
          .insert(emissionFactorData)
          .select()
          .single();

        if (factorError) {
          throw new Error(`Failed to create emission factor: ${factorError.message}`);
        }

        emissionFactorIds.push(emissionFactor.id);
      }

      // 3. Create emissions entries
      const reportingStartDate = new Date(formData.reportingPeriodStart);
      const reportingEndDate = new Date(formData.reportingPeriodEnd);

      for (const consumption of formData.consumptionData) {
        // Find matching emission factor
        const matchingFactorIndex = formData.emissionFactors.findIndex(factor =>
          factor.source === consumption.type
        );

        if (matchingFactorIndex === -1) continue;

        const emissionFactorId = emissionFactorIds[matchingFactorIndex];

        // Map consumption unit to emission unit enum
        const unitMap: Record<string, string> = {
          'kWh': 'kWh',
          'MWh': 'MWh',
          'therms': 'kg',
          'cubic-feet': 'm3',
          'liters': 'L',
          'gallons': 'L',
          'kg': 'kg',
          'tonnes': 't',
        };
        const emissionUnit = unitMap[consumption.unit] || 'kg';

        // Map scope
        const scopeMap: Record<string, string> = {
          'electricity': 'S2',
          'natural-gas': 'S1',
          'diesel': 'S1',
          'gasoline': 'S1',
          'propane': 'S1',
          'steam': 'S2',
          'chilled-water': 'S2',
        };
        const scope = scopeMap[consumption.type] || 'S1';

        const emissionsEntryData: EmissionsEntryInsert = {
          user_id: user.id,
          facility_id: facility.id,
          emission_factor_id: emissionFactorId,
          entry_date: reportingStartDate.toISOString().split('T')[0],
          scope: scope as any,
          category: consumption.type,
          quantity: consumption.amount,
          unit: emissionUnit as any,
          calculation_method: formData.calculationMethodology || 'GHG Protocol',
          data_quality_score: formData.confidenceLevel === 'high' ? 0.9 : formData.confidenceLevel === 'medium' ? 0.7 : 0.5,
          metadata: {
            period: consumption.period,
            reportingPeriodStart: formData.reportingPeriodStart,
            reportingPeriodEnd: formData.reportingPeriodEnd,
            uncertaintyRange: formData.uncertaintyRange,
            dataSources: formData.dataSources,
            measurementType: formData.measurementType,
          },
        };

        const { error: entryError } = await supabase
          .from('emissions_entries')
          .insert(emissionsEntryData);

        if (entryError) {
          throw new Error(`Failed to create emissions entry: ${entryError.message}`);
        }
        
        // Track each emission entry created
        trackDataEntry.emissionEntryCreated(
          emissionsEntryData.scope,
          consumption.type,
          facility.id
        );
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving emissions data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Loads a draft from localStorage
   */
  static loadDraft(): EmissionsFormData | null {
    try {
      const draft = localStorage.getItem('emissions-form-draft');
      if (draft) {
        return JSON.parse(draft);
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Clears draft from localStorage
   */
  static clearDraft(): void {
    localStorage.removeItem('emissions-form-draft');
  }
}
