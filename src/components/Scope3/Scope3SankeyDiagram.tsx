import React, { useMemo, useState, useCallback } from 'react';
import { 
  Sankey, 
  Tooltip, 
  Layer, 
  Rectangle,
  ResponsiveContainer 
} from 'recharts';
import { 
  Package, 
  Factory,
  Zap,
  Truck,
  Recycle,
  Plane,
  Car,
  Building2,
  Users,
  BarChart3,
  Building,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  DemoScope3Summary, 
  DemoScope3Hotspot,
  getDemoScope3Totals 
} from '@/utils/scope3DemoData';
import { 
  transformToSankeyData, 
  SankeyNode,
  SankeyTotals,
  formatEmissions,
  getShortCategoryName,
  getDataQualityInfo
} from '@/utils/scope3SankeyTransform';
import { SankeyNodeTooltip } from './SankeyNodeTooltip';
import { SankeyLinkTooltip } from './SankeyLinkTooltip';

// Category icons mapping
const categoryIcons: Record<number, React.ReactNode> = {
  1: <Package className="h-3 w-3" />,
  2: <Factory className="h-3 w-3" />,
  3: <Zap className="h-3 w-3" />,
  4: <Truck className="h-3 w-3" />,
  5: <Recycle className="h-3 w-3" />,
  6: <Plane className="h-3 w-3" />,
  7: <Car className="h-3 w-3" />,
  8: <Building2 className="h-3 w-3" />,
  9: <Truck className="h-3 w-3" />,
  10: <Factory className="h-3 w-3" />,
  11: <Users className="h-3 w-3" />,
  12: <Recycle className="h-3 w-3" />,
  13: <Building2 className="h-3 w-3" />,
  14: <Building2 className="h-3 w-3" />,
  15: <BarChart3 className="h-3 w-3" />,
};

interface Scope3SankeyDiagramProps {
  summary: DemoScope3Summary[];
  hotspots: DemoScope3Hotspot[];
  totals: SankeyTotals;
  onNodeClick?: (categoryNumber: number) => void;
}

// Custom node component for Sankey diagram
function CustomSankeyNode(props: any) {
  const { x, y, width, height, payload } = props;
  const node = payload as SankeyNode;
  
  // Color based on node type and stream
  const getNodeColor = () => {
    if (node.type === 'organization') return 'hsl(var(--primary))';
    if (node.type === 'stream') {
      return node.isUpstream ? 'hsl(210, 70%, 55%)' : 'hsl(38, 85%, 55%)';
    }
    if (node.type === 'category') {
      return node.isUpstream ? 'hsl(210, 60%, 60%)' : 'hsl(38, 75%, 60%)';
    }
    return node.isUpstream ? 'hsl(210, 50%, 65%)' : 'hsl(38, 65%, 65%)';
  };

  const fillColor = getNodeColor();
  const displayName = node.type === 'category' && node.category 
    ? getShortCategoryName(node.category)
    : node.name;

  return (
    <Layer>
      <Rectangle
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fillColor}
        fillOpacity={0.9}
        rx={4}
        ry={4}
        className="cursor-pointer transition-all hover:fill-opacity-100"
      />
      {/* Node label */}
      {height > 20 && (
        <text
          x={x + width + 8}
          y={y + height / 2}
          textAnchor="start"
          dominantBaseline="middle"
          className="fill-foreground text-xs font-medium"
        >
          {displayName}
        </text>
      )}
      {/* Emissions value */}
      {height > 30 && node.emissions && (
        <text
          x={x + width + 8}
          y={y + height / 2 + 12}
          textAnchor="start"
          dominantBaseline="middle"
          className="fill-muted-foreground text-[10px]"
        >
          {formatEmissions(node.emissions)} tCO₂e
        </text>
      )}
    </Layer>
  );
}

// Custom link component with gradient
function CustomSankeyLink(props: any) {
  const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, payload } = props;
  
  const isUpstream = payload.isUpstream;
  const gradientId = `gradient-${payload.source}-${payload.target}`;
  
  const upstreamColor = 'hsl(210, 70%, 55%)';
  const downstreamColor = 'hsl(38, 85%, 55%)';
  const baseColor = isUpstream ? upstreamColor : downstreamColor;

  return (
    <Layer>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={baseColor} stopOpacity={0.6} />
          <stop offset="100%" stopColor={baseColor} stopOpacity={0.3} />
        </linearGradient>
      </defs>
      <path
        d={`
          M${sourceX},${sourceY}
          C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
          L${targetX},${targetY + linkWidth}
          C${targetControlX},${targetY + linkWidth} ${sourceControlX},${sourceY + linkWidth} ${sourceX},${sourceY + linkWidth}
          Z
        `}
        fill={`url(#${gradientId})`}
        className="transition-all hover:opacity-80"
      />
    </Layer>
  );
}

