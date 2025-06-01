
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Calculator, TrendingUp } from "lucide-react";
import { EmissionsFormData } from '../EmissionsWizard';

interface WizardStep4Props {
  formData: EmissionsFormData;
  updateFormData: (data: Partial<EmissionsFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  isLastStep: boolean;
}

export const WizardStep4: React.FC<WizardStep4Props> = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) => {
  const addEmissionFactor = () => {
    const newFactor = {
      source: '',
      factor: 0,
      unit: '',
      methodology: '',
    };
    updateFormData({
      emissionFactors: [...formData.emissionFactors, newFactor]
    });
  };

  const removeEmissionFactor = (index: number) => {
    const updatedData = formData.emissionFactors.filter((_, i) => i !== index);
    updateFormData({ emissionFactors: updatedData });
  };

  const updateEmissionFactor = (index: number, field: string, value: any) => {
    const updatedData = [...formData.emissionFactors];
    updatedData[index] = { ...updatedData[index], [field]: value };
    updateFormData({ emissionFactors: updatedData });
  };

  // Calculate estimated total emissions
  const calculateEstimatedEmissions = () => {
    let total = 0;
    formData.consumptionData.forEach(consumption => {
      const matchingFactor = formData.emissionFactors.find(factor => 
        factor.source.toLowerCase().includes(consumption.type.toLowerCase())
      );
      if (matchingFactor) {
        total += consumption.amount * matchingFactor.factor;
      }
    });
    return total.toFixed(2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calculation & Factors
        </CardTitle>
        <CardDescription>
          Define emission factors, calculation methodology, and uncertainty ranges.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Emission Factors */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Emission Factors</h3>
            <Button onClick={addEmissionFactor} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Factor
            </Button>
          </div>

          <div className="space-y-4">
            {formData.emissionFactors.map((factor, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div>
                    <Label>Emission Source</Label>
                    <Select
                      value={factor.source}
                      onValueChange={(value) => updateEmissionFactor(index, 'source', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electricity">Electricity</SelectItem>
                        <SelectItem value="natural-gas">Natural Gas</SelectItem>
                        <SelectItem value="diesel">Diesel Fuel</SelectItem>
                        <SelectItem value="gasoline">Gasoline</SelectItem>
                        <SelectItem value="propane">Propane</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Emission Factor</Label>
                    <Input
                      type="number"
                      value={factor.factor}
                      onChange={(e) => updateEmissionFactor(index, 'factor', parseFloat(e.target.value) || 0)}
                      placeholder="0.000"
                      step="0.001"
                    />
                  </div>

                  <div>
                    <Label>Unit</Label>
                    <Select
                      value={factor.unit}
                      onValueChange={(value) => updateEmissionFactor(index, 'unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg CO2e/kWh">kg CO₂e/kWh</SelectItem>
                        <SelectItem value="kg CO2e/therm">kg CO₂e/therm</SelectItem>
                        <SelectItem value="kg CO2e/liter">kg CO₂e/liter</SelectItem>
                        <SelectItem value="kg CO2e/gallon">kg CO₂e/gallon</SelectItem>
                        <SelectItem value="kg CO2e/kg">kg CO₂e/kg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Methodology</Label>
                    <Select
                      value={factor.methodology}
                      onValueChange={(value) => updateEmissionFactor(index, 'methodology', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EPA">EPA</SelectItem>
                        <SelectItem value="IPCC">IPCC</SelectItem>
                        <SelectItem value="IEA">IEA</SelectItem>
                        <SelectItem value="Local Grid">Local Grid</SelectItem>
                        <SelectItem value="Supplier">Supplier Data</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEmissionFactor(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}

            {formData.emissionFactors.length === 0 && (
              <div className="text-center p-8 border-2 border-dashed border-muted rounded-lg">
                <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-4">No emission factors defined yet</p>
                <Button onClick={addEmissionFactor} variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Emission Factor
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Calculation Methodology and Uncertainty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="calculationMethodology">Calculation Methodology</Label>
            <Textarea
              id="calculationMethodology"
              value={formData.calculationMethodology}
              onChange={(e) => updateFormData({ calculationMethodology: e.target.value })}
              placeholder="Describe the calculation approach and standards used"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="uncertaintyRange">Uncertainty Range (%)</Label>
            <Input
              id="uncertaintyRange"
              type="number"
              value={formData.uncertaintyRange}
              onChange={(e) => updateFormData({ uncertaintyRange: parseFloat(e.target.value) || 0 })}
              placeholder="5"
              min="0"
              max="100"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Estimated uncertainty as a percentage of total emissions
            </p>
          </div>
        </div>

        {/* Estimated Emissions Preview */}
        {formData.consumptionData.length > 0 && formData.emissionFactors.length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">Estimated Total Emissions</h4>
                  <p className="text-sm text-blue-700">Based on current data and factors</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-900">
                    {calculateEstimatedEmissions()} kg CO₂e
                  </div>
                  <div className="text-sm text-blue-700">
                    ±{formData.uncertaintyRange}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={prevStep}>
            Back
          </Button>
          <Button onClick={nextStep}>
            Continue to Data Quality
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
