-- Add comprehensive emission factors for manufacturing sub-sectors

-- AUTOMOTIVE - Additional factors
INSERT INTO public.industry_emission_factors (industry, sub_industry, name, category, activity_type, scope, factor_value, unit, source, methodology, region, year, uncertainty, notes) VALUES
('manufacturing', 'automotive', 'Paint Booth Electricity', 'Process Emissions', 'paint_operations', 'scope_2', 0.45, 'kg CO2e/kWh', 'EPA GHG Inventory', 'Direct measurement', 'Global', 2024, 8, 'Paint spray booth ventilation and curing'),
('manufacturing', 'automotive', 'Metal Stamping Energy', 'Process Emissions', 'metal_forming', 'scope_2', 0.38, 'kg CO2e/kWh', 'EPA GHG Inventory', 'Direct measurement', 'Global', 2024, 10, 'Hydraulic press energy consumption'),
('manufacturing', 'automotive', 'E-Coat Process', 'Process Emissions', 'surface_treatment', 'scope_1', 2.8, 'kg CO2e/vehicle', 'EPA GHG Inventory', 'Mass balance', 'Global', 2024, 12, 'Electrocoating primer application'),
('manufacturing', 'automotive', 'Vehicle Assembly Line', 'Process Emissions', 'assembly', 'scope_2', 85.0, 'kg CO2e/vehicle', 'EPA GHG Inventory', 'Direct measurement', 'Global', 2024, 15, 'Total assembly line energy per vehicle'),
('manufacturing', 'automotive', 'Welding Robot Operations', 'Process Emissions', 'welding', 'scope_2', 0.52, 'kg CO2e/kWh', 'EPA GHG Inventory', 'Direct measurement', 'Global', 2024, 8, 'Robotic spot and MIG welding'),
('manufacturing', 'automotive', 'Die Casting Aluminum', 'Process Emissions', 'casting', 'scope_1', 1.9, 'kg CO2e/kg aluminum', 'IPCC 2006', 'Mass balance', 'Global', 2024, 10, 'High-pressure die casting'),
('manufacturing', 'automotive', 'Heat Treatment Furnace', 'Stationary Combustion', 'heat_treatment', 'scope_1', 0.058, 'kg CO2e/MJ', 'EPA GHG Inventory', 'Direct measurement', 'Global', 2024, 5, 'Natural gas fired heat treatment'),
('manufacturing', 'automotive', 'VOC Emissions - Paint', 'Fugitive Emissions', 'voc_emissions', 'scope_1', 4.2, 'kg CO2e/kg VOC', 'EPA AP-42', 'Emission factor', 'Global', 2024, 20, 'Volatile organic compound emissions'),
('manufacturing', 'automotive', 'Coolant & Lubricant Use', 'Process Emissions', 'machining', 'scope_3', 0.85, 'kg CO2e/liter', 'GHG Protocol', 'Life cycle', 'Global', 2024, 15, 'Metalworking fluid lifecycle emissions'),
('manufacturing', 'automotive', 'Tire Manufacturing', 'Process Emissions', 'tire_production', 'scope_1', 12.5, 'kg CO2e/tire', 'IPCC 2006', 'Mass balance', 'Global', 2024, 12, 'Rubber compounding and vulcanization');

