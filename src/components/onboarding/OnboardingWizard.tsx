import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Target,
  FileText,
  TrendingDown,
  CheckCircle2,
  ArrowRight,
  Upload,
  MessageSquare,
  Sparkles,
  ChevronRight,
  X,
  Clock,
  Database,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { IndustrySelector } from './IndustrySelector';
import { SubIndustrySelector } from './SubIndustrySelector';
import { updateOrganizationIndustry } from '@/services/industryService';
import { ContextualHelp } from '@/components/ui/contextual-help';
import { BRAND_NAME } from '@/lib/constants';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  // New flow: Step 0 = Quick Start, Step 1 = Industry (optional), Step 2 = Simple feedback
  const [step, setStep] = useState(0);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<string | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<{
    recommendedPath: string;
    confidence: number;
    reasoning: string;
    keywords: string[];
  } | null>(null);
  const [quickFeedback, setQuickFeedback] = useState<'positive' | 'negative' | null>(null);
  const [analyticsId, setAnalyticsId] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const navigate = useNavigate();

  const challenges = [
    {
      id: 'compliance',
      icon: FileText,
      title: 'Compliance Reporting',
      description: 'CDP, TCFD, CSRD deadlines and audit preparation',
      outcome: 'See your deadline tracker',
      route: '/analytics'
    },
    {
      id: 'netzero',
      icon: Target,
      title: 'Net Zero Tracking',
      description: 'Progress monitoring and goal management',
      outcome: 'See your progress dashboard',
      route: '/goals'
    },
    {
      id: 'data',
      icon: TrendingDown,
      title: 'Data Consolidation',
      description: 'Multi-facility emissions tracking and validation',
      outcome: 'See your multi-facility view',
      route: '/data-entry'
    }
  ];

  // Track analytics when component mounts
  useEffect(() => {
    const trackOnboardingStart = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      
      if (orgMember) {
        setOrganizationId(orgMember.organization_id);
      }

      const { data, error } = await supabase
        .from('onboarding_analytics')
        .insert({
          user_id: user.id,
          step_reached: 0,
        })
        .select()
        .single();

      if (!error && data) {
        setAnalyticsId(data.id);
      }
    };

    trackOnboardingStart();
  }, []);

  const updateAnalytics = async (updates: Record<string, unknown>) => {
    if (!analyticsId) return;
    await supabase
      .from('onboarding_analytics')
      .update(updates)
      .eq('id', analyticsId);
  };

  const handleQuickStartSelection = async (action: 'import' | 'sample' | 'manual') => {
    await updateAnalytics({ step_reached: 1 });
    
    if (action === 'sample') {
      // Fast path - load sample data immediately
      localStorage.setItem('show_sample_data', 'true');
      onComplete();
      navigate('/');
      toast.success(`Loaded sample data! Explore the dashboard to see what ${BRAND_NAME} can do.`);
    } else if (action === 'import') {
      onComplete();
      navigate('/data-entry?action=import');
    } else {
      onComplete();
      navigate('/data-entry');
    }
  };

  const handleChallengeSelect = async (challengeId: string) => {
    setSelectedChallenge(challengeId);
    await updateAnalytics({ 
      challenge_selected: challengeId,
      step_reached: 1 
    });
    
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge) {
      // Navigate directly to the relevant feature
      onComplete();
      navigate(challenge.route);
      toast.success(`Taking you to ${challenge.title}!`);
    }
  };

  const handleIndustrySelect = async (industryId: string) => {
    setSelectedIndustry(industryId);
    setSelectedSubIndustry(null);
  };

  const handleIndustryContinue = async () => {
    if (selectedIndustry && organizationId) {
      try {
        await updateOrganizationIndustry(organizationId, selectedIndustry, selectedSubIndustry);
        toast.success('Industry preferences saved!');
      } catch (error) {
        console.error('Error saving industry:', error);
      }
    }
    
    await updateAnalytics({ step_reached: 2 });
    setStep(2);
  };

  const handleSkipIndustry = async () => {
    await updateAnalytics({ step_reached: 2 });
    setStep(2);
  };

  const handleFeedbackSubmit = async () => {
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    if (quickFeedback) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('onboarding_feedback').insert({
          user_id: user.id,
          rating: quickFeedback === 'positive' ? 5 : 2,
          would_recommend: quickFeedback === 'positive',
        });
      }
    }

    await updateAnalytics({ 
      completed: true,
      completed_at: new Date().toISOString(),
      time_spent_seconds: timeSpent
    });

    onComplete();
    navigate('/');
  };

  const handleSkipOnboarding = async () => {
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    await updateAnalytics({ 
      completed: false,
      time_spent_seconds: timeSpent
    });
    onComplete();
    navigate('/');
  };

  // 3 steps now: Quick Start → Industry (optional) → Quick Feedback
  const totalSteps = 3;
  const progress = ((step + 1) / totalSteps) * 100;
  
  const stepLabels = ['Get Started', 'Personalize', 'Done'];

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-3xl relative"
      >
        {/* Close Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-2 -right-2 z-10 bg-background rounded-full shadow-md hover:bg-muted"
          onClick={handleSkipOnboarding}
          aria-label="Close onboarding"
        >
          <X className="h-4 w-4" />
        </Button>

        <Card className="p-8">
          <div className="mb-8">
            {/* Step indicators with labels */}
            <div className="flex justify-between mb-2">
              {stepLabels.map((label, idx) => (
                <div 
                  key={idx} 
                  className={`text-xs font-medium ${
                    idx <= step ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-3 w-3" />
                ~{step === 0 ? '30 seconds' : step === 1 ? '1 minute' : '10 seconds'} remaining
              </p>
              <Button variant="link" size="sm" onClick={handleSkipOnboarding} className="text-muted-foreground h-auto p-0">
                Skip for now
              </Button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Step 0: Quick Start Options - Show value FIRST */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-3xl font-bold mb-2">Welcome to {BRAND_NAME}!</h2>
                <p className="text-lg text-muted-foreground mb-8">
                  See the platform in action in seconds. Choose how you'd like to start:
                </p>

                <div className="space-y-4">
                  {/* Sample Data - PRIMARY option with Recommended badge */}
                  <Card 
                    className="p-6 cursor-pointer border-primary bg-primary/5 hover:bg-primary/10 transition-all" 
                    onClick={() => handleQuickStartSelection('sample')}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/20 rounded-lg">
                        <Database className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-semibold">Explore with Sample Data</h3>
                          <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
                        </div>
                        <p className="text-muted-foreground mb-2">
                          Instantly see dashboards, reports, and analytics with realistic manufacturing data
                        </p>
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <Clock className="h-4 w-4" />
                          ~5 seconds
                        </div>
                      </div>
                      <Button className="shrink-0">
                        Start Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </Card>

                  {/* Import Data */}
                  <Card 
                    className="p-6 cursor-pointer hover:border-primary transition-all" 
                    onClick={() => handleQuickStartSelection('import')}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-1">Import Your Data</h3>
                        <p className="text-muted-foreground mb-2">
                          Upload a CSV file with your existing emissions data
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          ~2 minutes
                        </div>
                      </div>
                      <Button variant="outline" className="shrink-0">
                        Import
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </Card>

                  {/* Manual Entry */}
                  <Card 
                    className="p-6 cursor-pointer hover:border-primary transition-all" 
                    onClick={() => handleQuickStartSelection('manual')}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-muted rounded-lg">
                        <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-1">Manual Entry</h3>
                        <p className="text-muted-foreground mb-2">
                          Add your first emissions entry with our guided wizard
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          ~10 minutes
                        </div>
                      </div>
                      <Button variant="outline" className="shrink-0">
                        Start
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground mb-4">
                    Or jump to a specific feature:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {challenges.map((challenge) => (
                      <Button
                        key={challenge.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleChallengeSelect(challenge.id)}
                        className="gap-2"
                      >
                        <challenge.icon className="h-4 w-4" />
                        {challenge.title}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    Personalize my experience first
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 1: Industry Selection (Optional) */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-3xl font-bold">Personalize Your Experience</h2>
                  <ContextualHelp 
                    content="Selecting your industry helps us show relevant emission factors, report templates, and benchmarks specific to your sector." 
                    size="md"
                  />
                </div>
                <p className="text-lg text-muted-foreground mb-6">
                  Select your industry for customized emission factors and report templates.
                </p>

                <IndustrySelector
                  selectedIndustry={selectedIndustry}
                  onSelect={handleIndustrySelect}
                />

                {selectedIndustry && (
                  <div className="mt-6">
                    <SubIndustrySelector
                      industry={selectedIndustry}
                      selectedSubIndustry={selectedSubIndustry}
                      onSelect={setSelectedSubIndustry}
                    />
                  </div>
                )}

                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(0)}>
                    Back
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={handleSkipIndustry}>
                      Skip for now
                    </Button>
                    <Button 
                      onClick={handleIndustryContinue}
                      disabled={!selectedIndustry}
                    >
                      Continue
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Simple Feedback - One question only */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="mb-8">
                  <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                    <Sparkles className="h-12 w-12 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">You're all set!</h2>
                  <p className="text-lg text-muted-foreground">
                    Quick question before you explore the dashboard:
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  <p className="font-medium mb-4">Was this setup process helpful?</p>
                  <div className="flex justify-center gap-4 mb-8">
                    <Button
                      size="lg"
                      variant={quickFeedback === 'positive' ? 'default' : 'outline'}
                      onClick={() => setQuickFeedback('positive')}
                      className="gap-2 px-8"
                    >
                      <ThumbsUp className="h-5 w-5" />
                      Yes
                    </Button>
                    <Button
                      size="lg"
                      variant={quickFeedback === 'negative' ? 'default' : 'outline'}
                      onClick={() => setQuickFeedback('negative')}
                      className="gap-2 px-8"
                    >
                      <ThumbsDown className="h-5 w-5" />
                      Could be better
                    </Button>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full" 
                    onClick={handleFeedbackSubmit}
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
