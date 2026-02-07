

# Application Stress-Test Audit Report

## Executive Summary

This audit identifies **extreme user behaviors** that could crash the application or cause data corruption. I've analyzed the entire codebase for race conditions, missing protections, and edge cases that typical testing might miss.

---

## Critical Vulnerabilities Found

| Category | Issues Found | Severity |
|----------|-------------|----------|
| Missing Delete Confirmations | 4 components | High |
| Double-Submit Vulnerabilities | 3 components | High |
| Unprotected Rapid-Click Actions | 5+ buttons | Medium |
| Missing Loading States During Delete | 4 components | Medium |
| Input Validation Gaps | 3 forms | Medium |
| Race Condition Risks | 2 services | Medium |

---

## Issue #1: Missing Delete Confirmation Dialogs (Critical)

### Problem
Several components delete data immediately on click without confirmation:

| Component | Line | Current Behavior |
|-----------|------|------------------|
| `InterventionList.tsx` | 70-83 | Direct delete on trash icon click |
| `CarbonCreditPortfolio.tsx` | 126-134 | Direct delete without confirmation |
| `ValidationRulesManager.tsx` | 120-135 | Direct delete without confirmation |
| `StakeholderMapping.tsx` | 95-104 | Direct delete without confirmation |

### Impact
- Accidental clicks permanently delete data
- No undo capability
- User has no way to recover from mistakes

### Fix Required
Add `AlertDialog` confirmation pattern (like `FacilitiesPage.tsx` and `ScenarioList.tsx`):

```typescript
const [itemToDelete, setItemToDelete] = useState<string | null>(null);
const [isDeleting, setIsDeleting] = useState(false);

// Button triggers state, not action
<Button onClick={() => setItemToDelete(id)}>
  <Trash2 />
</Button>

// AlertDialog handles confirmation
<AlertDialog open={!!itemToDelete}>
  <AlertDialogContent>
    <AlertDialogTitle>Delete Item</AlertDialogTitle>
    <AlertDialogDescription>
      This action cannot be undone.
    </AlertDialogDescription>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
        {isDeleting && <Loader2 className="animate-spin" />}
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## Issue #2: Double-Submit Vulnerabilities

### Good Patterns Found (Protected)
These components correctly prevent double-submission:

| Component | Protection Method |
|-----------|------------------|
| `EnhancedGoalForm.tsx` | `if (isSubmitting) return;` at line 157 |
| `FacilityForm.tsx` | `disabled={isSubmitting}` on submit button |
| `AuthPage.tsx` | `disabled={isLoading}` on buttons |
| `ApprovalActions.tsx` | `disabled={isLoading}` on all action buttons |

### Vulnerable Patterns Found

| Component | Issue |
|-----------|-------|
| `CarbonCreditPortfolio.tsx` | `handleAddCredit` has no submission guard |
| `CarbonCreditPortfolio.tsx` | `handleRetireCredits` has no submission guard |
| `ValidationRulesManager.tsx` | `handleCreateRule` has no submission guard |

### Current Vulnerable Code
```typescript
// CarbonCreditPortfolio.tsx - No isSubmitting guard
const handleAddCredit = async () => {
  if (newCredit.quantity <= 0) {
    toast.error('Please enter a valid quantity');
    return;
  }
  const result = await carbonCreditService.addCredit(newCredit);
  // User can click multiple times before this completes
};
```

### Fix Required
```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

const handleAddCredit = async () => {
  if (isSubmitting) return; // Guard against rapid clicks
  if (newCredit.quantity <= 0) {
    toast.error('Please enter a valid quantity');
    return;
  }
  setIsSubmitting(true);
  try {
    const result = await carbonCreditService.addCredit(newCredit);
    // ... success handling
  } finally {
    setIsSubmitting(false);
  }
};

// Button with loading state
<Button onClick={handleAddCredit} disabled={isSubmitting}>
  {isSubmitting && <Loader2 className="animate-spin mr-2" />}
  Add Credit
</Button>
```

---

## Issue #3: Race Conditions in Service Layer

### Problem
The `goalsService.getGoalsWithProgress()` method fetches goals, then makes parallel requests for each goal's emissions. If a goal is deleted mid-request, this could cause errors.

```typescript
// goalsService.ts lines 89-161
const goalsWithProgress = await Promise.all(
  goals.map(async (goal) => {
    // This could fail if goal was deleted after initial fetch
    const { data: entries } = await query;
    // ...
  })
);
```

### Also Vulnerable
- `EmissionsCSVImportDialog.tsx`: Bulk imports don't handle partial failures gracefully
- `FacilitiesPage.tsx`: Fetching emissions counts in a loop could race with deletions

### Fix Required
Add defensive error handling:

```typescript
const goalsWithProgress = await Promise.allSettled(
  goals.map(async (goal) => {
    try {
      // ... existing logic
    } catch (error) {
      console.warn(`Failed to calculate progress for goal ${goal.id}:`, error);
      return { ...goal, actualEmissions: 0, progressPercentage: 0, isOnTrack: false, trend: 'down' as const };
    }
  })
);

// Filter out rejected promises
return goalsWithProgress
  .filter((result): result is PromiseFulfilledResult<GoalWithProgress> => result.status === 'fulfilled')
  .map(result => result.value);
