import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Building, 
  Factory
} from 'lucide-react';
import type { Facility } from '@/utils/facilityData';
import { industries, facilityTypes } from '@/utils/facilityData';

interface AnalyticsPanelProps {
  facilities: Facility[];
  selectedCountries: string[];
  totalEmissions: number;
  periodChange: number;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  facilities,
  selectedCountries,
  totalEmissions,
  periodChange
}) => {
  // Calculate analytics
  const facilityStats = React.useMemo(() => {
    const filtered = facilities.filter(f => 
      (selectedCountries.length === 0 || selectedCountries.includes(f.country))
    );

    const byIndustry = filtered.reduce((acc, f) => {
      if (!acc[f.industry]) acc[f.industry] = { count: 0, employees: 0, revenue: 0 };
      acc[f.industry].count++;
      acc[f.industry].employees += f.employees;
      acc[f.industry].revenue += f.annual_revenue;
      return acc;
    }, {} as Record<string, { count: number; employees: number; revenue: number }>);

    const byType = filtered.reduce((acc, f) => {
      if (!acc[f.type]) acc[f.type] = 0;
      acc[f.type]++;
      return acc;
    }, {} as Record<string, number>);

    const totalEmployees = filtered.reduce((sum, f) => sum + f.employees, 0);
    const totalRevenue = filtered.reduce((sum, f) => sum + f.annual_revenue, 0);
    const avgEmissionIntensity = totalEmissions / Math.max(1, totalRevenue / 1000000); // per million revenue

    return {
      totalFacilities: filtered.length,
      totalEmployees,
      totalRevenue,
      avgEmissionIntensity,
      byIndustry,
      byType,
      filtered
    };
  }, [facilities, selectedCountries, totalEmissions]);

  return (
    <div className="space-y-4">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Building className="h-4 w-4 text-primary" />
              <div className="text-sm text-muted-foreground">Facilities</div>
            </div>
            <div className="text-2xl font-semibold">{facilityStats.totalFacilities}</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Factory className="h-4 w-4 text-secondary" />
              <div className="text-sm text-muted-foreground">Employees</div>
            </div>
            <div className="text-2xl font-semibold">{facilityStats.totalEmployees.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-accent" />
              <div className="text-sm text-muted-foreground">Intensity</div>
            </div>
            <div className="text-lg font-semibold">{facilityStats.avgEmissionIntensity.toFixed(1)}</div>
            <div className="text-xs text-muted-foreground">tCO2e/M$ revenue</div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {periodChange >= 0 ? 
                <TrendingUp className="h-4 w-4 text-destructive" /> : 
                <TrendingDown className="h-4 w-4 text-green-500" />
              }
              <div className="text-sm text-muted-foreground">Change</div>
            </div>
            <div className="text-lg font-semibold">{Math.abs(periodChange).toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">vs. previous period</div>
          </CardContent>
        </Card>
      </div>

      {/* Industry Breakdown */}
      <Card className="floating-panel">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building className="h-5 w-5" />
            Industry Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(facilityStats.byIndustry).map(([industry, stats]) => {
            const industryInfo = industries[industry as keyof typeof industries];
            const percentage = (stats.count / facilityStats.totalFacilities) * 100;
            
            return (
              <div key={industry} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{industryInfo.icon}</span>
                    <span className="font-medium capitalize">{industry}</span>
                    <Badge variant="outline" className="text-xs">
                      {stats.count} facilities
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {percentage.toFixed(1)}%
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {stats.employees.toLocaleString()} employees • 
                  ${(stats.revenue / 1000000).toFixed(1)}M revenue
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};