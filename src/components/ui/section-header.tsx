import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ContextualHelp } from './contextual-help';
import { DataFreshness } from './data-freshness';
import { Badge } from './badge';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  helpText?: string;
  lastUpdated?: Date | string;
  className?: string;
  children?: React.ReactNode;
  /** Enable gradient background styling */
  variant?: 'default' | 'gradient';
  /** Badge count or text to show */
  badge?: string | number;
  /** Badge variant */
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon: Icon,
  title,
  subtitle,
  helpText,
  lastUpdated,
  className,
  children,
  variant = 'default',
  badge,
  badgeVariant = 'secondary'
}) => {
  const isGradient = variant === 'gradient';

  return (
    <div className={cn(
      'mb-6',
      isGradient && 'rounded-xl border bg-card overflow-hidden',
      className
    )}>
      <div className={cn(
        'flex items-center justify-between',
        isGradient && 'p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b'
      )}>
        <div className="flex items-center gap-3">
          {Icon && (
            isGradient ? (
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-inset ring-primary/20">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            ) : (
              <Icon className="h-6 w-6 text-primary" />
            )
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className={cn(
                'font-semibold text-foreground',
                isGradient ? 'text-base' : 'text-xl'
              )}>
                {title}
              </h2>
              {helpText && <ContextualHelp content={helpText} />}
              {badge !== undefined && (
                <Badge variant={badgeVariant} className="font-mono text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className={cn(
                'text-muted-foreground',
                isGradient ? 'text-xs' : 'text-sm mt-1'
              )}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && <DataFreshness lastUpdated={lastUpdated} />}
          {children}
        </div>
      </div>
      {!isGradient && <div className="h-px bg-border mt-4" />}
    </div>
  );
};
