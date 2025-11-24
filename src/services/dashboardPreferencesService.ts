import { supabase } from '@/integrations/supabase/client';

export interface DashboardLayout {
  pinnedKPIs: string[];
  widgetOrder: string[];
  hiddenWidgets: string[];
  gridLayout?: {
    [key: string]: {
      x: number;
      y: number;
      w: number;
      h: number;
    };
  };
}

export interface DashboardPreference {
  id: string;
  user_id: string;
  organization_id: string;
  view_name: string;
  is_default: boolean;
  layout_config: DashboardLayout;
  created_at: string;
  updated_at: string;
}

class DashboardPreferencesService {
  async getPreferences(organizationId: string): Promise<DashboardPreference[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('dashboard_preferences')
      .select('*')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    return (data || []).map(item => ({
      ...item,
      layout_config: item.layout_config as unknown as DashboardLayout
    }));
  }

  async getDefaultPreference(organizationId: string): Promise<DashboardPreference | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('dashboard_preferences')
      .select('*')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .eq('is_default', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? {
      ...data,
      layout_config: data.layout_config as unknown as DashboardLayout
    } : null;
  }

  async savePreference(
    organizationId: string,
    viewName: string,
    layoutConfig: DashboardLayout,
    isDefault: boolean = false
  ): Promise<DashboardPreference> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // If setting as default, unset other defaults first
    if (isDefault) {
      await supabase
        .from('dashboard_preferences')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .eq('organization_id', organizationId);
    }

    const { data, error } = await supabase
      .from('dashboard_preferences')
      .upsert([{
        user_id: user.id,
        organization_id: organizationId,
        view_name: viewName,
        layout_config: layoutConfig as any,
        is_default: isDefault,
        updated_at: new Date().toISOString()
      }], {
        onConflict: 'user_id,organization_id,view_name'
      })
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      layout_config: data.layout_config as unknown as DashboardLayout
    };
  }

  async deletePreference(preferenceId: string): Promise<void> {
    const { error } = await supabase
      .from('dashboard_preferences')
      .delete()
      .eq('id', preferenceId);

    if (error) throw error;
  }

  async setDefaultPreference(preferenceId: string, organizationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Unset all defaults first
    await supabase
      .from('dashboard_preferences')
      .update({ is_default: false })
      .eq('user_id', user.id)
      .eq('organization_id', organizationId);

    // Set new default
    const { error } = await supabase
      .from('dashboard_preferences')
      .update({ is_default: true })
      .eq('id', preferenceId);

    if (error) throw error;
  }
}

export const dashboardPreferencesService = new DashboardPreferencesService();
