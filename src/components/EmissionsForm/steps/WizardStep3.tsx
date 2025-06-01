
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Settings, Zap } from "lucide-react";
import { EmissionsFormData } from '../EmissionsWizard';

interface WizardStep3Props {
  formData: EmissionsFormData;
  updateFormData: (data: Partial<EmissionsFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  isLastStep: boolean;
}

export const WizardStep3: React.FC<WizardStep3Props> = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) => {
  const addEquipment = () => {
    const newEquipment = {
      name: '',
      type: '',
      capacity: 0,
      age: 0,
    };
    updateFormData({
      equipmentInfo: [...formData.equipmentInfo, newEquipment]
    });
  };

  const removeEquipment = (index: number) => {
    const updatedData = formData.equipmentInfo.filter((_, i) => i !== index);
    updateFormData({ equipmentInfo: updatedData });
  };

  const updateEquipment = (index: number, field: string, value: any) => {
    const updatedData = [...formData.equipmentInfo];
    updatedData[index] = { ...updatedData[index], [field]: value };
    updateFormData({ equipmentInfo: updatedData });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Emission Source Details
        </CardTitle>
        <CardDescription>
          Provide detailed information about equipment, fuel specifications, and processes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Equipment Information */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Equipment Information</h3>
            <Button onClick={addEquipment} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Equipment
            </Button>
          </div>

          <div className="space-y-4">
            {formData.equipmentInfo.map((equipment, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div>
                    <Label>Equipment Name</Label>
                    <Input
                      value={equipment.name}
                      onChange={(e) => updateEquipment(index, 'name', e.target.value)}
                      placeholder="Boiler #1"
                    />
                  </div>

                  <div>
                    <Label>Equipment Type</Label>
                    <Input
                      value={equipment.type}
                      onChange={(e) => updateEquipment(index, 'type', e.target.value)}
                      placeholder="Natural Gas Boiler"
                    />
                  </div>

                  <div>
                    <Label>Capacity</Label>
                    <Input
                      type="number"
                      value={equipment.capacity}
                      onChange={(e) => updateEquipment(index, 'capacity', parseFloat(e.target.value) || 0)}
                      placeholder="1000"
                      min="0"
                    />
                  </div>

                  <div>
                    <Label>Age (years)</Label>
                    <Input
                      type="number"
                      value={equipment.age}
                      onChange={(e) => updateEquipment(index, 'age', parseFloat(e.target.value) || 0)}
                      placeholder="5"
                      min="0"
                    />
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEquipment(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}

            {formData.equipmentInfo.length === 0 && (
              <div className="text-center p-8 border-2 border-dashed border-muted rounded-lg">
                <Zap className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground mb-4">No equipment information added yet</p>
                <Button onClick={addEquipment} variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Equipment
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Fuel Specifications and Process Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="fuelSpecifications">Fuel Specifications</Label>
            <Textarea
              id="fuelSpecifications"
              value={formData.fuelSpecifications}
              onChange={(e) => updateFormData({ fuelSpecifications: e.target.value })}
              placeholder="Describe fuel types, quality, heat content, sulfur content, etc."
              rows={6}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Include fuel quality parameters, heat content, carbon content, and any relevant certifications
            </p>
          </div>

          <div>
            <Label htmlFor="processDetails">Process Details</Label>
            <Textarea
              id="processDetails"
              value={formData.processDetails}
              onChange={(e) => updateFormData({ processDetails: e.target.value })}
              placeholder="Describe industrial processes, chemical reactions, etc."
              rows={6}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Describe any industrial processes that generate emissions beyond fuel combustion
            </p>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button variant="outline" onClick={prevStep}>
            Back
          </Button>
          <Button onClick={nextStep}>
            Continue to Calculations
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
