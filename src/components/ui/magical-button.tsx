import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Sparkles, Heart, Star, Zap } from 'lucide-react';

interface MagicalButtonProps extends ButtonProps {
  magicType?: 'sparkle' | 'pulse' | 'ripple' | 'celebration' | 'magnetic';
  showParticles?: boolean;
  particleCount?: number;
}

export const MagicalButton: React.FC<MagicalButtonProps> = ({
  children,
  magicType = 'sparkle',
  showParticles = true,
  particleCount = 8,
  className,
  onClick,
  variant = 'default',
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; icon: React.ElementType }>>([]);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const particleIcons = [Sparkles, Heart, Star, Zap];

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (magicType === 'celebration' && showParticles) {
      // Create celebration particles
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        icon: particleIcons[Math.floor(Math.random() * particleIcons.length)]
      }));
      setParticles(newParticles);
      
      setTimeout(() => setParticles([]), 1500);
    }

    if (magicType === 'ripple') {
      // Create ripple effect
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const newRipple = {
          id: Date.now(),
          x: (x / rect.width) * 100,
          y: (y / rect.height) * 100
        };
        setRipples(prev => [...prev, newRipple]);
        
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
        }, 1000);
      }
    }

    onClick?.(event);
  };

  const getAnimationProps = () => {
    switch (magicType) {
      case 'magnetic':
        return {
          whileHover: { 
            scale: 1.05, 
            y: -2,
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            transition: { type: 'spring', stiffness: 400, damping: 25 }
          },
          whileTap: { scale: 0.95 }
        };
      case 'pulse':
        return {
          animate: { 
            boxShadow: [
              '0 0 0 0 rgba(59, 130, 246, 0.7)',
              '0 0 0 10px rgba(59, 130, 246, 0)',
            ]
          },
          transition: { duration: 2, repeat: Infinity },
          whileHover: { scale: 1.05 },
          whileTap: { scale: 0.95 }
        };
      case 'celebration':
        return {
          whileHover: { 
            scale: 1.05,
            rotate: [0, -1, 1, -1, 0],
            transition: { rotate: { duration: 0.5 } }
          },
          whileTap: { scale: 0.9 }
        };
      default:
        return {
          whileHover: { scale: 1.05, y: -2 },
          whileTap: { scale: 0.95 }
        };
    }
  };

  const getMagicVariant = () => {
    if (magicType === 'celebration') return 'celebration';
    if (magicType === 'magnetic' || magicType === 'sparkle') return 'magic';
    return variant;
  };

  return (
    <div className="relative inline-block">
      <motion.div
        {...getAnimationProps()}
        onTapStart={() => setIsPressed(true)}
        onTap={() => setIsPressed(false)}
        onTapCancel={() => setIsPressed(false)}
      >
        <Button
          ref={buttonRef}
          variant={getMagicVariant()}
          className={cn(
            'relative z-10 overflow-hidden',
            magicType === 'sparkle' && 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700',
            className
          )}
          onClick={handleClick}
          {...props}
        >
          <span className="relative z-10">{children}</span>
          
          {/* Ripple Effects */}
          <AnimatePresence>
            {ripples.map((ripple) => (
              <motion.div
                key={ripple.id}
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: 4, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute bg-white/30 rounded-full"
                style={{
                  left: `${ripple.x}%`,
                  top: `${ripple.y}%`,
                  width: '20px',
                  height: '20px',
                  marginLeft: '-10px',
                  marginTop: '-10px',
                }}
              />
            ))}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Celebration Particles */}
      <AnimatePresence>
        {particles.map((particle) => {
          const Icon = particle.icon;
          return (
            <motion.div
              key={particle.id}
              initial={{ 
                x: 0, 
                y: 0, 
                scale: 0,
                opacity: 1,
                rotate: 0 
              }}
              animate={{ 
                x: particle.x, 
                y: particle.y, 
                scale: [0, 1, 0],
                opacity: [1, 1, 0],
                rotate: 360
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 1.5, 
                ease: 'easeOut',
                rotate: { duration: 1.5, ease: 'linear' }
              }}
              className="absolute top-1/2 left-1/2 pointer-events-none z-50"
              style={{ 
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Icon className="h-4 w-4 text-yellow-400 fill-current" />
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Magnetic Cursor Effect */}
      {magicType === 'magnetic' && (
        <motion.div
          className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        />
      )}
    </div>
  );
};