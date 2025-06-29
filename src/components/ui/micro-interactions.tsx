
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Heart, Star, ThumbsUp, Bookmark, Share2, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Interactive Button with Micro-animations
export const InteractiveButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}> = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default', 
  className = '',
  disabled = false,
  loading = false 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onTapStart={() => setIsPressed(true)}
      onTap={() => setIsPressed(false)}
      onTapCancel={() => setIsPressed(false)}
    >
      <Button
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={disabled || loading}
        className={cn(
          'transition-all duration-200 relative overflow-hidden',
          isPressed && 'shadow-inner',
          className
        )}
      >
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
              />
              Loading...
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 bg-white/20 rounded-full"
          initial={{ scale: 0, opacity: 0 }}
          animate={isPressed ? { scale: 4, opacity: [0, 1, 0] } : {}}
          transition={{ duration: 0.6 }}
        />
      </Button>
    </motion.div>
  );
};

// Like Button with Animation
export const LikeButton: React.FC<{
  initialLiked?: boolean;
  onToggle?: (liked: boolean) => void;
  className?: string;
}> = ({ initialLiked = false, onToggle, className = '' }) => {
  const [liked, setLiked] = useState(initialLiked);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = () => {
    const newLiked = !liked;
    setLiked(newLiked);
    onToggle?.(newLiked);

    if (newLiked) {
      // Create particle effect
      const newParticles = Array.from({ length: 6 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 40 - 20,
        y: Math.random() * 40 - 20
      }));
      setParticles(newParticles);
      
      setTimeout(() => setParticles([]), 1000);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <motion.button
        onClick={handleClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={cn(
          'p-2 rounded-full transition-colors duration-200',
          liked ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-400 hover:bg-red-50'
        )}
      >
        <motion.div
          animate={liked ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Heart
            className={cn('h-5 w-5', liked && 'fill-current')}
          />
        </motion.div>
      </motion.button>

      {/* Particle effects */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            initial={{ 
              x: 0, 
              y: 0, 
              scale: 0,
              opacity: 1 
            }}
            animate={{ 
              x: particle.x, 
              y: particle.y, 
              scale: [0, 1, 0],
              opacity: [1, 1, 0] 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute top-2 left-2 pointer-events-none"
          >
            <Heart className="h-3 w-3 text-red-500 fill-current" />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Copy Button with Feedback
export const CopyButton: React.FC<{
  text: string;
  className?: string;
}> = ({ text, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <motion.button
      onClick={handleCopy}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        'p-2 rounded-lg border transition-all duration-200',
        copied 
          ? 'bg-green-50 border-green-200 text-green-600' 
          : 'bg-background border-border hover:bg-muted',
        className
      )}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.2 }}
          >
            <Check className="h-4 w-4" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ opacity: 0, rotate: 90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: -90 }}
            transition={{ duration: 0.2 }}
          >
            <Copy className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// Star Rating Component
export const StarRating: React.FC<{
  rating: number;
  maxRating?: number;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}> = ({ 
  rating, 
  maxRating = 5, 
  interactive = false, 
  onRatingChange, 
  className = '' 
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className={cn('flex gap-1', className)}>
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const filled = starValue <= (hoverRating || rating);

        return (
          <motion.button
            key={index}
            onClick={() => interactive && onRatingChange?.(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            whileHover={interactive ? { scale: 1.1 } : {}}
            whileTap={interactive ? { scale: 0.9 } : {}}
            disabled={!interactive}
            className={cn(
              'transition-colors duration-200',
              interactive && 'cursor-pointer hover:text-yellow-400',
              filled ? 'text-yellow-400' : 'text-gray-300'
            )}
          >
            <Star className={cn('h-5 w-5', filled && 'fill-current')} />
          </motion.button>
        );
      })}
    </div>
  );
};

// Floating Action Indicator
export const FloatingIndicator: React.FC<{
  show: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ show, children, className = '' }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ 
            type: 'spring', 
            stiffness: 500, 
            damping: 30 
          }}
          className={cn(
            'fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50',
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
