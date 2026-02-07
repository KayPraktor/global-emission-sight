import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield, UserX, Mail, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { feedback } from '@/lib/feedback';

interface OrgMember {
  id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  profiles: {
    email: string;
    full_name: string;
  };
}

export const UserManagement = () => {
  const { organization, isAdmin } = useAuth();
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [memberToRemove, setMemberToRemove] = useState<OrgMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (organization) {
      fetchMembers();
    }
  }, [organization]);

  const fetchMembers = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('id, user_id, role')
        .eq('organization_id', organization.id);

      if (error) throw error;

      // Fetch profiles separately
      const userIds = (data || []).map(m => m.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      const profileMap = new Map((profilesData || []).map(p => [p.id, p]));
      const membersWithProfiles = (data || []).map(m => ({
        ...m,
        profiles: profileMap.get(m.user_id) || { email: '', full_name: '' }
      }));

      setMembers(membersWithProfiles as any);
    } catch (error: any) {
      feedback.crud.loadError('members', fetchMembers);
    } finally {
      setLoading(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: 'owner' | 'admin' | 'member') => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
      feedback.success('Role updated successfully');
      fetchMembers();
    } catch (error: any) {
      feedback.error('update role', 'You may not have permission. Please try again.');
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    setIsRemoving(true);
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberToRemove.id);

      if (error) throw error;
      feedback.success('Member removed successfully');
      fetchMembers();
    } catch (error: any) {
      feedback.crud.deleteError('member');
    } finally {
      setIsRemoving(false);
      setMemberToRemove(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Organization Members</h2>
          <p className="text-sm text-muted-foreground">Manage users and their organization roles</p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Organization Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell className="font-medium">
                {(member.profiles as any)?.full_name || 'Unknown'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {(member.profiles as any)?.email}
                </div>
              </TableCell>
              <TableCell>
                {isAdmin && member.role !== 'owner' ? (
                  <Select
                    value={member.role}
                    onValueChange={(value) => updateMemberRole(member.id, value as any)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                    <Shield className="h-3 w-3 mr-1" />
                    {member.role}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {isAdmin && member.role !== 'owner' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMemberToRemove(member)}
                  >
                    <UserX className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Remove Member Confirmation Dialog */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{' '}
              <strong>{memberToRemove?.profiles?.full_name || 'this member'}</strong> (
              {memberToRemove?.profiles?.email}) from the organization?
              <br /><br />
              They will lose access to all organization data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleRemoveMember}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isRemoving}
            >
              {isRemoving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove Member'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
