import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
    const doc = new jsPDF();
    const primaryColor = branding?.primary_color || '#2563eb';
    const companyName = branding?.company_name || 'Your Company';

    // Header
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text(`${companyName}`, 15, 15);
    doc.setFontSize(14);
    doc.text(`Q${quarter} ${year} Emissions Report`, 15, 23);

    let yPos = 45;

    // Executive Summary
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('Executive Summary', 15, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.text(`Total Emissions: ${current.totalEmissions.toFixed(2)} tCO₂e`, 15, yPos);
    yPos += 6;
    doc.text(`Data Points: ${current.entryCount} entries`, 15, yPos);
    yPos += 6;

    if (previous) {
      const changeText = yoy.totalChange >= 0 ? 'increase' : 'decrease';
      const color = yoy.totalChange >= 0 ? [220, 38, 38] : [22, 163, 74];
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(
        `YoY Change: ${Math.abs(yoy.totalChangePercent).toFixed(1)}% ${changeText} (${yoy.totalChange >= 0 ? '+' : ''}${yoy.totalChange.toFixed(2)} tCO₂e)`,
        15,
        yPos
      );
      yPos += 10;
    } else {
      yPos += 4;
    }

    // Scope Breakdown
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('Emissions by Scope', 15, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [['Scope', 'Current Period', 'Previous Period', 'Change', '% Change']],
      body: [
        [
          'Scope 1',
          `${current.scope1.toFixed(2)} tCO₂e`,
          previous ? `${previous.scope1.toFixed(2)} tCO₂e` : 'N/A',
          previous ? `${yoy.scope1Change >= 0 ? '+' : ''}${yoy.scope1Change.toFixed(2)} tCO₂e` : 'N/A',
          previous ? `${yoy.scope1ChangePercent >= 0 ? '+' : ''}${yoy.scope1ChangePercent.toFixed(1)}%` : 'N/A'
        ],
        [
          'Scope 2',
          `${current.scope2.toFixed(2)} tCO₂e`,
          previous ? `${previous.scope2.toFixed(2)} tCO₂e` : 'N/A',
          previous ? `${yoy.scope2Change >= 0 ? '+' : ''}${yoy.scope2Change.toFixed(2)} tCO₂e` : 'N/A',
          previous ? `${yoy.scope2ChangePercent >= 0 ? '+' : ''}${yoy.scope2ChangePercent.toFixed(1)}%` : 'N/A'
        ],
        [
          'Scope 3',
          `${current.scope3.toFixed(2)} tCO₂e`,
          previous ? `${previous.scope3.toFixed(2)} tCO₂e` : 'N/A',
          previous ? `${yoy.scope3Change >= 0 ? '+' : ''}${yoy.scope3Change.toFixed(2)} tCO₂e` : 'N/A',
          previous ? `${yoy.scope3ChangePercent >= 0 ? '+' : ''}${yoy.scope3ChangePercent.toFixed(1)}%` : 'N/A'
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: primaryColor }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Top Emission Sources
    doc.setFontSize(14);
    doc.text('Top Emission Sources', 15, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [['Category', 'Emissions (tCO₂e)', '% of Total']],
      body: current.topSources.map(source => [
        source.category,
        source.emissions.toFixed(2),
        source.percentage.toFixed(1) + '%'
      ]),
      theme: 'grid',
      headStyles: { fillColor: primaryColor }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Monthly Trend
    if (current.monthlyBreakdown.length > 0) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.text('Monthly Trend', 15, yPos);
      yPos += 10;

      autoTable(doc, {
        startY: yPos,
        head: [['Month', 'Emissions (tCO₂e)']],
        body: current.monthlyBreakdown.map(item => [
          item.month,
          item.emissions.toFixed(2)
        ]),
        theme: 'grid',
        headStyles: { fillColor: primaryColor }
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      const footerText = branding?.footer_text || `Generated on ${new Date().toLocaleDateString()}`;
      doc.text(footerText, 15, 285);
      doc.text(`Page ${i} of ${pageCount}`, 180, 285);
    }

    doc.save(`Q${quarter}_${year}_Emissions_Report.pdf`);
  }

  private async generateAnnualPDF(
    year: number,
    current: PeriodData,
    previous: PeriodData | null,
    yoy: YoYComparison,
    branding: any
  ) {
    const doc = new jsPDF();
    const primaryColor = branding?.primary_color || '#2563eb';
    const companyName = branding?.company_name || 'Your Company';

    // Header
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.text(`${companyName}`, 15, 15);
    doc.setFontSize(14);
    doc.text(`${year} Annual Emissions Report`, 15, 23);

    let yPos = 45;

    // Executive Summary
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text('Executive Summary', 15, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.text(`Annual Total Emissions: ${current.totalEmissions.toFixed(2)} tCO₂e`, 15, yPos);
    yPos += 6;
    doc.text(`Total Data Points: ${current.entryCount} entries`, 15, yPos);
    yPos += 6;

    if (previous) {
      const changeText = yoy.totalChange >= 0 ? 'increase' : 'decrease';
      const color = yoy.totalChange >= 0 ? [220, 38, 38] : [22, 163, 74];
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(
        `Year-over-Year: ${Math.abs(yoy.totalChangePercent).toFixed(1)}% ${changeText} vs ${year - 1}`,
        15,
        yPos
      );
      yPos += 6;
      doc.text(
        `(${yoy.totalChange >= 0 ? '+' : ''}${yoy.totalChange.toFixed(2)} tCO₂e compared to previous year)`,
        15,
        yPos
      );
      yPos += 10;
    } else {
      yPos += 4;
    }

    // Comprehensive Scope Analysis
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('Comprehensive Scope Analysis', 15, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [['Scope', `${year}`, `${year - 1}`, 'Change (tCO₂e)', '% Change', 'Trend']],
      body: [
        [
          'Scope 1 (Direct)',
          `${current.scope1.toFixed(2)} tCO₂e`,
          previous ? `${previous.scope1.toFixed(2)} tCO₂e` : 'N/A',
          previous ? `${yoy.scope1Change >= 0 ? '+' : ''}${yoy.scope1Change.toFixed(2)}` : 'N/A',
          previous ? `${yoy.scope1ChangePercent >= 0 ? '+' : ''}${yoy.scope1ChangePercent.toFixed(1)}%` : 'N/A',
          previous ? (yoy.scope1Change < 0 ? '↓ Improving' : '↑ Increasing') : 'N/A'
        ],
        [
          'Scope 2 (Indirect)',
          `${current.scope2.toFixed(2)} tCO₂e`,
          previous ? `${previous.scope2.toFixed(2)} tCO₂e` : 'N/A',
          previous ? `${yoy.scope2Change >= 0 ? '+' : ''}${yoy.scope2Change.toFixed(2)}` : 'N/A',
          previous ? `${yoy.scope2ChangePercent >= 0 ? '+' : ''}${yoy.scope2ChangePercent.toFixed(1)}%` : 'N/A',
          previous ? (yoy.scope2Change < 0 ? '↓ Improving' : '↑ Increasing') : 'N/A'
        ],
        [
          'Scope 3 (Value Chain)',
          `${current.scope3.toFixed(2)} tCO₂e`,
          previous ? `${previous.scope3.toFixed(2)} tCO₂e` : 'N/A',
          previous ? `${yoy.scope3Change >= 0 ? '+' : ''}${yoy.scope3Change.toFixed(2)}` : 'N/A',
          previous ? `${yoy.scope3ChangePercent >= 0 ? '+' : ''}${yoy.scope3ChangePercent.toFixed(1)}%` : 'N/A',
          previous ? (yoy.scope3Change < 0 ? '↓ Improving' : '↑ Increasing') : 'N/A'
        ]
      ],
      theme: 'grid',
      headStyles: { fillColor: primaryColor }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Top Emission Sources
    doc.setFontSize(14);
    doc.text('Top Emission Sources', 15, yPos);
    yPos += 10;

    autoTable(doc, {
      startY: yPos,
      head: [['Rank', 'Category', 'Emissions (tCO₂e)', '% of Total']],
      body: current.topSources.map((source, index) => [
        (index + 1).toString(),
        source.category,
        source.emissions.toFixed(2),
        source.percentage.toFixed(1) + '%'
      ]),
      theme: 'grid',
      headStyles: { fillColor: primaryColor }
    });

    // Add new page for monthly breakdown
    doc.addPage();
    yPos = 20;

    doc.setFontSize(14);
    doc.text(`${year} Monthly Emissions Trend`, 15, yPos);
    yPos += 10;

    if (current.monthlyBreakdown.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [['Month', 'Emissions (tCO₂e)']],
        body: current.monthlyBreakdown.map(item => [
          new Date(item.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
          item.emissions.toFixed(2)
        ]),
        theme: 'grid',
        headStyles: { fillColor: primaryColor }
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      const footerText = branding?.footer_text || `Generated on ${new Date().toLocaleDateString()}`;
      doc.text(footerText, 15, 285);
      doc.text(`Page ${i} of ${pageCount}`, 180, 285);
    }

    doc.save(`${year}_Annual_Emissions_Report.pdf`);
  }
}

export const comprehensiveReportService = new ComprehensiveReportService();
