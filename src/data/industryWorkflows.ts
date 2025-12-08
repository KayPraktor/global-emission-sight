// Industry-specific workflow configurations for emissions data entry

export interface WorkflowField {
  id: string;
  label: string;
  type: 'number' | 'select' | 'text' | 'date';
  unit?: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  helpText?: string;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  fields: WorkflowField[];
  suggestedFactorCategories?: string[];
}

export interface IndustryWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  suggestedEmissionCategories: string[];
  typicalScopes: ('scope_1' | 'scope_2' | 'scope_3')[];
}

export interface SubIndustryWorkflows {
  [subIndustry: string]: IndustryWorkflow;
}

export interface IndustryWorkflowConfig {
  [industry: string]: {
    default: IndustryWorkflow;
    subIndustries?: SubIndustryWorkflows;
  };
}

// Manufacturing - Cement workflow
const cementWorkflow: IndustryWorkflow = {
  id: 'cement',
  name: 'Cement Manufacturing',
  description: 'Track emissions from clinker production, kiln operations, and raw material processing',
  steps: [
    {
      id: 'clinker_production',
      title: 'Clinker Production',
      description: 'Record clinker production volumes and calcination emissions',
      fields: [
        { id: 'clinker_produced', label: 'Clinker Produced', type: 'number', unit: 'tonnes', required: true, helpText: 'Total clinker produced during reporting period' },
        { id: 'clinker_ratio', label: 'Clinker-to-Cement Ratio', type: 'number', unit: '%', required: true, helpText: 'Percentage of clinker in final cement product (typically 60-95%)' },
        { id: 'limestone_consumed', label: 'Limestone Consumed', type: 'number', unit: 'tonnes', required: true, helpText: 'Raw limestone used for calcination' },
      ],
      suggestedFactorCategories: ['clinker_calcination', 'limestone_calcination']
    },
    {
      id: 'kiln_operations',
      title: 'Kiln Operations',
      description: 'Record fuel consumption for kiln heating',
      fields: [
        { id: 'kiln_fuel_type', label: 'Primary Kiln Fuel', type: 'select', required: true, options: [
          { value: 'coal', label: 'Coal' },
          { value: 'natural_gas', label: 'Natural Gas' },
          { value: 'petroleum_coke', label: 'Petroleum Coke' },
          { value: 'alternative_fuel', label: 'Alternative Fuel (waste-derived)' },
        ]},
        { id: 'kiln_fuel_consumption', label: 'Fuel Consumption', type: 'number', unit: 'tonnes', required: true },
        { id: 'alternative_fuel_rate', label: 'Alternative Fuel Substitution Rate', type: 'number', unit: '%', helpText: 'Percentage of fuel from alternative sources' },
      ],
      suggestedFactorCategories: ['stationary_combustion', 'kiln_fuel']
    },
    {
      id: 'electricity',
      title: 'Electricity Consumption',
      description: 'Record electricity used for grinding and plant operations',
      fields: [
        { id: 'electricity_consumed', label: 'Total Electricity', type: 'number', unit: 'MWh', required: true },
        { id: 'renewable_percentage', label: 'Renewable Electricity %', type: 'number', unit: '%' },
      ],
      suggestedFactorCategories: ['grid_electricity', 'purchased_electricity']
    }
  ],
  suggestedEmissionCategories: ['Process Emissions', 'Stationary Combustion', 'Purchased Electricity'],
  typicalScopes: ['scope_1', 'scope_2']
};

