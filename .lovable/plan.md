

# Data Tracking Strategy for BARYON Carbon Management Platform

## Executive Summary

This strategy recommends tracking **45+ key events** across 7 critical user journeys to provide actionable insights into user behavior, retention, and feature adoption. The approach leverages your existing `onboarding_analytics` infrastructure and extends it to cover the full user lifecycle.

---

## Recommended Analytics Architecture

### Option 1: Extend Current Supabase Tables (Recommended)
Build on existing `onboarding_analytics` pattern with new tables:
- `user_events` - General event tracking
- `feature_usage` - Feature-level aggregations
- `session_analytics` - Session-level metrics

### Option 2: Third-Party Integration
Integrate with Mixpanel, Amplitude, or PostHog via a thin wrapper service.

### Implementation Approach
Create a centralized `src/services/analyticsTrackingService.ts` that:
1. Batches events to reduce database writes
2. Respects user privacy preferences
3. Provides consistent event naming conventions
4. Auto-captures page views and session data

---

## Critical User Journeys to Track

### Journey 1: Acquisition & Onboarding Funnel
**Goal**: Identify where users drop off and optimize Time-to-Value

| Event Name | Trigger Location | Data to Capture |
|------------|------------------|-----------------|
| `landing_page_view` | `LandingPage.tsx` | referrer, utm_params, device_type |
| `cta_clicked` | `LandingPage.tsx` | cta_type (signup, demo, pricing) |
| `auth_started` | `AuthPage.tsx` | auth_type (signup, signin, google) |
| `auth_completed` | `AuthContext.tsx` | method, time_to_complete |
| `auth_failed` | `AuthContext.tsx` | error_type, attempt_count |
| `onboarding_step_viewed` | `OnboardingWizard.tsx` | step_number, step_name |
| `onboarding_step_completed` | `OnboardingWizard.tsx` | step_number, time_on_step |
| `onboarding_quick_start_selected` | `OnboardingWizard.tsx` | option (sample, import, manual) |
| `onboarding_skipped` | `OnboardingWizard.tsx` | step_at_skip, time_spent_total |
| `onboarding_completed` | `OnboardingWizard.tsx` | total_time, path_taken |

**Implementation Location**: Already partially exists in `OnboardingWizard.tsx` (lines 85-123). Extend with step-level granularity.

---

### Journey 2: First Value Moment (Data Entry)
**Goal**: Track time from signup to first meaningful data entry

| Event Name | Trigger Location | Data to Capture |
|------------|------------------|-----------------|
| `data_entry_started` | `DataEntryPage.tsx` | entry_method (wizard, csv) |
| `wizard_step_completed` | `IndustryAwareWizard.tsx` | step_number, step_name, time_on_step |
| `wizard_step_abandoned` | `IndustryAwareWizard.tsx` | step_number, field_with_focus |
| `csv_import_opened` | `EmissionsCSVImportDialog.tsx` | source (onboarding, button) |
| `csv_import_completed` | `EmissionsCSVImportDialog.tsx` | rows_imported, errors_count |
| `csv_import_failed` | `EmissionsCSVImportDialog.tsx` | error_type, file_size |
| `emission_entry_created` | `EmissionsService.saveEmissionsData()` | scope, category, facility_id |
| `first_emission_entry` | `EmissionsService.saveEmissionsData()` | days_since_signup, entry_method |

**Implementation Location**: `src/services/emissionsService.ts` (line 10), `src/components/EmissionsForm/IndustryAwareWizard.tsx`

---

### Journey 3: Goal Setting & Progress
**Goal**: Measure goal adoption and track user engagement with targets

| Event Name | Trigger Location | Data to Capture |
|------------|------------------|-----------------|
| `goals_page_viewed` | `GoalsPage.tsx` | tab_selected |
| `goal_creation_started` | `EnhancedGoalForm.tsx` | entry_point (dialog, page) |
| `goal_form_tab_switched` | `EnhancedGoalForm.tsx` | from_tab, to_tab |
| `goal_created` | `EnhancedGoalForm.tsx` (line 175) | scope, category, priority, target_year |
| `goal_creation_failed` | `EnhancedGoalForm.tsx` | validation_errors |
| `goal_viewed` | `ProfessionalGoalsList.tsx` | goal_id, goal_status |
| `goal_milestone_reached` | Backend trigger | goal_id, milestone_percent |

**Implementation Location**: `src/components/Goals/EnhancedGoalForm.tsx` (handleSubmit at line 156)

---

