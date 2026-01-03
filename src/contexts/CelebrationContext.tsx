import React, { createContext, useContext, ReactNode } from 'react';
import { useCelebration } from '@/hooks/useCelebration';
import {
  ConfettiExplosion,
  CelebrationOverlay,
  AchievementBadge,
  StreakIndicator
} from '@/components/ui/celebration-effects';

type CelebrationContextType = ReturnType<typeof useCelebration>;

const CelebrationContext = createContext<CelebrationContextType | null>(null);

interface CelebrationProviderProps {
  children: ReactNode;
}

export const CelebrationProvider: React.FC<CelebrationProviderProps> = ({ children }) => {
  const celebration = useCelebration();

  return (
    <CelebrationContext.Provider value={celebration}>
      {children}
      
      {/* Global Celebration Effects */}
      <ConfettiExplosion
        trigger={celebration.confetti}
        originX={celebration.confettiOrigin.x}
        originY={celebration.confettiOrigin.y}
        particleCount={60}
        duration={3000}
      />
      
      {celebration.milestone && (
        <CelebrationOverlay
          show={celebration.milestone.show}
          title={celebration.milestone.title}
          subtitle={celebration.milestone.subtitle}
          onClose={celebration.hideMilestone}
        />
      )}
      
      {celebration.achievement && (
        <AchievementBadge
          show={celebration.achievement.show}
          title={celebration.achievement.title}
          color={celebration.achievement.color}
          onClose={celebration.hideAchievement}
        />
      )}
      
      <StreakIndicator
        count={celebration.streak}
        show={celebration.showStreak}
      />
    </CelebrationContext.Provider>
  );
};

export const useCelebrationContext = () => {
  const context = useContext(CelebrationContext);
  if (!context) {
    throw new Error('useCelebrationContext must be used within a CelebrationProvider');
  }
  return context;
};
