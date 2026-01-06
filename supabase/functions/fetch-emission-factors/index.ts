import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mock data generators for different sources
const mockEPAeGRIDFactors = () => [
  { external_id: 'egrid_2024_us_avg', name: 'US Average Grid Electricity', category: 'Electricity', scope: 'scope_2', value: 0.417, unit: 'kg CO2e/kWh', region: 'US', year: 2024 },
  { external_id: 'egrid_2024_camx', name: 'CAMX Grid Electricity (California)', category: 'Electricity', scope: 'scope_2', value: 0.225, unit: 'kg CO2e/kWh', region: 'US-CA', year: 2024 },
  { external_id: 'egrid_2024_rfcw', name: 'RFCW Grid Electricity (Midwest)', category: 'Electricity', scope: 'scope_2', value: 0.512, unit: 'kg CO2e/kWh', region: 'US-MW', year: 2024 },
  { external_id: 'egrid_2024_nyup', name: 'NYUP Grid Electricity (New York)', category: 'Electricity', scope: 'scope_2', value: 0.189, unit: 'kg CO2e/kWh', region: 'US-NY', year: 2024 },
  { external_id: 'egrid_2024_srso', name: 'SRSO Grid Electricity (Southeast)', category: 'Electricity', scope: 'scope_2', value: 0.456, unit: 'kg CO2e/kWh', region: 'US-SE', year: 2024 },
];

const mockDEFRAFactors = () => [
  { external_id: 'defra_2024_nat_gas', name: 'Natural Gas', category: 'Stationary Combustion', scope: 'scope_1', value: 2.02, unit: 'kg CO2e/m³', region: 'UK', year: 2024 },
  { external_id: 'defra_2024_diesel', name: 'Diesel (average biofuel blend)', category: 'Mobile Combustion', scope: 'scope_1', value: 2.51, unit: 'kg CO2e/litre', region: 'UK', year: 2024 },
  { external_id: 'defra_2024_petrol', name: 'Petrol (average biofuel blend)', category: 'Mobile Combustion', scope: 'scope_1', value: 2.19, unit: 'kg CO2e/litre', region: 'UK', year: 2024 },
  { external_id: 'defra_2024_uk_elec', name: 'UK Grid Electricity', category: 'Electricity', scope: 'scope_2', value: 0.207, unit: 'kg CO2e/kWh', region: 'UK', year: 2024 },
  { external_id: 'defra_2024_flight_short', name: 'Short-haul Flight (economy)', category: 'Business Travel', scope: 'scope_3', value: 0.156, unit: 'kg CO2e/km', region: 'UK', year: 2024 },
];

const mockIEAFactors = () => [
  { external_id: 'iea_2024_de_elec', name: 'Germany Grid Electricity', category: 'Electricity', scope: 'scope_2', value: 0.385, unit: 'kg CO2e/kWh', region: 'DE', year: 2024 },
  { external_id: 'iea_2024_fr_elec', name: 'France Grid Electricity', category: 'Electricity', scope: 'scope_2', value: 0.052, unit: 'kg CO2e/kWh', region: 'FR', year: 2024 },
  { external_id: 'iea_2024_cn_elec', name: 'China Grid Electricity', category: 'Electricity', scope: 'scope_2', value: 0.581, unit: 'kg CO2e/kWh', region: 'CN', year: 2024 },
  { external_id: 'iea_2024_in_elec', name: 'India Grid Electricity', category: 'Electricity', scope: 'scope_2', value: 0.708, unit: 'kg CO2e/kWh', region: 'IN', year: 2024 },
  { external_id: 'iea_2024_jp_elec', name: 'Japan Grid Electricity', category: 'Electricity', scope: 'scope_2', value: 0.474, unit: 'kg CO2e/kWh', region: 'JP', year: 2024 },
];

const mockGHGProtocolFactors = () => [
  { external_id: 'ghgp_2024_rail_freight', name: 'Rail Freight', category: 'Freight Transport', scope: 'scope_3', value: 0.028, unit: 'kg CO2e/tonne-km', region: 'Global', year: 2024 },
  { external_id: 'ghgp_2024_road_freight', name: 'Road Freight (HGV)', category: 'Freight Transport', scope: 'scope_3', value: 0.107, unit: 'kg CO2e/tonne-km', region: 'Global', year: 2024 },
  { external_id: 'ghgp_2024_sea_freight', name: 'Sea Freight (container)', category: 'Freight Transport', scope: 'scope_3', value: 0.016, unit: 'kg CO2e/tonne-km', region: 'Global', year: 2024 },
  { external_id: 'ghgp_2024_air_freight', name: 'Air Freight', category: 'Freight Transport', scope: 'scope_3', value: 0.602, unit: 'kg CO2e/tonne-km', region: 'Global', year: 2024 },
];

