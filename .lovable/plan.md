

# Comprehensive Codebase Audit: Ghost Logic, Data Flow, Cascading Effects, and Error Handling

---

## 1. GHOST LOGIC AUDIT (UI with no real data)

The following sidebar tabs have logic that is partially or fully disconnected from the database:

### CRITICAL -- Fully Static (Hardcoded data, no DB connection)

| Tab | Component | Issue |
|-----|-----------|-------|
| **Board Reporting** | `boardReportingService.ts` | `getGovernanceMetrics()`, `getFiduciaryDuties()`, and `getExecutiveSummary()` all return **hardcoded arrays**. No database table exists for governance metrics or fiduciary duties. The "Recent Board Reports" list on the overview tab is a hardcoded array of 3 items. "Next Board Meeting: Apr 15 / 12 days away" is hardcoded. |
| **Enterprise** (Net Zero Progress tab) | `EnterpriseIndex.tsx` lines 404-433 | "34% Progress to Net Zero", "2030 Target Year", "66% Reduction Required", "2,450 tCO2e", "68% complete" are all **hardcoded numbers** in JSX. |
| **Financial > Market Prices** | `CarbonPriceWidget.tsx` line 39 | The trend icon (up/down/flat) is determined by `Math.random()`, not real historical comparison. The "Live" badge is misleading. |
| **Benchmarking** | `benchmarkingService.ts` | `loadBenchmarkData()` uses 2 hardcoded industry objects instead of querying the `industry_benchmarks` table that already exists in the database. |

### MODERATE -- Falls back to mock data when no real data exists

| Tab | Component | Issue |
|-----|-----------|-------|
| **Materiality** (all sub-tabs) | `MaterialityDashboard`, `MaterialityMatrix`, `TopicAssessment`, `FinancialMateriality`, `ImpactAnalysis`, `StakeholderMapping` | All 6 components follow pattern: try real DB query, if empty or error -> fall back to `getMockAssessments()` / `getMockStakeholders()`. This means the UI shows **fake demo data** instead of empty states. Users cannot tell what is real vs. fake. |
| **Scope 3 > Sankey Diagram** | `Scope3SankeyDiagram.tsx` | Still imports and uses `getDemoScope3Totals` from `scope3DemoData.ts`. Even though `Scope3Dashboard` was cleaned up, this sub-component wasn't. |

### LOW -- Minor ghost elements

| Tab | Component | Issue |
|-----|-----------|-------|
| **CBAM Report** | `cbamReportService.ts` | `generateSampleCBAMReport()` method creates a hardcoded "Sample Corporation" report. OK for testing but should be removed or hidden in production. |
| **ISO 14064 Report** | `iso14064ReportService.ts` | Same pattern: `generateSampleReport()` with hardcoded "Sample Corporation" data. |

---

## 2. DATA-TO-CHART SYNC AUDIT (Calculation Engine)

### Calculation Trigger: WORKING

A database trigger `auto_calculate_emissions` fires on INSERT to `emissions_entries`. The function `calculate_emissions_on_entry` correctly:
- Looks up `factor_value` from `emission_factors`
- Computes `calculated_co2e = (quantity * factor_value) / 1000`
- Inserts into `calculations` table

### Analytics Pipeline: WORKING

`analyticsService.ts` queries `emissions_entries` joined with `calculations(calculated_emissions)` and `facilities(name)`. Charts in the Dashboard and Analytics pages pull from this real pipeline.

### Template Renderers: FIXED (Phase 4)

`templateService.ts` now uses `fetchRealTemplateData()` which queries real entries. All 5 report template renderers (GHG, CDP, TCFD, Scope 3, Executive Summary) pull from this.

### GAP: No recalculation on emission factor UPDATE

The trigger only fires on `INSERT` to `emissions_entries`. If an emission factor's `factor_value` is changed, **existing calculations are NOT recalculated**. There is no trigger on `emission_factors` for this.

---

## 3. CASCADING DELETIONS AND UPDATES AUDIT

### Foreign Key Behavior (from DB constraints)

| Parent Deleted | Child Table | FK Behavior | Impact |
|---|---|---|---|
| Facility deleted | `emissions_entries.facility_id` | `ON DELETE SET NULL` | Entries remain but lose facility link. Dashboard/analytics still include them. |
| Facility deleted | `goals.facility_id` | `ON DELETE SET NULL` | Goals remain but lose facility scope. |
| Emission Factor deleted | `emissions_entries.emission_factor_id` | `ON DELETE SET NULL` | Entries remain but lose factor link. |
| Emission Factor deleted | `calculations.emission_factor_id` | `ON DELETE RESTRICT` | **BLOCKS deletion** if any calculations reference it. This is good for data integrity but the UI does not explain this to the user. |

### Critical Missing Behavior

1. **No cascade recalculation**: When an emission factor value is updated, existing `calculations` rows keep the OLD calculated value. The dashboard, reports, and Scope 3 will show stale numbers until entries are manually re-submitted.

2. **No real-time refresh**: Dashboard and Analytics use `useQuery` with default caching. After a deletion, the user must refresh or navigate away and back to see updated totals.

3. **Facility deletion UI warning is misleading**: The delete dialog says "All associated emissions entries will remain but will no longer be linked to this facility." This is technically correct (SET NULL), but doesn't mention that **deletion will fail silently if calculations reference the facility's emission factors** (RESTRICT on calculations table).

