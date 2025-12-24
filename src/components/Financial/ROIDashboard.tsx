import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  FileText, 
  ShieldCheck,
  RefreshCw,
  Download,
  BarChart3 
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Legend,
  CartesianGrid
} from 'recharts';
import { toast } from 'sonner';
import { roiTrackingService, ROITracking, ROICalculation, ROISummary } from '@/services/roiTrackingService';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export function ROIDashboard() {
  const [loading, setLoading] = useState(true);
  const [currentROI, setCurrentROI] = useState<ROICalculation | null>(null);
  const [summary, setSummary] = useState<ROISummary | null>(null);
  const [history, setHistory] = useState<ROITracking[]>([]);
  const [projectedAnnual, setProjectedAnnual] = useState<{
    projectedValue: number;
    projectedCost: number;
    projectedNet: number;
    projectedPercentage: number;
    confidence: number;
  } | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get current month's ROI calculation
      const now = new Date();
      const periodStart = startOfMonth(now);
      const periodEnd = endOfMonth(now);
      
      const [currentData, historyData, summaryData, projectedData] = await Promise.all([
        roiTrackingService.calculatePeriodROI(periodStart, periodEnd, 'monthly'),
        roiTrackingService.getROIHistory(12),
        roiTrackingService.getROISummary(),
        roiTrackingService.getProjectedAnnualROI(),
      ]);

      setCurrentROI(currentData);
      setHistory(historyData);
      setSummary(summaryData);
      setProjectedAnnual(projectedData);
    } catch (error) {
      console.error('Failed to load ROI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSnapshot = async () => {
    if (!currentROI) return;

    const result = await roiTrackingService.saveROISnapshot(currentROI, selectedPeriod);
    if (result) {
      toast.success('ROI snapshot saved');
      loadData();
    } else {
      toast.error('Failed to save snapshot');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Prepare chart data
  const roiHistoryData = summary?.monthlyHistory.map(h => ({
    period: format(new Date(h.period), 'MMM yy'),
    roi: h.roi,
    value: h.value,
  })) || [];

  const breakdownData = currentROI ? [
    { name: 'Time Savings', value: currentROI.timeSavingsValue, fill: 'hsl(142, 76%, 36%)' },
    { name: 'Report Automation', value: currentROI.reportAutomationSavings, fill: 'hsl(199, 89%, 48%)' },
    { name: 'Data Quality', value: currentROI.dataQualitySavings, fill: 'hsl(262, 83%, 58%)' },
    { name: 'Compliance', value: currentROI.complianceSavings, fill: 'hsl(48, 96%, 53%)' },
    { name: 'Penalty Avoidance', value: currentROI.penaltyAvoidance, fill: 'hsl(25, 95%, 53%)' },
    { name: 'Carbon Credits', value: currentROI.carbonCreditsChange, fill: 'hsl(173, 80%, 40%)' },
  ].filter(d => d.value > 0) : [];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Current Month Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(currentROI?.totalValue || 0)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {(currentROI?.roiPercentage || 0) >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span className={`text-sm ${(currentROI?.roiPercentage || 0) >= 0 ? 'text-green-500' : 'text-destructive'}`}>
                {formatPercent(currentROI?.roiPercentage || 0)} ROI
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Saved This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(currentROI?.timeSavedHours || 0).toFixed(1)} hrs
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Worth {formatCurrency(currentROI?.timeSavingsValue || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              YTD Total ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.netROI || 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {formatPercent(summary?.roiPercentage || 0)} return
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Projected Annual ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(projectedAnnual?.projectedNet || 0)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={projectedAnnual?.confidence || 0} className="h-2 flex-1" />
              <span className="text-xs text-muted-foreground">
                {(projectedAnnual?.confidence || 0).toFixed(0)}% confidence
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROI Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>ROI Trend</CardTitle>
            <CardDescription>Monthly ROI percentage over time</CardDescription>
          </CardHeader>
          <CardContent>
            {roiHistoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={roiHistoryData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="period" className="text-xs" />
                  <YAxis tickFormatter={(v) => `${v}%`} className="text-xs" />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      name === 'roi' ? `${value.toFixed(1)}%` : formatCurrency(value),
                      name === 'roi' ? 'ROI' : 'Value'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="roi" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.2} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No historical data yet. Save a snapshot to start tracking.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Value Breakdown Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Value Breakdown</CardTitle>
            <CardDescription>Where your savings come from</CardDescription>
          </CardHeader>
          <CardContent>
            {breakdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={breakdownData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                  <YAxis type="category" dataKey="name" width={120} className="text-xs" />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {breakdownData.map((entry, index) => (
                      <Bar key={`bar-${index}`} dataKey="value" fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                No value data for current period
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Current Period Details</CardTitle>
            <CardDescription>
              {currentROI ? format(currentROI.periodStart, 'MMMM d') : ''} - {currentROI ? format(currentROI.periodEnd, 'MMMM d, yyyy') : ''}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleSaveSnapshot}>
              <Download className="h-4 w-4 mr-2" />
              Save Snapshot
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Platform Cost</p>
              <p className="text-lg font-semibold">{formatCurrency(currentROI?.platformCost || 0)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Entries Processed</p>
              <p className="text-lg font-semibold">{currentROI?.entriesProcessed || 0}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Emissions Tracked</p>
              <p className="text-lg font-semibold">{(currentROI?.emissionsTracked || 0).toLocaleString()} tCO₂e</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Reports Generated</p>
              <p className="text-lg font-semibold">{currentROI?.reportsGenerated || 0}</p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-4">Savings Breakdown</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Clock className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Time Savings</p>
                  <p className="font-semibold">{formatCurrency(currentROI?.timeSavingsValue || 0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <FileText className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Report Automation</p>
                  <p className="font-semibold">{formatCurrency(currentROI?.reportAutomationSavings || 0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <ShieldCheck className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Compliance</p>
                  <p className="font-semibold">{formatCurrency(currentROI?.complianceSavings || 0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <BarChart3 className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Data Quality</p>
                  <p className="font-semibold">{formatCurrency(currentROI?.dataQualitySavings || 0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <TrendingDown className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Penalty Avoidance</p>
                  <p className="font-semibold">{formatCurrency(currentROI?.penaltyAvoidance || 0)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <DollarSign className="h-5 w-5 text-teal-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Carbon Credits</p>
                  <p className="font-semibold">{formatCurrency(currentROI?.carbonCreditsChange || 0)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ROI History</CardTitle>
            <CardDescription>Past snapshots and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium">Period</th>
                    <th className="text-right py-2 font-medium">Total Value</th>
                    <th className="text-right py-2 font-medium">Platform Cost</th>
                    <th className="text-right py-2 font-medium">Net ROI</th>
                    <th className="text-right py-2 font-medium">ROI %</th>
                    <th className="text-right py-2 font-medium">Entries</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id} className="border-b last:border-0">
                      <td className="py-3">
                        {format(new Date(h.period_start), 'MMM d')} - {format(new Date(h.period_end), 'MMM d, yyyy')}
                      </td>
                      <td className="text-right">{formatCurrency(h.total_roi_value)}</td>
                      <td className="text-right">{formatCurrency(h.platform_cost)}</td>
                      <td className="text-right">{formatCurrency(h.total_roi_value - h.platform_cost)}</td>
                      <td className="text-right">
                        <Badge variant={h.roi_percentage >= 0 ? 'default' : 'destructive'}>
                          {formatPercent(h.roi_percentage)}
                        </Badge>
                      </td>
                      <td className="text-right">{h.entries_processed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
