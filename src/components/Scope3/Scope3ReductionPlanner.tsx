import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Trash2, 
  TrendingDown, 
  Calculator,
  Target,
  Building2,
  Leaf,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { supplierService, Supplier } from '@/services/supplierService';
import { scope3Service } from '@/services/scope3Service';

interface SupplierIntervention {
  id: string;
  supplierId: string;
  supplierName: string;
  interventionType: 'sbt_commitment' | 'renewable_energy' | 'efficiency' | 'material_switch' | 'engagement' | 'custom';
  targetReduction: number; // percentage
  implementationYear: number;
  fullEffectYear: number;
  estimatedCost: number;
  currentEmissions: number;
  isExpanded: boolean;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  baselineYear: number;
  targetYear: number;
  baselineEmissions: number;
  interventions: SupplierIntervention[];
}

const interventionTypes = [
  { value: 'sbt_commitment', label: 'Science-Based Target Commitment', avgReduction: 25 },
  { value: 'renewable_energy', label: 'Renewable Energy Transition', avgReduction: 30 },
  { value: 'efficiency', label: 'Energy Efficiency Improvements', avgReduction: 15 },
  { value: 'material_switch', label: 'Low-Carbon Material Switch', avgReduction: 20 },
  { value: 'engagement', label: 'Supplier Engagement Program', avgReduction: 10 },
  { value: 'custom', label: 'Custom Intervention', avgReduction: 0 },
];

const costEstimates: Record<string, number> = {
  'sbt_commitment': 5000,
  'renewable_energy': 25000,
  'efficiency': 15000,
  'material_switch': 20000,
  'engagement': 3000,
  'custom': 10000,
};