// Manufacturing - Steel workflow
const steelWorkflow: IndustryWorkflow = {
  id: 'steel',
  name: 'Steel Manufacturing',
  description: 'Track emissions from iron ore reduction, steelmaking, and finishing operations',
  steps: [
    {
      id: 'production_pathway',
      title: 'Production Pathway',
      description: 'Specify your steelmaking process',
      fields: [
        { id: 'pathway', label: 'Primary Production Pathway', type: 'select', required: true, options: [
          { value: 'bf_bof', label: 'Blast Furnace - Basic Oxygen Furnace (BF-BOF)' },
          { value: 'eaf', label: 'Electric Arc Furnace (EAF)' },
          { value: 'dri_eaf', label: 'Direct Reduced Iron + EAF' },
          { value: 'hybrid', label: 'Hybrid/Mixed Operations' },
        ]},
        { id: 'crude_steel_produced', label: 'Crude Steel Produced', type: 'number', unit: 'tonnes', required: true },
        { id: 'scrap_steel_input', label: 'Scrap Steel Input', type: 'number', unit: 'tonnes', helpText: 'Recycled steel scrap used as feedstock' },
      ],
      suggestedFactorCategories: ['steel_production']
    },
    {
      id: 'raw_materials',
      title: 'Raw Materials & Reductants',
      description: 'Record iron ore and reducing agent consumption',
      fields: [
        { id: 'iron_ore_consumed', label: 'Iron Ore Consumed', type: 'number', unit: 'tonnes', required: true },
        { id: 'coke_consumed', label: 'Metallurgical Coke', type: 'number', unit: 'tonnes', helpText: 'For BF-BOF operations' },
        { id: 'coal_consumed', label: 'PCI Coal', type: 'number', unit: 'tonnes', helpText: 'Pulverized coal injection' },
        { id: 'natural_gas_consumed', label: 'Natural Gas', type: 'number', unit: 'GJ', helpText: 'For DRI or heating' },
      ],
      suggestedFactorCategories: ['coke_production', 'iron_ore_reduction']
    },
    {
      id: 'electricity_energy',
      title: 'Energy Consumption',
      description: 'Record electricity and supplementary energy',
      fields: [
        { id: 'electricity_consumed', label: 'Total Electricity', type: 'number', unit: 'MWh', required: true },
        { id: 'oxygen_consumed', label: 'Oxygen Consumed', type: 'number', unit: 'tonnes', helpText: 'For BOF operations' },
      ],
      suggestedFactorCategories: ['grid_electricity', 'industrial_gases']
    }
  ],
  suggestedEmissionCategories: ['Process Emissions', 'Stationary Combustion', 'Purchased Electricity'],
  typicalScopes: ['scope_1', 'scope_2', 'scope_3']
};

// Manufacturing - Automotive workflow
const automotiveWorkflow: IndustryWorkflow = {
  id: 'automotive',
  name: 'Automotive Manufacturing',
  description: 'Track emissions from vehicle assembly, paint operations, and component manufacturing',
  steps: [
    {
      id: 'production_volume',
      title: 'Production Volume',
      description: 'Record vehicle production metrics',
      fields: [
        { id: 'vehicles_produced', label: 'Vehicles Produced', type: 'number', unit: 'units', required: true },
        { id: 'vehicle_type', label: 'Primary Vehicle Type', type: 'select', required: true, options: [
          { value: 'passenger_car', label: 'Passenger Cars' },
          { value: 'suv_crossover', label: 'SUVs/Crossovers' },
          { value: 'light_truck', label: 'Light Trucks' },
          { value: 'heavy_truck', label: 'Heavy Trucks' },
          { value: 'ev', label: 'Electric Vehicles' },
        ]},
        { id: 'avg_vehicle_weight', label: 'Average Vehicle Weight', type: 'number', unit: 'kg' },
      ],
      suggestedFactorCategories: ['vehicle_manufacturing']
    },
    {
      id: 'paint_operations',
      title: 'Paint Shop Operations',
      description: 'Record paint booth and coating emissions',
      fields: [
        { id: 'paint_consumed', label: 'Total Paint Consumed', type: 'number', unit: 'liters', required: true },
        { id: 'voc_content', label: 'Average VOC Content', type: 'number', unit: 'g/L', helpText: 'VOC content of paints used' },
        { id: 'solvent_consumed', label: 'Solvents Consumed', type: 'number', unit: 'liters' },
        { id: 'paint_booth_energy', label: 'Paint Booth Energy', type: 'number', unit: 'MWh' },
      ],
      suggestedFactorCategories: ['paint_shop', 'voc_emissions']
    },
    {
      id: 'assembly_energy',
      title: 'Assembly & Energy',
      description: 'Record welding, stamping, and facility energy',
      fields: [
        { id: 'electricity_consumed', label: 'Total Electricity', type: 'number', unit: 'MWh', required: true },
        { id: 'natural_gas_consumed', label: 'Natural Gas', type: 'number', unit: 'GJ', required: true },
        { id: 'welding_gas_consumed', label: 'Welding Gas (Argon/CO2)', type: 'number', unit: 'kg' },
      ],
      suggestedFactorCategories: ['grid_electricity', 'natural_gas_combustion']
    }
  ],
  suggestedEmissionCategories: ['Stationary Combustion', 'Process Emissions', 'Purchased Electricity', 'Fugitive Emissions'],
  typicalScopes: ['scope_1', 'scope_2', 'scope_3']
};

