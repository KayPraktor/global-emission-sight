
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Users,
  Calendar,
  Trophy,
  Sparkles,
  Plus
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { useCelebrationContext } from '@/contexts/CelebrationContext';
import { SuccessPulse } from '@/components/ui/celebration-effects';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { goalsService, GoalWithProgress } from '@/services/goalsService';
import { useNavigate } from 'react-router-dom';

const GoalsDashboard = () => {
  const [completedMilestones, setCompletedMilestones] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  
  // Try to use celebration context with fallback
  let celebration: ReturnType<typeof useCelebrationContext> | null = null;
  try {
    celebration = useCelebrationContext();
  } catch {
    // Context not available
  }

  // Fetch real goals data
  const { data: goalsResult, isLoading, error } = useQuery({
    queryKey: ['goals-dashboard'],
    queryFn: () => goalsService.getGoalsWithProgress(),
  });

  const goals = goalsResult?.data || [];

  // Calculate summary metrics from real data
  const totalGoals = goals.length;
  const onTrackCount = goals.filter(g => g.isOnTrack).length;
  const atRiskCount = goals.filter(g => !g.isOnTrack).length;
  const avgProgress = totalGoals > 0 
    ? Math.round(goals.reduce((sum, g) => sum + g.progressPercentage, 0) / totalGoals)
    : 0;

  // Generate performance chart data from goals
  const performanceData = goals.length > 0 
    ? goals.slice(0, 6).map((goal, idx) => ({
        name: goal.title.substring(0, 15) + (goal.title.length > 15 ? '...' : ''),
        progress: goal.progressPercentage,
        target: 100,
      }))
    : [];

  // Risk distribution data
  const riskData = [
    { name: 'On Track', value: onTrackCount, color: '#22c55e' },
    { name: 'At Risk', value: atRiskCount, color: '#f59e0b' },
  ];

  const handleMilestoneComplete = (milestoneId: string, milestoneName: string) => {
    if (completedMilestones.has(milestoneId)) return;
    
    const newCompleted = new Set(completedMilestones);
    newCompleted.add(milestoneId);
    setCompletedMilestones(newCompleted);
    
    // Trigger celebration
    if (celebration) {
      const isFirstMilestone = newCompleted.size === 1;
      celebration.celebrateCompletion({
        type: 'milestone',
        title: 'Milestone Achieved! 🎯',
        subtitle: milestoneName,
        isFirstTime: isFirstMilestone
      });
    }
    
    toast.success('Milestone completed! 🎉', {
      description: milestoneName
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
            <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-36" /></CardHeader>
            <CardContent><Skeleton className="h-[300px] w-full" /></CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load goals</h3>
        <p className="text-muted-foreground mb-4">There was an error loading your goals data.</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </Card>
    );
  }

  if (totalGoals === 0) {
    return (
      <Card className="p-8 text-center">
        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
        <p className="text-muted-foreground mb-4">
          Create your first sustainability goal to start tracking your progress toward Net Zero.
        </p>
        <Button onClick={() => navigate('/goals')}>
          <Plus className="mr-2 h-4 w-4" />
          Create Your First Goal
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Goals</p>
                <p className="text-2xl font-bold">{totalGoals}</p>
                <p className="text-xs text-muted-foreground">
                  Active sustainability goals
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">On Track</p>
                <p className="text-2xl font-bold">{onTrackCount}</p>
                <p className="text-xs text-muted-foreground">
                  {totalGoals > 0 ? Math.round((onTrackCount / totalGoals) * 100) : 0}% of goals
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold">{atRiskCount}</p>
                <p className="text-xs text-muted-foreground">Require attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Progress</p>
                <p className="text-2xl font-bold">{avgProgress}%</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Across all goals
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Goal Progress Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Target (100%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="progress" 
                    stroke="#16a34a" 
                    strokeWidth={2}
                    name="Current Progress"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goal Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {riskData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No status data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Active Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {goals.slice(0, 5).map((goal) => {
              const isCompleted = goal.status === 'completed';
              
              return (
                <motion.div
                  key={goal.id}
                  layout
                  className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                    isCompleted ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800' : 'hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {isCompleted ? (
                      <SuccessPulse trigger={false}>
                        <div className="p-1 rounded-full bg-emerald-500 text-white">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      </SuccessPulse>
                    ) : goal.isOnTrack ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {goal.title}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">{goal.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 ml-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{goal.progressPercentage}%</p>
                      <Progress value={goal.progressPercentage} className="w-24 h-2" />
                    </div>
                    <Badge className={goal.isOnTrack ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>
                      {goal.isOnTrack ? 'On Track' : 'At Risk'}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalsDashboard;
