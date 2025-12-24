import React from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AuditLogViewer } from '@/components/Audit/AuditLogViewer';
import { AuditDashboard } from '@/components/Audit/AuditDashboard';
import { Shield, Activity, FileSearch } from 'lucide-react';

const AuditPage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Audit Trail</h1>
          </div>
          <p className="text-muted-foreground">
            Monitor all system activities and track changes across your organization
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="logs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-2">
              <Activity className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <FileSearch className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <AuditDashboard />
          </TabsContent>

          <TabsContent value="logs">
            <AuditLogViewer />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AuditPage;
