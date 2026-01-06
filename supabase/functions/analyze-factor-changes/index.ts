import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_AI_URL = 'https://ai.lovable.dev/v1/chat/completions';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting factor change analysis');

    // Get pending staged factors
    const { data: stagedFactors, error: stagingError } = await supabase
      .from('emission_factor_updates_staging')
      .select(`
        *,
        emission_factor_sources (name, code)
      `)
      .eq('status', 'pending')
      .limit(50);

    if (stagingError) {
      throw new Error(`Failed to fetch staged factors: ${stagingError.message}`);
    }

    if (!stagedFactors || stagedFactors.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending factors to analyze', analyzed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing ${stagedFactors.length} staged factors`);

    const analysisResults = [];

    for (const staged of stagedFactors) {
      try {
        // Find existing factor by name and region
        const { data: existingFactor } = await supabase
          .from('emission_factors')
          .select('*')
          .ilike('name', staged.factor_name)
          .eq('region', staged.region)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Count affected entries if there's an existing factor
        let affectedCount = 0;
        if (existingFactor) {
          const { count } = await supabase
            .from('emissions_entries')
            .select('*', { count: 'exact', head: true })
            .eq('emission_factor_id', existingFactor.id);
          affectedCount = count || 0;
        }

        const oldValue = existingFactor?.factor_value || null;
        const newValue = staged.factor_value;
        const changePercentage = oldValue 
          ? ((newValue - oldValue) / oldValue * 100).toFixed(2)
          : null;

        // Use AI for analysis if API key available
        let aiAnalysis = null;
        
        if (lovableApiKey) {
          const prompt = `Analyze this emission factor change for a carbon accounting system:

Factor: ${staged.factor_name}
Category: ${staged.factor_category}
Scope: ${staged.factor_scope}
Source: ${staged.emission_factor_sources?.name || 'Unknown'}
Region: ${staged.region}
Year: ${staged.year}
${oldValue ? `Old Value: ${oldValue} ${staged.factor_unit}` : 'New Factor (no existing value)'}
New Value: ${newValue} ${staged.factor_unit}
${changePercentage ? `Change: ${changePercentage}%` : ''}
Affected Records: ${affectedCount}

Provide a JSON response with:
1. "significance": "low" | "medium" | "high" | "critical" - based on magnitude of change and affected records
2. "impact_assessment": Brief explanation of what this change means for emissions calculations
3. "recommendation": "auto_apply" | "require_review" | "investigate" - based on risk level
4. "confidence": 0-100 - your confidence in this assessment
5. "likely_cause": Why the factor might have changed (methodology update, new data, annual revision, etc.)

Respond only with valid JSON.`;

          try {
            const aiResponse = await fetch(LOVABLE_AI_URL, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${lovableApiKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: 'google/gemini-2.5-flash',
                messages: [
                  { role: 'system', content: 'You are an expert in GHG emissions accounting and emission factor management. Analyze changes to emission factors and assess their significance.' },
                  { role: 'user', content: prompt }
                ],
              }),
            });

            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              const content = aiData.choices?.[0]?.message?.content || '';
              
              // Extract JSON from response
              const jsonMatch = content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                aiAnalysis = JSON.parse(jsonMatch[0]);
              }
            }
          } catch (aiError) {
            console.error('AI analysis error:', aiError);
          }
        }

        // Fallback to rule-based analysis if AI unavailable
        if (!aiAnalysis) {
          const absChange = Math.abs(parseFloat(changePercentage || '0'));
          
          let significance = 'low';
          let recommendation = 'auto_apply';
          
          if (absChange > 20 || affectedCount > 100) {
            significance = 'critical';
            recommendation = 'require_review';
          } else if (absChange > 10 || affectedCount > 50) {
            significance = 'high';
            recommendation = 'require_review';
          } else if (absChange > 5 || affectedCount > 20) {
            significance = 'medium';
            recommendation = 'require_review';
          }

          aiAnalysis = {
            significance,
            impact_assessment: oldValue 
              ? `Factor value changed by ${changePercentage}%. This will affect ${affectedCount} emission entries.`
              : `New factor from ${staged.emission_factor_sources?.name}. No existing entries will be affected.`,
            recommendation,
            confidence: 75,
            likely_cause: 'Annual data update from source'
          };
        }

        // Create change review record
        const { error: reviewError } = await supabase
          .from('emission_factor_change_reviews')
          .insert({
            staging_id: staged.id,
            existing_factor_id: existingFactor?.id || null,
            factor_name: staged.factor_name,
            old_value: oldValue,
            new_value: newValue,
            change_percentage: changePercentage ? parseFloat(changePercentage) : null,
            ai_significance: aiAnalysis.significance,
            ai_impact_assessment: aiAnalysis.impact_assessment,
            ai_recommendation: aiAnalysis.recommendation,
            ai_confidence: aiAnalysis.confidence,
            ai_analysis: aiAnalysis,
            affected_entries_count: affectedCount,
            status: aiAnalysis.recommendation === 'auto_apply' && affectedCount === 0 ? 'auto_applied' : 'pending'
          });

        if (reviewError) {
          console.error('Failed to create review:', reviewError);
        } else {
          // Mark staging as processed
          await supabase
            .from('emission_factor_updates_staging')
            .update({ status: 'processed', processed_at: new Date().toISOString() })
            .eq('id', staged.id);

          analysisResults.push({
            factor: staged.factor_name,
            significance: aiAnalysis.significance,
            recommendation: aiAnalysis.recommendation
          });
        }

      } catch (err) {
        console.error(`Error analyzing factor ${staged.factor_name}:`, err);
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Analysis completed',
        analyzed: analysisResults.length,
        results: analysisResults
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-factor-changes:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
