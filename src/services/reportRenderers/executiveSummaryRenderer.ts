import { Template, TemplateData } from '../templateService';
import { createPDFWithCover, finalizePDF } from './shared';

/**
 * Renders an Executive Summary dashboard-style PDF.
 *
 * @description Produces a visually-oriented report with KPI metric cards,
 * a donut chart (emissions by scope), horizontal bar chart of top sources,
 * net-zero progress bar, carbon intensity metrics, verification details,
 * methodology notes, and a glossary.
 *
 * @param template - Template metadata
 * @param data     - Hydrated emissions & company data
 * @returns A Blob containing the generated PDF
 */
export const renderExecutiveSummaryPDF = (template: Template, data: TemplateData): Blob => {
  const pdf = createPDFWithCover(template, data);

  // Executive Summary
  pdf.addSection('Executive Summary');
  pdf.addParagraph(data.executiveSummary);
  pdf.addSpacing(5);

  // KPI Metrics Row
  const changeType = data.yearOverYearChange < 0 ? 'positive' : 'negative';
  pdf.addMetricsRow([
    { label: 'Total Emissions', value: data.totalEmissions.toLocaleString(), unit: 'tCO₂e', change: `${data.yearOverYearChange > 0 ? '+' : ''}${data.yearOverYearChange}% YoY`, changeType },
    { label: 'Scope 1 (Direct)', value: data.scope1.toLocaleString(), unit: 'tCO₂e' },
    { label: 'Scope 2 (Indirect)', value: data.scope2.toLocaleString(), unit: 'tCO₂e' },
    { label: 'Scope 3 (Value Chain)', value: data.scope3.toLocaleString(), unit: 'tCO₂e' },
  ]);

  // Donut Chart
  pdf.addSection('Emissions by Scope');
  pdf.drawDonutChart([
    { label: 'Scope 1', value: data.scope1, color: '#059669' },
    { label: 'Scope 2', value: data.scope2, color: '#2563eb' },
    { label: 'Scope 3', value: data.scope3, color: '#d97706' },
  ], 55, pdf.getCurrentY() + 35, 28);

  // Scope breakdown table
  pdf.addTable(
    ['Scope', 'Emissions (tCO₂e)', 'Percentage', 'Description'],
    [
      ['Scope 1', data.scope1.toLocaleString(), `${((data.scope1 / data.totalEmissions) * 100).toFixed(1)}%`, 'Direct emissions from owned sources'],
      ['Scope 2', data.scope2.toLocaleString(), `${((data.scope2 / data.totalEmissions) * 100).toFixed(1)}%`, 'Indirect emissions from purchased energy'],
      ['Scope 3', data.scope3.toLocaleString(), `${((data.scope3 / data.totalEmissions) * 100).toFixed(1)}%`, 'Other indirect emissions'],
      ['Total', data.totalEmissions.toLocaleString(), '100.0%', 'All scopes combined'],
    ]
  );

  // Bar Chart
  pdf.addSection('Detailed Emission Sources');
  const allSources = [
    ...data.scope1Sources.map(s => ({ label: s.category + ' - ' + s.subcategory, value: s.emissions })),
    ...data.scope2Sources.map(s => ({ label: s.category + ' - ' + s.subcategory, value: s.emissions })),
    ...data.scope3Sources.map(s => ({ label: s.category + ' - ' + s.subcategory, value: s.emissions })),
  ].sort((a, b) => b.value - a.value);

  pdf.drawHorizontalBarChart(allSources, pdf.getDoc().internal.pageSize.width * 0.08, pdf.getCurrentY(), pdf.getDoc().internal.pageSize.width * 0.84);

  // Net Zero Progress
  pdf.addSection('Path to Net Zero');
  pdf.addParagraph(`Current reduction: ${data.currentProgress}% toward the ${data.targetYear} target of ${data.targetReduction}%.`);
  pdf.drawProgressBar(data.currentProgress, data.targetReduction, `Reduction Progress (Target: ${data.targetReduction}% by ${data.targetYear})`);

  // Carbon Intensity
  pdf.addSection('Carbon Intensity Metrics');
  pdf.addKeyValueSection([
    { label: 'Total Annual Emissions', value: `${data.totalEmissions.toLocaleString()} tCO\u2082e`, highlight: true },
    { label: 'Previous Year', value: `${data.previousYearTotal.toLocaleString()} tCO\u2082e`, highlight: false },
  ]);
  pdf.addParagraph('Per-employee and per-revenue intensity metrics will be calculated when organizational headcount and revenue data are configured.');

  // Verification
  pdf.addSection('Verification & Assurance');
  pdf.addKeyValueSection([
    { label: 'Verification Body', value: data.verificationBody, highlight: false },
    { label: 'Assurance Level', value: data.assuranceLevel, highlight: false },
    { label: 'Applied Standards', value: data.standards.join(', '), highlight: false },
  ]);

  // Methodology
  pdf.addMethodologySection([
    { name: 'GHG Protocol Corporate Standard', description: 'All emissions have been calculated following the GHG Protocol Corporate Accounting and Reporting Standard.', source: 'ghgprotocol.org' },
    { name: 'Emission Factor Sources', description: 'Emission factors sourced from EPA (2024), UK DEFRA (2024), and IEA (2024).', source: 'EPA, DEFRA, IEA' },
  ]);

  // Glossary
  pdf.addGlossary([
    { term: 'tCO₂e', definition: 'Tonnes of carbon dioxide equivalent.' },
    { term: 'Scope 1', definition: 'Direct GHG emissions from owned or controlled sources.' },
    { term: 'Scope 2', definition: 'Indirect GHG emissions from purchased energy.' },
    { term: 'Scope 3', definition: 'All other indirect emissions in the value chain.' },
  ]);

  pdf.addDeclarationSection(data.approvedBy, 'Authorized Signatory', data.reportDate);

  return finalizePDF(pdf);
};
