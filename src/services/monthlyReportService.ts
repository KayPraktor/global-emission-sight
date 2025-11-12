import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns';

interface BrandingSettings {
  company_name?: string;
  company_logo_url?: string;
  primary_color: string;
  secondary_color: string;
  header_text?: string;
  footer_text?: string;
}

interface MonthlyReportData {
  period: string;
  totalEmissions: number;
  scope1: number;
  scope2: number;
  scope3: number;
  insights: Array<{
    title: string;
    finding: string;
    impact: string;
  }>;
  anomalies: Array<{
    type: string;
    severity: string;
    description: string;
  }>;
  topSources: Array<{
    category: string;
    emissions: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    emissions: number;
  }>;
  branding: BrandingSettings;
}

export class MonthlyReportService {
  async generateMonthlyPDFReport(year: number, month: number): Promise<void> {
    const data = await this.fetchMonthlyData(year, month);
    if (!data) {
      throw new Error('Failed to fetch monthly data');
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Convert hex color to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 37, g: 99, b: 235 };
    };

    const primaryColor = hexToRgb(data.branding.primary_color);

    // Header with custom branding
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Company logo if provided
    if (data.branding.company_logo_url) {
      // Note: In production, you'd load the image from URL
      // For now, we'll just show company name
    }
    
    doc.setTextColor(255, 255, 255);
    
