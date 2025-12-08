import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart3, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface IndustryKPI {
  id: string;
  industry: string;
  kpi_name: string;
  kpi_key: string;
  unit: string;
  description: string | null;
  calculation_method: string | null;
  benchmark_low: number | null;
  benchmark_medium: number | null;
  benchmark_high: number | null;
  display_order: number;
}

interface KPIWithValue extends IndustryKPI {
  currentValue: number | null;
  trend: 'up' | 'down' | 'stable';
  performance: 'good' | 'average' | 'poor';
}

export function IndustryKPIPanel() {
  const { organization, user } = useAuth();
  const [kpis, setKpis] = useState<KPIWithValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [orgIndustry, setOrgIndustry] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!organization?.id) return;
      
      // Get org industry
      const { data: orgData } = await supabase
        .from('organizations')
        .select('industry')
        .eq('id', organization.id)
        .single();
      
      if (!orgData?.industry) {
        setLoading(false);
        return;
      }

      setOrgIndustry(orgData.industry);

      // Get industry KPI presets
      const { data: kpiData, error } = await supabase
        .from('industry_kpi_presets')
        .select('*')
        .eq('industry', orgData.industry)
        .order('display_order');

      if (error || !kpiData) {
        setLoading(false);
        return;
      }

      // Get emissions data to calculate actual KPIs
      const { data: emissions } = await supabase
        .from('emissions_entries')
        .select('*, calculations(calculated_emissions)')
        .eq('organization_id', organization.id);

      const totalEmissions = emissions?.reduce(
        (sum, e) => sum + (e.calculations?.[0]?.calculated_emissions || 0),
        0
      ) || 0;

      // Get facilities for normalization
      const { data: facilities } = await supabase
        .from('facilities')
        .select('*')
        .eq('organization_id', organization.id);

      const totalEmployees = facilities?.reduce((sum, f) => sum + (f.employees || 0), 0) || 100;
      const totalRevenue = facilities?.reduce((sum, f) => sum + (f.annual_revenue || 0), 0) || 10000000;

      // Calculate KPI values
      const kpisWithValues: KPIWithValue[] = kpiData.map(kpi => {
        let currentValue: number | null = null;
        
        // Simple calculations based on KPI type
        switch (kpi.kpi_key) {
          case 'carbon_intensity_production':
          case 'carbon_intensity_generation':
            currentValue = totalEmissions / 1000; // Simplified
            break;
          case 'scope1_share':
            currentValue = 45; // Would need scope breakdown
            break;
          case 'renewable_share':
          case 'clean_energy_ratio':
            currentValue = 25; // Would need energy data
            break;
          case 'waste_diversion':
            currentValue = 65; // Would need waste data
            break;
          case 'financed_intensity':
          case 'portfolio_footprint':
            currentValue = totalEmissions / (totalRevenue / 1000000);
            break;
          case 'office_per_employee':
            currentValue = totalEmissions / totalEmployees;
            break;
          default:
            currentValue = Math.random() * 100; // Placeholder
        }

        // Determine performance
        let performance: 'good' | 'average' | 'poor' = 'average';
        if (kpi.benchmark_low && kpi.benchmark_medium && currentValue !== null) {
          if (currentValue <= kpi.benchmark_low) performance = 'good';
          else if (currentValue >= kpi.benchmark_medium) performance = 'poor';
        }

        return {
          ...kpi,
          currentValue,
          trend: Math.random() > 0.5 ? 'down' : 'up', // Would need historical data
          performance
        };
      });

      setKpis(kpisWithValues);
      setLoading(false);
    };

    fetchData();
  }, [organization, user]);

  const formatIndustryName = (industry: string) => {
    return industry.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'good': return 'text-green-500';
      case 'poor': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getPerformanceProgress = (kpi: KPIWithValue) => {
    if (!kpi.currentValue || !kpi.benchmark_high) return 50;
    const progress = Math.min(100, Math.max(0, (kpi.currentValue / kpi.benchmark_high) * 100));
    // Invert for KPIs where lower is better
    return 100 - progress;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!orgIndustry || kpis.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Industry KPIs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Set your organization's industry in Settings to see relevant KPIs.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Industry KPIs
          <Badge variant="secondary">{formatIndustryName(orgIndustry)}</Badge>
        </CardTitle>
        <CardDescription>
          Key performance indicators relevant to your industry
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.id} className="bg-muted/30">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{kpi.kpi_name}</p>
                    <p className="text-xs text-muted-foreground">{kpi.description}</p>
                  </div>
                  <div className={getPerformanceColor(kpi.performance)}>
                    {kpi.trend === 'down' ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : kpi.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <Minus className="h-4 w-4" />
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold">
                      {kpi.currentValue?.toFixed(1) || 'N/A'}
                    </span>
                    <span className="text-xs text-muted-foreground">{kpi.unit}</span>
                  </div>
                  <Progress 
                    value={getPerformanceProgress(kpi)} 
                    className="h-1.5"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Poor</span>
                    <span>Good</span>
                  </div>
                </div>

                {kpi.benchmark_low && kpi.benchmark_medium && (
                  <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                    <span>Benchmark: </span>
                    <span className="text-green-600">&lt;{kpi.benchmark_low}</span>
                    <span> | </span>
                    <span className="text-yellow-600">{kpi.benchmark_low}-{kpi.benchmark_medium}</span>
                    <span> | </span>
                    <span className="text-red-600">&gt;{kpi.benchmark_medium}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
