// Multi-parameter sensitivity analysis service

export interface SensitivityParameter {
  id: string;
  name: string;
  baseValue: number;
  lowValue: number;
  highValue: number;
  unit: string;
  category: 'financial' | 'technical' | 'timeline';
}

export interface TornadoDataPoint {
  parameter: string;
  parameterId: string;
  lowImpact: number;
  highImpact: number;
  baseValue: number;
  lowLabel: string;
  highLabel: string;
  spread: number;
}

export interface MultiParameterResult {
  netBenefit: number;
  totalEmissionsReduced: number;
  totalCost: number;
  roi: number;
  paybackYears: number;
}

export interface ScenarioMatrixCell {
  param1Value: number;
  param2Value: number;
  outcome: number;
  color: string;
}

// Default parameters for sensitivity analysis
export const getDefaultParameters = (baselineEmissions: number): SensitivityParameter[] => [
  {
    id: 'carbon_price',
    name: 'Carbon Price',
    baseValue: 50,
    lowValue: 20,
    highValue: 150,
    unit: '$/tCO₂e',
    category: 'financial'
  },
  {
    id: 'intervention_effectiveness',
    name: 'Intervention Effectiveness',
    baseValue: 100,
    lowValue: 70,
    highValue: 130,
    unit: '%',
    category: 'technical'
  },
  {
    id: 'one_time_cost',
    name: 'One-Time Costs',
    baseValue: 100,
    lowValue: 80,
    highValue: 150,
    unit: '%',
    category: 'financial'
  },
  {
    id: 'annual_cost',
    name: 'Annual Operating Costs',
    baseValue: 100,
    lowValue: 80,
    highValue: 140,
    unit: '%',
    category: 'financial'
  },
  {
    id: 'energy_savings',
    name: 'Energy Savings',
    baseValue: 100,
    lowValue: 60,
    highValue: 120,
    unit: '%',
    category: 'technical'
  },
  {
    id: 'timeline_delay',
    name: 'Implementation Delay',
    baseValue: 0,
    lowValue: 0,
    highValue: 3,
    unit: 'years',
    category: 'timeline'
  }
];

export interface InterventionData {
  reduction_percentage: number;
  one_time_cost: number;
  annual_cost: number;
  annual_savings: number;
  implementation_year: number;
}

// Calculate net benefit based on parameter variations
export const calculateNetBenefit = (
  interventions: InterventionData[],
  baselineEmissions: number,
  baselineYear: number,
  targetYear: number,
  parameters: Record<string, number>
): MultiParameterResult => {
  const carbonPrice = parameters.carbon_price ?? 50;
  const effectivenessMultiplier = (parameters.intervention_effectiveness ?? 100) / 100;
  const oneTimeCostMultiplier = (parameters.one_time_cost ?? 100) / 100;
  const annualCostMultiplier = (parameters.annual_cost ?? 100) / 100;
  const energySavingsMultiplier = (parameters.energy_savings ?? 100) / 100;
  const timelineDelay = parameters.timeline_delay ?? 0;

  const years = targetYear - baselineYear;
  let totalEmissionsReduced = 0;
  let totalOneTimeCost = 0;
  let totalAnnualCost = 0;
  let totalAnnualSavings = 0;

  for (const intervention of interventions) {
    const effectiveYears = Math.max(0, years - timelineDelay);
    const adjustedReduction = intervention.reduction_percentage * effectivenessMultiplier;
    
    // Emissions reduced over the period
    const yearlyReduction = baselineEmissions * (adjustedReduction / 100);
    totalEmissionsReduced += yearlyReduction * effectiveYears;

    // Costs
    totalOneTimeCost += intervention.one_time_cost * oneTimeCostMultiplier;
    totalAnnualCost += intervention.annual_cost * annualCostMultiplier * effectiveYears;
    totalAnnualSavings += intervention.annual_savings * energySavingsMultiplier * effectiveYears;
  }

  // Calculate financials
  const carbonBenefit = totalEmissionsReduced * carbonPrice;
  const totalCost = totalOneTimeCost + totalAnnualCost;
  const totalBenefit = carbonBenefit + totalAnnualSavings;
  const netBenefit = totalBenefit - totalCost;
  const roi = totalCost > 0 ? ((totalBenefit - totalCost) / totalCost) * 100 : 0;
  const paybackYears = totalBenefit > 0 ? totalCost / (totalBenefit / years) : Infinity;

  return {
    netBenefit,
    totalEmissionsReduced,
    totalCost,
    roi,
    paybackYears: Math.min(paybackYears, 99)
  };
};

