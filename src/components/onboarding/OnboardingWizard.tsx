import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Target,
  FileText,
  TrendingDown,
  CheckCircle2,
  ArrowRight,
  Upload
} from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export default function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
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
    }
  ];

  const handleChallengeSelect = (challengeId: string) => {
    setSelectedChallenge(challengeId);
    setStep(2);
  };

  const handleComplete = () => {
    const challenge = challenges.find(c => c.id === selectedChallenge);
    if (challenge) {
      onComplete();
      navigate(challenge.route);
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

                <div className="grid md:grid-cols-3 gap-4">
                  {challenges.map((challenge) => (
                    <motion.button
                      key={challenge.id}
                      onClick={() => handleChallengeSelect(challenge.id)}
                      className="text-left"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card className={`p-6 h-full card-hover ${
                        selectedChallenge === challenge.id 
                          ? 'border-primary bg-primary/5' 
                          : ''
                      }`}>
                        <challenge.icon className="h-10 w-10 mb-4 text-primary" />
                        <h3 className="text-lg font-semibold mb-2">
                          {challenge.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {challenge.description}
                        </p>
                      </Card>
                    </motion.button>
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
                <h2 className="text-3xl font-bold mb-4">
                  Quick Start Options
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Choose how you'd like to begin:
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