-- CHEMICALS - Additional factors
INSERT INTO public.industry_emission_factors (industry, sub_industry, name, category, activity_type, scope, factor_value, unit, source, methodology, region, year, uncertainty, notes) VALUES
('manufacturing', 'chemicals', 'Ethylene Production', 'Process Emissions', 'petrochemicals', 'scope_1', 1.52, 'kg CO2e/kg ethylene', 'IPCC 2006', 'Stoichiometric', 'Global', 2024, 8, 'Steam cracking of naphtha'),
('manufacturing', 'chemicals', 'Polyethylene Production', 'Process Emissions', 'polymers', 'scope_1', 1.85, 'kg CO2e/kg PE', 'GHG Protocol', 'Mass balance', 'Global', 2024, 10, 'HDPE and LDPE production'),
('manufacturing', 'chemicals', 'Chlor-Alkali Process', 'Process Emissions', 'chlorine', 'scope_2', 2.45, 'kg CO2e/kg chlorine', 'IPCC 2006', 'Direct measurement', 'Global', 2024, 8, 'Membrane cell electrolysis'),
('manufacturing', 'chemicals', 'Sulfuric Acid Production', 'Process Emissions', 'acids', 'scope_1', 0.12, 'kg CO2e/kg H2SO4', 'EPA GHG Inventory', 'Mass balance', 'Global', 2024, 12, 'Contact process'),
('manufacturing', 'chemicals', 'Nitric Acid Production', 'Process Emissions', 'acids', 'scope_1', 7.2, 'kg CO2e/kg HNO3', 'IPCC 2006', 'Direct measurement', 'Global', 2024, 10, 'N2O emissions from oxidation'),
('manufacturing', 'chemicals', 'Adipic Acid Production', 'Process Emissions', 'specialty', 'scope_1', 8.5, 'kg CO2e/kg adipic acid', 'IPCC 2006', 'Stoichiometric', 'Global', 2024, 15, 'N2O from cyclohexane oxidation'),
('manufacturing', 'chemicals', 'Methanol Synthesis', 'Process Emissions', 'petrochemicals', 'scope_1', 0.67, 'kg CO2e/kg methanol', 'IPCC 2006', 'Mass balance', 'Global', 2024, 8, 'Natural gas steam reforming'),
('manufacturing', 'chemicals', 'Refrigerant Leakage HFC', 'Fugitive Emissions', 'refrigerants', 'scope_1', 1430, 'kg CO2e/kg HFC-134a', 'IPCC AR5', 'GWP factor', 'Global', 2024, 5, 'HFC-134a global warming potential'),
('manufacturing', 'chemicals', 'Solvent Recovery', 'Process Emissions', 'solvents', 'scope_1', 0.35, 'kg CO2e/kg recovered', 'EPA GHG Inventory', 'Direct measurement', 'Global', 2024, 15, 'Distillation energy'),
('manufacturing', 'chemicals', 'Catalyst Regeneration', 'Process Emissions', 'catalysts', 'scope_1', 0.28, 'kg CO2e/kg catalyst', 'Industry data', 'Mass balance', 'Global', 2024, 20, 'Coke burn-off regeneration');

