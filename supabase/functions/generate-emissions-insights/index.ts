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
  source?: 'ai' | 'rule-based';
}

interface EmissionsData {
  entry_date: string;
  scope: string;
  category: string;
  quantity: number;
  calculations?: { calculated_emissions: number }[];
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

// Rule-based fallback insights generator
function generateRuleBasedInsights(
  emissions: EmissionsData[],
  totalEmissions: number,
  scopeBreakdown: { S1: number; S2: number; S3: number },
  categoryBreakdown: Record<string, number>
): Insight[] {
  const insights: Insight[] = [];

  if (emissions.length === 0) {
    return [{
      category: 'opportunity',
      priority: 'medium',
      title: 'Start Tracking Emissions',
      finding: 'No emissions data available for analysis.',
      impact: 'Cannot provide insights without baseline data.',
      recommendation: 'Begin by entering your organization\'s emissions data to unlock insights and recommendations.',
      expected_benefit: 'Establish baseline for reduction strategies',
      timeframe: 'Immediate',
      source: 'rule-based'
    }];
  }

  // Calculate monthly trend
  const monthlyData: Record<string, number> = {};
  emissions.forEach(e => {
    const month = e.entry_date.substring(0, 7);
    monthlyData[month] = (monthlyData[month] || 0) + (e.calculations?.[0]?.calculated_emissions || 0);
  });
  const monthlyTrend = Object.entries(monthlyData)
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Trend analysis
  if (monthlyTrend.length >= 2) {
    const recent = monthlyTrend.slice(-3);
    const firstMonth = recent[0].total;
    const lastMonth = recent[recent.length - 1].total;
    const changePercent = firstMonth > 0 ? ((lastMonth - firstMonth) / firstMonth) * 100 : 0;

    if (changePercent > 15) {
      insights.push({
        category: 'risk',
        priority: 'high',
        title: 'Rising Emissions Trend Detected',
        finding: `Your emissions increased by ${changePercent.toFixed(1)}% over the past ${recent.length} months.`,
        impact: 'Continued increase will impact sustainability goals and potential regulatory compliance.',
        recommendation: 'Review recent operational changes and identify sources of increased emissions.',
        expected_benefit: `Reversing this trend could reduce emissions by ${(lastMonth - firstMonth).toFixed(1)} tCO2e`,
        timeframe: '1-3 months',
        source: 'rule-based'
      });
    } else if (changePercent < -10) {
      insights.push({
        category: 'efficiency',
        priority: 'low',
        title: 'Positive Emissions Reduction Trend',
        finding: `Your emissions decreased by ${Math.abs(changePercent).toFixed(1)}% over the past ${recent.length} months.`,
        impact: 'You are on track with emissions reduction - keep monitoring to maintain progress.',
        recommendation: 'Document what initiatives led to this reduction and consider expanding them.',
        expected_benefit: 'Maintaining this trend supports long-term sustainability goals',
        timeframe: 'Ongoing',
        source: 'rule-based'
      });
    }
  }

  // Scope imbalance analysis
  const s3Percent = totalEmissions > 0 ? (scopeBreakdown.S3 / totalEmissions) * 100 : 0;
  const s1Percent = totalEmissions > 0 ? (scopeBreakdown.S1 / totalEmissions) * 100 : 0;
  const s2Percent = totalEmissions > 0 ? (scopeBreakdown.S2 / totalEmissions) * 100 : 0;

  if (s3Percent < 10 && (s1Percent > 40 || s2Percent > 40)) {
    insights.push({
      category: 'compliance',
      priority: 'medium',
      title: 'Scope 3 Emissions Underrepresented',
      finding: `Scope 3 accounts for only ${s3Percent.toFixed(1)}% of tracked emissions.`,
      impact: 'Incomplete Scope 3 data may understate your true carbon footprint.',
      recommendation: 'Expand Scope 3 tracking to include supply chain, business travel, and purchased goods.',
      expected_benefit: 'More accurate carbon footprint assessment',
      timeframe: '3-6 months',
      source: 'rule-based'
    });
  }

  if (s1Percent > 50) {
    insights.push({
      category: 'reduction',
      priority: 'high',
      title: 'High Direct Emissions (Scope 1)',
      finding: `Direct emissions represent ${s1Percent.toFixed(1)}% of your total footprint.`,
      impact: 'Scope 1 emissions are within your direct control and offer high reduction potential.',
      recommendation: 'Focus on fuel efficiency, equipment upgrades, and lower-carbon fuels.',
      expected_benefit: `Potential to reduce ${(scopeBreakdown.S1 * 0.2).toFixed(1)} tCO2e (20% target)`,
      timeframe: '6-12 months',
      source: 'rule-based'
    });
  }

  // Category concentration
  const sorted = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0) {
    const topCategory = sorted[0];
    const topPercent = totalEmissions > 0 ? (topCategory[1] / totalEmissions) * 100 : 0;

    if (topPercent > 50) {
      insights.push({
        category: 'opportunity',
        priority: 'high',
        title: `${topCategory[0]} Dominates Your Emissions`,
        finding: `${topCategory[0]} accounts for ${topPercent.toFixed(1)}% of total emissions.`,
        impact: 'Concentrated emissions mean targeted action can have significant impact.',
        recommendation: `Prioritize reduction initiatives for ${topCategory[0]}.`,
        expected_benefit: `A 25% reduction would save ${(topCategory[1] * 0.25).toFixed(1)} tCO2e`,
        timeframe: '3-6 months',
        source: 'rule-based'
      });
    }
  }

