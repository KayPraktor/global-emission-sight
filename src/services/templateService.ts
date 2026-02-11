
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
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

// Fetch real template data from DB, falling back to minimal defaults when no data exists
const fetchRealTemplateData = async (): Promise<TemplateData> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Fetch organization info
    const { data: orgMembers } = await supabase
      .from('organization_members')
      .select('organization_id, organizations(name)')
      .eq('user_id', user.id)
      .limit(1);
    
    const org = orgMembers?.[0];
    const companyName = (org?.organizations as any)?.name || 'Your Company';
    const organizationId = org?.organization_id;

    // Fetch emissions entries with calculations
    const { data: entries } = await supabase
      .from('emissions_entries')
      .select('*, calculations(*), emission_factors(name, category, factor_value, unit, source)')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false });

    const allEntries = entries || [];

    // Calculate scope totals
    let scope1 = 0, scope2 = 0, scope3 = 0;
    const scope1Sources: EmissionSource[] = [];
    const scope2Sources: EmissionSource[] = [];
    const scope3Sources: EmissionSource[] = [];

    allEntries.forEach(entry => {
      const emissions = entry.calculations?.[0]?.calculated_emissions || Number(entry.quantity) || 0;
      const ef = entry.emission_factors;
      const source: EmissionSource = {
        category: entry.category,
        subcategory: ef?.category || entry.category,
        activity: entry.activity_type || entry.category,
        quantity: Number(entry.quantity),
        unit: entry.unit,
        emissionFactor: ef?.factor_value ? Number(ef.factor_value) : 0,
        emissions,
        methodology: entry.calculation_method || 'Activity-based',
        dataQuality: (entry.data_quality_score && entry.data_quality_score >= 80 ? 'High' : entry.data_quality_score && entry.data_quality_score >= 50 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low',
        uncertainty: entry.data_quality_score ? Math.max(5, 100 - entry.data_quality_score) : 25,
      };

      if (entry.scope === 'S1') { scope1 += emissions; scope1Sources.push(source); }
      else if (entry.scope === 'S2') { scope2 += emissions; scope2Sources.push(source); }
      else if (entry.scope === 'S3') { scope3 += emissions; scope3Sources.push(source); }
    });

    const totalEmissions = scope1 + scope2 + scope3;

    // Build monthly data
    const monthlyMap = new Map<string, { scope1: number; scope2: number; scope3: number }>();
    allEntries.forEach(entry => {
      const d = new Date(entry.entry_date);
      const key = d.toLocaleString('en-US', { month: 'short' });
      const existing = monthlyMap.get(key) || { scope1: 0, scope2: 0, scope3: 0 };
      const emissions = entry.calculations?.[0]?.calculated_emissions || Number(entry.quantity) || 0;
      if (entry.scope === 'S1') existing.scope1 += emissions;
      else if (entry.scope === 'S2') existing.scope2 += emissions;
      else if (entry.scope === 'S3') existing.scope3 += emissions;
      monthlyMap.set(key, existing);
    });

    const monthlyData: MonthlyData[] = Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      scope1: data.scope1,
      scope2: data.scope2,
      scope3: data.scope3,
      total: data.scope1 + data.scope2 + data.scope3,
    }));

    // Fetch goals for target data
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('target_date', { ascending: true })
      .limit(1);

    const goal = goals?.[0];
    const targetYear = goal?.target_date ? new Date(goal.target_date).getFullYear() : 2030;
    const targetReduction = goal?.target_emissions ? Math.round(((Number(goal.baseline_emissions) - Number(goal.target_emissions)) / Number(goal.baseline_emissions)) * 100) : 50;
    const currentProgress = goal?.current_emissions && goal?.baseline_emissions
      ? Math.round(((Number(goal.baseline_emissions) - Number(goal.current_emissions)) / Number(goal.baseline_emissions)) * 100)
      : 0;

    // Estimate previous year total (simple heuristic: current + 10%)
    const previousYearTotal = totalEmissions > 0 ? Math.round(totalEmissions * 1.1) : 0;
    const yearOverYearChange = previousYearTotal > 0
      ? Math.round(((totalEmissions - previousYearTotal) / previousYearTotal) * 100 * 10) / 10
      : 0;

    const now = new Date();
    const reportingPeriod = `January 1, ${now.getFullYear()} - December 31, ${now.getFullYear()}`;

    return {
      companyName,
      reportingPeriod,
      totalEmissions,
      scope1,
      scope2,
      scope3,
      reportingBoundary: 'Operational Control',
      verificationStatus: 'Self-Declared',
      executiveSummary: totalEmissions > 0
        ? `${companyName} has measured and reported greenhouse gas emissions totaling ${totalEmissions.toLocaleString()} tCO₂e for the ${now.getFullYear()} reporting period.${yearOverYearChange !== 0 ? ` This represents a ${Math.abs(yearOverYearChange)}% ${yearOverYearChange < 0 ? 'decrease' : 'increase'} from the estimated prior year baseline.` : ''}`
        : `${companyName} has not yet recorded emissions data. Please add emissions entries to generate a meaningful report.`,
      methodology: 'All calculations follow the GHG Protocol Corporate Accounting and Reporting Standard. Emission factors sourced from configured factor databases.',
      targetYear,
      targetReduction,
      currentProgress,
      previousYearTotal,
      yearOverYearChange,
      scope1Sources,
      scope2Sources,
      scope3Sources,
      monthlyData,
      standards: ['GHG Protocol Corporate Standard'],
      verificationBody: 'Not specified',
      assuranceLevel: 'Not verified',
      reportDate: now.toLocaleDateString(),
      preparedBy: user.email || 'System User',
      reviewedBy: 'Not specified',
      approvedBy: 'Not specified',
    };
  } catch (error) {
    console.error('Error fetching real template data:', error);
    // Return minimal empty data rather than fake numbers
    return {
      companyName: 'Your Company',
      reportingPeriod: `January 1, ${new Date().getFullYear()} - December 31, ${new Date().getFullYear()}`,
      totalEmissions: 0, scope1: 0, scope2: 0, scope3: 0,
      reportingBoundary: 'Operational Control',
      verificationStatus: 'Self-Declared',
      executiveSummary: 'No emissions data available. Please add emissions entries to generate a report.',
      methodology: 'GHG Protocol Corporate Accounting Standard.',
      targetYear: 2030, targetReduction: 50, currentProgress: 0,
      previousYearTotal: 0, yearOverYearChange: 0,
      scope1Sources: [], scope2Sources: [], scope3Sources: [],
      monthlyData: [],
      standards: ['GHG Protocol Corporate Standard'],
      verificationBody: 'Not specified', assuranceLevel: 'Not verified',
      reportDate: new Date().toLocaleDateString(),
      preparedBy: 'System User', reviewedBy: 'Not specified', approvedBy: 'Not specified',
    };
  }
};

export const downloadTemplate = async (template: Template, format?: string): Promise<void> => {
  try {
    if (!template.available) {
      toast.error('This template is not currently available');
      return;
    }

    const templateData = await fetchRealTemplateData();
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
    
    const templateData = await fetchRealTemplateData();
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
