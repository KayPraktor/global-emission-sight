
import React, { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, Shield } from "lucide-react";
import { EmissionsFormData } from '../EmissionsWizard';

interface WizardStep5Props {
  formData: EmissionsFormData;
  updateFormData: (data: Partial<EmissionsFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  isLastStep: boolean;
}

export const WizardStep5: React.FC<WizardStep5Props> = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dataSourceOptions = [
    'Utility Bills',
    'Meter Readings',
    'Fuel Receipts',
    'Equipment Specifications',
    'Third-party Verification',
    'Engineering Estimates',
    'Supplier Data',
    'Previous Reports',
  ];

  const handleDataSourceChange = (source: string, checked: boolean) => {
    const currentSources = formData.dataSources || [];
    if (checked) {
      updateFormData({ dataSources: [...currentSources, source] });
    } else {
      updateFormData({ dataSources: currentSources.filter(s => s !== source) });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    updateFormData({ 
      supportingDocuments: [...(formData.supportingDocuments || []), ...files] 
    });
  };

  const removeFile = (index: number) => {
    const updatedFiles = formData.supportingDocuments.filter((_, i) => i !== index);
    updateFormData({ supportingDocuments: updatedFiles });
  };

  const getDataQualityScore = () => {
    let score = 0;
    
    // Confidence level scoring
    if (formData.confidenceLevel === 'high') score += 30;
    else if (formData.confidenceLevel === 'medium') score += 20;
    else if (formData.confidenceLevel === 'low') score += 10;
    
    // Data sources scoring
    score += Math.min(formData.dataSources.length * 5, 30);
    
    // Measurement type scoring
    if (formData.measurementType === 'measured') score += 25;
    else if (formData.measurementType === 'calculated') score += 15;
    else if (formData.measurementType === 'estimated') score += 10;
    
    // Supporting documents scoring
    score += Math.min(formData.supportingDocuments.length * 3, 15);
    
    return Math.min(score, 100);
  };

  const qualityScore = getDataQualityScore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Data Quality & Verification
        </CardTitle>
        <CardDescription>
          Provide information about data quality, confidence levels, and supporting documentation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Data Quality Score */}
        <Card className={`${qualityScore >= 80 ? 'bg-green-50 border-green-200' : 
                         qualityScore >= 60 ? 'bg-yellow-50 border-yellow-200' : 
                         'bg-red-50 border-red-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Data Quality Score</h4>
                <p className="text-sm text-muted-foreground">Based on current inputs</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{qualityScore}/100</div>
                <Badge variant={qualityScore >= 80 ? 'default' : qualityScore >= 60 ? 'secondary' : 'destructive'}>
                  {qualityScore >= 80 ? 'High Quality' : qualityScore >= 60 ? 'Medium Quality' : 'Needs Improvement'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confidence Level and Measurement Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Confidence Level</Label>
            <Select
              value={formData.confidenceLevel}
              onValueChange={(value) => updateFormData({ confidenceLevel: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select confidence level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High - Direct measurements, verified data</SelectItem>
                <SelectItem value="medium">Medium - Calculated from reliable sources</SelectItem>
                <SelectItem value="low">Low - Estimates or uncertain data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Primary Measurement Type</Label>
            <Select
              value={formData.measurementType}
              onValueChange={(value) => updateFormData({ measurementType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select measurement type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="measured">Measured - Direct meter readings</SelectItem>
                <SelectItem value="calculated">Calculated - From activity data</SelectItem>
                <SelectItem value="estimated">Estimated - Engineering estimates</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Data Sources */}
        <div>
          <Label className="text-base font-medium mb-3 block">Data Sources</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {dataSourceOptions.map((source) => (
              <div key={source} className="flex items-center space-x-2">
                <Checkbox
                  id={source}
                  checked={formData.dataSources.includes(source)}
                  onCheckedChange={(checked) => handleDataSourceChange(source, checked as boolean)}
                />
                <Label htmlFor={source} className="text-sm">{source}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Supporting Documents */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <Label className="text-base font-medium">Supporting Documents</Label>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-1" />
              Upload Files
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="space-y-2">
            {formData.supportingDocuments.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{file.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-destructive hover:text-destructive"
                >
                  Remove
                </Button>
              </div>
            ))}

            {formData.supportingDocuments.length === 0 && (
              <div className="text-center p-6 border-2 border-dashed border-muted rounded-lg">
                <FileText className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload utility bills, receipts, certificates, or other supporting documentation
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Data Quality Recommendations */}
        {qualityScore < 80 && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Recommendations to Improve Data Quality</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                {formData.confidenceLevel !== 'high' && (
                  <li>• Consider using direct measurements where possible</li>
                )}
                {formData.dataSources.length < 3 && (
                  <li>• Add more diverse data sources for verification</li>
                )}
                {formData.measurementType !== 'measured' && (
                  <li>• Use meter readings instead of estimates when available</li>
                )}
                {formData.supportingDocuments.length < 3 && (
                  <li>• Upload supporting documentation to verify data</li>
                )}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={prevStep}>
            Back
          </Button>
          <Button onClick={nextStep}>
            Continue to Review
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
