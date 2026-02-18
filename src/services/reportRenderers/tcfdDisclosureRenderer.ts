import { Template, TemplateData } from '../templateService';
import { createPDFWithCover, finalizePDF } from './shared';

/**
 * Renders a TCFD-aligned Climate Financial Disclosure PDF.
 *
 * @description Structures the report around the four TCFD pillars:
 * Governance, Strategy (including scenario analysis), Risk Management,
 * and Metrics & Targets.
 *
 * @param template - Template metadata
 * @param data     - Hydrated emissions & company data
 * @returns A Blob containing the generated PDF
 */
export const renderTCFDDisclosurePDF = (template: Template, data: TemplateData): Blob => {
  const pdf = createPDFWithCover(template, data);

  // Introduction
  pdf.addSection('Introduction');
  pdf.addParagraph(`This report presents ${data.companyName}'s climate-related financial disclosures in accordance with the recommendations of the Task Force on Climate-related Financial Disclosures (TCFD). The disclosures are structured around the four TCFD pillars: Governance, Strategy, Risk Management, and Metrics & Targets.`);
  pdf.addSpacing(5);

  // Pillar 1: Governance
  pdf.addSection('Pillar 1: Governance');
  pdf.addParagraph('a) Board oversight of climate-related risks and opportunities');
  pdf.addParagraph('The Board of Directors maintains oversight of climate-related issues through its Sustainability Committee, which meets quarterly. Climate risks are a standing agenda item at all Board meetings. The committee reviews emissions performance, regulatory developments, and the adequacy of climate risk management processes.');
  pdf.addSpacing(3);
  pdf.addParagraph('b) Management\'s role in assessing and managing climate-related risks');
  pdf.addParagraph(`The CEO holds ultimate accountability for climate strategy. Day-to-day management is delegated to ${data.reviewedBy}, who chairs a cross-functional Climate Risk Working Group. ${data.preparedBy} manages the emissions inventory and reporting processes. Climate-related performance metrics are linked to executive compensation.`);

  // Pillar 2: Strategy
  pdf.addPage();
  pdf.addSection('Pillar 2: Strategy');
  pdf.addParagraph('a) Climate-related risks and opportunities identified');
  pdf.addTable(
    ['Type', 'Category', 'Description', 'Time Horizon', 'Financial Impact'],
    [
      ['Risk', 'Transition – Policy', 'Carbon pricing and emissions trading requirements', 'Medium-term', 'Increased operating costs of 2-5% of revenue'],
      ['Risk', 'Physical – Acute', 'Extreme weather events disrupting operations and supply chain', 'Long-term', 'Potential revenue loss of 1-3% from disruptions'],
      ['Risk', 'Transition – Market', 'Changing customer preferences for low-carbon products', 'Short-term', 'Revenue shift requiring product adaptation'],
      ['Opportunity', 'Resource Efficiency', 'Energy efficiency and renewable energy adoption', 'Short-term', 'Cost savings of 5-10% on energy expenditure'],
      ['Opportunity', 'Products', 'Low-carbon product innovation', 'Medium-term', 'New revenue streams and market access'],
    ]
  );
  pdf.addSpacing(3);
  pdf.addParagraph('b) Scenario analysis');
  pdf.addParagraph('The organization has conducted climate scenario analysis using the following pathways to assess resilience of business strategy:');
  pdf.addTable(
    ['Scenario', 'Temperature Outcome', 'Key Assumptions', 'Business Impact'],
    [
      ['Net Zero 2050 (IEA)', '1.5°C', 'Aggressive carbon pricing, rapid technology deployment', 'Moderate transition risk; significant opportunity from early action'],
      ['Stated Policies (STEPS)', '2.5°C', 'Current policy trajectory maintained', 'Lower transition risk; higher physical risk exposure'],
      ['High Emissions', '>3°C', 'Limited climate action', 'Low transition risk; severe physical risk to operations and supply chain'],
    ]
  );

  // Pillar 3: Risk Management
  pdf.addPage();
  pdf.addSection('Pillar 3: Risk Management');
  pdf.addParagraph('a) Processes for identifying and assessing climate-related risks');
  pdf.addParagraph('Climate risks are identified through an annual risk assessment process that considers physical, transition, and liability risks across all operations. The assessment uses a combination of quantitative analysis (emissions data, financial modeling) and qualitative stakeholder engagement.');
  pdf.addSpacing(3);
  pdf.addParagraph('b) Processes for managing climate-related risks');
  pdf.addParagraph('Identified climate risks are integrated into the enterprise risk management (ERM) framework. Material risks are assigned to risk owners with defined mitigation plans and monitoring KPIs. The Climate Risk Working Group reviews risk registers quarterly and escalates material changes to the Board.');
  pdf.addSpacing(3);
  pdf.addParagraph('c) Integration into overall risk management');
  pdf.addParagraph('Climate-related risks are treated equivalently to other enterprise risks in terms of assessment methodology, escalation procedures, and reporting. The ERM framework has been updated to include climate-specific risk categories and impact criteria.');

  // Pillar 4: Metrics & Targets
  pdf.addPage();
  pdf.addSection('Pillar 4: Metrics and Targets');
  pdf.addParagraph('a) Metrics used to assess climate-related risks and opportunities');
  pdf.addTable(
    ['Metric', 'Current Value', 'Prior Year', 'Target'],
    [
      ['Total GHG Emissions (tCO\u2082e)', data.totalEmissions.toLocaleString(), data.previousYearTotal.toLocaleString(), `${data.targetReduction}% reduction by ${data.targetYear}`],
      ['Scope 1 Emissions (tCO\u2082e)', data.scope1.toLocaleString(), '–', '–'],
      ['Scope 2 Emissions (tCO\u2082e)', data.scope2.toLocaleString(), '–', '–'],
      ['Scope 3 Emissions (tCO\u2082e)', data.scope3.toLocaleString(), '–', '–'],
      ['Year-over-Year Change', `${data.yearOverYearChange}%`, '–', 'Continuous reduction'],
    ]
  );
  pdf.addSpacing(3);
  pdf.addParagraph('b) Targets and performance');
  pdf.addKeyValueSection([
    { label: 'Target Type', value: 'Absolute emissions reduction (SBTi-aligned)', highlight: false },
    { label: 'Base Year', value: 'Earliest verifiable reporting year', highlight: false },
    { label: 'Target Year', value: data.targetYear.toString(), highlight: false },
    { label: 'Target Reduction', value: `${data.targetReduction}%`, highlight: true },
    { label: 'Progress to Date', value: `${data.currentProgress}%`, highlight: true },
  ]);
  pdf.addSpacing(3);
  pdf.addParagraph(`The organization has achieved a ${data.currentProgress}% reduction against the ${data.targetReduction}% target. Key contributors include energy efficiency improvements, renewable energy procurement, and fleet electrification.`);

  // Verification
  pdf.addSection('Assurance Statement');
  pdf.addKeyValueSection([
    { label: 'Verification Body', value: data.verificationBody, highlight: false },
    { label: 'Assurance Level', value: data.assuranceLevel, highlight: false },
    { label: 'Applied Standards', value: data.standards.join(', '), highlight: false },
  ]);

  pdf.addDeclarationSection(data.approvedBy, 'Authorized Signatory', data.reportDate);

  return finalizePDF(pdf);
};