    if (data.branding.company_name) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(data.branding.company_name, 14, 15);
    }
    
    if (data.branding.header_text) {
      doc.setFontSize(8);
      doc.text(data.branding.header_text, pageWidth - 14, 15, { align: 'right' });
    }
    
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Monthly Emissions Report', pageWidth / 2, 25, { align: 'center' });
    doc.setFontSize(12);
    doc.text(data.period, pageWidth / 2, 35, { align: 'center' });

    yPosition = 50;
    doc.setTextColor(0, 0, 0);

    // Executive Summary
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 14, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const summaryText = `This report provides a comprehensive overview of emissions data for ${data.period}. ` +
      `Total emissions: ${data.totalEmissions.toFixed(2)} tCO2e. ` +
      `Key findings include ${data.insights.length} actionable insights and ${data.anomalies.length} detected anomalies requiring attention.`;
    const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 28);
    doc.text(splitSummary, 14, yPosition);
    yPosition += splitSummary.length * 5 + 10;

    // Emissions Overview Cards
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Emissions Overview', 14, yPosition);
    yPosition += 8;

    const cardWidth = (pageWidth - 42) / 4;
    const secondaryColor = hexToRgb(data.branding.secondary_color);
    
    const cards = [
      { label: 'Total', value: data.totalEmissions, color: [primaryColor.r, primaryColor.g, primaryColor.b] },
      { label: 'Scope 1', value: data.scope1, color: [239, 68, 68] },
      { label: 'Scope 2', value: data.scope2, color: [234, 179, 8] },
      { label: 'Scope 3', value: data.scope3, color: [34, 197, 94] },
    ];

    cards.forEach((card, index) => {
      const x = 14 + (cardWidth + 4) * index;
      doc.setFillColor(card.color[0], card.color[1], card.color[2]);
      doc.roundedRect(x, yPosition, cardWidth, 20, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(card.label, x + cardWidth / 2, yPosition + 6, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${card.value.toFixed(1)}`, x + cardWidth / 2, yPosition + 14, { align: 'center' });
      doc.setFontSize(7);
      doc.text('tCO2e', x + cardWidth / 2, yPosition + 18, { align: 'center' });
    });

    yPosition += 30;
    doc.setTextColor(0, 0, 0);

    // Monthly Trend Chart (simplified)
    if (data.monthlyTrend.length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('6-Month Emissions Trend', 14, yPosition);
      yPosition += 8;

      const chartHeight = 40;
      const chartWidth = pageWidth - 28;
      const maxEmissions = Math.max(...data.monthlyTrend.map(d => d.emissions));
      
      doc.setDrawColor(200, 200, 200);
      doc.rect(14, yPosition, chartWidth, chartHeight);

      data.monthlyTrend.forEach((point, index) => {
        const x = 14 + (chartWidth / (data.monthlyTrend.length - 1)) * index;
        const barHeight = (point.emissions / maxEmissions) * (chartHeight - 5);
        const y = yPosition + chartHeight - barHeight;
        
        doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
        doc.circle(x, y, 2, 'F');
        
        if (index < data.monthlyTrend.length - 1) {
          const nextPoint = data.monthlyTrend[index + 1];
          const nextX = 14 + (chartWidth / (data.monthlyTrend.length - 1)) * (index + 1);
          const nextBarHeight = (nextPoint.emissions / maxEmissions) * (chartHeight - 5);
          const nextY = yPosition + chartHeight - nextBarHeight;
          doc.line(x, y, nextX, nextY);
        }

        doc.setFontSize(7);
        doc.text(point.month, x, yPosition + chartHeight + 5, { align: 'center' });
      });

      yPosition += chartHeight + 15;
    }

    // New page for details
    doc.addPage();
    yPosition = 20;

    // Top Emission Sources
    if (data.topSources.length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Top Emission Sources', 14, yPosition);
      yPosition += 5;

      autoTable(doc, {
        startY: yPosition,
        head: [['Category', 'Emissions (tCO2e)', 'Percentage']],
        body: data.topSources.map(source => [
          source.category,
          source.emissions.toFixed(2),
          `${((source.emissions / data.totalEmissions) * 100).toFixed(1)}%`
        ]),
        theme: 'grid',
        headStyles: { fillColor: [primaryColor.r, primaryColor.g, primaryColor.b], textColor: 255 },
        styles: { fontSize: 9 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 15;
    }

    // Key Insights
    if (data.insights.length > 0 && yPosition < pageHeight - 60) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Insights', 14, yPosition);
      yPosition += 8;

      data.insights.slice(0, 3).forEach((insight, index) => {
        if (yPosition > pageHeight - 40) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFillColor(240, 249, 255);
        doc.roundedRect(14, yPosition, pageWidth - 28, 25, 2, 2, 'F');
        
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
        doc.text(`${index + 1}. ${insight.title}`, 16, yPosition + 6);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        const findingText = doc.splitTextToSize(insight.finding, pageWidth - 36);
        doc.text(findingText, 16, yPosition + 12);
        
        yPosition += 30;
      });
    }

    // Anomalies Detected
    if (data.anomalies.length > 0) {
      if (yPosition > pageHeight - 60) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Anomalies Detected', 14, yPosition);
      yPosition += 5;

      autoTable(doc, {
        startY: yPosition,
        head: [['Type', 'Severity', 'Description']],
        body: data.anomalies.map(anomaly => [
          anomaly.type,
          anomaly.severity,
          anomaly.description
        ]),
        theme: 'grid',
        headStyles: { fillColor: [220, 38, 38], textColor: 255 },
        styles: { fontSize: 9 },
        columnStyles: {
          2: { cellWidth: 100 }
        }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      
      const defaultFooter = `Generated on ${format(new Date(), 'PPP')} | Page ${i} of ${totalPages}`;
      const footerText = data.branding.footer_text 
        ? `${data.branding.footer_text} | ${defaultFooter}`
        : defaultFooter;
      
      doc.text(
        footerText,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    const fileName = `monthly-report-${year}-${String(month).padStart(2, '0')}.pdf`;
    doc.save(fileName);
  }

  private async fetchMonthlyData(year: number, month: number): Promise<MonthlyReportData | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const startDate = startOfMonth(new Date(year, month - 1));
      const endDate = endOfMonth(startDate);

      // Fetch branding settings
      const { data: brandingData } = await supabase
        .from('report_branding_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const branding: BrandingSettings = {
        company_name: brandingData?.company_name || undefined,
        company_logo_url: brandingData?.company_logo_url || undefined,
        primary_color: brandingData?.primary_color || '#2563eb',
        secondary_color: brandingData?.secondary_color || '#1e40af',
        header_text: brandingData?.header_text || undefined,
        footer_text: brandingData?.footer_text || undefined,
      };

      // Fetch emissions entries
      const { data: entries } = await supabase
        .from('emissions_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('entry_date', startDate.toISOString())
        .lte('entry_date', endDate.toISOString());

      // Fetch insights
      const { data: insights } = await supabase
        .from('emissions_insights')
        .select('*')
        .eq('user_id', user.id)
        .gte('generated_at', startDate.toISOString())
        .lte('generated_at', endDate.toISOString())
        .order('priority', { ascending: false })
        .limit(5);

      // Fetch anomalies
      const { data: anomalies } = await supabase
        .from('emissions_anomalies')
        .select('*')
        .eq('user_id', user.id)
        .gte('detected_at', startDate.toISOString())
        .lte('detected_at', endDate.toISOString())
        .order('severity', { ascending: false })
        .limit(10);

      // Calculate totals
      const scope1 = (entries || [])
        .filter(e => e.scope === 'S1')
        .reduce((sum, e) => sum + (Number(e.quantity) || 0), 0);
      const scope2 = (entries || [])
        .filter(e => e.scope === 'S2')
        .reduce((sum, e) => sum + (Number(e.quantity) || 0), 0);
      const scope3 = (entries || [])
        .filter(e => e.scope === 'S3')
        .reduce((sum, e) => sum + (Number(e.quantity) || 0), 0);

      // Get top sources
      const categoryTotals = (entries || []).reduce((acc, entry) => {
        acc[entry.category] = (acc[entry.category] || 0) + Number(entry.quantity);
        return acc;
      }, {} as Record<string, number>);

      const topSources = Object.entries(categoryTotals)
        .map(([category, emissions]) => ({ category, emissions }))
        .sort((a, b) => b.emissions - a.emissions)
        .slice(0, 5);

      // Get monthly trend (last 6 months)
      const monthlyTrend = [];
      for (let i = 5; i >= 0; i--) {
        const trendMonth = subMonths(startDate, i);
        const trendStart = startOfMonth(trendMonth);
        const trendEnd = endOfMonth(trendMonth);

        const { data: trendEntries } = await supabase
          .from('emissions_entries')
          .select('quantity')
          .eq('user_id', user.id)
          .gte('entry_date', trendStart.toISOString())
          .lte('entry_date', trendEnd.toISOString());

        const emissions = (trendEntries || []).reduce((sum, e) => sum + Number(e.quantity), 0);
        monthlyTrend.push({
          month: format(trendMonth, 'MMM'),
          emissions
        });
      }

      return {
        period: format(startDate, 'MMMM yyyy'),
        totalEmissions: scope1 + scope2 + scope3,
        scope1,
        scope2,
        scope3,
        insights: (insights || []).map(i => ({
          title: i.title,
          finding: i.finding || '',
          impact: i.impact || ''
        })),
        anomalies: (anomalies || []).map(a => ({
          type: a.anomaly_type,
          severity: a.severity,
          description: a.description || ''
        })),
        topSources,
        monthlyTrend,
        branding
      };
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      return null;
    }
  }
}

export const monthlyReportService = new MonthlyReportService();
