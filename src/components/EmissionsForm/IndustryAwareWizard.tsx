import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle, Factory, Sparkles } from "lucide-react";
import { WizardStep1 } from './steps/WizardStep1';
import { WizardStep5 } from './steps/WizardStep5';
import { WizardStep6 } from './steps/WizardStep6';
import { IndustryWorkflowStep } from './industry/IndustryWorkflowStep';
import { IndustryAwareCalculations } from './industry/IndustryAwareCalculations';
import { getIndustryWorkflow, IndustryWorkflow } from '@/data/industryWorkflows';
import { supabase } from '@/integrations/supabase/client';
import { EmissionsFormData } from './EmissionsWizard';

const initialFormData: EmissionsFormData = {
  organizationName: '',
  facilityId: undefined,
  facilityName: '',
  facilityType: '',
  facilityCountry: '',
  facilityIndustry: '',
  address: '',
  reportingPeriodStart: '',
  reportingPeriodEnd: '',
  operationalBoundaries: '',
  consumptionData: [],
  operationalHours: 0,
  productionVolume: 0,
  equipmentInfo: [],
  fuelSpecifications: '',
  processDetails: '',
  emissionFactors: [],
  calculationMethodology: '',
  uncertaintyRange: 0,
  confidenceLevel: '',
  dataSources: [],
  supportingDocuments: [],
  measurementType: '',
  reviewComments: '',
  approvalRequired: false,
};

interface IndustryStepData {
  [stepId: string]: Record<string, string | number>;
}

