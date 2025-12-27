import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, LabelList } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { TornadoDataPoint } from '@/services/sensitivityAnalysisService';

interface TornadoChartProps {
  data: TornadoDataPoint[];
  baseValue: number;
  title?: string;
  description?: string;
}

interface ProcessedDataPoint {
  parameter: string;
  positiveBar: number;
  negativeBar: number;
  lowImpact: number;
  highImpact: number;
  lowLabel: string;
  highLabel: string;
}

export const TornadoChart: React.FC<TornadoChartProps> = ({
  data,
  baseValue,
  title = 'Tornado Diagram',
  description = 'Sensitivity of net benefit to parameter changes'
}) => {
  // Process data for dual-bar tornado visualization
  const processedData: ProcessedDataPoint[] = data.map(item => {
    const minImpact = Math.min(item.lowImpact, item.highImpact);
    const maxImpact = Math.max(item.lowImpact, item.highImpact);
    
    return {
      parameter: item.parameter,
      positiveBar: maxImpact > 0 ? maxImpact : 0,
      negativeBar: minImpact < 0 ? minImpact : 0,
      lowImpact: item.lowImpact,
      highImpact: item.highImpact,
      lowLabel: item.lowLabel,
      highLabel: item.highLabel
    };
  });

  // Calculate chart domain
  const allValues = data.flatMap(d => [d.lowImpact, d.highImpact]);
  const maxAbsValue = Math.max(...allValues.map(Math.abs), 1);
  const chartDomain = [-maxAbsValue * 1.2, maxAbsValue * 1.2];

  const formatValue = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload as ProcessedDataPoint;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">{data.parameter}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Low ({data.lowLabel}):</span>
              <span className={data.lowImpact >= 0 ? 'text-chart-2' : 'text-destructive'}>
                {formatValue(data.lowImpact)}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">High ({data.highLabel}):</span>
              <span className={data.highImpact >= 0 ? 'text-chart-2' : 'text-destructive'}>
                {formatValue(data.highImpact)}
              </span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-border">
              <span className="text-muted-foreground">Range:</span>
              <span className="font-medium text-foreground">
                {formatValue(Math.abs(data.highImpact - data.lowImpact))}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              layout="vertical"
              margin={{ top: 20, right: 60, left: 120, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis 
                type="number" 
                domain={chartDomain}
                tickFormatter={formatValue}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                type="category" 
                dataKey="parameter" 
                width={110}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={0} stroke="hsl(var(--foreground))" strokeWidth={2} />
              
              {/* Negative impact bars (red) */}
              <Bar 
                dataKey="negativeBar" 
                stackId="tornado"
                fill="hsl(var(--destructive))"
                radius={[4, 0, 0, 4]}
              >
                {processedData.map((entry, index) => (
                  <Cell 
                    key={`neg-${index}`} 
                    fill={entry.negativeBar < 0 ? 'hsl(var(--destructive))' : 'transparent'}
                  />
                ))}
              </Bar>
              
              {/* Positive impact bars (green) */}
              <Bar 
                dataKey="positiveBar" 
                stackId="tornado"
                fill="hsl(var(--chart-2))"
                radius={[0, 4, 4, 0]}
              >
                {processedData.map((entry, index) => (
                  <Cell 
                    key={`pos-${index}`} 
                    fill={entry.positiveBar > 0 ? 'hsl(var(--chart-2))' : 'transparent'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive" />
            <span className="text-muted-foreground">Negative Impact</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-chart-2" />
            <span className="text-muted-foreground">Positive Impact</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
