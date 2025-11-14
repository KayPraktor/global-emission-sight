import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get request body (if called with specific user_id)
    let targetUserId = null;
    try {
      const body = await req.json();
      targetUserId = body.user_id;
    } catch {
      // No body, will scan all users
    }

    // Get all users or specific user
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email')
      .then(result => {
        if (targetUserId) {
          return {
            ...result,
            data: result.data?.filter(p => p.id === targetUserId),
          };
        }
        return result;
      });

    if (profilesError) throw profilesError;

    const results = [];

    for (const profile of profiles || []) {
      console.log(`Scanning quality for user: ${profile.email}`);

      // Get user's organization
      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', profile.id)
        .single();

      if (!orgMember) continue;

      // Get all emissions entries for this user
      const { data: entries, error: entriesError } = await supabase
        .from('emissions_entries')
        .select('*, calculations(*), facilities(*)')
        .eq('user_id', profile.id);

      if (entriesError) {
        console.error(`Error fetching entries for ${profile.email}:`, entriesError);
        continue;
      }

      if (!entries || entries.length === 0) {
        console.log(`No entries for ${profile.email}, skipping`);
        continue;
      }

      // Calculate metrics
      const completeEntries = entries.filter(e => 
        e.entry_date && e.scope && e.category && e.quantity && 
        e.unit && e.emission_factor_id && e.calculations?.length > 0
      );
      const completenessScore = (completeEntries.length / entries.length) * 100;

      const verifiedEntries = entries.filter(e => e.is_verified);
      const accuracyScore = (verifiedEntries.length / entries.length) * 100;

      const dates = entries.map(e => new Date(e.entry_date).getTime());
      const mostRecent = Math.max(...dates);
      const daysSinceLastEntry = Math.floor((Date.now() - mostRecent) / (1000 * 60 * 60 * 24));
      const freshnessScore = Math.max(0, 100 - (daysSinceLastEntry * 2));

      const avgQualityScore = entries.reduce((sum, e) => sum + (e.data_quality_score || 0), 0) / entries.length;
      const consistencyScore = avgQualityScore * 100;

      const overallScore = (
        completenessScore * 0.35 +
        accuracyScore * 0.25 +
        freshnessScore * 0.20 +
        consistencyScore * 0.20
      );

      // Count issues
      let criticalIssues = 0;
      let warnings = 0;

      entries.forEach(entry => {
        if (!entry.emission_factor_id) criticalIssues++;
        if (!entry.facility_id) warnings++;
        if (!entry.activity_type) warnings++;
        if (daysSinceLastEntry > 90) warnings++;
      });

      // Get previous quality score
      const { data: previousTracking } = await supabase
        .from('quality_tracking')
        .select('overall_score')
        .eq('organization_id', orgMember.organization_id)
        .eq('user_id', profile.id)
        .order('metric_date', { ascending: false })
        .limit(1)
        .single();

      // Insert tracking record
      const { error: insertError } = await supabase
        .from('quality_tracking')
        .insert({
          organization_id: orgMember.organization_id,
          user_id: profile.id,
          metric_date: new Date().toISOString().split('T')[0],
          overall_score: Math.round(overallScore),
          completeness_score: Math.round(completenessScore),
          accuracy_score: Math.round(accuracyScore),
          freshness_score: Math.round(freshnessScore),
          consistency_score: Math.round(consistencyScore),
          total_entries: entries.length,
          critical_issues: criticalIssues,
          warnings: warnings,
        });

      if (insertError) {
        console.error(`Error inserting tracking for ${profile.email}:`, insertError);
        continue;
      }

      // Check if quality dropped significantly
      if (previousTracking && previousTracking.overall_score) {
        const scoreDrop = previousTracking.overall_score - overallScore;
        
        if (scoreDrop > 10) {
          // Create notification
          await supabase.rpc('create_notification', {
            p_user_id: profile.id,
            p_type: 'quality_alert',
            p_title: 'Data Quality Dropped',
            p_message: `Your data quality score decreased by ${scoreDrop.toFixed(1)}% to ${overallScore.toFixed(1)}%. Review your recent entries.`,
            p_severity: scoreDrop > 20 ? 'error' : 'warning',
            p_action_url: '/advanced-analytics?tab=quality',
          });
        }
      }

      // Check if quality is below threshold
      const { data: preferences } = await supabase
        .from('user_notification_preferences')
        .select('email_quality_alerts, quality_alert_threshold')
        .eq('user_id', profile.id)
        .single();

      if (preferences?.email_quality_alerts && overallScore < (preferences.quality_alert_threshold || 70)) {
        await supabase.rpc('create_notification', {
          p_user_id: profile.id,
          p_type: 'quality_alert',
          p_title: 'Low Data Quality',
          p_message: `Your data quality score is ${overallScore.toFixed(1)}%, below your threshold of ${preferences.quality_alert_threshold}%.`,
          p_severity: 'warning',
          p_action_url: '/advanced-analytics?tab=quality',
        });
      }

      results.push({
        user: profile.email,
        score: Math.round(overallScore),
        criticalIssues,
        warnings,
      });
    }

    console.log('Quality scan completed:', results);

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error running quality scan:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
