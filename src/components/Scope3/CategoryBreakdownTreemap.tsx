import React, { useMemo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, TrendingDown, AlertTriangle } from 'lucide-react';
import { formatEmissions } from '@/utils/scope3SankeyTransform';

// Detailed breakdown data for each category
const CATEGORY_BREAKDOWNS: Record<number, {
  name: string;
  children: Array<{
    name: string;
    size: number;
    type: 'supplier' | 'material' | 'activity';
    trend?: 'up' | 'down' | 'stable';
  }>;
}> = {
  1: {
    name: 'Purchased Goods & Services',
    children: [
      { name: 'Raw Materials', size: 15200, type: 'material', trend: 'down' },
      { name: 'Packaging', size: 8400, type: 'material', trend: 'stable' },
      { name: 'Electronics', size: 7200, type: 'material', trend: 'up' },
      { name: 'Chemicals', size: 5800, type: 'material', trend: 'down' },
      { name: 'Metal Components', size: 4600, type: 'material', trend: 'stable' },
      { name: 'Plastics', size: 2100, type: 'material', trend: 'down' },
      { name: 'Services', size: 1900, type: 'activity', trend: 'stable' },
    ]
  },
  2: {
    name: 'Capital Goods',
    children: [
      { name: 'Manufacturing Equipment', size: 4200, type: 'material', trend: 'stable' },
      { name: 'IT Infrastructure', size: 2100, type: 'material', trend: 'up' },
      { name: 'Facility Construction', size: 1400, type: 'activity', trend: 'down' },
      { name: 'Vehicles', size: 700, type: 'material', trend: 'down' },
    ]
  },
  3: {
    name: 'Fuel & Energy Activities',
    children: [
      { name: 'Grid Electricity T&D', size: 3100, type: 'activity', trend: 'down' },
      { name: 'Natural Gas Extraction', size: 1800, type: 'activity', trend: 'stable' },
      { name: 'Fuel Production', size: 1300, type: 'activity', trend: 'down' },
    ]
  },
  4: {
    name: 'Upstream Transport',
    children: [
      { name: 'Ocean Freight', size: 4800, type: 'activity', trend: 'stable' },
      { name: 'Road Transport', size: 3600, type: 'activity', trend: 'down' },
      { name: 'Air Freight', size: 2400, type: 'activity', trend: 'up' },
      { name: 'Rail Transport', size: 1200, type: 'activity', trend: 'stable' },
      { name: 'Warehousing', size: 800, type: 'activity', trend: 'down' },
    ]
  },
  5: {
    name: 'Waste in Operations',
    children: [
      { name: 'Industrial Waste', size: 900, type: 'material', trend: 'down' },
      { name: 'Packaging Waste', size: 600, type: 'material', trend: 'down' },
      { name: 'Hazardous Waste', size: 400, type: 'material', trend: 'stable' },
      { name: 'Organic Waste', size: 200, type: 'material', trend: 'down' },
    ]
  },
  6: {
    name: 'Business Travel',
    children: [
      { name: 'Air Travel', size: 2200, type: 'activity', trend: 'up' },
      { name: 'Hotel Stays', size: 600, type: 'activity', trend: 'stable' },
      { name: 'Rental Cars', size: 400, type: 'activity', trend: 'down' },
      { name: 'Rail Travel', size: 200, type: 'activity', trend: 'up' },
    ]
  },
  7: {
    name: 'Employee Commuting',
    children: [
      { name: 'Personal Vehicles', size: 2800, type: 'activity', trend: 'stable' },
      { name: 'Public Transit', size: 800, type: 'activity', trend: 'up' },
      { name: 'Remote Work', size: 400, type: 'activity', trend: 'down' },
      { name: 'Cycling/Walking', size: 200, type: 'activity', trend: 'up' },
    ]
  },
  8: {
    name: 'Upstream Leased Assets',
    children: [
      { name: 'Leased Facilities', size: 1200, type: 'activity', trend: 'stable' },
      { name: 'Leased Vehicles', size: 400, type: 'activity', trend: 'down' },
      { name: 'Leased Equipment', size: 200, type: 'activity', trend: 'stable' },
    ]
  },
  9: {
    name: 'Downstream Transport',
    children: [
      { name: 'Regional Distribution', size: 4200, type: 'activity', trend: 'stable' },
      { name: 'Last-Mile Delivery', size: 3100, type: 'activity', trend: 'up' },
      { name: 'Export Shipping', size: 2300, type: 'activity', trend: 'stable' },
    ]
  },
  10: {
    name: 'Processing of Sold Products',
    children: [
      { name: 'Customer Manufacturing', size: 3200, type: 'activity', trend: 'stable' },
      { name: 'Assembly Operations', size: 1400, type: 'activity', trend: 'down' },
      { name: 'Quality Testing', size: 800, type: 'activity', trend: 'stable' },
    ]
  },
  11: {
    name: 'Use of Sold Products',
    children: [
      { name: 'Energy Consumption', size: 18000, type: 'activity', trend: 'down' },
      { name: 'Fuel Use', size: 8000, type: 'activity', trend: 'down' },
      { name: 'Maintenance', size: 4000, type: 'activity', trend: 'stable' },
      { name: 'Consumables', size: 2000, type: 'activity', trend: 'stable' },
    ]
  },
  12: {
    name: 'End-of-Life Treatment',
    children: [
      { name: 'Landfill', size: 2400, type: 'activity', trend: 'down' },
      { name: 'Incineration', size: 1200, type: 'activity', trend: 'stable' },
      { name: 'Recycling', size: 800, type: 'activity', trend: 'up' },
      { name: 'Composting', size: 400, type: 'activity', trend: 'up' },
    ]
  },
  13: {
    name: 'Downstream Leased Assets',
    children: [
      { name: 'Leased Buildings', size: 800, type: 'activity', trend: 'stable' },
      { name: 'Leased Equipment', size: 400, type: 'activity', trend: 'down' },
    ]
  },
  15: {
    name: 'Investments',
    children: [
      { name: 'Equity Investments', size: 1400, type: 'activity', trend: 'stable' },
      { name: 'Debt Investments', size: 600, type: 'activity', trend: 'down' },
      { name: 'Project Finance', size: 400, type: 'activity', trend: 'up' },
    ]
  },
};

