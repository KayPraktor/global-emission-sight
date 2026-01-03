import { useState, useCallback, useRef } from 'react';

interface CelebrationState {
  confetti: boolean;
  confettiOrigin: { x: number; y: number };
  successPulse: boolean;
  milestone: { show: boolean; title: string; subtitle: string } | null;
  achievement: { show: boolean; title: string; color: 'gold' | 'silver' | 'bronze' | 'emerald' } | null;
  streak: number;
  showStreak: boolean;
}

interface CelebrationOptions {
  intensity?: 'low' | 'medium' | 'high';
  originX?: number;
  originY?: number;
}

export function useCelebration() {
  const [state, setState] = useState<CelebrationState>({
    confetti: false,
    confettiOrigin: { x: 50, y: 50 },
    successPulse: false,
    milestone: null,
    achievement: null,
    streak: 0,
    showStreak: false
  });

  const streakTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActionTimeRef = useRef<number>(0);

  const triggerConfetti = useCallback((options: CelebrationOptions = {}) => {
    const { originX = 50, originY = 50 } = options;
    setState(prev => ({
      ...prev,
      confetti: true,
      confettiOrigin: { x: originX, y: originY }
    }));
    
    setTimeout(() => {
      setState(prev => ({ ...prev, confetti: false }));
    }, 100);
  }, []);

  const triggerSuccessPulse = useCallback(() => {
    setState(prev => ({ ...prev, successPulse: true }));
    setTimeout(() => {
      setState(prev => ({ ...prev, successPulse: false }));
    }, 100);
  }, []);

  const showMilestone = useCallback((title: string, subtitle: string = '') => {
    setState(prev => ({
      ...prev,
      milestone: { show: true, title, subtitle }
    }));
  }, []);

  const hideMilestone = useCallback(() => {
    setState(prev => ({
      ...prev,
      milestone: null
    }));
  }, []);

  const showAchievement = useCallback((
    title: string, 
    color: 'gold' | 'silver' | 'bronze' | 'emerald' = 'gold'
  ) => {
    setState(prev => ({
      ...prev,
      achievement: { show: true, title, color }
    }));
  }, []);

  const hideAchievement = useCallback(() => {
    setState(prev => ({
      ...prev,
      achievement: null
    }));
  }, []);

  const incrementStreak = useCallback(() => {
    const now = Date.now();
    const timeSinceLastAction = now - lastActionTimeRef.current;
    
    // Reset streak if more than 30 seconds since last action
    if (timeSinceLastAction > 30000) {
      setState(prev => ({ ...prev, streak: 1, showStreak: false }));
    } else {
      setState(prev => {
        const newStreak = prev.streak + 1;
        return {
          ...prev,
          streak: newStreak,
          showStreak: newStreak >= 2
        };
      });
    }
    
    lastActionTimeRef.current = now;

    // Clear previous timeout
    if (streakTimeoutRef.current) {
      clearTimeout(streakTimeoutRef.current);
    }

    // Hide streak indicator after 3 seconds
    streakTimeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, showStreak: false }));
    }, 3000);
  }, []);

  const resetStreak = useCallback(() => {
    setState(prev => ({ ...prev, streak: 0, showStreak: false }));
    lastActionTimeRef.current = 0;
  }, []);

  // Combined celebration for completing actions
  const celebrateCompletion = useCallback((options: {
    type: 'quick-win' | 'goal' | 'milestone';
    title?: string;
    subtitle?: string;
    isFirstTime?: boolean;
  }) => {
    const { type, title, subtitle, isFirstTime } = options;

    // Always trigger confetti and success pulse
    triggerConfetti();
    triggerSuccessPulse();
    incrementStreak();

    // Show milestone overlay for important completions
    if (type === 'milestone' || type === 'goal') {
      showMilestone(
        title || 'Achievement Unlocked!',
        subtitle || ''
      );
    }

    // Show achievement badge for first-time actions
    if (isFirstTime) {
      setTimeout(() => {
        showAchievement(
          title || 'First Completion!',
          type === 'goal' ? 'gold' : 'emerald'
        );
      }, type === 'milestone' ? 3500 : 500);
    }
  }, [triggerConfetti, triggerSuccessPulse, incrementStreak, showMilestone, showAchievement]);

  return {
    // State
    confetti: state.confetti,
    confettiOrigin: state.confettiOrigin,
    successPulse: state.successPulse,
    milestone: state.milestone,
    achievement: state.achievement,
    streak: state.streak,
    showStreak: state.showStreak,
    
    // Actions
    triggerConfetti,
    triggerSuccessPulse,
    showMilestone,
    hideMilestone,
    showAchievement,
    hideAchievement,
    incrementStreak,
    resetStreak,
    celebrateCompletion
  };
}
