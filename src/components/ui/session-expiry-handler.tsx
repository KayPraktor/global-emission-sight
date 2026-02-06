import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SessionExpiryHandlerProps {
  children: React.ReactNode;
}

export const SessionExpiryHandler: React.FC<SessionExpiryHandlerProps> = ({ children }) => {
  const navigate = useNavigate();
  const hasShownExpiry = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle token refresh failure or sign out
      if (event === 'TOKEN_REFRESHED' && !session) {
        // Token refresh failed - session expired
        if (!hasShownExpiry.current) {
          hasShownExpiry.current = true;
          toast.error('Your session has expired', {
            description: 'Please sign in again to continue.',
            duration: 5000,
          });
          navigate('/auth', { replace: true });
        }
      }

      if (event === 'SIGNED_OUT') {
        hasShownExpiry.current = false;
      }
    });

    // Check session validity periodically
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        if (window.location.pathname !== '/auth' && window.location.pathname !== '/landing') {
          if (!hasShownExpiry.current) {
            hasShownExpiry.current = true;
            toast.error('Session expired', {
              description: 'Please sign in again.',
            });
            navigate('/auth', { replace: true });
          }
        }
      }
    };

    // Check every 5 minutes
    const intervalId = setInterval(checkSession, 5 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(intervalId);
    };
  }, [navigate]);

  return <>{children}</>;
};
