
import React, { useState, useRef } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart,
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  Brush,
  ReferenceLine,
  TooltipProps,
  Bar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ZoomIn, 
  ZoomOut, 
  Download, 
  Maximize2, 
  Filter,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface InteractiveChartProps {
  data: any[];
  title: string;
  xKey: string;
  yKeys: Array<{
    key: string;
    label: string;
    color: string;
    visible?: boolean;
  }>;
  unit?: string;
  height?: number;
  showBrush?: boolean;
  showReference?: boolean;
  referenceValue?: number;
  onDataPointClick?: (data: any) => void;
  onExport?: () => void;
  className?: string;
}

const CustomTooltip: React.FC<TooltipProps<any, any> & { unit?: string }> = ({ 
  active, 
  payload, 
  label, 
  unit = '' 
}) => {
  if (!active || !payload || !payload.length) return null;

  const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);

  return (
    <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[200px]">
      <div className="mb-2">
        <p className="font-medium text-card-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">
          Total: {total.toLocaleString()} {unit}
        </p>
      </div>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm font-medium">{entry.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono">
                {entry.value?.toLocaleString()} {unit}
              </span>
              {/* Trend indicator */}
              <div className="w-4 h-4 flex items-center justify-center">
                {Math.random() > 0.5 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : Math.random() > 0.5 ? (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                ) : (
                  <Minus className="h-3 w-3 text-gray-400" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export function InteractiveChart({
  data,
  title,
  xKey,
  yKeys,
  unit = '',
  height = 400,
  showBrush = true,
  showReference = false,
  referenceValue,
  onDataPointClick,
  onExport,
  className = ''
}: InteractiveChartProps) {
  const [visibleLines, setVisibleLines] = useState<Set<string>>(
    new Set(yKeys.filter(key => key.visible !== false).map(key => key.key))
  );
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const toggleLineVisibility = (key: string) => {
    const newVisible = new Set(visibleLines);
    if (newVisible.has(key)) {
      newVisible.delete(key);
    } else {
      newVisible.add(key);
    }
    setVisibleLines(newVisible);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.5));
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDataPointClick = (data: any) => {
    if (onDataPointClick) {
      onDataPointClick(data);
    }
  };

  // Prepare composed data and utilities
  const dataWithTotal = data.map((d) => {
    const total = yKeys.reduce((sum, y) => sum + (d[y.key] ?? 0), 0);
    return { ...d, __total: total };
  });
  const dataLength = dataWithTotal.length;

  const createEndBlinkingDot = (dataLen: number, color: string) => (props: any) => {
    const { cx, cy, index } = props;
    if (index !== dataLen - 1) return null;
    return (
      <g>
        <circle cx={cx} cy={cy} r={5} fill={color} stroke="white" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={10} fill={color} className="pulse" opacity={0.35} />
      </g>
    );
  };
  
  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleFullscreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Interactive Legend */}
        <div className="flex flex-wrap gap-2 mt-2">
          {yKeys.map((yKey) => (
            <Badge
              key={yKey.key}
              variant={visibleLines.has(yKey.key) ? "default" : "outline"}
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => toggleLineVisibility(yKey.key)}
              style={{
                backgroundColor: visibleLines.has(yKey.key) ? yKey.color : 'transparent',
                borderColor: yKey.color,
                color: visibleLines.has(yKey.key) ? 'white' : yKey.color
              }}
            >
              {yKey.label}
            </Badge>
          ))}
        </div>
      </CardHeader>
      
      <CardContent ref={chartRef}>
        <ResponsiveContainer width="100%" height={isFullscreen ? height * 1.5 : height}>
          <ComposedChart
            data={dataWithTotal}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            onClick={handleDataPointClick}
          >
            <defs>
              <linearGradient id="totalBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.9} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey={xKey} 
              tick={{ fontSize: 12 }}
              stroke="#64748b"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#64748b"
              tickFormatter={(value) => `${value} ${unit}`}
            />
            <Tooltip 
              content={<CustomTooltip unit={unit} />}
              cursor={{ stroke: '#64748b', strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            
            {/* Reference Line */}
            {showReference && referenceValue && (
              <ReferenceLine 
                y={referenceValue} 
                stroke="#dc2626" 
                strokeDasharray="8 8"
                label={{ value: `Target: ${referenceValue} ${unit}`, position: "insideTopRight" }}
              />
            )}

            {/* Total bar behind lines */}
            <Bar
              dataKey="__total"
              fill="url(#totalBarGradient)"
              barSize={16}
              radius={[6, 6, 0, 0]}
              opacity={0.35}
            />
            
            {/* Data Lines with blinking end dots */}
            {yKeys.map((yKey) => (
              <Line
                key={yKey.key}
                type="monotone"
                dataKey={yKey.key}
                stroke={yKey.color}
                strokeWidth={2}
                dot={createEndBlinkingDot(dataLength, yKey.color)}
                activeDot={{ 
                  r: 6, 
                  fill: yKey.color,
                  stroke: 'white',
                  strokeWidth: 2
                }}
                hide={!visibleLines.has(yKey.key)}
                connectNulls={false}
                animationDuration={300}
              />
            ))}
            
            {/* Brush for zooming */}
            {showBrush && (
              <Brush 
                dataKey={xKey} 
                height={30} 
                stroke="#64748b"
                fill="#f1f5f9"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
        
        {/* Chart Statistics */}
        <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {yKeys.filter(key => visibleLines.has(key.key)).map((yKey) => {
            const values = data.map(d => d[yKey.key]).filter(v => v != null);
            const min = Math.min(...values);
            const max = Math.max(...values);
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            
            return (
              <div key={yKey.key} className="space-y-1">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: yKey.color }}
                  />
                  <span className="font-medium">{yKey.label}</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-0.5">
                  <div>Min: {min.toFixed(1)} {unit}</div>
                  <div>Max: {max.toFixed(1)} {unit}</div>
                  <div>Avg: {avg.toFixed(1)} {unit}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
