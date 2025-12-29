export interface EEIOFactor {
  id: string;
  naics_code: string | null;
  industry: string;
  sector: string;
  factor_value: number;
  uncertainty: number;
  applicable_scope3_categories: number[] | null;
  region: string;
  country_code: string | null;
  source: string;
  methodology: string | null;
  year: number;
  data_quality_tier: 'primary' | 'secondary' | 'estimated';
  created_at: string;
  updated_at: string;
}

export interface SpendEstimationInput {
  spend: number;
  currency: string;
  industry: string;
  sector?: string;
  region?: string;
}

export interface SpendEstimationResult {
  emissions: number;
  emissionsUnit: 'tCO2e';
  factor: EEIOFactor | null;
  uncertainty: {
    lower: number;
    upper: number;
  };
  dataQuality: 'primary' | 'secondary' | 'estimated';
  methodology: string;
}

export interface SupplierSpendInput {
  supplierName: string;
  spend: number;
  currency: string;
  industry: string;
  sector?: string;
  region?: string;
}

export interface SupplierEmissionResult extends SpendEstimationResult {
  supplierName: string;
  spend: number;
  currency: string;
}

// Currency conversion rates to USD
export const CURRENCY_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 1.08,
  GBP: 1.27,
  JPY: 0.0067,
  CNY: 0.14,
  CAD: 0.74,
  AUD: 0.65,
  CHF: 1.13,
  INR: 0.012,
  KRW: 0.00075,
  BRL: 0.20,
  MXN: 0.058,
  SGD: 0.74,
  HKD: 0.13,
  SEK: 0.095,
  NOK: 0.092,
  DKK: 0.145,
};
