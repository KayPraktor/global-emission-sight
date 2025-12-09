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

// Industry-specific guidance for AI recommendations
function getIndustrySpecificGuidance(industry: string | null, subIndustry: string | null): string {
  if (!industry) return '';

  const guidance: Record<string, Record<string, string>> = {
    manufacturing: {
      cement: 'Consider clinker-to-cement ratio optimization, alternative fuels in kilns, carbon capture technologies, and waste heat recovery systems.',
      steel: 'Evaluate transition from BF-BOF to EAF pathway, scrap utilization rates, hydrogen-based reduction technologies, and renewable electricity procurement.',
      automotive: 'Focus on paint booth efficiency, compressed air optimization, electrification of material handling, and supply chain Scope 3 reduction.',
      chemicals: 'Analyze feedstock alternatives, steam cracker efficiency, process heat electrification, and methane leak detection programs.',
      food_beverage: 'Prioritize refrigeration system upgrades, cold chain optimization, boiler efficiency, and agricultural supply chain engagement.',
      textiles: 'Consider dyeing process optimization, waterless dyeing technologies, renewable thermal energy, and fiber sourcing sustainability.',
      default: 'Focus on process efficiency improvements, equipment upgrades, energy management systems, and supply chain engagement for Scope 3.'
    },
    energy: {
      default: 'Prioritize renewable energy transition, grid efficiency, methane leak reduction, and carbon capture deployment.'
    },
    financial_services: {
      default: 'Focus on financed emissions (Scope 3 Category 15), office energy efficiency, business travel reduction, and sustainable investment policies.'
    },
    healthcare: {
      default: 'Prioritize anesthetic gas management, medical equipment efficiency, building energy optimization, and pharmaceutical supply chain.'
    },
    technology: {
      default: 'Focus on data center efficiency (PUE optimization), renewable energy procurement, product lifecycle emissions, and remote work policies.'
    },
    retail: {
      default: 'Prioritize store energy efficiency, refrigeration optimization, logistics emissions, and product lifecycle/supply chain engagement.'
    }
  };

  const industryGuidance = guidance[industry.toLowerCase()];
  if (!industryGuidance) return '';

  if (subIndustry && industryGuidance[subIndustry.toLowerCase()]) {
    return industryGuidance[subIndustry.toLowerCase()];
  }

  return industryGuidance.default || '';
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

    // Fetch user's organization and industry context
    const { data: orgMembership } = await supabaseClient
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    let industryContext = { industry: null as string | null, subIndustry: null as string | null };
    let industryBenchmarks: { metric_type: string; p50: number; unit: string }[] = [];

    if (orgMembership?.organization_id) {
      const { data: org } = await supabaseClient
        .from('organizations')
        .select('industry, sub_industry')
        .eq('id', orgMembership.organization_id)
        .single();

      if (org) {
        industryContext = { industry: org.industry, subIndustry: org.sub_industry };

        // Fetch industry benchmarks for comparison
        if (org.industry) {
          const { data: benchmarks } = await supabaseClient
            .from('industry_benchmarks')
            .select('metric_type, p50, unit')
            .eq('industry', org.industry)
            .limit(5);
          
          if (benchmarks) {
            industryBenchmarks = benchmarks;
          }
        }
      }
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

    // Build industry context for AI prompt
    const industryInfo = industryContext.industry 
      ? `\nIndustry Context:
- Industry: ${industryContext.industry}${industryContext.subIndustry ? `\n- Sub-Industry: ${industryContext.subIndustry}` : ''}
${industryBenchmarks.length > 0 ? `\nIndustry Benchmarks:
${industryBenchmarks.map(b => `- ${b.metric_type}: ${b.p50} ${b.unit} (median)`).join('\n')}` : ''}`
      : '';

    const industryRecommendations = getIndustrySpecificGuidance(industryContext.industry, industryContext.subIndustry);

    // Call Lovable AI
    const systemPrompt = `You are an expert carbon management consultant analyzing emissions data.
${industryContext.industry ? `You are specifically advising a ${industryContext.industry}${industryContext.subIndustry ? ` (${industryContext.subIndustry})` : ''} company.` : ''}

Provide actionable insights based on the data provided.

Format your response using the generate_insights function with structured recommendations that include:
1. Finding (what the data shows)
2. Impact (why it matters)
3. Recommendation (specific action to take)
4. Expected outcome (quantified benefit)

${industryRecommendations ? `Industry-specific considerations:\n${industryRecommendations}` : ''}

Focus on the most impactful opportunities for emission reductions.`;

    const userPrompt = `Analyze this emissions data and provide 3-5 actionable insights:

Total Emissions: ${totalEmissions.toFixed(2)} tCO2e
Scope Breakdown:
- Scope 1: ${scopeBreakdown.S1.toFixed(2)} tCO2e (${((scopeBreakdown.S1/totalEmissions)*100).toFixed(1)}%)
- Scope 2: ${scopeBreakdown.S2.toFixed(2)} tCO2e (${((scopeBreakdown.S2/totalEmissions)*100).toFixed(1)}%)
- Scope 3: ${scopeBreakdown.S3.toFixed(2)} tCO2e (${((scopeBreakdown.S3/totalEmissions)*100).toFixed(1)}%)

Top Emission Categories:
${topCategories.map(([cat, val]) => `- ${cat}: ${val.toFixed(2)} tCO2e`).join('\n')}
${industryInfo}

Number of Facilities: ${facilities?.length || 0}
Number of Goals: ${goals?.length || 0}
Data Points: ${emissions.length}

Provide insights focusing on efficiency improvements, reduction opportunities, and risk mitigation.${industryContext.industry ? ` Prioritize industry-specific recommendations for ${industryContext.industry}.` : ''}`;

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
