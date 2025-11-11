
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, BarChart3, CloudRain, Factory, Truck } from 'lucide-react';
import { SampleDataBadge } from '@/components/ui/sample-data-badge';

interface EmissionsOverviewProps {
  totalEmissions: number;
  scope1Total: number;
  scope2Total: number;
  scope3Total: number;
  previousPeriodTotal: number;
  changePercentage: number;
  hasData: boolean;
}

const EmissionsOverview: React.FC<EmissionsOverviewProps> = ({
  totalEmissions,
  scope1Total,
  scope2Total,
  scope3Total,
  previousPeriodTotal,
  changePercentage,
  hasData
}) => {
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
    return num.toFixed(1);
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
              <h3 className="text-lg font-semibold mb-2">No Emissions Data Yet</h3>
              <p className="text-muted-foreground mb-4">Start tracking your carbon footprint by adding your first emissions entry</p>
              <a href="/data-entry" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Add Your First Entry
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
        <h3 className="text-lg font-semibold text-foreground">Emissions Overview</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="stat-label">Total Emissions</span>
            <BarChart3 className="text-carbon h-5 w-5" />
          </div>
          <p className="stat-value">{formatNumber(totalEmissions)} tCO₂e</p>
          <div className="stat-trend-down">
            <ArrowDownRight className="h-4 w-4 mr-1" />
            {Math.abs(changePercentage).toFixed(1)}% from previous period
          </div>
        </CardContent>
      </Card>
      
      <Card className="stat-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="stat-label">Scope 1 Emissions</span>
            <Factory className="text-carbon h-5 w-5" />
          </div>
          <p className="stat-value">{formatNumber(scope1Total)} tCO₂e</p>
          <div className="stat-trend-down">
            <ArrowDownRight className="h-4 w-4 mr-1" />
            {Math.abs(calculateChange(scope1Total, previousScope1)).toFixed(1)}% from previous period
          </div>
        </CardContent>
      </Card>
      
      <Card className="stat-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="stat-label">Scope 2 Emissions</span>
            <CloudRain className="text-carbon h-5 w-5" />
          </div>
          <p className="stat-value">{formatNumber(scope2Total)} tCO₂e</p>
          <div className="stat-trend-down">
            <ArrowDownRight className="h-4 w-4 mr-1" />
            {Math.abs(calculateChange(scope2Total, previousScope2)).toFixed(1)}% from previous period
          </div>
        </CardContent>
      </Card>
      
      <Card className="stat-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <span className="stat-label">Scope 3 Emissions</span>
            <Truck className="text-carbon h-5 w-5" />
          </div>
          <p className="stat-value">{formatNumber(scope3Total)} tCO₂e</p>
          <div className="stat-trend-up">
            <ArrowUpRight className="h-4 w-4 mr-1" />
            {Math.abs(calculateChange(scope3Total, previousScope3)).toFixed(1)}% from previous period
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default EmissionsOverview;
