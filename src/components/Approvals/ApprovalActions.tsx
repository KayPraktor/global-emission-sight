import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, MessageSquare, Loader2 } from 'lucide-react';
import { approvalService } from '@/services/approvalService';
import { toast } from 'sonner';

interface ApprovalActionsProps {
  entryId: string;
  onActionComplete: () => void;
  compact?: boolean;
}

type ActionType = 'approve' | 'reject' | 'changes';

export function ApprovalActions({ entryId, onActionComplete, compact }: ApprovalActionsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = (type: ActionType) => {
    setActionType(type);
    setMessage('');
    if (type === 'approve') {
      // Can approve without message
      handleSubmit(type, '');
    } else {
      setIsDialogOpen(true);
    }
  };

  const handleSubmit = async (type: ActionType, msg: string) => {
    setIsLoading(true);
    let result;

    switch (type) {
      case 'approve':
        result = await approvalService.approveEntry(entryId, msg || undefined);
        break;
      case 'reject':
        result = await approvalService.rejectEntry(entryId, msg);
        break;
      case 'changes':
        result = await approvalService.requestChanges(entryId, msg);
        break;
    }

    setIsLoading(false);

    if (result.success) {
      toast.success(
        type === 'approve' ? 'Entry approved' :
        type === 'reject' ? 'Entry rejected' :
        'Changes requested'
      );
      setIsDialogOpen(false);
      onActionComplete();
    } else {
      toast.error(result.error || 'Action failed');
    }
  };

  const dialogConfig = {
    reject: {
      title: 'Reject Entry',
      description: 'Please provide a reason for rejecting this entry.',
      buttonText: 'Reject',
      buttonVariant: 'destructive' as const,
    },
    changes: {
      title: 'Request Changes',
      description: 'Please describe what changes are needed.',
      buttonText: 'Request Changes',
      buttonVariant: 'outline' as const,
    },
    approve: {
      title: 'Approve Entry',
      description: 'Add an optional note.',
      buttonText: 'Approve',
      buttonVariant: 'default' as const,
    },
  };

  const config = actionType ? dialogConfig[actionType] : null;

  return (
    <>
      <div className={`flex ${compact ? 'gap-1' : 'gap-2'}`}>
        <Button
          size={compact ? 'sm' : 'default'}
          variant="default"
          onClick={() => handleAction('approve')}
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          {!compact && <span className="ml-1">Approve</span>}
        </Button>
        <Button
          size={compact ? 'sm' : 'default'}
          variant="outline"
          onClick={() => handleAction('changes')}
          disabled={isLoading}
        >
          <MessageSquare className="h-4 w-4" />
          {!compact && <span className="ml-1">Request Changes</span>}
        </Button>
        <Button
          size={compact ? 'sm' : 'default'}
          variant="destructive"
          onClick={() => handleAction('reject')}
          disabled={isLoading}
        >
          <XCircle className="h-4 w-4" />
          {!compact && <span className="ml-1">Reject</span>}
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{config?.title}</DialogTitle>
            <DialogDescription>{config?.description}</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={config?.buttonVariant}
              onClick={() => actionType && handleSubmit(actionType, message)}
              disabled={isLoading || (actionType !== 'approve' && !message.trim())}
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {config?.buttonText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
