import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all active users
    const { data: users, error: usersError } = await supabaseClient
      .from('profiles')
      .select('id');

    if (usersError) throw usersError;

    const results = [];

    for (const user of users || []) {
      try {
        // Get historical emissions data (last 90 days)
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 90);

        const { data: entries, error: entriesError } = await supabaseClient
          .from('emissions_entries')
          .select('id, entry_date, scope, category, calculations(calculated_emissions)')
          .eq('user_id', user.id)
          .gte('entry_date', cutoffDate.toISOString())
          .order('entry_date', { ascending: true });

        if (entriesError || !entries || entries.length < 5) {
          continue;
        }

        // Group by scope and category
        const groups: Record<string, Array<{ id: string; emissions: number }>> = {};
        
        entries.forEach(entry => {
          const key = `${entry.scope}-${entry.category}`;
          const emissions = entry.calculations?.[0]?.calculated_emissions || 0;
          
          if (!groups[key]) {
            groups[key] = [];
          }
          
          groups[key].push({
            id: entry.id,
            emissions,
          });
        });

        // Detect anomalies
        const anomaliesToInsert = [];
        
        for (const [key, groupData] of Object.entries(groups)) {
          if (groupData.length < 3) continue;
          
          const values = groupData.map(e => e.emissions);
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          const stdDev = Math.sqrt(
            values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
          );

          // Check for anomalies
          for (const entry of groupData) {
            const zScore = stdDev > 0 ? (entry.emissions - mean) / stdDev : 0;
            
            if (Math.abs(zScore) > 2) {
              const deviation = ((entry.emissions - mean) / mean) * 100;
              
              // Check if anomaly already exists
              const { data: existing } = await supabaseClient
                .from('emissions_anomalies')
                .select('id')
                .eq('entry_id', entry.id)
                .maybeSingle();

              if (!existing) {
                let anomalyType: string;
                let severity: string;
                let description: string;
                let recommendation: string;

                if (zScore > 3) {
                  anomalyType = 'spike';
                  severity = 'critical';
                  description = `Critical spike: ${entry.emissions.toFixed(2)} tCO2e (${deviation.toFixed(1)}% above normal)`;
                  recommendation = 'Immediate investigation required. Check for data entry errors or equipment malfunctions.';
                } else if (zScore > 2.5) {
                  anomalyType = 'spike';
                  severity = 'high';
                  description = `Significant spike: ${entry.emissions.toFixed(2)} tCO2e (${deviation.toFixed(1)}% above normal)`;
                  recommendation = 'Review operations and verify data accuracy.';
                } else if (zScore < -3) {
                  anomalyType = 'drop';
                  severity = 'high';
                  description = `Unusual drop: ${entry.emissions.toFixed(2)} tCO2e (${Math.abs(deviation).toFixed(1)}% below normal)`;
                  recommendation = 'Verify data completeness. Could indicate missing data or positive changes.';
                } else {
                  anomalyType = zScore > 0 ? 'spike' : 'drop';
                  severity = 'medium';
                  description = `Deviation: ${entry.emissions.toFixed(2)} tCO2e (${Math.abs(deviation).toFixed(1)}% from normal)`;
                  recommendation = 'Monitor for patterns. May be normal variation.';
                }

                anomaliesToInsert.push({
                  user_id: user.id,
                  entry_id: entry.id,
                  anomaly_type: anomalyType,
                  severity,
                  z_score: zScore,
                  expected_value: mean,
                  actual_value: entry.emissions,
                  deviation_percentage: deviation,
                  description,
                  recommendation,
                });
              }
            }
          }
        }

        // Insert anomalies
        if (anomaliesToInsert.length > 0) {
          const { error: insertError } = await supabaseClient
            .from('emissions_anomalies')
            .insert(anomaliesToInsert);

          if (insertError) {
            console.error(`Error inserting anomalies for user ${user.id}:`, insertError);
          }
        }

        results.push({
          user_id: user.id,
          anomalies_detected: anomaliesToInsert.length,
          status: 'success',
        });
      } catch (userError) {
        console.error(`Error processing user ${user.id}:`, userError);
        results.push({
          user_id: user.id,
          status: 'failed',
          error: userError.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        total_anomalies: results.reduce((sum, r) => sum + (r.anomalies_detected || 0), 0),
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in run-anomaly-scan:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
