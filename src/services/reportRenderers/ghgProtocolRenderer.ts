import { Template, TemplateData } from '../templateService';
import { createPDFWithCover, finalizePDF } from './shared';

/**
 * Renders a GHG Protocol Corporate Standard–compliant PDF report.
 *
 * @description Produces a multi-section document covering executive summary,
 * organizational boundary, full Scope 1/2/3 inventory tables, monthly trend,
 * emission-factor sources, methodology notes, verification, glossary, and
 * declaration of accuracy.
 *
 * @param template - Template metadata (title, fileName, etc.)
 * @param data     - Hydrated emissions & company data
 * @returns A Blob containing the generated PDF
 */
export const renderGHGProtocolPDF = (template: Template, data: TemplateData): Blob => {
  const pdf = createPDFWithCover(template, data);

  // 1. Executive Summary
  pdf.addSection('1. Executive Summary');
  pdf.addParagraph(data.executiveSummary);
  pdf.addSpacing(5);

  // 2. Organizational Boundary
  pdf.addSection('2. Organizational Boundary');
  pdf.addParagraph(`This report uses the ${data.reportingBoundary} approach to define the organizational boundary. All facilities and operations under ${data.reportingBoundary.toLowerCase()} are included in the inventory.`);
  pdf.addParagraph('The consolidation approach has been applied consistently across all reporting entities. No structural changes occurred during the reporting period that would affect comparability with prior periods.');
  pdf.addSpacing(3);

  // 3. Emissions Inventory Summary
  pdf.addSection('3. GHG Emissions Inventory Summary');
  pdf.addTable(
    ['Scope', 'Emissions (tCO\u2082e)', 'Percentage', 'Change vs. Prior Year'],
    [
      ['Scope 1 – Direct', data.scope1.toLocaleString(), `${((data.scope1 / data.totalEmissions) * 100).toFixed(1)}%`, `${data.yearOverYearChange > 0 ? '+' : ''}${data.yearOverYearChange}%`],
      ['Scope 2 – Indirect (Energy)', data.scope2.toLocaleString(), `${((data.scope2 / data.totalEmissions) * 100).toFixed(1)}%`, '–'],
      ['Scope 3 – Value Chain', data.scope3.toLocaleString(), `${((data.scope3 / data.totalEmissions) * 100).toFixed(1)}%`, '–'],
      ['Total GHG Emissions', data.totalEmissions.toLocaleString(), '100.0%', `${data.yearOverYearChange}%`],
    ]
  );

  // 4. Scope 1 Detailed Inventory
  pdf.addPage();
  pdf.addSection('4. Scope 1 – Direct Emissions');
  pdf.addParagraph('Direct GHG emissions from sources owned or controlled by the organization, including stationary combustion, mobile combustion, and fugitive emissions.');
  pdf.addTable(
    ['Category', 'Subcategory', 'Activity', 'Quantity', 'Unit', 'EF', 'Emissions (tCO\u2082e)', 'Quality', '±%'],
    data.scope1Sources.map(s => [
      s.category, s.subcategory, s.activity,
      s.quantity.toLocaleString(), s.unit,
      s.emissionFactor.toString(), s.emissions.toLocaleString(),
      s.dataQuality, `${s.uncertainty}%`
    ])
  );

  // 5. Scope 2 Detailed Inventory
  pdf.addSection('5. Scope 2 – Indirect Emissions from Energy');
  pdf.addParagraph('Indirect GHG emissions from the generation of purchased or acquired electricity, steam, heating, and cooling consumed by the organization.');
  pdf.addTable(
    ['Category', 'Subcategory', 'Activity', 'Quantity', 'Unit', 'EF', 'Emissions (tCO\u2082e)', 'Quality', '±%'],
    data.scope2Sources.map(s => [
      s.category, s.subcategory, s.activity,
      s.quantity.toLocaleString(), s.unit,
      s.emissionFactor.toString(), s.emissions.toLocaleString(),
      s.dataQuality, `${s.uncertainty}%`
    ])
  );

  // 6. Scope 3 Detailed Inventory
  pdf.addSection('6. Scope 3 – Other Indirect Emissions');
  pdf.addParagraph('All other indirect emissions that occur in the value chain, including both upstream and downstream activities.');
  pdf.addTable(
    ['Category', 'Subcategory', 'Activity', 'Quantity', 'Unit', 'EF', 'Emissions (tCO\u2082e)', 'Quality', '±%'],
    data.scope3Sources.map(s => [
      s.category, s.subcategory, s.activity,
      s.quantity.toLocaleString(), s.unit,
      s.emissionFactor.toString(), s.emissions.toLocaleString(),
      s.dataQuality, `${s.uncertainty}%`
    ])
  );

  // 7. Monthly Trend
  pdf.addPage();
  pdf.addSection('7. Monthly Emissions Trend');
  pdf.addTable(
    ['Month', 'Scope 1 (tCO\u2082e)', 'Scope 2 (tCO\u2082e)', 'Scope 3 (tCO\u2082e)', 'Total (tCO\u2082e)'],
    data.monthlyData.map(m => [m.month, m.scope1.toLocaleString(), m.scope2.toLocaleString(), m.scope3.toLocaleString(), m.total.toLocaleString()])
  );

  // 8. Emission Factor Sources
  pdf.addSection('8. Emission Factor Sources');
  pdf.addTable(
    ['Source', 'Version', 'Scope Applied', 'Region'],
    [
      ['EPA Emission Factors Hub', '2024', 'Scope 1, 3', 'United States'],
      ['UK DEFRA Conversion Factors', '2024', 'Scope 1, 2, 3', 'United Kingdom / Global'],
      ['IEA Electricity Emission Factors', '2024', 'Scope 2', 'Country-specific'],
    ]
  );

  // 9. Methodology
  pdf.addSection('9. Calculation Methodology');
  pdf.addMethodologySection([
    { name: 'GHG Protocol Corporate Standard', description: 'All calculations follow the GHG Protocol Corporate Accounting and Reporting Standard (Revised Edition). The operational control consolidation approach is used.', source: 'ghgprotocol.org' },
    { name: 'Scope 1 Approach', description: 'Direct measurement of fuel consumption with EPA emission factors. Fugitive emissions estimated from equipment service logs using GWP values from IPCC AR6.' },
    { name: 'Scope 2 Approach', description: 'Location-based method using IEA grid emission factors. Market-based calculations available upon request using supplier-specific factors and RECs.' },
    { name: 'Scope 3 Approach', description: 'Activity-based calculations for business travel and employee commuting. Spend-based estimation using EEIO factors for remaining categories.' },
    { name: 'Data Quality Assessment', description: 'Data quality scored as High/Medium/Low based on measurement method, temporal correlation, and geographic relevance. Uncertainty calculated using IPCC Tier 1 error propagation.' },
  ]);

  // 10. Verification
  pdf.addSection('10. Verification & Assurance');
  pdf.addKeyValueSection([
    { label: 'Verification Body', value: data.verificationBody, highlight: false },
    { label: 'Assurance Level', value: data.assuranceLevel, highlight: false },
    { label: 'Verification Standard', value: 'ISO 14064-3:2019', highlight: false },
    { label: 'Materiality Threshold', value: '5% of total reported emissions', highlight: false },
    { label: 'Applied Standards', value: data.standards.join(', '), highlight: false },
  ]);

  // Glossary
  pdf.addGlossary([
    { term: 'tCO₂e', definition: 'Tonnes of carbon dioxide equivalent – standardized unit for measuring carbon footprint across different greenhouse gases using Global Warming Potentials.' },
    { term: 'GHG Protocol', definition: 'The Greenhouse Gas Protocol – the most widely used international accounting standard for quantifying greenhouse gas emissions.' },
    { term: 'Scope 1', definition: 'Direct GHG emissions from sources owned or controlled by the reporting company.' },
    { term: 'Scope 2', definition: 'Indirect GHG emissions from the generation of purchased energy consumed by the reporting company.' },
    { term: 'Scope 3', definition: 'All other indirect emissions in the value chain, both upstream and downstream.' },
    { term: 'GWP', definition: 'Global Warming Potential – a measure of how much heat a greenhouse gas traps in the atmosphere relative to CO₂ over a specified time period.' },
    { term: 'Operational Control', definition: 'A consolidation approach where an organization reports 100% of emissions from operations over which it has operational control.' },
    { term: 'Location-based Method', definition: 'A Scope 2 calculation method reflecting the average emissions intensity of the local grid.' },
    { term: 'EEIO', definition: 'Environmentally-Extended Input-Output – an economic model used to estimate emissions from financial spend data.' },
  ]);

  pdf.addDeclarationSection(data.approvedBy, 'Authorized Signatory', data.reportDate);

  return finalizePDF(pdf);
};
