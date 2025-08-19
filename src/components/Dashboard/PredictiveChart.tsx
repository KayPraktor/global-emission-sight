
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Target, TrendingUp } from 'lucide-react';
import { DataFreshness } from '@/components/ui/data-freshness';

interface PredictiveDataPoint {
  period: string;
  actual?: number;
  predicted: number;
  upperBound: number;
  lowerBound: number;
  target?: number;
}

interface PredictiveChartProps {
  data: PredictiveDataPoint[];
  title: string;
  unit: string;
}

const PredictiveChart: React.FC<PredictiveChartProps> = ({ data, title, unit }) => {
  // Calculate performance metrics
  const latestActual = data.find(d => d.actual !== undefined)?.actual;
  const latestTarget = data.find(d => d.target !== undefined)?.target;
  const performance = latestActual && latestTarget ? 
    ((latestTarget - latestActual) / latestTarget * 100).toFixed(1) : null;

  return (
    <GlassmorphismCard variant="light" className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-primary" />
          <div>
            <h4 className="font-medium">{title}</h4>
            {performance && (
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">
                  {performance}% better than target
                </span>
              </div>
            )}
          </div>
        </div>
        <DataFreshness lastUpdated={new Date()} />
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="period" 
              axisLine={false}
              tickLine={false}
              className="text-muted-foreground"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              className="text-muted-foreground"
            />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${value?.toFixed(1)} ${unit}`,
                name
              ]}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            
            {/* Confidence interval */}
            <Area
              type="monotone"
              dataKey="upperBound"
              stackId="1"
              stroke="none"
              fill="hsl(var(--muted))"
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="lowerBound"
              stackId="1"
              stroke="none"
              fill="hsl(var(--background))"
              fillOpacity={1}
            />
            
            {/* Actual values */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              name="Actual"
            />
            
            {/* Predicted values */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              name="Predicted"
              opacity={0.7}
            />
            
            {/* Target line */}
            <Line
              type="monotone"
              dataKey="target"
              stroke="hsl(var(--destructive))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 4 }}
              name="Target"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassmorphismCard>
  );
};

export default PredictiveChart;
