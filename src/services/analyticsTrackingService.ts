import { supabase } from '@/integrations/supabase/client';

export type EventCategory = 
  | 'onboarding'
  | 'data_entry'
  | 'reporting'
  | 'goals'
  | 'facilities'
  | 'navigation'
  | 'system'
  | 'auth'
  | 'compliance'
  | 'scenarios';

export interface TrackingEvent {
  name: string;
  category: EventCategory;
  properties?: Record<string, unknown>;
}

interface QueuedEvent extends TrackingEvent {
  timestamp: string;
  path: string;
  sessionId: string;
}

class AnalyticsTrackingService {
  private eventQueue: QueuedEvent[] = [];
  private sessionId: string;
  private flushIntervalId: ReturnType<typeof setInterval> | null = null;
  private readonly FLUSH_INTERVAL = 5000; // 5 seconds
  private readonly MAX_QUEUE_SIZE = 50;
  private isInitialized = false;
  private userId: string | null = null;
  private organizationId: string | null = null;
  private sessionStartTime: number;
  private pageViewCount = 0;
  private lastPagePath: string = '';

  constructor() {
    this.sessionId = crypto.randomUUID();
    this.sessionStartTime = Date.now();
  }

  /**
   * Initialize the tracking service - call after auth is ready
   */
  initialize(userId: string | null, organizationId: string | null): void {
    this.userId = userId;
    this.organizationId = organizationId;
    
    if (!this.isInitialized && typeof window !== 'undefined') {
      this.startFlushInterval();
      this.setupUnloadHandler();
      this.isInitialized = true;
    }
  }

  /**
   * Update user context (call on auth changes)
   */
  setUserContext(userId: string | null, organizationId: string | null): void {
    this.userId = userId;
    this.organizationId = organizationId;
  }

  /**
   * Track an event
   */
  track(event: TrackingEvent): void {
    if (!this.userId) {
      // Queue events even without user - they'll be lost but won't throw
      console.debug('[Analytics] Event tracked without user:', event.name);
      return;
    }

    const queuedEvent: QueuedEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      path: typeof window !== 'undefined' ? window.location.pathname : '',
      sessionId: this.sessionId,
    };

    this.eventQueue.push(queuedEvent);

