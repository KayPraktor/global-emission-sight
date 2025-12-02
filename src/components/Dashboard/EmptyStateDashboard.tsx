import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Database, 
  BookOpen, 
  ArrowRight,
  Sparkles,
  BarChart3,
  Target,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';

interface EmptyStateDashboardProps {
  onLoadSampleData?: () => void;
}

export function EmptyStateDashboard({ onLoadSampleData }: EmptyStateDashboardProps) {
  const navigate = useNavigate();

  const primaryActions = [
    {
      icon: Upload,
      title: 'Import Your Data',
      description: 'Upload existing emissions data from CSV or Excel files',
      action: () => navigate('/data-entry?action=import'),
      variant: 'default' as const,
      highlight: true,
    },
    {
      icon: Database,
      title: 'Try Sample Data',
      description: 'Explore the platform with pre-loaded demo data',
      action: onLoadSampleData || (() => {
        localStorage.setItem('useSampleData', 'true');
        window.location.reload();
      }),
      variant: 'outline' as const,
      highlight: false,
    },
    {
      icon: BookOpen,
      title: 'Learn How It Works',
      description: 'Quick 2-minute tour of key features',
      action: () => navigate('/data-entry'),
      variant: 'outline' as const,
      highlight: false,
    },
  ];

  const featureHighlights = [
    {
      icon: BarChart3,
      title: 'Track Emissions',
      description: 'Monitor Scope 1, 2 & 3 emissions across all facilities',
    },
    {
      icon: Target,
      title: 'Set Goals',
      description: 'Define reduction targets aligned with SBTi',
    },
    {
      icon: FileSpreadsheet,
      title: 'Generate Reports',
      description: 'Automated CDP, GRI, and TCFD reporting',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-8"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Welcome to BARYON
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Your carbon management command center. Let's get started by adding your first emissions data.
        </p>
      </motion.div>

      {/* Primary Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {primaryActions.map((action, index) => (
          <GlassmorphismCard
            key={action.title}
            variant={action.highlight ? 'colored' : 'light'}
            className={`p-6 cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
              action.highlight ? 'ring-2 ring-primary/20' : ''
            }`}
            onClick={action.action}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
              className="flex flex-col h-full"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
                action.highlight 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <action.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
              <p className="text-muted-foreground text-sm flex-1">{action.description}</p>
              <div className="flex items-center mt-4 text-sm font-medium text-primary">
                Get Started
                <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </motion.div>
          </GlassmorphismCard>
        ))}
      </motion.div>

      {/* Feature Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold mb-4 text-center">What You Can Do</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featureHighlights.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
              className="flex items-start gap-3 p-4 rounded-lg bg-muted/50"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-background flex items-center justify-center">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">{feature.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Help Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center text-sm text-muted-foreground"
      >
        Need help? Check out our{' '}
        <Button variant="link" className="p-0 h-auto text-sm" onClick={() => navigate('/data-entry')}>
          getting started guide
        </Button>
        {' '}or contact support.
      </motion.p>
    </div>
  );
}

export default EmptyStateDashboard;
