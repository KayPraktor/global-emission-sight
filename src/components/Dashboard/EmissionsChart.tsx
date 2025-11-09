import React, { useState, useMemo } from 'react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { MonthlyEmissions, CategoryBreakdown } from '@/services/analyticsService';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Calendar, Download, BarChart3, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataFreshness } from '@/components/ui/data-freshness';
import DoughnutChart from '@/components/ui/doughnut-chart';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { SampleDataBadge } from '@/components/ui/sample-data-badge';

interface EmissionsChartProps {
  monthlyData: MonthlyEmissions[];
  categoryBreakdown: CategoryBreakdown[];
  hasData: boolean;
}

const EmissionsChart: React.FC<EmissionsChartProps> = ({ monthlyData, categoryBreakdown, hasData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timePeriod, setTimePeriod] = useState('6months');
  const [visibleScopes, setVisibleScopes] = useState({
    scope1: true,
    scope2: true,
    scope3: true
  });
  
  const COLORS = {
    scope1: 'hsl(var(--destructive))',
    scope2: 'hsl(var(--primary))', 
    scope3: 'hsl(var(--secondary))',
    background: 'hsl(var(--muted))'
  };

  const CHART_COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
    'hsl(var(--destructive))',
    'hsl(var(--ring))',
  ];

  // Filter data based on time period
  const filteredData = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return [];
    
    const periodMap = {
      '3months': 3,
      '6months': 6,
      '12months': 12,
      'all': monthlyData.length
    };
    const monthsToShow = periodMap[timePeriod as keyof typeof periodMap] || 6;
    return monthlyData.slice(-monthsToShow);
  }, [timePeriod, monthlyData]);

  // Calculate insights based on actual data
  const insights = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {
        totalEmissions: '0',
        percentageChange: '0',
        isDecreasing: false,
        trend: 'stable' as const,
        averageTotal: '0',
        dominantScope: 'Scope 1',
        dominantValue: '0'
      };
    }
    
    const latestMonth = filteredData[filteredData.length - 1];
    const previousMonth = filteredData[filteredData.length - 2];
    const totalEmissions = latestMonth.scope1 + latestMonth.scope2 + latestMonth.scope3;
    const previousTotal = previousMonth?.scope1 + previousMonth?.scope2 + previousMonth?.scope3 || totalEmissions;
    const percentageChange = previousMonth ? ((totalEmissions - previousTotal) / previousTotal) * 100 : 0;
    
    const averageTotal = filteredData.reduce((sum, month) => sum + month.scope1 + month.scope2 + month.scope3, 0) / filteredData.length;
    const trend = percentageChange < -5 ? 'improving' : percentageChange > 5 ? 'worsening' : 'stable';
    
    // Find dominant scope
    const dominantScope = latestMonth.scope1 > latestMonth.scope2 && latestMonth.scope1 > latestMonth.scope3 ? 'Scope 1' :
                         latestMonth.scope2 > latestMonth.scope3 ? 'Scope 2' : 'Scope 3';
    
    return {
      totalEmissions: totalEmissions.toFixed(1),
      percentageChange: percentageChange.toFixed(1),
      isDecreasing: percentageChange < 0,
      trend,
      averageTotal: averageTotal.toFixed(1),
      dominantScope,
      dominantValue: Math.max(latestMonth.scope1, latestMonth.scope2, latestMonth.scope3).toFixed(1)
    };
  }, [filteredData]);

  // Transform categoryBreakdown data to match DoughnutChart interface
  const pieChartData = categoryBreakdown.map((item, index) => ({
    name: item.category,
    value: item.value,
    color: CHART_COLORS[index % CHART_COLORS.length],
  }));
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
      const prevMonthIndex = filteredData.findIndex(d => d.month === label) - 1;
      const prevMonthData = prevMonthIndex >= 0 ? filteredData[prevMonthIndex] : null;
      const prevTotal = prevMonthData ? prevMonthData.scope1 + prevMonthData.scope2 + prevMonthData.scope3 : null;
      const monthChange = prevTotal ? ((total - prevTotal) / prevTotal) * 100 : null;

      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="flex justify-between items-center text-sm mb-1">
              <span style={{ color: entry.color }}>{entry.name}:</span>
              <span className="font-mono">{entry.value} tCO₂e</span>
            </div>
          ))}
          <div className="mt-2 pt-2 border-t border-border">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold">{total.toFixed(1)} tCO₂e</span>
            </div>
            {monthChange !== null && (
              <div className="flex items-center gap-1 text-xs mt-1">
                {monthChange < 0 ? (
                  <TrendingDown className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingUp className="h-3 w-3 text-red-500" />
                )}
                <span className={monthChange < 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(monthChange).toFixed(1)}% vs prev month
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const toggleScope = (scope: keyof typeof visibleScopes) => {
    setVisibleScopes(prev => ({ ...prev, [scope]: !prev[scope] }));
  };

  const handleExport = () => {
    toast.success("Chart data exported successfully");
  };
  
  return (
    <div className="space-y-6 mt-6 animate-fade-in">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-foreground">Emissions Trends & Analysis</h2>
            {!hasData && <SampleDataBadge />}
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-sm text-muted-foreground">
              Latest total: {insights.totalEmissions} tCO₂e
            </span>
            <Badge variant={insights.isDecreasing ? "default" : "destructive"} className="gap-1">
              {insights.isDecreasing ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <TrendingUp className="h-3 w-3" />
              )}
              {Math.abs(parseFloat(insights.percentageChange)).toFixed(1)}%
            </Badge>
            <DataFreshness lastUpdated="2025-01-15T14:30:00Z" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-36">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="12months">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Trends Chart - Takes 2 columns */}
        <GlassmorphismCard className="xl:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Emission Trends</h3>
              <p className="text-sm text-muted-foreground">Monthly emissions by scope over time</p>
            </div>
            <div className="flex items-center gap-2">
              {(['scope1', 'scope2', 'scope3'] as const).map((scope) => (
                <Button
                  key={scope}
                  variant={visibleScopes[scope] ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleScope(scope)}
                  className="text-xs h-7"
                >
                  {scope.replace('scope', 'Scope ')}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="scope1Area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.scope1} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.scope1} stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="scope2Area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.scope2} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.scope2} stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="scope3Area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.scope3} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.scope3} stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false}
                  className="text-muted-foreground text-xs"
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  className="text-muted-foreground text-xs"
                />
                <Tooltip content={CustomTooltip} />
                <Legend />
                <ReferenceLine 
                  y={parseFloat(insights.averageTotal)} 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5"
                  label="Average"
                />
                {visibleScopes.scope1 && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="scope1"
                      name="Scope 1"
                      stroke={COLORS.scope1}
                      fill="url(#scope1Area)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="scope1"
                      stroke={COLORS.scope1}
                      strokeWidth={2}
                      dot={{ fill: COLORS.scope1, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </>
                )}
                {visibleScopes.scope2 && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="scope2"
                      name="Scope 2"
                      stroke={COLORS.scope2}
                      fill="url(#scope2Area)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="scope2"
                      stroke={COLORS.scope2}
                      strokeWidth={2}
                      dot={{ fill: COLORS.scope2, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </>
                )}
                {visibleScopes.scope3 && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="scope3"
                      name="Scope 3"
                      stroke={COLORS.scope3}
                      fill="url(#scope3Area)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="scope3"
                      stroke={COLORS.scope3}
                      strokeWidth={2}
                      dot={{ fill: COLORS.scope3, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </>
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassmorphismCard>

        {/* Sources Breakdown */}
        <GlassmorphismCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Emission Sources</h3>
              <p className="text-sm text-muted-foreground">Category breakdown</p>
            </div>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="h-[320px]">
            <DoughnutChart
              data={pieChartData}
              className="h-full"
              centerContent={
                <div className="text-center">
                  <div className="text-xs text-muted-foreground">Total Sources</div>
                  <div className="text-lg font-bold text-foreground">
                    {categoryBreakdown.reduce((sum, item) => sum + item.value, 0).toFixed(0)}
                  </div>
                  <div className="text-xs text-muted-foreground">tCO₂e</div>
                </div>
              }
            />
          </div>
        </GlassmorphismCard>
      </div>

      {/* Insights Panel */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isExpanded ? 1 : 0, 
          height: isExpanded ? 'auto' : 0 
        }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden"
      >
        <GlassmorphismCard className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Smart Analysis</h3>
            <DataFreshness lastUpdated="2025-01-15T14:25:00Z" className="ml-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dynamic Insights */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground border-b border-border pb-2">Key Insights</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  {insights.isDecreasing ? (
                    <TrendingDown className="h-4 w-4 text-green-500 mt-0.5" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-red-500 mt-0.5" />
                  )}
                  <div className="text-sm">
                    <p className="font-medium">Emissions {insights.trend}</p>
                    <p className="text-muted-foreground">
                      {Math.abs(parseFloat(insights.percentageChange))}% change from previous month
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <BarChart3 className="h-4 w-4 text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">{insights.dominantScope} is dominant</p>
                    <p className="text-muted-foreground">
                      Contributing {insights.dominantValue} tCO₂e this month
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Period average</p>
                    <p className="text-muted-foreground">
                      {insights.averageTotal} tCO₂e per month
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground border-b border-border pb-2">Recommendations</h4>
              <div className="space-y-3">
                {insights.dominantScope === 'Scope 2' && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <div className="text-sm">
                      <p className="font-medium">Focus on renewable energy</p>
                      <p className="text-muted-foreground">
                        Scope 2 dominance suggests prioritizing clean electricity
                      </p>
                    </div>
                  </div>
                )}
                {insights.trend === 'worsening' && (
                  <div className="flex items-start gap-3 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-2"></div>
                    <div className="text-sm">
                      <p className="font-medium">Investigate recent increases</p>
                      <p className="text-muted-foreground">
                        Recent trend requires immediate attention
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 p-3 bg-green-50/50 rounded-lg border border-green-100">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <div className="text-sm">
                    <p className="font-medium">Optimize data collection</p>
                    <p className="text-muted-foreground">
                      Ensure comprehensive scope 3 tracking
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Projections */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground border-b border-border pb-2">Projections</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                  <div className="w-2 h-2 rounded-full bg-purple-500 mt-2"></div>
                  <div className="text-sm">
                    <p className="font-medium">
                      {insights.trend === 'improving' ? 'Positive' : 'Challenging'} trajectory
                    </p>
                    <p className="text-muted-foreground">
                      Based on current {timePeriod.replace('months', '-month')} trend
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2"></div>
                  <div className="text-sm">
                    <p className="font-medium">Target alignment</p>
                    <p className="text-muted-foreground">
                      {insights.isDecreasing ? 'On track' : 'Requires action'} for annual goals
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-teal-50/50 rounded-lg border border-teal-100">
                  <div className="w-2 h-2 rounded-full bg-teal-500 mt-2"></div>
                  <div className="text-sm">
                    <p className="font-medium">Next review</p>
                    <p className="text-muted-foreground">
                      Monitor progress in next reporting cycle
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </GlassmorphismCard>
      </motion.div>

      {/* Toggle Button */}
      <div className="flex justify-center">
        <Button 
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          {isExpanded ? (
            <>Hide Analysis <ChevronUp className="h-4 w-4" /></>
          ) : (
            <>Show Smart Analysis <ChevronDown className="h-4 w-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EmissionsChart;
