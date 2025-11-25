import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { Skeleton } from '@/components/ui/skeleton';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { showOnboarding, completeOnboarding } = useOnboarding();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  return (
    <>
      {showOnboarding && <OnboardingWizard onComplete={completeOnboarding} />}
      {children}
    </>
  );
};
