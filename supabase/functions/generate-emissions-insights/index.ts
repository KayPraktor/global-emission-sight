import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Insight {
  category: 'efficiency' | 'reduction' | 'risk' | 'opportunity' | 'compliance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  finding: string;
  impact: string;
  recommendation: string;
  expected_benefit: string;
  timeframe: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch emissions data for analysis
    const { data: emissions, error: emissionsError } = await supabaseClient
      .from('emissions_entries')
      .select('entry_date, scope, category, quantity, unit, calculations(calculated_emissions)')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .limit(100);

    if (emissionsError) throw emissionsError;

    if (!emissions || emissions.length === 0) {
      return new Response(
        JSON.stringify({
          insights: [{
            category: 'opportunity',
            priority: 'medium',
            title: 'Start Tracking Emissions',
            finding: 'No emissions data available for analysis.',
            impact: 'Cannot provide insights without baseline data.',
            recommendation: 'Begin by entering your organization\'s emissions data to unlock AI-powered insights and recommendations.',
            expected_benefit: 'Establish baseline for reduction strategies',
            timeframe: 'Immediate',
          }],
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch facilities data
    const { data: facilities } = await supabaseClient
      .from('facilities')
      .select('*')
      .eq('user_id', user.id);

    // Fetch goals
    const { data: goals } = await supabaseClient
      .from('goals')
      .select('*')
      .eq('user_id', user.id);

    // Prepare data summary for AI
    const totalEmissions = emissions.reduce(
      (sum, e) => sum + (e.calculations?.[0]?.calculated_emissions || 0),
      0
    );

    const scopeBreakdown = {
      S1: emissions.filter(e => e.scope === 'S1').reduce((sum, e) => sum + (e.calculations?.[0]?.calculated_emissions || 0), 0),
      S2: emissions.filter(e => e.scope === 'S2').reduce((sum, e) => sum + (e.calculations?.[0]?.calculated_emissions || 0), 0),
      S3: emissions.filter(e => e.scope === 'S3').reduce((sum, e) => sum + (e.calculations?.[0]?.calculated_emissions || 0), 0),
    };

    const topCategories = Object.entries(
      emissions.reduce((acc, e) => {
        const cat = e.category;
        acc[cat] = (acc[cat] || 0) + (e.calculations?.[0]?.calculated_emissions || 0);
        return acc;
      }, {} as Record<string, number>)
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Call Lovable AI
    const systemPrompt = `You are an expert carbon management consultant analyzing emissions data. 
Provide actionable insights based on the data provided.

Format your response using the generate_insights function with structured recommendations that include:
1. Finding (what the data shows)
2. Impact (why it matters)
3. Recommendation (specific action to take)
4. Expected outcome (quantified benefit)

Focus on the most impactful opportunities for emission reductions.`;

    const userPrompt = `Analyze this emissions data and provide 3-5 actionable insights:

Total Emissions: ${totalEmissions.toFixed(2)} tCO2e
Scope Breakdown:
- Scope 1: ${scopeBreakdown.S1.toFixed(2)} tCO2e (${((scopeBreakdown.S1/totalEmissions)*100).toFixed(1)}%)
- Scope 2: ${scopeBreakdown.S2.toFixed(2)} tCO2e (${((scopeBreakdown.S2/totalEmissions)*100).toFixed(1)}%)
- Scope 3: ${scopeBreakdown.S3.toFixed(2)} tCO2e (${((scopeBreakdown.S3/totalEmissions)*100).toFixed(1)}%)

Top Emission Categories:
${topCategories.map(([cat, val]) => `- ${cat}: ${val.toFixed(2)} tCO2e`).join('\n')}

Number of Facilities: ${facilities?.length || 0}
Number of Goals: ${goals?.length || 0}
Data Points: ${emissions.length}

Provide insights focusing on efficiency improvements, reduction opportunities, and risk mitigation.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_insights',
              description: 'Generate structured emissions insights',
              parameters: {
                type: 'object',
                properties: {
                  insights: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        category: {
                          type: 'string',
                          enum: ['efficiency', 'reduction', 'risk', 'opportunity', 'compliance'],
                        },
                        priority: {
                          type: 'string',
                          enum: ['low', 'medium', 'high', 'critical'],
                        },
                        title: { type: 'string' },
                        finding: { type: 'string' },
                        impact: { type: 'string' },
                        recommendation: { type: 'string' },
                        expected_benefit: { type: 'string' },
                        timeframe: { type: 'string' },
                      },
                      required: ['category', 'priority', 'title', 'finding', 'impact', 'recommendation', 'expected_benefit', 'timeframe'],
                    },
                  },
                },
                required: ['insights'],
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'generate_insights' } },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`AI API error: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices[0]?.message?.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No tool call in AI response');
    }

    const insights: Insight[] = JSON.parse(toolCall.function.arguments).insights;

    // Store insights in database
    const insightRecords = insights.map((insight) => ({
      user_id: user.id,
      category: insight.category,
      priority: insight.priority,
      title: insight.title,
      finding: insight.finding,
      impact: insight.impact,
      recommendation: insight.recommendation,
      expected_benefit: insight.expected_benefit,
      timeframe: insight.timeframe,
    }));

    const { error: insertError } = await supabaseClient
      .from('emissions_insights')
      .insert(insightRecords);

    if (insertError) {
      console.error('Error storing insights:', insertError);
    }

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
