import React from 'react';
import { formatEmissions, calculatePercentage } from '@/utils/scope3SankeyTransform';

// Premium sustainability color palette
const COLORS = {
  upstream: '#0ea5e9',
  downstream: '#f59e0b',
};

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
  const isUpstream = link.isUpstream;

  return (
    <div className="bg-popover/95 backdrop-blur-sm border rounded-xl shadow-xl p-4 min-w-[220px]">
      {/* Flow direction indicator */}
      <div className="flex items-center gap-2 mb-3">
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: isUpstream ? COLORS.upstream : COLORS.downstream }}
        />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {isUpstream ? 'Upstream Flow' : 'Downstream Flow'}
        </span>
      </div>

      {/* Source → Target */}
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span>{link.source?.name}</span>
        <span className="text-muted-foreground">→</span>
        <span>{link.target?.name}</span>
      </div>

      {/* Prominent CO2e value */}
      <div className="mt-3 p-3 rounded-lg bg-muted/50">
        <div className="text-2xl font-bold text-foreground">
          {formatEmissions(link.value)} <span className="text-sm font-normal text-muted-foreground">tCO₂e</span>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {percentage.toFixed(1)}% of total Scope 3
        </div>
      </div>
    </div>
  );
}
