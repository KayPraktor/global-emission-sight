import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FactorVersionBadgeProps {
  version: string;
  isLatest: boolean;
  publishedDate?: string;
  className?: string;
}

export const FactorVersionBadge: React.FC<FactorVersionBadgeProps> = ({
  version,
  isLatest,
  publishedDate,
  className
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge variant={isLatest ? "default" : "secondary"} className="gap-1">
        <Clock className="h-3 w-3" />
        v{version}
      </Badge>
      {!isLatest && (
        <Badge variant="outline" className="gap-1 text-warning border-warning">
          <AlertCircle className="h-3 w-3" />
          Update Available
        </Badge>
      )}
      {publishedDate && (
        <span className="text-xs text-muted-foreground">
          {new Date(publishedDate).toLocaleDateString()}
        </span>
      )}
    </div>
  );
};