// Manufacturing - Chemicals workflow
const chemicalsWorkflow: IndustryWorkflow = {
  id: 'chemicals',
  name: 'Chemical Manufacturing',
  description: 'Track emissions from chemical processing, steam generation, and feedstock consumption',
  steps: [
    {
      id: 'production_output',
      title: 'Production Output',
      description: 'Record chemical production volumes',
      fields: [
        { id: 'product_type', label: 'Primary Product Type', type: 'select', required: true, options: [
          { value: 'petrochemicals', label: 'Petrochemicals' },
          { value: 'basic_chemicals', label: 'Basic Chemicals' },
          { value: 'specialty_chemicals', label: 'Specialty Chemicals' },
          { value: 'polymers', label: 'Polymers/Plastics' },
          { value: 'fertilizers', label: 'Fertilizers' },
        ]},
        { id: 'production_volume', label: 'Production Volume', type: 'number', unit: 'tonnes', required: true },
        { id: 'capacity_utilization', label: 'Capacity Utilization', type: 'number', unit: '%' },
      ],
      suggestedFactorCategories: ['chemical_production']
    },
    {
      id: 'feedstock',
      title: 'Feedstock & Raw Materials',
      description: 'Record feedstock consumption',
      fields: [
        { id: 'naphtha_consumed', label: 'Naphtha Consumed', type: 'number', unit: 'tonnes' },
        { id: 'ethane_consumed', label: 'Ethane Consumed', type: 'number', unit: 'tonnes' },
        { id: 'natural_gas_feedstock', label: 'Natural Gas (as feedstock)', type: 'number', unit: 'GJ' },
        { id: 'hydrogen_consumed', label: 'Hydrogen Consumed', type: 'number', unit: 'tonnes' },
      ],
      suggestedFactorCategories: ['steam_cracking', 'feedstock_emissions']
    },
    {
      id: 'process_energy',
      title: 'Process Energy',
      description: 'Record steam, heat, and electricity consumption',
      fields: [
        { id: 'steam_consumed', label: 'Steam Consumed', type: 'number', unit: 'GJ', required: true },
        { id: 'electricity_consumed', label: 'Electricity Consumed', type: 'number', unit: 'MWh', required: true },
        { id: 'process_heat', label: 'Process Heat (fuel)', type: 'number', unit: 'GJ' },
        { id: 'flare_gas', label: 'Gas Flared', type: 'number', unit: 'tonnes', helpText: 'Process gas sent to flare' },
      ],
      suggestedFactorCategories: ['steam_generation', 'grid_electricity', 'flaring']
    }
  ],
  suggestedEmissionCategories: ['Process Emissions', 'Stationary Combustion', 'Fugitive Emissions', 'Purchased Electricity'],
  typicalScopes: ['scope_1', 'scope_2', 'scope_3']
};

// Manufacturing - Food & Beverage workflow
const foodBeverageWorkflow: IndustryWorkflow = {
  id: 'food_beverage',
  name: 'Food & Beverage Manufacturing',
  description: 'Track emissions from food processing, refrigeration, and packaging',
  steps: [
    {
      id: 'production',
      title: 'Production Volume',
      description: 'Record production metrics',
      fields: [
        { id: 'product_category', label: 'Product Category', type: 'select', required: true, options: [
          { value: 'dairy', label: 'Dairy Products' },
          { value: 'meat', label: 'Meat Processing' },
          { value: 'beverages', label: 'Beverages' },
          { value: 'baked_goods', label: 'Baked Goods' },
          { value: 'frozen_foods', label: 'Frozen Foods' },
          { value: 'snacks', label: 'Snacks & Confectionery' },
        ]},
        { id: 'production_volume', label: 'Production Volume', type: 'number', unit: 'tonnes', required: true },
        { id: 'packaging_weight', label: 'Packaging Material Used', type: 'number', unit: 'tonnes' },
      ],
      suggestedFactorCategories: ['food_processing']
    },
    {
      id: 'refrigeration',
      title: 'Refrigeration & Cold Chain',
      description: 'Record refrigerant usage and cold storage',
      fields: [
        { id: 'refrigerant_type', label: 'Primary Refrigerant', type: 'select', options: [
          { value: 'r134a', label: 'R-134a' },
          { value: 'r404a', label: 'R-404A' },
          { value: 'r410a', label: 'R-410A' },
          { value: 'ammonia', label: 'Ammonia (R-717)' },
          { value: 'co2', label: 'CO2 (R-744)' },
        ]},
        { id: 'refrigerant_charge', label: 'Total Refrigerant Charge', type: 'number', unit: 'kg', required: true },
        { id: 'refrigerant_leakage', label: 'Estimated Annual Leakage', type: 'number', unit: '%', helpText: 'Typical range: 2-15%' },
        { id: 'cold_storage_sqm', label: 'Cold Storage Area', type: 'number', unit: 'sq meters' },
      ],
      suggestedFactorCategories: ['refrigeration', 'fugitive_emissions']
    },
    {
      id: 'energy',
      title: 'Energy & Utilities',
      description: 'Record energy consumption for processing',
      fields: [
        { id: 'electricity_consumed', label: 'Electricity Consumed', type: 'number', unit: 'MWh', required: true },
        { id: 'natural_gas_consumed', label: 'Natural Gas', type: 'number', unit: 'GJ', required: true, helpText: 'For heating, cooking, steam' },
        { id: 'steam_consumed', label: 'Purchased Steam', type: 'number', unit: 'GJ' },
        { id: 'water_consumed', label: 'Water Consumed', type: 'number', unit: 'cubic meters' },
      ],
      suggestedFactorCategories: ['grid_electricity', 'natural_gas_combustion', 'water_supply']
    }
  ],
  suggestedEmissionCategories: ['Stationary Combustion', 'Fugitive Emissions', 'Purchased Electricity', 'Water & Wastewater'],
  typicalScopes: ['scope_1', 'scope_2', 'scope_3']
};

