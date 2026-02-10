
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } from 'docx';
import { ProfessionalPDFGenerator } from './professionalPDFGenerator';
import { renderExecutiveSummaryPDF } from './reportRenderers/executiveSummaryRenderer';
import { renderGHGProtocolPDF } from './reportRenderers/ghgProtocolRenderer';
import { renderCDPQuestionnairePDF } from './reportRenderers/cdpQuestionnaireRenderer';
import { renderTCFDDisclosurePDF } from './reportRenderers/tcfdDisclosureRenderer';
import { renderScope3AnalysisPDF } from './reportRenderers/scope3AnalysisRenderer';

export interface EmissionSource {
  category: string;
  subcategory: string;
  activity: string;
  quantity: number;
  unit: string;
  emissionFactor: number;
  emissions: number;
  methodology: string;
  dataQuality: 'High' | 'Medium' | 'Low';
  uncertainty: number;
}

export interface MonthlyData {
  month: string;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

export interface TemplateData {
  companyName: string;
  reportingPeriod: string;
  totalEmissions: number;
  scope1: number;
  scope2: number;
  scope3: number;
  reportingBoundary: string;
  verificationStatus: string;
  
  // Enhanced data
  executiveSummary: string;
  methodology: string;
  targetYear: number;
  targetReduction: number;
  currentProgress: number;
  previousYearTotal: number;
  yearOverYearChange: number;
  
  // Detailed breakdowns
  scope1Sources: EmissionSource[];
  scope2Sources: EmissionSource[];
  scope3Sources: EmissionSource[];
  
  // Monthly data
  monthlyData: MonthlyData[];
  
  // Compliance and verification
  standards: string[];
  verificationBody: string;
  assuranceLevel: string;
  
