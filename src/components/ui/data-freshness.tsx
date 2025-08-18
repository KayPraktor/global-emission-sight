import React from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataFreshnessProps {
  lastUpdated: Date | string;
  threshold?: number; // Hours after which data is considered stale
  className?: string;
}

export const DataFreshness: React.FC<DataFreshnessProps> = ({ 
  lastUpdated, 
  threshold = 24,
  className 
}) => {
  const updatedDate = typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated;
  const hoursAgo = Math.floor((Date.now() - updatedDate.getTime()) / (1000 * 60 * 60));
  const isStale = hoursAgo > threshold;
  const isVeryFresh = hoursAgo < 1;

  const formatTime = (hours: number) => {
    if (hours < 1) return 'Less than 1 hour ago';
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  const Icon = isVeryFresh ? CheckCircle : isStale ? AlertCircle : Clock;
  const colorClass = isVeryFresh ? 'text-green-600' : isStale ? 'text-amber-600' : 'text-muted-foreground';

  return (
    <div className={cn('flex items-center gap-1.5 text-xs', colorClass, className)}>
      <Icon className="h-3 w-3" />
      <span>Updated {formatTime(hoursAgo)}</span>
    </div>
  );
};