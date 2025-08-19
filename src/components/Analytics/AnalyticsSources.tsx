
import React, { useState } from 'react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { SectionHeader } from '@/components/ui/section-header';
import { DataFreshness } from '@/components/ui/data-freshness';
import { ContextualHelp } from '@/components/ui/contextual-help';
import DoughnutChart from '@/components/ui/doughnut-chart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Info,
  Zap,
  Car,
  Flame,
  Trash2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced sample data with trends and benchmarks
const sourceData = [
  { 
    name: 'Electricity', 
    value: 45, 
    trend: 5.2,
    color: 'hsl(var(--destructive))',
    icon: Zap,
    category: 'Energy',
    benchmark: 40,
    scope: 'Scope 2'
  },
  { 
    name: 'Transportation', 
    value: 25, 
    trend: -2.1,
    color: 'hsl(var(--primary))',
    icon: Car,
    category: 'Mobility',
    benchmark: 30,
    scope: 'Scope 1'
  },
  { 
    name: 'Natural Gas', 
    value: 20, 
    trend: 1.8,
    color: 'hsl(var(--secondary))',
    icon: Flame,
    category: 'Energy',
    benchmark: 18,
    scope: 'Scope 1'
  },
  { 
    name: 'Waste', 
    value: 10, 
    trend: -0.5,
    color: 'hsl(var(--accent))',
    icon: Trash2,
    category: 'Operations',
    benchmark: 12,
    scope: 'Scope 3'
  },
];

const AnalyticsSources = () => {
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('chart');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const totalEmissions = sourceData.reduce((sum, item) => sum + item.value, 0);

  const chartData = sourceData.map(item => ({
    name: item.name,
    value: item.value,
    color: item.color
  }));

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Source,Percentage,Trend,Benchmark,Scope\n" +
      sourceData.map(item => 
        `${item.name},${item.value}%,${item.trend}%,${item.benchmark}%,${item.scope}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "emission-sources.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={BarChart3}
        title="Emission Sources Analysis"
        subtitle="Understand your carbon footprint breakdown by source"
        helpText="This analysis shows where your emissions come from, helping you identify the biggest opportunities for reduction."
        lastUpdated={new Date('2024-01-15T10:30:00')}
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'chart' ? 'list' : 'chart')}
          >
            {viewMode === 'chart' ? 'List View' : 'Chart View'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </SectionHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <GlassmorphismCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Sources Breakdown</h3>
                <Badge variant="secondary" className="text-xs">
                  {totalEmissions}% Total
                </Badge>
              </div>

              {viewMode === 'chart' ? (
                <div className="h-[300px] flex items-center justify-center">
                  <DoughnutChart
                    data={chartData}
                    innerRadius={60}
                    outerRadius={120}
                    centerContent={
                      <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{totalEmissions}%</div>
                        <div className="text-sm text-muted-foreground">Total Sources</div>
                      </div>
                    }
                    showLegend={false}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {sourceData.map((source, index) => {
                    const Icon = source.icon;
                    const isPositiveTrend = source.trend > 0;
                    const TrendIcon = isPositiveTrend ? TrendingUp : TrendingDown;
                    
                    return (
                      <div
                        key={source.name}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer",
                          selectedSource === source.name 
                            ? "bg-primary/10 border-primary/30" 
                            : "bg-background/50 border-border hover:bg-background/80"
                        )}
                        onClick={() => setSelectedSource(
                          selectedSource === source.name ? null : source.name
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: `${source.color}20` }}
                          >
                            <Icon className="h-4 w-4" style={{ color: source.color }} />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{source.name}</div>
                            <div className="text-sm text-muted-foreground">{source.category}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-foreground">{source.value}%</div>
                          <div className={cn(
                            "flex items-center gap-1 text-xs",
                            isPositiveTrend ? "text-destructive" : "text-green-600"
                          )}>
                            <TrendIcon className="h-3 w-3" />
                            {Math.abs(source.trend)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </GlassmorphismCard>
        </div>

        {/* Source Details & Insights */}
        <div className="space-y-4">
          {/* Top Sources */}
          <GlassmorphismCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Top Sources</h3>
              <div className="space-y-3">
                {sourceData.slice(0, 3).map((source, index) => {
                  const Icon = source.icon;
                  const isAboveBenchmark = source.value > source.benchmark;
                  
                  return (
                    <div key={source.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          index === 0 ? "bg-destructive" : 
                          index === 1 ? "bg-primary" : "bg-secondary"
                        )}/>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{source.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-foreground">{source.value}%</div>
                        {isAboveBenchmark && (
                          <div className="flex items-center gap-1 text-xs text-amber-600">
                            <ArrowUpRight className="h-3 w-3" />
                            Above avg
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassmorphismCard>

          {/* Key Insights */}
          <GlassmorphismCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Key Insights</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">Electricity is your largest source</p>
                    <p className="text-muted-foreground">Consider renewable energy options to reduce impact</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-600 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">Transportation emissions decreased</p>
                    <p className="text-muted-foreground">2.1% reduction from last period</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-foreground font-medium">Above industry average</p>
                    <p className="text-muted-foreground">Electricity usage 5% higher than benchmark</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassmorphismCard>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSources;
