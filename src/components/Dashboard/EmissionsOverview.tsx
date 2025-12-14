
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, BarChart3, CloudRain, Factory, Truck } from 'lucide-react';
import { SampleDataBadge } from '@/components/ui/sample-data-badge';
import { Sparkline } from './Sparkline';
import { translations as t, formatPersianNumber, toPersianNumber } from '@/lib/translations';

interface EmissionsOverviewProps {
  totalEmissions: number;
  scope1Total: number;
  scope2Total: number;
  scope3Total: number;
  previousPeriodTotal: number;
  changePercentage: number;
  hasData: boolean;
  monthlyData?: Array<{ month: string; scope1: number; scope2: number; scope3: number; total: number }>;
}

const EmissionsOverview: React.FC<EmissionsOverviewProps> = ({
  totalEmissions,
  scope1Total,
  scope2Total,
  scope3Total,
  previousPeriodTotal,
  changePercentage,
  hasData,
  monthlyData = []
}) => {
  // Extract last 7 data points for sparklines
  const recentData = monthlyData.slice(-7);
  const totalTrend = recentData.map(d => d.total || 0);
  const scope1Trend = recentData.map(d => d.scope1 || 0);
  const scope2Trend = recentData.map(d => d.scope2 || 0);
  const scope3Trend = recentData.map(d => d.scope3 || 0);
  // Calculate previous period scope totals based on the same ratio
  const totalCurrent = totalEmissions || 1;
  const previousScope1 = scope1Total > 0 && previousPeriodTotal > 0 
    ? (scope1Total / totalCurrent) * previousPeriodTotal 
    : scope1Total * 1.05;
  const previousScope2 = scope2Total > 0 && previousPeriodTotal > 0
    ? (scope2Total / totalCurrent) * previousPeriodTotal 
    : scope2Total * 1.12;
  const previousScope3 = scope3Total > 0 && previousPeriodTotal > 0
    ? (scope3Total / totalCurrent) * previousPeriodTotal 
    : scope3Total * 0.95;
  
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };
  
  const formatNumber = (num: number) => {
    return formatPersianNumber(num, 1);
  };

  // Show empty state when no data
  if (!hasData) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-muted p-4">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{t.dashboard.noDataYet}</h3>
              <p className="text-muted-foreground mb-4">{t.dashboard.startTracking}</p>
              <a href="/data-entry" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                {t.dashboard.addFirstEntry}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-foreground">{t.dashboard.emissionsOverview}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="stat-label">{t.dashboard.totalEmissions}</span>
            <BarChart3 className="text-carbon h-5 w-5" />
          </div>
          <p className="stat-value">{formatNumber(totalEmissions)} tCO₂e</p>
          {totalTrend.length > 0 && (
            <Sparkline 
              data={totalTrend} 
              color="hsl(var(--carbon))"
              height={32}
              className="w-full"
            />
          )}
          <div className="stat-trend-down">
            <ArrowDownRight className="h-4 w-4 ml-1" />
            {toPersianNumber(Math.abs(changePercentage).toFixed(1))}% {t.dashboard.fromPrevious}
          </div>
        </CardContent>
      </Card>
      
      <Card className="stat-card">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="stat-label">{t.dashboard.scope1Emissions}</span>
            <Factory className="text-carbon h-5 w-5" />
          </div>
          <p className="stat-value">{formatNumber(scope1Total)} tCO₂e</p>
          {scope1Trend.length > 0 && (
            <Sparkline 
              data={scope1Trend} 
              color="hsl(var(--destructive))"
              height={32}
              className="w-full"
            />
          )}
          <div className="stat-trend-down">
            <ArrowDownRight className="h-4 w-4 ml-1" />
            {toPersianNumber(Math.abs(calculateChange(scope1Total, previousScope1)).toFixed(1))}% {t.dashboard.fromPrevious}
          </div>
        </CardContent>
      </Card>
      
      <Card className="stat-card">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="stat-label">{t.dashboard.scope2Emissions}</span>
            <CloudRain className="text-carbon h-5 w-5" />
          </div>
          <p className="stat-value">{formatNumber(scope2Total)} tCO₂e</p>
          {scope2Trend.length > 0 && (
            <Sparkline 
              data={scope2Trend} 
              color="hsl(var(--primary))"
              height={32}
              className="w-full"
            />
          )}
          <div className="stat-trend-down">
            <ArrowDownRight className="h-4 w-4 ml-1" />
            {toPersianNumber(Math.abs(calculateChange(scope2Total, previousScope2)).toFixed(1))}% {t.dashboard.fromPrevious}
          </div>
        </CardContent>
      </Card>
      
      <Card className="stat-card">
        <CardContent className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="stat-label">{t.dashboard.scope3Emissions}</span>
            <Truck className="text-carbon h-5 w-5" />
          </div>
          <p className="stat-value">{formatNumber(scope3Total)} tCO₂e</p>
          {scope3Trend.length > 0 && (
            <Sparkline 
              data={scope3Trend} 
              color="hsl(var(--accent))"
              height={32}
              className="w-full"
            />
          )}
          <div className="stat-trend-up">
            <ArrowUpRight className="h-4 w-4 ml-1" />
            {toPersianNumber(Math.abs(calculateChange(scope3Total, previousScope3)).toFixed(1))}% {t.dashboard.fromPrevious}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default EmissionsOverview;
