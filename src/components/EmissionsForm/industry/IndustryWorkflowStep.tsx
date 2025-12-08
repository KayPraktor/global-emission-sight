import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, ArrowLeft, ArrowRight } from "lucide-react";
import { WorkflowStep, WorkflowField } from '@/data/industryWorkflows';

interface IndustryWorkflowStepProps {
  step: WorkflowStep;
  stepIndex: number;
  totalSteps: number;
  stepData: Record<string, string | number>;
  onUpdateData: (fieldId: string, value: string | number) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export const IndustryWorkflowStep: React.FC<IndustryWorkflowStepProps> = ({
  step,
  stepIndex,
  totalSteps,
  stepData,
  onUpdateData,
  onNext,
  onPrev,
  isFirst,
  isLast,
}) => {
  const renderField = (field: WorkflowField) => {
    const value = stepData[field.id] ?? '';

    switch (field.type) {
      case 'select':
        return (
          <Select
            value={value.toString()}
            onValueChange={(val) => onUpdateData(field.id, val)}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || `Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'number':
        return (
          <div className="flex gap-2">
            <Input
              type="number"
              value={value}
              onChange={(e) => onUpdateData(field.id, parseFloat(e.target.value) || 0)}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              className="flex-1"
            />
            {field.unit && (
              <div className="flex items-center px-3 bg-muted rounded-md text-sm text-muted-foreground min-w-[80px] justify-center">
                {field.unit}
              </div>
            )}
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value.toString()}
            onChange={(e) => onUpdateData(field.id, e.target.value)}
          />
        );

      default:
        return (
          <Input
            type="text"
            value={value.toString()}
            onChange={(e) => onUpdateData(field.id, e.target.value)}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
          />
        );
    }
  };

  const isStepValid = () => {
    const requiredFields = step.fields.filter(f => f.required);
    return requiredFields.every(f => {
      const value = stepData[f.id];
      return value !== undefined && value !== '' && value !== 0;
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{step.title}</CardTitle>
            <CardDescription>{step.description}</CardDescription>
          </div>
          <Badge variant="outline">
            Step {stepIndex + 1} of {totalSteps}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {step.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              {renderField(field)}
              {field.helpText && (
                <p className="text-xs text-muted-foreground">{field.helpText}</p>
              )}
            </div>
          ))}
        </div>

        {step.suggestedFactorCategories && step.suggestedFactorCategories.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Suggested Emission Factors</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {step.suggestedFactorCategories.map((category) => (
                <Badge key={category} variant="secondary" className="text-xs">
                  {category.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onPrev}
            disabled={isFirst}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={onNext}
            disabled={!isStepValid()}
            className="gap-2"
          >
            {isLast ? 'Continue to Calculations' : 'Next Step'}
            {!isLast && <ArrowRight className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
