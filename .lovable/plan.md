
## E2E Test Results: Issues Found & Fix Plan

The end-to-end test of the user journey revealed critical bugs blocking core functionality.

---

### Test Journey Summary

| Step | Page | Status | Notes |
|------|------|--------|-------|
| 1 | Landing Page | Pass | Renders correctly |
| 2 | Authentication | Pass | User already logged in from previous session |
| 3 | Onboarding | FAIL | "Load Demo Data" returns 500 error |
| 4 | Dashboard | WARN | 406 errors from quality_tracking queries |
| 5 | Data Entry | Pass | Industry wizard and form work correctly |
| 6 | Reports | Pass | Templates display correctly |

---

### Critical Issues Found

#### Issue 1: "Load Demo Data" Edge Function Fails (Severity: Critical)

**Error**: `numeric field overflow: A field with precision 3, scale 2 must round to an absolute value less than 10^1`

**Root Cause**: The `calculations` table has `confidence_score NUMERIC(3,2)` which only allows values from -9.99 to 9.99. However, the seed function tries to insert values 85-100 (percentage).

**Location**: `supabase/functions/seed-sample-data/index.ts` line 229:
```typescript
confidence_score: 85 + Math.random() * 15, // Generates 85-100
```

**Fix Options**:
1. Change the column precision to `NUMERIC(5,2)` to allow 0.00-100.00
2. Store as decimal (0.85-1.00) instead of percentage

---

#### Issue 2: quality_tracking 406 Errors (Severity: High)

**Error**: HTTP 406 (Not Acceptable) on queries to quality_tracking table

**Root Cause**: The dashboard queries filter by `user_id`:
```
quality_tracking?user_id=eq.{user_id}
```

But the RLS policy only checks organization membership:
```sql
USING (is_org_member(auth.uid(), organization_id))
```

Users without an organization, or where `organization_id` is NULL, cannot read any rows.

**Fix**: Add user-based RLS policy or update queries to include organization_id filter.

---

### Proposed Database Migration

```sql
-- Fix 1: Alter confidence_score column to allow percentage values
ALTER TABLE public.calculations 
ALTER COLUMN confidence_score TYPE NUMERIC(5,2);

-- Fix 2: Add user-based SELECT policy for quality_tracking
CREATE POLICY "Users can view own quality tracking"
ON public.quality_tracking
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Add UPDATE policy for quality_tracking (needed for upserts)
CREATE POLICY "Users can update own quality tracking"
ON public.quality_tracking  
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

---

### Expected Outcome After Fix

1. **Load Demo Data**: Will successfully seed 72 emissions entries + 72 calculations
2. **Dashboard Quality Widgets**: Will load without 406 errors
3. **Complete User Journey**: New users can onboard with sample data and see populated dashboard

---

### Additional Observations

- Onboarding wizard shows "BARYON" in some places and "CarbonTrack" in others (branding inconsistency noted in memories)
- The postMessage warnings in console are harmless development artifacts
- Overall navigation and core features work well once data exists
