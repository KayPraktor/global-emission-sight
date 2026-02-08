import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  formatEmissions, 
  getFullCategoryName, 
  getDataQualityInfo,
  calculatePercentage 
} from '@/utils/scope3SankeyTransform';

// Premium sustainability color palette
const COLORS = {
  upstream: '#0ea5e9',
  downstream: '#f59e0b',
};

interface SankeyNodeTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      category?: number;
      emissions?: number;
      type: string;
      dataQuality?: string;
      isUpstream?: boolean;
    };
  }>;
  totalEmissions: number;
}

export function SankeyNodeTooltip({ active, payload, totalEmissions }: SankeyNodeTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const node = payload[0].payload;
  const emissions = node.emissions || 0;
  const percentage = calculatePercentage(emissions, totalEmissions);
  const qualityInfo = node.dataQuality ? getDataQualityInfo(node.dataQuality) : null;

  return (
    <div className="bg-popover/95 backdrop-blur-sm border rounded-xl shadow-xl p-4 min-w-[220px]">
      <div className="flex items-center gap-2 mb-3">
        {node.type === 'category' && node.category && (
          <Badge variant="outline" className="text-xs font-medium">
            Cat {node.category}
          </Badge>
        )}
        {node.isUpstream !== undefined && (
          <div className="flex items-center gap-1.5">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: node.isUpstream ? COLORS.upstream : COLORS.downstream }}
            />
            <span className="text-xs font-medium text-muted-foreground">
              {node.isUpstream ? 'Upstream' : 'Downstream'}
            </span>
          </div>
        )}
      </div>

      <p className="font-semibold text-sm text-foreground">
        {node.type === 'category' && node.category 
          ? getFullCategoryName(node.category) 
          : node.name}
      </p>

      <div className="mt-3 p-3 rounded-lg bg-muted/50">
        <div className="text-2xl font-bold text-foreground">
          {formatEmissions(emissions)} <span className="text-sm font-normal text-muted-foreground">tCO₂e</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {percentage.toFixed(1)}% of total Scope 3
        </div>
      </div>

      {qualityInfo && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Data Quality:</span>
          <span 
            className="font-medium text-xs px-2 py-1 rounded-md"
            style={{ backgroundColor: `${qualityInfo.color}15`, color: qualityInfo.color }}
          >
            {qualityInfo.label}
          </span>
        </div>
      )}

      {node.type === 'category' && (
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
          Click to see top contributors
        </p>
      )}
    </div>
  );
}
