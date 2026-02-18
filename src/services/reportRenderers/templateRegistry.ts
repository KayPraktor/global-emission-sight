/**
 * @file Template Registry
 * @description Declarative mapping of template `fileName` identifiers to their
 * PDF renderer functions. Used by `generatePDFContent()` in `templateService.ts`
 * to dispatch rendering without a switch statement.
 *
 * ## How to register a new template
 * 1. Create a renderer file under `src/services/reportRenderers/` that exports
 *    a function matching the {@link TemplateRenderer} signature.
 * 2. Import it here and add an entry to {@link templateRegistry}.
 * 3. That's it — `generatePDFContent()` will pick it up automatically.
 *
 * @example
 * ```ts
 * import { renderMyNewPDF } from './myNewRenderer';
 *
 * // Add to the registry:
 * templateRegistry['my_new_template'] = {
 *   renderer: renderMyNewPDF,
 *   label: 'My New Report',
 * };
 * ```
 */

import type { Template, TemplateData } from '../templateService';
import { renderGHGProtocolPDF } from './ghgProtocolRenderer';
import { renderCDPQuestionnairePDF } from './cdpQuestionnaireRenderer';
import { renderTCFDDisclosurePDF } from './tcfdDisclosureRenderer';
import { renderScope3AnalysisPDF } from './scope3AnalysisRenderer';
import { renderExecutiveSummaryPDF } from './executiveSummaryRenderer';

/**
 * Signature every PDF renderer must implement.
 * @param template - Template metadata (title, fileName, etc.)
 * @param data     - Fetched emissions & company data used to populate the report
 * @returns A Blob containing the generated PDF
 */
export type TemplateRenderer = (template: Template, data: TemplateData) => Blob;

export interface RegistryEntry {
  /** The renderer function that produces a PDF Blob */
  renderer: TemplateRenderer;
  /** Human-readable label for UI display */
  label: string;
}

/**
 * Central registry mapping template `fileName` → renderer + label.
 * The key must match the `fileName` property of the {@link Template} object.
 */
export const templateRegistry: Record<string, RegistryEntry> = {
  ghg_protocol_corporate_standard: {
    renderer: renderGHGProtocolPDF,
    label: 'GHG Protocol Corporate Standard',
  },
  cdp_climate_change_questionnaire: {
    renderer: renderCDPQuestionnairePDF,
    label: 'CDP Climate Change Questionnaire',
  },
  tcfd_financial_disclosure: {
    renderer: renderTCFDDisclosurePDF,
    label: 'TCFD Financial Disclosure',
  },
  scope3_detailed_analysis: {
    renderer: renderScope3AnalysisPDF,
    label: 'Scope 3 Detailed Analysis',
  },
  executive_summary_dashboard: {
    renderer: renderExecutiveSummaryPDF,
    label: 'Executive Summary Dashboard',
  },
};

/**
 * Default renderer used when no registry entry matches.
 */
export const defaultRenderer: RegistryEntry = {
  renderer: renderExecutiveSummaryPDF,
  label: 'Executive Summary (default)',
};
