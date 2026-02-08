import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  formatEmissions, 
  getFullCategoryName, 
  getDataQualityInfo,
  calculatePercentage 
} from '@/utils/scope3SankeyTransform';

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
    <div className="bg-popover border rounded-lg shadow-lg p-3 min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        {node.type === 'category' && node.category && (
          <Badge variant="outline" className="text-xs">
            Cat {node.category}
          </Badge>
        )}
        {node.isUpstream !== undefined && (
          <Badge 
            variant={node.isUpstream ? 'default' : 'secondary'} 
            className="text-xs"
          >
            {node.isUpstream ? 'Upstream' : 'Downstream'}
          </Badge>
        )}
      </div>

      <p className="font-semibold text-sm">
        {node.type === 'category' && node.category 
          ? getFullCategoryName(node.category) 
          : node.name}
      </p>

      <div className="mt-2 space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Emissions:</span>
          <span className="font-medium">{formatEmissions(emissions)} tCO₂e</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Share:</span>
          <span className="font-medium">{percentage.toFixed(1)}%</span>
        </div>
        {qualityInfo && (
          <div className="flex justify-between text-sm items-center">
            <span className="text-muted-foreground">Data Quality:</span>
            <span 
              className="font-medium text-xs px-2 py-0.5 rounded"
              style={{ backgroundColor: `${qualityInfo.color}20`, color: qualityInfo.color }}
            >
              {qualityInfo.label}
            </span>
          </div>
        )}
      </div>

      {node.type === 'category' && (
        <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
          Click to see top contributors
        </p>
      )}
    </div>
  );
}
