import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { Download, Settings, Leaf, Users, Building } from 'lucide-react';
import { MaterialityAssessment, MaterialityMatrixPoint, TopicCategory } from '@/types/materiality';
import { getMockAssessments, getAssessments } from '@/services/materialityService';

const MaterialityMatrix: React.FC = () => {
  const [assessments, setAssessments] = useState<MaterialityAssessment[]>([]);
  const [threshold, setThreshold] = useState(60);
  const [showSettings, setShowSettings] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<TopicCategory | 'all'>('all');

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

  const matrixData: MaterialityMatrixPoint[] = assessments
    .filter(a => categoryFilter === 'all' || a.topicCategory === categoryFilter)
    .map(a => ({
      topicId: a.topicId,
      topicName: a.topicName,
      category: a.topicCategory,
      esrsStandard: a.esrsStandard,
      impactScore: a.impactMateriality.overallScore,
      financialScore: a.financialMateriality.overallScore,
      isMaterial: a.isMaterial,
      stakeholderCount: a.stakeholderIds.length,
    }));

  const getCategoryColor = (category: TopicCategory) => {
    switch (category) {
      case 'environmental': return '#16a34a';
      case 'social': return '#2563eb';
      case 'governance': return '#9333ea';
    }
  };

  const getCategoryIcon = (category: TopicCategory) => {
    switch (category) {
      case 'environmental': return <Leaf className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      case 'governance': return <Building className="h-4 w-4" />;
    }
  };

  const materialCount = matrixData.filter(d => d.isMaterial).length;
  const doubleMatCount = matrixData.filter(d => d.impactScore >= threshold && d.financialScore >= threshold).length;

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: MaterialityMatrixPoint }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            {getCategoryIcon(data.category)}
            <span className="font-semibold">{data.topicName}</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">ESRS:</span>
              <span>{data.esrsStandard}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Impact Score:</span>
              <span>{data.impactScore.toFixed(0)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Financial Score:</span>
              <span>{data.financialScore.toFixed(0)}</span>
            </div>
            <Badge variant={data.isMaterial ? 'default' : 'secondary'} className="w-full justify-center mt-2">
              {data.isMaterial ? 'Material' : 'Not Material'}
            </Badge>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Materiality Matrix</h2>
          <p className="text-muted-foreground">Interactive visualization of double materiality assessment</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {showSettings && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Materiality Threshold</Label>
                  <span className="text-sm text-muted-foreground">{threshold}</span>
                </div>
                <Slider
                  value={[threshold]}
                  onValueChange={([v]) => setThreshold(v)}
                  min={30}
                  max={80}
                  step={5}
                />
              </div>
              <div className="space-y-2">
                <Label>Category Filter</Label>
                <div className="flex gap-2">
                  <Button
                    variant={categoryFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={categoryFilter === 'environmental' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter('environmental')}
                    className="gap-1"
                  >
                    <Leaf className="h-3 w-3" /> Environmental
                  </Button>
                  <Button
                    variant={categoryFilter === 'social' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter('social')}
                    className="gap-1"
                  >
                    <Users className="h-3 w-3" /> Social
                  </Button>
                  <Button
                    variant={categoryFilter === 'governance' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter('governance')}
                    className="gap-1"
                  >
                    <Building className="h-3 w-3" /> Governance
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Topics</CardDescription>
            <CardTitle className="text-2xl">{matrixData.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Material Topics</CardDescription>
            <CardTitle className="text-2xl text-green-600">{materialCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Double Material</CardDescription>
            <CardTitle className="text-2xl text-primary">{doubleMatCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Coverage</CardDescription>
            <CardTitle className="text-2xl">{((matrixData.length / 25) * 100).toFixed(0)}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Matrix Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Double Materiality Matrix</CardTitle>
          <CardDescription>
            Topics above threshold lines are considered material. Points in top-right are double material.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="financialScore" 
                  name="Financial Materiality" 
                  domain={[0, 100]}
                  label={{ value: 'Financial Materiality Score', position: 'bottom', offset: 40 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="impactScore" 
                  name="Impact Materiality" 
                  domain={[0, 100]}
                  label={{ value: 'Impact Materiality Score', angle: -90, position: 'left', offset: 40 }}
                />
                <ReferenceLine 
                  x={threshold} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                  label={{ value: 'Threshold', position: 'top' }}
                />
                <ReferenceLine 
                  y={threshold} 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                />
                <Tooltip content={<CustomTooltip />} />
                <Scatter name="Topics" data={matrixData}>
                  {matrixData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getCategoryColor(entry.category)}
                      opacity={entry.isMaterial ? 1 : 0.5}
                      r={entry.isMaterial ? 10 : 6}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Quadrant Legend */}
          <div className="grid grid-cols-2 gap-4 mt-6 max-w-xl mx-auto">
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded p-3 text-center">
              <h4 className="font-semibold text-red-800 dark:text-red-200">Double Material</h4>
              <p className="text-xs text-red-600 dark:text-red-400">High impact & financial</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded p-3 text-center">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200">Impact Material</h4>
              <p className="text-xs text-blue-600 dark:text-blue-400">High impact, lower financial</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded p-3 text-center">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Financial Material</h4>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">Lower impact, high financial</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-3 text-center">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">Not Material</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Below thresholds</p>
            </div>
          </div>

          {/* Category Legend */}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-600" />
              <span className="text-sm">Environmental</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-600" />
              <span className="text-sm">Social</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-purple-600" />
              <span className="text-sm">Governance</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Material Topics List */}
      <Card>
        <CardHeader>
          <CardTitle>Material Topics Summary</CardTitle>
          <CardDescription>Topics identified as material based on current thresholds</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {matrixData.filter(d => d.isMaterial).sort((a, b) => 
              (b.impactScore + b.financialScore) - (a.impactScore + a.financialScore)
            ).map(topic => (
              <div key={topic.topicId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getCategoryIcon(topic.category)}
                  <div>
                    <h4 className="font-medium">{topic.topicName}</h4>
                    <p className="text-sm text-muted-foreground">{topic.esrsStandard}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm">Impact: <span className="font-medium">{topic.impactScore.toFixed(0)}</span></div>
                    <div className="text-sm">Financial: <span className="font-medium">{topic.financialScore.toFixed(0)}</span></div>
                  </div>
                  <Badge variant={topic.impactScore >= threshold && topic.financialScore >= threshold ? 'default' : 'secondary'}>
                    {topic.impactScore >= threshold && topic.financialScore >= threshold ? 'Double' : 'Single'}
                  </Badge>
                </div>
              </div>
            ))}
            {matrixData.filter(d => d.isMaterial).length === 0 && (
              <p className="text-center text-muted-foreground py-8">No material topics assessed yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialityMatrix;
