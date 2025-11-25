import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
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
  ChevronRight
} from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<{
    recommendedPath: string;
    confidence: number;
    reasoning: string;
    keywords: string[];
  } | null>(null);
  const navigate = useNavigate();

  const challenges = [
    {
      id: 'compliance',
      icon: FileText,
      title: 'Compliance Reporting',
      description: 'CDP, TCFD, CSRD deadlines and audit preparation',
      route: '/analytics'
    },
    {
      id: 'netzero',
      icon: Target,
      title: 'Net Zero Tracking',
      description: 'Progress monitoring and goal management',
      route: '/goals'
    },
    {
      id: 'data',
      icon: TrendingDown,
      title: 'Data Consolidation',
      description: 'Multi-facility emissions tracking and validation',
      route: '/data-entry'
    },
    {
      id: 'custom',
      icon: MessageSquare,
      title: 'Something Else?',
      description: 'Tell us about your specific needs',
      route: ''
    }
  ];

  const handleChallengeSelect = (challengeId: string) => {
    if (challengeId === 'custom') {
      setSelectedChallenge(challengeId);
      return;
    }
    setSelectedChallenge(challengeId);
    setAiRecommendation(null);
    setStep(2);
  };

  const handleCustomInputSubmit = async () => {
    if (!customInput.trim()) {
      toast.error('Please describe your needs');
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-onboarding-input', {
        body: { userInput: customInput }
      });

      if (error) {
        console.error('Analysis error:', error);
        toast.error('Failed to analyze your input. Please try selecting a predefined option.');
        setSelectedChallenge(null);
        return;
      }

      setAiRecommendation(data);
      setSelectedChallenge(data.recommendedPath === 'net-zero' ? 'netzero' : data.recommendedPath);
      setStep(2);
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze your input. Please try selecting a predefined option.');
      setSelectedChallenge(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRecommendedPathLabel = (path: string) => {
    switch (path) {
      case 'compliance': return 'Compliance Reporting';
      case 'net-zero': return 'Net Zero Tracking';
      case 'data': return 'Data Consolidation';
      default: return path;
    }
  };

  const handleComplete = () => {
    const challenge = challenges.find(c => c.id === selectedChallenge);
    if (challenge && challenge.route) {
      onComplete();
      navigate(challenge.route);
    } else {
      onComplete();
      navigate('/');
    }
  };

  const progress = (step / 2) * 100;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-3xl"
      >
        <Card className="p-8">
          <div className="mb-8">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">Step {step} of 2</p>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-3xl font-bold mb-4">
                  Welcome to CarbonTrack!
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Let's get you started. What's your biggest challenge right now?
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  {challenges.map((challenge) => (
                    <motion.div
                      key={challenge.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`p-6 cursor-pointer transition-all h-full ${
                          selectedChallenge === challenge.id 
                            ? 'border-primary bg-primary/5' 
                            : 'hover:border-primary'
                        }`}
                        onClick={() => handleChallengeSelect(challenge.id)}
                      >
                        <challenge.icon className="h-10 w-10 mb-4 text-primary" />
                        <h3 className="text-lg font-semibold mb-2">
                          {challenge.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {challenge.description}
                        </p>
                        
                        {challenge.id === 'custom' && selectedChallenge === 'custom' && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Textarea
                              placeholder="Describe your biggest carbon management challenge in your own words... (e.g., 'We have 50 facilities across 12 countries and need to prepare for CSRD by 2025')"
                              value={customInput}
                              onChange={(e) => setCustomInput(e.target.value)}
                              className="min-h-[120px] mb-3"
                            />
                            <Button
                              onClick={handleCustomInputSubmit}
                              disabled={isAnalyzing || !customInput.trim()}
                              className="w-full"
                            >
                              {isAnalyzing ? (
                                <>
                                  <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                                  Analyzing...
                                </>
                              ) : (
                                <>
                                  Analyze My Needs
                                  <ChevronRight className="ml-2 h-4 w-4" />
                                </>
                              )}
                            </Button>
                          </motion.div>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && selectedChallenge && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {aiRecommendation && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-6 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          AI Recommendation: {getRecommendedPathLabel(aiRecommendation.recommendedPath)}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {aiRecommendation.reasoning}
                        </p>
                        {aiRecommendation.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {aiRecommendation.keywords.map((keyword, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-primary/20 text-primary px-2 py-1 rounded"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                <h2 className="text-3xl font-bold mb-4">
                  Quick Start Options
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  {aiRecommendation 
                    ? 'Here are your personalized options based on your needs:'
                    : 'Choose how you\'d like to begin:'}
                </p>

                <div className="space-y-4">
                  <Card className="p-6 card-hover cursor-pointer" onClick={handleComplete}>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <Upload className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">
                          Import Existing Data
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Upload your CSV files and we'll validate and import your emissions data automatically
                        </p>
                        <Button>
                          Start Import
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 card-hover cursor-pointer" onClick={handleComplete}>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-secondary/10 rounded-lg">
                        <Target className="h-6 w-6 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">
                          Explore with Sample Data
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          See the platform in action with pre-loaded sample data from a manufacturing company
                        </p>
                        <Button variant="outline">
                          View Sample Dashboard
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6 card-hover cursor-pointer" onClick={handleComplete}>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-accent/10 rounded-lg">
                        <CheckCircle2 className="h-6 w-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">
                          Manual Entry
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Add your first emissions entry manually with our guided wizard
                        </p>
                        <Button variant="outline">
                          Add Entry
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="mt-8 flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button variant="ghost" onClick={handleComplete}>
                    Skip for now
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
