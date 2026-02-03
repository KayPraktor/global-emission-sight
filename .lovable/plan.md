

## Backend Fixes Plan

This plan addresses two critical database errors preventing the Scenario Modeling and Enterprise KPI services from working correctly.

---

### Issue Summary

| Service | Error | Cause | Impact |
|---------|-------|-------|--------|
| Scenario Modeling | `no unique constraint matching ON CONFLICT` | Missing unique constraint on `(organization_id, scenario_name)` | Cannot save scenarios |
| Enterprise KPIs | `violates row-level security policy` | Missing UPDATE RLS policy | Cannot update existing metrics |

---

### Fix 1: Add Unique Constraint for Scenarios

**Table:** `enterprise_scenarios`

The service attempts to upsert scenarios using:
```typescript
.upsert(scenariosToSave, { onConflict: 'organization_id,scenario_name' })
```

But the table only has a primary key constraint on `id`. We need to add a unique constraint.

**Database Migration:**
```sql
-- Add unique constraint on (organization_id, scenario_name)
ALTER TABLE public.enterprise_scenarios 
ADD CONSTRAINT enterprise_scenarios_org_name_unique 
UNIQUE (organization_id, scenario_name);
```

---

### Fix 2: Add UPDATE RLS Policy for Metrics

**Table:** `enterprise_metrics`

The service attempts to upsert metrics using:
```typescript
.upsert({ organization_id, metric_date, ...metrics }, { onConflict: 'organization_id,metric_date' })
```

The table has INSERT and SELECT policies but lacks an UPDATE policy. When upsert tries to update an existing row, RLS blocks it.

**Database Migration:**
```sql
-- Add UPDATE policy for enterprise_metrics
CREATE POLICY "Org members can update metrics"
ON public.enterprise_metrics
FOR UPDATE
TO authenticated
USING (is_org_member(auth.uid(), organization_id))
WITH CHECK (is_org_member(auth.uid(), organization_id));
```

---

### Implementation

**Single Migration File Contents:**

```sql
-- Fix 1: Add unique constraint for enterprise_scenarios upsert
ALTER TABLE public.enterprise_scenarios 
ADD CONSTRAINT enterprise_scenarios_org_name_unique 
UNIQUE (organization_id, scenario_name);

-- Fix 2: Add UPDATE policy for enterprise_metrics
CREATE POLICY "Org members can update metrics"
ON public.enterprise_metrics
FOR UPDATE
TO authenticated
USING (is_org_member(auth.uid(), organization_id))
WITH CHECK (is_org_member(auth.uid(), organization_id));
```

---

### Expected Outcome

After applying these fixes:

1. **Scenario Modeling Service**: Will successfully save and update scenarios using upsert with `onConflict: 'organization_id,scenario_name'`

2. **Enterprise KPI Service**: Will successfully update existing metrics for the same organization and date

3. **Console Errors**: Both error messages will no longer appear:
   - `"there is no unique or exclusion constraint matching the ON CONFLICT specification"` - FIXED
   - `"new row violates row-level security policy (USING expression)"` - FIXED

---

### Verification Steps

After deployment:
1. Navigate to the dashboard to trigger KPI calculations
2. Navigate to Scenario Planning page to generate scenarios
3. Check console logs for any remaining errors
4. Verify data appears correctly in the UI

