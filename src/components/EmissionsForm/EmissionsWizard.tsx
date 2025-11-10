
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { WizardStep1 } from './steps/WizardStep1';
import { WizardStep2 } from './steps/WizardStep2';
import { WizardStep3 } from './steps/WizardStep3';
import { WizardStep4 } from './steps/WizardStep4';
import { WizardStep5 } from './steps/WizardStep5';
import { WizardStep6 } from './steps/WizardStep6';

export interface EmissionsFormData {
  // Step 1: Organization & Facility
  organizationName: string;
  facilityId?: string; // Link to existing facility
  facilityName: string;
  facilityType: string;
  facilityCountry: string;
  facilityIndustry: string;
  address: string;
  reportingPeriodStart: string;
  reportingPeriodEnd: string;
  operationalBoundaries: string;
  
  // Step 2: Activity Data
  consumptionData: Array<{
    type: string;
    amount: number;
    unit: string;
    period: string;
  }>;
  operationalHours: number;
  productionVolume: number;
  
  // Step 3: Emission Source Details
  equipmentInfo: Array<{
    name: string;
    type: string;
    capacity: number;
    age: number;
  }>;
  fuelSpecifications: string;
  processDetails: string;
  
  // Step 4: Calculation & Factors
  emissionFactors: Array<{
    source: string;
    factor: number;
    unit: string;
    methodology: string;
  }>;
  calculationMethodology: string;
  uncertaintyRange: number;
  
  // Step 5: Data Quality
  confidenceLevel: string;
  dataSources: string[];
  supportingDocuments: File[];
  measurementType: string;
  
  // Step 6: Review & Submit
  reviewComments: string;
  approvalRequired: boolean;
}

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

const steps = [
  { id: 1, title: 'Organization & Facility', description: 'Basic facility information' },
  { id: 2, title: 'Activity Data', description: 'Consumption and operational data' },
  { id: 3, title: 'Emission Sources', description: 'Equipment and process details' },
  { id: 4, title: 'Calculations', description: 'Emission factors and methodology' },
  { id: 5, title: 'Data Quality', description: 'Verification and documentation' },
  { id: 6, title: 'Review & Submit', description: 'Final review and submission' },
];

export const EmissionsWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<EmissionsFormData>(initialFormData);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isDraft, setIsDraft] = useState(true);

  const updateFormData = (stepData: Partial<EmissionsFormData>) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    setIsDraft(true);
    
    // Auto-save to localStorage
    localStorage.setItem('emissions-form-draft', JSON.stringify({ ...formData, ...stepData }));
  };

  const goToStep = (step: number) => {
    if (step <= Math.max(...completedSteps, currentStep)) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
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

  const renderStep = () => {
    const commonProps = {
      formData,
      updateFormData,
      nextStep,
      prevStep,
      isLastStep: currentStep === steps.length,
    };

    switch (currentStep) {
      case 1: return <WizardStep1 {...commonProps} />;
      case 2: return <WizardStep2 {...commonProps} />;
      case 3: return <WizardStep3 {...commonProps} />;
      case 4: return <WizardStep4 {...commonProps} />;
      case 5: return <WizardStep5 {...commonProps} />;
      case 6: return <WizardStep6 {...commonProps} />;
      default: return <WizardStep1 {...commonProps} />;
    }
  };

  const progressPercentage = (completedSteps.length / steps.length) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Emissions Data Entry</h2>
              <div className="flex items-center gap-2">
                {isDraft && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Draft
                  </Badge>
                )}
                <Badge variant="secondary">
                  Step {currentStep} of {steps.length}
                </Badge>
              </div>
            </div>
            
            <Progress value={progressPercentage} className="h-2" />
            
            {/* Step Navigation */}
            <div className="grid grid-cols-6 gap-2">
              {steps.map((step) => {
                const status = getStepStatus(step.id);
                return (
                  <button
                    key={step.id}
                    onClick={() => goToStep(step.id)}
                    disabled={status === 'disabled'}
                    className={`p-3 rounded-lg text-left transition-all ${
                      status === 'current' 
                        ? 'bg-primary text-primary-foreground' 
                        : status === 'completed'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : status === 'available'
                        ? 'bg-muted hover:bg-muted/80'
                        : 'bg-muted/50 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {status === 'completed' && <CheckCircle className="h-4 w-4" />}
                      {status === 'current' && <AlertCircle className="h-4 w-4" />}
                      <span className="text-sm font-medium">Step {step.id}</span>
                    </div>
                    <div className="text-xs opacity-80">{step.title}</div>
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
