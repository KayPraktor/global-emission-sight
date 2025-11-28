import { supabase } from '@/integrations/supabase/client';
import { Facility, FacilityInsert } from '@/types/database';
import { getCurrentUserOrganization } from './organizationService';

export class FacilityService {
  /**
   * Fetches all facilities for the current user's organization
   */
  static async getFacilities(): Promise<{ data: Facility[] | null; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const organizationId = await getCurrentUserOrganization();
      if (!organizationId) {
        throw new Error('Please create or join an organization first');
      }

      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching facilities:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch facilities',
      };
    }
  }

  /**
   * Fetches a single facility by ID
   */
  static async getFacility(id: string): Promise<{ data: Facility | null; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching facility:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch facility',
      };
    }
  }

  /**
   * Creates a new facility
   */
  static async createFacility(facilityData: Omit<FacilityInsert, 'user_id' | 'organization_id'>): Promise<{ data: Facility | null; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const organizationId = await getCurrentUserOrganization();
      if (!organizationId) {
        throw new Error('Please create or join an organization first');
      }

      const { data, error } = await supabase
        .from('facilities')
        .insert({
          ...facilityData,
          user_id: user.id,
          organization_id: organizationId,
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error creating facility:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create facility',
      };
    }
  }

  /**
   * Updates an existing facility
   */
  static async updateFacility(id: string, facilityData: Partial<Omit<FacilityInsert, 'user_id' | 'organization_id'>>): Promise<{ data: Facility | null; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const organizationId = await getCurrentUserOrganization();
      if (!organizationId) {
        throw new Error('Please create or join an organization first');
      }

      const { data, error } = await supabase
        .from('facilities')
        .update(facilityData)
        .eq('id', id)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error updating facility:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update facility',
      };
    }
  }

  /**
   * Deletes a facility
   */
  static async deleteFacility(id: string): Promise<{ success: boolean; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const organizationId = await getCurrentUserOrganization();
      if (!organizationId) {
        throw new Error('Please create or join an organization first');
      }

      const { error } = await supabase
        .from('facilities')
        .delete()
        .eq('id', id)
        .eq('organization_id', organizationId);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error deleting facility:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete facility',
      };
    }
  }

  /**
   * Gets emissions entries for a specific facility
   */
  static async getFacilityEmissions(facilityId: string) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('emissions_entries')
        .select(`
          *,
          calculations(calculated_emissions)
        `)
        .eq('facility_id', facilityId)
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching facility emissions:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch emissions',
      };
    }
  }
}
