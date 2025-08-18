import React from 'react';
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ContextualHelpProps {
  content: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({ 
  content, 
  className,
  size = 'sm'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle 
            className={cn(
              sizeClasses[size],
              'text-muted-foreground hover:text-foreground cursor-help transition-colors',
              className
            )} 
          />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};