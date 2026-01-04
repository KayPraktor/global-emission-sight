import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, AlertTriangle, Target, Leaf, Users, Building } from 'lucide-react';
import { MaterialityAssessment, TopicCategory } from '@/types/materiality';
import { getMockAssessments, getAssessments, SUSTAINABILITY_TOPICS } from '@/services/materialityService';

const ImpactAnalysis: React.FC = () => {
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

  const materialTopics = assessments.filter(a => a.isMaterial);
  const avgImpactScore = assessments.length > 0 
    ? assessments.reduce((sum, a) => sum + a.impactMateriality.overallScore, 0) / assessments.length 
    : 0;

  const categoryBreakdown = (['environmental', 'social', 'governance'] as TopicCategory[]).map(cat => {
    const catAssessments = assessments.filter(a => a.topicCategory === cat);
    const avgScore = catAssessments.length > 0
      ? catAssessments.reduce((sum, a) => sum + a.impactMateriality.overallScore, 0) / catAssessments.length
      : 0;
    return {
      category: cat,
      avgScore,
      count: catAssessments.length,
      materialCount: catAssessments.filter(a => a.isMaterial).length,
    };
  });

  const esrsBreakdown = assessments.reduce((acc, a) => {
    const std = a.esrsStandard || 'Other';
    if (!acc[std]) {
      acc[std] = { standard: std, avgImpact: 0, count: 0, total: 0 };
    }
    acc[std].total += a.impactMateriality.overallScore;
    acc[std].count += 1;
    return acc;
  }, {} as Record<string, { standard: string; avgImpact: number; count: number; total: number }>);

  const esrsData = Object.values(esrsBreakdown).map(item => ({
    ...item,
    avgImpact: item.total / item.count,
  })).sort((a, b) => b.avgImpact - a.avgImpact);

  const radarData = categoryBreakdown.map(cat => ({
    subject: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
    score: cat.avgScore,
    fullMark: 100,
  }));

  const getCategoryIcon = (category: TopicCategory) => {
    switch (category) {
      case 'environmental': return <Leaf className="h-5 w-5 text-green-600" />;
      case 'social': return <Users className="h-5 w-5 text-blue-600" />;
      case 'governance': return <Building className="h-5 w-5 text-purple-600" />;
    }
  };

  const getCategoryColor = (category: TopicCategory) => {
    switch (category) {
      case 'environmental': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'social': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'governance': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Impact Materiality Analysis</h2>
          <p className="text-muted-foreground">Deep-dive into impact materiality scores and patterns</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Avg Impact Score</CardDescription>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgImpactScore.toFixed(0)}</div>
            <Progress value={avgImpactScore} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>High Impact Topics</CardDescription>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assessments.filter(a => a.impactMateriality.overallScore >= 60).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Score ≥ 60</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Material Topics</CardDescription>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materialTopics.length}</div>
            <p className="text-xs text-muted-foreground mt-1">of {assessments.length} assessed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardDescription>Coverage</CardDescription>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((assessments.length / SUSTAINABILITY_TOPICS.length) * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">of ESRS topics</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Category Overview</CardTitle>
            <CardDescription>Average impact scores by ESG category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Impact Score"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ESRS Standard Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>By ESRS Standard</CardTitle>
            <CardDescription>Average impact score per disclosure standard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={esrsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis type="category" dataKey="standard" width={40} />
                  <Tooltip />
                  <Bar dataKey="avgImpact" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {categoryBreakdown.map(cat => (
          <Card key={cat.category}>
            <CardHeader>
              <div className="flex items-center gap-2">
                {getCategoryIcon(cat.category)}
                <CardTitle className="capitalize">{cat.category}</CardTitle>
              </div>
              <CardDescription>{cat.count} topics assessed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Average Impact Score</span>
                  <span className="font-medium">{cat.avgScore.toFixed(0)}</span>
                </div>
                <Progress value={cat.avgScore} />
              </div>
              <div className="flex justify-between text-sm">
                <span>Material Topics</span>
                <Badge className={getCategoryColor(cat.category)}>
                  {cat.materialCount} / {cat.count}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Impact Topics */}
      <Card>
        <CardHeader>
          <CardTitle>Highest Impact Topics</CardTitle>
          <CardDescription>Topics with the highest impact materiality scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessments
              .sort((a, b) => b.impactMateriality.overallScore - a.impactMateriality.overallScore)
              .slice(0, 5)
              .map((assessment, index) => (
                <div key={assessment.id} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(assessment.topicCategory)}
                      <span className="font-medium">{assessment.topicName}</span>
                      <Badge variant="outline">{assessment.esrsStandard}</Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                      <span>Scale: {assessment.impactMateriality.scale}</span>
                      <span>Scope: {assessment.impactMateriality.scope}</span>
                      <span>Irremediability: {assessment.impactMateriality.irremediability}</span>
                      <span>Likelihood: {assessment.impactMateriality.likelihood}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{assessment.impactMateriality.overallScore.toFixed(0)}</div>
                    <div className="text-xs text-muted-foreground">Impact Score</div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImpactAnalysis;
