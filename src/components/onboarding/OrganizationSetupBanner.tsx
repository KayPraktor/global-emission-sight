import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Building2, Loader2, X } from 'lucide-react';
import { createPersonalOrganization } from '@/services/organizationService';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface OrganizationSetupBannerProps {
  onOrganizationCreated?: () => void;
}

export function OrganizationSetupBanner({ onOrganizationCreated }: OrganizationSetupBannerProps) {
  const { organization, refreshUserData, user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if user already has an organization or banner is dismissed
  if (organization || isDismissed) {
    return null;
  }

  const handleCreateOrganization = async () => {
    setIsCreating(true);
    
    try {
      const { data, error } = await createPersonalOrganization(orgName || undefined);
      
      if (error) {
        toast.error('Failed to create organization', {
          description: error,
        });
      } else {
        toast.success('Organization created successfully!', {
          description: `Welcome to ${data?.name || 'your organization'}`,
        });
        await refreshUserData();
        setIsDialogOpen(false);
        onOrganizationCreated?.();
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 mb-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900/50">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200">
                  Complete Your Setup
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Create your organization to unlock all features including data approvals, team management, and reports.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsDialogOpen(true)}
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
              >
                <Building2 className="h-4 w-4" />
                Create Organization
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-amber-600 hover:text-amber-800"
                onClick={() => setIsDismissed(true)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Create Your Organization
            </DialogTitle>
            <DialogDescription>
              Set up your organization to start tracking emissions with your team.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              placeholder={user?.user_metadata?.company_name || "My Company"}
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Leave blank to use your company name from signup, or enter a new name.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrganization} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Organization'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
