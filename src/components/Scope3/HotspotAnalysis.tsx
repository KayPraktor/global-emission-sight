import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Minus,
  Lightbulb,
  Building2,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { scope3Service, Scope3Hotspot } from '@/services/scope3Service';

interface HotspotAnalysisProps {
  year: number;
}

export function HotspotAnalysis({ year }: HotspotAnalysisProps) {
  const { organization } = useAuth();

  const { data: hotspots = [], isLoading } = useQuery({
    queryKey: ['scope3-hotspots', organization?.id, year],
    queryFn: () => organization?.id 
      ? scope3Service.identifyHotspots(organization.id, year) 
      : Promise.resolve([]),
    enabled: !!organization?.id,
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const getTrendIcon = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendLabel = (trend: 'increasing' | 'decreasing' | 'stable') => {
    switch (trend) {
      case 'increasing': return 'Increasing';
      case 'decreasing': return 'Decreasing';
      default: return 'Stable';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Analyzing hotspots...</div>
      </div>
    );
  }

  if (hotspots.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Scope 3 Data Available</h3>
            <p className="text-muted-foreground mb-4">
              Add emissions data to identify your Scope 3 hotspots
            </p>
            <Button>Add Scope 3 Data</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Scope 3 Emission Hotspots
          </CardTitle>
          <CardDescription>
            Top {hotspots.length} categories contributing to your Scope 3 footprint
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>High Impact (&gt;25%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Medium Impact (10-25%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Lower Impact (&lt;10%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hotspot Cards */}
      <div className="grid grid-cols-1 gap-4">
        {hotspots.map((hotspot, index) => (
          <Card key={hotspot.category_number} className={
            hotspot.percentage_of_total > 25 ? 'border-red-500/50' :
            hotspot.percentage_of_total > 10 ? 'border-amber-500/50' : ''
          }>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant="outline" 
                    className={`
                      ${hotspot.percentage_of_total > 25 ? 'border-red-500 text-red-500' :
                        hotspot.percentage_of_total > 10 ? 'border-amber-500 text-amber-500' :
                        'border-green-500 text-green-500'}
                    `}
                  >
                    #{index + 1}
                  </Badge>
                  <div>
                    <CardTitle className="text-lg">
                      Category {hotspot.category_number}: {hotspot.category_name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      {getTrendIcon(hotspot.trend)}
                      <span>{getTrendLabel(hotspot.trend)}</span>
                    </CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{formatNumber(hotspot.emissions_tco2e)}</p>
                  <p className="text-sm text-muted-foreground">
                    {hotspot.percentage_of_total.toFixed(1)}% of total
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-1">
                <Progress 
                  value={hotspot.percentage_of_total} 
                  className="h-3"
                />
              </div>

              {/* Top Contributors */}
              {hotspot.top_contributors.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Top Contributors</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {hotspot.top_contributors.map((contributor, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center gap-2 p-2 rounded-lg bg-muted"
                      >
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{contributor.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatNumber(contributor.emissions)} tCO₂e
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reduction Potential */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Reduction Potential</p>
                    <p className="text-xs text-muted-foreground">
                      Estimated achievable reduction
                    </p>
                  </div>
                </div>
                <p className="text-xl font-bold text-green-600">
                  {hotspot.reduction_potential}%
                </p>
              </div>

              {/* Recommended Actions */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  <p className="text-sm font-medium">Recommended Actions</p>
                </div>
                <ul className="space-y-2">
                  {hotspot.recommended_actions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm">
                  View Suppliers
                </Button>
                <Button variant="outline" size="sm">
                  Create Reduction Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
