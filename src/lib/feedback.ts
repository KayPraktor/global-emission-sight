import { toast } from 'sonner';

/**
 * Standardized feedback utilities for consistent user messaging
 * across the application. All toast messages follow a unified
 * tone and provide actionable guidance.
 */

type ToastId = string | number;

interface FeedbackOptions {
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Success messages - Positive, brief confirmations
 * Format: "[Entity] [action] successfully"
 */
const success = (message: string, options?: FeedbackOptions): ToastId => {
  return toast.success(message, {
    description: options?.description,
    action: options?.action,
  });
};

/**
 * Error messages - Helpful, actionable guidance
 * Format: "Failed to [action]. [Suggestion]"
 */
const error = (
  action: string, 
  suggestion: string = 'Please try again or contact support.',
  options?: { action?: FeedbackOptions['action'] }
): ToastId => {
  return toast.error(`Failed to ${action}`, {
    description: suggestion,
    action: options?.action,
  });
};

/**
 * Loading messages - Progressive status updates
 * Format: "[Action]..."
 * Returns toast ID for dismissal/update
 */
const loading = (action: string): ToastId => {
  return toast.loading(`${action}...`, { id: action });
};

/**
 * Info messages - Neutral, informative updates
 * Use sparingly for status updates only
 */
const info = (message: string, options?: FeedbackOptions): ToastId => {
  return toast.info(message, {
    description: options?.description,
    action: options?.action,
  });
};

/**
 * Warning messages - Cautionary alerts
 * Format: "[Warning]. [Consequence]"
 */
const warning = (message: string, consequence?: string): ToastId => {
  return toast.warning(message, {
    description: consequence,
  });
};

/**
 * Dismiss a specific toast by ID
 */
const dismiss = (id: ToastId): void => {
  toast.dismiss(id);
};

/**
 * Update an existing loading toast to success
 */
const resolveLoading = (id: ToastId, message: string): void => {
  toast.success(message, { id });
};

/**
 * Update an existing loading toast to error
 */
const rejectLoading = (
  id: ToastId, 
  action: string, 
  suggestion: string = 'Please try again.'
): void => {
  toast.error(`Failed to ${action}`, { 
    id,
    description: suggestion,
  });
};

/**
 * Common CRUD operation feedback patterns
 */
const crud = {
  createSuccess: (entity: string) => 
    success(`${entity} created successfully`),
  
  updateSuccess: (entity: string) => 
    success(`${entity} updated successfully`),
  
  deleteSuccess: (entity: string) => 
    success(`${entity} deleted successfully`),
  
  createError: (entity: string, retryFn?: () => void) => 
    error(`create ${entity.toLowerCase()}`, 'Check your connection and try again.', {
      action: retryFn ? { label: 'Retry', onClick: retryFn } : undefined,
    }),
  
  updateError: (entity: string, retryFn?: () => void) => 
    error(`update ${entity.toLowerCase()}`, 'Check your connection and try again.', {
      action: retryFn ? { label: 'Retry', onClick: retryFn } : undefined,
    }),
  
  deleteError: (entity: string) => 
    error(`delete ${entity.toLowerCase()}`, 'Please try again.'),
  
  loadError: (entity: string, retryFn?: () => void) => 
    error(`load ${entity.toLowerCase()}`, 'Check your connection and refresh the page.', {
      action: retryFn ? { label: 'Retry', onClick: retryFn } : undefined,
    }),
};

export const feedback = {
  success,
  error,
  loading,
  info,
  warning,
  dismiss,
  resolveLoading,
  rejectLoading,
  crud,
};
