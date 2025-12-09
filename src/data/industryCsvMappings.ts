// Industry-specific CSV column mappings for emissions data import

export interface IndustryColumnMapping {
  industry: string;
  subIndustry?: string;
  displayName: string;
  description: string;
  columnMappings: {
    csvColumn: string;
    targetField: string;
    transform?: string;
  }[];
  suggestedCategories: string[];
}

export const industryCsvMappings: IndustryColumnMapping[] = [
  // Manufacturing - General
  {
    industry: 'manufacturing',
    displayName: 'Manufacturing Standard',
    description: 'Standard manufacturing emissions data format',
    columnMappings: [
      { csvColumn: 'production_date', targetField: 'entry_date' },
      { csvColumn: 'emission_source', targetField: 'category' },
      { csvColumn: 'fuel_consumption', targetField: 'quantity' },
      { csvColumn: 'fuel_unit', targetField: 'unit' },
      { csvColumn: 'facility', targetField: 'facility_name' },
      { csvColumn: 'process_type', targetField: 'activity_type' },
    ],
    suggestedCategories: ['Stationary Combustion', 'Process Emissions', 'Purchased Electricity'],
  },
  // Manufacturing - Cement
  {
    industry: 'manufacturing',
    subIndustry: 'cement',
    displayName: 'Cement Manufacturing',
    description: 'Cement industry format with clinker and kiln data',
    columnMappings: [
      { csvColumn: 'production_date', targetField: 'entry_date' },
      { csvColumn: 'clinker_production_tonnes', targetField: 'quantity', transform: 'clinker' },
      { csvColumn: 'kiln_fuel_consumption', targetField: 'quantity', transform: 'fuel' },
      { csvColumn: 'kiln_fuel_type', targetField: 'activity_type' },
      { csvColumn: 'limestone_tonnes', targetField: 'quantity', transform: 'limestone' },
      { csvColumn: 'plant_name', targetField: 'facility_name' },
    ],
    suggestedCategories: ['Clinker Calcination', 'Kiln Fuel Combustion', 'Raw Material Processing'],
  },
  // Manufacturing - Steel
  {
    industry: 'manufacturing',
    subIndustry: 'steel',
    displayName: 'Steel Manufacturing',
    description: 'Steel industry format with blast furnace and EAF data',
    columnMappings: [
      { csvColumn: 'production_date', targetField: 'entry_date' },
      { csvColumn: 'steel_output_tonnes', targetField: 'quantity', transform: 'steel' },
      { csvColumn: 'coke_consumption_tonnes', targetField: 'quantity', transform: 'coke' },
      { csvColumn: 'scrap_input_tonnes', targetField: 'quantity', transform: 'scrap' },
      { csvColumn: 'electricity_mwh', targetField: 'quantity', transform: 'electricity' },
      { csvColumn: 'production_route', targetField: 'activity_type' },
      { csvColumn: 'mill_name', targetField: 'facility_name' },
    ],
    suggestedCategories: ['Blast Furnace Operations', 'EAF Steelmaking', 'Coke Production', 'Rolling Mill Operations'],
  },
  // Manufacturing - Automotive
  {
    industry: 'manufacturing',
    subIndustry: 'automotive',
    displayName: 'Automotive Manufacturing',
    description: 'Automotive industry format with paint shop and assembly data',
    columnMappings: [
      { csvColumn: 'production_date', targetField: 'entry_date' },
      { csvColumn: 'vehicles_produced', targetField: 'quantity', transform: 'vehicles' },
      { csvColumn: 'natural_gas_therms', targetField: 'quantity', transform: 'gas' },
      { csvColumn: 'electricity_kwh', targetField: 'quantity', transform: 'electricity' },
      { csvColumn: 'paint_vocs_kg', targetField: 'quantity', transform: 'vocs' },
      { csvColumn: 'production_line', targetField: 'activity_type' },
      { csvColumn: 'plant_name', targetField: 'facility_name' },
    ],
    suggestedCategories: ['Paint Shop Operations', 'Stamping', 'Assembly Line', 'Compressed Air Systems'],
  },
  // Manufacturing - Chemicals
  {
    industry: 'manufacturing',
    subIndustry: 'chemicals',
    displayName: 'Chemical Manufacturing',
    description: 'Chemical industry format with feedstock and process data',
    columnMappings: [
      { csvColumn: 'production_date', targetField: 'entry_date' },
      { csvColumn: 'product_output_tonnes', targetField: 'quantity' },
      { csvColumn: 'feedstock_type', targetField: 'activity_type' },
      { csvColumn: 'steam_consumption_tonnes', targetField: 'quantity', transform: 'steam' },
      { csvColumn: 'process_emissions_tco2e', targetField: 'quantity', transform: 'direct' },
      { csvColumn: 'site_name', targetField: 'facility_name' },
    ],
    suggestedCategories: ['Steam Cracking', 'Chemical Reactions', 'Process Heat', 'Feedstock Processing'],
  },
  // Manufacturing - Food & Beverage
  {
    industry: 'manufacturing',
    subIndustry: 'food_beverage',
    displayName: 'Food & Beverage Manufacturing',
    description: 'Food industry format with refrigeration and boiler data',
    columnMappings: [
      { csvColumn: 'production_date', targetField: 'entry_date' },
      { csvColumn: 'production_volume', targetField: 'quantity' },
      { csvColumn: 'refrigerant_leakage_kg', targetField: 'quantity', transform: 'refrigerant' },
      { csvColumn: 'boiler_fuel_litres', targetField: 'quantity', transform: 'fuel' },
      { csvColumn: 'electricity_kwh', targetField: 'quantity', transform: 'electricity' },
      { csvColumn: 'process_type', targetField: 'activity_type' },
      { csvColumn: 'facility_name', targetField: 'facility_name' },
    ],
    suggestedCategories: ['Refrigeration Systems', 'Boiler Operations', 'Food Processing', 'Cold Storage'],
  },
  // Manufacturing - Textiles
  {
    industry: 'manufacturing',
    subIndustry: 'textiles',
    displayName: 'Textile Manufacturing',
    description: 'Textile industry format with dyeing and finishing data',
    columnMappings: [
      { csvColumn: 'production_date', targetField: 'entry_date' },
      { csvColumn: 'fabric_output_metres', targetField: 'quantity' },
      { csvColumn: 'steam_consumption', targetField: 'quantity', transform: 'steam' },
      { csvColumn: 'dye_chemicals_kg', targetField: 'quantity', transform: 'chemicals' },
      { csvColumn: 'electricity_kwh', targetField: 'quantity', transform: 'electricity' },
      { csvColumn: 'process_stage', targetField: 'activity_type' },
      { csvColumn: 'mill_name', targetField: 'facility_name' },
    ],
    suggestedCategories: ['Dyeing Process', 'Finishing Operations', 'Spinning', 'Weaving'],
  },
  // Energy
  {
    industry: 'energy',
    displayName: 'Energy Sector',
    description: 'Power generation and energy company format',
    columnMappings: [
      { csvColumn: 'generation_date', targetField: 'entry_date' },
      { csvColumn: 'generation_mwh', targetField: 'quantity' },
      { csvColumn: 'fuel_type', targetField: 'activity_type' },
      { csvColumn: 'fuel_consumption', targetField: 'quantity', transform: 'fuel' },
      { csvColumn: 'plant_efficiency', targetField: 'notes' },
      { csvColumn: 'power_plant', targetField: 'facility_name' },
    ],
    suggestedCategories: ['Power Generation', 'Fuel Combustion', 'Transmission Losses', 'Fugitive Emissions'],
  },
  // Financial Services
  {
    industry: 'financial_services',
    displayName: 'Financial Services',
    description: 'Office-based operations and financed emissions',
    columnMappings: [
      { csvColumn: 'reporting_date', targetField: 'entry_date' },
      { csvColumn: 'office_sqft', targetField: 'quantity', transform: 'office' },
      { csvColumn: 'electricity_kwh', targetField: 'quantity', transform: 'electricity' },
      { csvColumn: 'business_travel_miles', targetField: 'quantity', transform: 'travel' },
      { csvColumn: 'employee_count', targetField: 'quantity', transform: 'employees' },
      { csvColumn: 'emission_category', targetField: 'category' },
      { csvColumn: 'office_location', targetField: 'facility_name' },
    ],
    suggestedCategories: ['Office Energy', 'Business Travel', 'Employee Commuting', 'Financed Emissions'],
  },
  // Healthcare
  {
    industry: 'healthcare',
    displayName: 'Healthcare',
    description: 'Hospital and healthcare facility format',
    columnMappings: [
      { csvColumn: 'reporting_date', targetField: 'entry_date' },
      { csvColumn: 'facility_sqft', targetField: 'quantity', transform: 'building' },
      { csvColumn: 'anesthetic_gases_kg', targetField: 'quantity', transform: 'anesthetic' },
      { csvColumn: 'electricity_kwh', targetField: 'quantity', transform: 'electricity' },
      { csvColumn: 'natural_gas_therms', targetField: 'quantity', transform: 'gas' },
      { csvColumn: 'department', targetField: 'activity_type' },
      { csvColumn: 'hospital_name', targetField: 'facility_name' },
    ],
    suggestedCategories: ['Anesthetic Gas Emissions', 'Building Energy', 'Medical Equipment', 'Healthcare Waste'],
  },
  // Retail
  {
    industry: 'retail',
    displayName: 'Retail',
    description: 'Retail stores and distribution format',
    columnMappings: [
      { csvColumn: 'reporting_date', targetField: 'entry_date' },
      { csvColumn: 'store_sqft', targetField: 'quantity', transform: 'store' },
      { csvColumn: 'electricity_kwh', targetField: 'quantity', transform: 'electricity' },
      { csvColumn: 'refrigerant_kg', targetField: 'quantity', transform: 'refrigerant' },
      { csvColumn: 'logistics_km', targetField: 'quantity', transform: 'logistics' },
      { csvColumn: 'store_type', targetField: 'activity_type' },
      { csvColumn: 'store_name', targetField: 'facility_name' },
    ],
    suggestedCategories: ['Store Energy', 'Refrigeration', 'Logistics & Distribution', 'Purchased Goods'],
  },
  // Technology
  {
    industry: 'technology',
    displayName: 'Technology',
    description: 'Tech companies and data center format',
    columnMappings: [
      { csvColumn: 'reporting_date', targetField: 'entry_date' },
      { csvColumn: 'data_center_kwh', targetField: 'quantity', transform: 'datacenter' },
      { csvColumn: 'office_electricity_kwh', targetField: 'quantity', transform: 'office' },
      { csvColumn: 'pue_value', targetField: 'notes' },
      { csvColumn: 'server_count', targetField: 'quantity', transform: 'servers' },
      { csvColumn: 'emission_source', targetField: 'activity_type' },
      { csvColumn: 'site_name', targetField: 'facility_name' },
    ],
    suggestedCategories: ['Data Center Energy', 'Office Operations', 'Cloud Services', 'Business Travel'],
  },
];

export function getIndustryMapping(industry: string, subIndustry?: string | null): IndustryColumnMapping | null {
  // First try to find exact sub-industry match
  if (subIndustry) {
    const exactMatch = industryCsvMappings.find(
      m => m.industry.toLowerCase() === industry.toLowerCase() && 
           m.subIndustry?.toLowerCase() === subIndustry.toLowerCase()
    );
    if (exactMatch) return exactMatch;
  }
  
  // Fall back to industry-level mapping (without subIndustry)
  const industryMatch = industryCsvMappings.find(
    m => m.industry.toLowerCase() === industry.toLowerCase() && !m.subIndustry
  );
  
  return industryMatch || null;
}

export function getAllMappingsForIndustry(industry: string): IndustryColumnMapping[] {
  return industryCsvMappings.filter(
    m => m.industry.toLowerCase() === industry.toLowerCase()
  );
}
