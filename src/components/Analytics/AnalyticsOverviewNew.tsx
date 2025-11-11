import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart3, ChartPie, LineChartIcon } from 'lucide-react';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Legend, 
  Bar, 
  Line, 
  Pie, 
  Cell, 
  ReferenceLine, 
  ResponsiveContainer, 
  Tooltip,
  Area 
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { analyticsService, MonthlyEmissions } from '@/services/analyticsService';
import { useAnalyticsFilters } from '@/contexts/AnalyticsFilterContext';
import { format, subMonths } from 'date-fns';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const chartConfig = {
  emissions: {
    label: "CO₂e Emissions",
    theme: {
      light: "#159947",
      dark: "#159947",
    },
  },
  target: {
    label: "Target",
    theme: {
      light: "#2c7da0",
      dark: "#2c7da0",
    },
  },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-3 border border-border rounded-lg shadow-lg">
        <p className="font-medium text-sm mb-1">{`${label}`}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex justify-between items-center text-xs">
            <span style={{ color: entry.color }}>{entry.name}: </span>
            <span className="font-medium">{entry.value} {entry.unit || 'tCO₂e'}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsOverviewNew = () => {
  const { filters } = useAnalyticsFilters();
  const [chartData, setChartData] = useState<Array<{ month: string; emissions: number; target: number }>>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [intensityData, setIntensityData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const summary = await analyticsService.getAnalyticsSummary(12);
        
        // Prepare data for emissions vs target chart
        const formattedChartData = summary.monthlyData.map(month => ({
          month: month.month,
          emissions: month.total,
          target: summary.totalEmissions > 0 ? summary.totalEmissions * 0.9 : 300, // 10% reduction target
        }));
        
        setChartData(formattedChartData);

        // Prepare category breakdown for pie chart
        const pieData = summary.categoryBreakdown.slice(0, 6).map(cat => ({
          name: cat.category,
          value: cat.value,
        }));
        setCategoryData(pieData);

        // Calculate emission intensity trend (emissions per month over time)
        const yearData: any[] = [];
        for (let i = 5; i >= 0; i--) {
          const date = subMonths(new Date(), i * 12);
          const year = format(date, 'yyyy');
          const intensity = summary.totalEmissions > 0 
            ? parseFloat((summary.totalEmissions / (6 - i + 1) * 10).toFixed(1))
            : 60 - (i * 5);
          yearData.push({ year, intensity });
        }
        setIntensityData(yearData);

      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  // Empty state
  if (!isLoading && chartData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Analytics Data Yet</h3>
          <p className="text-muted-foreground mb-4">Start adding emissions data to see analytics</p>
          <a href="/data-entry" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Add Emissions Data
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="overflow-hidden border-t-4 border-t-green-500 hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
              Emissions vs Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[350px]" config={chartConfig}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#159947" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#159947" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <YAxis 
                  unit=" tCO₂e" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <Tooltip content={CustomTooltip} />
                <Legend 
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar 
                  dataKey="emissions" 
                  fill="url(#colorEmissions)" 
                  name="Actual Emissions" 
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                  animationDuration={1500}
                />
                <ReferenceLine y={chartData[0]?.target || 300} stroke="#2c7da0" strokeWidth={2} strokeDasharray="3 3" label={{ value: 'Target', position: 'right', fill: '#2c7da0' }} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-t-4 border-t-blue-500 hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ChartPie className="h-5 w-5 mr-2 text-blue-500" />
              Emission Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[350px]" config={chartConfig}>
              <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => categoryData.length > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={120}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1500}
                  paddingAngle={2}
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke="#fff" 
                      strokeWidth={2} 
                    />
                  ))}
                </Pie>
                <Tooltip content={CustomTooltip} formatter={(value) => [`${value} tCO₂e`, 'Emissions']} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6 overflow-hidden border-t-4 border-t-purple-500 hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle className="flex items-center">
            <LineChartIcon className="h-5 w-5 mr-2 text-purple-500" />
            Emission Intensity Over Time
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ChartContainer className="h-full" config={chartConfig}>
            <LineChart data={intensityData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#159947" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#159947" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <YAxis 
                unit=" tCO₂e/M$" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#666', fontSize: 12 }}
              />
              <Tooltip content={CustomTooltip} />
              <Legend 
                verticalAlign="top"
                height={36}
                iconType="circle" 
                iconSize={8}
              />
              <ReferenceLine 
                y={50} 
                label={{ 
                  value: 'Target', 
                  position: 'left', 
                  fill: '#ff7300',
                  fontSize: 12
                }} 
                stroke="#ff7300" 
                strokeDasharray="3 3" 
              />
              <Area
                type="monotone"
                dataKey="intensity"
                stroke="#159947"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorIntensity)"
                name="Emissions Intensity"
                animationDuration={1500}
                dot={{ stroke: '#159947', strokeWidth: 2, r: 4, fill: '#fff' }}
                activeDot={{ r: 6, stroke: '#159947', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsOverviewNew;
