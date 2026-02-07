import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Database, 
  Upload, 
  FileSpreadsheet, 
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { BRAND_NAME } from '@/lib/constants';

interface FirstTimeWelcomeProps {
  onComplete?: () => void;
}

const FirstTimeWelcome: React.FC<FirstTimeWelcomeProps> = ({ onComplete }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  useEffect(() => {
    // Check if user has seen the welcome before
    const hasSeenWelcome = localStorage.getItem('hasSeenFirstTimeWelcome');
    if (!hasSeenWelcome && user) {
      setIsVisible(true);
    }
  }, [user]);

  const handleDismiss = () => {
    localStorage.setItem('hasSeenFirstTimeWelcome', 'true');
    setIsVisible(false);
    onComplete?.();
  };

  const handleLoadDemoData = async () => {
    if (!user) {
      toast.error('You must be logged in to load demo data');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('seed-sample-data');

      if (error) throw error;

      if (data?.success) {
        setSeedSuccess(true);
        toast.success('Demo data loaded successfully!');
        setTimeout(() => {
          handleDismiss();
          window.location.reload();
        }, 1500);
      } else {
        toast.error(data?.message || 'Failed to load demo data');
      }
    } catch (error) {
      console.error('Error loading demo data:', error);
      toast.error('Failed to load demo data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = () => {
    handleDismiss();
    navigate('/data-entry?action=import');
  };

  const handleManualEntry = () => {
    handleDismiss();
    navigate('/data-entry?action=manual');
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <Card className="w-full max-w-2xl shadow-2xl border-primary/20">
            <CardHeader className="relative text-center pb-2">
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl">Welcome to {BRAND_NAME}!</CardTitle>
              <CardDescription className="text-base">
                Let's get you started with your carbon emissions tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {seedSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-8 text-center"
                >
                  <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold text-green-600">Demo Data Loaded!</h3>
                  <p className="text-muted-foreground mt-2">Refreshing your dashboard...</p>
                </motion.div>
              ) : (
                <div className="grid gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLoadDemoData}
                    disabled={isLoading}
                    className="flex items-start gap-4 p-4 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-left disabled:opacity-50"
                  >
                    <div className="p-2 rounded-lg bg-primary/10">
                      {isLoading ? (
                        <Loader2 className="h-6 w-6 text-primary animate-spin" />
                      ) : (
                        <Database className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold flex items-center gap-2">
                        Load Demo Data
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          Recommended
                        </span>
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Instantly populate your dashboard with 12 months of realistic sample data
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-primary mt-2" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleImportData}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="p-2 rounded-lg bg-muted">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Import Your Data</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload a CSV file with your existing emissions data
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground mt-2" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleManualEntry}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="p-2 rounded-lg bg-muted">
                      <FileSpreadsheet className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">Start Manual Entry</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enter your emissions data manually with our guided forms
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground mt-2" />
                  </motion.button>
                </div>
              )}

              <p className="text-xs text-center text-muted-foreground pt-2">
                You can always access these options later from the Data Entry page
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FirstTimeWelcome;
