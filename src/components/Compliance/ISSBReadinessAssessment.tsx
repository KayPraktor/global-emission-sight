import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Building2,
  Shield,
  Target,
  BarChart3
} from 'lucide-react';
import { ISSB_S2_DISCLOSURES } from '@/types/esrs-compliance';

interface AssessmentQuestion {
  id: string;
  question: string;
  category: string;
  answered: boolean;
  answer?: 'yes' | 'partial' | 'no';
}

const ISSBReadinessAssessment: React.FC = () => {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([
    // Governance
    { id: 'gov-1', question: 'Does the board have oversight of climate-related risks and opportunities?', category: 'Governance', answered: false },
    { id: 'gov-2', question: 'Is there a designated committee or individual responsible for climate matters?', category: 'Governance', answered: false },
    { id: 'gov-3', question: 'Are climate-related matters regularly reviewed at board meetings?', category: 'Governance', answered: false },
    { id: 'gov-4', question: 'Does management have defined roles for assessing and managing climate risks?', category: 'Governance', answered: false },
    
    // Strategy
    { id: 'str-1', question: 'Have you identified climate-related risks that could affect your business?', category: 'Strategy', answered: false },
    { id: 'str-2', question: 'Have you identified climate-related opportunities?', category: 'Strategy', answered: false },
    { id: 'str-3', question: 'Do you understand how climate risks could affect your business model?', category: 'Strategy', answered: false },
    { id: 'str-4', question: 'Have you conducted scenario analysis (e.g., 1.5°C, 2°C pathways)?', category: 'Strategy', answered: false },
    { id: 'str-5', question: 'Do you have a climate transition plan?', category: 'Strategy', answered: false },
    
    // Risk Management
    { id: 'rm-1', question: 'Do you have processes to identify climate-related risks?', category: 'Risk Management', answered: false },
    { id: 'rm-2', question: 'Are climate risks assessed for likelihood and impact?', category: 'Risk Management', answered: false },
    { id: 'rm-3', question: 'Are climate risks integrated into overall risk management?', category: 'Risk Management', answered: false },
    
    // Metrics & Targets
    { id: 'mt-1', question: 'Do you measure Scope 1 GHG emissions?', category: 'Metrics & Targets', answered: false },
    { id: 'mt-2', question: 'Do you measure Scope 2 GHG emissions?', category: 'Metrics & Targets', answered: false },
    { id: 'mt-3', question: 'Do you measure material Scope 3 GHG emissions?', category: 'Metrics & Targets', answered: false },
    { id: 'mt-4', question: 'Have you set emissions reduction targets?', category: 'Metrics & Targets', answered: false },
    { id: 'mt-5', question: 'Are your targets science-based?', category: 'Metrics & Targets', answered: false },
  ]);

  const categories = ['Governance', 'Strategy', 'Risk Management', 'Metrics & Targets'];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Governance':
        return <Building2 className="h-5 w-5" />;
      case 'Strategy':
        return <Target className="h-5 w-5" />;
      case 'Risk Management':
        return <Shield className="h-5 w-5" />;
      case 'Metrics & Targets':
        return <BarChart3 className="h-5 w-5" />;
      default:
        return <Circle className="h-5 w-5" />;
    }
  };

  const handleAnswer = (questionId: string, answer: 'yes' | 'partial' | 'no') => {
    setQuestions(prev => prev.map(q => 
      q.id === questionId ? { ...q, answered: true, answer } : q
    ));
  };

  const calculateCategoryScore = (category: string) => {
    const categoryQuestions = questions.filter(q => q.category === category);
    const answered = categoryQuestions.filter(q => q.answered);
    if (answered.length === 0) return 0;
    
    const score = answered.reduce((sum, q) => {
      if (q.answer === 'yes') return sum + 100;
      if (q.answer === 'partial') return sum + 50;
      return sum;
    }, 0);
    
    return Math.round(score / categoryQuestions.length);
  };

  const calculateOverallScore = () => {
    const answeredQuestions = questions.filter(q => q.answered);
    if (answeredQuestions.length === 0) return 0;
    
    const score = answeredQuestions.reduce((sum, q) => {
      if (q.answer === 'yes') return sum + 100;
      if (q.answer === 'partial') return sum + 50;
      return sum;
    }, 0);
    
    return Math.round(score / questions.length);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getReadinessLevel = (score: number) => {
    if (score >= 80) return { level: 'Advanced', description: 'Well-positioned for ISSB compliance' };
    if (score >= 60) return { level: 'Intermediate', description: 'Good foundation, some gaps to address' };
    if (score >= 40) return { level: 'Developing', description: 'Basic elements in place, significant work needed' };
    return { level: 'Beginning', description: 'Early stages, substantial development required' };
  };

  const overallScore = calculateOverallScore();
  const readinessLevel = getReadinessLevel(overallScore);
  const answeredCount = questions.filter(q => q.answered).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">ISSB S2 Readiness Assessment</h1>
        <p className="text-muted-foreground">
          Evaluate your organization's readiness for IFRS S2 Climate-related Disclosures
        </p>
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Progress</CardTitle>
          <CardDescription>
            {answeredCount} of {questions.length} questions answered
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-muted-foreground mb-2">Overall Readiness</div>
              <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </div>
              <Progress value={overallScore} className="h-2 mt-2" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Readiness Level</div>
              <div className="text-2xl font-semibold">{readinessLevel.level}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {readinessLevel.description}
              </p>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-2">Category Scores</div>
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category} className="flex items-center justify-between text-sm">
                    <span>{category}</span>
                    <Badge variant={calculateCategoryScore(category) >= 60 ? 'default' : 'outline'}>
                      {calculateCategoryScore(category)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ISSB S2 Requirements Reference */}
      <Card>
        <CardHeader>
          <CardTitle>ISSB S2 Disclosure Requirements</CardTitle>
          <CardDescription>
            The four pillars of climate-related disclosures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map(category => {
              const score = calculateCategoryScore(category);
              const categoryQuestions = questions.filter(q => q.category === category);
              const answeredInCategory = categoryQuestions.filter(q => q.answered).length;
              
              return (
                <div key={category} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    {getCategoryIcon(category)}
                    <h3 className="font-medium">{category}</h3>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                    {score}%
                  </div>
                  <Progress value={score} className="h-1.5 mt-2 mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {answeredInCategory}/{categoryQuestions.length} assessed
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Assessment Questions */}
      <Card>
        <CardHeader>
          <CardTitle>Assessment Questions</CardTitle>
          <CardDescription>
            Answer each question to assess your ISSB readiness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {categories.map(category => (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(category)}
                    <span>{category}</span>
                    <Badge variant="outline" className="ml-2">
                      {calculateCategoryScore(category)}%
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-4">
                    {questions.filter(q => q.category === category).map(question => (
                      <div 
                        key={question.id}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            {question.answered ? (
                              question.answer === 'yes' ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                              ) : question.answer === 'partial' ? (
                                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                              ) : (
                                <Circle className="h-5 w-5 text-red-500 mt-0.5" />
                              )
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground mt-0.5" />
                            )}
                            <span className="text-sm">{question.question}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={question.answer === 'yes' ? 'default' : 'outline'}
                              onClick={() => handleAnswer(question.id, 'yes')}
                            >
                              Yes
                            </Button>
                            <Button
                              size="sm"
                              variant={question.answer === 'partial' ? 'secondary' : 'outline'}
                              onClick={() => handleAnswer(question.id, 'partial')}
                            >
                              Partial
                            </Button>
                            <Button
                              size="sm"
                              variant={question.answer === 'no' ? 'destructive' : 'outline'}
                              onClick={() => handleAnswer(question.id, 'no')}
                            >
                              No
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default ISSBReadinessAssessment;