// Manufacturing - Textiles workflow
const textilesWorkflow: IndustryWorkflow = {
  id: 'textiles',
  name: 'Textile Manufacturing',
  description: 'Track emissions from fiber processing, dyeing, and finishing operations',
  steps: [
    {
      id: 'production',
      title: 'Production Output',
      description: 'Record textile production volumes',
      fields: [
        { id: 'fiber_type', label: 'Primary Fiber Type', type: 'select', required: true, options: [
          { value: 'cotton', label: 'Cotton' },
          { value: 'polyester', label: 'Polyester' },
          { value: 'nylon', label: 'Nylon' },
          { value: 'wool', label: 'Wool' },
          { value: 'blended', label: 'Blended Fabrics' },
        ]},
        { id: 'fabric_produced', label: 'Fabric Produced', type: 'number', unit: 'tonnes', required: true },
        { id: 'garments_produced', label: 'Finished Garments', type: 'number', unit: 'units' },
      ],
      suggestedFactorCategories: ['textile_production']
    },
    {
      id: 'wet_processing',
      title: 'Wet Processing & Dyeing',
      description: 'Record dyeing, bleaching, and finishing chemicals',
      fields: [
        { id: 'water_consumed', label: 'Water Consumed', type: 'number', unit: 'cubic meters', required: true },
        { id: 'dye_consumed', label: 'Dye Consumed', type: 'number', unit: 'kg' },
        { id: 'chemicals_consumed', label: 'Processing Chemicals', type: 'number', unit: 'kg', helpText: 'Bleach, softeners, finishing agents' },
        { id: 'steam_consumed', label: 'Steam for Processing', type: 'number', unit: 'GJ', required: true },
      ],
      suggestedFactorCategories: ['dyeing_finishing', 'water_treatment']
    },
    {
      id: 'energy',
      title: 'Energy Consumption',
      description: 'Record electricity and fuel usage',
      fields: [
        { id: 'electricity_consumed', label: 'Electricity Consumed', type: 'number', unit: 'MWh', required: true },
        { id: 'coal_consumed', label: 'Coal (for boilers)', type: 'number', unit: 'tonnes' },
        { id: 'natural_gas_consumed', label: 'Natural Gas', type: 'number', unit: 'GJ' },
      ],
      suggestedFactorCategories: ['grid_electricity', 'coal_combustion', 'natural_gas_combustion']
    }
  ],
  suggestedEmissionCategories: ['Stationary Combustion', 'Purchased Electricity', 'Water & Wastewater', 'Process Emissions'],
  typicalScopes: ['scope_1', 'scope_2', 'scope_3']
};

