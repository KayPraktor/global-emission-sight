import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play,
  ArrowLeft
} from 'lucide-react';
import { productTourSteps } from '@/data/productTourData';
import { BrowserFrame } from './BrowserFrame';
import { TourStepPreview } from './TourStepPreview';

interface InteractiveProductTourProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
};

export function InteractiveProductTour({ open, onOpenChange }: InteractiveProductTourProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = productTourSteps.length;

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, totalSteps]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowRight') handlePrevious();
    if (e.key === 'ArrowLeft') handleNext();
    if (e.key === 'Escape') onOpenChange(false);
  }, [open, handleNext, handlePrevious, onOpenChange]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
    }
  }, [open]);

  const currentStepData = productTourSteps[currentStep];
  const StepIcon = currentStepData.icon;

  const handleStartTrial = () => {
    onOpenChange(false);
    navigate('/auth');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Play className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">تور محصول</h3>
              <p className="text-xs text-muted-foreground">
                مرحله {toPersianNumber(currentStep + 1)} از {toPersianNumber(totalSteps)}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-5 gap-0">
          {/* Step Info */}
          <div className="md:col-span-2 p-6 bg-background border-l border-border">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <StepIcon className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary">{currentStepData.highlight}</Badge>
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold mb-1">{currentStepData.title}</h2>
                  <p className="text-sm text-muted-foreground">{currentStepData.titleEn}</p>
                </div>
                
                <p className="text-foreground/80 leading-relaxed">
                  {currentStepData.description}
                </p>

                {/* Step Navigation Dots */}
                <div className="flex items-center gap-2 pt-4">
                  {productTourSteps.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentStep(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentStep 
                          ? 'bg-primary w-6' 
                          : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Preview Area */}
          <div className="md:col-span-3 p-6 bg-muted/20">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <BrowserFrame url={`carbontrack.ir/${currentStepData.id}`}>
                  <TourStepPreview stepId={currentStepData.id} />
                </BrowserFrame>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronRight className="h-4 w-4 ml-1" />
              قبلی
            </Button>
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentStep === totalSteps - 1}
            >
              بعدی
              <ChevronLeft className="h-4 w-4 mr-1" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              رد کردن
            </Button>
            {currentStep === totalSteps - 1 ? (
              <Button onClick={handleStartTrial}>
                شروع دوره آزمایشی رایگان
                <ArrowLeft className="h-4 w-4 mr-2" />
              </Button>
            ) : (
              <Button variant="secondary" onClick={handleStartTrial}>
                ثبت‌نام
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
