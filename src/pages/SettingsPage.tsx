import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { NotificationPreferences } from '@/components/settings/NotificationPreferences';
import { AppearanceSettings } from '@/components/settings/AppearanceSettings';
import { OrganizationSettings } from '@/components/admin/OrganizationSettings';
import { BrandingSettings } from '@/components/Reports/BrandingSettings';
import { useAuth } from '@/contexts/AuthContext';
import { User, Building2, Bell, Palette, FileText } from 'lucide-react';

const SettingsPage = () => {
  const { organization } = useAuth();
  const isOrgAdminOrOwner = organization?.role === 'owner' || organization?.role === 'admin';

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-2 bg-transparent p-0">
          <TabsTrigger 
            value="profile" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          
          {isOrgAdminOrOwner && (
            <TabsTrigger 
              value="organization" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Organization</span>
            </TabsTrigger>
          )}
          
          <TabsTrigger 
            value="notifications" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="branding" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Report Branding</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="appearance" 
            className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileSettings />
        </TabsContent>

        {isOrgAdminOrOwner && (
          <TabsContent value="organization" className="mt-6">
            <OrganizationSettings />
          </TabsContent>
        )}

        <TabsContent value="notifications" className="mt-6">
          <NotificationPreferences />
        </TabsContent>

        <TabsContent value="branding" className="mt-6">
          <BrandingSettings />
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <AppearanceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
