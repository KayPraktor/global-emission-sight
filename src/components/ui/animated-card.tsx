import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnimatedCardProps extends React.ComponentProps<typeof Card> {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  hoverY?: number;
  clickable?: boolean;
}

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, hoverScale = 1.02, hoverY = -4, clickable = true, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={clickable ? { 
          y: hoverY, 
          scale: hoverScale,
          transition: { type: 'spring', stiffness: 400, damping: 25 }
        } : undefined}
        whileTap={clickable ? { 
          scale: 0.98,
          transition: { type: 'spring', stiffness: 400, damping: 25 }
        } : undefined}
        className={cn('motion-safe:transition-shadow motion-safe:hover:shadow-lg', className)}
      >
        <Card {...props}>
          {children}
        </Card>
      </motion.div>
    );
  }
);

AnimatedCard.displayName = 'AnimatedCard';

// Variant with entrance animation
export const AnimatedCardWithEntrance: React.FC<AnimatedCardProps & { delay?: number }> = ({ 
  children, 
  className, 
  delay = 0,
  ...props 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay, 
        duration: 0.4, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
    >
      <AnimatedCard className={className} {...props}>
        {children}
      </AnimatedCard>
    </motion.div>
  );
};
