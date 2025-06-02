
export interface EmissionFactor {
  id: string;
  name: string;
  value: number;
  unit: string;
  source: string;
  region?: string;
  country?: string;
  methodology: string;
  uncertainty?: number;
  lastUpdated: string;
}

export interface CalculationMethod {
  id: string;
  name: string;
  description: string;
  factors: EmissionFactor[];
  formula: string;
  uncertainty: number;
}

export interface CalculationResult {
  value: number;
  unit: string;
  uncertainty: number;
  confidence: number;
  method: string;
  factors: EmissionFactor[];
  timestamp: string;
}

export interface LocationSpecificData {
  country: string;
  region?: string;
  gridElectricityFactor: number;
  heatingDegreeDays?: number;
  coolingDegreeDays?: number;
  renewablePercentage?: number;
}
