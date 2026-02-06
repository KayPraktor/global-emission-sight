import { useEffect, useState } from 'react';
import { ApprovalQueue } from '@/components/Approvals/ApprovalQueue';
import { MySubmissions } from '@/components/Approvals/MySubmissions';
import { approvalService } from '@/services/approvalService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardCheck, Clock, CheckCircle, XCircle, AlertTriangle, FileEdit, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ApprovalsPage() {
  const [isSupervisor, setIsSupervisor] = useState<boolean | null>(null);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    changesRequested: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      const supervisor = await approvalService.isCurrentUserSupervisor();
      setIsSupervisor(supervisor);
      
      if (!supervisor) {
        // Non-supervisors can still view, but with limited functionality
      }
    };

    const loadStats = async () => {
      setIsLoadingStats(true);
      const [pending, approved, rejected, changes] = await Promise.all([
        approvalService.getEntriesWithApprovalStatus('pending_review'),
        approvalService.getEntriesWithApprovalStatus('approved'),
        approvalService.getEntriesWithApprovalStatus('rejected'),
        approvalService.getEntriesWithApprovalStatus('changes_requested'),
      ]);
      
      setStats({
        pending: pending.length,
        approved: approved.length,
        rejected: rejected.length,
        changesRequested: changes.length,
      });
      setIsLoadingStats(false);
    };

    checkAccess();
    loadStats();
  }, []);

  const statCards = [
    {
      title: 'Pending Review',
      value: stats.pending,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    },
    {
      title: 'Changes Requested',
      value: stats.changesRequested,
      icon: AlertTriangle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/20',
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="h-8 w-8" />
            Data Approvals
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and manage emissions data entries
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    {isLoadingStats ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold">{stat.value}</p>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs for My Submissions vs Approval Queue */}
        <Tabs defaultValue="my-submissions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="my-submissions" className="gap-2">
              <FileEdit className="h-4 w-4" />
              My Submissions
            </TabsTrigger>
            <TabsTrigger value="approval-queue" className="gap-2">
              <Send className="h-4 w-4" />
              {isSupervisor ? 'Approval Queue' : 'Team Queue'}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="my-submissions" className="mt-6">
            <MySubmissions />
          </TabsContent>
          
          <TabsContent value="approval-queue" className="mt-6">
            {/* Access Notice for Non-Supervisors */}
            {isSupervisor === false && (
              <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-amber-800 dark:text-amber-200">Limited Access</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        You can view entries but only organization owners and admins can approve or reject submissions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            <ApprovalQueue />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
