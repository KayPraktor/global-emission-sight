import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Trophy, Star, Zap, Flame } from 'lucide-react';

// Confetti Particle Component
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
}

interface ConfettiExplosionProps {
  trigger: boolean;
  colors?: string[];
  particleCount?: number;
  duration?: number;
  originX?: number;
  originY?: number;
  onComplete?: () => void;
}

export const ConfettiExplosion: React.FC<ConfettiExplosionProps> = ({
  trigger,
  colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'],
  particleCount = 50,
  duration = 3000,
  originX = 50,
  originY = 50,
  onComplete
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      const newParticles: Particle[] = [];
      
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: originX,
          y: originY,
          vx: (Math.random() - 0.5) * 20,
          vy: Math.random() * -15 - 5,
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 20,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4
        });
      }
      
      setParticles(newParticles);
      
      setTimeout(() => {
        setParticles([]);
        setIsActive(false);
        onComplete?.();
      }, duration);
    }
  }, [trigger, particleCount, colors, duration, originX, originY, onComplete, isActive]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            x: `${particle.x}vw`,
            y: `${particle.y}vh`,
            rotate: particle.rotation,
            scale: 1,
            opacity: 1
          }}
          animate={{
            x: `${particle.x + particle.vx * 10}vw`,
            y: `${particle.y + 100}vh`,
            rotate: particle.rotation + particle.rotationSpeed * 50,
            scale: 0,
            opacity: 0
          }}
          transition={{
            duration: duration / 1000,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
          style={{
            position: 'absolute',
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px'
          }}
        />
      ))}
    </div>
  );
};

// Success Pulse Component
interface SuccessPulseProps {
  trigger: boolean;
  children?: React.ReactNode;
  className?: string;
  color?: string;
}

export const SuccessPulse: React.FC<SuccessPulseProps> = ({
  trigger,
  children,
  className = '',
  color = 'rgb(34, 197, 94)'
}) => {
  const [showPulse, setShowPulse] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShowPulse(true);
      const timer = setTimeout(() => setShowPulse(false), 600);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <AnimatePresence>
        {showPulse && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full"
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 2.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: 'easeOut'
                }}
                style={{
                  border: `2px solid ${color}`,
                  boxShadow: `0 0 20px ${color}`
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
      {children || (
        <motion.div
          animate={showPulse ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
          className="relative z-10 p-2 rounded-full bg-emerald-500 text-white"
        >
          <Check className="h-5 w-5" />
        </motion.div>
      )}
    </div>
  );
};

// Celebration Overlay Component
interface CelebrationOverlayProps {
  show: boolean;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  duration?: number;
  onClose?: () => void;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({
  show,
  title,
  subtitle,
  icon,
  duration = 3000,
  onClose
}) => {
  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-gradient-to-br from-primary/20 via-background to-primary/10 border border-primary/30 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-lg"
            >
              {icon || <Trophy className="h-12 w-12" />}
            </motion.div>
            <div className="text-center">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-foreground"
              >
                {title}
              </motion.h2>
              {subtitle && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-muted-foreground mt-1"
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
              className="w-32 h-1 bg-primary/30 rounded-full origin-left"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Achievement Badge Popup
interface AchievementBadgeProps {
  show: boolean;
  title: string;
  icon?: React.ReactNode;
  color?: 'gold' | 'silver' | 'bronze' | 'emerald';
  onClose?: () => void;
}

const badgeColors = {
  gold: 'from-amber-400 to-amber-600',
  silver: 'from-slate-300 to-slate-500',
  bronze: 'from-orange-400 to-orange-600',
  emerald: 'from-emerald-400 to-emerald-600'
};

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  show,
  title,
  icon,
  color = 'gold',
  onClose
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-4 right-4 z-[9997] flex items-center gap-3 p-4 rounded-xl bg-card border shadow-xl cursor-pointer"
          onClick={onClose}
        >
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
              scale: { duration: 1, repeat: Infinity }
            }}
            className={`p-2 rounded-full bg-gradient-to-br ${badgeColors[color]} text-white shadow-lg`}
          >
            {icon || <Star className="h-5 w-5" />}
          </motion.div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Achievement Unlocked</p>
            <p className="font-semibold text-foreground">{title}</p>
          </div>
          <motion.div
            className="absolute inset-0 rounded-xl"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(251, 191, 36, 0)',
                '0 0 0 4px rgba(251, 191, 36, 0.3)',
                '0 0 0 0 rgba(251, 191, 36, 0)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Streak Indicator
interface StreakIndicatorProps {
  count: number;
  show: boolean;
}

export const StreakIndicator: React.FC<StreakIndicatorProps> = ({ count, show }) => {
  return (
    <AnimatePresence>
      {show && count >= 2 && (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: -20 }}
          transition={{ type: 'spring', damping: 12, stiffness: 400 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[9996] flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold shadow-lg"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, -10, 10, 0]
            }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          >
            <Flame className="h-5 w-5" />
          </motion.div>
          <span>{count}x Streak!</span>
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1, delay: 0.25 }}
          >
            <Zap className="h-5 w-5" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Card Success Glow Effect
interface CardSuccessGlowProps {
  trigger: boolean;
  children: React.ReactNode;
  className?: string;
}

export const CardSuccessGlow: React.FC<CardSuccessGlowProps> = ({
  trigger,
  children,
  className = ''
}) => {
  return (
    <motion.div
      className={`relative ${className}`}
      animate={trigger ? {
        boxShadow: [
          '0 0 0 0 rgba(34, 197, 94, 0)',
          '0 0 30px 10px rgba(34, 197, 94, 0.4)',
          '0 0 0 0 rgba(34, 197, 94, 0)'
        ]
      } : {}}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
};
