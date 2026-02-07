import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SuccessCheckmarkProps {
  size?: number;
  className?: string;
  strokeWidth?: number;
  color?: string;
  onComplete?: () => void;
}

export const SuccessCheckmark: React.FC<SuccessCheckmarkProps> = ({
  size = 64,
  className,
  strokeWidth = 3,
  color = 'hsl(var(--primary))',
  onComplete,
}) => {
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        initial="hidden"
        animate="visible"
        onAnimationComplete={onComplete}
      >
        {/* Circle background */}
        <motion.circle
          cx="25"
          cy="25"
          r="22"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: { 
              pathLength: 1, 
              opacity: 1,
              transition: { duration: 0.4, ease: 'easeOut' }
            }
          }}
        />
        
        {/* Checkmark */}
        <motion.path
          d="M14 27 L22 35 L38 16"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: { 
              pathLength: 1, 
              opacity: 1,
              transition: { duration: 0.3, delay: 0.3, ease: 'easeOut' }
            }
          }}
        />
      </motion.svg>
      
      {/* Success pulse ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2"
        style={{ borderColor: color }}
        initial={{ scale: 1, opacity: 0.5 }}
        animate={{ scale: 1.5, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
};

// Inline success indicator for form fields
export const InlineSuccess: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;
  
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10"
    >
      <motion.svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.path
          d="M2 6 L5 9 L10 3"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </motion.div>
  );
};
