
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

// Loading Skeleton Component
export const LoadingSkeleton: React.FC<{ 
  lines?: number; 
  className?: string; 
  variant?: 'text' | 'card' | 'avatar' | 'button' 
}> = ({ 
  lines = 3, 
  className = '', 
  variant = 'text' 
}) => {
  const skeletonVariants = {
    text: (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse" style={{ width: `${85 + Math.random() * 15}%` }} />
          </div>
        ))}
      </div>
    ),
    card: (
      <div className={`p-6 border rounded-lg ${className}`}>
        <div className="h-6 bg-muted rounded animate-pulse mb-4" style={{ width: '60%' }} />
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div key={i} className="h-4 bg-muted rounded animate-pulse" style={{ width: `${70 + Math.random() * 30}%` }} />
          ))}
        </div>
      </div>
    ),
    avatar: (
      <div className={`flex items-center space-x-4 ${className}`}>
        <div className="w-12 h-12 bg-muted rounded-full animate-pulse" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-muted rounded animate-pulse" style={{ width: '40%' }} />
          <div className="h-3 bg-muted rounded animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    ),
    button: (
      <div className={`h-10 bg-muted rounded animate-pulse ${className}`} style={{ width: '120px' }} />
    )
  };

  return skeletonVariants[variant];
};

// Staggered Animation Container
export const StaggeredContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}> = ({ children, className = '', staggerDelay = 0.1 }) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Success/Error Animation Component
export const StatusAnimation: React.FC<{
  status: 'success' | 'error' | 'warning' | 'loading';
  message: string;
  onComplete?: () => void;
  autoHide?: boolean;
  duration?: number;
}> = ({ 
  status, 
  message, 
  onComplete, 
  autoHide = true, 
  duration = 3000 
}) => {
  const [visible, setVisible] = useState(true);
  const controls = useAnimation();

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onComplete) onComplete();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onComplete]);

  const statusConfig = {
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
      animation: { x: [-10, 10, -10, 10, 0], transition: { duration: 0.5 } }
    },
    warning: {
      icon: AlertCircle,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50 border-yellow-200',
      animation: { rotate: [0, 10, -10, 0], transition: { duration: 0.5 } }
    },
    loading: {
      icon: Loader2,
      color: 'text-blue-500',
      bg: 'bg-blue-50 border-blue-200',
      animation: { rotate: 360, transition: { duration: 1, repeat: Infinity, ease: "linear" } }
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.8 }}
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg ${config.bg} max-w-sm`}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={config.animation}
              className={config.color}
            >
              <Icon className="h-6 w-6" />
            </motion.div>
            <p className="text-sm font-medium text-gray-900">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hover Scale Component
export const HoverScale: React.FC<{
  children: React.ReactNode;
  scale?: number;
  className?: string;
}> = ({ children, scale = 1.05, className = '' }) => {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: scale * 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Slide In Animation
export const SlideIn: React.FC<{
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  className?: string;
}> = ({ children, direction = 'left', delay = 0, className = '' }) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'left': return { x: -100, opacity: 0 };
      case 'right': return { x: 100, opacity: 0 };
      case 'up': return { y: -100, opacity: 0 };
      case 'down': return { y: 100, opacity: 0 };
      default: return { x: -100, opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      animate={{ x: 0, y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Fade In Animation
export const FadeIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}> = ({ children, delay = 0, duration = 0.5, className = '' }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Counter Animation
export const AnimatedCounter: React.FC<{
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
}> = ({ value, duration = 1, suffix = '', className = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const difference = value - startValue;

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      
      setDisplayValue(Math.floor(startValue + difference * easeOutCubic));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className={className}>
      {displayValue.toLocaleString()}{suffix}
    </span>
  );
};