  // Additional metadata
  reportDate: string;
  preparedBy: string;
  reviewedBy: string;
  approvedBy: string;
}

export interface Template {
  id: number;
  title: string;
  description: string;
  categories: string[];
  tags: string[];
  lastUpdated: string;
  format: string;
  popularity: string;
  previewImage: string;
  fileName: string;
  available: boolean;
}

// Mock data for templates - in a real app this would come from your emissions data
const getMockTemplateData = (): TemplateData => ({
  companyName: 'ACME Corporation',
  reportingPeriod: 'January 1, 2024 - December 31, 2024',
  totalEmissions: 12450,
  scope1: 3820,
  scope2: 5230,
  scope3: 3400,
  reportingBoundary: 'Operational Control',
  verificationStatus: 'Third-Party Verified',
  
  executiveSummary: 'ACME Corporation has successfully measured and reported greenhouse gas emissions totaling 12,450 tCO₂e for the 2024 reporting period. This represents a 12% reduction from the previous year baseline of 14,148 tCO₂e, demonstrating significant progress toward our 2030 net-zero commitment.',
  
  methodology: 'All calculations follow the GHG Protocol Corporate Accounting and Reporting Standard. Emission factors are sourced from EPA 2024 guidelines, UK DEFRA 2024, and IEA 2024 electricity emission factors. Financial control operational boundary applied consistently across all facilities.',
  
  targetYear: 2030,
  targetReduction: 50,
  currentProgress: 24,
  previousYearTotal: 14148,
  yearOverYearChange: -12.0,
  
  scope1Sources: [
    {
      category: 'Stationary Combustion',
      subcategory: 'Natural Gas',
      activity: 'Office Heating',
      quantity: 15420,
      unit: 'MMBtu',
      emissionFactor: 0.0531,
      emissions: 818,
      methodology: 'Direct measurement',
      dataQuality: 'High',
      uncertainty: 5
    },
    {
      category: 'Mobile Combustion',
      subcategory: 'Fleet Vehicles',
      activity: 'Company Cars',
      quantity: 125000,
      unit: 'miles',
      emissionFactor: 0.000404,
      emissions: 2102,
      methodology: 'Fuel consumption records',
      dataQuality: 'Medium',
      uncertainty: 10
    },
    {
      category: 'Fugitive Emissions',
      subcategory: 'Refrigerants',
      activity: 'HVAC Systems',
      quantity: 2.5,
      unit: 'kg R-134a',
      emissionFactor: 1430,
      emissions: 900,
      methodology: 'Equipment logs',
      dataQuality: 'High',
      uncertainty: 8
    }
  ],
  
  scope2Sources: [
    {
      category: 'Purchased Electricity',
      subcategory: 'Grid Electricity',
      activity: 'Office Operations',
      quantity: 2840000,
      unit: 'kWh',
      emissionFactor: 0.000855,
      emissions: 4280,
      methodology: 'Utility bills - location-based',
      dataQuality: 'High',
      uncertainty: 2
    },
    {
      category: 'Purchased Heat',
      subcategory: 'District Heating',
      activity: 'Building Heating',
      quantity: 1250,
      unit: 'MWh',
      emissionFactor: 0.285,
      emissions: 950,
      methodology: 'Supplier-specific factors',
      dataQuality: 'Medium',
      uncertainty: 15
    }
  ],
  
  scope3Sources: [
    {
      category: 'Business Travel',
      subcategory: 'Air Travel',
      activity: 'Domestic Flights',
      quantity: 145000,
      unit: 'passenger-miles',
      emissionFactor: 0.000188,
      emissions: 1650,
      methodology: 'Travel agency data',
      dataQuality: 'Medium',
      uncertainty: 20
    },
    {
      category: 'Employee Commuting',
      subcategory: 'Daily Commute',
      activity: 'Staff Transportation',
      quantity: 520000,
      unit: 'miles',
      emissionFactor: 0.000404,
      emissions: 1750,
      methodology: 'Employee survey',
      dataQuality: 'Low',
      uncertainty: 30
    }
  ],
  
  monthlyData: [
    { month: 'Jan', scope1: 420, scope2: 580, scope3: 280, total: 1280 },
    { month: 'Feb', scope1: 380, scope2: 520, scope3: 260, total: 1160 },
    { month: 'Mar', scope1: 310, scope2: 450, scope3: 290, total: 1050 },
    { month: 'Apr', scope1: 285, scope2: 410, scope3: 310, total: 1005 },
    { month: 'May', scope1: 290, scope2: 420, scope3: 285, total: 995 },
    { month: 'Jun', scope1: 275, scope2: 480, scope3: 295, total: 1050 },
    { month: 'Jul', scope1: 260, scope2: 520, scope3: 305, total: 1085 },
    { month: 'Aug', scope1: 270, scope2: 510, scope3: 290, total: 1070 },
    { month: 'Sep', scope1: 295, scope2: 445, scope3: 285, total: 1025 },
    { month: 'Oct', scope1: 315, scope2: 425, scope3: 275, total: 1015 },
    { month: 'Nov', scope1: 355, scope2: 405, scope3: 265, total: 1025 },
    { month: 'Dec', scope1: 365, scope2: 445, scope3: 260, total: 1070 }
  ],
  
  standards: ['GHG Protocol Corporate Standard', 'ISO 14064-1:2018', 'SBTi Net-Zero Standard'],
  verificationBody: 'EcoAudit Solutions Ltd.',
  assuranceLevel: 'Limited Assurance',
  
  reportDate: new Date().toLocaleDateString(),
  preparedBy: 'Sarah Johnson, Sustainability Manager',
  reviewedBy: 'Dr. Michael Chen, Environmental Director',
  approvedBy: 'Jennifer Martinez, CEO'
});

export const downloadTemplate = async (template: Template, format?: string): Promise<void> => {
  try {
    if (!template.available) {
      toast.error('This template is not currently available');
      return;
    }

    const templateData = getMockTemplateData();
    const selectedFormat = format || template.format.split(',')[0].trim();
    
    // Create the file content based on the template type and format
    let fileContent: string;
    let fileName: string;
    let mimeType: string;

    let blob: Blob;

    switch (selectedFormat.toLowerCase()) {
      case 'excel':
        blob = await generateExcelContent(template, templateData);
        fileName = `${template.fileName}.xlsx`;
        break;
      case 'pdf':
        blob = generatePDFContent(template, templateData);
        fileName = `${template.fileName}.pdf`;
        break;
      case 'word':
        blob = await generateWordContent(template, templateData);
        fileName = `${template.fileName}.docx`;
        break;
      default:
        blob = generateTextContent(template, templateData);
        fileName = `${template.fileName}.txt`;
    }

    // Create and download the file
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Template "${template.title}" downloaded successfully as ${selectedFormat}`);
  } catch (error) {
    console.error('Download error:', error);
    toast.error('Failed to download template. Please try again.');
  }
};

const generateExcelContent = async (template: Template, data: TemplateData): Promise<Blob> => {
  const wb = XLSX.utils.book_new();
  
  // Summary Sheet
  const summaryData = [
    [template.title],
    [],
    ['Company Information'],
    ['Company Name', data.companyName],
    ['Reporting Period', data.reportingPeriod],
    ['Reporting Boundary', data.reportingBoundary],
    ['Verification Status', data.verificationStatus],
    [],
    ['Emissions Summary'],
    ['Scope', 'Emissions (tCO₂e)', 'Percentage'],
    ['Total', data.totalEmissions, '100%'],
    ['Scope 1', data.scope1, `${((data.scope1 / data.totalEmissions) * 100).toFixed(1)}%`],
    ['Scope 2', data.scope2, `${((data.scope2 / data.totalEmissions) * 100).toFixed(1)}%`],
    ['Scope 3', data.scope3, `${((data.scope3 / data.totalEmissions) * 100).toFixed(1)}%`],
    [],
    ['Performance'],
    ['Previous Year Total', data.previousYearTotal],
    ['Year-over-Year Change', `${data.yearOverYearChange}%`],
    ['Target Reduction by', `${data.targetYear}`],
    ['Current Progress', `${data.currentProgress}%`]
  ];
  
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, 'Summary');
  
  // Monthly Data Sheet
  const monthlyHeaders = ['Month', 'Scope 1', 'Scope 2', 'Scope 3', 'Total'];
  const monthlyRows = data.monthlyData.map(month => [
    month.month, month.scope1, month.scope2, month.scope3, month.total
  ]);
  const monthlyData = [monthlyHeaders, ...monthlyRows];
  
  const monthlyWs = XLSX.utils.aoa_to_sheet(monthlyData);
  XLSX.utils.book_append_sheet(wb, monthlyWs, 'Monthly Data');
  
  // Detailed Sources Sheet
  const sourcesHeaders = ['Scope', 'Category', 'Subcategory', 'Activity', 'Quantity', 'Unit', 'Emission Factor', 'Emissions (tCO₂e)', 'Data Quality', 'Uncertainty %'];
  const sourcesRows = [
    ...data.scope1Sources.map(s => ['Scope 1', s.category, s.subcategory, s.activity, s.quantity, s.unit, s.emissionFactor, s.emissions, s.dataQuality, s.uncertainty]),
    ...data.scope2Sources.map(s => ['Scope 2', s.category, s.subcategory, s.activity, s.quantity, s.unit, s.emissionFactor, s.emissions, s.dataQuality, s.uncertainty]),
    ...data.scope3Sources.map(s => ['Scope 3', s.category, s.subcategory, s.activity, s.quantity, s.unit, s.emissionFactor, s.emissions, s.dataQuality, s.uncertainty])
  ];
  const sourcesData = [sourcesHeaders, ...sourcesRows];
  
  const sourcesWs = XLSX.utils.aoa_to_sheet(sourcesData);
  XLSX.utils.book_append_sheet(wb, sourcesWs, 'Detailed Sources');
  
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};

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

const generateWordContent = async (template: Template, data: TemplateData): Promise<Blob> => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: template.title,
          heading: HeadingLevel.TITLE,
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: 'Executive Summary',
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          text: data.executiveSummary,
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: 'Company Information',
          heading: HeadingLevel.HEADING_1,
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Company Name: ', bold: true }),
            new TextRun(data.companyName),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Reporting Period: ', bold: true }),
            new TextRun(data.reportingPeriod),
          ],
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'Total Emissions: ', bold: true }),
            new TextRun(`${data.totalEmissions.toLocaleString()} tCO₂e`),
          ],
        }),
        new Paragraph({
          text: '',
        }),
        new Paragraph({
          text: 'Emissions Breakdown',
          heading: HeadingLevel.HEADING_1,
        }),
        new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Scope')] }),
                new TableCell({ children: [new Paragraph('Emissions (tCO₂e)')] }),
                new TableCell({ children: [new Paragraph('Percentage')] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Scope 1')] }),
                new TableCell({ children: [new Paragraph(data.scope1.toString())] }),
                new TableCell({ children: [new Paragraph(`${((data.scope1 / data.totalEmissions) * 100).toFixed(1)}%`)] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Scope 2')] }),
                new TableCell({ children: [new Paragraph(data.scope2.toString())] }),
                new TableCell({ children: [new Paragraph(`${((data.scope2 / data.totalEmissions) * 100).toFixed(1)}%`)] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph('Scope 3')] }),
                new TableCell({ children: [new Paragraph(data.scope3.toString())] }),
                new TableCell({ children: [new Paragraph(`${((data.scope3 / data.totalEmissions) * 100).toFixed(1)}%`)] }),
              ],
            }),
          ],
        }),
      ],
    }],
  });

  const buffer = await Packer.toBlob(doc);
  return buffer;
};

const generateTextContent = (template: Template, data: TemplateData): Blob => {
  const textContent = `${template.title}

EXECUTIVE SUMMARY
${data.executiveSummary}

COMPANY INFORMATION
Company: ${data.companyName}
Reporting Period: ${data.reportingPeriod}
Reporting Boundary: ${data.reportingBoundary}
Verification Status: ${data.verificationStatus}

EMISSIONS SUMMARY
Total GHG Emissions: ${data.totalEmissions.toLocaleString()} tCO₂e

Scope 1: ${data.scope1.toLocaleString()} tCO₂e (${((data.scope1 / data.totalEmissions) * 100).toFixed(1)}%)
Scope 2: ${data.scope2.toLocaleString()} tCO₂e (${((data.scope2 / data.totalEmissions) * 100).toFixed(1)}%)
Scope 3: ${data.scope3.toLocaleString()} tCO₂e (${((data.scope3 / data.totalEmissions) * 100).toFixed(1)}%)

PERFORMANCE METRICS
Previous Year Total: ${data.previousYearTotal.toLocaleString()} tCO₂e
Year-over-Year Change: ${data.yearOverYearChange}%
Target Year: ${data.targetYear}
Current Progress: ${data.currentProgress}%

METHODOLOGY
${data.methodology}

STANDARDS APPLIED
${data.standards.join('\n')}

VERIFICATION
Verification Body: ${data.verificationBody}
Assurance Level: ${data.assuranceLevel}

Generated on: ${data.reportDate}
Prepared by: ${data.preparedBy}
Reviewed by: ${data.reviewedBy}
Approved by: ${data.approvedBy}`;

  return new Blob([textContent], { type: 'text/plain' });
};

export const generateReport = async (template: Template): Promise<void> => {
  try {
    toast.loading('Generating report...', { id: 'generate-report' });
    
    // Simulate report generation time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const templateData = getMockTemplateData();
    const reportBlob = generatePDFContent(template, templateData);
    
    // Create and download the generated report
    const url = URL.createObjectURL(reportBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.fileName}_generated_report.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Report generated and downloaded successfully!', { id: 'generate-report' });
  } catch (error) {
    console.error('Report generation error:', error);
    toast.error('Failed to generate report. Please try again.', { id: 'generate-report' });
  }
};

export const duplicateTemplate = (template: Template): void => {
  try {
    // In a real implementation, this would create a copy of the template in your database
    const duplicatedTemplate = {
      ...template,
      id: template.id + 1000, // Simple way to create a unique ID
      title: `${template.title} (Copy)`,
      fileName: `${template.fileName}_copy`
    };
    
    // For now, we'll just show a success message
    toast.success(`Template "${template.title}" duplicated successfully`);
    console.log('Duplicated template:', duplicatedTemplate);
  } catch (error) {
    console.error('Duplication error:', error);
    toast.error('Failed to duplicate template. Please try again.');
  }
};
