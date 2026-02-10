import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, AlertTriangle, FileText } from 'lucide-react';

interface RegulatoryUpdate {
  id: string;
  title: string;
  impact: string;
  date: string;
  description: string;
  action: string;
  deadline: string;
}

interface RegulatoryUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  update: RegulatoryUpdate | null;
}

export const RegulatoryUpdateDialog: React.FC<RegulatoryUpdateDialogProps> = ({
  open,
  onOpenChange,
  update,
}) => {
  if (!update) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {update.title}
          </DialogTitle>
          <DialogDescription>Regulatory Update Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center gap-2">
            <Badge className={`text-xs ${
              update.impact === 'high' ? 'bg-red-100 text-red-800' :
              update.impact === 'medium' ? 'bg-amber-100 text-amber-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {update.impact.toUpperCase()} IMPACT
            </Badge>
            <span className="text-sm text-muted-foreground">
              Published: {new Date(update.date).toLocaleDateString()}
            </span>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-1">Description</h4>
            <p className="text-sm text-muted-foreground">{update.description}</p>
          </div>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
            <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Action Required
            </h4>
            <p className="text-sm">{update.action}</p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Compliance Deadline:</span>
            <span>{new Date(update.deadline).toLocaleDateString()}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