export function Scope3ReductionPlanner() {
  const { organization } = useAuth();
  const currentYear = new Date().getFullYear();
  
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: '1',
      name: 'Baseline Scenario',
      description: 'Business as usual with no additional interventions',
      baselineYear: currentYear,
      targetYear: 2030,
      baselineEmissions: 0,
      interventions: [],
    }
  ]);
  const [activeScenarioId, setActiveScenarioId] = useState('1');
  const [showAddIntervention, setShowAddIntervention] = useState(false);

  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers', organization?.id],
    queryFn: () => organization?.id ? supplierService.getSuppliers(organization.id) : Promise.resolve([]),
    enabled: !!organization?.id,
  });

  const { data: scope3Totals } = useQuery({
    queryKey: ['scope3-totals', organization?.id, currentYear],
    queryFn: () => organization?.id 
      ? scope3Service.getTotalScope3Emissions(organization.id, currentYear) 
      : Promise.resolve({ total: 0, upstream: 0, downstream: 0 }),
    enabled: !!organization?.id,
  });

  // Initialize baseline emissions
  useMemo(() => {
    if (scope3Totals?.total && scenarios[0].baselineEmissions === 0) {
      setScenarios(prev => prev.map(s => ({
        ...s,
        baselineEmissions: scope3Totals.total || 50000 // Default sample data
      })));
    }
  }, [scope3Totals]);

  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];
  const baselineEmissions = activeScenario.baselineEmissions || 50000;

  // Calculate projected emissions over time
  const projectionData = useMemo(() => {
    const data = [];
    const years = activeScenario.targetYear - activeScenario.baselineYear + 1;
    
    for (let i = 0; i < years; i++) {
      const year = activeScenario.baselineYear + i;
      let emissions = baselineEmissions;
      let reductionFromInterventions = 0;

      activeScenario.interventions.forEach(intervention => {
        if (year >= intervention.implementationYear) {
          const yearsActive = year - intervention.implementationYear;
          const yearsToFullEffect = intervention.fullEffectYear - intervention.implementationYear;
          const effectProgress = Math.min(1, yearsToFullEffect > 0 ? yearsActive / yearsToFullEffect : 1);
          const reductionAmount = (intervention.currentEmissions * (intervention.targetReduction / 100)) * effectProgress;
          reductionFromInterventions += reductionAmount;
        }
      });

      const projectedEmissions = Math.max(0, emissions - reductionFromInterventions);
      
      data.push({
        year,
        baseline: baselineEmissions,
        projected: Math.round(projectedEmissions),
        reduction: Math.round(reductionFromInterventions),
        reductionPercent: ((reductionFromInterventions / baselineEmissions) * 100).toFixed(1),
      });
    }
    
    return data;
  }, [activeScenario, baselineEmissions]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const totalReduction = activeScenario.interventions.reduce(
      (sum, i) => sum + (i.currentEmissions * (i.targetReduction / 100)), 0
    );
    const totalCost = activeScenario.interventions.reduce((sum, i) => sum + i.estimatedCost, 0);
    const finalEmissions = projectionData[projectionData.length - 1]?.projected || baselineEmissions;
    const reductionPercent = ((baselineEmissions - finalEmissions) / baselineEmissions) * 100;
    const costPerTonne = totalReduction > 0 ? totalCost / totalReduction : 0;
    const suppliersEngaged = new Set(activeScenario.interventions.map(i => i.supplierId)).size;

    return {
      totalReduction: Math.round(totalReduction),
      totalCost,
      finalEmissions: Math.round(finalEmissions),
      reductionPercent: reductionPercent.toFixed(1),
      costPerTonne: Math.round(costPerTonne),
      suppliersEngaged,
      interventionCount: activeScenario.interventions.length,
    };
  }, [activeScenario, projectionData, baselineEmissions]);

  const addScenario = () => {
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: `Scenario ${scenarios.length + 1}`,
      description: '',
      baselineYear: currentYear,
      targetYear: 2030,
      baselineEmissions: baselineEmissions,
      interventions: [],
    };
    setScenarios([...scenarios, newScenario]);
    setActiveScenarioId(newScenario.id);
  };

  const addIntervention = (supplierId: string, interventionType: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    const typeInfo = interventionTypes.find(t => t.value === interventionType);
    
    // Estimate supplier emissions (using spend as proxy if no actual data)
    const estimatedEmissions = supplier?.annual_spend 
      ? supplier.annual_spend * 0.0003 // ~0.3 kg CO2e per dollar
      : 5000;

    const newIntervention: SupplierIntervention = {
      id: Date.now().toString(),
      supplierId,
      supplierName: supplier?.name || 'Unknown',
      interventionType: interventionType as SupplierIntervention['interventionType'],
      targetReduction: typeInfo?.avgReduction || 15,
      implementationYear: currentYear + 1,
      fullEffectYear: currentYear + 3,
      estimatedCost: costEstimates[interventionType] || 10000,
      currentEmissions: estimatedEmissions,
      isExpanded: false,
    };

    setScenarios(prev => prev.map(s => 
      s.id === activeScenarioId 
        ? { ...s, interventions: [...s.interventions, newIntervention] }
        : s
    ));
    setShowAddIntervention(false);
  };

  const updateIntervention = (interventionId: string, updates: Partial<SupplierIntervention>) => {
    setScenarios(prev => prev.map(s => 
      s.id === activeScenarioId 
        ? {
            ...s,
            interventions: s.interventions.map(i => 
              i.id === interventionId ? { ...i, ...updates } : i
            )
          }
        : s
    ));
  };

  const removeIntervention = (interventionId: string) => {
    setScenarios(prev => prev.map(s => 
      s.id === activeScenarioId 
        ? { ...s, interventions: s.interventions.filter(i => i.id !== interventionId) }
        : s
    ));
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {scenarios.map(scenario => (
            <Button
              key={scenario.id}
              variant={activeScenarioId === scenario.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveScenarioId(scenario.id)}
            >
              {scenario.name}
            </Button>
          ))}
          <Button variant="ghost" size="sm" onClick={addScenario}>
            <Plus className="h-4 w-4 mr-1" />
            Add Scenario
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Projected Reduction</p>
                <p className="text-2xl font-bold text-green-600">
                  {summaryMetrics.reductionPercent}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatNumber(summaryMetrics.totalReduction)} tCO₂e
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Suppliers Engaged</p>
                <p className="text-2xl font-bold">{summaryMetrics.suppliersEngaged}</p>
                <p className="text-xs text-muted-foreground">
                  {summaryMetrics.interventionCount} interventions
                </p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Investment</p>
                <p className="text-2xl font-bold">{formatCurrency(summaryMetrics.totalCost)}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(summaryMetrics.costPerTonne)}/tCO₂e
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{activeScenario.targetYear} Emissions</p>
                <p className="text-2xl font-bold">{formatNumber(summaryMetrics.finalEmissions)}</p>
                <p className="text-xs text-muted-foreground">
                  from {formatNumber(baselineEmissions)} tCO₂e
                </p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projection Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Emissions Projection</CardTitle>
            <CardDescription>
              Projected Scope 3 emissions with planned interventions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `${formatNumber(value)} tCO₂e`,
                    name === 'baseline' ? 'Baseline' : 'Projected'
                  ]}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="baseline" 
                  stroke="hsl(var(--muted-foreground))" 
                  fill="hsl(var(--muted))"
                  strokeDasharray="5 5"
                  name="Baseline (No Action)"
                />
                <Area 
                  type="monotone" 
                  dataKey="projected" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary) / 0.3)"
                  name="With Interventions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Reduction by Intervention Type */}
        <Card>
          <CardHeader>
            <CardTitle>Reduction by Intervention Type</CardTitle>
            <CardDescription>
              Contribution of each intervention strategy
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeScenario.interventions.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={interventionTypes.map(type => ({
                    name: type.label.split(' ').slice(0, 2).join(' '),
                    reduction: activeScenario.interventions
                      .filter(i => i.interventionType === type.value)
                      .reduce((sum, i) => sum + (i.currentEmissions * (i.targetReduction / 100)), 0),
                    count: activeScenario.interventions.filter(i => i.interventionType === type.value).length,
                  })).filter(d => d.reduction > 0)}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip 
                    formatter={(value: number) => [`${formatNumber(value)} tCO₂e`, 'Reduction']}
                  />
                  <Bar dataKey="reduction" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Add interventions to see reduction breakdown
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Interventions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Supplier Interventions</CardTitle>
              <CardDescription>
                Model decarbonization efforts for your supply chain
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddIntervention(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Intervention
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Intervention Form */}
          {showAddIntervention && (
            <Card className="border-dashed border-2 border-primary/50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Select Supplier</Label>
                    <Select onValueChange={(supplierId) => {
                      const selectEl = document.getElementById('intervention-type') as HTMLSelectElement;
                      if (selectEl?.value) {
                        addIntervention(supplierId, selectEl.value);
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.length > 0 ? (
                          suppliers.map(supplier => (
                            <SelectItem key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="sample-1">Sample Supplier A</SelectItem>
                            <SelectItem value="sample-2">Sample Supplier B</SelectItem>
                            <SelectItem value="sample-3">Sample Supplier C</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Intervention Type</Label>
                    <Select onValueChange={(type) => {
                      // Store for when supplier is selected
                      const hiddenInput = document.getElementById('intervention-type') as HTMLInputElement;
                      if (hiddenInput) hiddenInput.value = type;
                    }}>
                      <SelectTrigger id="intervention-type">
                        <SelectValue placeholder="Choose intervention" />
                      </SelectTrigger>
                      <SelectContent>
                        {interventionTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label} (~{type.avgReduction}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" id="intervention-type" />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setShowAddIntervention(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Interventions List */}
          {activeScenario.interventions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Leaf className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No interventions added yet</p>
              <p className="text-sm mb-4">
                Add supplier decarbonization interventions to model emissions reductions
              </p>
              <Button onClick={() => setShowAddIntervention(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Intervention
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeScenario.interventions.map(intervention => (
                <Collapsible
                  key={intervention.id}
                  open={intervention.isExpanded}
                  onOpenChange={(open) => updateIntervention(intervention.id, { isExpanded: open })}
                >
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Building2 className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{intervention.supplierName}</CardTitle>
                              <CardDescription>
                                {interventionTypes.find(t => t.value === intervention.interventionType)?.label}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold text-green-600">
                                -{intervention.targetReduction}%
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ~{formatNumber(intervention.currentEmissions * (intervention.targetReduction / 100))} tCO₂e
                              </p>
                            </div>
                            <Badge variant="outline">
                              {intervention.implementationYear} - {intervention.fullEffectYear}
                            </Badge>
                            {intervention.isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Target Reduction (%)</Label>
                            <div className="flex items-center gap-2">
                              <Slider
                                value={[intervention.targetReduction]}
                                onValueChange={([value]) => updateIntervention(intervention.id, { targetReduction: value })}
                                min={5}
                                max={50}
                                step={5}
                                className="flex-1"
                              />
                              <span className="w-12 text-right font-medium">
                                {intervention.targetReduction}%
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Current Emissions (tCO₂e)</Label>
                            <Input
                              type="number"
                              value={intervention.currentEmissions}
                              onChange={(e) => updateIntervention(intervention.id, { 
                                currentEmissions: Number(e.target.value) 
                              })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Implementation Year</Label>
                            <Select
                              value={String(intervention.implementationYear)}
                              onValueChange={(value) => updateIntervention(intervention.id, { 
                                implementationYear: Number(value) 
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => currentYear + i).map(year => (
                                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Full Effect Year</Label>
                            <Select
                              value={String(intervention.fullEffectYear)}
                              onValueChange={(value) => updateIntervention(intervention.id, { 
                                fullEffectYear: Number(value) 
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => currentYear + i + 1).map(year => (
                                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Estimated Investment</p>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={intervention.estimatedCost}
                                  onChange={(e) => updateIntervention(intervention.id, { 
                                    estimatedCost: Number(e.target.value) 
                                  })}
                                  className="w-32"
                                />
                                <span className="text-sm text-muted-foreground">USD</span>
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-green-500/10">
                              <p className="text-xs text-muted-foreground">Cost per tonne</p>
                              <p className="font-bold text-green-600">
                                {formatCurrency(
                                  intervention.estimatedCost / 
                                  Math.max(1, intervention.currentEmissions * (intervention.targetReduction / 100))
                                )}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => removeIntervention(intervention.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Add Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Quick Intervention Templates
          </CardTitle>
          <CardDescription>
            Apply common decarbonization strategies across multiple suppliers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => {
                suppliers.filter(s => s.tier === 'tier_1').slice(0, 3).forEach(s => {
                  addIntervention(s.id, 'sbt_commitment');
                });
              }}
            >
              <Target className="h-5 w-5 mb-2 text-blue-500" />
              <span className="font-medium">SBTi for Tier 1</span>
              <span className="text-xs text-muted-foreground text-left">
                Engage all Tier 1 suppliers to set science-based targets
              </span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => {
                suppliers.slice(0, 5).forEach(s => {
                  addIntervention(s.id, 'renewable_energy');
                });
              }}
            >
              <Leaf className="h-5 w-5 mb-2 text-green-500" />
              <span className="font-medium">Renewable Transition</span>
              <span className="text-xs text-muted-foreground text-left">
                Push top suppliers to switch to 100% renewable energy
              </span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-start"
              onClick={() => {
                suppliers.slice(0, 10).forEach(s => {
                  addIntervention(s.id, 'engagement');
                });
              }}
            >
              <Building2 className="h-5 w-5 mb-2 text-primary" />
              <span className="font-medium">Broad Engagement</span>
              <span className="text-xs text-muted-foreground text-left">
                Launch engagement program across all major suppliers
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
