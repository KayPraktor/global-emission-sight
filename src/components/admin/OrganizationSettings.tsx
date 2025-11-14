import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Building2, Save } from 'lucide-react';

export const OrganizationSettings = () => {
  const { organization, refreshUserData } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (organization) {
      setName(organization.name);
    }
  }, [organization]);

  const handleSave = async () => {
    if (!organization || !name.trim()) {
      toast.error('Organization name is required');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ name: name.trim() })
        .eq('id', organization.id);

      if (error) throw error;
      toast.success('Organization updated successfully');
      refreshUserData();
    } catch (error: any) {
      toast.error('Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Organization Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your organization's basic information
        </p>
      </div>

      <div className="max-w-md space-y-4">
        <div className="space-y-2">
          <Label htmlFor="org-name">Organization Name</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="org-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10"
                placeholder="Enter organization name"
              />
            </div>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-2">
            <Label>Organization ID</Label>
            <Input value={organization?.id || ''} disabled className="font-mono text-xs" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Your Role</Label>
          <Input value={organization?.role || ''} disabled className="capitalize" />
        </div>
      </div>
    </div>
  );
};
