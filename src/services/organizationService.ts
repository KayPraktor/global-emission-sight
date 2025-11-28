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
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Create the organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: organizationName || `${user.email}'s Organization`,
      })
      .select()
      .single();

    if (orgError) throw orgError;

    // Add user as owner of the organization
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: 'owner',
      });

    if (memberError) throw memberError;

    return { data: org, error: null };
  } catch (error) {
    console.error('Error creating organization:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create organization',
    };
  }
}
