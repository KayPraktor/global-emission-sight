import { useEffect, useCallback, useState } from 'react';
import { useBlocker } from 'react-router-dom';

interface UseUnsavedChangesOptions {
  isDirty: boolean;
  message?: string;
}

export const useUnsavedChanges = ({ 
  isDirty, 
  message = 'You have unsaved changes. Are you sure you want to leave?' 
}: UseUnsavedChangesOptions) => {
  const [showDialog, setShowDialog] = useState(false);

  // Block navigation when there are unsaved changes
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  // Handle browser beforeunload event (refresh, close tab)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, message]);

  // Show dialog when blocker is active
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowDialog(true);
    }
  }, [blocker.state]);

  const confirmNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
    setShowDialog(false);
  }, [blocker]);

  const cancelNavigation = useCallback(() => {
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
    setShowDialog(false);
  }, [blocker]);

  return {
    showDialog,
    confirmNavigation,
    cancelNavigation,
    message
  };
};
