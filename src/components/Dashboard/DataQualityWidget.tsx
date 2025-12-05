import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { dataQualityService, type DataQualityScore } from '@/services/dataQualityService';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight,
  Loader2,
  Shield
} from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/animated-elements';

export const DataQualityWidget: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [qualityScore, setQualityScore] = useState<DataQualityScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadQualityScore();
    }
  }, [user]);

  const loadQualityScore = async () => {
    if (!user) return;

    try {
      const score = await dataQualityService.calculateDataQuality(user.id);
      setQualityScore(score);
    } catch (error) {
      console.error('Error loading quality score:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 60) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Data Quality</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!qualityScore) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Data Quality</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No data available to assess quality
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Data Quality</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/analytics?tab=quality')}
          >
            View Details
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overall Score */}
        <div className={`p-4 rounded-lg border mb-4 ${getScoreBg(qualityScore.overall)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Score</span>
            {getScoreIcon(qualityScore.overall)}
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold ${getScoreColor(qualityScore.overall)}`}>
              <AnimatedCounter value={qualityScore.overall} suffix="%" />
            </span>
            <span className="text-sm text-muted-foreground">
              {qualityScore.overall >= 80 ? 'Excellent' : qualityScore.overall >= 60 ? 'Good' : 'Needs Improvement'}
            </span>
          </div>
        </div>

        {/* Metric Breakdown */}
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completeness</span>
              <span className="font-medium">{qualityScore.completeness}%</span>
            </div>
            <Progress value={qualityScore.completeness} className="h-1.5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Accuracy</span>
              <span className="font-medium">{qualityScore.accuracy}%</span>
            </div>
            <Progress value={qualityScore.accuracy} className="h-1.5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Freshness</span>
              <span className="font-medium">{qualityScore.freshness}%</span>
            </div>
            <Progress value={qualityScore.freshness} className="h-1.5" />
          </div>
        </div>

        {/* Action Alert */}
        {qualityScore.overall < 70 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">Action Required</p>
                <p className="text-xs text-amber-700 mt-1">
                  Your data quality is below recommended standards. Review and improve your entries.
                </p>
              </div>
            </div>
          </div>
        )}

        {qualityScore.overall >= 80 && (
          <div className="mt-4 flex items-center gap-2 text-sm text-green-700">
            <TrendingUp className="h-4 w-4" />
            <span>Data quality is excellent!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