// Heat map color scale: red (high) to green (low)
function getHeatMapColor(value: number, maxValue: number): string {
  const ratio = value / maxValue;
  
  if (ratio > 0.7) return '#ef4444'; // Red - high emitter
  if (ratio > 0.5) return '#f97316'; // Orange
  if (ratio > 0.3) return '#eab308'; // Yellow
  if (ratio > 0.15) return '#84cc16'; // Lime
  return '#22c55e'; // Green - low emitter
}

// Custom Treemap content
function CustomTreemapContent(props: any) {
  const { x, y, width, height, name, size, maxValue, type, trend } = props;
  
  // Don't render if too small or missing required data
  if (width < 40 || height < 30 || !name || size === undefined) return null;
  
  const color = getHeatMapColor(size, maxValue || 1);
  const showDetails = width > 80 && height > 50;
  
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        stroke="#ffffff"
        strokeWidth={2}
        rx={4}
        ry={4}
        style={{ 
          cursor: 'pointer',
          transition: 'opacity 0.2s ease'
        }}
      />
      {/* Name label */}
      <text
        x={x + width / 2}
        y={y + height / 2 - (showDetails ? 8 : 0)}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#ffffff"
        fontSize={width > 100 ? 13 : 11}
        fontWeight="600"
        style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
      >
        {name.length > 15 && width < 120 ? `${name.slice(0, 12)}...` : name}
      </text>
      {/* Emissions value */}
      {showDetails && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.9)"
          fontSize={11}
          style={{ pointerEvents: 'none' }}
        >
          {formatEmissions(size)} tCO₂e
        </text>
      )}
      {/* Trend indicator */}
      {showDetails && trend && width > 100 && (
        <text
          x={x + width / 2}
          y={y + height / 2 + 28}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="rgba(255,255,255,0.8)"
          fontSize={10}
          style={{ pointerEvents: 'none' }}
        >
          {trend === 'up' ? '↑ Increasing' : trend === 'down' ? '↓ Decreasing' : '→ Stable'}
        </text>
      )}
    </g>
  );
}