---

## 4. ERROR HANDLING AUDIT

### Services: Generally Good

Most services follow a consistent pattern:
- `try/catch` with `console.error` + return `{ error: string }` or `throw`
- `facilityService`: Returns `{ data, error }` tuples -- UI shows toast on error
- `emissionsService`: Returns `{ success, error }` -- UI shows error message
- `carbonCreditService`: Returns `null` or `false` on failure -- UI shows toast
- `roiTrackingService`: Returns `null` or empty array on failure -- UI shows nothing (silent)

### Components with Silent Failures

| Component | Issue |
|---|---|
| `ROIDashboard.tsx` line 74-76 | `catch (error) { console.error(...) }` -- no toast, no user feedback. Loading skeleton just disappears. |
| `CarbonPriceWidget.tsx` line 21 | `catch (error) { console.error(...) }` -- fails silently, shows empty state but no error message. |
| All 6 Materiality components | On error, silently fall back to mock data. User sees fake numbers with no indication anything went wrong. |
| `Scope3SankeyDiagram` | Falls back to demo data on error with no indication. |
| `enterpriseKPIService.ts` line 210 | Returns empty array on error -- Executive dashboard shows "no data" instead of "error loading". |
| `scenarioModelingService.ts` line 189 | Returns empty array on error -- Scenario Planning shows empty state, not error. |
| `enterpriseComplianceService.ts` lines 193, 221 | Returns empty array on error -- compliance widgets show nothing. |

### Forms with Good Error Handling

- `EmissionsWizard` / `EmissionsForm`: Shows validation errors + toast on DB failure
- `FacilityForm`: Shows toast on create/update/delete failure
- `GoalForm`: Shows toast on save failure
- `CarbonCreditPortfolio`: Shows toast on add/retire/delete failure with double-submit prevention
- `StakeholderMapping`: Shows toast on save/delete failure

---

## Implementation Plan

### Phase A: Kill All Ghost Logic

**A1. Board Reporting Service** (Highest priority ghost)
- Create `governance_metrics` and `fiduciary_duties` tables in the database
- Rewrite `getGovernanceMetrics()` and `getFiduciaryDuties()` to query DB
- Rewrite `getExecutiveSummary()` to pull from `emissions_entries` + `goals` + `reports`
- Replace hardcoded "Recent Board Reports" with query to `reports` table
- Remove hardcoded "Next Board Meeting" and add a `board_meetings` field to `compliance_deadlines` or a simple `organization_events` table

**A2. Enterprise Net Zero Progress**
- Replace hardcoded 34%, 2030, 66%, etc. with data from `goals` table (find net-zero goal) and `enterprise_metrics`
- Calculate progress dynamically: current emissions vs. baseline

**A3. Materiality Mock Fallback Removal**
- Remove `getMockAssessments()` and `getMockStakeholders()` functions entirely
- Replace all 6 component fallbacks with empty state UI + CTA to "Start your materiality assessment"

**A4. Benchmarking Service**
- Wire `loadBenchmarkData()` to query the existing `industry_benchmarks` table instead of hardcoded arrays

**A5. Scope 3 Sankey Cleanup**
- Remove demo data import from `Scope3SankeyDiagram.tsx`
- Wire to real `organization_scope3_summary` data or show empty state

**A6. Carbon Price Widget**
- Remove `Math.random()` trend logic
- Either store historical prices for real comparison or remove the trend icon entirely

### Phase B: Cascading Recalculation

**B1. Emission Factor Update Trigger**
- Create a database trigger on `emission_factors` UPDATE that recalculates all related `calculations` rows:
```sql
CREATE OR REPLACE FUNCTION recalculate_on_factor_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.factor_value IS DISTINCT FROM NEW.factor_value THEN
    UPDATE calculations
    SET calculated_emissions = (
      SELECT (ee.quantity * NEW.factor_value) / 1000.0
      FROM emissions_entries ee
      WHERE ee.id = calculations.emissions_entry_id
    ),
    calculation_timestamp = now()
    WHERE emission_factor_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

**B2. Query Cache Invalidation**
- After facility/factor deletion or update, call `queryClient.invalidateQueries()` for relevant keys ('analytics', 'emissions', 'enterprise-kpis') to force UI refresh

**B3. Improve Facility Deletion UX**
- Before deleting, check if any `calculations` reference the facility's factors
- Show count of affected entries in the confirmation dialog

### Phase C: Error Handling Hardening

**C1. Silent Failure Fixes**
- `ROIDashboard`: Add toast.error on catch
- `CarbonPriceWidget`: Add error state with retry button
- `enterpriseKPIService`, `scenarioModelingService`, `enterpriseComplianceService`: Throw errors instead of returning empty arrays, let React Query's `isError` state show error UI

**C2. Materiality Error Handling**
- After removing mock fallbacks (Phase A3), add proper error state with retry button in each Materiality component

**C3. Consistent Error Pattern**
- Establish a standard: services either throw (letting React Query handle it) or return `{ data, error }` tuples. Currently it's a mix of both patterns.

---

## Priority Order

1. **Phase A1-A3** (Ghost Logic) -- highest user-facing impact
2. **Phase B1** (Recalculation trigger) -- data integrity
3. **Phase C1-C2** (Error handling) -- reliability
4. **Phase A4-A6** (Minor ghost items) -- polish
5. **Phase B2-B3** (Cache invalidation, UX) -- polish
