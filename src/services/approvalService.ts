import { supabase } from '@/integrations/supabase/client';

export type ApprovalStatus = 'draft' | 'pending_review' | 'changes_requested' | 'approved' | 'rejected';

export interface ApprovalRequest {
  id: string;
  organization_id: string;
  entry_id: string;
  requester_id: string;
  reviewer_id: string | null;
  status: ApprovalStatus;
  request_message: string | null;
  review_message: string | null;
  created_at: string;
  reviewed_at: string | null;
  metadata: Record<string, unknown>;
}

export interface EmissionsEntryWithApproval {
  id: string;
  entry_date: string;
  scope: string;
  category: string;
  quantity: number;
  unit: string;
  facility_id: string | null;
  approval_status: ApprovalStatus;
  submitted_at: string | null;
  submitted_by: string | null;
  assigned_reviewer: string | null;
  review_notes: string | null;
  organization_id: string | null;
  user_id: string;
  created_at: string;
}

async function getCurrentUserOrganization(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  return data?.organization_id || null;
}

export const approvalService = {
  // Submit an entry for review
  async submitForReview(entryId: string, message?: string): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const organizationId = await getCurrentUserOrganization();
    if (!organizationId) return { success: false, error: 'No organization found' };

    // Update the emissions entry status
    const { error: updateError } = await supabase
      .from('emissions_entries')
      .update({
        approval_status: 'pending_review',
        submitted_at: new Date().toISOString(),
        submitted_by: user.id,
      })
      .eq('id', entryId);

    if (updateError) return { success: false, error: updateError.message };

    // Create approval request record
    const { error: insertError } = await supabase
      .from('approval_requests')
      .insert({
        organization_id: organizationId,
        entry_id: entryId,
        requester_id: user.id,
        status: 'pending_review',
        request_message: message || null,
      });

    if (insertError) return { success: false, error: insertError.message };

    return { success: true };
  },

  // Get entries pending review (for supervisors)
  async getEntriesPendingReview(): Promise<EmissionsEntryWithApproval[]> {
    const organizationId = await getCurrentUserOrganization();
    if (!organizationId) return [];

    const { data, error } = await supabase
      .from('emissions_entries')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('approval_status', 'pending_review')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending entries:', error);
      return [];
    }

    return (data || []) as EmissionsEntryWithApproval[];
  },

  // Get all entries with their approval status
  async getEntriesWithApprovalStatus(status?: ApprovalStatus): Promise<EmissionsEntryWithApproval[]> {
    const organizationId = await getCurrentUserOrganization();
    if (!organizationId) return [];

    let query = supabase
      .from('emissions_entries')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('approval_status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching entries:', error);
      return [];
    }

    return (data || []) as EmissionsEntryWithApproval[];
  },

  // Approve an entry
  async approveEntry(entryId: string, message?: string): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Update the emissions entry
    const { error: updateError } = await supabase
      .from('emissions_entries')
      .update({
        approval_status: 'approved',
        is_verified: true,
        verified_at: new Date().toISOString(),
        verified_by: user.id,
        review_notes: message || null,
        assigned_reviewer: user.id,
      })
      .eq('id', entryId);

    if (updateError) return { success: false, error: updateError.message };

    // Update the approval request
    const { error: requestError } = await supabase
      .from('approval_requests')
      .update({
        status: 'approved',
        reviewer_id: user.id,
        review_message: message || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('entry_id', entryId)
      .eq('status', 'pending_review');

    if (requestError) {
      console.error('Error updating approval request:', requestError);
    }

    return { success: true };
  },

  // Reject an entry
  async rejectEntry(entryId: string, message: string): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Update the emissions entry
    const { error: updateError } = await supabase
      .from('emissions_entries')
      .update({
        approval_status: 'rejected',
        review_notes: message,
        assigned_reviewer: user.id,
      })
      .eq('id', entryId);

    if (updateError) return { success: false, error: updateError.message };

    // Update the approval request
    const { error: requestError } = await supabase
      .from('approval_requests')
      .update({
        status: 'rejected',
        reviewer_id: user.id,
        review_message: message,
        reviewed_at: new Date().toISOString(),
      })
      .eq('entry_id', entryId)
      .eq('status', 'pending_review');

    if (requestError) {
      console.error('Error updating approval request:', requestError);
    }

    return { success: true };
  },

  // Request changes on an entry
  async requestChanges(entryId: string, message: string): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Update the emissions entry
    const { error: updateError } = await supabase
      .from('emissions_entries')
      .update({
        approval_status: 'changes_requested',
        review_notes: message,
        assigned_reviewer: user.id,
      })
      .eq('id', entryId);

    if (updateError) return { success: false, error: updateError.message };

    // Update the approval request
    const { error: requestError } = await supabase
      .from('approval_requests')
      .update({
        status: 'changes_requested',
        reviewer_id: user.id,
        review_message: message,
        reviewed_at: new Date().toISOString(),
      })
      .eq('entry_id', entryId)
      .eq('status', 'pending_review');

    if (requestError) {
      console.error('Error updating approval request:', requestError);
    }

    return { success: true };
  },

  // Get approval history for an entry
  async getApprovalHistory(entryId: string): Promise<ApprovalRequest[]> {
    const { data, error } = await supabase
      .from('approval_requests')
      .select('*')
      .eq('entry_id', entryId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching approval history:', error);
      return [];
    }

    return (data || []) as ApprovalRequest[];
  },

  // Get pending approval count (for badge)
  async getPendingApprovalCount(): Promise<number> {
    const organizationId = await getCurrentUserOrganization();
    if (!organizationId) return 0;

    const { count, error } = await supabase
      .from('emissions_entries')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('approval_status', 'pending_review');

    if (error) {
      console.error('Error fetching pending count:', error);
      return 0;
    }

    return count || 0;
  },

  // Check if current user is a supervisor
  async isCurrentUserSupervisor(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['owner', 'admin'])
      .limit(1)
      .maybeSingle();

    return !!data;
  },

  // Bulk approve entries
  async bulkApprove(entryIds: string[], message?: string): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    for (const entryId of entryIds) {
      const result = await this.approveEntry(entryId, message);
      if (!result.success) return result;
    }

    return { success: true };
  },

  // Bulk reject entries
  async bulkReject(entryIds: string[], message: string): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    for (const entryId of entryIds) {
      const result = await this.rejectEntry(entryId, message);
      if (!result.success) return result;
    }

    return { success: true };
  },
};
