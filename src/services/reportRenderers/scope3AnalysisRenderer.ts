import { Template, TemplateData } from '../templateService';
import { createPDFWithCover, finalizePDF } from './shared';

// All 15 Scope 3 categories per GHG Protocol
const scope3Categories = [
  { num: 1, name: 'Purchased Goods & Services', description: 'Emissions from extraction, production, and transport of goods and services purchased.' },
  { num: 2, name: 'Capital Goods', description: 'Emissions from extraction, production, and transport of capital goods.' },
  { num: 3, name: 'Fuel & Energy Activities (not Scope 1/2)', description: 'Upstream emissions from purchased fuels and energy.' },
  { num: 4, name: 'Upstream Transportation & Distribution', description: 'Transportation and distribution of purchased products.' },
  { num: 5, name: 'Waste Generated in Operations', description: 'Disposal and treatment of waste generated in operations.' },
  { num: 6, name: 'Business Travel', description: 'Transportation of employees for business-related activities.' },
  { num: 7, name: 'Employee Commuting', description: 'Transportation of employees between homes and worksites.' },
  { num: 8, name: 'Upstream Leased Assets', description: 'Operation of assets leased by the organization.' },
  { num: 9, name: 'Downstream Transportation & Distribution', description: 'Transportation and distribution of sold products.' },
  { num: 10, name: 'Processing of Sold Products', description: 'Processing of intermediate products by third parties.' },
  { num: 11, name: 'Use of Sold Products', description: 'End-use of goods and services sold by the organization.' },
  { num: 12, name: 'End-of-Life Treatment of Sold Products', description: 'Waste disposal and treatment of products sold.' },
  { num: 13, name: 'Downstream Leased Assets', description: 'Operation of assets owned and leased to other entities.' },
  { num: 14, name: 'Franchises', description: 'Operation of franchises not included in Scope 1/2.' },
  { num: 15, name: 'Investments', description: 'Operation of investments not included in Scope 1/2.' },
];

/**
 * Renders a detailed Scope 3 value-chain analysis PDF.
 *
 * @description Maps emissions data to all 15 GHG Protocol Scope 3 categories,
 * identifies hotspots, assesses data quality per category, and recommends
 * targeted reduction strategies and supplier engagement actions.
 *
 * @param template - Template metadata
 * @param data     - Hydrated emissions & company data
 * @returns A Blob containing the generated PDF
 */
