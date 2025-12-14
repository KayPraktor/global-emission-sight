import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { translations as t } from '@/lib/translations';

interface SampleDataBadgeProps {
  text?: string;
  showTooltip?: boolean;
  className?: string;
}

export const SampleDataBadge: React.FC<SampleDataBadgeProps> = ({ 
  text = t.sampleData.badge,
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
            {badge}
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{t.sampleData.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
};
