import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const AnimatedTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  >
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ 
        duration: 0.2, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
    >
      {children}
    </motion.div>
  </TabsPrimitive.Content>
));

AnimatedTabsContent.displayName = 'AnimatedTabsContent';

// Tab indicator component for sliding active state
interface TabIndicatorProps {
  layoutId: string;
  className?: string;
}

const TabIndicator: React.FC<TabIndicatorProps> = ({ layoutId, className }) => (
  <motion.div
    layoutId={layoutId}
    className={cn(
      'absolute inset-0 bg-background rounded-sm shadow-sm',
      className
    )}
    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
  />
);

export { AnimatedTabsContent, TabIndicator };