export const renderScope3AnalysisPDF = (template: Template, data: TemplateData): Blob => {
  const pdf = createPDFWithCover(template, data);

  // Executive Summary
  pdf.addSection('Executive Summary');
  pdf.addParagraph(`This report provides a detailed analysis of ${data.companyName}'s Scope 3 value chain emissions for the reporting period ${data.reportingPeriod}. Total Scope 3 emissions are estimated at ${data.scope3.toLocaleString()} tCO\u2082e, representing ${((data.scope3 / data.totalEmissions) * 100).toFixed(1)}% of the organization's total carbon footprint.`);
  pdf.addSpacing(3);
  pdf.addKeyValueSection([
    { label: 'Total Scope 3 Emissions', value: `${data.scope3.toLocaleString()} tCO\u2082e`, highlight: true },
    { label: 'Share of Total Footprint', value: `${((data.scope3 / data.totalEmissions) * 100).toFixed(1)}%`, highlight: false },
    { label: 'Categories Assessed', value: `${data.scope3Sources.length} of 15`, highlight: false },
    { label: 'Methodology', value: 'Activity-based + Spend-based (EEIO)', highlight: false },
  ]);

  // Category Breakdown – all 15 categories
  pdf.addPage();
  pdf.addSection('Scope 3 Category Breakdown');
  pdf.addParagraph('The following table presents emissions across all 15 GHG Protocol Scope 3 categories. Categories without available data are marked for future assessment.');

  // Map actual data to categories
  const categoryMap = new Map<string, number>();
  data.scope3Sources.forEach(s => {
    const existing = categoryMap.get(s.category) || 0;
    categoryMap.set(s.category, existing + s.emissions);
  });

  const categoryRows = scope3Categories.map(cat => {
    const emissions = categoryMap.get(cat.name) || 0;
    const relevance = emissions > 0 ? 'Assessed' : 'Not assessed';
    const quality = emissions > 0 ? 'Medium' : '–';
    return [
      `${cat.num}`,
      cat.name,
      emissions > 0 ? emissions.toLocaleString() : '–',
      relevance,
      quality,
    ];
  });

  pdf.addTable(
    ['#', 'Category', 'Emissions (tCO\u2082e)', 'Status', 'Data Quality'],
    categoryRows
  );

  // Bar Chart – assessed categories only
  const assessedCategories = scope3Categories
    .map(cat => ({ label: `Cat ${cat.num}: ${cat.name}`, value: categoryMap.get(cat.name) || 0 }))
    .filter(c => c.value > 0)
    .sort((a, b) => b.value - a.value);

  if (assessedCategories.length > 0) {
    pdf.addPage();
    pdf.addSection('Category Comparison');
    pdf.drawHorizontalBarChart(assessedCategories, pdf.getDoc().internal.pageSize.width * 0.08, pdf.getCurrentY(), pdf.getDoc().internal.pageSize.width * 0.84);
  }

  // Hotspot Identification
  pdf.addPage();
  pdf.addSection('Hotspot Identification');
  pdf.addParagraph('The following table identifies the highest-emitting categories and activities, prioritized for targeted reduction initiatives.');

  const hotspots = data.scope3Sources
    .map(s => ({
      category: s.category,
      activity: s.activity,
      emissions: s.emissions,
      share: ((s.emissions / data.scope3) * 100).toFixed(1),
      quality: s.dataQuality,
      priority: s.emissions > data.scope3 * 0.3 ? 'Critical' : s.emissions > data.scope3 * 0.1 ? 'High' : 'Medium',
    }))
    .sort((a, b) => b.emissions - a.emissions);

  pdf.addTable(
    ['Category', 'Activity', 'Emissions (tCO\u2082e)', 'Share', 'Quality', 'Priority'],
    hotspots.map(h => [h.category, h.activity, h.emissions.toLocaleString(), `${h.share}%`, h.quality, h.priority])
  );

  // Data Quality Assessment
  pdf.addSection('Data Quality Assessment');
  pdf.addParagraph('Data quality varies across Scope 3 categories depending on the availability of primary activity data versus secondary estimation methods.');
  pdf.addTable(
    ['Category', 'Method', 'Data Source', 'Quality', 'Uncertainty'],
    data.scope3Sources.map(s => [s.category, s.methodology, 'Internal records', s.dataQuality, `±${s.uncertainty}%`])
  );

  // Reduction Opportunities
  pdf.addPage();
  pdf.addSection('Reduction Opportunities');
  pdf.addParagraph('Based on the hotspot analysis, the following reduction strategies are recommended for the highest-impact categories.');
  pdf.addTable(
    ['Category', 'Strategy', 'Estimated Reduction', 'Timeframe', 'Investment Level'],
    [
      ['Business Travel', 'Virtual meetings policy, rail-first travel policy', '20-30%', '1-2 years', 'Low'],
      ['Employee Commuting', 'Remote work expansion, EV charging infrastructure', '15-25%', '2-3 years', 'Medium'],
      ['Purchased Goods', 'Supplier engagement program, low-carbon procurement criteria', '10-15%', '3-5 years', 'Medium'],
    ]
  );

  // Supplier Engagement
  pdf.addSection('Supplier Engagement');
  pdf.addParagraph('Effective Scope 3 reduction requires active engagement with value chain partners. The following metrics track supplier engagement progress.');
  pdf.addKeyValueSection([
    { label: 'Suppliers Assessed', value: 'Program in development', highlight: false },
    { label: 'Suppliers with SBTs', value: 'Assessment pending', highlight: false },
    { label: 'CDP Supply Chain Response Rate', value: 'To be measured', highlight: false },
    { label: 'Engagement Target', value: '70% of emissions-weighted suppliers by 2027', highlight: false },
  ]);

  // Methodology
  pdf.addMethodologySection([
    { name: 'Activity-Based Calculations', description: 'Primary activity data (e.g., travel records, fuel consumption) multiplied by category-specific emission factors from EPA, DEFRA, and IEA databases.' },
    { name: 'Spend-Based Estimation (EEIO)', description: 'For categories lacking primary data, spend-based estimation using Environmentally-Extended Input-Output factors mapped by NAICS codes and regional variations.' },
    { name: 'GHG Protocol Scope 3 Standard', description: 'All calculations follow the GHG Protocol Corporate Value Chain (Scope 3) Accounting and Reporting Standard.', source: 'ghgprotocol.org' },
  ]);

  pdf.addDeclarationSection(data.approvedBy, 'Authorized Signatory', data.reportDate);

  return finalizePDF(pdf);
};
