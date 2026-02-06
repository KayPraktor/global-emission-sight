import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';

// Error classification for better user feedback
const classifyError = (error: unknown): { message: string; type: 'network' | 'auth' | 'server' | 'rate-limit' | 'unknown' } => {
  if (!navigator.onLine) {
    return { message: 'No internet connection. Please check your network.', type: 'network' };
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Auth errors
    if (message.includes('jwt') || message.includes('token') || message.includes('unauthorized') || message.includes('401')) {
      return { message: 'Your session has expired. Please sign in again.', type: 'auth' };
    }
    
    // Rate limiting
    if (message.includes('429') || message.includes('rate limit') || message.includes('too many requests')) {
      return { message: 'Too many requests. Please wait a moment and try again.', type: 'rate-limit' };
    }
    
    // Server errors
    if (message.includes('500') || message.includes('502') || message.includes('503') || message.includes('internal server')) {
      return { message: 'Server error. Our team has been notified.', type: 'server' };
    }
  }

  return { message: 'An unexpected error occurred. Please try again.', type: 'unknown' };
};

// Determine if error should trigger retry
const shouldRetry = (error: unknown, failureCount: number): boolean => {
  if (failureCount >= 3) return false;
  
  const { type } = classifyError(error);
  
  // Don't retry auth errors or rate limits
  if (type === 'auth' || type === 'rate-limit') return false;
  
  // Retry network and server errors
  return type === 'network' || type === 'server';
};

// Exponential backoff delay
const getRetryDelay = (attemptIndex: number): number => {
  return Math.min(1000 * Math.pow(2, attemptIndex), 30000);
};

export const createQueryClient = () => new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Only show toast for errors that aren't handled by the component
      if (query.meta?.showErrorToast !== false) {
        const { message } = classifyError(error);
        toast.error(message);
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.showErrorToast !== false) {
        const { message } = classifyError(error);
        toast.error(message);
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
      retry: (failureCount, error) => shouldRetry(error, failureCount),
      retryDelay: getRetryDelay,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: (failureCount, error) => shouldRetry(error, failureCount),
      retryDelay: getRetryDelay,
    },
  },
});

// Export a singleton instance
export const queryClient = createQueryClient();
