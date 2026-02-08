import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sparkline } from '@/components/Dashboard/Sparkline';
import { TrendingUp, TrendingDown, Minus, Building2 } from 'lucide-react';
import { formatEmissions } from '@/utils/scope3SankeyTransform';

// Demo supplier data with quarterly trends
const TOP_EMITTERS_DATA = [
  { 
    name: 'Acme Steel Corp', 
    co2e: 12450, 
    category: 'Raw Materials',
    trend: [11200, 11800, 12100, 12450],
    trendDirection: 'up' as const
  },
  { 
    name: 'Global Logistics Inc', 
    co2e: 9800, 
    category: 'Transportation',
    trend: [10500, 10200, 9900, 9800],
    trendDirection: 'down' as const
  },
  { 
    name: 'Pacific Plastics', 
    co2e: 8200, 
    category: 'Packaging',
    trend: [7800, 8000, 8100, 8200],
    trendDirection: 'up' as const
  },
  { 
    name: 'Continental Chemicals', 
    co2e: 7500, 
    category: 'Chemicals',
    trend: [8200, 7900, 7700, 7500],
    trendDirection: 'down' as const
  },
  { 
    name: 'Alpha Electronics', 
    co2e: 6800, 
    category: 'Electronics',
    trend: [6500, 6600, 6700, 6800],
    trendDirection: 'up' as const
  },
  { 
    name: 'Metro Freight Services', 
    co2e: 5400, 
    category: 'Transportation',
    trend: [5500, 5450, 5400, 5400],
    trendDirection: 'stable' as const
  },
  { 
    name: 'Industrial Metals Co', 
    co2e: 4900, 
    category: 'Metal Components',
    trend: [5200, 5100, 5000, 4900],
    trendDirection: 'down' as const
  },
  { 
    name: 'EcoPackage Solutions', 
    co2e: 4200, 
    category: 'Packaging',
    trend: [4000, 4050, 4150, 4200],
    trendDirection: 'up' as const
  },
  { 
    name: 'Swift Air Cargo', 
    co2e: 3800, 
    category: 'Air Freight',
    trend: [4200, 4100, 3950, 3800],
    trendDirection: 'down' as const
  },
  { 
    name: 'TechParts Global', 
    co2e: 3500, 
    category: 'Electronics',
    trend: [3500, 3500, 3500, 3500],
    trendDirection: 'stable' as const
  },
];

interface TopEmittersTableProps {
  totalScope3Emissions: number;
}

export function TopEmittersTable({ totalScope3Emissions }: TopEmittersTableProps) {
  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-destructive" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-primary" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return 'hsl(var(--destructive))';
      case 'down':
        return 'hsl(var(--primary))';
      default:
        return 'hsl(var(--muted-foreground))';
    }
  };

  const getTrendBadge = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return (
          <Badge variant="destructive" className="text-xs gap-1">
            {getTrendIcon(direction)}
            Rising
          </Badge>
        );
      case 'down':
        return (
          <Badge variant="secondary" className="text-xs gap-1 bg-primary/10 text-primary border-primary/20">
            {getTrendIcon(direction)}
            Declining
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs gap-1">
            {getTrendIcon(direction)}
            Stable
          </Badge>
        );
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              Top Emitting Suppliers
            </CardTitle>
            <CardDescription>
              Top 10 suppliers by Scope 3 contribution with quarterly emission trends
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Last 4 Quarters
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[50px] text-center">#</TableHead>
                <TableHead>Supplier Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Total CO₂e</TableHead>
                <TableHead className="text-right">% of Scope 3</TableHead>
                <TableHead className="w-[120px] text-center">Trend (4Q)</TableHead>
                <TableHead className="w-[100px] text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TOP_EMITTERS_DATA.map((supplier, index) => {
                const percentOfTotal = (supplier.co2e / totalScope3Emissions) * 100;
                
                return (
                  <TableRow 
                    key={supplier.name}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="text-center font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {supplier.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-normal">
                        {supplier.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatEmissions(supplier.co2e)}
                      <span className="text-xs text-muted-foreground ml-1">tCO₂e</span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      <span className="font-medium">{percentOfTotal.toFixed(1)}%</span>
                    </TableCell>
                    <TableCell>
                      <div className="w-[100px] mx-auto">
                        <Sparkline 
                          data={supplier.trend} 
                          color={getTrendColor(supplier.trendDirection)}
                          height={28}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getTrendBadge(supplier.trendDirection)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Summary footer */}
        <div className="mt-4 flex items-center justify-between p-3 rounded-lg bg-muted/30">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Rising: </span>
              <span className="font-medium">
                {TOP_EMITTERS_DATA.filter(s => s.trendDirection === 'up').length} suppliers
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Declining: </span>
              <span className="font-medium">
                {TOP_EMITTERS_DATA.filter(s => s.trendDirection === 'down').length} suppliers
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              <span className="text-muted-foreground">Stable: </span>
              <span className="font-medium">
                {TOP_EMITTERS_DATA.filter(s => s.trendDirection === 'stable').length} suppliers
              </span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Top 10 represent{' '}
            <span className="font-semibold text-foreground">
              {((TOP_EMITTERS_DATA.reduce((acc, s) => acc + s.co2e, 0) / totalScope3Emissions) * 100).toFixed(1)}%
            </span>{' '}
            of total Scope 3
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