// Custom tooltip for Treemap
function TreemapTooltip({ active, payload }: any) {
  if (!active || !payload || payload.length === 0) return null;
  
  const data = payload[0].payload;
  
  return (
    <div className="bg-popover/95 backdrop-blur-sm border rounded-xl shadow-xl p-4 min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
      <Badge variant="outline" className="text-xs capitalize">
          {data.type}
        </Badge>
        {data.trend === 'up' && (
          <Badge variant="destructive" className="text-xs">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Increasing
          </Badge>
        )}
        {data.trend === 'down' && (
          <Badge variant="secondary" className="text-xs">
            <TrendingDown className="h-3 w-3 mr-1" />
            Decreasing
          </Badge>
        )}
      </div>
      <p className="font-semibold text-sm">{data.name}</p>
      <div className="mt-2 p-2 rounded-lg bg-muted/50">
        <div className="text-xl font-bold">
          {formatEmissions(data.size)} <span className="text-sm font-normal text-muted-foreground">tCO₂e</span>
        </div>
      </div>
    </div>
  );
}

interface CategoryBreakdownTreemapProps {
  categoryNumber: number;
  categoryName: string;
  totalEmissions: number;
  onClose: () => void;
}

export function CategoryBreakdownTreemap({
  categoryNumber,
  categoryName,
  totalEmissions,
  onClose
}: CategoryBreakdownTreemapProps) {
  const breakdownData = useMemo(() => {
    const categoryData = CATEGORY_BREAKDOWNS[categoryNumber];
    if (!categoryData) return null;
    
    // Find max value for heat map scaling
    const maxValue = Math.max(...categoryData.children.map(c => c.size));
    
    return {
      ...categoryData,
      children: categoryData.children.map(child => ({
        ...child,
        maxValue
      }))
    };
  }, [categoryNumber]);

  if (!breakdownData) {
    return (
      <Card className="mt-6 border-dashed">
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>No detailed breakdown available for this category.</p>
          <Button variant="ghost" size="sm" className="mt-2" onClick={onClose}>
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...breakdownData.children.map(c => c.size));

  return (
    <Card className="mt-6 border-2 border-primary/20 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Category {categoryNumber}</Badge>
              <CardTitle className="text-base">{categoryName}</CardTitle>
            </div>
            <CardDescription className="mt-1">
              Breakdown by supplier type and material category • Heat map: 
              <span className="font-medium" style={{ color: '#22c55e' }}> Green</span> = Low emissions, 
              <span className="font-medium" style={{ color: '#ef4444' }}> Red</span> = High emissions
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={breakdownData.children}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#fff"
              content={<CustomTreemapContent maxValue={maxValue} />}
            >
              <Tooltip content={<TreemapTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground font-medium">Emissions Scale:</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#22c55e' }} />
              <span>Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#84cc16' }} />
              <span></span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#eab308' }} />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f97316' }} />
              <span></span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
              <span>High</span>
            </div>
          </div>
        </div>

        {/* Summary stats */}
        <div className="mt-4 grid grid-cols-3 gap-4 p-3 rounded-lg bg-muted/30">
          <div className="text-center">
            <p className="text-2xl font-bold">{breakdownData.children.length}</p>
            <p className="text-xs text-muted-foreground">Sub-categories</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{formatEmissions(totalEmissions)}</p>
            <p className="text-xs text-muted-foreground">Total tCO₂e</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {breakdownData.children.filter(c => c.trend === 'down').length}
            </p>
            <p className="text-xs text-muted-foreground">Decreasing trends</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
