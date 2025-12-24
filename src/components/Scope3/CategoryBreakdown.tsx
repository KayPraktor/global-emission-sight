import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { scope3Service, Scope3Category } from '@/services/scope3Service';

interface CategoryBreakdownProps {
  year: number;
}

export function CategoryBreakdown({ year }: CategoryBreakdownProps) {
  const { organization } = useAuth();

  const { data: categories = [] } = useQuery({
    queryKey: ['scope3-categories'],
    queryFn: () => scope3Service.getCategories(),
  });

  const { data: summary = [] } = useQuery({
    queryKey: ['scope3-summary', organization?.id, year],
    queryFn: () => organization?.id 
      ? scope3Service.getOrganizationScope3Summary(organization.id, year) 
      : Promise.resolve([]),
    enabled: !!organization?.id,
  });

  const { data: totals } = useQuery({
    queryKey: ['scope3-totals', organization?.id, year],
    queryFn: () => organization?.id 
      ? scope3Service.getTotalScope3Emissions(organization.id, year) 
      : Promise.resolve({ total: 0, upstream: 0, downstream: 0 }),
    enabled: !!organization?.id,
  });

  const upstreamCategories = categories.filter(c => c.is_upstream);
  const downstreamCategories = categories.filter(c => !c.is_upstream);

  const getDataQualityColor = (quality?: string) => {
    switch (quality) {
      case 'primary': return 'bg-green-500';
      case 'secondary': return 'bg-blue-500';
      case 'estimated': return 'bg-amber-500';
      case 'spend_based': return 'bg-slate-500';
      default: return 'bg-slate-300';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const renderCategory = (category: Scope3Category) => {
    const summaryData = summary.find(s => s.category_number === category.category_number);
    const emissions = summaryData?.emissions_tco2e || 0;
    const percentage = totals?.total ? (emissions / totals.total) * 100 : 0;
    const dataQuality = summaryData?.data_quality || 'none';

    return (
      <AccordionItem key={category.category_number} value={`cat-${category.category_number}`}>
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center justify-between w-full pr-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="w-8 h-8 flex items-center justify-center p-0">
                {category.category_number}
              </Badge>
              <div className="text-left">
                <p className="font-medium">{category.name}</p>
                <p className="text-xs text-muted-foreground">
                  {category.is_upstream ? 'Upstream' : 'Downstream'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className={`w-3 h-3 rounded-full ${getDataQualityColor(dataQuality)}`} />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="capitalize">Data Quality: {dataQuality.replace('_', ' ')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="text-right">
                <p className="font-bold">{emissions > 0 ? formatNumber(emissions) : '—'}</p>
                <p className="text-xs text-muted-foreground">
                  {emissions > 0 ? `${percentage.toFixed(1)}%` : 'No data'}
                </p>
              </div>
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="pl-12 pr-4 space-y-4">
            <p className="text-sm text-muted-foreground">{category.description}</p>
            
            {emissions > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Share of Total Scope 3</span>
                  <span className="font-medium">{percentage.toFixed(1)}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )}

            {summaryData && (
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-muted-foreground">Supplier Data</p>
                  <p className="font-bold">{summaryData.supplier_data_percentage}%</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-muted-foreground">Spend-Based</p>
                  <p className="font-bold">{summaryData.spend_based_percentage}%</p>
                </div>
                <div className="p-3 rounded-lg bg-muted">
                  <p className="text-muted-foreground">Industry Avg</p>
                  <p className="font-bold">{summaryData.industry_average_percentage}%</p>
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg border bg-primary/5">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Methodology Guidance</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {category.methodology_guidance || 'Use activity-based data where available, with spend-based estimation as fallback.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Suppliers
              </Button>
              <Button variant="outline" size="sm">
                Add Data
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Upstream Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChevronRight className="h-5 w-5 text-blue-500" />
            Upstream Categories (1-8)
          </CardTitle>
          <CardDescription>
            Indirect emissions from purchased goods, services, and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {upstreamCategories.map(renderCategory)}
          </Accordion>
        </CardContent>
      </Card>

      {/* Downstream Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChevronRight className="h-5 w-5 text-amber-500 rotate-180" />
            Downstream Categories (9-15)
          </CardTitle>
          <CardDescription>
            Indirect emissions from sold products and distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {downstreamCategories.map(renderCategory)}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
