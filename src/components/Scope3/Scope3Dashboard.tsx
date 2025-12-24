import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  BarChart3, 
  TrendingDown, 
  TrendingUp, 
  Package, 
  Truck, 
  Factory,
  Users,
  Zap,
  Recycle,
  Building2,
  Plane,
  Car,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { scope3Service, Scope3Summary } from '@/services/scope3Service';
import { CategoryBreakdown } from './CategoryBreakdown';
import { HotspotAnalysis } from './HotspotAnalysis';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const categoryIcons: Record<number, React.ReactNode> = {
  1: <Package className="h-4 w-4" />,
  2: <Factory className="h-4 w-4" />,
  3: <Zap className="h-4 w-4" />,
  4: <Truck className="h-4 w-4" />,
  5: <Recycle className="h-4 w-4" />,
  6: <Plane className="h-4 w-4" />,
  7: <Car className="h-4 w-4" />,
  8: <Building2 className="h-4 w-4" />,
  9: <Truck className="h-4 w-4" />,
  10: <Factory className="h-4 w-4" />,
  11: <Users className="h-4 w-4" />,
  12: <Recycle className="h-4 w-4" />,
  13: <Building2 className="h-4 w-4" />,
  14: <Building2 className="h-4 w-4" />,
  15: <BarChart3 className="h-4 w-4" />,
};

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export function Scope3Dashboard() {
  const { organization } = useAuth();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const { data: summary = [], isLoading } = useQuery({
    queryKey: ['scope3-summary', organization?.id, selectedYear],
    queryFn: () => organization?.id 
      ? scope3Service.getOrganizationScope3Summary(organization.id, selectedYear) 
      : Promise.resolve([]),
    enabled: !!organization?.id,
  });

  const { data: totals } = useQuery({
    queryKey: ['scope3-totals', organization?.id, selectedYear],
    queryFn: () => organization?.id 
      ? scope3Service.getTotalScope3Emissions(organization.id, selectedYear) 
      : Promise.resolve({ total: 0, upstream: 0, downstream: 0 }),
    enabled: !!organization?.id,
  });

  const { data: dataQuality } = useQuery({
    queryKey: ['scope3-quality', organization?.id, selectedYear],
    queryFn: () => organization?.id 
      ? scope3Service.getDataQualityScore(organization.id, selectedYear) 
      : Promise.resolve({ score: 0, breakdown: {} }),
    enabled: !!organization?.id,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['scope3-categories'],
    queryFn: () => scope3Service.getCategories(),
  });

  const upstreamData = summary.filter(s => s.category_number <= 8);
  const downstreamData = summary.filter(s => s.category_number > 8);

  const chartData = summary
    .filter(s => s.emissions_tco2e > 0)
    .sort((a, b) => b.emissions_tco2e - a.emissions_tco2e)
    .slice(0, 10)
    .map(s => ({
      name: `Cat ${s.category_number}`,
      fullName: s.category_name,
      emissions: Math.round(s.emissions_tco2e),
    }));

  const pieData = [
    { name: 'Upstream', value: totals?.upstream || 0, color: 'hsl(var(--chart-1))' },
    { name: 'Downstream', value: totals?.downstream || 0, color: 'hsl(var(--chart-2))' },
  ].filter(d => d.value > 0);

  const qualityBreakdownData = Object.entries(dataQuality?.breakdown || {})
    .filter(([_, count]) => (count as number) > 0)
    .map(([quality, count]) => ({
      name: quality.replace('_', ' '),
      value: count as number,
    }));

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading Scope 3 data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Scope 3</p>
                <p className="text-2xl font-bold">{formatNumber(totals?.total || 0)}</p>
                <p className="text-xs text-muted-foreground">tCO₂e</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upstream (Cat 1-8)</p>
                <p className="text-2xl font-bold">{formatNumber(totals?.upstream || 0)}</p>
                <p className="text-xs text-muted-foreground">tCO₂e</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Downstream (Cat 9-15)</p>
                <p className="text-2xl font-bold">{formatNumber(totals?.downstream || 0)}</p>
                <p className="text-xs text-muted-foreground">tCO₂e</p>
              </div>
              <ArrowDownRight className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Data Quality Score</p>
                <p className="text-2xl font-bold">{dataQuality?.score || 0}%</p>
                <Progress value={dataQuality?.score || 0} className="w-20 h-2 mt-1" />
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="hotspots">Hotspots</TabsTrigger>
          <TabsTrigger value="quality">Data Quality</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Emissions by Category Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Top Emission Categories</CardTitle>
                <CardDescription>Scope 3 emissions by GHG Protocol category</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={60} />
                      <Tooltip 
                        formatter={(value: number) => [`${formatNumber(value)} tCO₂e`, 'Emissions']}
                        labelFormatter={(label) => chartData.find(d => d.name === label)?.fullName || label}
                      />
                      <Bar dataKey="emissions" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No Scope 3 data available for {selectedYear}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upstream vs Downstream */}
            <Card>
              <CardHeader>
                <CardTitle>Upstream vs Downstream</CardTitle>
                <CardDescription>Distribution of Scope 3 emissions</CardDescription>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${formatNumber(value)} tCO₂e`, 'Emissions']} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* All Categories Summary */}
          <Card>
            <CardHeader>
              <CardTitle>All 15 GHG Protocol Categories</CardTitle>
              <CardDescription>Complete Scope 3 category coverage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(cat => {
                  const summaryData = summary.find(s => s.category_number === cat.category_number);
                  const emissions = summaryData?.emissions_tco2e || 0;
                  const percentage = totals?.total ? (emissions / totals.total) * 100 : 0;
                  
                  return (
                    <div 
                      key={cat.category_number}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {categoryIcons[cat.category_number] || <BarChart3 className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Cat {cat.category_number}
                          </span>
                          {cat.is_upstream ? (
                            <Badge variant="outline" className="text-xs">Upstream</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">Downstream</Badge>
                          )}
                        </div>
                        <p className="font-medium truncate text-sm">{cat.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-bold">
                            {emissions > 0 ? formatNumber(emissions) : '—'}
                          </span>
                          {emissions > 0 && (
                            <span className="text-xs text-muted-foreground">
                              ({percentage.toFixed(1)}%)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <CategoryBreakdown year={selectedYear} />
        </TabsContent>

        <TabsContent value="hotspots">
          <HotspotAnalysis year={selectedYear} />
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Quality Breakdown</CardTitle>
                <CardDescription>Quality of Scope 3 data by source type</CardDescription>
              </CardHeader>
              <CardContent>
                {qualityBreakdownData.length > 0 ? (
                  <div className="space-y-4">
                    {qualityBreakdownData.map(item => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            item.name === 'primary' ? 'bg-green-500' :
                            item.name === 'secondary' ? 'bg-blue-500' :
                            item.name === 'estimated' ? 'bg-amber-500' : 'bg-slate-500'
                          }`} />
                          <span className="capitalize">{item.name}</span>
                        </div>
                        <span className="font-medium">{item.value} categories</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No quality data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Improve Data Quality</CardTitle>
                <CardDescription>Recommendations to enhance accuracy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 rounded-lg border">
                    <p className="font-medium">Engage Tier 1 Suppliers</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Request primary emissions data from your largest suppliers
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="font-medium">Upgrade Spend-Based Data</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Replace estimated data with actual measurements
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <p className="font-medium">Third-Party Verification</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get your Scope 3 inventory independently verified
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
