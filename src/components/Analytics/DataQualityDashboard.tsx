import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, AlertTriangle, Clock, TrendingUp, FileWarning } from 'lucide-react';
import { dataQualityService, type DataQualityScore, type ValidationError } from '@/services/dataQualityService';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

export function DataQualityDashboard() {
  const [qualityScore, setQualityScore] = useState<DataQualityScore | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDataQuality();
  }, []);

  const loadDataQuality = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [score, errors] = await Promise.all([
        dataQualityService.calculateDataQuality(user.id),
        dataQualityService.validateEntries(user.id),
      ]);

      setQualityScore(score);
      setValidationErrors(errors);
    } catch (error) {
      console.error('Error loading data quality:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!qualityScore) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Quality</CardTitle>
          <CardDescription>No data available to analyze</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const criticalErrors = validationErrors.filter(e => e.severity === 'error');
  const warnings = validationErrors.filter(e => e.severity === 'warning');

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Overall Data Quality</CardTitle>
              <CardDescription>
                Assessment of your emissions data completeness and accuracy
              </CardDescription>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${getScoreColor(qualityScore.overall)}`}>
                {qualityScore.overall}%
              </div>
              <p className="text-sm text-muted-foreground">{getScoreLabel(qualityScore.overall)}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Completeness</span>
                    <CheckCircle2 className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold">{qualityScore.completeness}%</div>
                  <Progress value={qualityScore.completeness} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Accuracy</span>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">{qualityScore.accuracy}%</div>
                  <Progress value={qualityScore.accuracy} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Freshness</span>
                    <Clock className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold">{qualityScore.freshness}%</div>
                  <Progress value={qualityScore.freshness} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Consistency</span>
                    <FileWarning className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="text-2xl font-bold">{qualityScore.consistency}%</div>
                  <Progress value={qualityScore.consistency} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Validation Errors */}
      <Card>
        <CardHeader>
          <CardTitle>Validation Issues</CardTitle>
          <CardDescription>
            {criticalErrors.length} critical errors, {warnings.length} warnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {validationErrors.length === 0 ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription>
                All data entries passed validation. Great work!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {criticalErrors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <h4 className="font-semibold text-red-600">Critical Errors</h4>
                    <Badge variant="destructive">{criticalErrors.length}</Badge>
                  </div>
                  <div className="space-y-1 ml-6">
                    {criticalErrors.slice(0, 5).map((error, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        • {error.field}: {error.error}
                      </p>
                    ))}
                    {criticalErrors.length > 5 && (
                      <p className="text-sm text-muted-foreground italic">
                        ...and {criticalErrors.length - 5} more
                      </p>
                    )}
                  </div>
                </div>
              )}

              {warnings.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <h4 className="font-semibold text-yellow-600">Warnings</h4>
                    <Badge variant="outline" className="bg-yellow-50">
                      {warnings.length}
                    </Badge>
                  </div>
                  <div className="space-y-1 ml-6">
                    {warnings.slice(0, 5).map((error, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        • {error.field}: {error.error}
                      </p>
                    ))}
                    {warnings.length > 5 && (
                      <p className="text-sm text-muted-foreground italic">
                        ...and {warnings.length - 5} more
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
          <CardDescription>Actions to improve your data quality</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {qualityScore.completeness < 80 && (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium">Improve Completeness</p>
                  <p className="text-sm text-muted-foreground">
                    Fill in missing fields like facility assignments and activity types
                  </p>
                </div>
              </div>
            )}
            
            {qualityScore.freshness < 80 && (
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-purple-500" />
                <div className="flex-1">
                  <p className="font-medium">Update Data More Frequently</p>
                  <p className="text-sm text-muted-foreground">
                    Your data is getting stale. Add recent emissions entries to maintain freshness
                  </p>
                </div>
              </div>
            )}
            
            {qualityScore.accuracy < 80 && (
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 mt-0.5 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium">Verify Your Data</p>
                  <p className="text-sm text-muted-foreground">
                    Review and verify entries to increase accuracy score
                  </p>
                </div>
              </div>
            )}

            {qualityScore.overall >= 80 && (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-500" />
                <div className="flex-1">
                  <p className="font-medium">Excellent Data Quality!</p>
                  <p className="text-sm text-muted-foreground">
                    Your emissions data meets high quality standards. Keep up the good work!
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