  // Quick wins - Scope 2
  if (s2Percent > 20) {
    insights.push({
      category: 'opportunity',
      priority: 'medium',
      title: 'Renewable Energy Quick Win',
      finding: `Scope 2 (electricity) accounts for ${s2Percent.toFixed(1)}% of your emissions.`,
      impact: 'Switching to renewable energy is often the fastest way to reduce carbon footprint.',
      recommendation: 'Explore renewable energy options: RECs, PPAs, or on-site solar.',
      expected_benefit: `Could reduce up to ${scopeBreakdown.S2.toFixed(1)} tCO2e by switching to 100% renewable`,
      timeframe: '1-6 months',
      source: 'rule-based'
    });
  }

  // Anomaly detection
  if (monthlyTrend.length >= 4) {
    const values = monthlyTrend.map(m => m.total);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);

    const lastMonth = monthlyTrend[monthlyTrend.length - 1];
    const zScore = stdDev > 0 ? (lastMonth.total - mean) / stdDev : 0;

    if (Math.abs(zScore) > 2) {
      const isSpike = zScore > 0;
      insights.push({
        category: 'risk',
        priority: 'high',
        title: isSpike ? 'Unusual Emissions Spike Detected' : 'Unusual Emissions Drop Detected',
        finding: `${lastMonth.month} emissions (${lastMonth.total.toFixed(1)} tCO2e) deviated significantly from average (${mean.toFixed(1)} tCO2e).`,
        impact: isSpike
          ? 'Unexpected spikes may indicate operational issues or data entry errors.'
          : 'Sudden drops should be verified for data completeness.',
        recommendation: isSpike
          ? 'Review operations and data entries for this period.'
          : 'Verify data completeness and document any changes.',
        expected_benefit: 'Ensuring data accuracy and identifying operational issues',
        timeframe: 'Immediate review recommended',
        source: 'rule-based'
      });
    }
  }

  // Sort by priority and return top 5
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return insights
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 5);
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

    const emissionsData = (emissions || []) as EmissionsData[];

    // Calculate data summary
    const totalEmissions = emissionsData.reduce(
      (sum, e) => sum + (e.calculations?.[0]?.calculated_emissions || 0),
      0
    );

    const scopeBreakdown = {
      S1: emissionsData.filter(e => e.scope === 'S1').reduce((sum, e) => sum + (e.calculations?.[0]?.calculated_emissions || 0), 0),
      S2: emissionsData.filter(e => e.scope === 'S2').reduce((sum, e) => sum + (e.calculations?.[0]?.calculated_emissions || 0), 0),
      S3: emissionsData.filter(e => e.scope === 'S3').reduce((sum, e) => sum + (e.calculations?.[0]?.calculated_emissions || 0), 0),
    };

    const categoryBreakdown = emissionsData.reduce((acc, e) => {
      const cat = e.category;
      acc[cat] = (acc[cat] || 0) + (e.calculations?.[0]?.calculated_emissions || 0);
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Return empty state if no emissions
    if (!emissionsData || emissionsData.length === 0) {
      const fallbackInsights = generateRuleBasedInsights([], 0, { S1: 0, S2: 0, S3: 0 }, {});
      return new Response(
        JSON.stringify({ insights: fallbackInsights, source: 'rule-based' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch facilities and goals for context
    const { data: facilities } = await supabaseClient
      .from('facilities')
      .select('*')
      .eq('user_id', user.id);

    const { data: goals } = await supabaseClient
      .from('goals')
      .select('*')
      .eq('user_id', user.id);

    // Try AI-powered insights with timeout and fallback
    let insights: Insight[] = [];
    let source: 'ai' | 'rule-based' = 'rule-based';

    try {
      // Build AI prompts
      const industryInfo = industryContext.industry 
        ? `\nIndustry Context:
- Industry: ${industryContext.industry}${industryContext.subIndustry ? `\n- Sub-Industry: ${industryContext.subIndustry}` : ''}
${industryBenchmarks.length > 0 ? `\nIndustry Benchmarks:
${industryBenchmarks.map(b => `- ${b.metric_type}: ${b.p50} ${b.unit} (median)`).join('\n')}` : ''}`
        : '';

      const industryRecommendations = getIndustrySpecificGuidance(industryContext.industry, industryContext.subIndustry);

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
- Scope 1: ${scopeBreakdown.S1.toFixed(2)} tCO2e (${totalEmissions > 0 ? ((scopeBreakdown.S1/totalEmissions)*100).toFixed(1) : 0}%)
- Scope 2: ${scopeBreakdown.S2.toFixed(2)} tCO2e (${totalEmissions > 0 ? ((scopeBreakdown.S2/totalEmissions)*100).toFixed(1) : 0}%)
- Scope 3: ${scopeBreakdown.S3.toFixed(2)} tCO2e (${totalEmissions > 0 ? ((scopeBreakdown.S3/totalEmissions)*100).toFixed(1) : 0}%)

Top Emission Categories:
${topCategories.map(([cat, val]) => `- ${cat}: ${val.toFixed(2)} tCO2e`).join('\n')}
${industryInfo}

Number of Facilities: ${facilities?.length || 0}
Number of Goals: ${goals?.length || 0}
Data Points: ${emissionsData.length}

Provide insights focusing on efficiency improvements, reduction opportunities, and risk mitigation.${industryContext.industry ? ` Prioritize industry-specific recommendations for ${industryContext.industry}.` : ''}`;

      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('AI API error:', aiResponse.status, errorText);
        
        // Handle rate limit errors
        if (aiResponse.status === 429) {
          console.log('Rate limited, falling back to rule-based insights');
          throw new Error('Rate limited');
        }
        if (aiResponse.status === 402) {
          console.log('Payment required, falling back to rule-based insights');
          throw new Error('Payment required');
        }
        throw new Error(`AI API error: ${errorText}`);
      }

      const aiData = await aiResponse.json();
      const toolCall = aiData.choices[0]?.message?.tool_calls?.[0];
      
      if (!toolCall) {
        throw new Error('No tool call in AI response');
      }

      const parsedInsights = JSON.parse(toolCall.function.arguments).insights;
      insights = parsedInsights.map((i: Insight) => ({ ...i, source: 'ai' as const }));
      source = 'ai';
      
      console.log('Successfully generated AI insights');
    } catch (aiError) {
      console.error('AI insights failed, using rule-based fallback:', aiError);
      
      // Fall back to rule-based insights
      insights = generateRuleBasedInsights(emissionsData, totalEmissions, scopeBreakdown, categoryBreakdown);
      source = 'rule-based';
    }

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
      metadata: { source: insight.source || source }
    }));

    const { error: insertError } = await supabaseClient
      .from('emissions_insights')
      .insert(insightRecords);

    if (insertError) {
      console.error('Error storing insights:', insertError);
    }

    return new Response(JSON.stringify({ insights, source }), {
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
