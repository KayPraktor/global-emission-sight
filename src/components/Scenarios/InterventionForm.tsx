import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface InterventionFormProps {
  scenarioId: string;
}

const interventionTypes = [
  { value: 'renewable_energy', label: 'Renewable Energy' },
  { value: 'energy_efficiency', label: 'Energy Efficiency' },
  { value: 'fleet_electrification', label: 'Fleet Electrification' },
  { value: 'renewable_heat', label: 'Renewable Heat' },
  { value: 'carbon_capture', label: 'Carbon Capture' },
  { value: 'waste_reduction', label: 'Waste Reduction' },
  { value: 'supplier_engagement', label: 'Supplier Engagement' },
  { value: 'business_travel_reduction', label: 'Business Travel Reduction' },
  { value: 'remote_work', label: 'Remote Work' },
  { value: 'sustainable_materials', label: 'Sustainable Materials' },
  { value: 'other', label: 'Other' }
];

export const InterventionForm: React.FC<InterventionFormProps> = ({ scenarioId }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    intervention_type: 'renewable_energy',
    name: '',
    description: '',
    implementation_year: new Date().getFullYear() + 1,
    reduction_percentage: 0,
    affected_scope: [] as string[],
    annual_cost: 0,
    one_time_cost: 0,
    roi_years: 0,
    confidence_level: 'medium'
  });

  const handleScopeToggle = (scope: string) => {
    setFormData(prev => ({
      ...prev,
      affected_scope: prev.affected_scope.includes(scope)
        ? prev.affected_scope.filter(s => s !== scope)
        : [...prev.affected_scope, scope]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || formData.affected_scope.length === 0) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('scenario_interventions')
        .insert({
          scenario_id: scenarioId,
          ...formData
        });

      if (error) throw error;

      toast.success('Intervention added');
      setFormData({
        intervention_type: 'renewable_energy',
        name: '',
        description: '',
        implementation_year: new Date().getFullYear() + 1,
        reduction_percentage: 0,
        affected_scope: [],
        annual_cost: 0,
        one_time_cost: 0,
        roi_years: 0,
        confidence_level: 'medium'
      });
    } catch (error: any) {
      toast.error('Failed to add intervention');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Intervention</CardTitle>
        <CardDescription>
          Define actions that will reduce emissions in this scenario
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Intervention Type *</Label>
            <Select value={formData.intervention_type} onValueChange={(value) => setFormData({ ...formData, intervention_type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {interventionTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Intervention Name *</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Install Solar Panels"
            />
          </div>

          <div className="space-y-2">
            <Label>Implementation Year *</Label>
            <Input
              type="number"
              value={formData.implementation_year}
              onChange={(e) => setFormData({ ...formData, implementation_year: parseInt(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>Reduction Percentage (%) *</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.reduction_percentage}
              onChange={(e) => setFormData({ ...formData, reduction_percentage: parseFloat(e.target.value) })}
              placeholder="e.g., 25"
            />
          </div>

          <div className="space-y-2">
            <Label>One-Time Cost ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.one_time_cost}
              onChange={(e) => setFormData({ ...formData, one_time_cost: parseFloat(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>Annual Cost ($)</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.annual_cost}
              onChange={(e) => setFormData({ ...formData, annual_cost: parseFloat(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>ROI (Years)</Label>
            <Input
              type="number"
              step="0.1"
              value={formData.roi_years}
              onChange={(e) => setFormData({ ...formData, roi_years: parseFloat(e.target.value) })}
            />
          </div>

          <div className="space-y-2">
            <Label>Confidence Level</Label>
            <Select value={formData.confidence_level} onValueChange={(value) => setFormData({ ...formData, confidence_level: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Affected Scopes *</Label>
            <div className="flex gap-4">
              {['S1', 'S2', 'S3'].map(scope => (
                <div key={scope} className="flex items-center space-x-2">
                  <Checkbox
                    id={scope}
                    checked={formData.affected_scope.includes(scope)}
                    onCheckedChange={() => handleScopeToggle(scope)}
                  />
                  <label htmlFor={scope} className="text-sm font-medium cursor-pointer">
                    Scope {scope.slice(1)}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the intervention and its expected impact..."
              rows={2}
            />
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={loading} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Intervention
        </Button>
      </CardContent>
    </Card>
  );
};