### Journey 4: Reporting & Export
**Goal**: Understand which reports are most valuable and export formats preferred

| Event Name | Trigger Location | Data to Capture |
|------------|------------------|-----------------|
| `reports_page_viewed` | `ReportsPage.tsx` | tab_selected |
| `report_generation_started` | `ComprehensiveReportGenerator.tsx` | report_type (quarterly, annual) |
| `report_generated` | `comprehensiveReportService.ts` | report_type, year, quarter, generation_time_ms |
| `report_export_clicked` | `EmissionsReport.tsx` | format (csv, excel, pdf) |
| `report_exported` | `reportsService.ts` | format, rows_count, file_size |
| `template_downloaded` | `templateService.ts` (line 220) | template_id, framework |

**Implementation Location**: `src/components/Reports/EmissionsReport.tsx` (lines 73-125), `src/services/reportsService.ts`

---

### Journey 5: Facility Management
**Goal**: Track multi-facility adoption and organizational complexity

| Event Name | Trigger Location | Data to Capture |
|------------|------------------|-----------------|
| `facilities_page_viewed` | `FacilitiesPage.tsx` | view_mode (grid, map) |
| `facility_created` | `FacilitiesPage.tsx` (line 125) | facility_type, country_code |
| `facility_edited` | `FacilitiesPage.tsx` | fields_changed |
| `facility_deleted` | `FacilitiesPage.tsx` | emissions_count |
| `facility_csv_imported` | `CSVImportDialog.tsx` | facilities_count |
| `facility_emissions_viewed` | `FacilitiesPage.tsx` | facility_id, emissions_count |
| `organization_created` | `FacilitiesPage.tsx` (line 67) | creation_context |

**Implementation Location**: `src/pages/FacilitiesPage.tsx`, `src/services/facilityService.ts`

---

### Journey 6: Feature Adoption & Depth
**Goal**: Identify power users and underutilized features

| Event Name | Trigger Location | Data to Capture |
|------------|------------------|-----------------|
| `page_viewed` | `DashboardLayout.tsx` | path, time_on_previous_page |
| `sidebar_navigation` | `AppSidebar.tsx` | from_path, to_path, section |
| `dashboard_widget_toggled` | `Index.tsx` | widget_id, visible |
| `dashboard_view_saved` | `useDashboardLayout.ts` | view_name, widgets_count |
| `scenario_created` | `ScenarioBuilder.tsx` | intervention_count |
| `scope3_analysis_run` | `Scope3Dashboard.tsx` | categories_analyzed |
| `supplier_added` | `SupplierOnboarding.tsx` | supplier_tier |
| `compliance_framework_viewed` | `CompliancePage.tsx` | framework (CSRD, ISSB) |
| `materiality_assessment_started` | `MaterialityPage.tsx` | assessment_type |
| `audit_logs_exported` | `AuditLogViewer.tsx` | date_range, filters |

**Implementation Location**: Various pages and components as specified

---

### Journey 7: Retention & Re-engagement Signals
**Goal**: Predict churn and identify engagement patterns

| Event Name | Trigger Location | Data to Capture |
|------------|------------------|-----------------|
| `session_started` | `AuthContext.tsx` | days_since_last_session |
| `session_ended` | `beforeunload` handler | duration, pages_viewed, actions_taken |
| `settings_changed` | `SettingsPage.tsx` | setting_category |
| `feedback_submitted` | `OnboardingWizard.tsx` | rating, context |
| `help_accessed` | `AppSidebar.tsx` | from_page |
| `error_encountered` | `ErrorBoundary.tsx` | error_type, page |
| `approval_submitted` | `ApprovalActions.tsx` | entry_type |
| `approval_actioned` | `ApprovalActions.tsx` | action (approve, reject) |

---

## Database Schema for Event Tracking

```sql
-- Core events table
CREATE TABLE public.user_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(50), -- 'onboarding', 'data_entry', 'reporting', etc.
  event_properties JSONB DEFAULT '{}',
  page_path VARCHAR(255),
  session_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_events_user_date ON user_events(user_id, created_at DESC);
CREATE INDEX idx_events_name ON user_events(event_name);
CREATE INDEX idx_events_category ON user_events(event_category);
CREATE INDEX idx_events_org ON user_events(organization_id, created_at DESC);

-- Feature usage aggregates (updated daily by edge function)
CREATE TABLE public.feature_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  feature_name VARCHAR(100) NOT NULL,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  first_used_at TIMESTAMPTZ,
  period_start DATE NOT NULL,
  UNIQUE(user_id, feature_name, period_start)
);
```