export const IndustryAwareWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EmissionsFormData>(initialFormData);
  const [industryStepData, setIndustryStepData] = useState<IndustryStepData>({});
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isDraft, setIsDraft] = useState(true);
  const [workflow, setWorkflow] = useState<IndustryWorkflow | null>(null);
  const [organizationIndustry, setOrganizationIndustry] = useState<string | null>(null);
  const [organizationSubIndustry, setOrganizationSubIndustry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch organization's industry on mount
  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setWorkflow(getIndustryWorkflow(null, null));
          setIsLoading(false);
          return;
        }

        // Get organization membership
        const { data: membership } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();

        if (membership?.organization_id) {
          // Get organization details with industry
          const { data: org } = await supabase
            .from('organizations')
            .select('industry, sub_industry')
            .eq('id', membership.organization_id)
            .single();

          if (org) {
            setOrganizationIndustry(org.industry || null);
            setOrganizationSubIndustry(org.sub_industry || null);
            setWorkflow(getIndustryWorkflow(org.industry, org.sub_industry));
          } else {
            setWorkflow(getIndustryWorkflow(null, null));
          }
        } else {
          setWorkflow(getIndustryWorkflow(null, null));
        }
      } catch (error) {
        console.error('Error fetching organization:', error);
        setWorkflow(getIndustryWorkflow(null, null));
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganization();
  }, []);

  // Calculate total steps: 1 (org) + industry steps + 1 (calculations) + 1 (data quality) + 1 (review)
  const industryStepsCount = workflow?.steps.length || 0;
  const totalSteps = 1 + industryStepsCount + 1 + 1 + 1; // org + industry + calc + quality + review

  const updateFormData = (stepData: Partial<EmissionsFormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    setIsDraft(true);
    localStorage.setItem('emissions-form-draft', JSON.stringify({ ...formData, ...stepData }));
  };

  const updateIndustryStepData = (stepId: string, fieldId: string, value: string | number) => {
    setIndustryStepData(prev => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        [fieldId]: value
      }
    }));
    setIsDraft(true);
  };

  const goToStep = (step: number) => {
    if (step <= Math.max(...completedSteps, currentStep)) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepStatus = (stepId: number) => {
    if (completedSteps.includes(stepId)) return 'completed';
    if (stepId === currentStep) return 'current';
    if (stepId < currentStep) return 'available';
    return 'disabled';
  };

  const getStepInfo = (stepNumber: number) => {
    if (stepNumber === 1) {
      return { title: 'Organization', description: 'Facility info' };
    }
    
    const industryStepIndex = stepNumber - 2;
    if (industryStepIndex >= 0 && industryStepIndex < industryStepsCount) {
      const step = workflow?.steps[industryStepIndex];
      return { title: step?.title || 'Industry Step', description: step?.description || '' };
    }
    
    const postIndustryStep = stepNumber - industryStepsCount - 2;
    if (postIndustryStep === 0) {
      return { title: 'Calculations', description: 'Emission factors' };
    }
    if (postIndustryStep === 1) {
      return { title: 'Data Quality', description: 'Verification' };
    }
    if (postIndustryStep === 2) {
      return { title: 'Review', description: 'Submit' };
    }
    
    return { title: 'Step', description: '' };
  };

  const renderStep = () => {
    const commonProps = {
      formData,
      updateFormData,
      nextStep,
      prevStep,
      isLastStep: currentStep === totalSteps,
    };

    // Step 1: Organization & Facility (always first)
    if (currentStep === 1) {
      return <WizardStep1 {...commonProps} />;
    }

    // Industry-specific steps (steps 2 through 2 + industryStepsCount - 1)
    const industryStepIndex = currentStep - 2;
    if (industryStepIndex >= 0 && industryStepIndex < industryStepsCount && workflow) {
      const step = workflow.steps[industryStepIndex];
      return (
        <IndustryWorkflowStep
          step={step}
          stepIndex={industryStepIndex}
          totalSteps={industryStepsCount}
          stepData={industryStepData[step.id] || {}}
          onUpdateData={(fieldId, value) => updateIndustryStepData(step.id, fieldId, value)}
          onNext={nextStep}
          onPrev={prevStep}
          isFirst={industryStepIndex === 0}
          isLast={industryStepIndex === industryStepsCount - 1}
        />
      );
    }

    // Calculations step (after industry steps)
    const postIndustryStep = currentStep - industryStepsCount - 2;
    if (postIndustryStep === 0) {
      return (
        <IndustryAwareCalculations
          formData={formData}
          updateFormData={updateFormData}
          industryStepData={industryStepData}
          workflow={workflow}
          organizationIndustry={organizationIndustry}
          organizationSubIndustry={organizationSubIndustry}
          nextStep={nextStep}
          prevStep={prevStep}
        />
      );
    }

    // Data Quality step
    if (postIndustryStep === 1) {
      return <WizardStep5 {...commonProps} />;
    }

    // Review & Submit step
    if (postIndustryStep === 2) {
      return <WizardStep6 {...commonProps} />;
    }

    return null;
  };

  const progressPercentage = (completedSteps.length / totalSteps) * 100;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3 py-12">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
            <span className="text-muted-foreground">Loading industry workflow...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold">Emissions Data Entry</h2>
                {workflow && workflow.id !== 'generic' && (
                  <Badge variant="secondary" className="gap-1">
                    <Factory className="h-3 w-3" />
                    {workflow.name}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isDraft && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Draft
                  </Badge>
                )}
                <Badge variant="secondary">
                  Step {currentStep} of {totalSteps}
                </Badge>
              </div>
            </div>

            {workflow && workflow.id !== 'generic' && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 px-3 py-2 rounded-lg">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>
                  Using <strong>{workflow.name}</strong> workflow with industry-specific emission factors and calculations
                </span>
              </div>
            )}
            
            <Progress value={progressPercentage} className="h-2" />
            
            {/* Step Navigation - Scrollable on small screens */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => {
                const status = getStepStatus(stepNum);
                const stepInfo = getStepInfo(stepNum);
                return (
                  <button
                    key={stepNum}
                    onClick={() => goToStep(stepNum)}
                    disabled={status === 'disabled'}
                    className={`flex-shrink-0 p-3 rounded-lg text-left transition-all min-w-[120px] ${
                      status === 'current' 
                        ? 'bg-primary text-primary-foreground' 
                        : status === 'completed'
                        ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800'
                        : status === 'available'
                        ? 'bg-muted hover:bg-muted/80'
                        : 'bg-muted/50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {status === 'completed' && <CheckCircle className="h-4 w-4" />}
                      {status === 'current' && <AlertCircle className="h-4 w-4" />}
                      <span className="text-sm font-medium">Step {stepNum}</span>
                    </div>
                    <div className="text-xs opacity-80 truncate">{stepInfo.title}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      {renderStep()}
    </div>
  );
};