// Generate tornado diagram data
export const generateTornadoData = (
  interventions: InterventionData[],
  baselineEmissions: number,
  baselineYear: number,
  targetYear: number,
  parameters: SensitivityParameter[]
): TornadoDataPoint[] => {
  // Calculate base case
  const baseParams: Record<string, number> = {};
  parameters.forEach(p => {
    baseParams[p.id] = p.baseValue;
  });
  const baseResult = calculateNetBenefit(interventions, baselineEmissions, baselineYear, targetYear, baseParams);

  const tornadoData: TornadoDataPoint[] = [];

  for (const param of parameters) {
    // Calculate low case
    const lowParams = { ...baseParams, [param.id]: param.lowValue };
    const lowResult = calculateNetBenefit(interventions, baselineEmissions, baselineYear, targetYear, lowParams);

    // Calculate high case
    const highParams = { ...baseParams, [param.id]: param.highValue };
    const highResult = calculateNetBenefit(interventions, baselineEmissions, baselineYear, targetYear, highParams);

    const lowImpact = lowResult.netBenefit - baseResult.netBenefit;
    const highImpact = highResult.netBenefit - baseResult.netBenefit;

    tornadoData.push({
      parameter: param.name,
      parameterId: param.id,
      lowImpact,
      highImpact,
      baseValue: baseResult.netBenefit,
      lowLabel: `${param.lowValue}${param.unit === '%' ? '%' : ' ' + param.unit}`,
      highLabel: `${param.highValue}${param.unit === '%' ? '%' : ' ' + param.unit}`,
      spread: Math.abs(highImpact - lowImpact)
    });
  }

  // Sort by spread (largest impact first)
  return tornadoData.sort((a, b) => b.spread - a.spread);
};

// Generate scenario matrix for two parameters
export const generateScenarioMatrix = (
  interventions: InterventionData[],
  baselineEmissions: number,
  baselineYear: number,
  targetYear: number,
  param1: SensitivityParameter,
  param2: SensitivityParameter,
  baseParams: Record<string, number>,
  steps: number = 5
): ScenarioMatrixCell[] => {
  const cells: ScenarioMatrixCell[] = [];
  
  const param1Range = param1.highValue - param1.lowValue;
  const param2Range = param2.highValue - param2.lowValue;
  
  let minOutcome = Infinity;
  let maxOutcome = -Infinity;

  // First pass to get min/max
  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      const p1Value = param1.lowValue + (param1Range * i) / steps;
      const p2Value = param2.lowValue + (param2Range * j) / steps;
      
      const params = {
        ...baseParams,
        [param1.id]: p1Value,
        [param2.id]: p2Value
      };
      
      const result = calculateNetBenefit(interventions, baselineEmissions, baselineYear, targetYear, params);
      minOutcome = Math.min(minOutcome, result.netBenefit);
      maxOutcome = Math.max(maxOutcome, result.netBenefit);
    }
  }

  // Second pass to generate cells with colors
  for (let i = 0; i <= steps; i++) {
    for (let j = 0; j <= steps; j++) {
      const p1Value = param1.lowValue + (param1Range * i) / steps;
      const p2Value = param2.lowValue + (param2Range * j) / steps;
      
      const params = {
        ...baseParams,
        [param1.id]: p1Value,
        [param2.id]: p2Value
      };
      
      const result = calculateNetBenefit(interventions, baselineEmissions, baselineYear, targetYear, params);
      
      // Calculate color based on outcome
      const normalized = maxOutcome !== minOutcome 
        ? (result.netBenefit - minOutcome) / (maxOutcome - minOutcome)
        : 0.5;
      
      let color: string;
      if (normalized > 0.66) {
        color = 'hsl(var(--chart-2))';
      } else if (normalized > 0.33) {
        color = 'hsl(var(--primary))';
      } else {
        color = 'hsl(var(--destructive))';
      }

      cells.push({
        param1Value: p1Value,
        param2Value: p2Value,
        outcome: result.netBenefit,
        color
      });
    }
  }

  return cells;
};
