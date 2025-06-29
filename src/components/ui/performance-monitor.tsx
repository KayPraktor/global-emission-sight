
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePerformanceMonitor, useMemoryUsage } from '@/hooks/usePerformanceMonitor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Memory, Zap, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export const PerformanceMonitor: React.FC<{
  componentName?: string;
  className?: string;
}> = ({ componentName = 'App', className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const metrics = usePerformanceMonitor(componentName);
  const memoryInfo = useMemoryUsage();

  const getFPSColor = (fps: number) => {
    if (fps >= 50) return 'text-green-500';
    if (fps >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMemoryColor = (percentage: number) => {
    if (percentage <= 50) return 'bg-green-500';
    if (percentage <= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsVisible(!isVisible)}
        className={cn('fixed bottom-4 left-4 z-50', className)}
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed bottom-16 left-4 z-40"
          >
            <Card className="w-80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4" />
                  Performance Monitor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* FPS Counter */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">FPS</span>
                  </div>
                  <Badge variant="outline" className={getFPSColor(metrics.fps)}>
                    {metrics.fps}
                  </Badge>
                </div>

                {/* Render Time */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Render Time</span>
                  <Badge variant="outline">
                    {metrics.renderTime.toFixed(2)}ms
                  </Badge>
                </div>

                {/* Component Mounts */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Mounts</span>
                  <Badge variant="outline">
                    {metrics.componentMounts}
                  </Badge>
                </div>

                {/* Memory Usage */}
                {memoryInfo && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Memory className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Memory</span>
                      <Badge variant="outline" className="ml-auto">
                        {memoryInfo.used}MB / {memoryInfo.total}MB
                      </Badge>
                    </div>
                    <Progress
                      value={(memoryInfo.used / memoryInfo.total) * 100}
                      className="h-2"
                    />
                  </div>
                )}

                {/* Performance Tips */}
                <div className="pt-2 border-t border-border">
                  <div className="text-xs text-muted-foreground space-y-1">
                    {metrics.fps < 30 && (
                      <div className="text-red-500">⚠️ Low FPS detected</div>
                    )}
                    {metrics.renderTime > 100 && (
                      <div className="text-yellow-500">⚠️ Slow render time</div>
                    )}
                    {memoryInfo && (memoryInfo.used / memoryInfo.total) > 0.8 && (
                      <div className="text-red-500">⚠️ High memory usage</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
