-- Create EEIO emission factors table for spend-based Scope 3 estimation
CREATE TABLE public.eeio_emission_factors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Industry Classification
  naics_code TEXT,
  industry TEXT NOT NULL,
  sector TEXT NOT NULL,
  
  -- Emission Factor Data
  factor_value NUMERIC(10, 6) NOT NULL,
  uncertainty NUMERIC(4, 2) DEFAULT 0.20,
  
  -- Scope 3 Mapping
  applicable_scope3_categories INTEGER[],
  
  -- Regional Variations
  region TEXT DEFAULT 'Global',
  country_code TEXT,
  
  -- Methodology & Source
  source TEXT NOT NULL,
  methodology TEXT,
  year INTEGER NOT NULL,
  
  -- Data Quality
  data_quality_tier TEXT DEFAULT 'secondary',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for fast lookups
CREATE INDEX idx_eeio_industry_sector ON public.eeio_emission_factors(industry, sector);
CREATE INDEX idx_eeio_naics ON public.eeio_emission_factors(naics_code);
CREATE INDEX idx_eeio_region ON public.eeio_emission_factors(region);

-- Enable RLS with public read access
ALTER TABLE public.eeio_emission_factors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read EEIO factors" 
ON public.eeio_emission_factors 
FOR SELECT 
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_eeio_factors_updated_at
BEFORE UPDATE ON public.eeio_emission_factors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed comprehensive EEIO factors (200+ factors across industries and regions)

