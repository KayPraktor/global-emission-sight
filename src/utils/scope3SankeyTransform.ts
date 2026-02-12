// Data transformation utilities for Scope 3 Sankey diagram visualization

import type { Scope3Summary as DemoScope3Summary, Scope3Hotspot as DemoScope3Hotspot } from '@/services/scope3Service';

export interface SankeyNode {
  name: string;
  category?: number;
  emissions?: number;
  type: 'organization' | 'stream' | 'category' | 'supplier';
  dataQuality?: string;
  isUpstream?: boolean;
}

export interface SankeyLink {
  source: number;
  target: number;
  value: number;
  isUpstream?: boolean;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}

export interface SankeyTotals {
  total: number;
  upstream: number;
  downstream: number;
}

/**
 * Transforms Scope 3 summary data into Sankey diagram format
 * 
 * Node structure:
 * - Index 0: Organization (root)
 * - Index 1: Upstream
 * - Index 2: Downstream
 * - Index 3+: Individual categories (only those with emissions > 0)
 * - Additional: Top suppliers/contributors for expanded categories
 */
export function transformToSankeyData(
  summary: DemoScope3Summary[],
  hotspots: DemoScope3Hotspot[],
  totals: SankeyTotals,
  expandedCategory?: number
): SankeyData {
  const nodes: SankeyNode[] = [];
  const links: SankeyLink[] = [];

  // Node 0: Organization (root)
  nodes.push({
    name: 'Organization',
    emissions: totals.total,
    type: 'organization',
  });

  // Node 1: Upstream
  nodes.push({
    name: 'Upstream',
    emissions: totals.upstream,
    type: 'stream',
    isUpstream: true,
  });

  // Node 2: Downstream
  nodes.push({
    name: 'Downstream',
    emissions: totals.downstream,
    type: 'stream',
    isUpstream: false,
  });

  // Links from Organization to Upstream/Downstream
  if (totals.upstream > 0) {
    links.push({
      source: 0,
      target: 1,
      value: totals.upstream,
      isUpstream: true,
    });
  }

  if (totals.downstream > 0) {
    links.push({
      source: 0,
      target: 2,
      value: totals.downstream,
      isUpstream: false,
    });
  }

  // Add category nodes (only those with emissions > 0)
  const categoriesWithEmissions = summary.filter(s => s.emissions_tco2e > 0);
  
  categoriesWithEmissions.forEach(cat => {
    const nodeIndex = nodes.length;
    const isUpstream = cat.category_number <= 8;

    nodes.push({
      name: `Cat ${cat.category_number}`,
      category: cat.category_number,
      emissions: cat.emissions_tco2e,
      type: 'category',
      dataQuality: cat.data_quality,
      isUpstream,
    });

    // Link from stream to category
    links.push({
      source: isUpstream ? 1 : 2,
      target: nodeIndex,
      value: cat.emissions_tco2e,
      isUpstream,
    });

    // If this category is expanded, add supplier nodes
    if (expandedCategory === cat.category_number) {
      const hotspot = hotspots.find(h => h.category_number === cat.category_number);
      if (hotspot && hotspot.top_contributors.length > 0) {
        hotspot.top_contributors.slice(0, 3).forEach(contributor => {
          const supplierIndex = nodes.length;
          nodes.push({
            name: contributor.name,
            emissions: contributor.emissions,
            type: 'supplier',
            isUpstream,
          });

          links.push({
            source: nodeIndex,
            target: supplierIndex,
            value: contributor.emissions,
            isUpstream,
          });
        });
      }
    }
  });

  return { nodes, links };
}

/**
 * Get abbreviated category name for display
 */
export function getShortCategoryName(categoryNumber: number): string {
  const names: Record<number, string> = {
    1: 'Purchased Goods',
    2: 'Capital Goods',
    3: 'Fuel & Energy',
    4: 'Transport Up',
    5: 'Waste',
    6: 'Business Travel',
    7: 'Commuting',
    8: 'Leased Assets Up',
    9: 'Transport Down',
    10: 'Processing',
    11: 'Product Use',
    12: 'End-of-Life',
    13: 'Leased Assets Down',
    14: 'Franchises',
    15: 'Investments',
  };
  return names[categoryNumber] || `Category ${categoryNumber}`;
}

/**
 * Get full category name
 */
export function getFullCategoryName(categoryNumber: number): string {
  const names: Record<number, string> = {
    1: 'Purchased Goods & Services',
    2: 'Capital Goods',
    3: 'Fuel & Energy Related Activities',
    4: 'Upstream Transportation & Distribution',
    5: 'Waste Generated in Operations',
    6: 'Business Travel',
    7: 'Employee Commuting',
    8: 'Upstream Leased Assets',
    9: 'Downstream Transportation & Distribution',
    10: 'Processing of Sold Products',
    11: 'Use of Sold Products',
    12: 'End-of-Life Treatment of Sold Products',
    13: 'Downstream Leased Assets',
    14: 'Franchises',
    15: 'Investments',
  };
  return names[categoryNumber] || `Category ${categoryNumber}`;
}

/**
 * Format number for display
 */
export function formatEmissions(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(0);
}

/**
 * Get data quality label and color
 */
export function getDataQualityInfo(quality: string): { label: string; color: string } {
  const qualityMap: Record<string, { label: string; color: string }> = {
    primary: { label: 'Primary Data', color: 'hsl(var(--chart-3))' },
    secondary: { label: 'Secondary Data', color: 'hsl(var(--chart-1))' },
    estimated: { label: 'Estimated', color: 'hsl(var(--chart-4))' },
    spend_based: { label: 'Spend-Based', color: 'hsl(var(--chart-5))' },
    none: { label: 'No Data', color: 'hsl(var(--muted))' },
  };
  return qualityMap[quality] || { label: quality, color: 'hsl(var(--muted))' };
}

/**
 * Calculate percentage of total
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}
