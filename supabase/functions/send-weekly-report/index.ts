import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@4.0.0';
import React from 'npm:react@18.3.1';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { WeeklyReportEmail } from './_templates/weekly-report.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

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

    // Get all users with email notifications enabled
    const { data: preferences, error: prefsError } = await supabaseClient
      .from('user_notification_preferences')
      .select('user_id, email_frequency')
      .eq('email_weekly_insights', true);

    if (prefsError) throw prefsError;

    const results = [];

    for (const pref of preferences || []) {
      try {
        // Get user profile
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('email, full_name')
          .eq('id', pref.user_id)
          .single();

        if (!profile) continue;

        // Get week's emissions data
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const { data: emissions } = await supabaseClient
          .from('emissions_entries')
          .select('calculations(calculated_emissions)')
          .eq('user_id', pref.user_id)
          .gte('entry_date', weekAgo.toISOString().split('T')[0]);

        const totalEmissions = emissions?.reduce(
          (sum, e) => sum + (e.calculations?.[0]?.calculated_emissions || 0),
          0
        ) || 0;

        // Get previous week for comparison
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        const { data: prevEmissions } = await supabaseClient
          .from('emissions_entries')
          .select('calculations(calculated_emissions)')
          .eq('user_id', pref.user_id)
          .gte('entry_date', twoWeeksAgo.toISOString().split('T')[0])
          .lt('entry_date', weekAgo.toISOString().split('T')[0]);

        const prevTotal = prevEmissions?.reduce(
          (sum, e) => sum + (e.calculations?.[0]?.calculated_emissions || 0),
          0
        ) || 0;

        const weekChange = prevTotal > 0 ? ((totalEmissions - prevTotal) / prevTotal) * 100 : 0;

        // Get unread insights
        const { data: insights } = await supabaseClient
          .from('emissions_insights')
          .select('title, priority, recommendation')
          .eq('user_id', pref.user_id)
          .eq('is_dismissed', false)
          .gte('generated_at', weekAgo.toISOString())
          .order('priority', { ascending: false })
          .limit(5);

        // Get unacknowledged anomalies
        const { data: anomalies } = await supabaseClient
          .from('emissions_anomalies')
          .select('description, severity, recommendation')
          .eq('user_id', pref.user_id)
          .eq('is_acknowledged', false)
          .gte('detected_at', weekAgo.toISOString())
          .order('severity', { ascending: false })
          .limit(5);

        // Skip if no significant data
        if (totalEmissions === 0 && insights?.length === 0 && anomalies?.length === 0) {
          continue;
        }

        // Render email
        const html = await renderAsync(
          React.createElement(WeeklyReportEmail, {
            userName: profile.full_name || profile.email.split('@')[0],
            totalEmissions,
            weekChange,
            insightsCount: insights?.length || 0,
            anomaliesCount: anomalies?.length || 0,
            insights: insights || [],
            anomalies: anomalies || [],
            dashboardUrl: `${Deno.env.get('SUPABASE_URL').replace('.supabase.co', '')}/advanced-analytics`,
          })
        );

        // Send email
        const { error: emailError } = await resend.emails.send({
          from: 'Carbon Tracker <reports@resend.dev>',
          to: [profile.email],
          subject: `📊 Your Weekly Carbon Emissions Report - ${totalEmissions.toFixed(1)} tCO2e`,
          html,
        });

        // Log the report
        await supabaseClient.from('email_reports_log').insert({
          user_id: pref.user_id,
          report_type: 'weekly_insights',
          status: emailError ? 'failed' : 'sent',
          email_to: profile.email,
          subject: `Your Weekly Carbon Emissions Report`,
          insights_count: insights?.length || 0,
          anomalies_count: anomalies?.length || 0,
          error_message: emailError?.message,
        });

        results.push({
          user_id: pref.user_id,
          email: profile.email,
          status: emailError ? 'failed' : 'sent',
          error: emailError?.message,
        });
      } catch (userError) {
        console.error(`Error processing user ${pref.user_id}:`, userError);
        results.push({
          user_id: pref.user_id,
          status: 'failed',
          error: userError.message,
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in send-weekly-report:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
