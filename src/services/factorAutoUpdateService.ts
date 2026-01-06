import { supabase } from '@/integrations/supabase/client';

export interface FactorSource {
  id: string;
  name: string;
  code: string;
  description: string | null;
  url: string | null;
  api_endpoint: string | null;
  requires_api_key: boolean;
  is_enabled: boolean;
  sync_frequency: string;
  last_sync_at: string | null;
  next_sync_at: string | null;
  metadata: unknown;
  created_at: string;
  updated_at: string;
}

export interface FactorChangeReview {
  id: string;
  staging_id: string | null;
  existing_factor_id: string | null;
  factor_name: string;
  old_value: number | null;
  new_value: number;
  change_percentage: number | null;
  ai_significance: string | null;
  ai_impact_assessment: string | null;
  ai_recommendation: string | null;
  ai_confidence: number | null;
  ai_analysis: unknown;
  affected_entries_count: number;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  id: string;
  source_id: string;
  sync_type: 'scheduled' | 'manual' | 'webhook';
  status: 'running' | 'completed' | 'failed' | 'partial';
  factors_fetched: number;
  factors_new: number;
  factors_updated: number;
  factors_unchanged: number;
  errors: Record<string, unknown> | null;
  duration_ms: number | null;
  triggered_by: string | null;
  started_at: string;
  completed_at: string | null;
  source?: FactorSource;
}

export async function getFactorSources(): Promise<FactorSource[]> {
  const { data, error } = await supabase
    .from('emission_factor_sources')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function updateFactorSource(
  id: string,
  updates: Partial<Pick<FactorSource, 'is_enabled' | 'sync_frequency'>>
): Promise<void> {
  const { error } = await supabase
    .from('emission_factor_sources')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function getPendingReviews(): Promise<FactorChangeReview[]> {
  const { data, error } = await supabase
    .from('emission_factor_change_reviews')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAllReviews(limit = 50): Promise<FactorChangeReview[]> {
  const { data, error } = await supabase
    .from('emission_factor_change_reviews')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function getSyncLogs(limit = 20): Promise<SyncLog[]> {
  const { data, error } = await supabase
    .from('emission_factor_sync_logs')
    .select(`
      *,
      source:emission_factor_sources (*)
    `)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as SyncLog[];
}

export async function triggerSync(sourceId?: string): Promise<{ message: string; results: unknown[] }> {
  const { data: userData } = await supabase.auth.getUser();
  
  const { data, error } = await supabase.functions.invoke('fetch-emission-factors', {
    body: {
      sourceId,
      syncType: 'manual',
      triggeredBy: userData?.user?.id
    }
  });

  if (error) throw error;
  return data;
}

export async function approveReview(reviewId: string, notes?: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  
  const { error } = await supabase.functions.invoke('apply-factor-updates', {
    body: {
      reviewId,
      action: 'approve',
      reviewedBy: userData?.user?.id,
      reviewNotes: notes
    }
  });

  if (error) throw error;
}

export async function rejectReview(reviewId: string, notes?: string): Promise<void> {
  const { data: userData } = await supabase.auth.getUser();
  
  const { error } = await supabase.functions.invoke('apply-factor-updates', {
    body: {
      reviewId,
      action: 'reject',
      reviewedBy: userData?.user?.id,
      reviewNotes: notes
    }
  });

  if (error) throw error;
}

export function getSignificanceBadgeVariant(significance: string | null): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (significance) {
    case 'critical': return 'destructive';
    case 'high': return 'destructive';
    case 'medium': return 'secondary';
    case 'low': return 'outline';
    default: return 'default';
  }
}

export function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'approved': return 'default';
    case 'auto_applied': return 'secondary';
    case 'rejected': return 'destructive';
    case 'pending': return 'outline';
    default: return 'default';
  }
}