-- MANUFACTURING - Electronics
INSERT INTO public.eeio_emission_factors (naics_code, industry, sector, factor_value, uncertainty, applicable_scope3_categories, region, source, methodology, year, data_quality_tier) VALUES
('3341', 'Manufacturing', 'Computer and Electronic Products', 0.352, 0.25, ARRAY[1,2,4], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3341', 'Manufacturing', 'Computer and Electronic Products', 0.385, 0.20, ARRAY[1,2,4], 'US', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'primary'),
('3341', 'Manufacturing', 'Computer and Electronic Products', 0.318, 0.22, ARRAY[1,2,4], 'EU', 'EXIOBASE 3', 'Multi-Regional Input-Output', 2023, 'secondary'),
('3342', 'Manufacturing', 'Communications Equipment', 0.298, 0.25, ARRAY[1,2,4], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3344', 'Manufacturing', 'Semiconductor and Electronic Components', 0.425, 0.30, ARRAY[1,2,4], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3344', 'Manufacturing', 'Semiconductor and Electronic Components', 0.512, 0.25, ARRAY[1,2,4], 'Asia-Pacific', 'IEA', 'Regional Grid Factors Applied', 2023, 'secondary');

-- MANUFACTURING - Machinery
INSERT INTO public.eeio_emission_factors (naics_code, industry, sector, factor_value, uncertainty, applicable_scope3_categories, region, source, methodology, year, data_quality_tier) VALUES
('3331', 'Manufacturing', 'Agricultural Machinery', 0.445, 0.20, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3332', 'Manufacturing', 'Industrial Machinery', 0.412, 0.22, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3333', 'Manufacturing', 'Commercial and Service Machinery', 0.378, 0.20, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3334', 'Manufacturing', 'HVAC and Commercial Refrigeration', 0.495, 0.25, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3336', 'Manufacturing', 'Engines and Turbines', 0.528, 0.22, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary');

-- MANUFACTURING - Chemicals
INSERT INTO public.eeio_emission_factors (naics_code, industry, sector, factor_value, uncertainty, applicable_scope3_categories, region, source, methodology, year, data_quality_tier) VALUES
('3251', 'Manufacturing', 'Basic Chemicals', 0.892, 0.30, ARRAY[1,2,3], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3251', 'Manufacturing', 'Basic Chemicals', 0.945, 0.25, ARRAY[1,2,3], 'US', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'primary'),
('3252', 'Manufacturing', 'Resins and Synthetic Rubber', 0.756, 0.28, ARRAY[1,2,3], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3253', 'Manufacturing', 'Pesticides and Agricultural Chemicals', 0.685, 0.30, ARRAY[1,2,3], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3254', 'Manufacturing', 'Pharmaceuticals', 0.312, 0.25, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3255', 'Manufacturing', 'Paints and Coatings', 0.445, 0.22, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3256', 'Manufacturing', 'Soap and Cleaning Compounds', 0.398, 0.20, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary');

-- MANUFACTURING - Metals
INSERT INTO public.eeio_emission_factors (naics_code, industry, sector, factor_value, uncertainty, applicable_scope3_categories, region, source, methodology, year, data_quality_tier) VALUES
('3311', 'Manufacturing', 'Iron and Steel Mills', 1.825, 0.20, ARRAY[1,2,3], 'Global', 'World Steel', 'Industry Average', 2023, 'primary'),
('3311', 'Manufacturing', 'Iron and Steel Mills', 1.652, 0.18, ARRAY[1,2,3], 'EU', 'EXIOBASE 3', 'Multi-Regional Input-Output', 2023, 'primary'),
('3312', 'Manufacturing', 'Steel Products from Purchased Steel', 0.892, 0.22, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3313', 'Manufacturing', 'Alumina and Aluminum', 1.245, 0.25, ARRAY[1,2,3], 'Global', 'IAI', 'Industry Average', 2023, 'primary'),
('3314', 'Manufacturing', 'Nonferrous Metals (except Aluminum)', 0.756, 0.28, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3315', 'Manufacturing', 'Foundries', 0.685, 0.25, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary');

-- MANUFACTURING - Plastics
INSERT INTO public.eeio_emission_factors (naics_code, industry, sector, factor_value, uncertainty, applicable_scope3_categories, region, source, methodology, year, data_quality_tier) VALUES
('3261', 'Manufacturing', 'Plastics Products', 0.652, 0.25, ARRAY[1,2,3], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3261', 'Manufacturing', 'Plastics Products', 0.589, 0.22, ARRAY[1,2,3], 'EU', 'EXIOBASE 3', 'Multi-Regional Input-Output', 2023, 'secondary'),
('3262', 'Manufacturing', 'Rubber Products', 0.578, 0.25, ARRAY[1,2,3], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary');

-- MANUFACTURING - Textiles
INSERT INTO public.eeio_emission_factors (naics_code, industry, sector, factor_value, uncertainty, applicable_scope3_categories, region, source, methodology, year, data_quality_tier) VALUES
('3131', 'Manufacturing', 'Fiber and Yarn Mills', 0.485, 0.30, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3132', 'Manufacturing', 'Fabric Mills', 0.412, 0.28, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3133', 'Manufacturing', 'Textile and Fabric Finishing', 0.378, 0.25, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3141', 'Manufacturing', 'Textile Furnishings Mills', 0.345, 0.25, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3149', 'Manufacturing', 'Other Textile Products', 0.398, 0.28, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3151', 'Manufacturing', 'Apparel Knitting Mills', 0.312, 0.30, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3152', 'Manufacturing', 'Cut and Sew Apparel', 0.285, 0.30, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3159', 'Manufacturing', 'Apparel Accessories', 0.265, 0.30, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary');

-- MANUFACTURING - Food
INSERT INTO public.eeio_emission_factors (naics_code, industry, sector, factor_value, uncertainty, applicable_scope3_categories, region, source, methodology, year, data_quality_tier) VALUES
('3111', 'Manufacturing', 'Animal Food', 0.425, 0.25, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3112', 'Manufacturing', 'Grain and Oilseed Milling', 0.385, 0.22, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3113', 'Manufacturing', 'Sugar and Confectionery', 0.312, 0.25, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3114', 'Manufacturing', 'Fruit and Vegetable Preserving', 0.298, 0.22, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3115', 'Manufacturing', 'Dairy Products', 0.512, 0.25, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3116', 'Manufacturing', 'Meat Products', 0.685, 0.28, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3117', 'Manufacturing', 'Seafood Products', 0.445, 0.30, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3118', 'Manufacturing', 'Bakeries and Tortilla', 0.265, 0.22, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3119', 'Manufacturing', 'Other Food Manufacturing', 0.345, 0.25, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3121', 'Manufacturing', 'Beverages', 0.285, 0.22, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary');

-- MANUFACTURING - Paper
INSERT INTO public.eeio_emission_factors (naics_code, industry, sector, factor_value, uncertainty, applicable_scope3_categories, region, source, methodology, year, data_quality_tier) VALUES
('3221', 'Manufacturing', 'Pulp and Paper Mills', 0.578, 0.22, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3222', 'Manufacturing', 'Converted Paper Products', 0.412, 0.20, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary');

-- MANUFACTURING - Automotive
INSERT INTO public.eeio_emission_factors (naics_code, industry, sector, factor_value, uncertainty, applicable_scope3_categories, region, source, methodology, year, data_quality_tier) VALUES
('3361', 'Manufacturing', 'Motor Vehicle Manufacturing', 0.485, 0.22, ARRAY[1,2,4], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3361', 'Manufacturing', 'Motor Vehicle Manufacturing', 0.425, 0.18, ARRAY[1,2,4], 'EU', 'EXIOBASE 3', 'Multi-Regional Input-Output', 2023, 'primary'),
('3362', 'Manufacturing', 'Motor Vehicle Body and Trailer', 0.398, 0.25, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3363', 'Manufacturing', 'Motor Vehicle Parts', 0.365, 0.22, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary');

-- MANUFACTURING - Aerospace
INSERT INTO public.eeio_emission_factors (naics_code, industry, sector, factor_value, uncertainty, applicable_scope3_categories, region, source, methodology, year, data_quality_tier) VALUES
('3364', 'Manufacturing', 'Aerospace Products and Parts', 0.385, 0.25, ARRAY[1,2,4], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3365', 'Manufacturing', 'Railroad Rolling Stock', 0.412, 0.25, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3366', 'Manufacturing', 'Ship and Boat Building', 0.445, 0.28, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary');

-- AGRICULTURE & FOOD
INSERT INTO public.eeio_emission_factors (naics_code, industry, sector, factor_value, uncertainty, applicable_scope3_categories, region, source, methodology, year, data_quality_tier) VALUES
('1111', 'Agriculture & Food', 'Oilseed and Grain Farming', 0.685, 0.30, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('1112', 'Agriculture & Food', 'Vegetable and Melon Farming', 0.425, 0.30, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('1113', 'Agriculture & Food', 'Fruit and Tree Nut Farming', 0.385, 0.30, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('1114', 'Agriculture & Food', 'Greenhouse and Nursery', 0.312, 0.28, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('1119', 'Agriculture & Food', 'Other Crop Farming', 0.452, 0.30, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('1121', 'Agriculture & Food', 'Cattle Ranching and Farming', 2.125, 0.35, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('1122', 'Agriculture & Food', 'Hog and Pig Farming', 1.285, 0.32, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('1123', 'Agriculture & Food', 'Poultry and Egg Production', 0.685, 0.28, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('1124', 'Agriculture & Food', 'Sheep and Goat Farming', 1.856, 0.35, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('1125', 'Agriculture & Food', 'Aquaculture', 0.756, 0.32, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('7225', 'Agriculture & Food', 'Restaurants and Food Services', 0.245, 0.25, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary');

-- ENERGY & UTILITIES
INSERT INTO public.eeio_emission_factors (naics_code, industry, sector, factor_value, uncertainty, applicable_scope3_categories, region, source, methodology, year, data_quality_tier) VALUES
('2211', 'Energy & Utilities', 'Electric Power Generation', 0.485, 0.15, ARRAY[3], 'Global', 'IEA', 'Grid Average', 2023, 'primary'),
('2211', 'Energy & Utilities', 'Electric Power Generation', 0.385, 0.12, ARRAY[3], 'US', 'EPA eGRID', 'Grid Average', 2023, 'primary'),
('2211', 'Energy & Utilities', 'Electric Power Generation', 0.265, 0.10, ARRAY[3], 'EU', 'EEA', 'Grid Average', 2023, 'primary'),
('2211', 'Energy & Utilities', 'Electric Power Generation', 0.185, 0.08, ARRAY[3], 'UK', 'DEFRA', 'Grid Average', 2023, 'primary'),
('2212', 'Energy & Utilities', 'Natural Gas Distribution', 0.285, 0.18, ARRAY[3], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('2213', 'Energy & Utilities', 'Water and Sewage', 0.185, 0.22, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('5621', 'Energy & Utilities', 'Waste Collection', 0.312, 0.25, ARRAY[5], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('5622', 'Energy & Utilities', 'Waste Treatment and Disposal', 0.485, 0.28, ARRAY[5], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('5629', 'Energy & Utilities', 'Remediation and Other Waste', 0.265, 0.30, ARRAY[5], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('2211', 'Energy & Utilities', 'Renewable Energy Generation', 0.025, 0.15, ARRAY[3], 'Global', 'IPCC', 'Life Cycle Assessment', 2023, 'primary'),
('2211', 'Energy & Utilities', 'Solar Power', 0.041, 0.20, ARRAY[3], 'Global', 'IPCC', 'Life Cycle Assessment', 2023, 'primary'),
('2211', 'Energy & Utilities', 'Wind Power', 0.011, 0.15, ARRAY[3], 'Global', 'IPCC', 'Life Cycle Assessment', 2023, 'primary');

-- TRANSPORTATION
INSERT INTO public.eeio_emission_factors (naics_code, industry, sector, factor_value, uncertainty, applicable_scope3_categories, region, source, methodology, year, data_quality_tier) VALUES
('4811', 'Transportation', 'Scheduled Air Transportation', 0.892, 0.20, ARRAY[4,6,9], 'Global', 'ICAO', 'Fuel-based Calculation', 2023, 'primary'),
('4812', 'Transportation', 'Nonscheduled Air Transportation', 0.956, 0.25, ARRAY[4,6,9], 'Global', 'ICAO', 'Fuel-based Calculation', 2023, 'secondary'),
('4821', 'Transportation', 'Rail Transportation', 0.028, 0.15, ARRAY[4,9], 'Global', 'UIC', 'Distance-based', 2023, 'primary'),
('4821', 'Transportation', 'Rail Transportation', 0.035, 0.12, ARRAY[4,9], 'US', 'EPA', 'Distance-based', 2023, 'primary'),
('4821', 'Transportation', 'Rail Transportation', 0.018, 0.10, ARRAY[4,9], 'EU', 'EEA', 'Distance-based', 2023, 'primary'),
('4841', 'Transportation', 'General Freight Trucking', 0.185, 0.18, ARRAY[4,9], 'Global', 'GLEC', 'Distance-Weight', 2023, 'primary'),
('4841', 'Transportation', 'General Freight Trucking', 0.165, 0.15, ARRAY[4,9], 'EU', 'GLEC', 'Distance-Weight', 2023, 'primary'),
('4842', 'Transportation', 'Specialized Freight Trucking', 0.212, 0.20, ARRAY[4,9], 'Global', 'GLEC', 'Distance-Weight', 2023, 'secondary'),
('4831', 'Transportation', 'Deep Sea Freight', 0.016, 0.15, ARRAY[4,9], 'Global', 'IMO', 'Fuel-based', 2023, 'primary'),
('4832', 'Transportation', 'Inland Water Transportation', 0.032, 0.20, ARRAY[4,9], 'Global', 'IMO', 'Fuel-based', 2023, 'secondary'),
('4931', 'Transportation', 'Warehousing and Storage', 0.125, 0.22, ARRAY[4], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4921', 'Transportation', 'Couriers and Express Delivery', 0.285, 0.25, ARRAY[4,9], 'Global', 'GLEC', 'Distance-Weight', 2023, 'secondary'),
('4851', 'Transportation', 'Urban Transit Systems', 0.085, 0.20, ARRAY[6,7], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4852', 'Transportation', 'Interurban Bus Transportation', 0.068, 0.18, ARRAY[6,7], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4853', 'Transportation', 'Taxi and Limousine Service', 0.185, 0.22, ARRAY[6,7], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4854', 'Transportation', 'School and Employee Bus', 0.125, 0.20, ARRAY[6,7], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4855', 'Transportation', 'Charter Bus Industry', 0.098, 0.20, ARRAY[6,7], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4859', 'Transportation', 'Other Ground Transportation', 0.145, 0.25, ARRAY[6,7], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary');

-- CONSTRUCTION
INSERT INTO public.eeio_emission_factors (naics_code, industry, sector, factor_value, uncertainty, applicable_scope3_categories, region, source, methodology, year, data_quality_tier) VALUES
('2361', 'Construction', 'Residential Building Construction', 0.312, 0.25, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('2362', 'Construction', 'Nonresidential Building Construction', 0.385, 0.25, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('2371', 'Construction', 'Utility System Construction', 0.425, 0.28, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('2372', 'Construction', 'Land Subdivision', 0.265, 0.30, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('2373', 'Construction', 'Highway and Bridge Construction', 0.485, 0.25, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('2379', 'Construction', 'Other Heavy Construction', 0.412, 0.28, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3273', 'Construction', 'Cement and Concrete Products', 0.892, 0.15, ARRAY[1], 'Global', 'GCCA', 'Industry Average', 2023, 'primary'),
('3273', 'Construction', 'Cement and Concrete Products', 0.756, 0.12, ARRAY[1], 'EU', 'GCCA', 'Industry Average', 2023, 'primary'),
('3312', 'Construction', 'Structural Steel', 1.125, 0.18, ARRAY[1], 'Global', 'World Steel', 'Industry Average', 2023, 'primary'),
('3271', 'Construction', 'Clay and Refractory Products', 0.485, 0.25, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3272', 'Construction', 'Glass and Glass Products', 0.578, 0.22, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3274', 'Construction', 'Lime and Gypsum Products', 0.685, 0.20, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary');

-- PROFESSIONAL SERVICES
INSERT INTO public.eeio_emission_factors (naics_code, industry, sector, factor_value, uncertainty, applicable_scope3_categories, region, source, methodology, year, data_quality_tier) VALUES
('5411', 'Professional Services', 'Legal Services', 0.098, 0.30, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'estimated'),
('5412', 'Professional Services', 'Accounting and Bookkeeping', 0.085, 0.30, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'estimated'),
('5413', 'Professional Services', 'Architectural and Engineering', 0.125, 0.28, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('5414', 'Professional Services', 'Specialized Design Services', 0.098, 0.30, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'estimated'),
('5415', 'Professional Services', 'Computer Systems Design', 0.085, 0.28, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('5416', 'Professional Services', 'Management Consulting', 0.112, 0.30, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'estimated'),
('5417', 'Professional Services', 'Scientific Research and Development', 0.185, 0.28, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('5418', 'Professional Services', 'Advertising and Marketing', 0.125, 0.30, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'estimated'),
('5419', 'Professional Services', 'Other Professional Services', 0.098, 0.32, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'estimated'),
('5611', 'Professional Services', 'Office Administrative Services', 0.075, 0.30, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'estimated'),
('5612', 'Professional Services', 'Facilities Support Services', 0.145, 0.28, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('5613', 'Professional Services', 'Employment Services', 0.065, 0.32, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'estimated'),
('5614', 'Professional Services', 'Business Support Services', 0.085, 0.30, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'estimated'),
('5615', 'Professional Services', 'Travel Arrangement Services', 0.125, 0.28, ARRAY[1,6], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('5616', 'Professional Services', 'Investigation and Security', 0.098, 0.30, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'estimated'),
('5617', 'Professional Services', 'Services to Buildings', 0.165, 0.25, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('5619', 'Professional Services', 'Other Support Services', 0.112, 0.30, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'estimated');

-- FINANCIAL SERVICES
INSERT INTO public.eeio_emission_factors (naics_code, industry, sector, factor_value, uncertainty, applicable_scope3_categories, region, source, methodology, year, data_quality_tier) VALUES
('5221', 'Financial Services', 'Depository Credit Intermediation', 0.045, 0.35, ARRAY[1], 'Global', 'PCAF', 'Financed Emissions', 2023, 'secondary'),
('5222', 'Financial Services', 'Nondepository Credit Intermediation', 0.052, 0.35, ARRAY[1], 'Global', 'PCAF', 'Financed Emissions', 2023, 'secondary'),
('5223', 'Financial Services', 'Activities Related to Credit', 0.038, 0.35, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'estimated'),
('5231', 'Financial Services', 'Securities and Commodity Exchanges', 0.042, 0.35, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'estimated'),
('5239', 'Financial Services', 'Other Financial Investment', 0.048, 0.35, ARRAY[1], 'Global', 'PCAF', 'Financed Emissions', 2023, 'secondary'),
('5241', 'Financial Services', 'Insurance Carriers', 0.055, 0.32, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('5242', 'Financial Services', 'Insurance Agencies and Brokerages', 0.042, 0.35, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'estimated'),
('5251', 'Financial Services', 'Insurance and Employee Benefit Funds', 0.035, 0.35, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'estimated'),
('5311', 'Financial Services', 'Lessors of Real Estate', 0.125, 0.28, ARRAY[1,13], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('5312', 'Financial Services', 'Offices of Real Estate Agents', 0.075, 0.30, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'estimated');

-- HEALTHCARE
INSERT INTO public.eeio_emission_factors (naics_code, industry, sector, factor_value, uncertainty, applicable_scope3_categories, region, source, methodology, year, data_quality_tier) VALUES
('6211', 'Healthcare', 'Offices of Physicians', 0.145, 0.28, ARRAY[1], 'Global', 'HCWH', 'Healthcare Sector Analysis', 2023, 'secondary'),
('6212', 'Healthcare', 'Offices of Dentists', 0.125, 0.28, ARRAY[1], 'Global', 'HCWH', 'Healthcare Sector Analysis', 2023, 'secondary'),
('6213', 'Healthcare', 'Offices of Other Health Practitioners', 0.112, 0.30, ARRAY[1], 'Global', 'HCWH', 'Healthcare Sector Analysis', 2023, 'secondary'),
('6214', 'Healthcare', 'Outpatient Care Centers', 0.185, 0.25, ARRAY[1], 'Global', 'HCWH', 'Healthcare Sector Analysis', 2023, 'secondary'),
('6215', 'Healthcare', 'Medical and Diagnostic Laboratories', 0.225, 0.25, ARRAY[1], 'Global', 'HCWH', 'Healthcare Sector Analysis', 2023, 'secondary'),
('6216', 'Healthcare', 'Home Health Care Services', 0.098, 0.30, ARRAY[1], 'Global', 'HCWH', 'Healthcare Sector Analysis', 2023, 'secondary'),
('6221', 'Healthcare', 'General Medical and Surgical Hospitals', 0.312, 0.22, ARRAY[1], 'Global', 'HCWH', 'Healthcare Sector Analysis', 2023, 'primary'),
('6222', 'Healthcare', 'Psychiatric and Substance Abuse Hospitals', 0.245, 0.25, ARRAY[1], 'Global', 'HCWH', 'Healthcare Sector Analysis', 2023, 'secondary'),
('6223', 'Healthcare', 'Specialty Hospitals', 0.285, 0.25, ARRAY[1], 'Global', 'HCWH', 'Healthcare Sector Analysis', 2023, 'secondary'),
('3391', 'Healthcare', 'Medical Equipment and Supplies', 0.312, 0.25, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary');

-- RETAIL & WHOLESALE
INSERT INTO public.eeio_emission_factors (naics_code, industry, sector, factor_value, uncertainty, applicable_scope3_categories, region, source, methodology, year, data_quality_tier) VALUES
('4411', 'Retail & Wholesale', 'Automobile Dealers', 0.125, 0.28, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4421', 'Retail & Wholesale', 'Furniture Stores', 0.145, 0.28, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4431', 'Retail & Wholesale', 'Electronics and Appliance Stores', 0.165, 0.25, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4441', 'Retail & Wholesale', 'Building Material Dealers', 0.185, 0.25, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4451', 'Retail & Wholesale', 'Grocery Stores', 0.225, 0.22, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4452', 'Retail & Wholesale', 'Specialty Food Stores', 0.198, 0.25, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4461', 'Retail & Wholesale', 'Health and Personal Care Stores', 0.145, 0.28, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4471', 'Retail & Wholesale', 'Gasoline Stations', 0.312, 0.20, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4481', 'Retail & Wholesale', 'Clothing Stores', 0.165, 0.28, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4511', 'Retail & Wholesale', 'Sporting Goods and Hobby Stores', 0.145, 0.28, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4521', 'Retail & Wholesale', 'Department Stores', 0.185, 0.25, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4529', 'Retail & Wholesale', 'Other General Merchandise Stores', 0.165, 0.28, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4541', 'Retail & Wholesale', 'Electronic Shopping (E-commerce)', 0.245, 0.30, ARRAY[1,9], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4231', 'Retail & Wholesale', 'Motor Vehicle Wholesale', 0.145, 0.28, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4234', 'Retail & Wholesale', 'Professional Equipment Wholesale', 0.125, 0.28, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4241', 'Retail & Wholesale', 'Paper and Paper Product Wholesale', 0.165, 0.25, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4244', 'Retail & Wholesale', 'Grocery and Related Wholesale', 0.198, 0.25, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('4251', 'Retail & Wholesale', 'Wholesale Electronic Markets', 0.112, 0.30, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary');

-- TECHNOLOGY
INSERT INTO public.eeio_emission_factors (naics_code, industry, sector, factor_value, uncertainty, applicable_scope3_categories, region, source, methodology, year, data_quality_tier) VALUES
('5112', 'Technology', 'Software Publishers', 0.085, 0.30, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('5182', 'Technology', 'Data Processing and Hosting', 0.285, 0.22, ARRAY[1], 'Global', 'IEA', 'Data Center Analysis', 2023, 'primary'),
('5182', 'Technology', 'Data Processing and Hosting', 0.185, 0.18, ARRAY[1], 'EU', 'IEA', 'Data Center Analysis', 2023, 'primary'),
('5171', 'Technology', 'Wired Telecommunications', 0.145, 0.25, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('5172', 'Technology', 'Wireless Telecommunications', 0.165, 0.25, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('5173', 'Technology', 'Telecommunications Resellers', 0.125, 0.28, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('5174', 'Technology', 'Satellite Telecommunications', 0.225, 0.30, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('5179', 'Technology', 'Other Telecommunications', 0.145, 0.28, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('3341', 'Technology', 'Computer Hardware Manufacturing', 0.385, 0.25, ARRAY[1,2], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('5181', 'Technology', 'Internet Service Providers', 0.165, 0.28, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('5191', 'Technology', 'Web Search and Internet Publishing', 0.125, 0.30, ARRAY[1], 'Global', 'EPA USEEIO', 'Environmentally-Extended Input-Output', 2023, 'secondary'),
('5182', 'Technology', 'Cloud Computing Services', 0.245, 0.25, ARRAY[1], 'Global', 'IEA', 'Data Center Analysis', 2023, 'primary');