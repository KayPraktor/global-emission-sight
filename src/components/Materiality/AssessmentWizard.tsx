import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, ArrowRight, CheckCircle, BookOpen, Users, ClipboardList, BarChart3, Download, Leaf } from 'lucide-react';
import { SustainabilityTopic, TimeHorizon } from '@/types/materiality';
import { 
  SUSTAINABILITY_TOPICS, 
  calculateImpactScore, 
  calculateFinancialScore, 
  isMaterialTopic,
  saveAssessment
} from '@/services/materialityService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: 'Introduction', icon: BookOpen },
  { id: 2, title: 'Topic Selection', icon: Leaf },
  { id: 3, title: 'Impact Assessment', icon: ClipboardList },
  { id: 4, title: 'Financial Assessment', icon: BarChart3 },
  { id: 5, title: 'Review & Finalize', icon: CheckCircle },
];

const AssessmentWizard: React.FC = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTopics, setSelectedTopics] = useState<SustainabilityTopic[]>([]);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [assessments, setAssessments] = useState<Record<string, {
    impactScale: number;
    impactScope: number;
    impactIrremediability: number;
    impactLikelihood: number;
    financialMagnitude: number;
    financialLikelihood: number;
    financialTimeHorizon: TimeHorizon;
    evidence: string;
  }>>({});

  const handleTopicToggle = (topic: SustainabilityTopic) => {
    setSelectedTopics(prev => 
      prev.find(t => t.id === topic.id)
        ? prev.filter(t => t.id !== topic.id)
        : [...prev, topic]
    );
  };

  const currentTopic = selectedTopics[currentTopicIndex];
  const currentAssessment = currentTopic ? assessments[currentTopic.id] || {
    impactScale: 3,
    impactScope: 3,
    impactIrremediability: 3,
    impactLikelihood: 3,
    financialMagnitude: 3,
    financialLikelihood: 3,
    financialTimeHorizon: 'medium' as TimeHorizon,
    evidence: '',
  } : null;

  const updateAssessment = (field: string, value: number | string) => {
    if (!currentTopic) return;
    setAssessments(prev => ({
      ...prev,
      [currentTopic.id]: {
        ...prev[currentTopic.id] || {
          impactScale: 3,
          impactScope: 3,
          impactIrremediability: 3,
          impactLikelihood: 3,
          financialMagnitude: 3,
          financialLikelihood: 3,
          financialTimeHorizon: 'medium',
          evidence: '',
        },
        [field]: value,
      },
    }));
  };

  const handleNext = () => {
    if (currentStep === 3 || currentStep === 4) {
      if (currentTopicIndex < selectedTopics.length - 1) {
        setCurrentTopicIndex(prev => prev + 1);
      } else {
        setCurrentTopicIndex(0);
        setCurrentStep(prev => prev + 1);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if ((currentStep === 3 || currentStep === 4) && currentTopicIndex > 0) {
      setCurrentTopicIndex(prev => prev - 1);
    } else {
      if (currentStep === 4) setCurrentTopicIndex(selectedTopics.length - 1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinalize = async () => {
    try {
      for (const topic of selectedTopics) {
        const data = assessments[topic.id];
        if (!data) continue;

        const impactScore = calculateImpactScore({
          scale: data.impactScale,
          scope: data.impactScope,
          irremediability: data.impactIrremediability,
          likelihood: data.impactLikelihood,
        });

        const financialScore = calculateFinancialScore({
          magnitude: data.financialMagnitude,
          likelihood: data.financialLikelihood,
          timeHorizon: data.financialTimeHorizon,
        });

        if (user) {
          await saveAssessment({
            userId: user.id,
            topicId: topic.id,
            topicName: topic.name,
            topicCategory: topic.category,
            esrsStandard: topic.esrsStandard,
            impactMateriality: {
              scale: data.impactScale,
              scope: data.impactScope,
              irremediability: data.impactIrremediability,
              likelihood: data.impactLikelihood,
              overallScore: impactScore,
            },
            financialMateriality: {
              magnitude: data.financialMagnitude,
              likelihood: data.financialLikelihood,
              timeHorizon: data.financialTimeHorizon,
              overallScore: financialScore,
            },
            isMaterial: isMaterialTopic(impactScore, financialScore),
            stakeholderIds: [],
            evidence: data.evidence,
          });
        }
      }
      toast.success(`${selectedTopics.length} assessments saved successfully!`);
      setCurrentStep(1);
      setSelectedTopics([]);
      setAssessments({});
      setCurrentTopicIndex(0);
    } catch {
      toast.error('Failed to save assessments');
    }
  };

  const getResults = () => {
    return selectedTopics.map(topic => {
      const data = assessments[topic.id];
      if (!data) return { topic, impactScore: 0, financialScore: 0, isMaterial: false };

      const impactScore = calculateImpactScore({
        scale: data.impactScale,
        scope: data.impactScope,
        irremediability: data.impactIrremediability,
        likelihood: data.impactLikelihood,
      });

      const financialScore = calculateFinancialScore({
        magnitude: data.financialMagnitude,
        likelihood: data.financialLikelihood,
        timeHorizon: data.financialTimeHorizon,
      });

      return {
        topic,
        impactScore,
        financialScore,
        isMaterial: isMaterialTopic(impactScore, financialScore),
      };
    });
  };

  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className={`flex flex-col items-center ${currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    currentStep > step.id ? 'bg-primary border-primary text-primary-foreground' :
                    currentStep === step.id ? 'border-primary' : 'border-muted'
                  }`}>
                    {currentStep > step.id ? <CheckCircle className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                  </div>
                  <span className="text-xs mt-1 hidden md:block">{step.title}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card className="min-h-[400px]">
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>
            {currentStep === 1 && 'Learn about double materiality assessment'}
            {currentStep === 2 && 'Select sustainability topics to assess'}
            {currentStep === 3 && `Assess impact materiality (${currentTopicIndex + 1}/${selectedTopics.length})`}
            {currentStep === 4 && `Assess financial materiality (${currentTopicIndex + 1}/${selectedTopics.length})`}
            {currentStep === 5 && 'Review and finalize your assessment'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Step 1: Introduction */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="prose dark:prose-invert max-w-none">
                <h3>What is Double Materiality?</h3>
                <p>
                  Double materiality is a key concept in the EU's Corporate Sustainability Reporting Directive (CSRD) 
                  and the European Sustainability Reporting Standards (ESRS). It requires companies to assess 
                  sustainability topics from two perspectives:
                </p>
                <div className="grid md:grid-cols-2 gap-4 not-prose">
                  <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
                    <h4 className="font-semibold text-green-800 dark:text-green-200">Impact Materiality</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      How the company's activities affect people and the environment (inside-out perspective)
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200">Financial Materiality</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      How sustainability matters affect the company's financial position (outside-in perspective)
                    </p>
                  </div>
                </div>
                <h3>Assessment Process</h3>
                <ol>
                  <li>Select relevant sustainability topics from the ESRS framework</li>
                  <li>Score each topic for impact materiality (scale, scope, irremediability, likelihood)</li>
                  <li>Score each topic for financial materiality (magnitude, likelihood, time horizon)</li>
                  <li>Review results and identify material topics for disclosure</li>
                </ol>
              </div>
            </div>
          )}

          {/* Step 2: Topic Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Select the sustainability topics relevant to your organization
                </p>
                <Badge>{selectedTopics.length} selected</Badge>
              </div>
              <div className="grid gap-2 max-h-[400px] overflow-y-auto">
                {['environmental', 'social', 'governance'].map(category => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-semibold capitalize sticky top-0 bg-background py-2">{category}</h4>
                    {SUSTAINABILITY_TOPICS.filter(t => t.category === category).map(topic => (
                      <div
                        key={topic.id}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 ${
                          selectedTopics.find(t => t.id === topic.id) ? 'border-primary bg-primary/5' : ''
                        }`}
                        onClick={() => handleTopicToggle(topic)}
                      >
                        <Checkbox 
                          checked={!!selectedTopics.find(t => t.id === topic.id)}
                          onCheckedChange={() => handleTopicToggle(topic)}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{topic.name}</span>
                            <Badge variant="outline">{topic.esrsStandard}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{topic.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Impact Assessment */}
          {currentStep === 3 && currentTopic && currentAssessment && (
            <div className="space-y-6">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold">{currentTopic.name}</h3>
                <p className="text-sm text-muted-foreground">{currentTopic.description}</p>
              </div>
              
              <div className="space-y-4">
                {[
                  { key: 'impactScale', label: 'Scale of Impact', desc: 'How severe is the impact?' },
                  { key: 'impactScope', label: 'Scope of Impact', desc: 'How widespread is the impact?' },
                  { key: 'impactIrremediability', label: 'Irremediability', desc: 'How difficult is it to remediate?' },
                  { key: 'impactLikelihood', label: 'Likelihood', desc: 'How probable is this impact?' },
                ].map(item => (
                  <div key={item.key} className="space-y-2">
                    <div className="flex justify-between">
                      <div>
                        <Label>{item.label}</Label>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <span className="font-medium">{currentAssessment[item.key as keyof typeof currentAssessment]}/5</span>
                    </div>
                    <Slider
                      value={[currentAssessment[item.key as keyof typeof currentAssessment] as number]}
                      onValueChange={([v]) => updateAssessment(item.key, v)}
                      min={1}
                      max={5}
                      step={1}
                    />
                  </div>
                ))}
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium">Impact Score:</span>
                  <span className="font-bold text-xl">
                    {calculateImpactScore({
                      scale: currentAssessment.impactScale,
                      scope: currentAssessment.impactScope,
                      irremediability: currentAssessment.impactIrremediability,
                      likelihood: currentAssessment.impactLikelihood,
                    }).toFixed(0)}/100
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Financial Assessment */}
          {currentStep === 4 && currentTopic && currentAssessment && (
            <div className="space-y-6">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-semibold">{currentTopic.name}</h3>
                <p className="text-sm text-muted-foreground">{currentTopic.description}</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div>
                      <Label>Magnitude of Financial Impact</Label>
                      <p className="text-xs text-muted-foreground">Potential financial effect size</p>
                    </div>
                    <span className="font-medium">{currentAssessment.financialMagnitude}/5</span>
                  </div>
                  <Slider
                    value={[currentAssessment.financialMagnitude]}
                    onValueChange={([v]) => updateAssessment('financialMagnitude', v)}
                    min={1}
                    max={5}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div>
                      <Label>Likelihood</Label>
                      <p className="text-xs text-muted-foreground">Probability of financial impact</p>
                    </div>
                    <span className="font-medium">{currentAssessment.financialLikelihood}/5</span>
                  </div>
                  <Slider
                    value={[currentAssessment.financialLikelihood]}
                    onValueChange={([v]) => updateAssessment('financialLikelihood', v)}
                    min={1}
                    max={5}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Time Horizon</Label>
                  <Select
                    value={currentAssessment.financialTimeHorizon}
                    onValueChange={(v) => updateAssessment('financialTimeHorizon', v)}
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

                <div className="space-y-2">
                  <Label>Evidence / Notes</Label>
                  <Textarea
                    value={currentAssessment.evidence}
                    onChange={(e) => updateAssessment('evidence', e.target.value)}
                    placeholder="Document your rationale..."
                    rows={2}
                  />
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium">Financial Score:</span>
                  <span className="font-bold text-xl">
                    {calculateFinancialScore({
                      magnitude: currentAssessment.financialMagnitude,
                      likelihood: currentAssessment.financialLikelihood,
                      timeHorizon: currentAssessment.financialTimeHorizon,
                    }).toFixed(0)}/100
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Topics Assessed</CardDescription>
                    <CardTitle className="text-2xl">{selectedTopics.length}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Material Topics</CardDescription>
                    <CardTitle className="text-2xl text-green-600">
                      {getResults().filter(r => r.isMaterial).length}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Not Material</CardDescription>
                    <CardTitle className="text-2xl text-muted-foreground">
                      {getResults().filter(r => !r.isMaterial).length}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {getResults().map(result => (
                  <div key={result.topic.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{result.topic.esrsStandard}</Badge>
                      <span className="font-medium">{result.topic.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">I: {result.impactScore.toFixed(0)}</span>
                      <span className="text-sm">F: {result.financialScore.toFixed(0)}</span>
                      <Badge variant={result.isMaterial ? 'default' : 'secondary'}>
                        {result.isMaterial ? 'Material' : 'Not Material'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          {currentStep === 5 && (
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          )}
          {currentStep < 5 ? (
            <Button
              onClick={handleNext}
              disabled={currentStep === 2 && selectedTopics.length === 0}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleFinalize}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalize Assessment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssessmentWizard;
