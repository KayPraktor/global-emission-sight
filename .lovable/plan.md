
# Comprehensive User Flow and Logical Consistency Fixes

This plan addresses all critical, high, and medium priority issues identified in the deep audit of the application's user flow and logical consistency.

---

## Summary of Changes

| Priority | Issue | Component |
|----------|-------|-----------|
| Critical | No Error Boundary | App.tsx |
| Critical | No Close/Skip in Onboarding | OnboardingWizard.tsx |
| High | GoalsDashboard shows hardcoded data | GoalsDashboard.tsx |
| High | EnhancedGoalForm lacks validation | EnhancedGoalForm.tsx |
| High | NotFound lacks dashboard navigation | NotFound.tsx |
| Medium | EmissionsWizard lacks global cancel | DataEntryPage.tsx |
| Medium | Approval service returns empty on error | approvalService.ts |

---

## File 1: Create Global Error Boundary

**New File:** `src/components/ErrorBoundary.tsx`

Creates a React Error Boundary component that:
- Catches all unhandled React errors
- Shows a user-friendly error page with recovery options
- Logs errors for debugging
- Provides "Return to Dashboard" and "Refresh Page" buttons
- Prevents the entire app from crashing on component errors

---

## File 2: Wrap App with Error Boundary

**File:** `src/App.tsx`

**Changes:**
- Import the new ErrorBoundary component
- Wrap the entire application in the ErrorBoundary
- This ensures any uncaught error shows a friendly recovery UI instead of a blank screen

---

## File 3: Add Close/Skip to Onboarding Wizard

**File:** `src/components/onboarding/OnboardingWizard.tsx`

**Changes:**
- Add an X (close) button in the top-right corner of the onboarding modal
- Add a "Skip for now" link/button at the bottom of each step
- Both options call `onComplete()` to close the wizard
- Track skipped onboarding in analytics for product insights
- This prevents users from being trapped in the onboarding flow

---

## File 4: Fix NotFound Page with Better Navigation

**File:** `src/pages/NotFound.tsx`

**Changes:**
- Import Button and useNavigate from react-router-dom
- Add a "Go to Dashboard" button that uses proper navigation
- Add a "Go Back" button to return to previous page
- Improve styling to match the rest of the application
- Make it work within the authenticated layout context

---

## File 5: Add Zod Validation to EnhancedGoalForm

**File:** `src/components/Goals/EnhancedGoalForm.tsx`

**Changes:**
- Add Zod schema for form validation with required fields:
  - title (required, min 3 chars)
  - category (required)
  - scope (required)
  - priority (required)
  - baselineValue (required, positive number)
  - baselineYear (required, valid year)
  - targetValue (required, positive number)
  - targetYear (required, valid year, must be after baseline year)
- Add validation state and error display
- Add double-click/submission protection with `isSubmitting` state
- Show inline error messages for each field
- Validate before submission and show toast for validation failures
- Connect to goalsService.createGoal() for actual database persistence

---

## File 6: Fix GoalsDashboard to Use Real Data

**File:** `src/components/Goals/GoalsDashboard.tsx`

**Changes:**
- Import goalsService and useQuery from @tanstack/react-query
- Replace hardcoded `performanceData` and summary cards with real data
- Fetch goals using `goalsService.getGoalsWithProgress()`
- Calculate summary metrics (total, on-track, at-risk, avg progress) from real goals
- Add loading skeleton states while data loads
- Add empty state when no goals exist with "Create Goal" CTA
- Keep the milestone celebration functionality intact
- Generate chart data from actual goal progress over time

---

## File 7: Add Global Cancel to Data Entry Page

**File:** `src/pages/DataEntryPage.tsx`

**Changes:**
- Add a confirmation dialog for canceling data entry
- Add "Cancel Entry" button next to "Import CSV" that:
  - Warns user about losing unsaved data
  - Clears localStorage draft on confirmation
  - Navigates back to dashboard
- This provides a clear exit path from the data entry flow

---

## File 8: Improve Approval Service Error Propagation

**File:** `src/services/approvalService.ts`

**Changes:**
- Change functions that return empty arrays on error to throw errors instead
- Add proper try/catch with error propagation
- This allows the UI to show appropriate error messages instead of silent empty states

The changes will modify:
- `getEntriesPendingReview()` - throw on error
- `getEntriesWithApprovalStatus()` - throw on error
- `getApprovalHistory()` - throw on error
- `getPendingApprovalCount()` - throw on error

---

## Technical Implementation Notes

### Error Boundary Pattern
```text
App.tsx
  └── ErrorBoundary
        └── QueryClientProvider
              └── ThemeProvider
                    └── AuthProvider
                          └── ... rest of app
```

### Form Validation Schema (Zod)
```text
goalSchema = z.object({
  title: z.string().min(3, "Title required"),
  category: z.string().min(1, "Category required"),
  scope: z.string().min(1, "Scope required"),
  priority: z.string().min(1, "Priority required"),
  baselineValue: z.number().positive(),
  baselineYear: z.number().min(1990).max(currentYear),
  targetValue: z.number().positive(),
  targetYear: z.number().min(currentYear)
})
```

### Real Data Integration for GoalsDashboard
```text
Summary Cards:
  - Total Goals: goals.length
  - On Track: goals.filter(g => g.isOnTrack).length
  - At Risk: goals.filter(g => !g.isOnTrack).length
  - Avg Progress: mean(goals.map(g => g.progressPercentage))
```

---

## Testing Checklist

After implementation, verify:

1. **Error Boundary**: Intentionally cause an error (e.g., render null.something) and verify the error page appears
2. **Onboarding Skip**: Start onboarding and verify X button and Skip link work
3. **NotFound**: Navigate to `/invalid-route` and verify navigation buttons work
4. **Goal Form**: Try submitting with empty required fields and verify validation errors
5. **GoalsDashboard**: Create real goals and verify they appear in the dashboard
6. **Data Entry Cancel**: Start entering data and verify Cancel button warns before discarding
7. **Approval Service**: Check that API errors show proper error messages in UI
