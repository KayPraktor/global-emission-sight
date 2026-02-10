

# Full-Scale "Dead UI" Audit and Fix

## Problem Summary

The application has dozens of buttons, links, and interactive elements that are visually present but do nothing when clicked. This makes the product feel broken and unfinished.

## Identified Dead Interactive Elements

### Category 1: Buttons with No `onClick` Handler (Completely Inert)

| Component | Element | Fix |
|-----------|---------|-----|
| `BoardReportDashboard.tsx` (line 121) | "Review Now" button (overdue duties alert) | Navigate to Fiduciary Duties tab |
| `BoardReportDashboard.tsx` (line 176) | "View All Reports" button | Switch to Executive Reports tab |
| `BoardReportDashboard.tsx` (line 212) | "View Full Scorecard" button | Switch to Governance Scorecard tab |
| `ExecutiveReportBuilder.tsx` (line 73) | "Preview" button | Show toast with preview simulation |
| `ExecutiveReportBuilder.tsx` (line 77) | "Export PDF" button | Trigger PDF generation with loading state |
| `ExecutiveReportBuilder.tsx` (line 316) | "Customize" button | Toggle report sections (make them interactive checkboxes) |
| `ExecutiveReportBuilder.tsx` (line 320) | "Generate Report" button | Trigger report generation with progress simulation |
| `ExecutiveReportBuilder.tsx` (lines 298-306) | Report section toggles (e.g., "Regulatory Updates") | Add onClick to toggle inclusion state |
| `FiduciaryDutyTracker.tsx` (line 237) | "Filter" button | Show toast "Feature coming soon" or implement simple filter |
| `FiduciaryDutyTracker.tsx` (line 241) | "Sort" button | Show toast "Feature coming soon" or implement sort toggle |
| `FiduciaryDutyTracker.tsx` (lines 270-285) | "Schedule Review", "Assign Duty", "Export Report", "Risk Assessment" quick actions | Add toast feedback for each |
| `ComplianceIntelligence.tsx` (line 133) | "Generate Report" button | Navigate to reports page with toast |
| `ComplianceIntelligence.tsx` (line 300) | "Subscribe to Updates" button | Show toast "Subscribed to regulatory updates" |
| `ComplianceIntelligence.tsx` (line 330) | "Review" button (regulatory updates) | Show toast with update details |
| `CSRDDashboard.tsx` (line 148) | "Export Report" button | Trigger export with mock loading |
| `MobileNavigation.tsx` (line 111) | "New Entry" quick action | Navigate to `/data-entry` |
| `MobileNavigation.tsx` (line 115) | "Generate Report" quick action | Navigate to `/reports` |
| `AppSidebar.tsx` (line 252) | "Help & Support" link | Navigate to a help page or show toast |

### Category 2: Navigation Issues

| Component | Element | Fix |
|-----------|---------|-----|
| `MobileNavigation.tsx` (line 31) | "Monitoring" link (`/monitoring`) | Route does not exist; remove or map to `/analytics` |
| `MobileNavigation.tsx` (line 32) | "AI Assistant" link (`/ai-assistant`) | Route does not exist; remove or map to existing page |
| `MobileNavigation.tsx` (line 153) | "More" link (`/more`) in bottom nav | Route does not exist; should open the mobile sheet instead |

### Category 3: Report Section Toggles (Static UI pretending to be interactive)

| Component | Element | Fix |
|-----------|---------|-----|
| `ExecutiveReportBuilder.tsx` (lines 289-312) | Report section checkboxes ("Executive Summary", "Emissions Performance", etc.) | Convert to controlled state with `useState` so clicking toggles inclusion |

---

## Implementation Approach

### 1. Board Reporting Dashboard (`BoardReportDashboard.tsx`)