    // Immediate flush for critical events
    if (this.isCriticalEvent(event.name)) {
      this.flush();
    } else if (this.eventQueue.length >= this.MAX_QUEUE_SIZE) {
      this.flush();
    }
  }

  /**
   * Track page view with automatic time-on-page calculation
   */
  trackPageView(path: string): void {
    const previousPath = this.lastPagePath;
    this.lastPagePath = path;
    this.pageViewCount++;

    this.track({
      name: 'page_viewed',
      category: 'navigation',
      properties: {
        path,
        previous_path: previousPath || null,
        page_view_number: this.pageViewCount,
      },
    });
  }

  /**
   * Track feature usage (aggregated)
   */
  async trackFeatureUsage(featureName: string): Promise<void> {
    if (!this.userId) return;

    const today = new Date().toISOString().split('T')[0];

    try {
      // Upsert feature usage
      const { error } = await supabase
        .from('feature_usage')
        .upsert(
          {
            user_id: this.userId,
            organization_id: this.organizationId,
            feature_name: featureName,
            usage_count: 1,
            last_used_at: new Date().toISOString(),
            period_start: today,
          },
          {
            onConflict: 'user_id,feature_name,period_start',
          }
        );

      if (error) {
        console.error('[Analytics] Failed to track feature usage:', error);
      }
    } catch (err) {
      console.error('[Analytics] Feature usage tracking error:', err);
    }
  }

  /**
   * Get session duration in seconds
   */
  getSessionDuration(): number {
    return Math.floor((Date.now() - this.sessionStartTime) / 1000);
  }

  /**
   * Get session statistics
   */
  getSessionStats(): { duration: number; pageViews: number; eventsCount: number } {
    return {
      duration: this.getSessionDuration(),
      pageViews: this.pageViewCount,
      eventsCount: this.eventQueue.length,
    };
  }

  private isCriticalEvent(name: string): boolean {
    const criticalEvents = [
      'auth_completed',
      'auth_failed',
      'first_emission_entry',
      'emission_entry_created',
      'goal_created',
      'report_exported',
      'onboarding_completed',
      'error_encountered',
    ];
    return criticalEvents.includes(name);
  }

  private startFlushInterval(): void {
    if (this.flushIntervalId) return;
    
    this.flushIntervalId = setInterval(() => {
      this.flush();
    }, this.FLUSH_INTERVAL);
  }

  private setupUnloadHandler(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeunload', () => {
      // Track session end
      this.track({
        name: 'session_ended',
        category: 'system',
        properties: {
          duration_seconds: this.getSessionDuration(),
          pages_viewed: this.pageViewCount,
        },
      });
      
      // Sync flush on unload
      this.flushSync();
    });
  }

  private async flush(): Promise<void> {
    if (this.eventQueue.length === 0 || !this.userId) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const { error } = await supabase.from('user_events').insert(
        events.map((e) => ({
          user_id: this.userId,
          organization_id: this.organizationId,
          event_name: e.name,
          event_category: e.category,
          event_properties: {
            ...e.properties,
            timestamp: e.timestamp,
          },
          page_path: e.path,
          session_id: this.sessionId,
        }))
      );

      if (error) {
        console.error('[Analytics] Failed to flush events:', error);
        // Re-queue failed events (limit to prevent memory issues)
        if (this.eventQueue.length < this.MAX_QUEUE_SIZE) {
          this.eventQueue.unshift(...events.slice(0, this.MAX_QUEUE_SIZE - this.eventQueue.length));
        }
      }
    } catch (err) {
      console.error('[Analytics] Flush error:', err);
    }
  }

  private flushSync(): void {
    if (this.eventQueue.length === 0 || !this.userId) return;

    const events = this.eventQueue;
    this.eventQueue = [];

    // Use sendBeacon for reliable delivery on page unload
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const payload = JSON.stringify({
        events: events.map((e) => ({
          user_id: this.userId,
          organization_id: this.organizationId,
          event_name: e.name,
          event_category: e.category,
          event_properties: {
            ...e.properties,
            timestamp: e.timestamp,
          },
          page_path: e.path,
          session_id: this.sessionId,
        })),
      });

      // Note: This would require an edge function endpoint to process
      // For now, we'll just log - can be enhanced later
      console.debug('[Analytics] Session ended, events pending:', events.length);
    }
  }

  /**
   * Cleanup on unmount
   */
  destroy(): void {
    if (this.flushIntervalId) {
      clearInterval(this.flushIntervalId);
      this.flushIntervalId = null;
    }
    this.flush();
  }
}

// Singleton instance
export const analytics = new AnalyticsTrackingService();

// Convenience functions for common events
export const trackAuth = {
  started: (method: 'signup' | 'signin' | 'google') => 
    analytics.track({ name: 'auth_started', category: 'auth', properties: { method } }),
  
  completed: (method: 'signup' | 'signin' | 'google', timeToComplete?: number) =>
    analytics.track({ name: 'auth_completed', category: 'auth', properties: { method, time_to_complete: timeToComplete } }),
  
  failed: (method: string, errorType: string) =>
    analytics.track({ name: 'auth_failed', category: 'auth', properties: { method, error_type: errorType } }),
  
  sessionStarted: (daysSinceLastSession?: number) =>
    analytics.track({ name: 'session_started', category: 'auth', properties: { days_since_last_session: daysSinceLastSession } }),
};

export const trackOnboarding = {
  stepViewed: (stepNumber: number, stepName: string) =>
    analytics.track({ name: 'onboarding_step_viewed', category: 'onboarding', properties: { step_number: stepNumber, step_name: stepName } }),
  
  stepCompleted: (stepNumber: number, timeOnStep: number) =>
    analytics.track({ name: 'onboarding_step_completed', category: 'onboarding', properties: { step_number: stepNumber, time_on_step: timeOnStep } }),
  
  quickStartSelected: (option: 'sample' | 'import' | 'manual') =>
    analytics.track({ name: 'onboarding_quick_start_selected', category: 'onboarding', properties: { option } }),
  
  skipped: (stepAtSkip: number, timeSpentTotal: number) =>
    analytics.track({ name: 'onboarding_skipped', category: 'onboarding', properties: { step_at_skip: stepAtSkip, time_spent_total: timeSpentTotal } }),
  
  completed: (totalTime: number, pathTaken: string) =>
    analytics.track({ name: 'onboarding_completed', category: 'onboarding', properties: { total_time: totalTime, path_taken: pathTaken } }),
};

