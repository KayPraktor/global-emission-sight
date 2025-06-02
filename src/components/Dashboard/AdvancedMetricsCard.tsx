
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface AdvancedMetric {
  title: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  confidence: number;
  benchmark?: {
    value: number;
    percentile: number;
  };
  quality: number;
  status: 'good' | 'warning' | 'critical';
}

interface AdvancedMetricsCardProps {
  metric: AdvancedMetric;
}

const AdvancedMetricsCard: React.FC<AdvancedMetricsCardProps> = ({ metric }) => {
  const getTrendIcon = () => {
    switch (metric.trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusIcon = () => {
    switch (metric.status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };

  const getConfidenceBadge = () => {
    if (metric.confidence >= 80) return <Badge className="bg-green-100 text-green-800">High Confidence</Badge>;
    if (metric.confidence >= 60) return <Badge className="bg-amber-100 text-amber-800">Medium Confidence</Badge>;
    return <Badge className="bg-red-100 text-red-800">Low Confidence</Badge>;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
          {getStatusIcon()}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold">{metric.value.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">{metric.unit}</span>
          </div>
          <div className="flex items-center space-x-1">
            {getTrendIcon()}
            <span className={`text-sm ${metric.trend === 'up' ? 'text-red-500' : 'text-green-500'}`}>
              {metric.trendValue > 0 ? '+' : ''}{metric.trendValue.toFixed(1)}%
            </span>
          </div>
        </div>

        {metric.benchmark && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>vs Industry</span>
              <span>{metric.benchmark.percentile}th percentile</span>
            </div>
            <Progress value={metric.benchmark.percentile} className="h-1" />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Data Quality</span>
            <span className="text-xs font-medium">{metric.quality}%</span>
          </div>
          <Progress value={metric.quality} className="h-1" />
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Confidence</span>
          {getConfidenceBadge()}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedMetricsCard;
