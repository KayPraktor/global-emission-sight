
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

// Responsive Container Component
export const ResponsiveContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}> = ({ children, className = '', maxWidth = 'xl', padding = 'md' }) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 py-2',
    md: 'px-6 py-4',
    lg: 'px-8 py-6'
  };

  return (
    <div className={cn(
      'mx-auto w-full',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};

// Responsive Grid Component
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ 
  children, 
  cols = { default: 1, md: 2, lg: 3 }, 
  gap = 'md',
  className = '' 
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const getGridCols = () => {
    const classes = [];
    if (cols.default) classes.push(`grid-cols-${cols.default}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    return classes.join(' ');
  };

  return (
    <div className={cn(
      'grid',
      getGridCols(),
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
};

// Responsive Stack Component
export const ResponsiveStack: React.FC<{
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal' | 'responsive';
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  className?: string;
}> = ({ 
  children, 
  direction = 'vertical', 
  spacing = 'md', 
  align = 'stretch',
  justify = 'start',
  className = '' 
}) => {
  const spacingClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  };

  const directionClasses = {
    vertical: 'flex-col',
    horizontal: 'flex-row',
    responsive: 'flex-col md:flex-row'
  };

  return (
    <div className={cn(
      'flex',
      directionClasses[direction],
      spacingClasses[spacing],
      alignClasses[align],
      justifyClasses[justify],
      className
    )}>
      {children}
    </div>
  );
};

// Mobile-First Card Component
export const MobileCard: React.FC<{
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated';
}> = ({ 
  children, 
  title, 
  subtitle, 
  actions, 
  className = '',
  variant = 'default' 
}) => {
  const isMobile = useIsMobile();

  const variantClasses = {
    default: 'bg-card border border-border',
    outlined: 'border-2 border-border bg-transparent',
    elevated: 'bg-card shadow-lg border border-border'
  };

  return (
    <motion.div
      className={cn(
        'rounded-lg p-4',
        variantClasses[variant],
        isMobile ? 'p-4' : 'p-6',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {(title || subtitle || actions) && (
        <div className={cn(
          'flex items-start justify-between mb-4',
          isMobile ? 'flex-col gap-2' : 'flex-row'
        )}>
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className={cn(
              'flex gap-2',
              isMobile ? 'w-full justify-end' : 'shrink-0'
            )}>
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </motion.div>
  );
};

// Responsive Section Component
export const ResponsiveSection: React.FC<{
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  headerActions?: React.ReactNode;
}> = ({ children, title, description, className = '', headerActions }) => {
  const isMobile = useIsMobile();

  return (
    <section className={cn('space-y-6', className)}>
      {(title || description || headerActions) && (
        <div className={cn(
          'flex items-start justify-between',
          isMobile ? 'flex-col gap-4' : 'flex-row items-center'
        )}>
          <div>
            {title && (
              <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            )}
            {description && (
              <p className="text-muted-foreground mt-2">{description}</p>
            )}
          </div>
          {headerActions && (
            <div className={cn(
              'flex gap-2',
              isMobile ? 'w-full justify-end' : 'shrink-0'
            )}>
              {headerActions}
            </div>
          )}
        </div>
      )}
      {children}
    </section>
  );
};
