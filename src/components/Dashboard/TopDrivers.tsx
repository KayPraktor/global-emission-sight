import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalyticsFilters } from '@/contexts/AnalyticsFilterContext';
import { generateSampleEmissions, filterData, computeTCO2e } from '@/utils/emissionsSample';

const TopDrivers: React.FC = () => {
  const { filters } = useAnalyticsFilters();
  const data = useMemo(() => generateSampleEmissions(12), []);

  const filtered = useMemo(() => filterData(data, {
    dateStart: filters.dateRange.from,
    dateEnd: filters.dateRange.to,
    scopes: (filters.scopes && filters.scopes.length ? filters.scopes : ['S1','S2','S3']) as any,
    countries: filters.countries || [],
  }), [data, filters]);

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of filtered) {
      map.set(r.category, (map.get(r.category) || 0) + computeTCO2e(r));
    }
    return Array.from(map.entries()).map(([category, total]) => ({ category, total: Number(total.toFixed(2)) }))
      .sort((a,b)=>b.total-a.total).slice(0,8);
  }, [filtered]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Emission Drivers (Categories)</CardTitle>
      </CardHeader>
      <CardContent className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={byCategory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" tick={{ fontSize: 12 }} interval={0} angle={-15} height={50} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v:number)=>[`${v.toFixed(2)} tCO₂e`, 'Total']} />
            <Bar dataKey="total" name="tCO₂e" radius={[4,4,0,0]} fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TopDrivers;