function getFactorsForSource(code: string): any[] {
  switch (code) {
    case 'epa_egrid': return mockEPAeGRIDFactors();
    case 'uk_defra': return mockDEFRAFactors();
    case 'iea': return mockIEAFactors();
    case 'ghg_protocol': return mockGHGProtocolFactors();
    default: return [];
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { sourceId, syncType = 'manual', triggeredBy } = await req.json().catch(() => ({}));

    console.log('Starting emission factor fetch', { sourceId, syncType, triggeredBy });

    // Get sources to sync
    let sourcesQuery = supabase
      .from('emission_factor_sources')
      .select('*')
      .eq('is_enabled', true);

    if (sourceId) {
      sourcesQuery = sourcesQuery.eq('id', sourceId);
    }

    const { data: sources, error: sourcesError } = await sourcesQuery;

    if (sourcesError) {
      throw new Error(`Failed to fetch sources: ${sourcesError.message}`);
    }

    if (!sources || sources.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No enabled sources found', synced: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const source of sources) {
      const startTime = Date.now();

      // Create sync log entry
      const { data: syncLog, error: logError } = await supabase
        .from('emission_factor_sync_logs')
        .insert({
          source_id: source.id,
          sync_type: syncType,
          status: 'running',
          triggered_by: triggeredBy
        })
        .select()
        .single();

      if (logError) {
        console.error('Failed to create sync log:', logError);
        continue;
      }

      try {
        // Fetch factors (using mock data for now)
        const factors = getFactorsForSource(source.code);
        console.log(`Fetched ${factors.length} factors from ${source.name}`);

        let factorsNew = 0;
        let factorsUpdated = 0;
        let factorsUnchanged = 0;

        // Insert into staging table
        for (const factor of factors) {
          // Check if already exists in staging
          const { data: existing } = await supabase
            .from('emission_factor_updates_staging')
            .select('id, factor_value')
            .eq('source_id', source.id)
            .eq('external_id', factor.external_id)
            .eq('status', 'pending')
            .maybeSingle();

          if (existing) {
            if (existing.factor_value !== factor.value) {
              factorsUpdated++;
            } else {
              factorsUnchanged++;
            }
            continue;
          }

          const { error: insertError } = await supabase
            .from('emission_factor_updates_staging')
            .insert({
              source_id: source.id,
              external_id: factor.external_id,
              factor_name: factor.name,
              factor_category: factor.category,
              factor_scope: factor.scope,
              factor_value: factor.value,
              factor_unit: factor.unit,
              region: factor.region,
              year: factor.year,
              raw_data: factor,
              status: 'pending'
            });

          if (insertError) {
            console.error('Failed to insert factor:', insertError);
          } else {
            factorsNew++;
          }
        }

        const duration = Date.now() - startTime;

        // Update sync log
        await supabase
          .from('emission_factor_sync_logs')
          .update({
            status: 'completed',
            factors_fetched: factors.length,
            factors_new: factorsNew,
            factors_updated: factorsUpdated,
            factors_unchanged: factorsUnchanged,
            duration_ms: duration,
            completed_at: new Date().toISOString()
          })
          .eq('id', syncLog.id);

        // Update source last sync
        await supabase
          .from('emission_factor_sources')
          .update({ last_sync_at: new Date().toISOString() })
          .eq('id', source.id);

        results.push({
          source: source.name,
          status: 'completed',
          fetched: factors.length,
          new: factorsNew,
          updated: factorsUpdated,
          duration: duration
        });

      } catch (err) {
        const duration = Date.now() - startTime;
        console.error(`Error syncing ${source.name}:`, err);

        await supabase
          .from('emission_factor_sync_logs')
          .update({
            status: 'failed',
            errors: { message: err.message },
            duration_ms: duration,
            completed_at: new Date().toISOString()
          })
          .eq('id', syncLog.id);

        results.push({
          source: source.name,
          status: 'failed',
          error: err.message
        });
      }
    }

    // Trigger analysis of new factors
    try {
      await supabase.functions.invoke('analyze-factor-changes', {
        body: { triggeredBy }
      });
    } catch (err) {
      console.log('Analysis function triggered (may run async)');
    }

    return new Response(
      JSON.stringify({
        message: 'Sync completed',
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fetch-emission-factors:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
