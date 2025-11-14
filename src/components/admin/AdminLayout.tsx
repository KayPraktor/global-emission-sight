import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { UserManagement } from './UserManagement';
import { RoleManagement } from './RoleManagement';
import { OrganizationSettings } from './OrganizationSettings';

export const AdminLayout = () => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users, roles, and organization settings</p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="p-6">
            <UserManagement />
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card className="p-6">
            <RoleManagement />
          </Card>
        </TabsContent>

        <TabsContent value="organization">
          <Card className="p-6">
            <OrganizationSettings />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
