-- Create enum types for supplier management
CREATE TYPE public.supplier_tier AS ENUM ('tier_1', 'tier_2', 'tier_3');
CREATE TYPE public.supplier_engagement_status AS ENUM ('pending', 'invited', 'active', 'unresponsive', 'declined');
CREATE TYPE public.emissions_data_quality AS ENUM ('primary', 'secondary', 'estimated', 'spend_based');
CREATE TYPE public.supplier_engagement_type AS ENUM ('survey', 'data_request', 'training', 'audit', 'collaboration');
CREATE TYPE public.verification_status AS ENUM ('unverified', 'self_declared', 'third_party_verified', 'audited');

-- Scope 3 Categories reference table (all 15 GHG Protocol categories)
CREATE TABLE public.scope3_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_number INTEGER NOT NULL UNIQUE CHECK (category_number >= 1 AND category_number <= 15),
  name TEXT NOT NULL,
  description TEXT,
  is_upstream BOOLEAN NOT NULL DEFAULT true,
  default_emission_factor NUMERIC,
  emission_factor_unit TEXT DEFAULT 'kgCO2e/USD',
  methodology_guidance TEXT,
  data_sources TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert all 15 Scope 3 categories
INSERT INTO public.scope3_categories (category_number, name, description, is_upstream, default_emission_factor, methodology_guidance) VALUES
(1, 'Purchased Goods and Services', 'Extraction, production, and transportation of goods and services purchased by the company', true, 0.5, 'Use supplier-specific data, product-level LCA, or spend-based method with EEIO factors'),
(2, 'Capital Goods', 'Extraction, production, and transportation of capital goods purchased by the company', true, 0.3, 'Use supplier-specific data or spend-based method, amortize over asset lifetime'),
(3, 'Fuel and Energy-Related Activities', 'Extraction, production, and transportation of fuels and energy not included in Scope 1 or 2', true, 0.1, 'Apply well-to-tank factors for all fuels purchased, include T&D losses'),
(4, 'Upstream Transportation and Distribution', 'Transportation and distribution of products purchased in vehicles not owned by the company', true, 0.2, 'Use distance-based or spend-based method, consider all transport modes'),
(5, 'Waste Generated in Operations', 'Disposal and treatment of waste generated in the company operations', true, 0.15, 'Track waste by type and disposal method, apply appropriate emission factors'),
(6, 'Business Travel', 'Transportation of employees for business-related activities', true, 0.25, 'Track by mode (air, rail, road), distance, and class of travel'),
(7, 'Employee Commuting', 'Transportation of employees between homes and worksites', true, 0.18, 'Survey employees or use national averages for commute distance and mode'),
(8, 'Upstream Leased Assets', 'Operation of assets leased by the company not included in Scope 1 or 2', true, 0.12, 'Apply operational control or financial control approach consistently'),
(9, 'Downstream Transportation and Distribution', 'Transportation and distribution of sold products in vehicles not owned by the company', false, 0.2, 'Estimate based on product weight, distance to customers, and transport mode'),
(10, 'Processing of Sold Products', 'Processing of intermediate products sold by downstream companies', false, 0.35, 'Estimate energy required for processing based on product characteristics'),
(11, 'Use of Sold Products', 'End use of goods and services sold by the company', false, 0.8, 'Calculate based on expected product lifetime, energy consumption, and usage patterns'),
(12, 'End-of-Life Treatment of Sold Products', 'Waste disposal and treatment of products sold by the company', false, 0.1, 'Consider product composition, recyclability, and typical end-of-life scenarios'),
(13, 'Downstream Leased Assets', 'Operation of assets owned by the company and leased to others', false, 0.15, 'Apply same methodology as Scope 1 and 2 for leased assets'),
(14, 'Franchises', 'Operation of franchises not included in Scope 1 or 2', false, 0.4, 'Aggregate Scope 1 and 2 emissions from all franchise operations'),
(15, 'Investments', 'Operation of investments not included in Scope 1 or 2', false, 0.25, 'Apply equity share or investment-specific approach based on control');

-- Suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_name TEXT,
  industry TEXT,
  country_code TEXT,
  city TEXT,
  tier public.supplier_tier NOT NULL DEFAULT 'tier_1',
  engagement_status public.supplier_engagement_status NOT NULL DEFAULT 'pending',
  emissions_data_quality public.emissions_data_quality DEFAULT 'estimated',
  annual_spend NUMERIC,
  spend_category TEXT,
  spend_currency TEXT DEFAULT 'USD',
  supplier_score INTEGER CHECK (supplier_score >= 0 AND supplier_score <= 100),
  cdp_score TEXT CHECK (cdp_score IN ('A', 'A-', 'B', 'B-', 'C', 'C-', 'D', 'D-', 'F', NULL)),
  has_science_based_target BOOLEAN DEFAULT false,
  last_data_submission TIMESTAMP WITH TIME ZONE,
  data_validity_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Supplier emissions data table
CREATE TABLE public.supplier_emissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  reporting_year INTEGER NOT NULL,
  reporting_period_start DATE,
  reporting_period_end DATE,
  scope1_emissions NUMERIC,
  scope2_emissions NUMERIC,
  scope3_emissions NUMERIC,
  total_emissions NUMERIC GENERATED ALWAYS AS (COALESCE(scope1_emissions, 0) + COALESCE(scope2_emissions, 0) + COALESCE(scope3_emissions, 0)) STORED,
  allocated_emissions NUMERIC,
  allocation_method TEXT,
  emission_intensity NUMERIC,
  intensity_unit TEXT,
  revenue NUMERIC,
  revenue_currency TEXT DEFAULT 'USD',
  methodology TEXT,
  verification_status public.verification_status DEFAULT 'unverified',
  verifier_name TEXT,
  data_source TEXT,
  uncertainty_percentage NUMERIC,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Supplier engagements tracking
