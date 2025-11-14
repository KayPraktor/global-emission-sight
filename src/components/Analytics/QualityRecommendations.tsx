import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp } from 'lucide-react';

interface Recommendation {
  title: string;
  description: string;
  impact: string;
  priority: 'high' | 'medium' | 'low';
  action?: () => void;
}

interface QualityRecommendationsProps {
  recommendations?: Recommendation[];
}

export const QualityRecommendations: React.FC<QualityRecommendationsProps> = ({
  recommendations = [],
}) => {
  const defaultRecommendations: Recommendation[] = [
    {
      title: 'Add Facility Information',
      description: 'Assign facilities to entries without location data',
      impact: '+15% quality score',
      priority: 'high',
    },
    {
      title: 'Verify Recent Entries',
      description: 'Mark recent entries as verified to improve accuracy',
      impact: '+10% quality score',
      priority: 'medium',
    },
    {
      title: 'Update Emission Factors',
      description: 'Switch to latest emission factor versions',
      impact: '+8% quality score',
      priority: 'medium',
    },
    {
      title: 'Add Activity Types',
      description: 'Specify activity types for better categorization',
      impact: '+5% quality score',
      priority: 'low',
    },
  ];

  const items = recommendations.length > 0 ? recommendations : defaultRecommendations;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Smart Recommendations
        </CardTitle>
        <CardDescription>
          Prioritized improvements to boost your data quality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((rec, index) => (
          <div
            key={index}
            className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{rec.title}</h4>
                  <Badge variant={getPriorityColor(rec.priority)}>
                    {rec.priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{rec.description}</p>
                <p className="text-sm font-medium text-primary">{rec.impact}</p>
              </div>
              {rec.action && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={rec.action}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
