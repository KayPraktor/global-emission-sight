
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Building2, MapPin } from "lucide-react";
import { EmissionsFormData } from '../EmissionsWizard';
import { FacilityService } from '@/services/facilityService';
import { Facility } from '@/types/database';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WizardStep1Props {
  formData: EmissionsFormData;
  updateFormData: (data: Partial<EmissionsFormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  isLastStep: boolean;
}

export const WizardStep1: React.FC<WizardStep1Props> = ({
  formData,
  updateFormData,
  nextStep,
}) => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoadingFacilities, setIsLoadingFacilities] = useState(true);

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    const { data, error } = await FacilityService.getFacilities();
    if (data) {
      setFacilities(data);
    }
    setIsLoadingFacilities(false);
  };

  const handleInputChange = (field: keyof EmissionsFormData, value: string) => {
    updateFormData({ [field]: value });
  };

  const handleFacilitySelect = (facilityId: string) => {
    if (facilityId === 'new') {
      updateFormData({ 
        facilityId: undefined,
        facilityName: '',
        facilityType: '',
        address: ''
      });
      return;
    }

    const selectedFacility = facilities.find(f => f.id === facilityId);
    if (selectedFacility) {
      updateFormData({
        facilityId: facilityId,
        facilityName: selectedFacility.name,
        facilityType: selectedFacility.facility_type,
        address: selectedFacility.address || '',
      });
    }
  };

  const isStepValid = () => {
    return formData.organizationName && 
           formData.facilityName && 
           formData.facilityType && 
           formData.address &&
           formData.reportingPeriodStart &&
           formData.reportingPeriodEnd;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Organization & Facility Information
        </CardTitle>
        <CardDescription>
          Provide basic information about your organization and the facility being reported.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {facilities.length > 0 && (
          <Alert>
            <Building2 className="h-4 w-4" />
            <AlertDescription>
              You can link this emissions data to an existing facility or create a new one.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="organizationName">Organization Name *</Label>
              <Input
                id="organizationName"
                value={formData.organizationName}
                onChange={(e) => handleInputChange('organizationName', e.target.value)}
                placeholder="Enter organization name"
                required
              />
            </div>

            {facilities.length > 0 && (
              <div>
                <Label htmlFor="facilitySelect">Link to Existing Facility</Label>
                <Select 
                  value={formData.facilityId || 'new'}
                  onValueChange={handleFacilitySelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a facility or create new" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Create New Facility</SelectItem>
                    {facilities.map((facility) => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.name} ({facility.city || facility.country_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="facilityName">Facility Name *</Label>
              <Input
                id="facilityName"
                value={formData.facilityName}
                onChange={(e) => handleInputChange('facilityName', e.target.value)}
                placeholder="Enter facility name"
                required
                disabled={!!formData.facilityId}
              />
            </div>

            <div>
              <Label htmlFor="facilityType">Facility Type *</Label>
              <Select 
                value={formData.facilityType}
                onValueChange={(value) => handleInputChange('facilityType', value)}
                disabled={!!formData.facilityId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select facility type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manufacturing">Manufacturing Plant</SelectItem>
                  <SelectItem value="office">Office Building</SelectItem>
                  <SelectItem value="warehouse">Warehouse/Distribution</SelectItem>
                  <SelectItem value="datacenter">Data Center</SelectItem>
                  <SelectItem value="retail">Retail Store</SelectItem>
                  <SelectItem value="hospital">Hospital/Healthcare</SelectItem>
                  <SelectItem value="school">Educational Institution</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="address" className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Facility Address *
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter complete facility address"
                rows={3}
                required
                disabled={!!formData.facilityId}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reportingPeriodStart" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Reporting Period Start *
              </Label>
              <Input
                id="reportingPeriodStart"
                type="date"
                value={formData.reportingPeriodStart}
                onChange={(e) => handleInputChange('reportingPeriodStart', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="reportingPeriodEnd">Reporting Period End *</Label>
              <Input
                id="reportingPeriodEnd"
                type="date"
                value={formData.reportingPeriodEnd}
                onChange={(e) => handleInputChange('reportingPeriodEnd', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="operationalBoundaries">Operational Boundaries</Label>
              <Textarea
                id="operationalBoundaries"
                value={formData.operationalBoundaries}
                onChange={(e) => handleInputChange('operationalBoundaries', e.target.value)}
                placeholder="Describe the operational boundaries for this facility"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Describe what activities and emissions sources are included in this report
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <div></div>
          <Button 
            onClick={nextStep}
            disabled={!isStepValid()}
            className="flex items-center gap-2"
          >
            Continue to Activity Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
