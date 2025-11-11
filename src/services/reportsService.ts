import { supabase } from '@/integrations/supabase/client';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface ReportData {
  entries: any[];
  totalEmissions: number;
  scope1Total: number;
  scope2Total: number;
  scope3Total: number;
  periodStart: Date;
  periodEnd: Date;
  facilities: any[];
}

class ReportsService {
  /**
   * Fetch emissions data for report generation
   */
  async getReportData(startDate: Date, endDate: Date, facilityIds?: string[]): Promise<{ data: ReportData | null; error: string | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: 'User not authenticated' };
      }

      let query = supabase
        .from('emissions_entries')
        .select(`
          *,
          calculations(calculated_emissions),
          facilities(name, city, country_code),
          emission_factors(name, category)
        `)
        .eq('user_id', user.id)
        .gte('entry_date', startDate.toISOString())
        .lte('entry_date', endDate.toISOString())
        .order('entry_date', { ascending: true });

      if (facilityIds && facilityIds.length > 0) {
        query = query.in('facility_id', facilityIds);
      }

      const { data: entries, error: entriesError } = await query;

      if (entriesError) {
        console.error('Error fetching report data:', entriesError);
        return { data: null, error: entriesError.message };
      }

      if (!entries || entries.length === 0) {
        return {
          data: {
            entries: [],
            totalEmissions: 0,
            scope1Total: 0,
            scope2Total: 0,
            scope3Total: 0,
            periodStart: startDate,
            periodEnd: endDate,
            facilities: [],
          },
          error: null,
        };
      }

      // Calculate totals by scope
      const scope1Total = entries
        .filter(e => e.scope === 'S1')
        .reduce((sum, e) => sum + (e.calculations?.[0]?.calculated_emissions || 0), 0);

      const scope2Total = entries
        .filter(e => e.scope === 'S2')
        .reduce((sum, e) => sum + (e.calculations?.[0]?.calculated_emissions || 0), 0);

      const scope3Total = entries
        .filter(e => e.scope === 'S3')
        .reduce((sum, e) => sum + (e.calculations?.[0]?.calculated_emissions || 0), 0);

      const totalEmissions = scope1Total + scope2Total + scope3Total;

      // Get unique facilities
      const facilitiesMap = new Map();
      entries.forEach(entry => {
        if (entry.facility_id && entry.facilities) {
          facilitiesMap.set(entry.facility_id, entry.facilities);
        }
      });
      const facilities = Array.from(facilitiesMap.values());

      return {
        data: {
          entries,
          totalEmissions,
          scope1Total,
          scope2Total,
          scope3Total,
          periodStart: startDate,
          periodEnd: endDate,
          facilities,
        },
        error: null,
      };
    } catch (error: any) {
      console.error('Error fetching report data:', error);
      return { data: null, error: error.message };
    }
  }

  /**
   * Export report data to CSV
   */
  exportToCSV(reportData: ReportData, filename: string = 'emissions_report.csv'): void {
    const headers = ['Date', 'Facility', 'Scope', 'Category', 'Activity Type', 'Quantity', 'Unit', 'CO₂e (tonnes)', 'Notes'];
    
    const rows = reportData.entries.map(entry => [
      format(new Date(entry.entry_date), 'yyyy-MM-dd'),
      entry.facilities?.name || 'N/A',
      entry.scope,
      entry.category,
      entry.activity_type || 'N/A',
      entry.quantity,
      entry.unit,
      (entry.calculations?.[0]?.calculated_emissions || 0).toFixed(2),
      entry.notes || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export report data to Excel
   */
  exportToExcel(reportData: ReportData, filename: string = 'emissions_report.xlsx'): void {
    // Summary sheet
    const summaryData = [
      ['Emissions Report Summary'],
      ['Period', `${format(reportData.periodStart, 'yyyy-MM-dd')} to ${format(reportData.periodEnd, 'yyyy-MM-dd')}`],
      [''],
      ['Total Emissions', `${reportData.totalEmissions.toFixed(2)} tCO₂e`],
      ['Scope 1', `${reportData.scope1Total.toFixed(2)} tCO₂e`],
      ['Scope 2', `${reportData.scope2Total.toFixed(2)} tCO₂e`],
      ['Scope 3', `${reportData.scope3Total.toFixed(2)} tCO₂e`],
      [''],
      ['Facilities', reportData.facilities.length.toString()],
      ['Total Entries', reportData.entries.length.toString()],
    ];

    // Detailed entries sheet
    const entriesData = [
      ['Date', 'Facility', 'Scope', 'Category', 'Activity Type', 'Quantity', 'Unit', 'CO₂e (tonnes)', 'Data Quality', 'Verified', 'Notes'],
      ...reportData.entries.map(entry => [
        format(new Date(entry.entry_date), 'yyyy-MM-dd'),
        entry.facilities?.name || 'N/A',
        entry.scope,
        entry.category,
        entry.activity_type || 'N/A',
        entry.quantity,
        entry.unit,
        (entry.calculations?.[0]?.calculated_emissions || 0).toFixed(2),
        entry.data_quality_score?.toFixed(1) || 'N/A',
        entry.is_verified ? 'Yes' : 'No',
        entry.notes || '',
      ]),
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    const wsEntries = XLSX.utils.aoa_to_sheet(entriesData);

    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');
    XLSX.utils.book_append_sheet(wb, wsEntries, 'Detailed Entries');

    XLSX.writeFile(wb, filename);
  }

  /**
   * Export report data to PDF
   */
  exportToPDF(reportData: ReportData, filename: string = 'emissions_report.pdf'): void {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.text('Emissions Report', 14, 20);

    // Summary
    doc.setFontSize(12);
    doc.text(`Period: ${format(reportData.periodStart, 'yyyy-MM-dd')} to ${format(reportData.periodEnd, 'yyyy-MM-dd')}`, 14, 30);
    
    doc.setFontSize(10);
    doc.text(`Total Emissions: ${reportData.totalEmissions.toFixed(2)} tCO₂e`, 14, 40);
    doc.text(`Scope 1: ${reportData.scope1Total.toFixed(2)} tCO₂e`, 14, 46);
    doc.text(`Scope 2: ${reportData.scope2Total.toFixed(2)} tCO₂e`, 14, 52);
    doc.text(`Scope 3: ${reportData.scope3Total.toFixed(2)} tCO₂e`, 14, 58);

    // Detailed entries table
    const tableData = reportData.entries.map(entry => [
      format(new Date(entry.entry_date), 'yyyy-MM-dd'),
      entry.facilities?.name || 'N/A',
      entry.scope,
      entry.category,
      entry.quantity,
      entry.unit,
      (entry.calculations?.[0]?.calculated_emissions || 0).toFixed(2),
    ]);

    (doc as any).autoTable({
      startY: 70,
      head: [['Date', 'Facility', 'Scope', 'Category', 'Quantity', 'Unit', 'CO₂e (t)']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(filename);
  }

  /**
   * Generate GHG Protocol compliant report
   */
  async generateGHGProtocolReport(year: number): Promise<{ data: ReportData | null; error: string | null }> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    
    return await this.getReportData(startDate, endDate);
  }

  /**
   * Generate monthly emissions summary
   */
  async generateMonthlySummary(year: number, month: number): Promise<{ data: ReportData | null; error: string | null }> {
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));
    
    return await this.getReportData(startDate, endDate);
  }
}

export const reportsService = new ReportsService();