-- FOOD & BEVERAGE - Additional factors
INSERT INTO public.industry_emission_factors (industry, sub_industry, name, category, activity_type, scope, factor_value, unit, source, methodology, region, year, uncertainty, notes) VALUES
('manufacturing', 'food_beverage', 'Dairy Processing', 'Process Emissions', 'dairy', 'scope_1', 0.42, 'kg CO2e/liter milk', 'IPCC 2006', 'Direct measurement', 'Global', 2024, 12, 'Pasteurization and homogenization'),
('manufacturing', 'food_beverage', 'Meat Processing', 'Process Emissions', 'meat', 'scope_1', 2.8, 'kg CO2e/kg meat', 'EPA GHG Inventory', 'Direct measurement', 'Global', 2024, 15, 'Slaughter and processing'),
('manufacturing', 'food_beverage', 'Bakery Ovens Natural Gas', 'Stationary Combustion', 'baking', 'scope_1', 0.058, 'kg CO2e/MJ', 'EPA GHG Inventory', 'Direct measurement', 'Global', 2024, 5, 'Industrial bread ovens'),
('manufacturing', 'food_beverage', 'Beverage Bottling Line', 'Process Emissions', 'bottling', 'scope_2', 0.025, 'kg CO2e/liter', 'Industry data', 'Direct measurement', 'Global', 2024, 10, 'Filling and capping operations'),
('manufacturing', 'food_beverage', 'Brewing Fermentation', 'Process Emissions', 'brewing', 'scope_1', 8.5, 'kg CO2e/hectoliter', 'Industry data', 'Mass balance', 'Global', 2024, 12, 'CO2 from yeast fermentation'),
('manufacturing', 'food_beverage', 'Cold Storage Refrigeration', 'Fugitive Emissions', 'refrigeration', 'scope_1', 1.8, 'kg CO2e/m³/year', 'EPA GHG Inventory', 'Emission factor', 'Global', 2024, 15, 'Ammonia/HFC refrigerant systems'),
('manufacturing', 'food_beverage', 'Sugar Refining', 'Process Emissions', 'sugar', 'scope_1', 0.35, 'kg CO2e/kg sugar', 'IPCC 2006', 'Mass balance', 'Global', 2024, 10, 'Evaporation and crystallization'),
('manufacturing', 'food_beverage', 'Cooking Oil Processing', 'Process Emissions', 'oils', 'scope_1', 0.28, 'kg CO2e/liter oil', 'Industry data', 'Direct measurement', 'Global', 2024, 12, 'Extraction and refining'),
('manufacturing', 'food_beverage', 'Wastewater Treatment', 'Process Emissions', 'wastewater', 'scope_1', 0.85, 'kg CO2e/m³', 'IPCC 2006', 'Emission factor', 'Global', 2024, 20, 'Anaerobic digestion CH4'),
('manufacturing', 'food_beverage', 'CIP Cleaning Systems', 'Process Emissions', 'cleaning', 'scope_2', 0.15, 'kg CO2e/cycle', 'Industry data', 'Direct measurement', 'Global', 2024, 15, 'Clean-in-place energy');

-- TEXTILES - New sub-industry
INSERT INTO public.industry_emission_factors (industry, sub_industry, name, category, activity_type, scope, factor_value, unit, source, methodology, region, year, uncertainty, notes) VALUES
('manufacturing', 'textiles', 'Cotton Spinning', 'Process Emissions', 'spinning', 'scope_2', 2.5, 'kg CO2e/kg yarn', 'GHG Protocol', 'Direct measurement', 'Global', 2024, 12, 'Ring and rotor spinning energy'),
('manufacturing', 'textiles', 'Synthetic Fiber Production', 'Process Emissions', 'fiber_production', 'scope_1', 5.8, 'kg CO2e/kg fiber', 'IPCC 2006', 'Mass balance', 'Global', 2024, 10, 'Polyester and nylon production'),
('manufacturing', 'textiles', 'Fabric Weaving', 'Process Emissions', 'weaving', 'scope_2', 1.2, 'kg CO2e/kg fabric', 'Industry data', 'Direct measurement', 'Global', 2024, 15, 'Loom operations energy'),
('manufacturing', 'textiles', 'Dyeing & Finishing', 'Process Emissions', 'dyeing', 'scope_1', 8.5, 'kg CO2e/kg fabric', 'EPA GHG Inventory', 'Mass balance', 'Global', 2024, 15, 'Hot water and steam for dyeing'),
('manufacturing', 'textiles', 'Bleaching Process', 'Process Emissions', 'bleaching', 'scope_1', 3.2, 'kg CO2e/kg fabric', 'Industry data', 'Direct measurement', 'Global', 2024, 12, 'Hydrogen peroxide bleaching'),
('manufacturing', 'textiles', 'Textile Printing', 'Process Emissions', 'printing', 'scope_1', 2.1, 'kg CO2e/kg fabric', 'GHG Protocol', 'Direct measurement', 'Global', 2024, 15, 'Screen and digital printing'),
('manufacturing', 'textiles', 'Garment Cutting', 'Process Emissions', 'cutting', 'scope_2', 0.35, 'kg CO2e/kg fabric', 'Industry data', 'Direct measurement', 'Global', 2024, 10, 'Automated cutting machines'),
('manufacturing', 'textiles', 'Garment Sewing', 'Process Emissions', 'sewing', 'scope_2', 0.85, 'kg CO2e/garment', 'Industry data', 'Direct measurement', 'Global', 2024, 12, 'Industrial sewing machines'),
('manufacturing', 'textiles', 'Steam Boiler - Textile', 'Stationary Combustion', 'steam', 'scope_1', 0.058, 'kg CO2e/MJ', 'EPA GHG Inventory', 'Direct measurement', 'Global', 2024, 5, 'Natural gas fired steam generation'),
('manufacturing', 'textiles', 'Wastewater Treatment - Dye', 'Process Emissions', 'wastewater', 'scope_1', 1.5, 'kg CO2e/m³', 'IPCC 2006', 'Emission factor', 'Global', 2024, 20, 'Treatment of dye effluent'),
('manufacturing', 'textiles', 'Mercerizing Cotton', 'Process Emissions', 'finishing', 'scope_1', 1.8, 'kg CO2e/kg cotton', 'Industry data', 'Mass balance', 'Global', 2024, 15, 'Caustic soda treatment'),
('manufacturing', 'textiles', 'Fabric Coating', 'Process Emissions', 'coating', 'scope_1', 2.5, 'kg CO2e/kg fabric', 'EPA GHG Inventory', 'Direct measurement', 'Global', 2024, 15, 'PU and PVC coating');

