import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, AlertTriangle, FileEdit } from 'lucide-react';
import type { ApprovalStatus } from '@/services/approvalService';

interface ApprovalStatusBadgeProps {
  status: ApprovalStatus;
  className?: string;
}

const statusConfig: Record<ApprovalStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; className: string }> = {
  draft: {
    label: 'Draft',
    variant: 'secondary',
    icon: <FileEdit className="h-3 w-3" />,
    className: 'bg-muted text-muted-foreground',
  },
  pending_review: {
    label: 'Pending Review',
    variant: 'outline',
    icon: <Clock className="h-3 w-3" />,
    className: 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/20',
  },
  changes_requested: {
    label: 'Changes Requested',
    variant: 'outline',
    icon: <AlertTriangle className="h-3 w-3" />,
    className: 'border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-950/20',
  },
  approved: {
    label: 'Approved',
    variant: 'default',
    icon: <CheckCircle className="h-3 w-3" />,
    className: 'bg-emerald-500 text-white hover:bg-emerald-600',
  },
  rejected: {
    label: 'Rejected',
    variant: 'destructive',
    icon: <XCircle className="h-3 w-3" />,
    className: '',
  },
};

export function ApprovalStatusBadge({ status, className }: ApprovalStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Badge 
      variant={config.variant} 
      className={`flex items-center gap-1 ${config.className} ${className || ''}`}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}
