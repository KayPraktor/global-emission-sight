import { supabase } from '@/integrations/supabase/client';

/**
 * Updates the organization's industry and sub-industry
 */
export async function updateOrganizationIndustry(
  organizationId: string,
  industry: string,
  subIndustry?: string | null
) {
  const { error } = await supabase
    .from('organizations')
    .update({
      industry,
      sub_industry: subIndustry || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', organizationId);

  if (error) {
    throw new Error(`Failed to update organization industry: ${error.message}`);
  }

  return { success: true };
}

/**
 * Gets the organization's industry details
 */
export async function getOrganizationIndustry(organizationId: string) {
  const { data, error } = await supabase
    .from('organizations')
    .select('industry, sub_industry, employee_count, annual_revenue_usd, square_footage')
    .eq('id', organizationId)
    .single();

  if (error) {
    console.error('Error fetching organization industry:', error);
    return null;
  }

  return data;
}

/**
 * Gets industry-specific emission factors
 */
export async function getIndustryEmissionFactors(industry: string, subIndustry?: string | null) {
  let query = supabase
    .from('industry_emission_factors')
    .select('*')
    .eq('industry', industry)
    .order('category')
    .order('name');

  if (subIndustry) {
    query = query.or(`sub_industry.eq.${subIndustry},sub_industry.is.null`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching industry emission factors:', error);
    return [];
  }

  return data || [];
}

/**
 * Gets sub-industries for a given industry
 */
export async function getSubIndustries(industry: string) {
  const { data, error } = await supabase
    .from('industry_sub_industries')
    .select('*')
    .eq('industry', industry)
    .order('display_name');

  if (error) {
    console.error('Error fetching sub-industries:', error);
    return [];
  }

  return data || [];
}

/**
 * Gets industry KPI presets
 */
export async function getIndustryKPIPresets(industry: string) {
  const { data, error } = await supabase
    .from('industry_kpi_presets')
    .select('*')
    .eq('industry', industry)
    .order('display_order');

  if (error) {
    console.error('Error fetching industry KPIs:', error);
    return [];
  }

  return data || [];
}

/**
 * Gets industry compliance templates
 */
export async function getIndustryComplianceTemplates(industry: string) {
  const { data, error } = await supabase
    .from('industry_compliance_templates')
    .select('*')
    .eq('industry', industry)
    .order('framework_name');

  if (error) {
    console.error('Error fetching compliance templates:', error);
    return [];
  }

  return data || [];
}

/**
 * Gets process calculators for an industry
 */
export async function getProcessCalculators(industry: string, subIndustry?: string | null) {
  let query = supabase
    .from('process_calculators')
    .select('*')
    .eq('industry', industry)
    .order('calculator_name');

  if (subIndustry) {
    query = query.or(`sub_industry.eq.${subIndustry},sub_industry.is.null`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching process calculators:', error);
    return [];
  }

  return data || [];
}
