import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PeriodData {
  totalEmissions: number;
  scope1: number;
  scope2: number;
  scope3: number;
  entryCount: number;
  topSources: Array<{ category: string; emissions: number; percentage: number }>;
  monthlyBreakdown: Array<{ month: string; emissions: number }>;
}

interface YoYComparison {
  totalChange: number;
  totalChangePercent: number;
  scope1Change: number;
  scope1ChangePercent: number;
  scope2Change: number;
  scope2ChangePercent: number;
  scope3Change: number;
  scope3ChangePercent: number;
}

class ComprehensiveReportService {
  async generateQuarterlyReport(year: number, quarter: number): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to generate reports');
        return;
      }

      toast.info('Generating quarterly report...');

      const currentData = await this.fetchQuarterData(year, quarter, user.id);
      const previousData = await this.fetchQuarterData(
        quarter === 1 ? year - 1 : year,
        quarter === 1 ? 4 : quarter - 1,
        user.id
      );

      if (!currentData) {
        toast.error('No data available for the selected quarter');
        return;
      }

      const yoyComparison = this.calculateYoYComparison(currentData, previousData);
      const brandingSettings = await this.fetchBrandingSettings(user.id);

      await this.generateQuarterlyPDF(year, quarter, currentData, previousData, yoyComparison, brandingSettings);

      toast.success('Quarterly report generated successfully!');
    } catch (error) {
      console.error('Error generating quarterly report:', error);
      toast.error('Failed to generate quarterly report');
    }
  }

  async generateAnnualReport(year: number): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to generate reports');
        return;
      }

      toast.info('Generating annual report...');

      const currentData = await this.fetchYearData(year, user.id);
      const previousData = await this.fetchYearData(year - 1, user.id);

      if (!currentData) {
        toast.error('No data available for the selected year');
        return;
      }

      const yoyComparison = this.calculateYoYComparison(currentData, previousData);
      const brandingSettings = await this.fetchBrandingSettings(user.id);

      await this.generateAnnualPDF(year, currentData, previousData, yoyComparison, brandingSettings);

      toast.success('Annual report generated successfully!');
    } catch (error) {
      console.error('Error generating annual report:', error);
      toast.error('Failed to generate annual report');
    }
  }

  private async fetchQuarterData(year: number, quarter: number, userId: string): Promise<PeriodData | null> {
    const quarterMonths = {
      1: [0, 1, 2],
      2: [3, 4, 5],
      3: [6, 7, 8],
      4: [9, 10, 11]
    };

    const months = quarterMonths[quarter as keyof typeof quarterMonths];
    const startDate = new Date(year, months[0], 1);
    const endDate = new Date(year, months[2] + 1, 0);

    const { data: entries, error } = await supabase
      .from('emissions_entries')
      .select('*, calculations(*), emission_factors(*)')
      .eq('user_id', userId)
      .gte('entry_date', startDate.toISOString().split('T')[0])
      .lte('entry_date', endDate.toISOString().split('T')[0]);

    if (error || !entries || entries.length === 0) {
      return null;
    }

    return this.processPeriodData(entries, startDate, endDate);
  }

  private async fetchYearData(year: number, userId: string): Promise<PeriodData | null> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const { data: entries, error } = await supabase
      .from('emissions_entries')
      .select('*, calculations(*), emission_factors(*)')
      .eq('user_id', userId)
      .gte('entry_date', startDate.toISOString().split('T')[0])
      .lte('entry_date', endDate.toISOString().split('T')[0]);

    if (error || !entries || entries.length === 0) {
      return null;
    }

    return this.processPeriodData(entries, startDate, endDate);
  }

  private processPeriodData(entries: any[], startDate: Date, endDate: Date): PeriodData {
    let scope1 = 0, scope2 = 0, scope3 = 0;
    const categoryTotals: { [key: string]: number } = {};
    const monthlyTotals: { [key: string]: number } = {};

    entries.forEach(entry => {
      const emissions = entry.calculations?.[0]?.calculated_emissions || 0;
      
      if (entry.scope === 'S1') scope1 += emissions;
      else if (entry.scope === 'S2') scope2 += emissions;
      else if (entry.scope === 'S3') scope3 += emissions;

      categoryTotals[entry.category] = (categoryTotals[entry.category] || 0) + emissions;

      const entryDate = new Date(entry.entry_date);
      const monthKey = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}`;
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + emissions;
    });

    const totalEmissions = scope1 + scope2 + scope3;

    const topSources = Object.entries(categoryTotals)
      .map(([category, emissions]) => ({
        category,
        emissions,
        percentage: (emissions / totalEmissions) * 100
      }))
      .sort((a, b) => b.emissions - a.emissions)
      .slice(0, 5);

    const monthlyBreakdown = Object.entries(monthlyTotals)
      .map(([month, emissions]) => ({ month, emissions }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalEmissions,
      scope1,
      scope2,
      scope3,
      entryCount: entries.length,
      topSources,
      monthlyBreakdown
    };
  }

  private calculateYoYComparison(current: PeriodData, previous: PeriodData | null): YoYComparison {
    if (!previous) {
      return {
        totalChange: 0,
        totalChangePercent: 0,
        scope1Change: 0,
        scope1ChangePercent: 0,
        scope2Change: 0,
        scope2ChangePercent: 0,
        scope3Change: 0,
        scope3ChangePercent: 0
      };
    }

    return {
      totalChange: current.totalEmissions - previous.totalEmissions,
      totalChangePercent: ((current.totalEmissions - previous.totalEmissions) / previous.totalEmissions) * 100,
      scope1Change: current.scope1 - previous.scope1,
      scope1ChangePercent: previous.scope1 > 0 ? ((current.scope1 - previous.scope1) / previous.scope1) * 100 : 0,
      scope2Change: current.scope2 - previous.scope2,
      scope2ChangePercent: previous.scope2 > 0 ? ((current.scope2 - previous.scope2) / previous.scope2) * 100 : 0,
      scope3Change: current.scope3 - previous.scope3,
      scope3ChangePercent: previous.scope3 > 0 ? ((current.scope3 - previous.scope3) / previous.scope3) * 100 : 0
    };
  }

  private async fetchBrandingSettings(userId: string) {
    const { data } = await supabase
      .from('report_branding_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    return data;
  }

  private async generateQuarterlyPDF(
    year: number,
    quarter: number,
    current: PeriodData,
    previous: PeriodData | null,
    yoy: YoYComparison,
    branding: any
  ) {
    const { ProfessionalPDFGenerator } = await import('./professionalPDFGenerator');
    const companyName = branding?.company_name || 'Your Company';
    const primaryColor = branding?.primary_color || '#059669';

    const pdfBranding = {
      companyName,
      primaryColor,
      secondaryColor: '#2563eb',
      footerText: branding?.footer_text || `Generated by BARYON · ${new Date().toLocaleDateString()}`,
    };

    const pdf = new ProfessionalPDFGenerator(pdfBranding);
    const dateStr = `Q${quarter} ${year}`;

    pdf.createCoverPage(`Quarterly Emissions Report`, `${dateStr} Performance Summary`, new Date().toLocaleDateString(), 'Quarterly Report');

    // Executive Summary
    pdf.addSection('Executive Summary');
    pdf.addParagraph(`Total emissions for Q${quarter} ${year}: ${current.totalEmissions.toFixed(2)} tCO₂e across ${current.entryCount} data entries.`);
    if (previous) {
      const changeText = yoy.totalChange >= 0 ? 'increase' : 'decrease';
      pdf.addParagraph(`This represents a ${Math.abs(yoy.totalChangePercent).toFixed(1)}% ${changeText} compared to the previous period (${yoy.totalChange >= 0 ? '+' : ''}${yoy.totalChange.toFixed(2)} tCO₂e).`);
    }

    // KPI Row
    const changeType = yoy.totalChange < 0 ? 'positive' as const : 'negative' as const;
    pdf.addMetricsRow([
      { label: 'Total Emissions', value: current.totalEmissions.toFixed(0), unit: 'tCO₂e', change: previous ? `${yoy.totalChangePercent >= 0 ? '+' : ''}${yoy.totalChangePercent.toFixed(1)}%` : undefined, changeType: previous ? changeType : undefined },
      { label: 'Scope 1', value: current.scope1.toFixed(0), unit: 'tCO₂e' },
      { label: 'Scope 2', value: current.scope2.toFixed(0), unit: 'tCO₂e' },
      { label: 'Scope 3', value: current.scope3.toFixed(0), unit: 'tCO₂e' },
    ]);

    // Donut Chart
    pdf.addSection('Emissions by Scope');
    pdf.drawDonutChart([
      { label: 'Scope 1', value: current.scope1, color: '#059669' },
      { label: 'Scope 2', value: current.scope2, color: '#2563eb' },
      { label: 'Scope 3', value: current.scope3, color: '#d97706' },
    ], 55, pdf.getCurrentY() + 35, 28);

    // Scope Table
    pdf.addTable(
      ['Scope', 'Current Period', 'Previous Period', 'Change', '% Change'],
      [
        ['Scope 1', `${current.scope1.toFixed(2)}`, previous ? `${previous.scope1.toFixed(2)}` : 'N/A', previous ? `${yoy.scope1Change >= 0 ? '+' : ''}${yoy.scope1Change.toFixed(2)}` : 'N/A', previous ? `${yoy.scope1ChangePercent >= 0 ? '+' : ''}${yoy.scope1ChangePercent.toFixed(1)}%` : 'N/A'],
        ['Scope 2', `${current.scope2.toFixed(2)}`, previous ? `${previous.scope2.toFixed(2)}` : 'N/A', previous ? `${yoy.scope2Change >= 0 ? '+' : ''}${yoy.scope2Change.toFixed(2)}` : 'N/A', previous ? `${yoy.scope2ChangePercent >= 0 ? '+' : ''}${yoy.scope2ChangePercent.toFixed(1)}%` : 'N/A'],
        ['Scope 3', `${current.scope3.toFixed(2)}`, previous ? `${previous.scope3.toFixed(2)}` : 'N/A', previous ? `${yoy.scope3Change >= 0 ? '+' : ''}${yoy.scope3Change.toFixed(2)}` : 'N/A', previous ? `${yoy.scope3ChangePercent >= 0 ? '+' : ''}${yoy.scope3ChangePercent.toFixed(1)}%` : 'N/A'],
      ]
    );

    // Bar Chart - Top Sources
    if (current.topSources.length > 0) {
      pdf.addSection('Top Emission Sources');
      pdf.drawHorizontalBarChart(
        current.topSources.map(s => ({ label: s.category, value: s.emissions })),
        pdf.getDoc().internal.pageSize.width * 0.08,
        pdf.getCurrentY(),
        pdf.getDoc().internal.pageSize.width * 0.84
      );
    }

    // Monthly Trend
    if (current.monthlyBreakdown.length > 0) {
      pdf.addSection('Monthly Trend');
      pdf.addTable(
        ['Month', 'Emissions (tCO₂e)'],
        current.monthlyBreakdown.map(item => [item.month, item.emissions.toFixed(2)])
      );
    }

    // Methodology
    pdf.addMethodologySection([
      { name: 'GHG Protocol Corporate Standard', description: 'All emissions calculated following the GHG Protocol Corporate Accounting and Reporting Standard.', source: 'ghgprotocol.org' },
      { name: 'Emission Factor Sources', description: 'EPA 2024, UK DEFRA 2024, and IEA 2024 electricity emission factors applied.', source: 'EPA, DEFRA, IEA' },
    ]);

    // Glossary
    pdf.addGlossary([
      { term: 'tCO₂e', definition: 'Tonnes of carbon dioxide equivalent.' },
      { term: 'Scope 1', definition: 'Direct GHG emissions from owned or controlled sources.' },
      { term: 'Scope 2', definition: 'Indirect GHG emissions from purchased energy.' },
      { term: 'Scope 3', definition: 'All other indirect emissions in the value chain.' },
      { term: 'YoY', definition: 'Year-over-Year comparison.' },
    ]);

    pdf.finalize(`Q${quarter}_${year}_Emissions_Report.pdf`);
  }

  private async generateAnnualPDF(
    year: number,
    current: PeriodData,
    previous: PeriodData | null,
    yoy: YoYComparison,
    branding: any
  ) {
    const { ProfessionalPDFGenerator } = await import('./professionalPDFGenerator');
    const companyName = branding?.company_name || 'Your Company';
    const primaryColor = branding?.primary_color || '#059669';

    const pdfBranding = {
      companyName,
      primaryColor,
      secondaryColor: '#2563eb',
      footerText: branding?.footer_text || `Generated by BARYON · ${new Date().toLocaleDateString()}`,
    };

    const pdf = new ProfessionalPDFGenerator(pdfBranding);

    pdf.createCoverPage(`Annual Emissions Report`, `${year} Performance Review`, new Date().toLocaleDateString(), 'Annual Report');

    // Executive Summary
    pdf.addSection('Executive Summary');
    pdf.addParagraph(`Annual total emissions for ${year}: ${current.totalEmissions.toFixed(2)} tCO₂e across ${current.entryCount} data entries.`);
    if (previous) {
      const changeText = yoy.totalChange >= 0 ? 'increase' : 'decrease';
      pdf.addParagraph(`Year-over-year: ${Math.abs(yoy.totalChangePercent).toFixed(1)}% ${changeText} compared to ${year - 1} (${yoy.totalChange >= 0 ? '+' : ''}${yoy.totalChange.toFixed(2)} tCO₂e).`);
    }

    // KPI Row
    const changeType = yoy.totalChange < 0 ? 'positive' as const : 'negative' as const;
    pdf.addMetricsRow([
      { label: 'Total Emissions', value: current.totalEmissions.toFixed(0), unit: 'tCO₂e', change: previous ? `${yoy.totalChangePercent >= 0 ? '+' : ''}${yoy.totalChangePercent.toFixed(1)}%` : undefined, changeType: previous ? changeType : undefined },
      { label: 'Scope 1', value: current.scope1.toFixed(0), unit: 'tCO₂e' },
      { label: 'Scope 2', value: current.scope2.toFixed(0), unit: 'tCO₂e' },
      { label: 'Scope 3', value: current.scope3.toFixed(0), unit: 'tCO₂e' },
    ]);

    // Donut Chart
    pdf.addSection('Emissions by Scope');
    pdf.drawDonutChart([
      { label: 'Scope 1', value: current.scope1, color: '#059669' },
      { label: 'Scope 2', value: current.scope2, color: '#2563eb' },
      { label: 'Scope 3', value: current.scope3, color: '#d97706' },
    ], 55, pdf.getCurrentY() + 35, 28);

    // Comprehensive Scope Table
    pdf.addTable(
      ['Scope', `${year}`, `${year - 1}`, 'Change (tCO₂e)', '% Change', 'Trend'],
      [
        ['Scope 1 (Direct)', `${current.scope1.toFixed(2)}`, previous ? `${previous.scope1.toFixed(2)}` : 'N/A', previous ? `${yoy.scope1Change >= 0 ? '+' : ''}${yoy.scope1Change.toFixed(2)}` : 'N/A', previous ? `${yoy.scope1ChangePercent >= 0 ? '+' : ''}${yoy.scope1ChangePercent.toFixed(1)}%` : 'N/A', previous ? (yoy.scope1Change < 0 ? '↓ Improving' : '↑ Increasing') : 'N/A'],
        ['Scope 2 (Indirect)', `${current.scope2.toFixed(2)}`, previous ? `${previous.scope2.toFixed(2)}` : 'N/A', previous ? `${yoy.scope2Change >= 0 ? '+' : ''}${yoy.scope2Change.toFixed(2)}` : 'N/A', previous ? `${yoy.scope2ChangePercent >= 0 ? '+' : ''}${yoy.scope2ChangePercent.toFixed(1)}%` : 'N/A', previous ? (yoy.scope2Change < 0 ? '↓ Improving' : '↑ Increasing') : 'N/A'],
        ['Scope 3 (Value Chain)', `${current.scope3.toFixed(2)}`, previous ? `${previous.scope3.toFixed(2)}` : 'N/A', previous ? `${yoy.scope3Change >= 0 ? '+' : ''}${yoy.scope3Change.toFixed(2)}` : 'N/A', previous ? `${yoy.scope3ChangePercent >= 0 ? '+' : ''}${yoy.scope3ChangePercent.toFixed(1)}%` : 'N/A', previous ? (yoy.scope3Change < 0 ? '↓ Improving' : '↑ Increasing') : 'N/A'],
      ]
    );

    // Bar Chart - Top Sources
    if (current.topSources.length > 0) {
      pdf.addSection('Top Emission Sources');
      pdf.drawHorizontalBarChart(
        current.topSources.map(s => ({ label: s.category, value: s.emissions })),
        pdf.getDoc().internal.pageSize.width * 0.08,
        pdf.getCurrentY(),
        pdf.getDoc().internal.pageSize.width * 0.84
      );
    }

    // Monthly Breakdown
    if (current.monthlyBreakdown.length > 0) {
      pdf.addSection(`${year} Monthly Emissions Trend`);
      pdf.addTable(
        ['Month', 'Emissions (tCO₂e)'],
        current.monthlyBreakdown.map(item => [
          new Date(item.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
          item.emissions.toFixed(2)
        ])
      );
    }

    // Materiality Assessment Section
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      const { data: materialityAssessments } = await supabase
        .from('materiality_assessments')
        .select('topic_name, topic_category, is_material, impact_score, financial_score')
        .eq('user_id', currentUser.id);

      const materialTopics = (materialityAssessments || []).filter(a => a.is_material);

      if (materialTopics.length > 0) {
        pdf.addSection('Double Materiality Assessment');
        pdf.addParagraph(`${(materialityAssessments || []).length} sustainability topics assessed. ${materialTopics.length} identified as material.`);
        pdf.addTable(
          ['Material Topic', 'Category', 'Impact Score', 'Financial Score'],
          materialTopics
            .sort((a, b) => ((b.impact_score || 0) + (b.financial_score || 0)) - ((a.impact_score || 0) + (a.financial_score || 0)))
            .slice(0, 10)
            .map(t => [
              t.topic_name,
              t.topic_category,
              `${(t.impact_score || 0).toFixed(0)}`,
              `${(t.financial_score || 0).toFixed(0)}`,
            ])
        );
      }
    }

    // Carbon Intensity - conditional rendering (fix #5)
    pdf.addSection('Carbon Intensity Metrics');
    pdf.addKeyValueSection([
      { label: 'Total Annual Emissions', value: `${current.totalEmissions.toFixed(2)} tCO\u2082e`, highlight: true },
    ]);
    pdf.addParagraph('Per-employee and per-revenue intensity metrics will be calculated when organizational headcount and revenue data are configured.');

    // Methodology
    pdf.addMethodologySection([
      { name: 'GHG Protocol Corporate Standard', description: 'All emissions calculated following the GHG Protocol Corporate Accounting and Reporting Standard.', source: 'ghgprotocol.org' },
      { name: 'Emission Factor Sources', description: 'EPA 2024, UK DEFRA 2024, and IEA 2024 electricity emission factors applied.', source: 'EPA, DEFRA, IEA' },
      { name: 'Organizational Boundary', description: 'Operational control approach used consistently across all facilities.' },
      { name: 'Data Quality', description: 'Data quality assessed on High/Medium/Low scale. Uncertainty calculated using IPCC Tier 1 methodology.' },
    ]);

    // Glossary
    pdf.addGlossary([
      { term: 'tCO₂e', definition: 'Tonnes of carbon dioxide equivalent.' },
      { term: 'Scope 1', definition: 'Direct GHG emissions from owned or controlled sources.' },
      { term: 'Scope 2', definition: 'Indirect GHG emissions from purchased energy.' },
      { term: 'Scope 3', definition: 'All other indirect emissions in the value chain.' },
      { term: 'Net Zero', definition: 'Balance between GHGs emitted and removed from the atmosphere.' },
      { term: 'SBTi', definition: 'Science Based Targets initiative for emissions reduction targets.' },
    ]);

    // Declaration
    pdf.addDeclarationSection(companyName, 'Authorized Signatory', new Date().toLocaleDateString());

    pdf.finalize(`${year}_Annual_Emissions_Report.pdf`);
  }
}

export const comprehensiveReportService = new ComprehensiveReportService();
