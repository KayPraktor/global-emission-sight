import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TornadoChart } from './TornadoChart';
import { 
  getDefaultParameters, 
  generateTornadoData, 
  generateScenarioMatrix,
  calculateNetBenefit,
  type SensitivityParameter,
  type TornadoDataPoint,
  type ScenarioMatrixCell,
  type InterventionData,
  type MultiParameterResult
} from '@/services/sensitivityAnalysisService';
import { TrendingUp, TrendingDown, DollarSign, Clock, Target, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface MultiParameterSensitivityProps {
  scenarioId: string;
  baselineYear: number;
  targetYear: number;
  baselineEmissions: number;
}

export const MultiParameterSensitivity: React.FC<MultiParameterSensitivityProps> = ({
  scenarioId,
  baselineYear,
  targetYear,
  baselineEmissions
}) => {
  const [parameters, setParameters] = useState<SensitivityParameter[]>(getDefaultParameters(baselineEmissions));
  const [interventions, setInterventions] = useState<InterventionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [tornadoData, setTornadoData] = useState<TornadoDataPoint[]>([]);
  const [baseResult, setBaseResult] = useState<MultiParameterResult | null>(null);
  const [matrixParam1, setMatrixParam1] = useState('carbon_price');
  const [matrixParam2, setMatrixParam2] = useState('intervention_effectiveness');
  const [matrixData, setMatrixData] = useState<ScenarioMatrixCell[]>([]);
  const [activeTab, setActiveTab] = useState('tornado');

  useEffect(() => {
    if (scenarioId) {
      loadInterventions();
    }
  }, [scenarioId]);

  useEffect(() => {
    if (interventions.length > 0) {
      runAnalysis();
    }
  }, [interventions, parameters]);

  useEffect(() => {
    if (interventions.length > 0) {
      generateMatrix();
    }
  }, [interventions, matrixParam1, matrixParam2, parameters]);

  const loadInterventions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('scenario_interventions')
        .select('*')
        .eq('scenario_id', scenarioId)
        .eq('is_active', true);

      if (error) throw error;

      const mapped: InterventionData[] = (data || []).map((i: any) => ({
        reduction_percentage: Number(i.reduction_percentage) || 0,
        one_time_cost: Number(i.one_time_cost) || 0,
        annual_cost: Number(i.annual_cost) || 0,
        annual_savings: Number(i.annual_savings) || 0,
        implementation_year: Number(i.implementation_year) || baselineYear
      }));

      // If no interventions, add demo data
      if (mapped.length === 0) {
        mapped.push(
          { reduction_percentage: 15, one_time_cost: 50000, annual_cost: 5000, annual_savings: 20000, implementation_year: baselineYear },
          { reduction_percentage: 10, one_time_cost: 30000, annual_cost: 3000, annual_savings: 12000, implementation_year: baselineYear + 1 },
          { reduction_percentage: 8, one_time_cost: 25000, annual_cost: 2000, annual_savings: 8000, implementation_year: baselineYear + 2 }
        );
      }

      setInterventions(mapped);
    } catch (error: any) {
      console.error('Failed to load interventions:', error);
      toast.error('Failed to load interventions');
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = () => {
    const baseParams: Record<string, number> = {};
    parameters.forEach(p => {
      baseParams[p.id] = p.baseValue;
    });

    const result = calculateNetBenefit(interventions, baselineEmissions, baselineYear, targetYear, baseParams);
    setBaseResult(result);

    const tornado = generateTornadoData(interventions, baselineEmissions, baselineYear, targetYear, parameters);
    setTornadoData(tornado);
  };

  const generateMatrix = () => {
    const param1 = parameters.find(p => p.id === matrixParam1);
    const param2 = parameters.find(p => p.id === matrixParam2);
    
    if (!param1 || !param2) return;

    const baseParams: Record<string, number> = {};
    parameters.forEach(p => {
      baseParams[p.id] = p.baseValue;
    });

    const matrix = generateScenarioMatrix(
      interventions,
      baselineEmissions,
      baselineYear,
      targetYear,
      param1,
      param2,
      baseParams,
      6
    );
    setMatrixData(matrix);
  };

  const updateParameter = (id: string, field: 'lowValue' | 'highValue', value: number) => {
    setParameters(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  // Memoize the matrix grid for performance
  const matrixGrid = useMemo(() => {
    if (matrixData.length === 0) return null;

    const param1 = parameters.find(p => p.id === matrixParam1);
    const param2 = parameters.find(p => p.id === matrixParam2);
    if (!param1 || !param2) return null;

    const gridSize = 7; // 7x7 grid
    const cells: JSX.Element[] = [];

    for (let j = gridSize - 1; j >= 0; j--) {
      for (let i = 0; i < gridSize; i++) {
        const cellIndex = i * gridSize + j;
        const cell = matrixData[cellIndex];
        if (cell) {
          const opacity = cell.outcome > 0 ? 0.8 : 0.6;
          cells.push(
            <div
              key={`${i}-${j}`}
              className="aspect-square flex items-center justify-center text-xs font-medium rounded"
              style={{ 
                backgroundColor: cell.color,
                opacity
              }}
              title={`${param1.name}: ${cell.param1Value.toFixed(0)}, ${param2.name}: ${cell.param2Value.toFixed(0)} → ${formatCurrency(cell.outcome)}`}
            >
              {Math.abs(cell.outcome) >= 1000 
                ? `${(cell.outcome / 1000).toFixed(0)}K`
                : cell.outcome.toFixed(0)}
            </div>
          );
        }
      }
    }

    return (
      <div className="grid grid-cols-7 gap-1" style={{ direction: 'ltr' }}>
        {cells}
      </div>
    );
  }, [matrixData, matrixParam1, matrixParam2, parameters]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Loading sensitivity analysis...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {baseResult && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-chart-2" />
                <span className="text-sm font-medium">Net Benefit</span>
              </div>
              <div className={`text-2xl font-bold ${baseResult.netBenefit >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                {formatCurrency(baseResult.netBenefit)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Over {targetYear - baselineYear} years
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Total Reduction</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {baseResult.totalEmissionsReduced.toFixed(0)} tCO₂e
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Cumulative emissions avoided
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-chart-4" />
                <span className="text-sm font-medium">ROI</span>
              </div>
              <div className={`text-2xl font-bold ${baseResult.roi >= 0 ? 'text-chart-2' : 'text-destructive'}`}>
                {baseResult.roi.toFixed(0)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Return on investment
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-chart-3" />
                <span className="text-sm font-medium">Payback Period</span>
              </div>
              <div className="text-2xl font-bold text-foreground">
                {baseResult.paybackYears < 99 ? `${baseResult.paybackYears.toFixed(1)} yrs` : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Time to recover costs
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="tornado">Tornado Diagram</TabsTrigger>
          <TabsTrigger value="matrix">Scenario Matrix</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
        </TabsList>

        <TabsContent value="tornado" className="mt-6">
          <TornadoChart 
            data={tornadoData} 
            baseValue={baseResult?.netBenefit || 0}
            title="Parameter Sensitivity Ranking"
            description="Impact of each parameter on net benefit (ranked by sensitivity)"
          />

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tornadoData.slice(0, 3).map((item, idx) => (
                  <div key={item.parameterId} className="flex items-start gap-3">
                    <Badge variant={idx === 0 ? 'default' : 'secondary'} className="mt-0.5">
                      #{idx + 1}
                    </Badge>
                    <div>
                      <p className="font-medium text-foreground">{item.parameter}</p>
                      <p className="text-sm text-muted-foreground">
                        Varying from {item.lowLabel} to {item.highLabel} changes net benefit by{' '}
                        <span className="font-medium">{formatCurrency(item.spread)}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matrix" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Two-Parameter Interaction Matrix</CardTitle>
              <CardDescription>
                Explore how combinations of two parameters affect outcomes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>X-Axis Parameter</Label>
                  <Select value={matrixParam1} onValueChange={setMatrixParam1}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {parameters.map(p => (
                        <SelectItem key={p.id} value={p.id} disabled={p.id === matrixParam2}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Y-Axis Parameter</Label>
                  <Select value={matrixParam2} onValueChange={setMatrixParam2}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {parameters.map(p => (
                        <SelectItem key={p.id} value={p.id} disabled={p.id === matrixParam1}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground whitespace-nowrap">
                  {parameters.find(p => p.id === matrixParam2)?.name} →
                </div>
                <div className="ml-8">
                  {matrixGrid}
                </div>
                <div className="text-center text-xs text-muted-foreground mt-2">
                  {parameters.find(p => p.id === matrixParam1)?.name} →
                </div>
              </div>

              <div className="flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--destructive))' }} />
                  <span className="text-muted-foreground">Low Benefit</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--primary))' }} />
                  <span className="text-muted-foreground">Medium</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
                  <span className="text-muted-foreground">High Benefit</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parameters" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Customize Parameter Ranges</CardTitle>
              <CardDescription>
                Adjust the low and high values for each parameter to test different scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {parameters.map(param => (
                <div key={param.id} className="space-y-4 pb-4 border-b border-border last:border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">{param.name}</Label>
                      <p className="text-sm text-muted-foreground">
                        Base: {param.baseValue}{param.unit === '%' ? '%' : ` ${param.unit}`}
                      </p>
                    </div>
                    <Badge variant="outline">{param.category}</Badge>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Low Value</span>
                        <span className="font-medium">{param.lowValue}{param.unit === '%' ? '%' : ` ${param.unit}`}</span>
                      </div>
                      <Slider
                        value={[param.lowValue]}
                        onValueChange={([val]) => updateParameter(param.id, 'lowValue', val)}
                        min={param.id === 'timeline_delay' ? 0 : param.baseValue * 0.2}
                        max={param.baseValue}
                        step={param.id === 'timeline_delay' ? 0.5 : 5}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">High Value</span>
                        <span className="font-medium">{param.highValue}{param.unit === '%' ? '%' : ` ${param.unit}`}</span>
                      </div>
                      <Slider
                        value={[param.highValue]}
                        onValueChange={([val]) => updateParameter(param.id, 'highValue', val)}
                        min={param.baseValue}
                        max={param.id === 'timeline_delay' ? 5 : param.baseValue * 2}
                        step={param.id === 'timeline_delay' ? 0.5 : 5}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
