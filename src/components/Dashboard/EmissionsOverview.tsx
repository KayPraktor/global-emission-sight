
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, BarChart3, CloudRain, Factory, Truck } from 'lucide-react';
import { calculateTotal, calculateTotalByScope } from '@/utils/dummyData';
import { SampleDataBadge } from '@/components/ui/sample-data-badge';

const EmissionsOverview: React.FC = () => {
  const scope1Total = calculateTotalByScope('Scope 1');
  const scope2Total = calculateTotalByScope('Scope 2');
  const scope3Total = calculateTotalByScope('Scope 3');
  const totalEmissions = calculateTotal();
  
  // Fictitious previous period data to show trends
  const previousTotal = totalEmissions * 1.08; // 8% higher before
  const previousScope1 = scope1Total * 1.05;
  const previousScope2 = scope2Total * 1.12;
  const previousScope3 = scope3Total * 0.95;
  
  const calculateChange = (current: number, previous: number) => {
    return ((current - previous) / previous) * 100;
  };
  
  const formatNumber = (num: number) => {
    return num.toFixed(1);
  };
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold text-foreground">Emissions Overview</h3>
        <SampleDataBadge />
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
            {Math.abs(calculateChange(totalEmissions, previousTotal)).toFixed(1)}% from previous period
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
