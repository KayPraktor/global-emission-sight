
# UI Feedback Loops Audit Report

## Executive Summary

After auditing the entire codebase, I've identified **patterns that work well** and **gaps that need addressing** across feedback mechanisms. The application has a solid foundation using Sonner toast library and Shadcn AlertDialog, but there are inconsistencies in tone, missing feedback in certain flows, and areas lacking actionable guidance on errors.

---

## Current Infrastructure (What's Working)

| Component | Status | Notes |
|-----------|--------|-------|
| Toast Library (Sonner) | Good | Centralized in `src/components/ui/sonner.tsx` with 3-toast limit |
| Query Error Handling | Good | `src/lib/queryClient.ts` has error classification and retry logic |
| AlertDialog Component | Good | Proper delete confirmation dialogs in FacilitiesPage |
| Loading States | Good | Consistent use of `Loader2` spinner on buttons |
| Session Expiry | Good | `SessionExpiryHandler` redirects with toast on JWT expiration |
| Offline Detection | Good | `OfflineBanner` component with network status hook |

---

## Issue #1: Inconsistent Toast Tone and Messaging

### Problem
Messages vary wildly in style and helpfulness:

| File | Current Message | Issue |
|------|-----------------|-------|
| AuthContext.tsx | `toast.error(error.message)` | Raw error messages shown directly (could be technical) |
| ApprovalActions.tsx | `toast.error(result.error \|\| 'Action failed')` | Generic "Action failed" - no guidance |
| ScenarioList.tsx | `toast.error('Failed to load scenarios')` | No suggestion on what to do |
| UserManagement.tsx | `toast.error('Failed to load members')` | No retry option or guidance |
| FacilitiesPage.tsx | `toast.error('Failed to load facilities', { description: error })` | Good - uses description |

### Recommendation
Create a standardized feedback utility with consistent patterns:

```typescript
// src/lib/feedback.ts
export const feedback = {
  success: (action: string, entity?: string) => 
    toast.success(`${entity ? entity + ' ' : ''}${action} successfully`),
  
  error: (action: string, suggestion?: string) => 
    toast.error(`Failed to ${action}`, {
      description: suggestion || 'Please try again or contact support.',
    }),
  
  loading: (action: string) => 
    toast.loading(`${action}...`, { id: action }),
  
  dismiss: (id: string) => 
    toast.dismiss(id),
};
```

---

## Issue #2: Native `confirm()` Instead of AlertDialog

### Problem
Two components use browser's native `confirm()` instead of styled AlertDialog:

| File | Line | Current Code |
|------|------|--------------|
| `UserManagement.tsx` | 86 | `if (!confirm('Are you sure...')) return;` |
| `ScenarioList.tsx` | 67 | `if (!confirm('Are you sure...')) return;` |

### Impact
- Breaks visual consistency
- No loading state during delete operation
- Cannot be styled or customized
- Blocks the main thread

### Recommendation
Replace with AlertDialog pattern (as used in FacilitiesPage.tsx):

```typescript
const [itemToDelete, setItemToDelete] = useState<string | null>(null);

<AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Scenario</AlertDialogTitle>
      <AlertDialogDescription>
        This will permanently delete the scenario and all associated data.
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive">
        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## Issue #3: Missing Loading Indicators for Async Operations

### Problem
Several async operations lack visual loading feedback:

| Component | Action | Loading State |
|-----------|--------|---------------|
| `GoalsList.tsx` | Edit/View Goal | Missing (just shows toast.info) |
| `ProfessionalGoalsList.tsx` | Edit/View Goal | Missing (just shows toast.info) |
| `EmissionsChart.tsx` | Export | Missing (instant "success" toast) |
| `ScenarioList.tsx` | Delete | Missing during API call |

### Recommendation
Add loading toast pattern for longer operations:

```typescript
const handleExport = async () => {
  const toastId = toast.loading('Exporting chart data...');
  try {
    await exportData();
    toast.success('Chart data exported successfully', { id: toastId });
  } catch (error) {
    toast.error('Failed to export data', { id: toastId });
  }
};
```

---

## Issue #4: Error Messages Lack Actionable Guidance

### Problem Analysis
Current error messages tell users WHAT failed but not HOW to fix it:

| Current Message | Missing Guidance |
|-----------------|------------------|
| "Failed to load facilities" | Try refreshing? Check connection? |
| "Failed to update role" | Permission issue? Try again? |
| "Action failed" | Which action? Why? |
| "Failed to create goal. Please try again." | Good - has suggestion |

### Recommendation
Enhance error messages with descriptions:

```typescript
// Before
toast.error('Failed to load members');

// After
toast.error('Failed to load members', {
  description: 'Check your connection and try refreshing the page.',
  action: {
    label: 'Retry',
    onClick: () => fetchMembers(),
  },
});
```

---

## Issue #5: Inconsistent Info Toast Usage

### Problem
`toast.info()` is used for different purposes:

| Usage Type | Examples |
|------------|----------|
| Navigation hint | "Navigating to X details" |
| Status update | "Generating report..." |
| Placeholder | "Edit goal #123" (should do something) |
| Dismissal | "Quick win dismissed" |

### Specific Issues Found

```typescript
// GoalsList.tsx - Placeholder that does nothing
const handleEditGoal = (goalId: string) => {
  toast.info(`Edit goal #${goalId}`); // Should navigate or open modal
};

