import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Calculator, Plus, Trash2, ArrowLeft, ArrowRight, Sparkles, TrendingUp, Factory, Lightbulb } from "lucide-react";
import { EmissionsFormData } from '../EmissionsWizard';
import { IndustryWorkflow } from '@/data/industryWorkflows';
import { supabase } from '@/integrations/supabase/client';

interface IndustryEmissionFactor {
  id: string;
  name: string;
  category: string;
  scope: string;
  factor_value: number;
  unit: string;
  source: string;
  activity_type: string;
  methodology?: string;
}

interface IndustryAwareCalculationsProps {
  formData: EmissionsFormData;
  updateFormData: (data: Partial<EmissionsFormData>) => void;
  industryStepData: Record<string, Record<string, string | number>>;
  workflow: IndustryWorkflow | null;
  organizationIndustry: string | null;
  organizationSubIndustry: string | null;
  nextStep: () => void;
  prevStep: () => void;
}

export const IndustryAwareCalculations: React.FC<IndustryAwareCalculationsProps> = ({
  formData,
  updateFormData,
  industryStepData,
  workflow,
  organizationIndustry,
  organizationSubIndustry,
  nextStep,
  prevStep,
}) => {
  const [industryFactors, setIndustryFactors] = useState<IndustryEmissionFactor[]>([]);
  const [standardFactors, setStandardFactors] = useState<IndustryEmissionFactor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchEmissionFactors();
  }, [organizationIndustry, organizationSubIndustry]);

  const fetchEmissionFactors = async () => {
    setLoading(true);
    try {
      // Fetch industry-specific emission factors
      if (organizationIndustry) {
        let query = supabase
          .from('industry_emission_factors')
          .select('*')
          .eq('industry', organizationIndustry);
        
        if (organizationSubIndustry) {
          query = query.or(`sub_industry.eq.${organizationSubIndustry},sub_industry.is.null`);
        }
        
        const { data: industryData } = await query.order('category');
        if (industryData) {
          setIndustryFactors(industryData);
        }
      }

      // Fetch standard emission factors
      const { data: standardData } = await supabase
        .from('emission_factors')
        .select('*')
        .is('user_id', null)
        .eq('is_latest', true)
        .order('category');
      
      if (standardData) {
        setStandardFactors(standardData.map(f => ({
          id: f.id,
          name: f.name,
          category: f.category,
          scope: f.scope,
          factor_value: f.factor_value,
          unit: f.unit,
          source: f.source,
          activity_type: f.category,
          methodology: f.methodology || undefined,
        })));
      }
    } catch (error) {
      console.error('Error fetching emission factors:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get suggested factors based on workflow
  const getSuggestedFactors = () => {
    if (!workflow) return [];
    
    const allSuggestedCategories = workflow.steps.flatMap(
      step => step.suggestedFactorCategories || []
    );
    
    return industryFactors.filter(factor => 
      allSuggestedCategories.some(cat => 
        factor.category.toLowerCase().includes(cat.toLowerCase()) ||
        factor.activity_type.toLowerCase().includes(cat.toLowerCase())
      )
    );
  };

  const suggestedFactors = getSuggestedFactors();

  // Get categories for filtering
  const categories = ['all', ...new Set([
    ...industryFactors.map(f => f.category),
    ...standardFactors.map(f => f.category)
  ])];

  const filteredFactors = selectedCategory === 'all'
    ? [...industryFactors, ...standardFactors]
    : [...industryFactors, ...standardFactors].filter(f => f.category === selectedCategory);

  const addEmissionFactor = () => {
    updateFormData({
      emissionFactors: [
        ...formData.emissionFactors,
        { source: '', factor: 0, unit: 'kgCO2e/unit', methodology: '' }
      ]
    });
  };

  const removeEmissionFactor = (index: number) => {
    updateFormData({
      emissionFactors: formData.emissionFactors.filter((_, i) => i !== index)
    });
  };

  const updateEmissionFactor = (index: number, field: string, value: string | number) => {
    const updated = formData.emissionFactors.map((ef, i) => 
      i === index ? { ...ef, [field]: value } : ef
    );
    updateFormData({ emissionFactors: updated });
  };

  const selectFactor = (factor: IndustryEmissionFactor) => {
    updateFormData({
      emissionFactors: [
        ...formData.emissionFactors,
        {
          source: factor.name,
          factor: factor.factor_value,
          unit: factor.unit,
          methodology: factor.methodology || factor.source
        }
      ]
    });
  };

  // Calculate estimated emissions from industry step data
  const calculateEstimatedEmissions = () => {
    let totalEmissions = 0;
    
    // Match industry step data with selected emission factors
    formData.emissionFactors.forEach(ef => {
      if (ef.factor > 0) {
        // Try to find matching activity in industry step data
        Object.values(industryStepData).forEach(stepData => {
          Object.entries(stepData).forEach(([key, value]) => {
            if (typeof value === 'number' && value > 0) {
              // Simple heuristic: if factor source matches the field name
              if (ef.source.toLowerCase().includes(key.replace(/_/g, ' '))) {
                totalEmissions += value * ef.factor;
              }
            }
          });
        });
      }
    });
    
    return totalEmissions;
  };

  const estimatedEmissions = calculateEstimatedEmissions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Emission Calculations
        </CardTitle>
        <CardDescription>
          Select emission factors for your activities. 
          {workflow && workflow.id !== 'generic' && (
            <span className="text-primary"> Industry-specific factors for {workflow.name} are highlighted.</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Suggested Factors for Industry */}
        {suggestedFactors.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Recommended for {workflow?.name}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {suggestedFactors.slice(0, 6).map((factor) => (
                <div
                  key={factor.id}
                  className="p-3 border border-primary/30 bg-primary/5 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => selectFactor(factor)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{factor.name}</div>
                      <div className="text-xs text-muted-foreground">{factor.category}</div>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {factor.scope}
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-mono">{factor.factor_value}</span>
                    <span className="text-xs text-muted-foreground">{factor.unit}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="w-full mt-2 h-7 text-xs">
                    <Plus className="h-3 w-3 mr-1" /> Use this factor
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Available Factors */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <Factory className="h-4 w-4" />
              All Emission Factors
            </h3>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[200px] border rounded-lg p-3">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filteredFactors.map((factor) => (
                  <div
                    key={factor.id}
                    className="p-2 border rounded cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-between"
                    onClick={() => selectFactor(factor)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{factor.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {factor.factor_value} {factor.unit}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs ml-2">
                      {factor.scope}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Selected Emission Factors */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Selected Emission Factors</h3>
            <Button variant="outline" size="sm" onClick={addEmissionFactor}>
              <Plus className="h-4 w-4 mr-1" />
              Add Custom
            </Button>
          </div>

          {formData.emissionFactors.length === 0 ? (
            <Alert>
              <Lightbulb className="h-4 w-4" />
              <AlertDescription>
                Click on emission factors above to add them to your calculation, or add a custom factor.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {formData.emissionFactors.map((ef, index) => (
                <div key={index} className="p-3 border rounded-lg grid grid-cols-4 gap-3 items-end">
                  <div className="col-span-2">
                    <Label className="text-xs">Source/Activity</Label>
                    <Input
                      value={ef.source}
                      onChange={(e) => updateEmissionFactor(index, 'source', e.target.value)}
                      placeholder="e.g., Natural Gas Combustion"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Factor</Label>
                    <Input
                      type="number"
                      value={ef.factor}
                      onChange={(e) => updateEmissionFactor(index, 'factor', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label className="text-xs">Unit</Label>
                      <Input
                        value={ef.unit}
                        onChange={(e) => updateEmissionFactor(index, 'unit', e.target.value)}
                        placeholder="kgCO2e/unit"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEmissionFactor(index)}
                      className="self-end text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calculation Methodology */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="methodology">Calculation Methodology</Label>
            <Textarea
              id="methodology"
              value={formData.calculationMethodology}
              onChange={(e) => updateFormData({ calculationMethodology: e.target.value })}
              placeholder="Describe the methodology used for emission calculations (e.g., GHG Protocol, EPA methodology)"
              rows={3}
            />
          </div>

          <div>
            <Label>Overall Uncertainty Range (%)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[formData.uncertaintyRange]}
                onValueChange={([value]) => updateFormData({ uncertaintyRange: value })}
                max={50}
                step={1}
                className="flex-1"
              />
              <span className="w-16 text-right font-mono">±{formData.uncertaintyRange}%</span>
            </div>
          </div>
        </div>

        {/* Estimated Emissions Preview */}
        {formData.emissionFactors.length > 0 && estimatedEmissions > 0 && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span className="font-medium">Estimated Total Emissions</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {estimatedEmissions.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    kgCO2e (±{formData.uncertaintyRange}%)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={prevStep} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button onClick={nextStep} className="gap-2">
            Continue to Data Quality
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
