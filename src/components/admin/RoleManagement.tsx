import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, Plus, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserWithRole {
  user_id: string;
  role: 'admin' | 'user';
  profiles: {
    email: string;
    full_name: string;
  };
}

interface OrgMember {
  user_id: string;
  profiles: {
    email: string;
    full_name: string;
  };
}

export const RoleManagement = () => {
  const { organization, refreshUserData } = useAuth();
  const [usersWithRoles, setUsersWithRoles] = useState<UserWithRole[]>([]);
  const [availableUsers, setAvailableUsers] = useState<OrgMember[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (organization) {
      fetchData();
    }
  }, [organization]);

  const fetchData = async () => {
    if (!organization) return;

    try {
      // Fetch users with roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Fetch profiles for users with roles
      const roleUserIds = (rolesData || []).map(r => r.user_id);
      const { data: roleProfilesData } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', roleUserIds);

      const profileMap = new Map((roleProfilesData || []).map(p => [p.id, p]));
      const usersWithRolesData = (rolesData || []).map(r => ({
        ...r,
        profiles: profileMap.get(r.user_id) || { email: '', full_name: '' }
      }));

      // Fetch organization members
      const { data: membersData, error: membersError } = await supabase
        .from('organization_members')
        .select('user_id')
        .eq('organization_id', organization.id);

      if (membersError) throw membersError;

      // Fetch profiles for members
      const memberUserIds = (membersData || []).map(m => m.user_id);
      const { data: memberProfilesData } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', memberUserIds);

      const memberProfileMap = new Map((memberProfilesData || []).map(p => [p.id, p]));
      const membersWithProfiles = (membersData || []).map(m => ({
        ...m,
        profiles: memberProfileMap.get(m.user_id) || { email: '', full_name: '' }
      }));

      setUsersWithRoles(usersWithRolesData as any);
      
      // Filter out users who already have roles
      const usersWithRoleIds = new Set((rolesData || []).map(u => u.user_id));
      const available = membersWithProfiles.filter(m => !usersWithRoleIds.has(m.user_id));
      setAvailableUsers(available as any);
    } catch (error: any) {
      toast.error('Failed to load role data');
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async () => {
    if (!selectedUser || !selectedRole) {
      toast.error('Please select a user and role');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: selectedUser, role: selectedRole });

      if (error) throw error;
      toast.success('Role assigned successfully');
      setSelectedUser('');
      setSelectedRole('user');
      fetchData();
      refreshUserData();
    } catch (error: any) {
      toast.error('Failed to assign role');
    }
  };

  const removeRole = async (userId: string, role: 'admin' | 'user') => {
    if (!confirm(`Remove ${role} role from this user?`)) return;

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;
      toast.success('Role removed successfully');
      fetchData();
      refreshUserData();
    } catch (error: any) {
      toast.error('Failed to remove role');
    }
  };

  if (loading) {
    return <div>Loading roles...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">System Role Management</h2>
        <p className="text-sm text-muted-foreground">
          Assign system-wide roles (admin/user) to organization members
        </p>
      </div>

      {availableUsers.length > 0 && (
        <div className="flex items-end gap-4 p-4 border rounded-lg bg-muted/50">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Select User</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a user..." />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {(user.profiles as any)?.full_name} - {(user.profiles as any)?.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Select Role</label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={assignRole}>
            <Plus className="h-4 w-4 mr-2" />
            Assign Role
          </Button>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>System Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usersWithRoles.map((user) => (
            <TableRow key={user.user_id}>
              <TableCell className="font-medium">
                {(user.profiles as any)?.full_name || 'Unknown'}
              </TableCell>
              <TableCell>{(user.profiles as any)?.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  <Shield className="h-3 w-3 mr-1" />
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRole(user.user_id, user.role)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