- Accept a new `onTabChange` callback or use a `ref` to the Tabs component to programmatically switch tabs.
- Since the Tabs are controlled by Radix UI and the component owns the state, convert to a controlled `Tabs` with `useState` for `activeTab`.
- Wire "Review Now" to set tab to `duties`, "View All Reports" to `reports`, and "View Full Scorecard" to `governance`.

### 2. Executive Report Builder (`ExecutiveReportBuilder.tsx`)

- **Report Sections:** Convert the static `section.included` array to `useState` so clicking toggles each section's inclusion.
- **Preview button:** Show a toast: "Preview generated -- opening in new window..." (mock).
- **Export PDF button:** Add a loading spinner, simulate 2-second delay, then show success toast.
- **Generate Report button:** Similar mock with progress indicator and success toast.
- **Customize button:** Toggle the section toggles between view-only and edit mode, or simply show a toast saying "Use the checkboxes above to customize sections."

### 3. Fiduciary Duty Tracker (`FiduciaryDutyTracker.tsx`)

- **Filter button:** Show toast "Filtering feature coming soon" (or implement basic category filter dropdown).
- **Sort button:** Show toast "Sorting feature coming soon" (or toggle sort between priority/date).
- **Quick Action buttons:** Each shows a toast with contextual message:
  - "Schedule Review" -> "Opening calendar to schedule board review..."
  - "Assign Duty" -> "Assignment feature coming soon"
  - "Export Report" -> Trigger mock CSV/PDF export with loading state
  - "Risk Assessment" -> Navigate to `/analytics`

### 4. Compliance Intelligence (`ComplianceIntelligence.tsx`)

- **Generate Report:** Navigate to `/reports` with a toast.
- **Subscribe to Updates:** Toast "Subscribed to regulatory updates successfully!"
- **Review buttons (regulatory updates):** Toast showing the update's action requirement.

### 5. CSRD Dashboard (`CSRDDashboard.tsx`)

- **Export Report button:** Add an `onClick` handler that simulates export with a loading toast.

### 6. Mobile Navigation (`MobileNavigation.tsx`)

- **Fix broken routes:** Change `/monitoring` to `/analytics`, `/ai-assistant` to `/enterprise`, and `/more` to open the side sheet.
- **Quick Action buttons:** "New Entry" navigates to `/data-entry`, "Generate Report" navigates to `/reports`, both closing the sheet.

### 7. Help & Support (`AppSidebar.tsx`)

- Wrap in a clickable element that shows a toast: "Help & Support -- Contact support@baryon.app or visit our documentation."

---

## Files to Modify

| File | Type of Changes |
|------|----------------|
| `src/components/BoardReporting/BoardReportDashboard.tsx` | Add controlled Tabs state, wire 3 dead buttons to tab switches |
| `src/components/BoardReporting/ExecutiveReportBuilder.tsx` | Add section toggle state, wire Preview/Export/Generate/Customize buttons with mock logic |
| `src/components/BoardReporting/FiduciaryDutyTracker.tsx` | Wire Filter/Sort/Quick Action buttons with toasts |
| `src/components/Enterprise/ComplianceIntelligence.tsx` | Wire Generate Report/Subscribe/Review buttons |
| `src/components/Compliance/CSRDDashboard.tsx` | Wire Export Report button |
| `src/components/navigation/MobileNavigation.tsx` | Fix broken routes, wire quick action buttons with navigation |
| `src/components/navigation/AppSidebar.tsx` | Make Help & Support clickable with feedback |

---

## Technical Notes

- All "coming soon" toasts will use `toast.info()` from sonner with a descriptive message so users know the system responded.
- All export/generate buttons will use a simulated loading pattern: `setLoading(true)` -> `setTimeout` (1.5s) -> success toast -> `setLoading(false)`.
- Navigation wiring will use the `useNavigate` hook from react-router-dom.
- Report section toggles will use a `useState<Record<string, boolean>>` pattern to track which sections are included.
- No backend changes are needed -- this is purely a frontend interactivity pass.