```

---

## Issue #4: Input Validation Gaps

### Number Input Edge Cases

| Component | Field | Issue |
|-----------|-------|-------|
| `CarbonCreditPortfolio.tsx` | `quantity`, `purchase_price` | No max value, allows scientific notation (e.g., `1e308`) |
| `EnhancedGoalForm.tsx` | `baselineValue` | Allows negative values in some browsers |
| `FacilityForm.tsx` | `latitude`, `longitude` | Allows values like `NaN` if empty string is converted |

### Current Vulnerability
```typescript
// CarbonCreditPortfolio - No upper bound
<Input
  type="number"
  value={newCredit.quantity}
  onChange={(e) => setNewCredit({...newCredit, quantity: parseFloat(e.target.value)})}
/>
```

### Fix Required
Add Zod schemas with reasonable bounds:

```typescript
const creditSchema = z.object({
  quantity: z.number().positive().max(1_000_000_000, 'Quantity too large'),
  purchase_price: z.number().min(0).max(1_000_000_000, 'Price too large'),
  vintage_year: z.number().min(1990).max(new Date().getFullYear() + 5),
});
```

---

## Issue #5: Missing Loading States During Delete Operations

### Components Without Delete Loading Indicators

| Component | Issue |
|-----------|-------|
| `InterventionList.tsx` | Delete happens instantly, no visual feedback |
| `CarbonCreditPortfolio.tsx` | No loading indicator on delete button |
| `ValidationRulesManager.tsx` | No loading indicator on delete button |
| `StakeholderMapping.tsx` | No loading indicator on delete button |

### Impact
Users may click multiple times thinking nothing happened, causing multiple delete attempts or errors.

### Fix Required
Track deletion state per item:

```typescript
const [deletingId, setDeletingId] = useState<string | null>(null);

const handleDelete = async (id: string) => {
  setDeletingId(id);
  try {
    // ... delete logic
  } finally {
    setDeletingId(null);
  }
};

// In render
<Button 
  onClick={() => handleDelete(item.id)} 
  disabled={deletingId === item.id}
>
  {deletingId === item.id ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <Trash2 className="h-4 w-4" />
  )}
</Button>
```

---

## Issue #6: Potential XSS via dangerouslySetInnerHTML

### Finding
Only one usage found in the codebase:

```typescript
// src/components/ui/chart.tsx line 79
<style
  dangerouslySetInnerHTML={{
    __html: Object.entries(THEMES)
      .map(...)
  }}
/>
```

### Assessment
This is **SAFE** because it only uses hardcoded `THEMES` object values, not user input. No action required.

---

## Issue #7: CSV Import Large File Handling

### Problem
`EmissionsCSVImportDialog.tsx` reads entire file into memory:

```typescript
const text = await file.text();
const result = parseEmissionsCSV(text);
```

### Impact
A malicious or accidentally huge CSV (e.g., 500MB) could crash the browser tab.

### Fix Required
Add file size validation:

```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const handleFileChange = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  
  if (file.size > MAX_FILE_SIZE) {
    toast.error('File too large', { 
      description: 'Please upload a file smaller than 10MB' 
    });
    return;
  }
  // ... continue processing
};
```

---

## Issue #8: Empty Array/Null Safety in Loops

### Potential Issues Found

```typescript
// FacilitiesPage.tsx line 169 - Could fail if facilities is undefined mid-loop
for (const facility of facilities) {
  const { count } = await supabase...
}
```

### Fix Required
Add null checks:

```typescript
for (const facility of (facilities || [])) {
```

---

## Priority Implementation Roadmap

### Critical (Immediate)
1. Add delete confirmation dialogs to 4 components
2. Add double-submit guards to `CarbonCreditPortfolio` and `ValidationRulesManager`

### High Priority
3. Add loading states to delete buttons
4. Add file size validation to CSV import
5. Add input bounds to number fields

### Medium Priority
6. Use `Promise.allSettled` for parallel operations
7. Add null safety checks to loops

---

## Files to Modify

| File | Changes Required |
|------|-----------------|
| `src/components/Scenarios/InterventionList.tsx` | Add AlertDialog, loading state, double-click guard |
| `src/components/Financial/CarbonCreditPortfolio.tsx` | Add AlertDialog for delete, submission guards, loading states |
| `src/components/Analytics/ValidationRulesManager.tsx` | Add AlertDialog, loading state, submission guard |
| `src/components/Materiality/StakeholderMapping.tsx` | Add AlertDialog, loading state |
| `src/components/EmissionsForm/EmissionsCSVImportDialog.tsx` | Add file size validation |
| `src/services/goalsService.ts` | Use Promise.allSettled for error resilience |

---

## Testing Checklist After Implementation

Test each fixed component with:
- [ ] Rapid double-click on submit/delete buttons
- [ ] Click delete, then immediately click again
- [ ] Enter maximum numeric values (e.g., `999999999999`)
- [ ] Enter scientific notation (e.g., `1e10`)
- [ ] Enter special characters in text fields (e.g., `<script>`, `' OR 1=1`)
- [ ] Upload 50MB+ CSV file
- [ ] Delete item while another operation is in progress
- [ ] Switch tabs/pages mid-operation

