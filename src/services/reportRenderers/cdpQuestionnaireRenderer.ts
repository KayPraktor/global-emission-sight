import { Template, TemplateData } from '../templateService';
import { createPDFWithCover, finalizePDF } from './shared';

export const renderCDPQuestionnairePDF = (template: Template, data: TemplateData): Blob => {
  const pdf = createPDFWithCover(template, data);

  // C0: Introduction
  pdf.addSection('C0. Introduction');
  pdf.addKeyValueSection([
    { label: 'Organization', value: data.companyName, highlight: true },
    { label: 'Reporting Period', value: data.reportingPeriod, highlight: false },
    { label: 'Reporting Boundary', value: data.reportingBoundary, highlight: false },
    { label: 'Country of Operations', value: 'Global', highlight: false },
    { label: 'Accounting Standard', value: 'GHG Protocol Corporate Standard', highlight: false },
  ]);
  pdf.addSpacing(3);

  // C1: Governance
  pdf.addSection('C1. Governance');
  pdf.addParagraph('C1.1 – Board-level oversight of climate-related issues');
  pdf.addParagraph('The Board of Directors has designated the Sustainability Committee to oversee climate-related risks and opportunities. The committee meets quarterly to review emissions performance, regulatory developments, and strategic climate initiatives. The CEO is ultimately accountable for climate strategy, with the Environmental Director reporting directly on progress toward emissions targets.');
  pdf.addSpacing(3);
  pdf.addParagraph('C1.2 – Management-level responsibility');
  pdf.addParagraph(`Climate-related responsibilities are embedded in the management structure. The Sustainability Manager (${data.preparedBy}) is responsible for day-to-day emissions data collection and reporting. The Environmental Director (${data.reviewedBy}) oversees methodology and verification processes.`);
  pdf.addSpacing(3);

  // C2: Risks and Opportunities
  pdf.addPage();
  pdf.addSection('C2. Risks and Opportunities');
  pdf.addParagraph('C2.1 – Climate-related risks identified');
  pdf.addTable(
    ['Risk Type', 'Description', 'Timeframe', 'Potential Impact'],
    [
      ['Regulatory', 'Increasing carbon pricing mechanisms in operating jurisdictions', 'Medium-term (3-5 years)', 'Increased operating costs'],
      ['Physical', 'Extreme weather events affecting supply chain and facilities', 'Long-term (5-10 years)', 'Business disruption'],
      ['Market', 'Shift in customer preferences toward low-carbon products', 'Short-term (1-3 years)', 'Revenue impact'],
      ['Reputational', 'Stakeholder expectations for transparent climate disclosure', 'Current', 'Brand value'],
    ]
  );
  pdf.addSpacing(3);
  pdf.addParagraph('C2.2 – Climate-related opportunities identified');
  pdf.addTable(
    ['Opportunity Type', 'Description', 'Timeframe', 'Potential Benefit'],
    [
      ['Resource Efficiency', 'Energy efficiency improvements across facilities', 'Short-term', 'Cost savings'],
      ['Products & Services', 'Development of low-carbon product offerings', 'Medium-term', 'Revenue growth'],
      ['Markets', 'Access to green financing and sustainability-linked bonds', 'Short-term', 'Reduced capital costs'],
    ]
  );

  // C3: Business Strategy
  pdf.addPage();
  pdf.addSection('C3. Business Strategy');
  pdf.addParagraph('C3.1 – How climate-related issues influence strategy');
  pdf.addParagraph('Climate considerations are integrated into the organization\'s strategic planning process. The company has set science-based targets aligned with limiting global warming to 1.5°C, and climate risk assessments are incorporated into capital allocation decisions.');
  pdf.addSpacing(3);
  pdf.addParagraph('C3.2 – Emissions reduction targets');
  pdf.addKeyValueSection([
    { label: 'Target Year', value: data.targetYear.toString(), highlight: false },
    { label: 'Target Reduction', value: `${data.targetReduction}% below base year`, highlight: true },
    { label: 'Current Progress', value: `${data.currentProgress}%`, highlight: false },
    { label: 'Target Type', value: 'Absolute reduction, SBTi-aligned', highlight: false },
  ]);

  // C4: Targets and Performance
  pdf.addSection('C4. Targets and Performance');
  pdf.addParagraph('C4.1 – Progress against emissions targets');
  pdf.addTable(
    ['Metric', 'Base Year', 'Current Year', 'Change'],
    [
      ['Total Emissions (tCO\u2082e)', data.previousYearTotal.toLocaleString(), data.totalEmissions.toLocaleString(), `${data.yearOverYearChange}%`],
      ['Scope 1 (tCO\u2082e)', '–', data.scope1.toLocaleString(), '–'],
      ['Scope 2 (tCO\u2082e)', '–', data.scope2.toLocaleString(), '–'],
      ['Scope 3 (tCO\u2082e)', '–', data.scope3.toLocaleString(), '–'],
    ]
  );

  // C5: Emissions Methodology
  pdf.addPage();
  pdf.addSection('C5. Emissions Methodology');
  pdf.addParagraph('C5.1 – Accounting methodology');
  pdf.addParagraph(data.methodology);
  pdf.addSpacing(3);
  pdf.addParagraph('C5.2 – Base year and recalculation policy');
  pdf.addParagraph('The base year is the earliest year for which verifiable data is available. Recalculations are triggered by structural changes exceeding 5% of total emissions, methodology changes, or error corrections.');

  // C6: Emissions Data
  pdf.addSection('C6. Emissions Data');
  pdf.addParagraph('C6.1 – Scope 1 emissions breakdown');
  pdf.addTable(
    ['Category', 'Activity', 'Emissions (tCO\u2082e)', 'Methodology', 'Data Quality'],
    data.scope1Sources.map(s => [s.category, s.activity, s.emissions.toLocaleString(), s.methodology, s.dataQuality])
  );
  pdf.addSpacing(3);
  pdf.addParagraph('C6.2 – Scope 2 emissions breakdown');
  pdf.addTable(
    ['Category', 'Activity', 'Emissions (tCO\u2082e)', 'Methodology', 'Data Quality'],
    data.scope2Sources.map(s => [s.category, s.activity, s.emissions.toLocaleString(), s.methodology, s.dataQuality])
  );
  pdf.addSpacing(3);
  pdf.addParagraph('C6.3 – Scope 3 emissions breakdown');
  pdf.addTable(
    ['Category', 'Activity', 'Emissions (tCO\u2082e)', 'Methodology', 'Data Quality'],
    data.scope3Sources.map(s => [s.category, s.activity, s.emissions.toLocaleString(), s.methodology, s.dataQuality])
  );

  // C7: Verification
  pdf.addPage();
  pdf.addSection('C7. Verification');
  pdf.addParagraph('C7.1 – Third-party verification details');
  pdf.addKeyValueSection([
    { label: 'Verification Body', value: data.verificationBody, highlight: false },
    { label: 'Assurance Level', value: data.assuranceLevel, highlight: false },
    { label: 'Scopes Verified', value: 'Scope 1, Scope 2', highlight: false },
    { label: 'Verification Standard', value: 'ISO 14064-3:2019', highlight: false },
    { label: 'Verification Statement', value: 'Available upon request', highlight: false },
  ]);
  pdf.addSpacing(3);
  pdf.addParagraph('The verification process included review of data collection procedures, emission factor selection, calculation methodologies, and internal quality assurance processes. No material misstatements were identified.');

  pdf.addDeclarationSection(data.approvedBy, 'Authorized Signatory', data.reportDate);

  return finalizePDF(pdf);
};
