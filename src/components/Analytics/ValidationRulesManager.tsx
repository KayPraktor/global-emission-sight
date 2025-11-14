import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Loader2 } from 'lucide-react';

interface ValidationRule {
  id: string;
  rule_name: string;
  rule_type: string;
  severity: string;
  condition: any;
  error_message: string;
  is_active: boolean;
}

export const ValidationRulesManager: React.FC = () => {
  const { user, organization } = useAuth();
  const [rules, setRules] = useState<ValidationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    rule_name: '',
    rule_type: 'field',
    severity: 'warning',
    field: '',
    min: '',
    max: '',
    error_message: '',
  });

  useEffect(() => {
    if (organization?.id) {
      loadRules();
    }
  }, [organization]);

  const loadRules = async () => {
    if (!organization) return;

    try {
      const { data, error } = await supabase
        .from('validation_rules')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error loading rules:', error);
      toast.error('Failed to load validation rules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async () => {
    if (!organization || !user) return;

    try {
      const condition: any = { field: formData.field };
      if (formData.min) condition.min = parseFloat(formData.min);
      if (formData.max) condition.max = parseFloat(formData.max);

      const { error } = await supabase
        .from('validation_rules')
        .insert({
          organization_id: organization.id,
          rule_name: formData.rule_name,
          rule_type: formData.rule_type,
          severity: formData.severity,
          condition,
          error_message: formData.error_message,
        });

      if (error) throw error;

      toast.success('Validation rule created');
      setShowForm(false);
      setFormData({
        rule_name: '',
        rule_type: 'field',
        severity: 'warning',
        field: '',
        min: '',
        max: '',
        error_message: '',
      });
      loadRules();
    } catch (error) {
      console.error('Error creating rule:', error);
      toast.error('Failed to create validation rule');
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('validation_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId);

      if (error) throw error;

      setRules(rules.map(r => r.id === ruleId ? { ...r, is_active: isActive } : r));
      toast.success(`Rule ${isActive ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast.error('Failed to update rule');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const { error } = await supabase
        .from('validation_rules')
        .delete()
        .eq('id', ruleId);

      if (error) throw error;

      setRules(rules.filter(r => r.id !== ruleId));
      toast.success('Rule deleted');
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Failed to delete rule');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Validation Rules</CardTitle>
            <CardDescription>
              Configure custom validation rules for your data
            </CardDescription>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="p-4 border rounded-lg space-y-3 bg-accent/50">
            <div className="space-y-2">
              <Label>Rule Name</Label>
              <Input
                value={formData.rule_name}
                onChange={(e) => setFormData({ ...formData, rule_name: e.target.value })}
                placeholder="e.g., Maximum Electricity Consumption"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Rule Type</Label>
                <Select
                  value={formData.rule_type}
                  onValueChange={(value) => setFormData({ ...formData, rule_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="field">Field Validation</SelectItem>
                    <SelectItem value="business_logic">Business Logic</SelectItem>
                    <SelectItem value="consistency">Consistency Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Severity</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => setFormData({ ...formData, severity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Field Name</Label>
              <Input
                value={formData.field}
                onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                placeholder="e.g., quantity"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Minimum Value (optional)</Label>
                <Input
                  type="number"
                  value={formData.min}
                  onChange={(e) => setFormData({ ...formData, min: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Maximum Value (optional)</Label>
                <Input
                  type="number"
                  value={formData.max}
                  onChange={(e) => setFormData({ ...formData, max: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Error Message</Label>
              <Input
                value={formData.error_message}
                onChange={(e) => setFormData({ ...formData, error_message: e.target.value })}
                placeholder="e.g., Quantity exceeds maximum allowed value"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreateRule}>Create Rule</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {rules.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No validation rules configured yet
            </p>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <h4 className="font-medium">{rule.rule_name}</h4>
                  <p className="text-sm text-muted-foreground">{rule.error_message}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs px-2 py-1 rounded bg-accent">
                      {rule.rule_type}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-accent">
                      {rule.severity}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={rule.is_active}
                    onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRule(rule.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
