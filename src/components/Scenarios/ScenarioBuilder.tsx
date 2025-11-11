import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InterventionList } from './InterventionList';
import { InterventionForm } from './InterventionForm';
import { ScenarioProjection } from './ScenarioProjection';
import { Save, Calculator } from 'lucide-react';
import { toast } from 'sonner';

interface ScenarioBuilderProps {
  scenarioId: string | null;
  onComplete: () => void;
}

export const ScenarioBuilder: React.FC<ScenarioBuilderProps> = ({ scenarioId, onComplete }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentScenarioId, setCurrentScenarioId] = useState<string | null>(scenarioId);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    baseline_year: new Date().getFullYear() - 1,
    target_year: new Date().getFullYear() + 10,
    baseline_emissions: 0,
    status: 'draft'
  });

  useEffect(() => {
    if (scenarioId) {
      loadScenario(scenarioId);
    }
  }, [scenarioId]);

  const loadScenario = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('emission_scenarios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          name: data.name,
          description: data.description || '',
          baseline_year: data.baseline_year,
          target_year: data.target_year,
          baseline_emissions: Number(data.baseline_emissions),
          status: data.status
        });
        setCurrentScenarioId(id);
      }
    } catch (error: any) {
      toast.error('Failed to load scenario');
      console.error(error);
    }
  };

  const handleSaveScenario = async () => {
    try {
      setLoading(true);

      if (currentScenarioId) {
        // Update existing
        const { error } = await supabase
          .from('emission_scenarios')
          .update(formData)
          .eq('id', currentScenarioId);

        if (error) throw error;
        toast.success('Scenario updated');
      } else {
        // Create new
        const { data, error } = await supabase
          .from('emission_scenarios')
          .insert({
            ...formData,
            user_id: user?.id
          })
          .select()
          .single();

        if (error) throw error;
        setCurrentScenarioId(data.id);
        toast.success('Scenario created');
      }
    } catch (error: any) {
      toast.error('Failed to save scenario');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scenario Details</CardTitle>
          <CardDescription>
            Define the baseline and target for your emission reduction scenario
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Scenario Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Net Zero 2030"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Baseline Year *</Label>
              <Input
                type="number"
                value={formData.baseline_year}
                onChange={(e) => setFormData({ ...formData, baseline_year: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Target Year *</Label>
              <Input
                type="number"
                value={formData.target_year}
                onChange={(e) => setFormData({ ...formData, target_year: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Baseline Emissions (tCO₂e) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.baseline_emissions}
                onChange={(e) => setFormData({ ...formData, baseline_emissions: parseFloat(e.target.value) })}
                placeholder="e.g., 1000"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the scenario and its objectives..."
                rows={3}
              />
            </div>
          </div>

          <Button onClick={handleSaveScenario} disabled={loading || !formData.name} className="gap-2">
            <Save className="h-4 w-4" />
            {currentScenarioId ? 'Update Scenario' : 'Save Scenario'}
          </Button>
        </CardContent>
      </Card>

      {currentScenarioId && (
        <>
          <InterventionForm scenarioId={currentScenarioId} />
          <InterventionList scenarioId={currentScenarioId} />
          <ScenarioProjection 
            scenarioId={currentScenarioId}
            baselineYear={formData.baseline_year}
            targetYear={formData.target_year}
            baselineEmissions={formData.baseline_emissions}
          />
        </>
      )}
    </div>
  );
};
