import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { MaterialityAssessment, TimeHorizon } from '@/types/materiality';
import { getMockAssessments, getAssessments } from '@/services/materialityService';

const FinancialMateriality: React.FC = () => {
  const [assessments, setAssessments] = useState<MaterialityAssessment[]>([]);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const data = await getAssessments();
      if (data.length === 0) {
        setAssessments(getMockAssessments());
      } else {
        setAssessments(data);
      }
    } catch {
      setAssessments(getMockAssessments());
    }
  };

  const avgFinancialScore = assessments.length > 0
    ? assessments.reduce((sum, a) => sum + a.financialMateriality.overallScore, 0) / assessments.length
    : 0;

  const highRiskTopics = assessments.filter(a => a.financialMateriality.overallScore >= 60);

  const timeHorizonData = (['short', 'medium', 'long'] as TimeHorizon[]).map(horizon => ({
    horizon: horizon === 'short' ? 'Short-term' : horizon === 'medium' ? 'Medium-term' : 'Long-term',
    count: assessments.filter(a => a.financialMateriality.timeHorizon === horizon).length,
    avgScore: assessments.filter(a => a.financialMateriality.timeHorizon === horizon).length > 0
      ? assessments
          .filter(a => a.financialMateriality.timeHorizon === horizon)
          .reduce((sum, a) => sum + a.financialMateriality.overallScore, 0) /
        assessments.filter(a => a.financialMateriality.timeHorizon === horizon).length
      : 0,
  }));

  const pieColors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

  const riskExposure = assessments.reduce((acc, a) => {
    if (a.financialMateriality.overallScore >= 70) acc.high++;
    else if (a.financialMateriality.overallScore >= 40) acc.medium++;
    else acc.low++;
    return acc;
  }, { high: 0, medium: 0, low: 0 });

  const riskPieData = [
    { name: 'High Risk', value: riskExposure.high },
    { name: 'Medium Risk', value: riskExposure.medium },
    { name: 'Low Risk', value: riskExposure.low },
  ].filter(d => d.value > 0);

  const riskColors = ['#ef4444', '#f59e0b', '#22c55e'];

  const getTimeHorizonBadge = (horizon: TimeHorizon) => {
    switch (horizon) {
      case 'short': return <Badge variant="destructive">Short-term</Badge>;
      case 'medium': return <Badge variant="default">Medium-term</Badge>;
      case 'long': return <Badge variant="secondary">Long-term</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Materiality Analysis</h2>
          <p className="text-muted-foreground">Assess financial risks and opportunities from sustainability topics</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Avg Financial Score</CardDescription>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgFinancialScore.toFixed(0)}</div>
            <Progress value={avgFinancialScore} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>High Risk Topics</CardDescription>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highRiskTopics.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Score ≥ 60</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Short-term Risks</CardDescription>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assessments.filter(a => a.financialMateriality.timeHorizon === 'short').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">&lt; 1 year horizon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Total Assessed</CardDescription>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assessments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">topics evaluated</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Time Horizon Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Time Horizon Distribution</CardTitle>
            <CardDescription>Financial impacts by time horizon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeHorizonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="horizon" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Topics" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {timeHorizonData.map(item => (
                <div key={item.horizon} className="text-center">
                  <div className="font-medium text-sm">{item.horizon}</div>
                  <div className="text-xs text-muted-foreground">Avg: {item.avgScore.toFixed(0)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Exposure */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Exposure</CardTitle>
            <CardDescription>Distribution of financial risk levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {riskPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={riskColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm">High (&ge;70)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm">Medium (40-69)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm">Low (&lt;40)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Risk Register */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Risk Register</CardTitle>
          <CardDescription>Topics ranked by financial materiality exposure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessments
              .sort((a, b) => b.financialMateriality.overallScore - a.financialMateriality.overallScore)
              .map(assessment => {
                const riskLevel = assessment.financialMateriality.overallScore >= 70 ? 'high' 
                  : assessment.financialMateriality.overallScore >= 40 ? 'medium' : 'low';
                
                return (
                  <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{assessment.topicName}</h4>
                        <Badge variant="outline">{assessment.esrsStandard}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Magnitude: {assessment.financialMateriality.magnitude}/5</span>
                        <span>Likelihood: {assessment.financialMateriality.likelihood}/5</span>
                        {getTimeHorizonBadge(assessment.financialMateriality.timeHorizon)}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xl font-bold">{assessment.financialMateriality.overallScore.toFixed(0)}</div>
                        <div className="text-xs text-muted-foreground">Financial Score</div>
                      </div>
                      <Badge 
                        variant={riskLevel === 'high' ? 'destructive' : riskLevel === 'medium' ? 'default' : 'secondary'}
                        className="min-w-[70px] justify-center"
                      >
                        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialMateriality;
