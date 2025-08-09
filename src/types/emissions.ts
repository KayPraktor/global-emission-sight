export type Scope = 'S1' | 'S2' | 'S3';

export type Unit = 'kWh' | 'MWh' | 'L' | 'kg' | 't';
export type EFUnit = 'kgCO2e/kWh' | 'kgCO2e/MWh' | 'kgCO2e/L' | 'kgCO2e/kg' | 'kgCO2e/t';

export interface EmissionFactor {
  value: number; // factor in kgCO2e per unit
  unit: EFUnit;
}

export interface EmissionRecord {
  date: string; // YYYY-MM-DD
  country: string; // ISO-2 code (e.g., 'US')
  scope: Scope;
  category: string;
  quantity: number;
  unit: Unit; // unit of quantity
  emission_factor: EmissionFactor; // factor per unit
}

export interface CountryCoord {
  code: string; // ISO-2
  name: string;
  lat: number;
  lng: number;
}

export type CountryCoordsMap = Record<string, CountryCoord>;

export type CountryTotals = Record<
  string,
  {
    country: string; // full name
    total: number; // tCO2e
    s1: number; // tCO2e
    s2: number; // tCO2e
    s3: number; // tCO2e
  }
>;
