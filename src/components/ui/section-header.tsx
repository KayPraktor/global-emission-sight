import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ContextualHelp } from './contextual-help';
import { DataFreshness } from './data-freshness';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  helpText?: string;
  lastUpdated?: Date | string;
  className?: string;
  children?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon: Icon,
  title,
  subtitle,
  helpText,
  lastUpdated,
  className,
  children
}) => {
  return (
    <div className={cn('mb-6', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-6 w-6 text-primary" />}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground">{title}</h2>
              {helpText && <ContextualHelp content={helpText} />}
            </div>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && <DataFreshness lastUpdated={lastUpdated} />}
          {children}
        </div>
      </div>
      <div className="h-px bg-border mt-4" />
    </div>
  );
};