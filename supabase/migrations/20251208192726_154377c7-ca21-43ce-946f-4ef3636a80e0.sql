-- Phase 1: Add industry fields to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS industry text,
ADD COLUMN IF NOT EXISTS sub_industry text,
ADD COLUMN IF NOT EXISTS employee_count integer,
ADD COLUMN IF NOT EXISTS annual_revenue_usd numeric,
ADD COLUMN IF NOT EXISTS square_footage numeric;

-- Create industry types enum for consistency
DO $$ BEGIN
  CREATE TYPE industry_type AS ENUM (
    'manufacturing',
    'energy_utilities',
    'financial_services',
    'technology',
    'healthcare_pharma',
    'retail_consumer',
    'transportation_logistics',
    'construction_real_estate',
    'agriculture_food',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create sub-industry reference table
CREATE TABLE IF NOT EXISTS public.industry_sub_industries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry text NOT NULL,
  sub_industry text NOT NULL,
  display_name text NOT NULL,
  emission_categories text[] DEFAULT '{}',
  typical_scopes text[] DEFAULT '{}'::text[],
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.industry_sub_industries ENABLE ROW LEVEL SECURITY;

-- Public read access for industry sub-industries
CREATE POLICY "Anyone can view industry sub-industries"
ON public.industry_sub_industries FOR SELECT
USING (true);

-- Insert sub-industries for Manufacturing
INSERT INTO public.industry_sub_industries (industry, sub_industry, display_name, emission_categories, typical_scopes) VALUES
('manufacturing', 'steel', 'Steel & Iron', ARRAY['process_emissions', 'fuel_combustion', 'purchased_electricity'], ARRAY['scope_1', 'scope_2']),
('manufacturing', 'cement', 'Cement & Concrete', ARRAY['calcination', 'fuel_combustion', 'purchased_electricity'], ARRAY['scope_1', 'scope_2']),
('manufacturing', 'chemicals', 'Chemicals & Petrochemicals', ARRAY['process_emissions', 'fuel_combustion', 'fugitive_emissions'], ARRAY['scope_1', 'scope_2', 'scope_3']),
('manufacturing', 'automotive', 'Automotive', ARRAY['paint_operations', 'metal_working', 'assembly'], ARRAY['scope_1', 'scope_2', 'scope_3']),
('manufacturing', 'pharmaceuticals', 'Pharmaceuticals', ARRAY['process_emissions', 'hvac', 'cold_chain'], ARRAY['scope_1', 'scope_2', 'scope_3']),
('manufacturing', 'food_beverage', 'Food & Beverage', ARRAY['refrigeration', 'process_heat', 'packaging'], ARRAY['scope_1', 'scope_2', 'scope_3']),
('manufacturing', 'textiles', 'Textiles & Apparel', ARRAY['dyeing', 'drying', 'steam_generation'], ARRAY['scope_1', 'scope_2', 'scope_3']),
('manufacturing', 'electronics', 'Electronics & Semiconductors', ARRAY['cleanroom_hvac', 'process_gases', 'soldering'], ARRAY['scope_1', 'scope_2']),
('manufacturing', 'general', 'General Manufacturing', ARRAY['fuel_combustion', 'purchased_electricity', 'industrial_processes'], ARRAY['scope_1', 'scope_2']);

-- Insert sub-industries for Energy & Utilities
INSERT INTO public.industry_sub_industries (industry, sub_industry, display_name, emission_categories, typical_scopes) VALUES
('energy_utilities', 'power_generation', 'Power Generation', ARRAY['fuel_combustion', 'grid_losses'], ARRAY['scope_1', 'scope_2']),
('energy_utilities', 'oil_gas_upstream', 'Oil & Gas (Upstream)', ARRAY['extraction', 'flaring', 'venting', 'fugitive_emissions'], ARRAY['scope_1', 'scope_3']),
('energy_utilities', 'oil_gas_downstream', 'Oil & Gas (Downstream)', ARRAY['refining', 'distribution', 'fuel_combustion'], ARRAY['scope_1', 'scope_2', 'scope_3']),
('energy_utilities', 'renewables', 'Renewable Energy', ARRAY['manufacturing', 'installation', 'maintenance'], ARRAY['scope_3']),
('energy_utilities', 'water_utilities', 'Water & Wastewater', ARRAY['pumping', 'treatment', 'methane_emissions'], ARRAY['scope_1', 'scope_2']),
('energy_utilities', 'natural_gas', 'Natural Gas Distribution', ARRAY['pipeline_leaks', 'compression', 'metering'], ARRAY['scope_1', 'scope_3']);

-- Insert sub-industries for Financial Services
INSERT INTO public.industry_sub_industries (industry, sub_industry, display_name, emission_categories, typical_scopes) VALUES
('financial_services', 'banking', 'Banking & Lending', ARRAY['office_operations', 'data_centers', 'financed_emissions'], ARRAY['scope_1', 'scope_2', 'scope_3']),
('financial_services', 'insurance', 'Insurance', ARRAY['office_operations', 'underwriting_emissions'], ARRAY['scope_1', 'scope_2', 'scope_3']),
('financial_services', 'asset_management', 'Asset Management', ARRAY['office_operations', 'portfolio_emissions'], ARRAY['scope_1', 'scope_2', 'scope_3']),
('financial_services', 'real_estate_investment', 'Real Estate Investment', ARRAY['building_operations', 'tenant_emissions'], ARRAY['scope_1', 'scope_2', 'scope_3']);

-- Insert sub-industries for Technology
INSERT INTO public.industry_sub_industries (industry, sub_industry, display_name, emission_categories, typical_scopes) VALUES
('technology', 'software', 'Software & SaaS', ARRAY['data_centers', 'office_operations', 'cloud_computing'], ARRAY['scope_2', 'scope_3']),
('technology', 'hardware', 'Hardware Manufacturing', ARRAY['manufacturing', 'supply_chain', 'product_use'], ARRAY['scope_1', 'scope_2', 'scope_3']),
('technology', 'telecommunications', 'Telecommunications', ARRAY['network_infrastructure', 'data_centers', 'retail_operations'], ARRAY['scope_1', 'scope_2', 'scope_3']);

-- Insert sub-industries for Healthcare
INSERT INTO public.industry_sub_industries (industry, sub_industry, display_name, emission_categories, typical_scopes) VALUES
('healthcare_pharma', 'hospitals', 'Hospitals & Healthcare Facilities', ARRAY['hvac', 'medical_gases', 'sterilization'], ARRAY['scope_1', 'scope_2']),
('healthcare_pharma', 'medical_devices', 'Medical Devices', ARRAY['manufacturing', 'sterilization', 'packaging'], ARRAY['scope_1', 'scope_2', 'scope_3']),
('healthcare_pharma', 'biotech', 'Biotechnology', ARRAY['lab_operations', 'cold_storage', 'process_emissions'], ARRAY['scope_1', 'scope_2']);

-- Insert sub-industries for Retail
INSERT INTO public.industry_sub_industries (industry, sub_industry, display_name, emission_categories, typical_scopes) VALUES
('retail_consumer', 'retail_stores', 'Retail Stores', ARRAY['store_operations', 'refrigeration', 'logistics'], ARRAY['scope_1', 'scope_2', 'scope_3']),
('retail_consumer', 'ecommerce', 'E-Commerce', ARRAY['warehousing', 'last_mile_delivery', 'packaging'], ARRAY['scope_2', 'scope_3']),
('retail_consumer', 'consumer_goods', 'Consumer Goods Manufacturing', ARRAY['manufacturing', 'packaging', 'distribution'], ARRAY['scope_1', 'scope_2', 'scope_3']);

-- Insert sub-industries for Transportation
INSERT INTO public.industry_sub_industries (industry, sub_industry, display_name, emission_categories, typical_scopes) VALUES
('transportation_logistics', 'trucking', 'Trucking & Road Freight', ARRAY['vehicle_fuel', 'fleet_operations'], ARRAY['scope_1', 'scope_3']),
('transportation_logistics', 'shipping', 'Maritime Shipping', ARRAY['vessel_fuel', 'port_operations'], ARRAY['scope_1', 'scope_3']),
('transportation_logistics', 'aviation', 'Aviation', ARRAY['jet_fuel', 'ground_operations'], ARRAY['scope_1', 'scope_3']),
('transportation_logistics', 'rail', 'Rail Transport', ARRAY['locomotive_fuel', 'electricity', 'maintenance'], ARRAY['scope_1', 'scope_2']),
('transportation_logistics', 'warehousing', 'Warehousing & Distribution', ARRAY['facility_operations', 'material_handling'], ARRAY['scope_1', 'scope_2']);

-- Insert sub-industries for Construction
INSERT INTO public.industry_sub_industries (industry, sub_industry, display_name, emission_categories, typical_scopes) VALUES
('construction_real_estate', 'construction', 'Construction', ARRAY['equipment_fuel', 'materials', 'site_operations'], ARRAY['scope_1', 'scope_3']),
('construction_real_estate', 'commercial_real_estate', 'Commercial Real Estate', ARRAY['building_operations', 'tenant_services'], ARRAY['scope_1', 'scope_2', 'scope_3']),
('construction_real_estate', 'residential_real_estate', 'Residential Real Estate', ARRAY['building_operations', 'common_areas'], ARRAY['scope_1', 'scope_2']);

-- Create industry-specific emission factors table
CREATE TABLE IF NOT EXISTS public.industry_emission_factors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry text NOT NULL,
  sub_industry text,
  name text NOT NULL,
  category text NOT NULL,
  activity_type text NOT NULL,
  scope text NOT NULL CHECK (scope IN ('scope_1', 'scope_2', 'scope_3')),
  factor_value numeric(15,6) NOT NULL,
  unit text NOT NULL,
  source text NOT NULL,
  methodology text,
  region text DEFAULT 'Global',
  year integer DEFAULT 2024,
  uncertainty numeric(5,2),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.industry_emission_factors ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view industry emission factors"
ON public.industry_emission_factors FOR SELECT
USING (true);

-- Phase 2: Insert Manufacturing Emission Factors
INSERT INTO public.industry_emission_factors (industry, sub_industry, name, category, activity_type, scope, factor_value, unit, source, methodology, notes) VALUES
-- Steel Industry
('manufacturing', 'steel', 'Blast Furnace - Integrated Steel', 'process_emissions', 'steel_production_bf', 'scope_1', 1850.0, 'kg CO2e/tonne steel', 'World Steel Association', 'GHG Protocol', 'Includes coke production and sintering'),
('manufacturing', 'steel', 'Electric Arc Furnace - Steel', 'process_emissions', 'steel_production_eaf', 'scope_1', 580.0, 'kg CO2e/tonne steel', 'World Steel Association', 'GHG Protocol', 'Scrap-based EAF production'),
('manufacturing', 'steel', 'Direct Reduced Iron (DRI)', 'process_emissions', 'dri_production', 'scope_1', 1200.0, 'kg CO2e/tonne DRI', 'World Steel Association', 'GHG Protocol', 'Natural gas-based DRI'),
('manufacturing', 'steel', 'Coke Production', 'process_emissions', 'coke_production', 'scope_1', 770.0, 'kg CO2e/tonne coke', 'IPCC', 'Tier 2', 'Metallurgical coke'),
('manufacturing', 'steel', 'Sintering Process', 'process_emissions', 'sintering', 'scope_1', 200.0, 'kg CO2e/tonne sinter', 'EPA', 'GHG Protocol', 'Iron ore sintering'),

-- Cement Industry
('manufacturing', 'cement', 'Clinker Production - Calcination', 'calcination', 'clinker_calcination', 'scope_1', 525.0, 'kg CO2/tonne clinker', 'IPCC', 'Tier 2', 'Process emissions from limestone calcination'),
('manufacturing', 'cement', 'Clinker Production - Fuel Combustion', 'fuel_combustion', 'kiln_fuel', 'scope_1', 350.0, 'kg CO2e/tonne clinker', 'CSI/WBCSD', 'GHG Protocol', 'Kiln fuel combustion'),
('manufacturing', 'cement', 'Cement Grinding', 'purchased_electricity', 'cement_grinding', 'scope_2', 35.0, 'kWh/tonne cement', 'CSI/WBCSD', 'GHG Protocol', 'Electricity for finish grinding'),
('manufacturing', 'cement', 'Alternative Fuels - Waste Derived', 'fuel_combustion', 'alternative_fuel', 'scope_1', 280.0, 'kg CO2e/tonne clinker', 'CSI/WBCSD', 'GHG Protocol', 'RDF and waste-derived fuels'),

-- Chemical Industry
('manufacturing', 'chemicals', 'Ammonia Production - Steam Reforming', 'process_emissions', 'ammonia_smr', 'scope_1', 1870.0, 'kg CO2/tonne NH3', 'IEA', 'GHG Protocol', 'Natural gas steam methane reforming'),
('manufacturing', 'chemicals', 'Ammonia Production - Green Hydrogen', 'process_emissions', 'ammonia_green', 'scope_1', 50.0, 'kg CO2/tonne NH3', 'IEA', 'GHG Protocol', 'Electrolysis-based green ammonia'),
('manufacturing', 'chemicals', 'Ethylene - Steam Cracking (Naphtha)', 'process_emissions', 'ethylene_naphtha', 'scope_1', 1500.0, 'kg CO2/tonne ethylene', 'IEA', 'GHG Protocol', 'Naphtha steam cracking'),
('manufacturing', 'chemicals', 'Methanol Production', 'process_emissions', 'methanol', 'scope_1', 670.0, 'kg CO2/tonne methanol', 'IEA', 'GHG Protocol', 'Natural gas-based'),
('manufacturing', 'chemicals', 'Hydrogen Production - SMR', 'process_emissions', 'hydrogen_smr', 'scope_1', 9500.0, 'kg CO2/tonne H2', 'IEA', 'GHG Protocol', 'Grey hydrogen'),
('manufacturing', 'chemicals', 'Nitric Acid Production', 'process_emissions', 'nitric_acid', 'scope_1', 2850.0, 'kg CO2e/tonne HNO3', 'IPCC', 'Tier 2', 'N2O emissions'),

-- Automotive
('manufacturing', 'automotive', 'Paint Shop - Solvent Based', 'paint_operations', 'paint_solvent', 'scope_1', 45.0, 'kg VOC/vehicle', 'EPA', 'GHG Protocol', 'VOC emissions from painting'),
('manufacturing', 'automotive', 'Paint Shop - Waterborne', 'paint_operations', 'paint_waterborne', 'scope_1', 15.0, 'kg VOC/vehicle', 'EPA', 'GHG Protocol', 'Low-VOC waterborne paints'),
('manufacturing', 'automotive', 'Metal Stamping', 'metal_working', 'stamping', 'scope_2', 150.0, 'kWh/tonne steel', 'Automotive Industry Action Group', 'GHG Protocol', 'Press shop electricity'),
('manufacturing', 'automotive', 'Vehicle Assembly', 'assembly', 'final_assembly', 'scope_2', 350.0, 'kWh/vehicle', 'Automotive Industry Action Group', 'GHG Protocol', 'Assembly line electricity'),
('manufacturing', 'automotive', 'Welding Operations', 'metal_working', 'welding', 'scope_1', 25.0, 'kg CO2e/tonne welded', 'EPA', 'GHG Protocol', 'Welding gases and electricity'),

-- General Manufacturing
('manufacturing', 'general', 'Industrial Boiler - Natural Gas', 'fuel_combustion', 'boiler_gas', 'scope_1', 56.1, 'kg CO2/GJ', 'EPA', 'GHG Protocol', 'Natural gas combustion'),
('manufacturing', 'general', 'Industrial Boiler - Fuel Oil', 'fuel_combustion', 'boiler_oil', 'scope_1', 77.4, 'kg CO2/GJ', 'EPA', 'GHG Protocol', 'Fuel oil #2 combustion'),
('manufacturing', 'general', 'Compressed Air Systems', 'purchased_electricity', 'compressed_air', 'scope_2', 7.0, 'kWh/m3 air', 'DOE', 'GHG Protocol', 'Typical industrial air compressor'),
('manufacturing', 'general', 'Process Cooling - Chillers', 'purchased_electricity', 'chiller', 'scope_2', 0.7, 'kWh/ton-hr cooling', 'ASHRAE', 'GHG Protocol', 'Electric chiller'),
('manufacturing', 'general', 'Forklift Operations - Diesel', 'fuel_combustion', 'forklift_diesel', 'scope_1', 2.68, 'kg CO2/liter diesel', 'EPA', 'GHG Protocol', 'Diesel forklift'),
('manufacturing', 'general', 'Forklift Operations - Electric', 'purchased_electricity', 'forklift_electric', 'scope_2', 3.5, 'kWh/hour', 'EPA', 'GHG Protocol', 'Electric forklift'),

-- Pharmaceuticals
('manufacturing', 'pharmaceuticals', 'API Manufacturing - Batch', 'process_emissions', 'api_batch', 'scope_1', 150.0, 'kg CO2e/kg API', 'EFPIA', 'GHG Protocol', 'Batch synthesis'),
('manufacturing', 'pharmaceuticals', 'Cleanroom HVAC', 'hvac', 'cleanroom', 'scope_2', 500.0, 'kWh/m2/year', 'ISPE', 'GHG Protocol', 'ISO Class 7 cleanroom'),
('manufacturing', 'pharmaceuticals', 'Cold Chain Storage (-20C)', 'cold_chain', 'freezer_storage', 'scope_2', 250.0, 'kWh/m3/year', 'Cool Chain Association', 'GHG Protocol', 'Freezer storage'),
('manufacturing', 'pharmaceuticals', 'Lyophilization', 'process_emissions', 'freeze_drying', 'scope_2', 45.0, 'kWh/kg product', 'ISPE', 'GHG Protocol', 'Freeze-drying process'),

-- Food & Beverage
('manufacturing', 'food_beverage', 'Refrigerated Warehouse', 'refrigeration', 'cold_storage', 'scope_1', 25.0, 'kg CO2e/m3/year', 'GCCA', 'GHG Protocol', 'Refrigerant leakage + electricity'),
('manufacturing', 'food_beverage', 'Steam Generation - Food Processing', 'process_heat', 'steam_food', 'scope_1', 64.0, 'kg CO2/GJ steam', 'EPA', 'GHG Protocol', 'Natural gas boiler'),
('manufacturing', 'food_beverage', 'Brewing - Beer Production', 'process_emissions', 'brewing', 'scope_1', 35.0, 'kg CO2e/hl beer', 'Beverage Industry Environmental Roundtable', 'GHG Protocol', 'Includes fermentation CO2'),
('manufacturing', 'food_beverage', 'Dairy Processing', 'process_heat', 'dairy', 'scope_1', 120.0, 'kg CO2e/tonne milk processed', 'IDF', 'GHG Protocol', 'Pasteurization and processing');

-- Phase 2: Insert Energy & Utilities Emission Factors
INSERT INTO public.industry_emission_factors (industry, sub_industry, name, category, activity_type, scope, factor_value, unit, source, methodology, notes) VALUES
-- Power Generation
('energy_utilities', 'power_generation', 'Natural Gas Combined Cycle', 'fuel_combustion', 'ngcc', 'scope_1', 350.0, 'kg CO2/MWh', 'EPA eGRID', 'GHG Protocol', 'NGCC power plant'),
('energy_utilities', 'power_generation', 'Natural Gas Simple Cycle', 'fuel_combustion', 'ngsc', 'scope_1', 500.0, 'kg CO2/MWh', 'EPA eGRID', 'GHG Protocol', 'Peaker plant'),
('energy_utilities', 'power_generation', 'Coal - Subcritical', 'fuel_combustion', 'coal_subcritical', 'scope_1', 1000.0, 'kg CO2/MWh', 'EPA eGRID', 'GHG Protocol', 'Subcritical coal plant'),
('energy_utilities', 'power_generation', 'Coal - Supercritical', 'fuel_combustion', 'coal_supercritical', 'scope_1', 850.0, 'kg CO2/MWh', 'EPA eGRID', 'GHG Protocol', 'Supercritical coal plant'),
('energy_utilities', 'power_generation', 'Grid Transmission Losses', 'grid_losses', 'transmission_loss', 'scope_2', 5.0, '% of generation', 'EIA', 'GHG Protocol', 'Average T&D losses'),

-- Oil & Gas Upstream
('energy_utilities', 'oil_gas_upstream', 'Conventional Oil Extraction', 'extraction', 'oil_conventional', 'scope_1', 45.0, 'kg CO2e/bbl', 'IEA', 'GHG Protocol', 'Onshore conventional'),
('energy_utilities', 'oil_gas_upstream', 'Oil Sands Extraction', 'extraction', 'oil_sands', 'scope_1', 120.0, 'kg CO2e/bbl', 'IEA', 'GHG Protocol', 'SAGD extraction'),
('energy_utilities', 'oil_gas_upstream', 'Offshore Oil Extraction', 'extraction', 'oil_offshore', 'scope_1', 65.0, 'kg CO2e/bbl', 'IEA', 'GHG Protocol', 'Deepwater extraction'),
('energy_utilities', 'oil_gas_upstream', 'Gas Flaring', 'flaring', 'flaring', 'scope_1', 2.5, 'kg CO2/m3 gas', 'World Bank GGFR', 'GHG Protocol', 'Associated gas flaring'),
('energy_utilities', 'oil_gas_upstream', 'Gas Venting', 'venting', 'venting', 'scope_1', 21.0, 'kg CO2e/m3 gas', 'EPA', 'GHG Protocol', 'Methane venting (GWP=28)'),
('energy_utilities', 'oil_gas_upstream', 'Fugitive Emissions - Well Completions', 'fugitive_emissions', 'well_completion', 'scope_1', 8400.0, 'kg CO2e/completion', 'EPA', 'GHG Protocol', 'Hydraulic fracturing'),

-- Oil & Gas Downstream
('energy_utilities', 'oil_gas_downstream', 'Petroleum Refining', 'refining', 'refinery', 'scope_1', 35.0, 'kg CO2e/bbl processed', 'EPA', 'GHG Protocol', 'Average US refinery'),
('energy_utilities', 'oil_gas_downstream', 'Gasoline Distribution', 'distribution', 'gasoline_dist', 'scope_1', 0.02, 'kg CO2e/liter', 'EPA', 'GHG Protocol', 'Terminal to retail'),
('energy_utilities', 'oil_gas_downstream', 'LNG Liquefaction', 'process_emissions', 'lng_liquefaction', 'scope_1', 0.25, 'kg CO2e/kg LNG', 'IEA', 'GHG Protocol', 'LNG plant'),

-- Natural Gas Distribution
('energy_utilities', 'natural_gas', 'Pipeline Methane Leakage', 'pipeline_leaks', 'pipeline_leak', 'scope_1', 0.5, '% of throughput', 'EPA', 'GHG Protocol', 'Distribution system leaks'),
('energy_utilities', 'natural_gas', 'Compressor Station', 'compression', 'compressor', 'scope_1', 2.0, 'kg CO2e/GJ compressed', 'EPA', 'GHG Protocol', 'Gas-fired compressors'),

-- Water Utilities
('energy_utilities', 'water_utilities', 'Water Pumping', 'pumping', 'water_pump', 'scope_2', 0.4, 'kWh/m3', 'AWWA', 'GHG Protocol', 'Distribution pumping'),
('energy_utilities', 'water_utilities', 'Wastewater Treatment', 'treatment', 'wastewater', 'scope_1', 0.3, 'kg CO2e/m3', 'EPA', 'GHG Protocol', 'Includes N2O and CH4'),
('energy_utilities', 'water_utilities', 'Biogas from Anaerobic Digestion', 'methane_emissions', 'biogas', 'scope_1', -0.5, 'kg CO2e/m3 treated', 'EPA', 'GHG Protocol', 'Credit for energy recovery');

-- Phase 2: Insert Financial Services Emission Factors
INSERT INTO public.industry_emission_factors (industry, sub_industry, name, category, activity_type, scope, factor_value, unit, source, methodology, notes) VALUES
-- Banking
('financial_services', 'banking', 'Office Building - Urban', 'office_operations', 'office_urban', 'scope_2', 150.0, 'kWh/m2/year', 'CBECS', 'GHG Protocol', 'Urban office electricity'),
('financial_services', 'banking', 'Data Center - Traditional', 'data_centers', 'datacenter_traditional', 'scope_2', 1.8, 'PUE ratio', 'Uptime Institute', 'GHG Protocol', 'Power Usage Effectiveness'),
('financial_services', 'banking', 'Data Center - Efficient', 'data_centers', 'datacenter_efficient', 'scope_2', 1.2, 'PUE ratio', 'Uptime Institute', 'GHG Protocol', 'Hyperscale efficiency'),
('financial_services', 'banking', 'Financed Emissions - Project Finance (Power)', 'financed_emissions', 'project_power', 'scope_3', 500.0, 'tCO2e/M$ committed', 'PCAF', 'PCAF Standard', 'Category 15 - Power generation'),
('financial_services', 'banking', 'Financed Emissions - Commercial Real Estate', 'financed_emissions', 'cre_finance', 'scope_3', 50.0, 'tCO2e/M$ committed', 'PCAF', 'PCAF Standard', 'Category 15 - CRE loans'),
('financial_services', 'banking', 'Financed Emissions - Oil & Gas', 'financed_emissions', 'og_finance', 'scope_3', 800.0, 'tCO2e/M$ committed', 'PCAF', 'PCAF Standard', 'Category 15 - Fossil fuel financing'),

-- Insurance
('financial_services', 'insurance', 'Underwriting - Property Insurance (Coastal)', 'underwriting_emissions', 'underwriting_coastal', 'scope_3', 25.0, 'tCO2e/M$ premium', 'PCAF', 'GHG Protocol', 'Scope 3 facilitated emissions'),
('financial_services', 'insurance', 'Claims Processing', 'office_operations', 'claims', 'scope_2', 5.0, 'kWh/claim', 'Industry estimate', 'GHG Protocol', 'Digital claims processing'),

-- Asset Management
('financial_services', 'asset_management', 'Portfolio Emissions - Equities', 'portfolio_emissions', 'equity_portfolio', 'scope_3', 75.0, 'tCO2e/M$ AUM', 'PCAF', 'PCAF Standard', 'Weighted average'),
('financial_services', 'asset_management', 'Portfolio Emissions - Fixed Income', 'portfolio_emissions', 'bond_portfolio', 'scope_3', 50.0, 'tCO2e/M$ AUM', 'PCAF', 'PCAF Standard', 'Corporate bonds'),
('financial_services', 'asset_management', 'Trading Operations', 'office_operations', 'trading', 'scope_2', 200.0, 'kWh/m2/year', 'Industry estimate', 'GHG Protocol', 'Trading floor + servers'),

-- Real Estate Investment
('financial_services', 'real_estate_investment', 'Commercial Building Operations', 'building_operations', 'commercial_ops', 'scope_1', 25.0, 'kg CO2e/m2/year', 'CRREM', 'GHG Protocol', 'On-site fuel'),
('financial_services', 'real_estate_investment', 'Tenant Electricity', 'tenant_emissions', 'tenant_elec', 'scope_3', 100.0, 'kWh/m2/year', 'CRREM', 'GHG Protocol', 'Category 13');

-- Create industry compliance templates table
CREATE TABLE IF NOT EXISTS public.industry_compliance_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry text NOT NULL,
  framework_name text NOT NULL,
  description text,
  jurisdiction text DEFAULT 'Global',
  reporting_frequency text DEFAULT 'annual',
  typical_deadlines jsonb DEFAULT '[]',
  required_scopes text[] DEFAULT '{}',
  key_requirements text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.industry_compliance_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view industry compliance templates"
ON public.industry_compliance_templates FOR SELECT
USING (true);

-- Insert compliance templates
INSERT INTO public.industry_compliance_templates (industry, framework_name, description, jurisdiction, reporting_frequency, typical_deadlines, required_scopes, key_requirements) VALUES
-- Manufacturing
('manufacturing', 'EU ETS', 'EU Emissions Trading System', 'EU', 'annual', '[{"month": 3, "day": 31, "description": "Annual emissions report"}, {"month": 4, "day": 30, "description": "Allowance surrender"}]', ARRAY['scope_1'], ARRAY['Verified emissions report', 'Monitoring plan', 'Allowance management']),
('manufacturing', 'EPA GHGRP', 'EPA Greenhouse Gas Reporting Program', 'USA', 'annual', '[{"month": 3, "day": 31, "description": "Annual report submission"}]', ARRAY['scope_1', 'scope_2'], ARRAY['Facility-level reporting', 'Verification for large emitters']),
('manufacturing', 'ISO 14064-1', 'GHG Quantification and Reporting', 'Global', 'annual', '[{"month": 12, "day": 31, "description": "End of reporting year"}]', ARRAY['scope_1', 'scope_2', 'scope_3'], ARRAY['Third-party verification recommended', 'Base year establishment']),

-- Energy
('energy_utilities', 'EU ETS', 'EU Emissions Trading System', 'EU', 'annual', '[{"month": 3, "day": 31, "description": "Annual emissions report"}, {"month": 4, "day": 30, "description": "Allowance surrender"}]', ARRAY['scope_1'], ARRAY['Power plant emissions', 'Free allocation']),
('energy_utilities', 'SEC Climate Disclosure', 'SEC Climate-Related Disclosures', 'USA', 'annual', '[{"month": 12, "day": 31, "description": "Fiscal year end reporting"}]', ARRAY['scope_1', 'scope_2', 'scope_3'], ARRAY['Material climate risks', 'GHG emissions disclosure', 'Transition plans']),
('energy_utilities', 'TCFD', 'Task Force on Climate-related Financial Disclosures', 'Global', 'annual', '[{"month": 12, "day": 31, "description": "Annual report publication"}]', ARRAY['scope_1', 'scope_2', 'scope_3'], ARRAY['Governance', 'Strategy', 'Risk Management', 'Metrics and Targets']),

-- Financial Services
('financial_services', 'PCAF', 'Partnership for Carbon Accounting Financials', 'Global', 'annual', '[{"month": 12, "day": 31, "description": "Portfolio emissions calculation"}]', ARRAY['scope_3'], ARRAY['Financed emissions', 'Data quality scoring', 'Asset class coverage']),
('financial_services', 'NZBA', 'Net-Zero Banking Alliance', 'Global', 'annual', '[{"month": 12, "day": 31, "description": "Progress report"}]', ARRAY['scope_1', 'scope_2', 'scope_3'], ARRAY['2030 targets', 'High-carbon sector targets', 'Transition financing']),
('financial_services', 'CSRD', 'Corporate Sustainability Reporting Directive', 'EU', 'annual', '[{"month": 3, "day": 31, "description": "Sustainability report"}]', ARRAY['scope_1', 'scope_2', 'scope_3'], ARRAY['Double materiality', 'ESRS compliance', 'Third-party assurance']);

-- Create industry KPI presets table
CREATE TABLE IF NOT EXISTS public.industry_kpi_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry text NOT NULL,
  kpi_name text NOT NULL,
  kpi_key text NOT NULL,
  unit text NOT NULL,
  description text,
  calculation_method text,
  benchmark_low numeric,
  benchmark_medium numeric,
  benchmark_high numeric,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.industry_kpi_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view industry KPI presets"
ON public.industry_kpi_presets FOR SELECT
USING (true);

-- Insert KPI presets
INSERT INTO public.industry_kpi_presets (industry, kpi_name, kpi_key, unit, description, calculation_method, benchmark_low, benchmark_medium, benchmark_high, display_order) VALUES
-- Manufacturing KPIs
('manufacturing', 'Carbon Intensity (Production)', 'carbon_intensity_production', 'tCO2e/unit produced', 'Emissions per unit of production output', 'total_emissions / production_units', 0.1, 0.5, 2.0, 1),
('manufacturing', 'Energy Intensity', 'energy_intensity', 'MWh/unit produced', 'Energy consumption per unit of production', 'total_energy / production_units', 0.05, 0.2, 1.0, 2),
('manufacturing', 'Scope 1 Share', 'scope1_share', '%', 'Percentage of emissions from direct sources', '(scope_1 / total_emissions) * 100', 30, 50, 70, 3),
('manufacturing', 'Waste Diversion Rate', 'waste_diversion', '%', 'Percentage of waste diverted from landfill', '(recycled + composted) / total_waste * 100', 80, 60, 40, 4),
('manufacturing', 'Renewable Energy Share', 'renewable_share', '%', 'Percentage of energy from renewable sources', 'renewable_energy / total_energy * 100', 50, 25, 10, 5),

-- Energy KPIs
('energy_utilities', 'Carbon Intensity (Generation)', 'carbon_intensity_generation', 'kg CO2/MWh', 'Emissions per MWh of electricity generated', 'total_emissions / generation_mwh', 200, 400, 600, 1),
('energy_utilities', 'Methane Emissions Rate', 'methane_rate', '% of throughput', 'Methane emissions as percentage of gas handled', 'ch4_emissions / gas_throughput * 100', 0.2, 0.5, 1.0, 2),
('energy_utilities', 'Flaring Reduction', 'flaring_reduction', '%', 'Year-over-year flaring reduction', '(prev_flaring - curr_flaring) / prev_flaring * 100', 10, 5, 0, 3),
('energy_utilities', 'Grid Losses', 'grid_losses', '%', 'Transmission and distribution losses', 'losses / generation * 100', 3, 5, 8, 4),
('energy_utilities', 'Clean Energy Ratio', 'clean_energy_ratio', '%', 'Percentage of generation from clean sources', 'clean_generation / total_generation * 100', 60, 40, 20, 5),

-- Financial Services KPIs
('financial_services', 'Financed Emissions Intensity', 'financed_intensity', 'tCO2e/M$ AUM', 'Emissions per million dollars of assets', 'financed_emissions / aum_millions', 30, 60, 100, 1),
('financial_services', 'Portfolio Carbon Footprint', 'portfolio_footprint', 'tCO2e', 'Total emissions from investment portfolio', 'sum of weighted company emissions', 10000, 50000, 100000, 2),
('financial_services', 'WACI', 'waci', 'tCO2e/M$ revenue', 'Weighted Average Carbon Intensity', 'sum(weight * company_intensity)', 100, 200, 400, 3),
('financial_services', 'Green Financing Ratio', 'green_ratio', '%', 'Percentage of loans/investments in green projects', 'green_assets / total_assets * 100', 20, 10, 5, 4),
('financial_services', 'Office Emissions per Employee', 'office_per_employee', 'tCO2e/employee', 'Operational emissions per full-time employee', 'scope_1_2 / employee_count', 2, 4, 6, 5);

-- Create process calculators configurations table
CREATE TABLE IF NOT EXISTS public.process_calculators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry text NOT NULL,
  sub_industry text,
  calculator_name text NOT NULL,
  calculator_key text NOT NULL,
  description text,
  input_fields jsonb NOT NULL DEFAULT '[]',
  formula text NOT NULL,
  output_unit text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.process_calculators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view process calculators"
ON public.process_calculators FOR SELECT
USING (true);

-- Insert process calculators
INSERT INTO public.process_calculators (industry, sub_industry, calculator_name, calculator_key, description, input_fields, formula, output_unit) VALUES
-- Cement
('manufacturing', 'cement', 'Clinker-to-Cement Ratio Calculator', 'clinker_ratio', 'Calculate emissions based on clinker content in cement', 
'[{"name": "cement_produced", "label": "Cement Produced (tonnes)", "type": "number"}, {"name": "clinker_ratio", "label": "Clinker Ratio (%)", "type": "number", "default": 90}, {"name": "ef_clinker", "label": "Clinker EF (kg CO2/t)", "type": "number", "default": 525}]',
'cement_produced * (clinker_ratio / 100) * ef_clinker / 1000', 'tCO2'),

-- Steel
('manufacturing', 'steel', 'Steel Production Pathway Comparison', 'steel_pathway', 'Compare BF-BOF vs EAF production routes',
'[{"name": "steel_tonnes", "label": "Steel Production (tonnes)", "type": "number"}, {"name": "pathway", "label": "Production Pathway", "type": "select", "options": ["bf_bof", "eaf_scrap", "eaf_dri"]}, {"name": "scrap_ratio", "label": "Scrap Ratio (%)", "type": "number", "default": 100}]',
'steel_tonnes * pathway_factor * (1 - scrap_ratio/100 * 0.8)', 'tCO2e'),

-- Chemicals
('manufacturing', 'chemicals', 'Ammonia Production Calculator', 'ammonia_calc', 'Calculate emissions from ammonia production',
'[{"name": "ammonia_tonnes", "label": "Ammonia Produced (tonnes)", "type": "number"}, {"name": "feedstock", "label": "Feedstock", "type": "select", "options": ["natural_gas", "coal", "green_hydrogen"]}, {"name": "carbon_capture", "label": "Carbon Capture (%)", "type": "number", "default": 0}]',
'ammonia_tonnes * feedstock_factor * (1 - carbon_capture/100)', 'tCO2'),

-- Power Generation
('energy_utilities', 'power_generation', 'Power Plant Emissions Calculator', 'power_plant', 'Calculate emissions from electricity generation',
'[{"name": "generation_mwh", "label": "Generation (MWh)", "type": "number"}, {"name": "fuel_type", "label": "Fuel Type", "type": "select", "options": ["natural_gas_cc", "natural_gas_sc", "coal_sub", "coal_super"]}, {"name": "efficiency", "label": "Plant Efficiency (%)", "type": "number", "default": 45}]',
'generation_mwh * fuel_factor * (baseline_efficiency / efficiency)', 'tCO2'),

-- Financed Emissions
('financial_services', 'banking', 'PCAF Financed Emissions Calculator', 'pcaf_calc', 'Calculate financed emissions using PCAF methodology',
'[{"name": "outstanding", "label": "Outstanding Amount ($M)", "type": "number"}, {"name": "asset_class", "label": "Asset Class", "type": "select", "options": ["listed_equity", "corporate_bonds", "project_finance", "commercial_real_estate"]}, {"name": "borrower_emissions", "label": "Borrower Emissions (tCO2e)", "type": "number"}, {"name": "evic", "label": "Enterprise Value + Cash ($M)", "type": "number"}]',
'outstanding / evic * borrower_emissions', 'tCO2e');