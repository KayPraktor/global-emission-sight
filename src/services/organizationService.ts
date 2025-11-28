import { supabase } from '@/integrations/supabase/client';

/**
 * Gets the current user's organization ID
 * Returns null if user is not part of any organization
 */
export async function getCurrentUserOrganization(): Promise<string | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // User might not be part of any organization yet
      console.warn('No organization found for user:', error.message);
      return null;
    }

    return data?.organization_id || null;
  } catch (error) {
    console.error('Error getting user organization:', error);
    return null;
  }
}

/**
 * Gets the current user's organization details
 */
export async function getCurrentUserOrganizationDetails() {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('organization_members')
      .select(`
        organization_id,
        role,
        organizations (
          id,
          name,
          metadata
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting organization details:', error);
    return null;
  }
}

/**
 * Creates a personal organization for the user
 * This is useful for auto-creating an org for users who don't have one
 */
export async function createPersonalOrganization(organizationName?: string) {
  try {
    const { data: orgId, error } = await supabase.rpc('create_user_organization', {
      org_name: organizationName || null
    });

    if (error) throw error;

    // Fetch the created organization details
    const { data: org, error: fetchError } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (fetchError) throw fetchError;

    return { data: org, error: null };
  } catch (error) {
    console.error('Error creating organization:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create organization',
    };
  }
}
