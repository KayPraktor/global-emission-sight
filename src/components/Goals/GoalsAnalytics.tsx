
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { TrendingUp, TrendingDown, Target, AlertTriangle, DollarSign, Calendar } from 'lucide-react';

const performanceByScope = [
  { scope: 'Scope 1', goals: 3, onTrack: 2, atRisk: 1, avgProgress: 68 },
  { scope: 'Scope 2', goals: 2, onTrack: 2, atRisk: 0, avgProgress: 75 },
  { scope: 'Scope 3', goals: 3, onTrack: 1, atRisk: 2, avgProgress: 45 },
];

const budgetAllocation = [
  { category: 'Energy Efficiency', budget: 2500000, spent: 1800000, goals: 3 },
  { category: 'Renewable Energy', budget: 4200000, spent: 2900000, goals: 2 },
  { category: 'Supply Chain', budget: 850000, spent: 340000, goals: 2 },
  { category: 'Waste Reduction', budget: 650000, spent: 425000, goals: 1 },
];

const timelineData = [
  { year: 2025, planned: 15, achieved: 12, target: 18 },
  { year: 2026, planned: 22, achieved: 0, target: 25 },
  { year: 2027, planned: 28, achieved: 0, target: 32 },
  { year: 2028, planned: 35, achieved: 0, target: 40 },
  { year: 2029, planned: 42, achieved: 0, target: 48 },
  { year: 2030, planned: 50, achieved: 0, target: 55 },
];

const riskMatrix = [
  { risk: 'Regulatory Changes', probability: 7, impact: 8, mitigation: 6 },
  { risk: 'Technology Availability', probability: 5, impact: 7, mitigation: 8 },
  { risk: 'Budget Constraints', probability: 6, impact: 6, mitigation: 7 },
  { risk: 'Supplier Cooperation', probability: 8, impact: 5, mitigation: 5 },
  { risk: 'Market Conditions', probability: 4, impact: 6, mitigation: 6 },
];

const COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

const GoalsAnalytics = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance by Emission Scope</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceByScope}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="scope" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="onTrack" fill="#22c55e" name="On Track" />
                    <Bar dataKey="atRisk" fill="#f59e0b" name="At Risk" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Progress by Scope</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceByScope.map((scope, index) => (
                  <div key={scope.scope} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{scope.scope}</span>
                      <span className="text-sm text-muted-foreground">{scope.avgProgress}%</span>
                    </div>
                    <Progress value={scope.avgProgress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{scope.goals} goals</span>
                      <span>{scope.onTrack} on track, {scope.atRisk} at risk</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Goal Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">5</div>
                  <div className="text-sm text-muted-foreground">On Track</div>
                  <div className="text-xs text-muted-foreground">62.5% of goals</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-600">2</div>
                  <div className="text-sm text-muted-foreground">At Risk</div>
                  <div className="text-xs text-muted-foreground">25% of goals</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">1</div>
                  <div className="text-sm text-muted-foreground">Behind</div>
                  <div className="text-xs text-muted-foreground">12.5% of goals</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Allocation by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={budgetAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="budget"
                    >
                      {budgetAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${(value as number / 1000000).toFixed(1)}M`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Budget Utilization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {budgetAllocation.map((item, index) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.category}</span>
                      <span className="text-sm text-muted-foreground">
                        ${(item.spent / 1000000).toFixed(1)}M / ${(item.budget / 1000000).toFixed(1)}M
                      </span>
                    </div>
                    <Progress value={(item.spent / item.budget) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{item.goals} goals</span>
                      <span>{Math.round((item.spent / item.budget) * 100)}% utilized</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">$8.2M</div>
                  <div className="text-sm text-muted-foreground">Total Budget</div>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">$5.5M</div>
                  <div className="text-sm text-muted-foreground">Spent to Date</div>
                </div>
                <div className="text-center">
                  <Target className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">$2.7M</div>
                  <div className="text-sm text-muted-foreground">Remaining</div>
                </div>
                <div className="text-center">
                  <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">67%</div>
                  <div className="text-sm text-muted-foreground">Utilization Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Goal Achievement Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="target" 
                    stroke="#dc2626" 
                    strokeWidth={2}
                    name="Target Goals"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="planned" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    name="Planned Goals"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="achieved" 
                    stroke="#16a34a" 
                    strokeWidth={2}
                    name="Achieved Goals"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">2030</div>
                  <div className="text-sm text-muted-foreground">Target Completion</div>
                  <Badge className="mt-2">5 years remaining</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-muted-foreground">Goals This Year</div>
                  <Badge variant="outline" className="mt-2">8 completed</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">75%</div>
                  <div className="text-sm text-muted-foreground">On Schedule</div>
                  <Badge variant="outline" className="mt-2">Above target</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment Matrix</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={riskMatrix}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="risk" />
                  <PolarRadiusAxis domain={[0, 10]} />
                  <Radar 
                    name="Probability" 
                    dataKey="probability" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    fillOpacity={0.2} 
                  />
                  <Radar 
                    name="Impact" 
                    dataKey="impact" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    fillOpacity={0.2} 
                  />
                  <Radar 
                    name="Mitigation" 
                    dataKey="mitigation" 
                    stroke="#22c55e" 
                    fill="#22c55e" 
                    fillOpacity={0.2} 
                  />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Risk Factors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {riskMatrix
                  .sort((a, b) => (b.probability * b.impact) - (a.probability * a.impact))
                  .slice(0, 3)
                  .map((risk, index) => (
                    <div key={risk.risk} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{risk.risk}</p>
                        <p className="text-sm text-muted-foreground">
                          Risk Score: {(risk.probability * risk.impact / 10).toFixed(1)}
                        </p>
                      </div>
                      <Badge 
                        variant="outline"
                        className={
                          risk.probability * risk.impact > 50 
                            ? "border-red-300 text-red-700"
                            : risk.probability * risk.impact > 30
                            ? "border-amber-300 text-amber-700" 
                            : "border-green-300 text-green-700"
                        }
                      >
                        {risk.probability * risk.impact > 50 ? 'High' : 
                         risk.probability * risk.impact > 30 ? 'Medium' : 'Low'}
                      </Badge>
                    </div>
                  ))
                }
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Mitigation Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold">68%</div>
                  <div className="text-sm text-muted-foreground">Average Mitigation Score</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Well Mitigated (7+)</span>
                    <span>60%</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Moderately Mitigated (5-7)</span>
                    <span>40%</span>
                  </div>
                  <Progress value={40} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Poorly Mitigated (&lt;5)</span>
                    <span>0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoalsAnalytics;
