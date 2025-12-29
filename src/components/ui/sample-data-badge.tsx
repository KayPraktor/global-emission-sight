import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SampleDataBadgeProps {
  text?: string;
  showTooltip?: boolean;
  className?: string;
}

export const SampleDataBadge: React.FC<SampleDataBadgeProps> = ({ 
  text = "Sample Data",
  showTooltip = true,
  className = ""
}) => {
  const badge = (
    <Badge variant="warning" className={`flex items-center gap-1 ${className}`}>
      <Info className="h-3 w-3" />
      {text}
    </Badge>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex">{badge}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">This data is for demonstration purposes. Add real data to see your actual metrics.</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
};
