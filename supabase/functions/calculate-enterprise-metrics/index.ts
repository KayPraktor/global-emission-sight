import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting enterprise metrics calculation...');

    // Fetch all organizations
    const { data: organizations, error: orgsError } = await supabase
      .from('organizations')
      .select('id');

    if (orgsError) throw orgsError;

    console.log(`Found ${organizations?.length || 0} organizations to process`);

    const results = [];

    for (const org of organizations || []) {
      console.log(`Processing organization: ${org.id}`);

      // Fetch emissions data for the organization
      const { data: emissions, error: emissionsError } = await supabase
        .from('emissions_entries')
        .select('*, calculations(*)')
        .eq('organization_id', org.id)
        .gte('entry_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      if (emissionsError) {
        console.error(`Error fetching emissions for org ${org.id}:`, emissionsError);
        continue;
      }

      // Calculate total emissions
      const totalEmissions = emissions?.reduce((sum, entry: any) => {
        const calculation = Array.isArray(entry.calculations) && entry.calculations.length > 0 
          ? entry.calculations[0] 
          : null;
        return sum + (calculation?.calculated_emissions || 0);
      }, 0) || 0;

      // Calculate scope breakdowns
      const scope1 = emissions?.filter((e: any) => e.scope === 'S1').reduce((sum, entry: any) => {
        const calculation = Array.isArray(entry.calculations) && entry.calculations.length > 0 
          ? entry.calculations[0] 
          : null;
        return sum + (calculation?.calculated_emissions || 0);
      }, 0) || 0;

      const scope2 = emissions?.filter((e: any) => e.scope === 'S2').reduce((sum, entry: any) => {
        const calculation = Array.isArray(entry.calculations) && entry.calculations.length > 0 
          ? entry.calculations[0] 
          : null;
        return sum + (calculation?.calculated_emissions || 0);
      }, 0) || 0;

      const scope3 = emissions?.filter((e: any) => e.scope === 'S3').reduce((sum, entry: any) => {
        const calculation = Array.isArray(entry.calculations) && entry.calculations.length > 0 
          ? entry.calculations[0] 
          : null;
        return sum + (calculation?.calculated_emissions || 0);
      }, 0) || 0;

      // Calculate carbon cost (assuming $50 per tCO2e)
      const carbonCost = totalEmissions * 50;

      // Fetch quality metrics
      const { data: qualityMetrics } = await supabase
        .from('quality_tracking')
        .select('overall_score, critical_issues')
        .eq('organization_id', org.id)
        .order('metric_date', { ascending: false })
        .limit(1);

      const complianceScore = qualityMetrics?.[0]?.overall_score || 0;
      const criticalIssues = qualityMetrics?.[0]?.critical_issues || 0;

      // Fetch facilities for carbon intensity
      const { data: facilities } = await supabase
        .from('facilities')
        .select('annual_revenue')
        .eq('organization_id', org.id);

      const totalRevenue = facilities?.reduce((sum: number, f: any) => sum + (f.annual_revenue || 0), 0) || 1;
      const carbonIntensity = totalEmissions / (totalRevenue / 1000000);

      // Fetch goals for net zero progress
      const { data: goals } = await supabase
        .from('goals')
        .select('progress_percentage')
        .eq('organization_id', org.id)
        .ilike('title', '%net zero%')
        .limit(1);

      const netZeroProgress = goals?.[0]?.progress_percentage || 0;

      // Risk exposure
      const riskExposure = criticalIssues * 10000;

      // Save metrics
      const metrics = {
        organization_id: org.id,
        metric_date: new Date().toISOString().split('T')[0],
        total_emissions: totalEmissions,
        carbon_cost: carbonCost,
        compliance_score: complianceScore,
        carbon_intensity: carbonIntensity,
        net_zero_progress: netZeroProgress,
        risk_exposure: riskExposure,
        scope_1_emissions: scope1,
        scope_2_emissions: scope2,
        scope_3_emissions: scope3,
        metadata: {
          calculated_at: new Date().toISOString(),
          emissions_count: emissions?.length || 0
        }
      };

      const { error: saveError } = await supabase
        .from('enterprise_metrics')
        .upsert(metrics, {
          onConflict: 'organization_id,metric_date'
        });

      if (saveError) {
        console.error(`Error saving metrics for org ${org.id}:`, saveError);
      } else {
        console.log(`Successfully calculated metrics for org ${org.id}`);
        results.push({ organization_id: org.id, status: 'success', metrics });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.length} organizations`,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in calculate-enterprise-metrics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