CREATE TABLE public.supplier_engagements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  engagement_type public.supplier_engagement_type NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  sent_date TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  response_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'viewed', 'in_progress', 'completed', 'overdue', 'cancelled')),
  request_details JSONB,
  response_data JSONB,
  assigned_to UUID,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Supplier products with LCA data
CREATE TABLE public.supplier_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_code TEXT,
  category TEXT,
  unit TEXT NOT NULL,
  quantity_purchased NUMERIC,
  unit_price NUMERIC,
  price_currency TEXT DEFAULT 'USD',
  emission_factor NUMERIC,
  emission_factor_unit TEXT DEFAULT 'kgCO2e/unit',
  emission_factor_source TEXT,
  total_emissions NUMERIC,
  lca_available BOOLEAN DEFAULT false,
  lca_data JSONB,
  scope3_category INTEGER REFERENCES public.scope3_categories(category_number),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Organization Scope 3 summary by category
CREATE TABLE public.organization_scope3_summary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  reporting_year INTEGER NOT NULL,
  category_number INTEGER NOT NULL REFERENCES public.scope3_categories(category_number),
  emissions_tco2e NUMERIC NOT NULL DEFAULT 0,
  data_quality public.emissions_data_quality DEFAULT 'estimated',
  supplier_data_percentage NUMERIC DEFAULT 0,
  spend_based_percentage NUMERIC DEFAULT 100,
  industry_average_percentage NUMERIC DEFAULT 0,
  methodology_notes TEXT,
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, reporting_year, category_number)
);

-- Enable RLS on all tables
ALTER TABLE public.scope3_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_emissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_scope3_summary ENABLE ROW LEVEL SECURITY;

-- Scope 3 categories are public read
CREATE POLICY "Anyone can read scope3 categories"
ON public.scope3_categories FOR SELECT
USING (true);

-- Suppliers policies
CREATE POLICY "Users can view suppliers in their organization"
ON public.suppliers FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create suppliers in their organization"
ON public.suppliers FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update suppliers in their organization"
ON public.suppliers FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete suppliers in their organization"
ON public.suppliers FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

-- Supplier emissions policies
CREATE POLICY "Users can view supplier emissions in their organization"
ON public.supplier_emissions FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create supplier emissions in their organization"
ON public.supplier_emissions FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update supplier emissions in their organization"
ON public.supplier_emissions FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete supplier emissions in their organization"
ON public.supplier_emissions FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

-- Supplier engagements policies
CREATE POLICY "Users can view supplier engagements in their organization"
ON public.supplier_engagements FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create supplier engagements in their organization"
ON public.supplier_engagements FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update supplier engagements in their organization"
ON public.supplier_engagements FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete supplier engagements in their organization"
ON public.supplier_engagements FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

-- Supplier products policies
CREATE POLICY "Users can view supplier products in their organization"
ON public.supplier_products FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create supplier products in their organization"
ON public.supplier_products FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update supplier products in their organization"
ON public.supplier_products FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete supplier products in their organization"
ON public.supplier_products FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

-- Organization Scope 3 summary policies
CREATE POLICY "Users can view scope3 summary in their organization"
ON public.organization_scope3_summary FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create scope3 summary in their organization"
ON public.organization_scope3_summary FOR INSERT
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update scope3 summary in their organization"
ON public.organization_scope3_summary FOR UPDATE
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete scope3 summary in their organization"
ON public.organization_scope3_summary FOR DELETE
USING (
  organization_id IN (
    SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid()
  )
);

-- Indexes for performance
CREATE INDEX idx_suppliers_organization ON public.suppliers(organization_id);
CREATE INDEX idx_suppliers_engagement_status ON public.suppliers(engagement_status);
CREATE INDEX idx_suppliers_tier ON public.suppliers(tier);
CREATE INDEX idx_supplier_emissions_supplier ON public.supplier_emissions(supplier_id);
CREATE INDEX idx_supplier_emissions_year ON public.supplier_emissions(reporting_year);
CREATE INDEX idx_supplier_engagements_supplier ON public.supplier_engagements(supplier_id);
CREATE INDEX idx_supplier_engagements_status ON public.supplier_engagements(status);
CREATE INDEX idx_supplier_products_supplier ON public.supplier_products(supplier_id);
CREATE INDEX idx_supplier_products_category ON public.supplier_products(scope3_category);
CREATE INDEX idx_org_scope3_summary_org_year ON public.organization_scope3_summary(organization_id, reporting_year);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_supplier_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_suppliers_updated_at
BEFORE UPDATE ON public.suppliers
FOR EACH ROW EXECUTE FUNCTION public.update_supplier_updated_at();

CREATE TRIGGER update_supplier_emissions_updated_at
BEFORE UPDATE ON public.supplier_emissions
FOR EACH ROW EXECUTE FUNCTION public.update_supplier_updated_at();

CREATE TRIGGER update_supplier_engagements_updated_at
BEFORE UPDATE ON public.supplier_engagements
FOR EACH ROW EXECUTE FUNCTION public.update_supplier_updated_at();

CREATE TRIGGER update_supplier_products_updated_at
BEFORE UPDATE ON public.supplier_products
FOR EACH ROW EXECUTE FUNCTION public.update_supplier_updated_at();

CREATE TRIGGER update_org_scope3_summary_updated_at
BEFORE UPDATE ON public.organization_scope3_summary
FOR EACH ROW EXECUTE FUNCTION public.update_supplier_updated_at();