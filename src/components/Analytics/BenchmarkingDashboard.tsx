import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';

interface Benchmark {
  industry: string;
  metric_type: string;
  unit: string;
  p10?: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export function BenchmarkingDashboard() {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedMetric, setSelectedMetric] = useState<string>('per_revenue');
  const [userValue, setUserValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBenchmarks();
  }, []);

  useEffect(() => {
    if (selectedIndustry) {
      calculateUserValue();
    }
  }, [selectedIndustry, selectedMetric]);

  const loadBenchmarks = async () => {
    try {
      const { data, error } = await supabase
        .from('industry_benchmarks')
        .select('*')
        .eq('year', 2024);

      if (error) throw error;
      
      const industries = Array.from(new Set(data?.map(b => b.industry) || []));
      if (industries.length > 0 && !selectedIndustry) {
        setSelectedIndustry(industries[0]);
      }
      
      setBenchmarks(data || []);
    } catch (error) {
      console.error('Error loading benchmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateUserValue = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get total emissions
      const { data: emissions } = await supabase
        .from('emissions_entries')
        .select('calculations(calculated_emissions)')
        .eq('user_id', user.id);

      const totalEmissions = emissions?.reduce(
        (sum, e) => sum + (e.calculations?.[0]?.calculated_emissions || 0),
        0
      ) || 0;

      // Get facility data for normalization
      const { data: facilities } = await supabase
        .from('facilities')
        .select('*')
        .eq('user_id', user.id);

      // For now, use a simple estimate (revenue $10M, 100 employees)
      // In production, this would come from facility/organization data
      let normalizedValue = 0;
      if (selectedMetric === 'per_revenue') {
        normalizedValue = (totalEmissions / 1000) / 10; // tCO2e per $M
      } else if (selectedMetric === 'per_employee') {
        normalizedValue = (totalEmissions / 1000) / 100; // tCO2e per FTE
      }

      setUserValue(normalizedValue);
    } catch (error) {
      console.error('Error calculating user value:', error);
    }
  };

  const getPercentileRank = (value: number, benchmark: Benchmark): number => {
    if (value <= benchmark.p25) return 25;
    if (value <= benchmark.p50) return 50;
    if (value <= benchmark.p75) return 75;
    if (value <= benchmark.p90) return 90;
    return 95;
  };

  const currentBenchmark = benchmarks.find(
    b => b.industry === selectedIndustry && b.metric_type === selectedMetric
  );

  const chartData = currentBenchmark ? [
    { name: 'Top 10%', value: currentBenchmark.p10 || 0, fill: 'hsl(var(--chart-1))' },
    { name: '25th %ile', value: currentBenchmark.p25, fill: 'hsl(var(--chart-2))' },
    { name: 'Median', value: currentBenchmark.p50, fill: 'hsl(var(--chart-3))' },
    { name: '75th %ile', value: currentBenchmark.p75, fill: 'hsl(var(--chart-4))' },
    { name: '90th %ile', value: currentBenchmark.p90, fill: 'hsl(var(--chart-5))' },
    ...(userValue ? [{ name: 'Your Org', value: userValue, fill: 'hsl(var(--primary))' }] : []),
  ] : [];

  const industries = Array.from(new Set(benchmarks.map(b => b.industry)));

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const percentileRank = currentBenchmark && userValue 
    ? getPercentileRank(userValue, currentBenchmark) 
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Industry Benchmarking
            </CardTitle>
            <CardDescription>
              Compare your performance against industry standards
            </CardDescription>
          </div>
          {percentileRank && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Your Percentile</p>
              <div className="flex items-center gap-2">
                <Badge variant={percentileRank <= 50 ? 'default' : 'destructive'} className="text-lg">
                  {percentileRank}th
                </Badge>
                {percentileRank <= 50 ? (
                  <TrendingDown className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                )}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Industry</label>
            <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
              <SelectTrigger>
                <SelectValue placeholder="Select industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map(industry => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Metric</label>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per_revenue">Per Revenue</SelectItem>
                <SelectItem value="per_employee">Per Employee</SelectItem>
                <SelectItem value="per_sqft">Per Square Foot</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {currentBenchmark && (
          <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value.toFixed(2)} ${currentBenchmark.unit}`, 'Value']}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Industry Median</p>
                    <p className="text-2xl font-bold">{currentBenchmark.p50.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{currentBenchmark.unit}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Top Performers</p>
                    <p className="text-2xl font-bold text-green-600">{currentBenchmark.p25.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{currentBenchmark.unit}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-1">Your Performance</p>
                    <p className="text-2xl font-bold text-primary">
                      {userValue ? userValue.toFixed(2) : 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground">{currentBenchmark.unit}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {userValue && percentileRank && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium mb-2">Performance Analysis:</p>
                <p className="text-sm text-muted-foreground">
                  {percentileRank <= 25 
                    ? '🌟 Excellent! You\'re performing in the top quartile of your industry.'
                    : percentileRank <= 50
                    ? '✅ Good performance. You\'re better than half of your industry peers.'
                    : percentileRank <= 75
                    ? '⚠️ Room for improvement. Consider implementing efficiency measures to reach industry median.'
                    : '🔴 High emissions intensity. Focus on reduction strategies to improve performance.'}
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
