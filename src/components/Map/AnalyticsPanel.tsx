import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Zap, 
  Building, 
  Factory,
  AlertTriangle,
  Award
} from 'lucide-react';
import type { Facility } from '@/utils/facilityData';
import { industries, facilityTypes } from '@/utils/facilityData';

interface AnalyticsPanelProps {
  facilities: Facility[];
  selectedCountries: string[];
  selectedIndustries: string[];
  totalEmissions: number;
  periodChange: number;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  facilities,
  selectedCountries,
  selectedIndustries,
  totalEmissions,
  periodChange
}) => {
  // Calculate analytics
  const facilityStats = React.useMemo(() => {
    const filtered = facilities.filter(f => 
      (selectedCountries.length === 0 || selectedCountries.includes(f.country)) &&
      (selectedIndustries.length === 0 || selectedIndustries.includes(f.industry))
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
  }, [facilities, selectedCountries, selectedIndustries, totalEmissions]);

  const topEmitters = React.useMemo(() => {
    return facilityStats.filtered
      .map(f => ({
        ...f,
        estimatedEmissions: (f.annual_revenue / 1000000) * industries[f.industry].intensity * (Math.random() * 0.5 + 0.75) // Mock calculation
      }))
      .sort((a, b) => b.estimatedEmissions - a.estimatedEmissions)
      .slice(0, 5);
  }, [facilityStats.filtered]);

  const reductionOpportunities = React.useMemo(() => {
    const opportunities = [];
    
    if (facilityStats.byIndustry.manufacturing?.count > 0) {
      opportunities.push({
        title: 'Manufacturing Efficiency',
        description: 'Implement energy-efficient equipment in manufacturing facilities',
        impact: 15,
        cost: 'Medium',
        facilities: facilityStats.byIndustry.manufacturing.count
      });
    }

    if (facilityStats.byType.office > 3) {
      opportunities.push({
        title: 'Office HVAC Optimization',
        description: 'Smart building systems for office locations',
        impact: 12,
        cost: 'Low',
        facilities: facilityStats.byType.office
      });
    }

    if (facilityStats.totalEmployees > 1000) {
      opportunities.push({
        title: 'Remote Work Program',
        description: 'Reduce commuting emissions through hybrid work',
        impact: 8,
        cost: 'Low',
        facilities: Object.keys(facilityStats.byType).length
      });
    }

    return opportunities;
  }, [facilityStats]);

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

      {/* Top Emitters */}
      <Card className="floating-panel">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Top Emission Sources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topEmitters.map((facility, index) => {
            const typeInfo = facilityTypes[facility.type];
            const industryInfo = industries[facility.industry];
            
            return (
              <div key={facility.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                <div className="text-lg">{index + 1}</div>
                <div className="text-lg">{typeInfo.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{facility.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {facility.city} • {industryInfo.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{facility.estimatedEmissions.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">tCO2e/month</div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Reduction Opportunities */}
      <Card className="floating-panel">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Reduction Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reductionOpportunities.map((opportunity, index) => (
            <div key={index} className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <Award className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="flex-1">
                  <div className="font-medium">{opportunity.title}</div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {opportunity.description}
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-green-500">↓</span>
                      <span>{opportunity.impact}% reduction potential</span>
                    </div>
                    <Badge variant="outline">
                      {opportunity.cost} cost
                    </Badge>
                    <span className="text-muted-foreground">
                      {opportunity.facilities} facilities
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};