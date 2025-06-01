
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Activity, Upload } from "lucide-react";
import { EmissionsFormData } from '../EmissionsWizard';

interface WizardStep2Props {
  formData: EmissionsFormData;
  updateFormData: (data: Partial<EmissionsFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  isLastStep: boolean;
}

export const WizardStep2: React.FC<WizardStep2Props> = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) => {
  const addConsumptionEntry = () => {
    const newEntry = {
      type: '',
      amount: 0,
      unit: '',
      period: 'monthly',
    };
    updateFormData({
      consumptionData: [...formData.consumptionData, newEntry]
    });
  };

  const removeConsumptionEntry = (index: number) => {
    const updatedData = formData.consumptionData.filter((_, i) => i !== index);
    updateFormData({ consumptionData: updatedData });
  };

  const updateConsumptionEntry = (index: number, field: string, value: any) => {
    const updatedData = [...formData.consumptionData];
    updatedData[index] = { ...updatedData[index], [field]: value };
    updateFormData({ consumptionData: updatedData });
  };

  const isStepValid = () => {
    return formData.consumptionData.length > 0 &&
           formData.consumptionData.every(entry => entry.type && entry.amount > 0 && entry.unit);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Data
        </CardTitle>
        <CardDescription>
          Enter detailed consumption data and operational parameters for the reporting period.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Consumption Data Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Consumption Data</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-1" />
                Import CSV
              </Button>
              <Button onClick={addConsumptionEntry} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Entry
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {formData.consumptionData.map((entry, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div>
                    <Label>Consumption Type *</Label>
                    <Select
                      value={entry.type}
                      onValueChange={(value) => updateConsumptionEntry(index, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electricity">Electricity</SelectItem>
                        <SelectItem value="natural-gas">Natural Gas</SelectItem>
                        <SelectItem value="diesel">Diesel Fuel</SelectItem>
                        <SelectItem value="gasoline">Gasoline</SelectItem>
                        <SelectItem value="propane">Propane</SelectItem>
                        <SelectItem value="steam">Steam</SelectItem>
                        <SelectItem value="chilled-water">Chilled Water</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Amount *</Label>
                    <Input
                      type="number"
                      value={entry.amount}
                      onChange={(e) => updateConsumptionEntry(index, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <Label>Unit *</Label>
                    <Select
                      value={entry.unit}
                      onValueChange={(value) => updateConsumptionEntry(index, 'unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kWh">kWh</SelectItem>
                        <SelectItem value="MWh">MWh</SelectItem>
                        <SelectItem value="therms">Therms</SelectItem>
                        <SelectItem value="cubic-feet">Cubic Feet</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                        <SelectItem value="gallons">Gallons</SelectItem>
                        <SelectItem value="kg">Kilograms</SelectItem>
                        <SelectItem value="tonnes">Tonnes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Period</Label>
                    <Select
                      value={entry.period}
                      onValueChange={(value) => updateConsumptionEntry(index, 'period', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeConsumptionEntry(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}

            {formData.consumptionData.length === 0 && (
              <div className="text-center p-8 border-2 border-dashed border-muted rounded-lg">
                <Activity className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-4">No consumption data added yet</p>
                <Button onClick={addConsumptionEntry} variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add First Entry
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Operational Parameters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="operationalHours">Annual Operational Hours</Label>
            <Input
              id="operationalHours"
              type="number"
              value={formData.operationalHours}
              onChange={(e) => updateFormData({ operationalHours: parseFloat(e.target.value) || 0 })}
              placeholder="8760"
              min="0"
              max="8760"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Maximum 8,760 hours per year
            </p>
          </div>

          <div>
            <Label htmlFor="productionVolume">Production Volume</Label>
            <Input
              id="productionVolume"
              type="number"
              value={formData.productionVolume}
              onChange={(e) => updateFormData({ productionVolume: parseFloat(e.target.value) || 0 })}
              placeholder="Annual production volume"
              min="0"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Annual production volume (units appropriate to your industry)
            </p>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={prevStep}>
            Back
          </Button>
          <Button 
            onClick={nextStep}
            disabled={!isStepValid()}
          >
            Continue to Emission Sources
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
