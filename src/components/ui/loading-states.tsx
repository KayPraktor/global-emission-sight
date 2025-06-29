
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Skeleton Components
export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
  animated?: boolean;
}> = ({ lines = 1, className = '', animated = true }) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <motion.div
          key={index}
          className={cn(
            'h-4 bg-gradient-to-r from-muted via-muted-foreground/20 to-muted rounded',
            animated && 'animate-pulse'
          )}
          style={{ width: `${Math.random() * 40 + 60}%` }}
          initial={animated ? { opacity: 0 } : undefined}
          animate={animated ? { opacity: 1 } : undefined}
          transition={{ delay: index * 0.1 }}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{
  className?: string;
  showAvatar?: boolean;
  showActions?: boolean;
}> = ({ className = '', showAvatar = false, showActions = false }) => {
  return (
    <motion.div
      className={cn('p-6 border rounded-lg bg-card', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start space-x-4">
        {showAvatar && (
          <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
        )}
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-muted rounded animate-pulse" style={{ width: '70%' }} />
          <SkeletonText lines={2} />
          {showActions && (
            <div className="flex space-x-2 pt-2">
              <div className="h-8 w-20 bg-muted rounded animate-pulse" />
              <div className="h-8 w-16 bg-muted rounded animate-pulse" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const SkeletonTable: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="h-4 bg-muted rounded animate-pulse" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <motion.div
          key={rowIndex}
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: rowIndex * 0.1 }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-4 bg-muted rounded animate-pulse"
              style={{ width: `${Math.random() * 30 + 70}%` }}
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
};

// Loading Spinner Components
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}> = ({ size = 'md', className = '', text }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && (
        <motion.span
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {text}
        </motion.span>
      )}
    </div>
  );
};

// Progress Indicators
export const ProgressBar: React.FC<{
  value: number;
  max?: number;
  className?: string;
  animated?: boolean;
  showLabel?: boolean;
}> = ({ value, max = 100, className = '', animated = true, showLabel = true }) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn('space-y-2', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
          initial={animated ? { width: 0 } : undefined}
          animate={{ width: `${percentage}%` }}
          transition={animated ? { duration: 1, ease: 'easeOut' } : undefined}
        />
      </div>
    </div>
  );
};

// Status Indicators
export const StatusIndicator: React.FC<{
  status: 'loading' | 'success' | 'error' | 'warning';
  message?: string;
  className?: string;
}> = ({ status, message, className = '' }) => {
  const statusConfig = {
    loading: {
      icon: Loader2,
      color: 'text-blue-500',
      bg: 'bg-blue-50 border-blue-200',
      animation: { rotate: 360, transition: { duration: 1, repeat: Infinity, ease: 'linear' } }
    },
    success: {
      icon: CheckCircle2,
      color: 'text-green-500',
      bg: 'bg-green-50 border-green-200',
      animation: { scale: [0, 1.2, 1], transition: { duration: 0.6 } }
    },
    error: {
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-50 border-red-200',
      animation: { x: [-2, 2, -2, 2, 0], transition: { duration: 0.5 } }
    },
    warning: {
      icon: AlertCircle,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50 border-yellow-200',
      animation: { rotate: [0, 5, -5, 0], transition: { duration: 0.5 } }
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border',
        config.bg,
        className
      )}
    >
      <motion.div animate={config.animation} className={config.color}>
        <Icon className="h-5 w-5" />
      </motion.div>
      {message && (
        <span className="text-sm font-medium text-gray-800">{message}</span>
      )}
    </motion.div>
  );
};