-- Add textiles to sub-industries table
INSERT INTO public.industry_sub_industries (industry, sub_industry, display_name, emission_categories, typical_scopes) VALUES
('manufacturing', 'textiles', 'Textiles & Apparel', ARRAY['spinning', 'weaving', 'dyeing', 'finishing', 'garment'], ARRAY['scope_1', 'scope_2', 'scope_3']);

-- Add industry KPI presets for these sub-sectors
INSERT INTO public.industry_kpi_presets (industry, kpi_name, kpi_key, unit, description, calculation_method, benchmark_low, benchmark_medium, benchmark_high, display_order) VALUES
('manufacturing', 'Water Intensity', 'water_intensity', 'm³/tonne product', 'Water consumption per unit of production', 'total_water / production_volume', 2.0, 5.0, 10.0, 10),
('manufacturing', 'Waste Diversion Rate', 'waste_diversion', '%', 'Percentage of waste recycled or recovered', '(recycled_waste / total_waste) * 100', 80, 60, 40, 11),
('manufacturing', 'Steam Efficiency', 'steam_efficiency', 'kg steam/kg product', 'Steam consumption efficiency for process heat', 'total_steam / production_volume', 1.5, 2.5, 4.0, 12);

-- Add compliance templates for manufacturing sectors
INSERT INTO public.industry_compliance_templates (industry, framework_name, description, jurisdiction, required_scopes, key_requirements, reporting_frequency, typical_deadlines) VALUES
('manufacturing', 'EPA GHGRP - Manufacturing', 'EPA Greenhouse Gas Reporting Program for manufacturing facilities', 'United States', ARRAY['scope_1', 'scope_2'], ARRAY['Process emissions reporting', 'Combustion emissions', 'Fluorinated gas tracking', 'Supplier verification'], 'annual', '{"submission": "March 31", "verification": "June 30"}'::jsonb),
('manufacturing', 'EU BAT-AEL Compliance', 'Best Available Techniques Associated Emission Levels', 'European Union', ARRAY['scope_1'], ARRAY['BAT implementation assessment', 'Emission limit compliance', 'Energy efficiency measures', 'Waste minimization'], 'annual', '{"permit_review": "Every 4 years", "annual_report": "March 31"}'::jsonb),
('manufacturing', 'California AB 32', 'California Global Warming Solutions Act manufacturing requirements', 'California, US', ARRAY['scope_1', 'scope_2'], ARRAY['Cap-and-trade compliance', 'Allowance tracking', 'Offset verification', 'Third-party verification'], 'annual', '{"compliance_report": "November 1", "verification": "September 1"}'::jsonb);