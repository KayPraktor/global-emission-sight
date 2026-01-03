
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Sparkles
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useCelebrationContext } from '@/contexts/CelebrationContext';
import { SuccessPulse } from '@/components/ui/celebration-effects';
import { toast } from 'sonner';

const performanceData = [
  { month: 'Jan', target: 100, actual: 95, projected: 98 },
  { month: 'Feb', target: 90, actual: 88, projected: 92 },
  { month: 'Mar', target: 80, actual: 85, projected: 87 },
  { month: 'Apr', target: 70, actual: 75, projected: 78 },
  { month: 'May', target: 60, actual: 62, projected: 65 },
  { month: 'Jun', target: 50, actual: 48, projected: 52 },
];

const riskData = [
  { name: 'Low Risk', value: 5, color: '#22c55e' },
  { name: 'Medium Risk', value: 2, color: '#f59e0b' },
  { name: 'High Risk', value: 1, color: '#ef4444' },
];

const GoalsDashboard = () => {
  const [completedMilestones, setCompletedMilestones] = useState<Set<string>>(new Set());
  
  // Try to use celebration context with fallback
  let celebration: ReturnType<typeof useCelebrationContext> | null = null;
  try {
    celebration = useCelebrationContext();
  } catch {
    // Context not available
  }

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

  return (
    <div className="space-y-6">
      {/* Executive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Goals</p>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+2</span> from last quarter
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
                <p className="text-2xl font-bold">5</p>
                <p className="text-xs text-muted-foreground">62.5% of goals</p>
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
                <p className="text-2xl font-bold">2</p>
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
                <p className="text-2xl font-bold">68%</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5% this month
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
            <CardTitle>Goal Performance Trajectory</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  name="Target"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#16a34a" 
                  strokeWidth={2}
                  name="Actual"
                />
                <Line 
                  type="monotone" 
                  dataKey="projected" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Projected"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskData}
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Upcoming Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: 'q2-review', name: 'Q2 Emissions Review', desc: 'Scope 1 & 2 reduction targets', icon: Calendar, color: 'blue', days: 15, priority: 'Medium' },
              { id: 'supply-chain', name: 'Supply Chain Assessment', desc: 'Scope 3 emissions mapping', icon: Users, color: 'green', days: 32, priority: 'High' },
              { id: 'renewable', name: 'Renewable Energy Transition', desc: '50% renewable energy target', icon: Clock, color: 'purple', days: 45, priority: 'Low' }
            ].map((milestone) => {
              const isCompleted = completedMilestones.has(milestone.id);
              const IconComponent = milestone.icon;
              
              return (
                <motion.div
                  key={milestone.id}
                  layout
                  className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
                    isCompleted ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800' : 'hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {isCompleted ? (
                      <SuccessPulse trigger={false}>
                        <div className="p-1 rounded-full bg-emerald-500 text-white">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                      </SuccessPulse>
                    ) : (
                      <IconComponent className={`h-5 w-5 text-${milestone.color}-600`} />
                    )}
                    <div>
                      <p className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                        {milestone.name}
                      </p>
                      <p className="text-sm text-muted-foreground">{milestone.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!isCompleted && (
                      <>
                        <Badge variant="outline">Due in {milestone.days} days</Badge>
                        <Badge className={`
                          ${milestone.priority === 'High' ? 'bg-red-100 text-red-800' : ''}
                          ${milestone.priority === 'Medium' ? 'bg-amber-100 text-amber-800' : ''}
                          ${milestone.priority === 'Low' ? 'bg-green-100 text-green-800' : ''}
                        `}>
                          {milestone.priority} Priority
                        </Badge>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant={isCompleted ? 'ghost' : 'outline'}
                      onClick={() => handleMilestoneComplete(milestone.id, milestone.name)}
                      disabled={isCompleted}
                      className={isCompleted ? 'text-emerald-600' : ''}
                    >
                      {isCompleted ? (
                        <>
                          <Sparkles className="h-4 w-4 mr-1" />
                          Completed
                        </>
                      ) : (
                        'Mark Complete'
                      )}
                    </Button>
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
