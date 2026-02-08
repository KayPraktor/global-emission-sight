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

// Premium sustainability color palette
const COLORS = {
  organization: '#10b981',    // Emerald-500
  upstream: '#0ea5e9',        // Sky-500
  downstream: '#f59e0b',      // Amber-500
  upstreamLight: '#38bdf8',   // Sky-400
  downstreamLight: '#fbbf24', // Amber-400
  upstreamLighter: '#7dd3fc', // Sky-300
  downstreamLighter: '#fcd34d', // Amber-300
};

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
  
  // Premium color based on node type and stream
  const getNodeColor = () => {
    if (node.type === 'organization') return COLORS.organization;
    if (node.type === 'stream') {
      return node.isUpstream ? COLORS.upstream : COLORS.downstream;
    }
    if (node.type === 'category') {
      return node.isUpstream ? COLORS.upstreamLight : COLORS.downstreamLight;
    }
    // Supplier nodes
    return node.isUpstream ? COLORS.upstreamLighter : COLORS.downstreamLighter;
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
        fillOpacity={0.95}
        rx={6}
        ry={6}
        className="cursor-pointer transition-all hover:fill-opacity-100"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
      />
      {/* Node label */}
      {height > 18 && (
        <text
          x={x + width + 14}
          y={y + height / 2}
          textAnchor="start"
          dominantBaseline="middle"
          className="fill-foreground font-medium"
          style={{ fontSize: '12px' }}
        >
          {displayName}
        </text>
      )}
      {/* Emissions value */}
      {height > 35 && node.emissions && (
        <text
          x={x + width + 14}
          y={y + height / 2 + 14}
          textAnchor="start"
          dominantBaseline="middle"
          className="fill-muted-foreground"
          style={{ fontSize: '11px' }}
        >
          {formatEmissions(node.emissions)} tCO₂e
        </text>
      )}
    </Layer>
  );
}

// Custom link component with premium gradient and hover
function CustomSankeyLink(props: any) {
  const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, payload } = props;
  const [isHovered, setIsHovered] = useState(false);
  
  const isUpstream = payload.isUpstream;
  const gradientId = `premium-gradient-${payload.source}-${payload.target}`;
  
  // Premium gradient: source to target color
  const sourceColor = COLORS.organization;
  const targetColor = isUpstream ? COLORS.upstream : COLORS.downstream;
  
  // Opacity increases on hover for highlight effect
  const baseOpacity = isHovered ? 0.5 : 0.2;
  const endOpacity = isHovered ? 0.35 : 0.15;

  // Smoother curve with adjusted control points
  const smoothSourceControlX = sourceControlX + (targetX - sourceX) * 0.1;
  const smoothTargetControlX = targetControlX - (targetX - sourceX) * 0.1;

  return (
    <Layer>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={sourceColor} stopOpacity={baseOpacity} />
          <stop offset="100%" stopColor={targetColor} stopOpacity={endOpacity} />
        </linearGradient>
      </defs>
      <path
        d={`
          M${sourceX},${sourceY}
          C${smoothSourceControlX},${sourceY} ${smoothTargetControlX},${targetY} ${targetX},${targetY}
          L${targetX},${targetY + linkWidth}
          C${smoothTargetControlX},${targetY + linkWidth} ${smoothSourceControlX},${sourceY + linkWidth} ${sourceX},${sourceY + linkWidth}
          Z
        `}
        fill={`url(#${gradientId})`}
        stroke={isHovered ? targetColor : 'transparent'}
        strokeWidth={isHovered ? 1 : 0}
        strokeOpacity={0.4}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="cursor-pointer transition-all duration-200"
      />
    </Layer>
  );
}

// Mobile fallback: Stacked bar chart with premium colors
function MobileFallback({ summary, totals }: { summary: DemoScope3Summary[]; totals: SankeyTotals }) {
  const upstreamData = summary.filter(s => s.category_number <= 8 && s.emissions_tco2e > 0);
  const downstreamData = summary.filter(s => s.category_number > 8 && s.emissions_tco2e > 0);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: COLORS.upstream }}>Upstream</span>
          <span className="text-sm font-bold">{formatEmissions(totals.upstream)} tCO₂e</span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden flex">
          {upstreamData.map(cat => {
            const width = (cat.emissions_tco2e / totals.total) * 100;
            return (
              <div
                key={cat.category_number}
                className="h-full first:rounded-l-full"
                style={{ width: `${width}%`, backgroundColor: COLORS.upstream }}
                title={`${cat.category_name}: ${formatEmissions(cat.emissions_tco2e)}`}
              />
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium" style={{ color: COLORS.downstream }}>Downstream</span>
          <span className="text-sm font-bold">{formatEmissions(totals.downstream)} tCO₂e</span>
        </div>
        <div className="h-4 bg-muted rounded-full overflow-hidden flex">
          {downstreamData.map(cat => {
            const width = (cat.emissions_tco2e / totals.total) * 100;
            return (
              <div
                key={cat.category_number}
                className="h-full first:rounded-l-full"
                style={{ width: `${width}%`, backgroundColor: COLORS.downstream }}
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
            <div key={cat.category_number} className="flex items-center gap-2 p-2 rounded-lg border">
              <div 
                className="p-1.5 rounded-md"
                style={{ 
                  backgroundColor: cat.category_number <= 8 
                    ? `${COLORS.upstream}20` 
                    : `${COLORS.downstream}20` 
                }}
              >
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
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS.upstream }} 
              />
              <span className="text-xs text-muted-foreground font-medium">Upstream</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: COLORS.downstream }} 
              />
              <span className="text-xs text-muted-foreground font-medium">Downstream</span>
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
        <div className="h-[600px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <Sankey
              data={sankeyData}
              node={<CustomSankeyNode />}
              link={<CustomSankeyLink />}
              nodePadding={50}
              nodeWidth={14}
              margin={{ top: 30, right: 200, bottom: 30, left: 30 }}
              onClick={handleNodeClick}
            >
              <Tooltip 
                content={(props: any) => {
                  const payload = props.payload?.[0]?.payload;
                  if (!payload) return null;
                  
                  // Detect if this is a link (has source/target objects) vs node
                  if (payload.source !== undefined && payload.target !== undefined && typeof payload.source === 'object') {
                    return <SankeyLinkTooltip {...props} totalEmissions={totals.total} />;
                  }
                  return <SankeyNodeTooltip {...props} totalEmissions={totals.total} />;
                }}
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
