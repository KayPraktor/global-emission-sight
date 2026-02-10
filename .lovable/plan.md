

# Dynamic Template Engine: Template-Specific PDF Generation

## Problem

Every template's "Use" button calls the same `generatePDFContent()` function in `templateService.ts`, which always produces an identical Executive Summary-style PDF regardless of which template was selected (GHG Protocol, CDP, TCFD, etc.).

## Solution

Implement a template routing system that maps each template to a distinct PDF rendering pipeline with template-specific content, data fetching, and visual structure.

## Architecture

The `generatePDFContent` function will be refactored into a dispatcher that calls template-specific rendering functions based on the template's `fileName` slug:

```text
generatePDFContent(template, data)
  |
  +-- switch (template.fileName)
       |
       +-- 'ghg_protocol_corporate_standard'   -> renderGHGProtocolPDF()
       +-- 'cdp_climate_change_questionnaire'   -> renderCDPQuestionnairePDF()
       +-- 'tcfd_financial_disclosure'          -> renderTCFDDisclosurePDF()
       +-- 'executive_summary_dashboard'        -> renderExecutiveSummaryPDF()  (current behavior)
       +-- 'scope3_detailed_analysis'           -> renderScope3AnalysisPDF()
       +-- default                             -> renderExecutiveSummaryPDF()   (fallback)
```

## Template Profiles

### 1. Executive Summary Dashboard (current default -- minimal changes)
- Donut chart, summary cards, progress bar
- High-level KPIs only
- Cover title: "Executive Summary Dashboard"

### 2. GHG Protocol Corporate Standard (compliance-style)
- Cover: "GHG Protocol Corporate Standard Report"
- Detailed inventory tables for all 3 scopes with uncertainty and data quality columns
- Organizational boundary explanation section
- Emission factor sources table
- Expanded methodology section with calculation approach per scope
- Verification and assurance details
- No donut chart -- replaced with detailed breakdown tables
- Glossary focused on GHG Protocol terminology

### 3. CDP Climate Change Questionnaire (questionnaire-style)
- Cover: "CDP Climate Change Response"
- Structured as numbered sections matching CDP modules (C0-C12)
- Governance section (board oversight, management responsibility)
- Risks and Opportunities section with long-form text descriptions
- Targets and performance against targets
- Emissions data in CDP-specific format (base year, reporting year, methodology)
- Verification statement details
- No charts -- focus on text and tables

### 4. TCFD Financial Disclosure (disclosure-style)
- Cover: "TCFD Climate-Related Financial Disclosures"
- Four pillar structure: Governance, Strategy, Risk Management, Metrics & Targets
- Scenario analysis placeholder section
- Financial impact of climate risks (qualitative descriptions)
- Metrics table with current/target values
- Risk and opportunity register table

### 5. Scope 3 Detailed Analysis (data-heavy)
- Cover: "Scope 3 Value Chain Emissions Analysis"
- Category-by-category breakdown (all 15 Scope 3 categories)
- Horizontal bar chart for category comparison
- Hotspot identification table
- Data quality assessment per category
- Supplier engagement metrics (placeholder if no data)
- Reduction opportunities table
- No Scope 1/2 content -- purely Scope 3 focused

## Data Strategy

Each template renderer will use the existing `TemplateData` object but emphasize different parts:
- Executive: Totals, charts, progress
- GHG Protocol: All source tables, uncertainty, methodology
- CDP: Governance text, targets, verification
- TCFD: Risk/opportunity data, financial metrics
- Scope 3: Only `scope3Sources`, category breakdowns

The cover page title and subtitle are dynamically set from `template.title` (already passed but previously ignored for internal content structure).

## Files to Modify

| File | Changes |
|------|---------|
| `src/services/templateService.ts` | Refactor `generatePDFContent` into a dispatcher with 5 template-specific renderers |

No new files needed. No database changes. All rendering stays within `templateService.ts` using the existing `ProfessionalPDFGenerator` API.

## Technical Details

### Dispatcher Pattern

```typescript
const generatePDFContent = (template: Template, data: TemplateData): Blob => {
  switch (template.fileName) {
    case 'ghg_protocol_corporate_standard':
      return renderGHGProtocolPDF(template, data);
    case 'cdp_climate_change_questionnaire':
      return renderCDPQuestionnairePDF(template, data);
    case 'tcfd_financial_disclosure':
      return renderTCFDDisclosurePDF(template, data);
    case 'scope3_detailed_analysis':
      return renderScope3AnalysisPDF(template, data);
    case 'executive_summary_dashboard':
    default:
      return renderExecutiveSummaryPDF(template, data);
  }
};
```

### Shared Branding Setup

All renderers share the same branding initialization and finalization pattern to maintain visual consistency:

```typescript
const createPDF = (template: Template, data: TemplateData) => {
  const branding = {
    companyName: data.companyName,
    primaryColor: '#059669',
    secondaryColor: '#2563eb',
    headerText: 'Confidential',
    footerText: `Generated by BARYON`,
  };
  const pdf = new ProfessionalPDFGenerator(branding);
  pdf.createCoverPage(template.title, data.reportingPeriod, data.reportDate, data.verificationStatus);
  return pdf;
};
```

### CDP Section Structure

The CDP renderer will output sections labeled C0 through C7 matching the real CDP questionnaire modules:
- C0: Introduction (company info, reporting boundary)
- C1: Governance (board oversight description)
- C2: Risks and Opportunities (table of identified risks)
- C3: Business Strategy (targets and pathway)
- C4: Targets and Performance (progress metrics)
- C5: Emissions Methodology (calculation approach)
- C6: Emissions Data (scope tables)
- C7: Verification (assurance details)

### TCFD Four-Pillar Structure

- Governance: Board and management roles in climate oversight
- Strategy: Climate risks, opportunities, scenario analysis
- Risk Management: How climate risks are identified and managed
- Metrics and Targets: Current emissions, targets, progress tracking