// Financial Services workflow
const financialServicesWorkflow: IndustryWorkflow = {
  id: 'financial_services',
  name: 'Financial Services',
  description: 'Track operational emissions and financed emissions for financial institutions',
  steps: [
    {
      id: 'office_operations',
      title: 'Office Operations',
      description: 'Record facility and office emissions',
      fields: [
        { id: 'office_sqft', label: 'Total Office Space', type: 'number', unit: 'sq ft', required: true },
        { id: 'employee_count', label: 'Number of Employees', type: 'number', unit: 'FTE', required: true },
        { id: 'electricity_consumed', label: 'Electricity Consumed', type: 'number', unit: 'MWh', required: true },
        { id: 'natural_gas_consumed', label: 'Natural Gas (heating)', type: 'number', unit: 'therms' },
      ],
      suggestedFactorCategories: ['grid_electricity', 'natural_gas_combustion', 'office_emissions']
    },
    {
      id: 'business_travel',
      title: 'Business Travel',
      description: 'Record employee travel emissions',
      fields: [
        { id: 'air_travel_miles', label: 'Air Travel', type: 'number', unit: 'passenger-miles', required: true },
        { id: 'rail_travel_miles', label: 'Rail Travel', type: 'number', unit: 'passenger-miles' },
        { id: 'car_travel_miles', label: 'Car/Taxi Travel', type: 'number', unit: 'miles' },
        { id: 'hotel_nights', label: 'Hotel Nights', type: 'number', unit: 'nights' },
      ],
      suggestedFactorCategories: ['air_travel', 'rail_travel', 'road_travel', 'hotel_stays']
    },
    {
      id: 'financed_emissions',
      title: 'Financed Emissions (Scope 3.15)',
      description: 'Record emissions from investment and lending portfolios',
      fields: [
        { id: 'loans_outstanding', label: 'Total Loans Outstanding', type: 'number', unit: 'USD millions' },
        { id: 'investments_aum', label: 'Assets Under Management', type: 'number', unit: 'USD millions' },
        { id: 'portfolio_carbon_intensity', label: 'Portfolio Carbon Intensity', type: 'number', unit: 'tCO2e/USD million', helpText: 'Weighted average carbon intensity' },
      ],
      suggestedFactorCategories: ['financed_emissions', 'pcaf']
    }
  ],
  suggestedEmissionCategories: ['Purchased Electricity', 'Stationary Combustion', 'Business Travel', 'Financed Emissions'],
  typicalScopes: ['scope_1', 'scope_2', 'scope_3']
};

// Energy Sector workflow
const energyWorkflow: IndustryWorkflow = {
  id: 'energy',
  name: 'Energy & Utilities',
  description: 'Track emissions from power generation, transmission, and fuel production',
  steps: [
    {
      id: 'generation',
      title: 'Power Generation',
      description: 'Record electricity generation and fuel consumption',
      fields: [
        { id: 'generation_type', label: 'Primary Generation Type', type: 'select', required: true, options: [
          { value: 'coal', label: 'Coal-Fired' },
          { value: 'natural_gas', label: 'Natural Gas (CCGT)' },
          { value: 'oil', label: 'Oil-Fired' },
          { value: 'nuclear', label: 'Nuclear' },
          { value: 'hydro', label: 'Hydroelectric' },
          { value: 'wind', label: 'Wind' },
          { value: 'solar', label: 'Solar PV' },
        ]},
        { id: 'electricity_generated', label: 'Electricity Generated', type: 'number', unit: 'MWh', required: true },
        { id: 'capacity_factor', label: 'Capacity Factor', type: 'number', unit: '%' },
      ],
      suggestedFactorCategories: ['power_generation']
    },
    {
      id: 'fuel_consumption',
      title: 'Fuel Consumption',
      description: 'Record fuel used for generation',
      fields: [
        { id: 'coal_consumed', label: 'Coal Consumed', type: 'number', unit: 'tonnes' },
        { id: 'natural_gas_consumed', label: 'Natural Gas Consumed', type: 'number', unit: 'GJ' },
        { id: 'oil_consumed', label: 'Fuel Oil Consumed', type: 'number', unit: 'liters' },
        { id: 'biomass_consumed', label: 'Biomass Consumed', type: 'number', unit: 'tonnes' },
      ],
      suggestedFactorCategories: ['coal_combustion', 'natural_gas_combustion', 'oil_combustion']
    },
    {
      id: 'fugitive',
      title: 'Fugitive Emissions',
      description: 'Record methane leaks and SF6 emissions',
      fields: [
        { id: 'methane_leakage', label: 'Methane Leakage', type: 'number', unit: 'tonnes', helpText: 'From natural gas infrastructure' },
        { id: 'sf6_equipment', label: 'SF6 Equipment Capacity', type: 'number', unit: 'kg', helpText: 'Total SF6 in switchgear' },
        { id: 'sf6_leakage_rate', label: 'SF6 Leakage Rate', type: 'number', unit: '%', helpText: 'Typical: 1-3% annually' },
      ],
      suggestedFactorCategories: ['fugitive_emissions', 'sf6_emissions']
    }
  ],
  suggestedEmissionCategories: ['Stationary Combustion', 'Fugitive Emissions', 'Process Emissions'],
  typicalScopes: ['scope_1', 'scope_2', 'scope_3']
};

