import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, CheckCircle, Circle, Leaf, Users, Building } from 'lucide-react';
import { MaterialityAssessment, SustainabilityTopic, TimeHorizon, TopicCategory } from '@/types/materiality';
import { 
  SUSTAINABILITY_TOPICS, 
  calculateImpactScore, 
  calculateFinancialScore, 
  isMaterialTopic,
  saveAssessment,
  getAssessments
} from '@/services/materialityService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const TopicAssessment: React.FC = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<MaterialityAssessment[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<SustainabilityTopic | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<TopicCategory>('environmental');
  
  const [formData, setFormData] = useState({
    impactScale: 3,
    impactScope: 3,
    impactIrremediability: 3,
    impactLikelihood: 3,
    financialMagnitude: 3,
    financialLikelihood: 3,
    financialTimeHorizon: 'medium' as TimeHorizon,
    evidence: '',
  });

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const data = await getAssessments();
      setAssessments(data);
    } catch (error) {
      console.error('Error loading assessments:', error);
      toast.error('Failed to load assessments. Please try again.');
      setAssessments([]);
    }
  };

  const impactScore = calculateImpactScore({
    scale: formData.impactScale,
    scope: formData.impactScope,
    irremediability: formData.impactIrremediability,
    likelihood: formData.impactLikelihood,
  });

  const financialScore = calculateFinancialScore({
    magnitude: formData.financialMagnitude,
    likelihood: formData.financialLikelihood,
    timeHorizon: formData.financialTimeHorizon,
  });

  const isMaterial = isMaterialTopic(impactScore, financialScore);

  const handleSaveAssessment = async () => {
    if (!selectedTopic) return;

    try {
      if (user) {
        await saveAssessment({
          userId: user.id,
          topicId: selectedTopic.id,
          topicName: selectedTopic.name,
          topicCategory: selectedTopic.category,
          esrsStandard: selectedTopic.esrsStandard,
          impactMateriality: {
            scale: formData.impactScale,
            scope: formData.impactScope,
            irremediability: formData.impactIrremediability,
            likelihood: formData.impactLikelihood,
            overallScore: impactScore,
          },
          financialMateriality: {
            magnitude: formData.financialMagnitude,
            likelihood: formData.financialLikelihood,
            timeHorizon: formData.financialTimeHorizon,
            overallScore: financialScore,
          },
          isMaterial,
          stakeholderIds: [],
          evidence: formData.evidence,
        });
        await loadAssessments();
      } else {
        const newAssessment: MaterialityAssessment = {
          id: Date.now().toString(),
          userId: 'demo',
          topicId: selectedTopic.id,
          topicName: selectedTopic.name,
          topicCategory: selectedTopic.category,
          esrsStandard: selectedTopic.esrsStandard,
          impactMateriality: {
            scale: formData.impactScale,
            scope: formData.impactScope,
            irremediability: formData.impactIrremediability,
            likelihood: formData.impactLikelihood,
            overallScore: impactScore,
          },
          financialMateriality: {
            magnitude: formData.financialMagnitude,
            likelihood: formData.financialLikelihood,
            timeHorizon: formData.financialTimeHorizon,
            overallScore: financialScore,
          },
          isMaterial,
          stakeholderIds: [],
          evidence: formData.evidence,
          assessedAt: new Date().toISOString(),
        };
        setAssessments(prev => [...prev.filter(a => a.topicId !== selectedTopic.id), newAssessment]);
      }

      setIsDialogOpen(false);
      setSelectedTopic(null);
      setFormData({
        impactScale: 3,
        impactScope: 3,
        impactIrremediability: 3,
        impactLikelihood: 3,
        financialMagnitude: 3,
        financialLikelihood: 3,
        financialTimeHorizon: 'medium',
        evidence: '',
      });
      toast.success('Assessment saved successfully');
    } catch {
      toast.error('Failed to save assessment');
    }
  };

  const getCategoryIcon = (category: TopicCategory) => {
    switch (category) {
      case 'environmental': return <Leaf className="h-4 w-4 text-green-600" />;
      case 'social': return <Users className="h-4 w-4 text-blue-600" />;
      case 'governance': return <Building className="h-4 w-4 text-purple-600" />;
    }
  };

  const getAssessmentStatus = (topicId: string) => {
    return assessments.find(a => a.topicId === topicId);
  };

  const topicsByCategory = SUSTAINABILITY_TOPICS.filter(t => t.category === activeCategory);
  const assessedCount = assessments.length;
  const materialCount = assessments.filter(a => a.isMaterial).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Topic Assessment</h2>
          <p className="text-muted-foreground">Score sustainability topics for double materiality</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            {assessedCount} / {SUSTAINABILITY_TOPICS.length} assessed
          </Badge>
          <Badge variant="default" className="text-sm">
            {materialCount} material topics
          </Badge>
        </div>
      </div>

      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as TopicCategory)}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="environmental" className="flex items-center gap-2">
            <Leaf className="h-4 w-4" />
            Environmental
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Social
          </TabsTrigger>
          <TabsTrigger value="governance" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Governance
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topicsByCategory.map(topic => {
              const assessment = getAssessmentStatus(topic.id);
              
              return (
                <Card key={topic.id} className={assessment ? 'border-primary/50' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(topic.category)}
                        <Badge variant="outline">{topic.esrsStandard}</Badge>
                      </div>
                      {assessment ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <CardTitle className="text-base mt-2">{topic.name}</CardTitle>
                    <CardDescription className="text-xs">{topic.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {assessment ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Impact Score:</span>
                          <span className="font-medium">{assessment.impactMateriality.overallScore.toFixed(0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Financial Score:</span>
                          <span className="font-medium">{assessment.financialMateriality.overallScore.toFixed(0)}</span>
                        </div>
                        <Badge variant={assessment.isMaterial ? 'default' : 'secondary'} className="w-full justify-center">
                          {assessment.isMaterial ? 'Material' : 'Not Material'}
                        </Badge>
                      </div>
                    ) : (
                      <Dialog open={isDialogOpen && selectedTopic?.id === topic.id} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setSelectedTopic(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => setSelectedTopic(topic)}
                          >
                            <ClipboardList className="h-4 w-4 mr-2" />
                            Assess Topic
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              {getCategoryIcon(topic.category)}
                              {topic.name}
                            </DialogTitle>
                            <DialogDescription>{topic.description}</DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6 py-4">
                            {/* Impact Materiality */}
                            <div className="space-y-4">
                              <h3 className="font-semibold text-lg border-b pb-2">Impact Materiality</h3>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <Label>Scale of Impact</Label>
                                  <span className="text-sm text-muted-foreground">{formData.impactScale}/5</span>
                                </div>
                                <Slider
                                  value={[formData.impactScale]}
                                  onValueChange={([v]) => setFormData(prev => ({ ...prev, impactScale: v }))}
                                  min={1}
                                  max={5}
                                  step={1}
                                />
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <Label>Scope of Impact</Label>
                                  <span className="text-sm text-muted-foreground">{formData.impactScope}/5</span>
                                </div>
                                <Slider
                                  value={[formData.impactScope]}
                                  onValueChange={([v]) => setFormData(prev => ({ ...prev, impactScope: v }))}
                                  min={1}
                                  max={5}
                                  step={1}
                                />
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <Label>Irremediability</Label>
                                  <span className="text-sm text-muted-foreground">{formData.impactIrremediability}/5</span>
                                </div>
                                <Slider
                                  value={[formData.impactIrremediability]}
                                  onValueChange={([v]) => setFormData(prev => ({ ...prev, impactIrremediability: v }))}
                                  min={1}
                                  max={5}
                                  step={1}
                                />
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <Label>Likelihood</Label>
                                  <span className="text-sm text-muted-foreground">{formData.impactLikelihood}/5</span>
                                </div>
                                <Slider
                                  value={[formData.impactLikelihood]}
                                  onValueChange={([v]) => setFormData(prev => ({ ...prev, impactLikelihood: v }))}
                                  min={1}
                                  max={5}
                                  step={1}
                                />
                              </div>

                              <div className="bg-muted p-3 rounded-lg">
                                <div className="flex justify-between">
                                  <span className="font-medium">Impact Score:</span>
                                  <span className="font-bold text-lg">{impactScore.toFixed(0)}/100</span>
                                </div>
                              </div>
                            </div>

                            {/* Financial Materiality */}
                            <div className="space-y-4">
                              <h3 className="font-semibold text-lg border-b pb-2">Financial Materiality</h3>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <Label>Magnitude of Impact</Label>
                                  <span className="text-sm text-muted-foreground">{formData.financialMagnitude}/5</span>
                                </div>
                                <Slider
                                  value={[formData.financialMagnitude]}
                                  onValueChange={([v]) => setFormData(prev => ({ ...prev, financialMagnitude: v }))}
                                  min={1}
                                  max={5}
                                  step={1}
                                />
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <Label>Likelihood</Label>
                                  <span className="text-sm text-muted-foreground">{formData.financialLikelihood}/5</span>
                                </div>
                                <Slider
                                  value={[formData.financialLikelihood]}
                                  onValueChange={([v]) => setFormData(prev => ({ ...prev, financialLikelihood: v }))}
                                  min={1}
                                  max={5}
                                  step={1}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label>Time Horizon</Label>
                                <Select
                                  value={formData.financialTimeHorizon}
                                  onValueChange={(v: TimeHorizon) => setFormData(prev => ({ ...prev, financialTimeHorizon: v }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="short">Short-term (&lt;1 year)</SelectItem>
                                    <SelectItem value="medium">Medium-term (1-5 years)</SelectItem>
                                    <SelectItem value="long">Long-term (&gt;5 years)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="bg-muted p-3 rounded-lg">
                                <div className="flex justify-between">
                                  <span className="font-medium">Financial Score:</span>
                                  <span className="font-bold text-lg">{financialScore.toFixed(0)}/100</span>
                                </div>
                              </div>
                            </div>

                            {/* Evidence */}
                            <div className="space-y-2">
                              <Label>Evidence / Justification</Label>
                              <Textarea
                                value={formData.evidence}
                                onChange={(e) => setFormData(prev => ({ ...prev, evidence: e.target.value }))}
                                placeholder="Document the rationale for these scores..."
                                rows={3}
                              />
                            </div>

                            {/* Materiality Result */}
                            <div className={`p-4 rounded-lg ${isMaterial ? 'bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-semibold">Materiality Determination</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Based on threshold of 60 for single, 40+40 for double
                                  </p>
                                </div>
                                <Badge variant={isMaterial ? 'default' : 'secondary'} className="text-lg px-4 py-1">
                                  {isMaterial ? 'MATERIAL' : 'NOT MATERIAL'}
                                </Badge>
                              </div>
                            </div>

                            <Button onClick={handleSaveAssessment} className="w-full">
                              Save Assessment
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TopicAssessment;
