

# From Static UI to Real Product Logic -- Phased Roadmap

## Current State Assessment

The codebase has a mix of real and static logic:

**Already Real (DB-wired):**
- Emissions data entry (EmissionsService) -- saves to DB with validation
- Dashboard overview (AnalyticsService) -- reads real emissions_entries + calculations
- Goals CRUD (GoalsService) -- with real progress tracking against emissions
- Facilities CRUD (FacilityService) -- organization-scoped
- Insights panel (InsightsNextActions) -- fetches from DB
- Top Drivers (TopDrivers) -- uses real categoryBreakdown from analytics

**Still Static/Hardcoded:**
- Compliance Status widget -- hardcoded GHG Protocol, ISO 14064, CDP, TCFD statuses
- Upcoming Deadlines widget -- hardcoded dates and tasks
- Sample table data in Index.tsx (sampleTableData, chartData)
- CBAM calculator -- form exists but no embedded emissions calculation logic
- Scope 3 dashboard -- falls back to demo data (scope3DemoData.ts)
- dummyData.ts -- still imported in some places
- EmissionsReport component uses static dummyData
- Multiple "SampleDataBadge" markers across dashboard, reports, scope3

## Phased Implementation

This is too large for a single change. Here is a 4-phase plan, each phase self-contained and testable.

---

### Phase 1: Dashboard Truth Layer (Remove all hardcoded dashboard data)

**Goal:** The dashboard shows ONLY real data or meaningful empty states. No fake numbers.

**Changes:**

1. **Remove hardcoded compliance widget** in `Index.tsx` (lines 516-581). Replace with a service that checks which reports exist in the `reports` table and what frameworks they cover. If a GHG Protocol report is `published`, status = "Compliant". If `draft`, status = "In Progress". If no report exists, status = "Not Started".

2. **Remove hardcoded deadlines** (UPCOMING_DEADLINES constant). Create a `compliance_deadlines` table in the database to store organization-specific regulatory deadlines. The dashboard reads from this table. Provide seed data during onboarding based on the organization's industry.

3. **Remove sampleTableData and chartData** constants from Index.tsx. The advanced table and chart sections already have real data paths via analyticsData -- just wire them through properly or hide the sections when no data exists.

4. **Remove all SampleDataBadge** instances from dashboard components. Replace with conditional rendering: show empty states with CTAs ("Add your first emission entry") when no data exists.

**Files modified:**
- `src/pages/Index.tsx` -- remove hardcoded arrays, wire compliance + deadlines to DB
- New service: `src/services/complianceTrackingService.ts` -- query reports table for framework coverage
- DB migration: create `compliance_deadlines` table

---

### Phase 2: Emissions Calculation Engine (Make the math real)

**Goal:** When a user enters activity data, the system automatically calculates tCO2e using the correct emission factor and stores the result.

**Current gap:** The `calculations` table exists and `emissions_entries` references it, but the auto-calculation trigger may not be working end-to-end for all entry paths.

**Changes:**

1. **Verify/fix the calculation trigger** -- ensure that when an `emissions_entry` is inserted, a corresponding `calculations` row is created with `calculated_emissions = quantity * factor_value`. Check the DB trigger or create one if missing.

2. **Wire Scope 3 to real data** -- Replace demo data fallback in `scope3Service.ts` with queries to `organization_scope3_summary` table. Show empty state instead of fake data when no Scope 3 data exists.

3. **Remove dummyData.ts** -- Find all imports and replace with real service calls or empty states.

4. **Fix EmissionsReport** -- Wire it to `analyticsService` instead of static `dummyData`.

**Files modified:**
- `src/services/scope3Service.ts` -- remove demo data imports, query real tables
- `src/components/Reports/EmissionsReport.tsx` -- use analyticsService
- `src/utils/dummyData.ts` -- delete file
- DB migration: verify/create calculation trigger

---

### Phase 3: CBAM Embedded Emissions Logic

**Goal:** The EU CBAM generator performs real calculations per EU 2023/956.

**Changes:**

1. **Add calculation logic to `cbamReportService.ts`:**
   - Specific Embedded Emissions = (Direct + Indirect + Precursor) / Net Mass
   - Country grid emission factor lookup table
   - EU default emission factors by product category

2. **Enhance `CBAMReportGenerator.tsx`:**
   - Add electricity consumption and grid factor fields per product
   - Add precursor sub-form (name, quantity, emission factor)
   - Country dropdown with auto-populated grid factors
   - Live summary table showing calculated carbon intensity
   - EORI validation

3. **Updated PDF output** -- include precursor breakdown and data source flags

**Files modified:**
- `src/services/cbamReportService.ts`
- `src/components/Reports/CBAMReportGenerator.tsx`

---

### Phase 4: Report Intelligence (Reports use real data)

**Goal:** All report generators pull from real DB data, not static values.

**Changes:**

1. **MonthlyReportGenerator** -- verify it queries `analyticsService` for the selected month
2. **ComprehensiveReportGenerator** -- verify it aggregates real quarterly/annual data
3. **Template renderers** (GHG, CDP, TCFD, Scope3) -- ensure they pull from the correct DB tables (emissions_entries, goals, materiality_assessments, suppliers)
4. **Remove the "Data Reports" tab** with SampleDataBadge if EmissionsReport is now real

**Files modified:**
- `src/components/Reports/MonthlyReportGenerator.tsx`
- `src/components/Reports/ComprehensiveReportGenerator.tsx`
- `src/services/reportRenderers/*.ts`
- `src/pages/ReportsPage.tsx`

---

## Recommended Starting Point

**Phase 1** (Dashboard Truth Layer) is the highest-impact, lowest-risk change. It immediately makes the product feel real by removing fake data from the first screen users see. It also establishes the pattern (query DB, show empty state if nothing) that all subsequent phases follow.

## Technical Details

### Compliance Tracking Service Pattern

```typescript
// complianceTrackingService.ts
class ComplianceTrackingService {
  async getFrameworkStatus(organizationId: string): Promise<FrameworkStatus[]> {
    // Query reports table grouped by report_type
    // Map report status to compliance status
    const { data: reports } = await supabase
      .from('reports')
      .select('report_type, status')
      .eq('organization_id', organizationId);
    
    return FRAMEWORKS.map(fw => {
      const report = reports?.find(r => r.report_type === fw.key);
      return {
        name: fw.name,
        status: report ? mapStatus(report.status) : 'not_started',
        progress: calculateProgress(report)
      };
    });
  }
}
```

### compliance_deadlines Table Schema

```sql
CREATE TABLE compliance_deadlines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  framework TEXT,          -- 'GHG', 'CDP', 'TCFD', 'CBAM', etc.
  urgency TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  linked_route TEXT,       -- app route to navigate to
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- RLS: org members can CRUD their org's deadlines
```

### Calculation Trigger (if missing)

```sql
CREATE OR REPLACE FUNCTION calculate_emissions_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO calculations (
    entry_id, calculated_emissions, calculation_date
  )
  SELECT 
    NEW.id,
    NEW.quantity * ef.factor_value,
    NOW()
  FROM emission_factors ef
  WHERE ef.id = NEW.emission_factor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Empty State Pattern

Every widget that currently shows hardcoded data will follow this pattern:
- Query DB for real data
- If data exists: render normally (no SampleDataBadge)
- If no data: show a clean empty state with a CTA button directing the user to the relevant data entry page