// Generic/Default workflow for industries without specific configuration
const genericWorkflow: IndustryWorkflow = {
  id: 'generic',
  name: 'General Business',
  description: 'Standard emissions tracking for facilities and operations',
  steps: [
    {
      id: 'stationary_combustion',
      title: 'Stationary Combustion',
      description: 'Record fuel consumption for heating, power, and industrial processes',
      fields: [
        { id: 'natural_gas', label: 'Natural Gas', type: 'number', unit: 'GJ' },
        { id: 'diesel', label: 'Diesel/Fuel Oil', type: 'number', unit: 'liters' },
        { id: 'propane', label: 'Propane/LPG', type: 'number', unit: 'liters' },
        { id: 'coal', label: 'Coal', type: 'number', unit: 'tonnes' },
      ],
      suggestedFactorCategories: ['natural_gas_combustion', 'diesel_combustion', 'propane_combustion']
    },
    {
      id: 'purchased_electricity',
      title: 'Purchased Electricity',
      description: 'Record electricity consumption from the grid',
      fields: [
        { id: 'electricity_consumed', label: 'Electricity Consumed', type: 'number', unit: 'MWh', required: true },
        { id: 'renewable_percentage', label: 'Renewable Electricity %', type: 'number', unit: '%', helpText: 'Percentage from renewable sources' },
      ],
      suggestedFactorCategories: ['grid_electricity']
    },
    {
      id: 'mobile_sources',
      title: 'Mobile Sources',
      description: 'Record fleet and vehicle emissions',
      fields: [
        { id: 'fleet_diesel', label: 'Fleet Diesel', type: 'number', unit: 'liters' },
        { id: 'fleet_gasoline', label: 'Fleet Gasoline', type: 'number', unit: 'liters' },
        { id: 'fleet_distance', label: 'Total Fleet Distance', type: 'number', unit: 'km' },
      ],
      suggestedFactorCategories: ['mobile_combustion', 'fleet_emissions']
    }
  ],
  suggestedEmissionCategories: ['Stationary Combustion', 'Mobile Combustion', 'Purchased Electricity'],
  typicalScopes: ['scope_1', 'scope_2']
};

// Complete industry workflow configuration
export const industryWorkflows: IndustryWorkflowConfig = {
  manufacturing: {
    default: genericWorkflow,
    subIndustries: {
      cement: cementWorkflow,
      steel: steelWorkflow,
      automotive: automotiveWorkflow,
      chemicals: chemicalsWorkflow,
      food_beverage: foodBeverageWorkflow,
      textiles: textilesWorkflow,
    }
  },
  energy: {
    default: energyWorkflow,
  },
  financial_services: {
    default: financialServicesWorkflow,
  },
  technology: {
    default: genericWorkflow,
  },
  healthcare: {
    default: genericWorkflow,
  },
  retail: {
    default: genericWorkflow,
  },
  transportation: {
    default: genericWorkflow,
  },
};

// Helper function to get workflow for an organization
export function getIndustryWorkflow(industry?: string | null, subIndustry?: string | null): IndustryWorkflow {
  if (!industry) return genericWorkflow;
  
  const industryConfig = industryWorkflows[industry];
  if (!industryConfig) return genericWorkflow;
  
  // Check for sub-industry specific workflow
  if (subIndustry && industryConfig.subIndustries?.[subIndustry]) {
    return industryConfig.subIndustries[subIndustry];
  }
  
  return industryConfig.default;
}

// Get list of all available workflows
export function getAvailableWorkflows(): { industry: string; subIndustry?: string; workflow: IndustryWorkflow }[] {
  const workflows: { industry: string; subIndustry?: string; workflow: IndustryWorkflow }[] = [];
  
  for (const [industry, config] of Object.entries(industryWorkflows)) {
    workflows.push({ industry, workflow: config.default });
    
    if (config.subIndustries) {
      for (const [subIndustry, workflow] of Object.entries(config.subIndustries)) {
        workflows.push({ industry, subIndustry, workflow });
      }
    }
  }
  
  return workflows;
}
