import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, ClipboardList, Grid3X3, TrendingUp, DollarSign, Wand2 } from 'lucide-react';
import StakeholderMapping from './StakeholderMapping';
import TopicAssessment from './TopicAssessment';
import MaterialityMatrix from './MaterialityMatrix';
import ImpactAnalysis from './ImpactAnalysis';
import FinancialMateriality from './FinancialMateriality';
import AssessmentWizard from './AssessmentWizard';
import { getMockAssessments, getMockStakeholders, getAssessments, getStakeholders, SUSTAINABILITY_TOPICS } from '@/services/materialityService';
import { MaterialityAssessment, Stakeholder } from '@/types/materiality';

const MaterialityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [assessments, setAssessments] = useState<MaterialityAssessment[]>([]);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [assessmentData, stakeholderData] = await Promise.all([
        getAssessments(),
        getStakeholders()
      ]);
      setAssessments(assessmentData.length > 0 ? assessmentData : getMockAssessments());
      setStakeholders(stakeholderData.length > 0 ? stakeholderData : getMockStakeholders());
    } catch {
      setAssessments(getMockAssessments());
      setStakeholders(getMockStakeholders());
    }
  };

  const materialCount = assessments.filter(a => a.isMaterial).length;
  const avgImpactScore = assessments.length > 0
    ? assessments.reduce((sum, a) => sum + a.impactMateriality.overallScore, 0) / assessments.length
    : 0;
  const avgFinancialScore = assessments.length > 0
    ? assessments.reduce((sum, a) => sum + a.financialMateriality.overallScore, 0) / assessments.length
    : 0;
  const coveragePercent = (assessments.length / SUSTAINABILITY_TOPICS.length) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Double Materiality Assessment</h1>
          <p className="text-muted-foreground">
            CSRD/ESRS compliant materiality assessment for sustainability reporting
          </p>
        </div>
        <Button onClick={() => setActiveTab('wizard')}>
          <Wand2 className="h-4 w-4 mr-2" />
          Start Wizard
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden md:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="stakeholders" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden md:inline">Stakeholders</span>
          </TabsTrigger>
          <TabsTrigger value="assessment" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden md:inline">Assessment</span>
          </TabsTrigger>
          <TabsTrigger value="matrix" className="flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            <span className="hidden md:inline">Matrix</span>
          </TabsTrigger>
          <TabsTrigger value="impact" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden md:inline">Impact</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden md:inline">Financial</span>
          </TabsTrigger>
          <TabsTrigger value="wizard" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            <span className="hidden md:inline">Wizard</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Key Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Topics Assessed</CardDescription>
                <CardTitle className="text-3xl">{assessments.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {coveragePercent.toFixed(0)}% of ESRS topics
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Material Topics</CardDescription>
                <CardTitle className="text-3xl text-green-600">{materialCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className="text-green-600">
                  {assessments.length > 0 ? ((materialCount / assessments.length) * 100).toFixed(0) : 0}% material
                </Badge>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Avg Impact Score</CardDescription>
                <CardTitle className="text-3xl">{avgImpactScore.toFixed(0)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">out of 100</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Avg Financial Score</CardDescription>
                <CardTitle className="text-3xl">{avgFinancialScore.toFixed(0)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">out of 100</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Summary */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Material Topics</CardTitle>
                <CardDescription>Topics identified as material for disclosure</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assessments.filter(a => a.isMaterial).slice(0, 5).map(assessment => (
                    <div key={assessment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{assessment.esrsStandard}</Badge>
                        <span className="font-medium">{assessment.topicName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span>I: {assessment.impactMateriality.overallScore.toFixed(0)}</span>
                        <span>F: {assessment.financialMateriality.overallScore.toFixed(0)}</span>
                      </div>
                    </div>
                  ))}
                  {assessments.filter(a => a.isMaterial).length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No material topics yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Stakeholder Engagement</CardTitle>
                <CardDescription>Key stakeholder groups identified</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stakeholders.slice(0, 5).map(stakeholder => (
                    <div key={stakeholder.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{stakeholder.name}</span>
                        <p className="text-sm text-muted-foreground capitalize">{stakeholder.category}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={stakeholder.influence === 'high' ? 'destructive' : 'secondary'}>
                          {stakeholder.influence}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {stakeholders.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">No stakeholders mapped yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Getting Started */}
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>Complete your double materiality assessment in 4 steps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div 
                  className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setActiveTab('stakeholders')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">1</span>
                    </div>
                    <h4 className="font-medium">Map Stakeholders</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Identify and categorize key stakeholder groups
                  </p>
                </div>
                <div 
                  className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setActiveTab('assessment')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">2</span>
                    </div>
                    <h4 className="font-medium">Assess Topics</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Score ESRS topics for impact and financial materiality
                  </p>
                </div>
                <div 
                  className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setActiveTab('matrix')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">3</span>
                    </div>
                    <h4 className="font-medium">View Matrix</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Visualize and analyze materiality results
                  </p>
                </div>
                <div 
                  className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setActiveTab('wizard')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-bold text-primary">4</span>
                    </div>
                    <h4 className="font-medium">Use Wizard</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Guided step-by-step assessment workflow
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stakeholders" className="mt-6">
          <StakeholderMapping />
        </TabsContent>

        <TabsContent value="assessment" className="mt-6">
          <TopicAssessment />
        </TabsContent>

        <TabsContent value="matrix" className="mt-6">
          <MaterialityMatrix />
        </TabsContent>

        <TabsContent value="impact" className="mt-6">
          <ImpactAnalysis />
        </TabsContent>

        <TabsContent value="financial" className="mt-6">
          <FinancialMateriality />
        </TabsContent>

        <TabsContent value="wizard" className="mt-6">
          <AssessmentWizard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaterialityDashboard;
