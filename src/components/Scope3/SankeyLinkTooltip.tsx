import React from 'react';
import { formatEmissions, calculatePercentage } from '@/utils/scope3SankeyTransform';

interface SankeyLinkTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      source: { name: string };
      target: { name: string };
      value: number;
      isUpstream?: boolean;
    };
  }>;
  totalEmissions: number;
}

export function SankeyLinkTooltip({ active, payload, totalEmissions }: SankeyLinkTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const link = payload[0].payload;
  const percentage = calculatePercentage(link.value, totalEmissions);

  return (
    <div className="bg-popover border rounded-lg shadow-lg p-3 min-w-[180px]">
      <div className="flex items-center gap-2 text-sm mb-2">
        <span className="font-medium">{link.source?.name}</span>
        <span className="text-muted-foreground">→</span>
        <span className="font-medium">{link.target?.name}</span>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Flow:</span>
          <span className="font-medium">{formatEmissions(link.value)} tCO₂e</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Share:</span>
          <span className="font-medium">{percentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