// Mobile fallback: Stacked bar chart
function MobileFallback({ summary, totals }: { summary: DemoScope3Summary[]; totals: SankeyTotals }) {
  const upstreamData = summary.filter(s => s.category_number <= 8 && s.emissions_tco2e > 0);
  const downstreamData = summary.filter(s => s.category_number > 8 && s.emissions_tco2e > 0);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-600">Upstream</span>
          <span className="text-sm font-bold">{formatEmissions(totals.upstream)} tCO₂e</span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden flex">
          {upstreamData.map(cat => {
            const width = (cat.emissions_tco2e / totals.total) * 100;
            return (
              <div
                key={cat.category_number}
                className="h-full bg-blue-500 first:rounded-l-full"
                style={{ width: `${width}%` }}
                title={`${cat.category_name}: ${formatEmissions(cat.emissions_tco2e)}`}
              />
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-amber-600">Downstream</span>
          <span className="text-sm font-bold">{formatEmissions(totals.downstream)} tCO₂e</span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden flex">
          {downstreamData.map(cat => {
            const width = (cat.emissions_tco2e / totals.total) * 100;
            return (
              <div
                key={cat.category_number}
                className="h-full bg-amber-500 first:rounded-l-full"
                style={{ width: `${width}%` }}
                title={`${cat.category_name}: ${formatEmissions(cat.emissions_tco2e)}`}
              />
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {summary
          .filter(s => s.emissions_tco2e > 0)
          .sort((a, b) => b.emissions_tco2e - a.emissions_tco2e)
          .slice(0, 6)
          .map(cat => (
            <div key={cat.category_number} className="flex items-center gap-2 p-2 rounded border">
              <div className={`p-1 rounded ${cat.category_number <= 8 ? 'bg-blue-100' : 'bg-amber-100'}`}>
                {categoryIcons[cat.category_number]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">Cat {cat.category_number}</p>
                <p className="text-xs text-muted-foreground">{formatEmissions(cat.emissions_tco2e)}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export function Scope3SankeyDiagram({ 
  summary, 
  hotspots, 
  totals,
  onNodeClick 
}: Scope3SankeyDiagramProps) {
  const isMobile = useIsMobile();
  const [expandedCategory, setExpandedCategory] = useState<number | undefined>();
  const [tooltipType, setTooltipType] = useState<'node' | 'link'>('node');

  const sankeyData = useMemo(() => {
    return transformToSankeyData(summary, hotspots, totals, expandedCategory);
  }, [summary, hotspots, totals, expandedCategory]);

  const handleNodeClick = useCallback((data: any) => {
    const node = data?.payload as SankeyNode;
    if (node?.type === 'category' && node.category) {
      if (expandedCategory === node.category) {
        setExpandedCategory(undefined);
      } else {
        setExpandedCategory(node.category);
        onNodeClick?.(node.category);
      }
    }
  }, [expandedCategory, onNodeClick]);

  // Show mobile fallback for small screens
  if (isMobile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Scope 3 Emissions Flow</CardTitle>
          <CardDescription>Value chain emissions breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <MobileFallback summary={summary} totals={totals} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Scope 3 Emissions Flow</CardTitle>
            <CardDescription>
              Interactive Sankey diagram showing emissions through your value chain
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span className="text-xs text-muted-foreground">Upstream</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-500" />
              <span className="text-xs text-muted-foreground">Downstream</span>
            </div>
          </div>
        </div>
        {expandedCategory && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              Viewing: Category {expandedCategory}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs"
              onClick={() => setExpandedCategory(undefined)}
            >
              Reset view
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <Sankey
              data={sankeyData}
              node={<CustomSankeyNode />}
              link={<CustomSankeyLink />}
              nodePadding={30}
              nodeWidth={12}
              margin={{ top: 20, right: 160, bottom: 20, left: 20 }}
              onClick={handleNodeClick}
            >
              <Tooltip 
                content={
                  <SankeyNodeTooltip 
                    totalEmissions={totals.total} 
                  />
                }
              />
            </Sankey>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            Click on a category node to expand and see top contributors
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
