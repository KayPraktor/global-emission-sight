import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { reviewId, action, reviewedBy, reviewNotes } = await req.json();

    if (!reviewId || !action) {
      throw new Error('reviewId and action are required');
    }

    if (!['approve', 'reject'].includes(action)) {
      throw new Error('action must be approve or reject');
    }

    console.log(`Processing ${action} for review ${reviewId}`);

    // Get the review record
    const { data: review, error: reviewError } = await supabase
      .from('emission_factor_change_reviews')
      .select(`
        *,
        emission_factor_updates_staging (*)
      `)
      .eq('id', reviewId)
      .single();

    if (reviewError || !review) {
      throw new Error(`Review not found: ${reviewError?.message}`);
    }

    if (review.status !== 'pending') {
      throw new Error(`Review already processed with status: ${review.status}`);
    }

    const staged = review.emission_factor_updates_staging;

    if (action === 'reject') {
      // Mark as rejected
      await supabase
        .from('emission_factor_change_reviews')
        .update({
          status: 'rejected',
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes
        })
        .eq('id', reviewId);

      // Mark staging as rejected
      if (staged) {
        await supabase
          .from('emission_factor_updates_staging')
          .update({ status: 'rejected' })
          .eq('id', staged.id);
      }

      return new Response(
        JSON.stringify({ message: 'Factor update rejected', reviewId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Apply the update
    if (review.existing_factor_id) {
      // Update existing factor - create new version
      const { data: oldFactor } = await supabase
        .from('emission_factors')
        .select('*')
        .eq('id', review.existing_factor_id)
        .single();

      if (oldFactor) {
        // Calculate new version number
        const currentVersion = oldFactor.version || '1.0';
        const versionParts = currentVersion.split('.');
        const newVersion = `${versionParts[0]}.${parseInt(versionParts[1] || '0') + 1}`;

        // Create new factor version
        const { data: newFactor, error: insertError } = await supabase
          .from('emission_factors')
          .insert({
            name: oldFactor.name,
            category: staged?.factor_category || oldFactor.category,
            scope: staged?.factor_scope || oldFactor.scope,
            factor_value: review.new_value,
            unit: staged?.factor_unit || oldFactor.unit,
            region: staged?.region || oldFactor.region,
            source: oldFactor.source,
            year: staged?.year || oldFactor.year,
            version: newVersion,
            version_notes: `Updated from ${oldFactor.factor_value} to ${review.new_value} (${review.change_percentage?.toFixed(1)}% change)`,
            is_latest: true,
            is_custom: false,
            methodology: staged?.methodology || oldFactor.methodology,
            published_date: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          throw new Error(`Failed to create new factor version: ${insertError.message}`);
        }

        // Mark old factor as superseded
        await supabase
          .from('emission_factors')
          .update({
            is_latest: false,
            superseded_by: newFactor.id
          })
          .eq('id', oldFactor.id);

        // Create notifications for affected users
        if (review.affected_entries_count > 0) {
          // Get distinct users with affected entries
          const { data: affectedUsers } = await supabase
            .from('emissions_entries')
            .select('user_id')
            .eq('emission_factor_id', oldFactor.id);

          const uniqueUsers = [...new Set(affectedUsers?.map(u => u.user_id) || [])];

          for (const userId of uniqueUsers) {
            await supabase
              .from('emission_factor_updates')
              .insert({
                user_id: userId,
                old_factor_id: oldFactor.id,
                new_factor_id: newFactor.id,
                notification_type: 'version_update',
                is_read: false,
                is_dismissed: false
              });
          }
        }
      }
    } else {
      // Insert new factor
      const { error: insertError } = await supabase
        .from('emission_factors')
        .insert({
          name: staged?.factor_name || review.factor_name,
          category: staged?.factor_category || 'Other',
          scope: staged?.factor_scope || 'scope_1',
          factor_value: review.new_value,
          unit: staged?.factor_unit || 'kg CO2e/unit',
          region: staged?.region || 'Global',
          source: 'External Source',
          year: staged?.year || new Date().getFullYear(),
          version: '1.0',
          is_latest: true,
          is_custom: false,
          methodology: staged?.methodology,
          published_date: new Date().toISOString()
        });

      if (insertError) {
        throw new Error(`Failed to insert new factor: ${insertError.message}`);
      }
    }

    // Update review status
    await supabase
      .from('emission_factor_change_reviews')
      .update({
        status: 'approved',
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes
      })
      .eq('id', reviewId);

    return new Response(
      JSON.stringify({
        message: 'Factor update applied successfully',
        reviewId,
        factorName: review.factor_name
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in apply-factor-updates:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
