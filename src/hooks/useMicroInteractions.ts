
import { useState, useCallback } from 'react';

// Hook for managing button loading states
export function useButtonLoading() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const setLoading = useCallback((id: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [id]: loading
    }));
  }, []);

  const isLoading = useCallback((id: string) => {
    return loadingStates[id] || false;
  }, [loadingStates]);

  return { setLoading, isLoading };
}

// Hook for managing hover states
export function useHoverState() {
  const [hoveredItems, setHoveredItems] = useState<Set<string>>(new Set());

  const setHovered = useCallback((id: string, hovered: boolean) => {
    setHoveredItems(prev => {
      const newSet = new Set(prev);
      if (hovered) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

  const isHovered = useCallback((id: string) => {
    return hoveredItems.has(id);
  }, [hoveredItems]);

  return { setHovered, isHovered };
}

// Hook for managing focus states
export function useFocusState() {
  const [focusedItems, setFocusedItems] = useState<Set<string>>(new Set());

  const setFocused = useCallback((id: string, focused: boolean) => {
    setFocusedItems(prev => {
      const newSet = new Set(prev);
      if (focused) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  }, []);

  const isFocused = useCallback((id: string) => {
    return focusedItems.has(id);
  }, [focusedItems]);

  return { setFocused, isFocused };
}

// Hook for managing toast notifications with animations
export function useAnimatedToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }>>([]);

  const addToast = useCallback((
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration = 3000
  ) => {
    const id = Date.now().toString();
    const newToast = { id, message, type, duration };
    
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

// Hook for managing onboarding state
export function useOnboarding() {
  const [isActive, setIsActive] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const startOnboarding = useCallback(() => {
    setIsActive(true);
  }, []);

  const completeOnboarding = useCallback(() => {
    setIsActive(false);
    localStorage.setItem('onboarding_completed', 'true');
  }, []);

  const skipOnboarding = useCallback(() => {
    setIsActive(false);
    localStorage.setItem('onboarding_skipped', 'true');
  }, []);

  const markStepCompleted = useCallback((stepId: string) => {
    setCompletedSteps(prev => new Set(prev).add(stepId));
  }, []);

  const isStepCompleted = useCallback((stepId: string) => {
    return completedSteps.has(stepId);
  }, [completedSteps]);

  return {
    isActive,
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    markStepCompleted,
    isStepCompleted
  };
}
