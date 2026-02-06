import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Minus } from 'lucide-react';
import { goalsService, GoalWithProgress } from '@/services/goalsService';
import { Skeleton } from '@/components/ui/skeleton';

interface GoalImpactPreviewProps {
  newEmissions: number; // The emissions being added in kg CO2e
}

export const GoalImpactPreview: React.FC<GoalImpactPreviewProps> = ({ newEmissions }) => {
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGoals = async () => {
      setIsLoading(true);
      const { data } = await goalsService.getGoalsWithProgress();
      // Filter to active goals only
      const activeGoals = (data || []).filter(g => 
        g.status === 'in_progress' || g.status === 'at_risk' || g.status === 'not_started'
      );
      setGoals(activeGoals);
      setIsLoading(false);
    };
    fetchGoals();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (goals.length === 0) {
    return null; // Don't show if no active goals
  }

  const getStatusAfterNewEmissions = (goal: GoalWithProgress) => {
    const newActualEmissions = goal.actualEmissions + (newEmissions / 1000); // Convert kg to tCO2e
    
    // Recalculate progress with new emissions
    let newProgressPercentage = 0;
    if (goal.baseline_emissions && goal.target_emissions !== undefined) {
      const targetReduction = goal.baseline_emissions - goal.target_emissions;
      const actualReduction = goal.baseline_emissions - newActualEmissions;
      newProgressPercentage = targetReduction > 0 
        ? Math.min(100, Math.max(0, (actualReduction / targetReduction) * 100))
        : 0;
    } else if (goal.target_reduction_percentage && goal.baseline_emissions) {
      const targetEmissions = goal.baseline_emissions * (1 - goal.target_reduction_percentage / 100);
      const targetReduction = goal.baseline_emissions - targetEmissions;
      const actualReduction = goal.baseline_emissions - newActualEmissions;
      newProgressPercentage = targetReduction > 0
        ? Math.min(100, Math.max(0, (actualReduction / targetReduction) * 100))
        : 0;
    }

    const progressChange = newProgressPercentage - goal.progressPercentage;
    
    // Determine if still on track
    const targetDate = new Date(goal.target_date);
    const baselineDate = new Date(goal.baseline_year || new Date().getFullYear() - 1, 0, 1);
    const totalDays = (targetDate.getTime() - baselineDate.getTime()) / (1000 * 60 * 60 * 24);
    const elapsedDays = (new Date().getTime() - baselineDate.getTime()) / (1000 * 60 * 60 * 24);
    const expectedProgress = (elapsedDays / totalDays) * 100;
    const willBeOnTrack = newProgressPercentage >= expectedProgress - 10;
    
    // Status change detection
    const wasOnTrack = goal.isOnTrack;
    const statusChanged = wasOnTrack !== willBeOnTrack;

    return {
      newProgress: Math.round(newProgressPercentage),
      progressChange: Math.round(progressChange),
      willBeOnTrack,
      statusChanged,
      wasOnTrack
    };
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Goal Impact Preview
        </CardTitle>
        <CardDescription>
          How this data entry affects your active goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => {
          const impact = getStatusAfterNewEmissions(goal);
          
          return (
            <div key={goal.id} className="p-3 rounded-lg bg-background border">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{goal.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    Target: {goal.target_reduction_percentage}% reduction by {new Date(goal.target_date).getFullYear()}
                  </p>
                </div>
                {impact.statusChanged ? (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Status Change
                  </Badge>
                ) : impact.willBeOnTrack ? (
                  <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                    <CheckCircle className="h-3 w-3" />
                    On Track
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                    <AlertTriangle className="h-3 w-3" />
                    At Risk
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{goal.progressPercentage}%</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="font-mono font-medium">{impact.newProgress}%</span>
                    {impact.progressChange !== 0 && (
                      <span className={`flex items-center gap-0.5 ${impact.progressChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {impact.progressChange > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : impact.progressChange < 0 ? (
                          <TrendingDown className="h-3 w-3" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                        {impact.progressChange > 0 ? '+' : ''}{impact.progressChange}%
                      </span>
                    )}
                  </div>
                </div>
                <Progress value={impact.newProgress} className="h-2" />
              </div>
              
              {impact.statusChanged && !impact.willBeOnTrack && (
                <div className="mt-2 p-2 rounded bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-200">
                  ⚠️ This entry will push your goal status to "At Risk". Consider reviewing your reduction strategies.
                </div>
              )}
            </div>
          );
        })}
        
        {newEmissions > 0 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Adding {(newEmissions / 1000).toFixed(3)} tCO₂e to your emissions
          </p>
        )}
      </CardContent>
    </Card>
  );
};
