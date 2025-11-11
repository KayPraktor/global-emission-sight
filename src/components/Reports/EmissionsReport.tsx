
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer
} from 'recharts';
import { FileSpreadsheet, FileDown, Loader2, Calendar } from 'lucide-react';
import { toast } from "sonner";
import { reportsService } from '@/services/reportsService';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

const EmissionsReport: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [monthsBack, setMonthsBack] = useState(6);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [monthsBack]);

  const loadReportData = async () => {
    setIsLoading(true);
    const endDate = endOfMonth(new Date());
    const startDate = startOfMonth(subMonths(new Date(), monthsBack - 1));
    
    const { data, error } = await reportsService.getReportData(startDate, endDate);
    
    if (error) {
      toast.error('Failed to load report data', { description: error });
    } else {
      setReportData(data);
    }
    
    setIsLoading(false);
  };

  // Aggregate data for chart
  const getChartData = () => {
    if (!reportData || !reportData.entries || reportData.entries.length === 0) {
      return [];
    }

    const monthlyMap = new Map();
    
    reportData.entries.forEach((entry: any) => {
      const monthKey = format(new Date(entry.entry_date), 'MMM yyyy');
      const emissions = entry.calculations?.[0]?.calculated_emissions || 0;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { month: monthKey, scope1: 0, scope2: 0, scope3: 0 });
      }
      
      const data = monthlyMap.get(monthKey);
      if (entry.scope === 'S1' || entry.scope === 'scope_1') data.scope1 += emissions;
      else if (entry.scope === 'S2' || entry.scope === 'scope_2') data.scope2 += emissions;
      else if (entry.scope === 'S3' || entry.scope === 'scope_3') data.scope3 += emissions;
    });

    return Array.from(monthlyMap.values());
  };
  
  // Function to handle exporting to CSV
  const handleExportCSV = async () => {
    if (!reportData) {
      toast.error('No data to export');
      return;
    }

    setIsExporting(true);
    try {
      reportsService.exportToCSV(reportData, `emissions_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      toast.success("Report exported to CSV successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!reportData) {
      toast.error('No data to export');
      return;
    }

    setIsExporting(true);
    try {
      reportsService.exportToExcel(reportData, `emissions_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      toast.success("Report exported to Excel successfully");
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.error("Failed to export report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!reportData) {
      toast.error('No data to export');
      return;
    }

    setIsExporting(true);
    try {
      reportsService.exportToPDF(reportData, `emissions_report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success("Report exported to PDF successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };
  
  
  const chartData = getChartData();

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      {reportData && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Emissions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{reportData.totalEmissions.toFixed(2)} tCO₂e</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Scope 1</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{reportData.scope1Total.toFixed(2)} tCO₂e</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Scope 2</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{reportData.scope2Total.toFixed(2)} tCO₂e</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Scope 3</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{reportData.scope3Total.toFixed(2)} tCO₂e</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Report Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>Emissions Report</CardTitle>
            <Select value={monthsBack.toString()} onValueChange={(v) => setMonthsBack(parseInt(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 months</SelectItem>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={isExporting || !reportData}>
              {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 mr-2" />}
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={isExporting || !reportData}>
              {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileSpreadsheet className="h-4 w-4 mr-2" />}
              Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting || !reportData}>
              {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileDown className="h-4 w-4 mr-2" />}
              PDF
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground">No emissions data found for the selected period.</p>
            </div>
          ) : (
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis unit=" tCO₂e" className="text-xs" />
                  <Tooltip 
                    formatter={(value: any) => [`${Number(value).toFixed(2)} tCO₂e`, '']}
                    labelFormatter={(label) => `Month: ${label}`}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Bar dataKey="scope1" name="Scope 1" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="scope2" name="Scope 2" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="scope3" name="Scope 3" fill="hsl(var(--chart-3))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmissionsReport;
