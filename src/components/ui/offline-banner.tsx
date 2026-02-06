import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface OfflineBannerProps {
  isOffline: boolean;
  isSlowConnection?: boolean;
  onRetry?: () => void;
  className?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOffline,
  isSlowConnection = false,
  onRetry,
  className
}) => {
  if (!isOffline && !isSlowConnection) return null;

  return (
    <AnimatePresence>
      {(isOffline || isSlowConnection) && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={cn(
            'fixed top-0 left-0 right-0 z-50 px-4 py-3',
            isOffline 
              ? 'bg-destructive text-destructive-foreground' 
              : 'bg-warning text-warning-foreground',
            className
          )}
        >
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <WifiOff className="h-5 w-5" />
              <div>
                <p className="font-medium">
                  {isOffline ? "You're offline" : "Slow connection detected"}
                </p>
                <p className="text-sm opacity-90">
                  {isOffline 
                    ? "Some features may be unavailable. Changes will sync when you're back online."
                    : "Your connection is slow. Some features may load slowly."}
                </p>
              </div>
            </div>
            {onRetry && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onRetry}
                className="shrink-0"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
