
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  AlertTriangle, 
  CheckCircle2,
  Clock,
  Users,
  Calendar
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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

      {/* Key Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Q2 Emissions Review</p>
                  <p className="text-sm text-muted-foreground">Scope 1 & 2 reduction targets</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Due in 15 days</Badge>
                <Badge className="bg-amber-100 text-amber-800">Medium Priority</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Supply Chain Assessment</p>
                  <p className="text-sm text-muted-foreground">Scope 3 emissions mapping</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Due in 32 days</Badge>
                <Badge className="bg-red-100 text-red-800">High Priority</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Renewable Energy Transition</p>
                  <p className="text-sm text-muted-foreground">50% renewable energy target</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Due in 45 days</Badge>
                <Badge className="bg-green-100 text-green-800">Low Priority</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalsDashboard;
