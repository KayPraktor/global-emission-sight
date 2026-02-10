

# Full Implementation: Replace Mock Behavior with Real Logic

## Summary

This plan replaces all toast-only placeholder behaviors with actual business logic across 5 components. The key changes are: real PDF/CSV exports using jsPDF and xlsx, preview modals rendering live data, and real data-driven operations.

## Components to Modify

### 1. ExecutiveReportBuilder.tsx -- Real PDF Export and Preview Modal

**Current:** "Export PDF" shows a toast after 2s timeout. "Preview" shows a toast. "Generate Report" shows a toast.

**Fix:**
- **Export PDF:** Use `ProfessionalPDFGenerator` (already exists in `professionalPDFGenerator.ts`) to build a real board report PDF with:
  - Cover page with company name and report period
  - Executive summary section with emissions breakdown (data from `getExecutiveSummary()`)
  - Key-value metrics cards for Scope 1/2/3 totals
  - Risks and Opportunities tables
  - Quarterly progress table
  - Only include sections the user toggled on via the checkboxes
  - Trigger a real browser file download
- **Preview:** Open a Dialog/modal that renders a formatted preview of the report data (emissions summary, targets, risks, opportunities) using the existing data from `getExecutiveSummary()`.
- **Generate Report:** Same as Export PDF (generate + download). The "Customize" button will scroll to the section toggles and show a toast explaining usage.

### 2. FiduciaryDutyTracker.tsx -- Real Export and Filter/Sort

**Current:** "Export Report" shows a toast. "Filter" and "Sort" show toasts. "Schedule Review" / "Assign Duty" show toasts.

**Fix:**
- **Export Report:** Use jsPDF + autoTable to generate a real PDF listing all fiduciary duties with columns: Title, Category, Status, Priority, Due Date, Assigned To, Linked Regulations. Trigger browser download.
- **Filter button:** Implement a real filter dropdown (popover) that filters duties by category (disclosure, risk_oversight, strategic_planning, etc.) using existing `categoryLabels` data.
- **Sort button:** Toggle between sorting by priority (current default) and by due date. Track sort state with `useState`.
- **Schedule Review / Assign Duty:** Keep toast for now -- these require backend features (calendar integration, user assignment) that don't have supporting tables yet. Update toast to clearly explain: "This feature requires team member management to be configured."

### 3. ComplianceIntelligence.tsx -- Real Navigation and Preview

**Current:** "Generate Report" navigates to /reports with a toast. "Subscribe to Updates" shows a toast. "Review" shows a toast.

**Fix:**
- **Generate Report:** Keep navigation to `/reports` (this is correct behavior already).
- **Subscribe to Updates:** Keep as toast -- this is a notification preference that would need a backend table for subscriptions. Toast is acceptable here as it mimics a real subscription toggle.
- **Review buttons (regulatory updates):** Open a Dialog/modal showing the full regulatory update details (title, description, action required, deadline, impact level) instead of a toast.

### 4. CSRDDashboard.tsx -- Real CSRD Report Export

**Current:** "Export Report" shows a loading toast then a success toast.

**Fix:**
- Use `ProfessionalPDFGenerator` to build a real CSRD compliance PDF:
  - Cover page: "CSRD Compliance Report - ESRS E1 Climate Change"
  - Readiness score summary with overall percentage
  - Disclosure checklist table (disclosure ID, name, status, completeness %, data quality %)
  - Data gaps table (disclosure ID, description, severity, recommendation, effort)
  - Compliance timeline/roadmap
  - Recommendations list
  - All data sourced from the existing `csrdComplianceService` which already queries real database data

### 5. ExecutiveReportBuilder.tsx -- Preview Modal Component

Create a new `BoardReportPreview` dialog component that renders:
- Emissions summary with Scope 1/2/3 breakdown
- Quarterly progress table
- Key risks and opportunities lists
- Only sections the user has toggled on
- "Download PDF" button within the preview

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/BoardReporting/BoardReportPreview.tsx` | Preview modal for executive report |
| `src/components/Enterprise/RegulatoryUpdateDialog.tsx` | Detail dialog for regulatory update review |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/BoardReporting/ExecutiveReportBuilder.tsx` | Replace mock export/preview with ProfessionalPDFGenerator and preview modal |
| `src/components/BoardReporting/FiduciaryDutyTracker.tsx` | Real PDF export, real filter popover, real sort toggle |
| `src/components/Enterprise/ComplianceIntelligence.tsx` | Replace review toast with dialog modal |
| `src/components/Compliance/CSRDDashboard.tsx` | Real CSRD PDF export using csrdComplianceService data |

## Technical Details

### PDF Generation Pattern (consistent across all components)

```typescript
import { ProfessionalPDFGenerator, BrandingConfig } from '@/services/professionalPDFGenerator';

const branding: BrandingConfig = {
  companyName: 'Your Company', // Could read from branding_settings table
  primaryColor: '#2563eb',
  secondaryColor: '#7c3aed',
  footerText: 'Confidential - Generated by Baryon ESG Platform',
};

const pdf = new ProfessionalPDFGenerator(branding);
pdf.createCoverPage('Report Title', 'Subtitle', dateStr, 'Report Type');
pdf.addSection('Section Name');
pdf.addTable(headers, rows);
pdf.finalize('filename.pdf'); // triggers browser download
```

### Branding Settings Integration

All PDF exports will attempt to load branding from the `branding_settings` database table first (if it exists), falling back to sensible defaults. This pattern already exists in `monthlyReportService.ts`.

### Filter Popover Pattern (FiduciaryDutyTracker)

Use Radix Popover with checkbox list for category filtering:
- State: `useState<string[]>` for selected categories
- Categories sourced from existing `categoryLabels` constant
- Applied to existing `filteredDuties` logic

### Sort Toggle Pattern

- State: `useState<'priority' | 'date'>('priority')`
- Toggle button switches between the two sort modes
- Already has sorting logic in place -- just needs to be parameterized

### No Database Changes Required

All data sources already exist:
- `getExecutiveSummary()` provides board report data
- `getFiduciaryDuties()` provides duty data
- `csrdComplianceService` queries real database tables
- `ProfessionalPDFGenerator` is fully built and tested
- `branding_settings` table may already exist for branding config