export const trackDataEntry = {
  started: (entryMethod: 'wizard' | 'csv') =>
    analytics.track({ name: 'data_entry_started', category: 'data_entry', properties: { entry_method: entryMethod } }),
  
  wizardStepCompleted: (stepNumber: number, stepName: string, timeOnStep: number) =>
    analytics.track({ name: 'wizard_step_completed', category: 'data_entry', properties: { step_number: stepNumber, step_name: stepName, time_on_step: timeOnStep } }),
  
  csvImportOpened: (source: 'onboarding' | 'button') =>
    analytics.track({ name: 'csv_import_opened', category: 'data_entry', properties: { source } }),
  
  csvImportCompleted: (rowsImported: number, errorsCount: number) =>
    analytics.track({ name: 'csv_import_completed', category: 'data_entry', properties: { rows_imported: rowsImported, errors_count: errorsCount } }),
  
  csvImportFailed: (errorType: string, fileSize?: number) =>
    analytics.track({ name: 'csv_import_failed', category: 'data_entry', properties: { error_type: errorType, file_size: fileSize } }),
  
  emissionEntryCreated: (scope: string, category: string, facilityId?: string) =>
    analytics.track({ name: 'emission_entry_created', category: 'data_entry', properties: { scope, category, facility_id: facilityId } }),
  
  firstEmissionEntry: (daysSinceSignup: number, entryMethod: string) =>
    analytics.track({ name: 'first_emission_entry', category: 'data_entry', properties: { days_since_signup: daysSinceSignup, entry_method: entryMethod } }),
};

export const trackGoals = {
  pageViewed: (tabSelected?: string) =>
    analytics.track({ name: 'goals_page_viewed', category: 'goals', properties: { tab_selected: tabSelected } }),
  
  creationStarted: (entryPoint: 'dialog' | 'page') =>
    analytics.track({ name: 'goal_creation_started', category: 'goals', properties: { entry_point: entryPoint } }),
  
  created: (scope: string, category: string, priority: string, targetYear: number) =>
    analytics.track({ name: 'goal_created', category: 'goals', properties: { scope, category, priority, target_year: targetYear } }),
  
  creationFailed: (validationErrors: string[]) =>
    analytics.track({ name: 'goal_creation_failed', category: 'goals', properties: { validation_errors: validationErrors } }),
};

export const trackReports = {
  pageViewed: (tabSelected?: string) =>
    analytics.track({ name: 'reports_page_viewed', category: 'reporting', properties: { tab_selected: tabSelected } }),
  
  generationStarted: (reportType: string) =>
    analytics.track({ name: 'report_generation_started', category: 'reporting', properties: { report_type: reportType } }),
  
  generated: (reportType: string, year: number, generationTimeMs: number) =>
    analytics.track({ name: 'report_generated', category: 'reporting', properties: { report_type: reportType, year, generation_time_ms: generationTimeMs } }),
  
  exportClicked: (format: 'csv' | 'excel' | 'pdf') =>
    analytics.track({ name: 'report_export_clicked', category: 'reporting', properties: { format } }),
  
  exported: (format: string, rowsCount: number) =>
    analytics.track({ name: 'report_exported', category: 'reporting', properties: { format, rows_count: rowsCount } }),
};

export const trackFacilities = {
  pageViewed: (viewMode: 'grid' | 'map') =>
    analytics.track({ name: 'facilities_page_viewed', category: 'facilities', properties: { view_mode: viewMode } }),
  
  created: (facilityType: string, countryCode?: string) =>
    analytics.track({ name: 'facility_created', category: 'facilities', properties: { facility_type: facilityType, country_code: countryCode } }),
  
  deleted: (emissionsCount: number) =>
    analytics.track({ name: 'facility_deleted', category: 'facilities', properties: { emissions_count: emissionsCount } }),
  
  csvImported: (facilitiesCount: number) =>
    analytics.track({ name: 'facility_csv_imported', category: 'facilities', properties: { facilities_count: facilitiesCount } }),
};

export const trackSystem = {
  errorEncountered: (errorType: string, page: string, errorMessage?: string) =>
    analytics.track({ name: 'error_encountered', category: 'system', properties: { error_type: errorType, page, error_message: errorMessage } }),
  
  feedbackSubmitted: (rating: number, context?: string) =>
    analytics.track({ name: 'feedback_submitted', category: 'system', properties: { rating, context } }),
};
