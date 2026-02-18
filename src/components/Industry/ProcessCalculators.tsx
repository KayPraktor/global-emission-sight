import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Calculator, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Parser } from 'expr-eval';

interface ProcessCalculator {
  id: string;
  industry: string;
  sub_industry: string | null;
  calculator_name: string;
  calculator_key: string;
  description: string | null;
  input_fields: InputField[];
  formula: string;
  output_unit: string;
}

interface InputField {
  name: string;
  label: string;
  type: 'number' | 'select';
  default?: number;
  options?: string[];
}

interface CalculatorState {
  [key: string]: number | string;
}

export function ProcessCalculators() {
  const { organization } = useAuth();
  const [calculators, setCalculators] = useState<ProcessCalculator[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCalculator, setSelectedCalculator] = useState<ProcessCalculator | null>(null);
  const [inputs, setInputs] = useState<CalculatorState>({});
  const [result, setResult] = useState<number | null>(null);
  const [orgIndustry, setOrgIndustry] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrgIndustry = async () => {
      if (!organization?.id) return;
      
      const { data } = await supabase
        .from('organizations')
        .select('industry, sub_industry')
        .eq('id', organization.id)
        .single();
      
      if (data?.industry) {
        setOrgIndustry(data.industry);
      }
    };
    
    fetchOrgIndustry();
  }, [organization]);

  useEffect(() => {
    const fetchCalculators = async () => {
      setLoading(true);
      let query = supabase
        .from('process_calculators')
        .select('*')
        .order('industry')
        .order('calculator_name');

      // If org has industry, prioritize those calculators
      if (orgIndustry) {
        query = query.eq('industry', orgIndustry);
      }

      const { data, error } = await query;
      if (!error && data) {
        // Parse input_fields from JSON
        const parsedData = data.map(calc => ({
          ...calc,
          input_fields: typeof calc.input_fields === 'string' 
            ? JSON.parse(calc.input_fields) 
            : calc.input_fields
        }));
        setCalculators(parsedData);
        if (parsedData.length > 0 && !selectedCalculator) {
          selectCalculator(parsedData[0]);
        }
      }
      setLoading(false);
    };

    fetchCalculators();
  }, [orgIndustry]);

  const selectCalculator = (calc: ProcessCalculator) => {
    setSelectedCalculator(calc);
    setResult(null);
    
    // Initialize inputs with defaults
    const defaultInputs: CalculatorState = {};
    calc.input_fields.forEach(field => {
      if (field.default !== undefined) {
        defaultInputs[field.name] = field.default;
      } else if (field.type === 'select' && field.options) {
        defaultInputs[field.name] = field.options[0];
      } else {
        defaultInputs[field.name] = 0;
      }
    });
    setInputs(defaultInputs);
  };

  const handleInputChange = (name: string, value: string | number) => {
    setInputs(prev => ({ ...prev, [name]: value }));
    setResult(null);
  };

  const calculateResult = () => {
    if (!selectedCalculator) return;

    try {
      // Build calculation context with input values
      let formula = selectedCalculator.formula;
      
      // Replace input variables with values
      Object.entries(inputs).forEach(([key, value]) => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        formula = formula.replace(regex, String(value));
      });

      // Handle special pathway factors for steel calculator
      if (formula.includes('pathway_factor')) {
        let pathwayFactor = 1850; // default BF-BOF
        if (inputs.pathway === 'eaf_scrap') pathwayFactor = 580;
        if (inputs.pathway === 'eaf_dri') pathwayFactor = 1200;
        formula = formula.replace(/pathway_factor/g, String(pathwayFactor));
      }

      // Handle feedstock factors for ammonia
      if (formula.includes('feedstock_factor')) {
        let feedstockFactor = 1870; // natural gas
        if (inputs.feedstock === 'coal') feedstockFactor = 2400;
        if (inputs.feedstock === 'green_hydrogen') feedstockFactor = 50;
        formula = formula.replace(/feedstock_factor/g, String(feedstockFactor));
      }

      // Handle fuel factors for power plant
      if (formula.includes('fuel_factor')) {
        let fuelFactor = 350; // ngcc
        if (inputs.fuel_type === 'natural_gas_sc') fuelFactor = 500;
        if (inputs.fuel_type === 'coal_sub') fuelFactor = 1000;
        if (inputs.fuel_type === 'coal_super') fuelFactor = 850;
        formula = formula.replace(/fuel_factor/g, String(fuelFactor));
        formula = formula.replace(/baseline_efficiency/g, '45');
      }

      // Evaluate the formula safely using expr-eval (no eval())
      const parser = new Parser();
      const calculatedResult = parser.evaluate(formula);
      setResult(Math.round(calculatedResult * 100) / 100);
    } catch (error) {
      console.error('Calculation error:', error);
      setResult(null);
    }
  };

  const formatIndustryName = (industry: string) => {
    return industry.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (calculators.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Process Calculators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No process calculators available for your industry yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Process Calculators
        </CardTitle>
        <CardDescription>
          Industry-specific emission calculators for complex processes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calculator Selector */}
        <div className="flex flex-wrap gap-2">
          {calculators.map((calc) => (
            <Button
              key={calc.id}
              variant={selectedCalculator?.id === calc.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => selectCalculator(calc)}
            >
              {calc.calculator_name}
            </Button>
          ))}
        </div>

        {selectedCalculator && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Input Form */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedCalculator.calculator_name}</h3>
                <p className="text-sm text-muted-foreground">{selectedCalculator.description}</p>
                <Badge variant="secondary" className="mt-2">
                  {formatIndustryName(selectedCalculator.industry)}
                  {selectedCalculator.sub_industry && ` / ${selectedCalculator.sub_industry.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`}
                </Badge>
              </div>

              {selectedCalculator.input_fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  {field.type === 'select' ? (
                    <Select 
                      value={String(inputs[field.name] || '')} 
                      onValueChange={(v) => handleInputChange(field.name, v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map(opt => (
                          <SelectItem key={opt} value={opt}>
                            {opt.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={field.name}
                      type="number"
                      value={inputs[field.name] || ''}
                      onChange={(e) => handleInputChange(field.name, parseFloat(e.target.value) || 0)}
                    />
                  )}
                </div>
              ))}

              <Button onClick={calculateResult} className="w-full">
                Calculate
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Result */}
            <div className="flex items-center justify-center">
              <Card className="w-full bg-muted/50">
                <CardContent className="pt-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Calculated Emissions</p>
                  {result !== null ? (
                    <>
                      <p className="text-4xl font-bold text-primary">
                        {result.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedCalculator.output_unit}
                      </p>
                    </>
                  ) : (
                    <p className="text-2xl text-muted-foreground">
                      Enter values and click calculate
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
