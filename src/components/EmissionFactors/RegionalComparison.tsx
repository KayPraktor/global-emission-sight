import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { EmissionFactor } from '@/types/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { GitCompare } from 'lucide-react';

export const RegionalComparison = () => {
  const [factors, setFactors] = useState<EmissionFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<string>('');

  useEffect(() => {
    fetchFactors();
  }, []);

  const fetchFactors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('emission_factors')
        .select('*')
        .not('region', 'is', null)
        .order('name');

      if (error) throw error;
      setFactors(data || []);
      
      // Set initial selections
      if (data && data.length > 0) {
        const firstCategory = data[0].category;
        setSelectedCategory(firstCategory);
        const firstActivity = data.find(f => f.category === firstCategory)?.name || '';
        setSelectedActivity(firstActivity);
      }
    } catch (error: any) {
      toast.error('Failed to load emission factors');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(factors.map(f => f.category));
    return Array.from(cats).sort();
  }, [factors]);

  const activities = useMemo(() => {
    const acts = new Set(
      factors
        .filter(f => f.category === selectedCategory)
        .map(f => f.name)
    );
    return Array.from(acts).sort();
  }, [factors, selectedCategory]);

  const comparisonData = useMemo(() => {
    const filtered = factors.filter(
      f => f.name === selectedActivity && f.region
    );

    return filtered.map(f => ({
      region: f.region || 'Unknown',
      value: Number(f.factor_value),
      unit: f.unit,
      source: f.source,
      year: f.year,
      uncertainty: f.uncertainty,
      country: f.country_code,
    }));
  }, [factors, selectedActivity]);

  const stats = useMemo(() => {
    if (comparisonData.length === 0) return null;

    const values = comparisonData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = ((max - min) / avg) * 100;

    return { min, max, avg, variance };
  }, [comparisonData]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading regional data...
        </CardContent>
      </Card>
    );
  }

  if (factors.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No regional emission factors available for comparison
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Regional Emission Factor Comparison
          </CardTitle>
          <CardDescription>
            Compare emission factors across different regions to understand geographic variations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Activity</label>
              <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an activity" />
                </SelectTrigger>
                <SelectContent>
                  {activities.map(act => (
                    <SelectItem key={act} value={act}>{act}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {comparisonData.length > 0 && stats && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground mb-1">Minimum</div>
                  <div className="text-2xl font-bold">{stats.min.toFixed(4)}</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground mb-1">Maximum</div>
                  <div className="text-2xl font-bold">{stats.max.toFixed(4)}</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground mb-1">Average</div>
                  <div className="text-2xl font-bold">{stats.avg.toFixed(4)}</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground mb-1">Variance</div>
                  <div className="text-2xl font-bold">{stats.variance.toFixed(1)}%</div>
                </div>
              </div>

              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="region" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis 
                      label={{ value: comparisonData[0]?.unit || 'kg CO₂e', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                      formatter={(value: number) => [value.toFixed(6), 'Factor Value']}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="hsl(var(--primary))" name="Emission Factor" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Regional Details</h4>
                <div className="space-y-2">
                  {comparisonData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex-1">
                        <div className="font-medium">{item.region}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.country && `${item.country} • `}
                          {item.source} • {item.year || 'N/A'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-semibold">{item.value.toFixed(6)}</div>
                        <div className="text-xs text-muted-foreground">{item.unit}</div>
                        {item.uncertainty && (
                          <Badge variant="outline" className="mt-1">±{item.uncertainty}%</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {comparisonData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No regional data available for this activity
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
