import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  MinusCircle,
  Shield,
  Target,
  AlertTriangle,
  FileText,
  Users,
  TrendingUp
} from 'lucide-react';
import { 
  getGovernanceMetrics, 
  calculateGovernanceScore, 
  governanceCategories,
  GovernanceMetric 
} from '@/services/boardReportingService';
import { motion } from 'framer-motion';

const categoryIcons: Record<string, React.ReactNode> = {
  oversight: <Shield className="h-5 w-5" />,
  strategy: <Target className="h-5 w-5" />,
  risk_management: <AlertTriangle className="h-5 w-5" />,
  disclosure: <FileText className="h-5 w-5" />,
  engagement: <Users className="h-5 w-5" />,
};

const statusConfig = {
  met: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Met' },
  partial: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Partial' },
  not_met: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', label: 'Not Met' },
  not_applicable: { icon: MinusCircle, color: 'text-muted-foreground', bg: 'bg-muted', label: 'N/A' },
};

const MetricCard: React.FC<{ metric: GovernanceMetric }> = ({ metric }) => {
  const status = statusConfig[metric.status];
  const StatusIcon = status.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg border bg-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <StatusIcon className={`h-4 w-4 ${status.color}`} />
            <h4 className="font-medium text-sm">{metric.name}</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{metric.description}</p>
          {metric.evidence && (
            <p className="text-xs text-muted-foreground italic">
              Evidence: {metric.evidence}
            </p>
          )}
        </div>
        <div className="text-right">
          <Badge className={status.bg} variant="outline">
            {metric.score}/{metric.maxScore}
          </Badge>
          {metric.lastReviewDate && (
            <p className="text-xs text-muted-foreground mt-1">
              Reviewed: {new Date(metric.lastReviewDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const GovernanceScorecard: React.FC = () => {
  const metrics = getGovernanceMetrics();
  const { overall, byCategory, rating } = calculateGovernanceScore(metrics);

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Excellent': return 'text-green-600';
      case 'Good': return 'text-emerald-600';
      case 'Adequate': return 'text-amber-600';
      case 'Needs Improvement': return 'text-orange-600';
      case 'Poor': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Climate Governance Score
              </CardTitle>
              <CardDescription>
                Comprehensive assessment of board-level climate governance
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">{Math.round(overall)}%</div>
              <Badge variant="outline" className={getRatingColor(rating)}>
                {rating}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(governanceCategories).map(([key, category]) => {
              const categoryScore = byCategory[key];
              return (
                <div key={key} className="text-center p-3 rounded-lg bg-background/50">
                  <div className="flex justify-center mb-2 text-primary">
                    {categoryIcons[key]}
                  </div>
                  <p className="text-xs font-medium mb-1">{category.name}</p>
                  <p className="text-lg font-bold">
                    {Math.round(categoryScore?.percentage || 0)}%
                  </p>
                  <Progress 
                    value={categoryScore?.percentage || 0} 
                    className="h-1.5 mt-2" 
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Governance Metrics</CardTitle>
          <CardDescription>
            Review individual metrics across all governance categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="oversight" className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              {Object.entries(governanceCategories).map(([key, category]) => (
                <TabsTrigger key={key} value={key} className="text-xs">
                  <span className="hidden sm:inline">{category.name}</span>
                  <span className="sm:hidden">{categoryIcons[key]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(governanceCategories).map(([key, category]) => (
              <TabsContent key={key} value={key} className="mt-4">
                <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    {categoryIcons[key]}
                    <h3 className="font-semibold">{category.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm">Weight: {category.weight * 100}%</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm font-medium">
                      Score: {byCategory[key]?.score || 0}/{byCategory[key]?.maxScore || 0}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {metrics
                    .filter(m => m.category === key)
                    .map(metric => (
                      <MetricCard key={metric.id} metric={metric} />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Metrics Met', count: metrics.filter(m => m.status === 'met').length, color: 'text-green-600' },
          { label: 'Partial', count: metrics.filter(m => m.status === 'partial').length, color: 'text-amber-600' },
          { label: 'Not Met', count: metrics.filter(m => m.status === 'not_met').length, color: 'text-red-600' },
          { label: 'Total Metrics', count: metrics.length, color: 'text-primary' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 text-center">
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.count}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