---

## Analytics Service Implementation

Create `src/services/analyticsTrackingService.ts`:

```typescript
interface TrackingEvent {
  name: string;
  category: 'onboarding' | 'data_entry' | 'reporting' | 'goals' | 'facilities' | 'navigation' | 'system';
  properties?: Record<string, unknown>;
}

class AnalyticsTrackingService {
  private eventQueue: TrackingEvent[] = [];
  private sessionId: string;
  private flushInterval: number = 5000; // 5 seconds
  
  constructor() {
    this.sessionId = crypto.randomUUID();
    this.startFlushInterval();
    this.setupPageViewTracking();
    this.setupSessionTracking();
  }

  track(event: TrackingEvent): void {
    this.eventQueue.push({
      ...event,
      properties: {
        ...event.properties,
        timestamp: new Date().toISOString(),
        path: window.location.pathname,
        sessionId: this.sessionId,
      }
    });
    
    // Immediate flush for critical events
    if (this.isCriticalEvent(event.name)) {
      this.flush();
    }
  }

  private isCriticalEvent(name: string): boolean {
    return ['auth_completed', 'first_emission_entry', 'goal_created', 'report_exported'].includes(name);
  }

  private async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;
    
    const events = [...this.eventQueue];
    this.eventQueue = [];
    
    await supabase.from('user_events').insert(
      events.map(e => ({
        event_name: e.name,
        event_category: e.category,
        event_properties: e.properties,
        page_path: window.location.pathname,
        session_id: this.sessionId,
      }))
    );
  }
}

export const analytics = new AnalyticsTrackingService();
```

---

## Key Metrics to Derive

### Activation Metrics
- **Time to First Entry**: Days from signup to first `emission_entry_created`
- **Onboarding Completion Rate**: Users reaching `onboarding_completed` / signups
- **Quick Start Preference**: Distribution of `sample` vs `import` vs `manual`

### Engagement Metrics
- **Weekly Active Users (WAU)**: Unique users with `session_started` in 7 days
- **Feature Depth Score**: Count of unique `event_category` per user
- **Report Generation Frequency**: `report_generated` events per user/month

### Retention Indicators
- **Day 1/7/30 Retention**: Users returning after N days
- **Churn Signals**: 14+ days without `session_started`
- **Power User Identification**: Users with 3+ `event_category` engagement

### Conversion Funnels
1. **Signup Funnel**: `landing_page_view` → `auth_started` → `auth_completed`
2. **Activation Funnel**: `auth_completed` → `onboarding_completed` → `first_emission_entry`
3. **Reporting Funnel**: `reports_page_viewed` → `report_generation_started` → `report_exported`

---

## Implementation Hooks by File

| File | Events to Add | Priority |
|------|---------------|----------|
| `src/contexts/AuthContext.tsx` | `auth_completed`, `auth_failed`, `session_started` | Critical |
| `src/components/onboarding/OnboardingWizard.tsx` | Extend existing tracking | Critical |
| `src/services/emissionsService.ts` | `emission_entry_created`, `first_emission_entry` | Critical |
| `src/components/Goals/EnhancedGoalForm.tsx` | `goal_created`, `goal_creation_failed` | High |
| `src/pages/FacilitiesPage.tsx` | `facility_created`, `facility_deleted` | High |
| `src/components/Reports/EmissionsReport.tsx` | `report_exported` | High |
| `src/components/layouts/DashboardLayout.tsx` | `page_viewed` | High |
| `src/components/navigation/AppSidebar.tsx` | `sidebar_navigation` | Medium |
| `src/pages/Index.tsx` | `dashboard_widget_toggled` | Medium |
| `src/components/ErrorBoundary.tsx` | `error_encountered` | Medium |

---

## Privacy & Compliance Considerations

1. **User Consent**: Add opt-out toggle in Settings (store in `profiles.analytics_consent`)
2. **Data Retention**: Auto-purge events older than 12 months
3. **PII Exclusion**: Never log email, names, or sensitive business data in properties
4. **GDPR Compliance**: Include events in data export and deletion workflows

---

## Next Steps

1. **Create database tables** - Run migration for `user_events` and `feature_usage`
2. **Build tracking service** - Implement `analyticsTrackingService.ts`
3. **Add critical event hooks** - Start with auth and onboarding (highest impact)
4. **Create dashboard** - Build admin view to visualize funnel metrics
5. **Set up alerts** - Notify on drop-off rate spikes or churn signals

