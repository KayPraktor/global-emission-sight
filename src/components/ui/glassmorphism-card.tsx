
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassmorphismCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark' | 'colored';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  opacity?: number;
  children: React.ReactNode;
}

export function GlassmorphismCard({
  variant = 'light',
  blur = 'md',
  opacity = 0.8,
  className,
  children,
  ...props
}: GlassmorphismCardProps) {
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  };

  const variantClasses = {
    light: `bg-white/80 dark:bg-white/10 border-white/20`,
    dark: `bg-black/80 dark:bg-black/40 border-black/20`,
    colored: `bg-gradient-to-br from-primary/20 to-secondary/20 border-primary/20`
  };

  return (
    <div
      className={cn(
        'rounded-xl border backdrop-saturate-150 shadow-xl',
        blurClasses[blur],
        variantClasses[variant],
        className
      )}
      style={{ 
        backgroundColor: variant === 'light' 
          ? `rgba(255, 255, 255, ${opacity})` 
          : variant === 'dark'
          ? `rgba(0, 0, 0, ${opacity})`
          : undefined
      }}
      {...props}
    >
      {children}
    </div>
  );
}

// Glassmorphism Navigation Component
export function GlassNavigation({ 
  children, 
  className = '',
  ...props 
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn(
        'fixed top-4 left-1/2 transform -translate-x-1/2 z-50',
        'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md',
        'border border-white/20 dark:border-gray-700/30',
        'rounded-full px-6 py-3 shadow-2xl',
        'backdrop-saturate-150',
        className
      )}
      {...props}
    >
      {children}
    </nav>
  );
}

// Glassmorphism Modal Overlay
export function GlassModalOverlay({ 
  children, 
  className = '',
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-black/50 backdrop-blur-sm',
        className
      )}
      {...props}
    >
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-2xl border border-white/20 dark:border-gray-700/30 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
        {children}
      </div>
    </div>
  );
}
