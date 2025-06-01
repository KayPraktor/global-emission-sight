
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertTriangle, FileCheck, Send } from "lucide-react";
import { toast } from "sonner";
import { EmissionsFormData } from '../EmissionsWizard';

interface WizardStep6Props {
  formData: EmissionsFormData;
  updateFormData: (data: Partial<EmissionsFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  isLastStep: boolean;
}

export const WizardStep6: React.FC<WizardStep6Props> = ({
  formData,
  updateFormData,
  prevStep,
}) => {
  const calculateTotalEmissions = () => {
    let total = 0;
    formData.consumptionData.forEach(consumption => {
      const matchingFactor = formData.emissionFactors.find(factor => 
        factor.source.toLowerCase().includes(consumption.type.toLowerCase())
      );
      if (matchingFactor) {
        total += consumption.amount * matchingFactor.factor;
      }
    });
    return total;
  };

  const getCompletionStatus = () => {
    const checks = [
      { label: 'Organization & Facility Info', completed: formData.organizationName && formData.facilityName },
      { label: 'Activity Data', completed: formData.consumptionData.length > 0 },
      { label: 'Emission Sources', completed: formData.equipmentInfo.length > 0 || formData.fuelSpecifications },
      { label: 'Calculation Factors', completed: formData.emissionFactors.length > 0 },
      { label: 'Data Quality', completed: formData.confidenceLevel && formData.measurementType },
    ];
    
    const completedCount = checks.filter(check => check.completed).length;
    return { checks, completedCount, total: checks.length };
  };

  const handleSubmit = () => {
    const totalEmissions = calculateTotalEmissions();
    
    console.log('Submitting emissions data:', {
      ...formData,
      calculatedEmissions: totalEmissions,
      submissionDate: new Date().toISOString(),
    });
    
    toast.success('Emissions data submitted successfully!');
    
    // Clear draft from localStorage
    localStorage.removeItem('emissions-form-draft');
    
    // Reset form or redirect as needed
  };

  const status = getCompletionStatus();
  const totalEmissions = calculateTotalEmissions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Review & Submit
        </CardTitle>
        <CardDescription>
          Review your emissions data and submit for processing or approval.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Completion Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Completion Status</h3>
              <Badge variant={status.completedCount === status.total ? 'default' : 'secondary'}>
                {status.completedCount}/{status.total} Complete
              </Badge>
            </div>
            <div className="space-y-2">
              {status.checks.map((check, index) => (
                <div key={index} className="flex items-center gap-2">
                  {check.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className={`text-sm ${check.completed ? 'text-green-700' : 'text-yellow-700'}`}>
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{totalEmissions.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">kg CO₂e</div>
              <div className="text-xs text-muted-foreground mt-1">Total Emissions</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{formData.consumptionData.length}</div>
              <div className="text-sm text-muted-foreground">Data Points</div>
              <div className="text-xs text-muted-foreground mt-1">Activity Data</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{formData.supportingDocuments.length}</div>
              <div className="text-sm text-muted-foreground">Documents</div>
              <div className="text-xs text-muted-foreground mt-1">Supporting Files</div>
            </CardContent>
          </Card>
        </div>

        {/* Data Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Organization:</strong> {formData.organizationName || 'Not specified'}
              </div>
              <div>
                <strong>Facility:</strong> {formData.facilityName || 'Not specified'}
              </div>
              <div>
                <strong>Reporting Period:</strong> {formData.reportingPeriodStart} to {formData.reportingPeriodEnd}
              </div>
              <div>
                <strong>Confidence Level:</strong> {formData.confidenceLevel || 'Not specified'}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <strong className="text-sm">Top Emission Sources:</strong>
              <div className="mt-2 space-y-1">
                {formData.consumptionData.slice(0, 3).map((consumption, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    • {consumption.type}: {consumption.amount} {consumption.unit}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Comments */}
        <div>
          <Label htmlFor="reviewComments">Review Comments (Optional)</Label>
          <Textarea
            id="reviewComments"
            value={formData.reviewComments}
            onChange={(e) => updateFormData({ reviewComments: e.target.value })}
            placeholder="Add any additional comments or notes for review"
            rows={3}
          />
        </div>

        {/* Approval Options */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="approvalRequired" className="text-sm font-medium">
                  Require Approval
                </Label>
                <p className="text-xs text-muted-foreground">
                  Submit for manager approval before finalizing
                </p>
              </div>
              <Switch
                id="approvalRequired"
                checked={formData.approvalRequired}
                onCheckedChange={(checked) => updateFormData({ approvalRequired: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Validation Warnings */}
        {status.completedCount < status.total && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">Incomplete Sections</h4>
                  <p className="text-sm text-yellow-700">
                    Some sections are incomplete. You can still submit as a draft or complete all sections for final submission.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={prevStep}>
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline">
              Save as Draft
            </Button>
            <Button onClick={handleSubmit} className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              {formData.approvalRequired ? 'Submit for Approval' : 'Submit Data'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
