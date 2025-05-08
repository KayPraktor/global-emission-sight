
// Sample data for the carbon accounting platform

export interface EmissionData {
  id: string;
  month: string;
  year: number;
  category: 'Scope 1' | 'Scope 2' | 'Scope 3';
  subcategory: string;
  source: string;
  amount: number;
  unit: string;
  co2e: number; // CO2 equivalent in tonnes
}

export interface MonthlySummary {
  month: string;
  scope1: number;
  scope2: number;
  scope3: number;
  total: number;
}

export interface CategoryBreakdown {
  category: string;
  value: number;
  percentage: number;
}

export const emissionsData: EmissionData[] = [
  {
    id: '1',
    month: 'January',
    year: 2025,
    category: 'Scope 1',
    subcategory: 'Stationary Combustion',
    source: 'Natural Gas',
    amount: 500,
    unit: 'MWh',
    co2e: 92.5,
  },
  {
    id: '2',
    month: 'January',
    year: 2025,
    category: 'Scope 1',
    subcategory: 'Mobile Combustion',
    source: 'Company Vehicles',
    amount: 1200,
    unit: 'Liters',
    co2e: 28.8,
  },
  {
    id: '3',
    month: 'January',
    year: 2025,
    category: 'Scope 2',
    subcategory: 'Purchased Electricity',
    source: 'Grid Electricity',
    amount: 1500,
    unit: 'kWh',
    co2e: 645.0,
  },
  {
    id: '4',
    month: 'January',
    year: 2025,
    category: 'Scope 3',
    subcategory: 'Business Travel',
    source: 'Flights',
    amount: 50000,
    unit: 'Passenger-km',
    co2e: 12.5,
  },
  {
    id: '5',
    month: 'February',
    year: 2025,
    category: 'Scope 1',
    subcategory: 'Stationary Combustion',
    source: 'Natural Gas',
    amount: 450,
    unit: 'MWh',
    co2e: 83.3,
  },
  {
    id: '6',
    month: 'February',
    year: 2025,
    category: 'Scope 1',
    subcategory: 'Mobile Combustion',
    source: 'Company Vehicles',
    amount: 1000,
    unit: 'Liters',
    co2e: 24.0,
  },
  {
    id: '7',
    month: 'February',
    year: 2025,
    category: 'Scope 2',
    subcategory: 'Purchased Electricity',
    source: 'Grid Electricity',
    amount: 1400,
    unit: 'kWh',
    co2e: 602.0,
  },
  {
    id: '8',
    month: 'February',
    year: 2025,
    category: 'Scope 3',
    subcategory: 'Business Travel',
    source: 'Flights',
    amount: 30000,
    unit: 'Passenger-km',
    co2e: 7.5,
  },
];

export const monthlySummary: MonthlySummary[] = [
  {
    month: 'January',
    scope1: 121.3,
    scope2: 645.0,
    scope3: 12.5,
    total: 778.8,
  },
  {
    month: 'February',
    scope1: 107.3,
    scope2: 602.0,
    scope3: 7.5,
    total: 716.8,
  },
  {
    month: 'March',
    scope1: 115.7,
    scope2: 623.0,
    scope3: 15.2,
    total: 753.9,
  },
  {
    month: 'April',
    scope1: 98.2,
    scope2: 598.5,
    scope3: 10.8,
    total: 707.5,
  },
  {
    month: 'May',
    scope1: 102.5,
    scope2: 612.3,
    scope3: 8.9,
    total: 723.7,
  },
  {
    month: 'June',
    scope1: 110.2,
    scope2: 635.7,
    scope3: 18.3,
    total: 764.2,
  },
];

export const categoryBreakdown: CategoryBreakdown[] = [
  { category: 'Purchased Electricity', value: 1247.0, percentage: 42.3 },
  { category: 'Natural Gas', value: 175.8, percentage: 15.9 },
  { category: 'Company Vehicles', value: 52.8, percentage: 11.2 },
  { category: 'Business Travel', value: 20.0, percentage: 9.8 },
  { category: 'Employee Commuting', value: 18.3, percentage: 7.5 },
  { category: 'Other', value: 30.4, percentage: 13.3 },
];

// Helper to calculate total emissions by scope
export const calculateTotalByScope = (scope: 'Scope 1' | 'Scope 2' | 'Scope 3'): number => {
  return emissionsData
    .filter(item => item.category === scope)
    .reduce((sum, item) => sum + item.co2e, 0);
};

// Helper to calculate total emissions
export const calculateTotal = (): number => {
  return emissionsData.reduce((sum, item) => sum + item.co2e, 0);
};