// EnterpriseIndex.tsx - Not implemented
const handleReorderKPIs = () => {
  toast.info('Drag and drop reordering coming soon!'); // Should hide feature
};
```

### Recommendation
1. Remove placeholder toasts - implement or hide the feature
2. Use `toast.loading()` for ongoing operations
3. Reserve `toast.info()` for neutral status updates only

---

## Issue #6: Missing Success Confirmation for Some CRUD Operations

### Audit of Key Operations

| Operation | Component | Success Toast | Error Toast |
|-----------|-----------|---------------|-------------|
| Create Facility | FacilitiesPage | Yes | Yes |
| Update Facility | FacilitiesPage | Yes | Yes |
| Delete Facility | FacilitiesPage | Yes | Yes |
| Create Goal | EnhancedGoalForm | Yes | Yes |
| Create Scenario | ScenarioBuilder | Yes | Yes |
| Delete Scenario | ScenarioList | Yes | Yes |
| Approve Entry | ApprovalActions | Yes | Yes |
| Update Role | UserManagement | Yes | Yes |
| Remove Member | UserManagement | Yes | Yes |
| Export Data | EmissionsChart | Yes | No (should handle failure) |

### Gap Found
Export operations don't have error handling:

```typescript
// EmissionsChart.tsx - Line 189
const handleExport = () => {
  toast.success("Chart data exported successfully");
  // No try/catch, no actual export logic
};
```

---

## Issue #7: Delete Confirmation Missing Context

### Current Pattern (FacilitiesPage - Good)
```
"Are you sure you want to delete this facility? This action cannot be undone.
All associated emissions entries will remain but will no longer be linked."
```

### Missing Context Examples

| Component | Current | Should Include |
|-----------|---------|----------------|
| ScenarioList | "Delete this scenario?" | Number of interventions that will be deleted |
| UserManagement | "Remove this member?" | Member name, role, pending work |
| SupplierDashboard | N/A (uses mutation) | Supplier name, emission data impact |

### Recommendation
Include entity details and consequences in delete dialogs:

```typescript
<AlertDialogDescription>
  Are you sure you want to delete <strong>{scenario.name}</strong>?
  This will also remove {scenario.interventionCount} intervention(s).
  This action cannot be undone.
</AlertDialogDescription>
```

---

## Issue #8: Query Error Handling Not Displayed in UI

### Problem
While `queryClient.ts` shows toasts for errors, some components also catch and handle errors, leading to:
1. Duplicate toasts (component + queryClient)
2. Missing toasts when component swallows error

### Example (SupplierDashboard)
```typescript
const deleteMutation = useMutation({
  mutationFn: (id) => supplierService.deleteSupplier(id),
  onError: () => toast.error('Failed to delete supplier'), // Component-level
});
// queryClient also shows toast on mutation error - possible duplicate
```

### Recommendation
Use `meta` to control toast behavior:

```typescript
const deleteMutation = useMutation({
  mutationFn: (id) => supplierService.deleteSupplier(id),
  meta: { showErrorToast: false }, // Let component handle
  onError: () => toast.error('Failed to delete supplier'),
  onSuccess: () => toast.success('Supplier deleted'),
});
```

---

## Summary: Prioritized Fixes

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| Critical | Replace native confirm() with AlertDialog | Low | High |
| High | Add loading toasts to long operations | Low | Medium |
| High | Enhance error messages with guidance | Medium | High |
| Medium | Create standardized feedback utility | Medium | High |
| Medium | Add retry actions to error toasts | Medium | Medium |
| Medium | Fix placeholder info toasts | Low | Medium |
| Low | Add delete confirmation context | Low | Low |
| Low | Deduplicate query/mutation error handling | Low | Low |

---

## Implementation Files to Create/Modify

### New Files
1. `src/lib/feedback.ts` - Standardized feedback utilities

### Files to Modify
1. `src/components/admin/UserManagement.tsx` - Replace confirm() with AlertDialog
2. `src/components/Scenarios/ScenarioList.tsx` - Replace confirm() with AlertDialog
3. `src/components/Goals/GoalsList.tsx` - Fix placeholder edit handler
4. `src/components/Goals/ProfessionalGoalsList.tsx` - Fix placeholder edit handler
5. `src/components/Dashboard/EmissionsChart.tsx` - Add proper export logic with error handling
6. Multiple components - Apply consistent feedback patterns

---

## Feedback Message Style Guide (To Be Created)

| Type | Tone | Format | Example |
|------|------|--------|---------|
| Success | Positive, brief | "[Entity] [action] successfully" | "Goal created successfully" |
| Error | Helpful, actionable | "Failed to [action]. [Suggestion]" | "Failed to save. Please try again." |
| Info | Neutral, informative | "[Status update]" | "Generating report..." |
| Warning | Cautionary | "[Warning]. [Consequence]" | "Unsaved changes will be lost." |
| Loading | Progressive | "[Action]..." | "Saving goal..." |
