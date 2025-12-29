import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { anomaly_id } = await req.json();

    if (!anomaly_id) {
      return new Response(JSON.stringify({ error: "anomaly_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Analyzing anomaly: ${anomaly_id}`);

    // Fetch the anomaly details
    const { data: anomaly, error: anomalyError } = await supabase
      .from("emissions_anomalies")
      .select(`
        *,
        emissions_entries (
          id, entry_date, scope, category, activity_type, quantity, unit, notes,
          facilities (name, facility_type, city, country_code)
        )
      `)
      .eq("id", anomaly_id)
      .single();

    if (anomalyError || !anomaly) {
      return new Response(JSON.stringify({ error: "Anomaly not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch historical context (similar entries)
    const { data: historicalData } = await supabase
      .from("emissions_entries")
      .select("entry_date, quantity, calculations(calculated_emissions)")
      .eq("user_id", anomaly.user_id)
      .eq("scope", anomaly.emissions_entries?.scope)
      .eq("category", anomaly.emissions_entries?.category)
      .order("entry_date", { ascending: false })
      .limit(12);

    // Build context for AI analysis
    const context = {
      anomaly: {
        type: anomaly.anomaly_type,
        severity: anomaly.severity,
        deviation_percentage: anomaly.deviation_percentage,
        z_score: anomaly.z_score,
        expected_value: anomaly.expected_value,
        actual_value: anomaly.actual_value,
        detected_at: anomaly.detected_at,
      },
      entry: {
        date: anomaly.emissions_entries?.entry_date,
        scope: anomaly.emissions_entries?.scope,
        category: anomaly.emissions_entries?.category,
        activity_type: anomaly.emissions_entries?.activity_type,
        quantity: anomaly.emissions_entries?.quantity,
        unit: anomaly.emissions_entries?.unit,
        notes: anomaly.emissions_entries?.notes,
      },
      facility: anomaly.emissions_entries?.facilities,
      historical_values: historicalData?.map(h => ({
        date: h.entry_date,
        quantity: h.quantity,
        emissions: h.calculations?.[0]?.calculated_emissions,
      })),
    };

    // If no AI key, return basic analysis
    if (!lovableApiKey) {
      console.log("No LOVABLE_API_KEY, returning rule-based analysis");
      
      const basicAnalysis = generateRuleBasedAnalysis(context);
      
      return new Response(JSON.stringify({
        anomaly_id,
        analysis: basicAnalysis,
        method: "rule_based",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use AI for deeper analysis
    console.log("Using AI for anomaly analysis");
    
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert carbon emissions analyst. Analyze the provided emissions anomaly and provide:
1. Probable root causes (3-5 possibilities)
2. Recommended investigation steps
3. Potential business explanations
4. Data quality considerations
5. Suggested corrective actions

Be specific and actionable. Consider seasonal patterns, operational changes, and data entry issues.`
          },
          {
            role: "user",
            content: `Analyze this emissions anomaly:

${JSON.stringify(context, null, 2)}

Provide a detailed analysis with probable causes and recommendations.`
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI API error:", aiResponse.status);
      const basicAnalysis = generateRuleBasedAnalysis(context);
      
      return new Response(JSON.stringify({
        anomaly_id,
        analysis: basicAnalysis,
        method: "rule_based_fallback",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await aiResponse.json();
    const aiAnalysis = aiResult.choices?.[0]?.message?.content || "";

    // Parse AI response into structured format
    const structuredAnalysis = {
      raw_analysis: aiAnalysis,
      probable_causes: extractSection(aiAnalysis, "root causes", "probable causes", "causes"),
      investigation_steps: extractSection(aiAnalysis, "investigation", "steps"),
      business_explanations: extractSection(aiAnalysis, "business", "explanations"),
      data_quality_notes: extractSection(aiAnalysis, "data quality", "quality"),
      corrective_actions: extractSection(aiAnalysis, "corrective", "actions", "recommendations"),
      confidence: calculateConfidence(context),
      generated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify({
      anomaly_id,
      analysis: structuredAnalysis,
      method: "ai_powered",
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error analyzing anomaly:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generateRuleBasedAnalysis(context: any) {
  const { anomaly, entry, facility, historical_values } = context;
  
  const causes = [];
  const actions = [];
  
  // Analyze based on anomaly type
  if (anomaly.type === "spike") {
    causes.push("Unusual operational activity or production increase");
    causes.push("Data entry error (extra digit or wrong unit)");
    causes.push("Equipment malfunction causing inefficiency");
    causes.push("Seasonal peak demand period");
    
    actions.push("Verify the quantity entered matches source documents");
    actions.push("Check if there were operational changes during this period");
    actions.push("Compare with previous same-month data from prior years");
  } else if (anomaly.type === "drop") {
    causes.push("Missing or incomplete data submission");
    causes.push("Facility shutdown or reduced operations");
    causes.push("Successful efficiency improvement");
    causes.push("Data entry error (missing digit)");
    
    actions.push("Confirm all data sources were included");
    actions.push("Verify if operations were normal during this period");
    actions.push("Check for any reported efficiency initiatives");
  }

  // Severity-based additions
  if (anomaly.severity === "critical" || anomaly.severity === "high") {
    actions.push("Escalate to facility manager for immediate review");
    actions.push("Document findings in audit trail");
  }

  // Check for patterns in historical data
  if (historical_values && historical_values.length > 0) {
    const values = historical_values.map((h: any) => h.emissions).filter(Boolean);
    const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length;
    
    if (anomaly.actual_value > avg * 2) {
      causes.push("Value is more than double the historical average");
    }
  }

  return {
    probable_causes: causes,
    investigation_steps: [
      "Review source documentation for the entry",
      "Cross-reference with facility operations log",
      "Compare with same period in previous years",
      "Verify emission factor used is correct",
    ],
    corrective_actions: actions,
    data_quality_notes: [
      `Entry scope: ${entry?.scope}`,
      `Category: ${entry?.category}`,
      `Deviation: ${anomaly.deviation_percentage?.toFixed(1)}%`,
    ],
    confidence: calculateConfidence(context),
    generated_at: new Date().toISOString(),
  };
}

function extractSection(text: string, ...keywords: string[]): string[] {
  const lines = text.split("\n").filter(l => l.trim());
  const results: string[] = [];
  let capturing = false;
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    if (keywords.some(k => lowerLine.includes(k))) {
      capturing = true;
      continue;
    }
    
    if (capturing && (line.startsWith("-") || line.startsWith("•") || line.match(/^\d+\./))) {
      results.push(line.replace(/^[-•\d.]+\s*/, "").trim());
    } else if (capturing && line.match(/^[A-Z#]/)) {
      capturing = false;
    }
  }
  
  return results.slice(0, 5);
}

function calculateConfidence(context: any): number {
  let confidence = 70;
  
  if (context.historical_values && context.historical_values.length >= 6) {
    confidence += 10;
  }
  if (context.entry?.notes) {
    confidence += 5;
  }
  if (context.facility) {
    confidence += 5;
  }
  if (Math.abs(context.anomaly?.z_score || 0) > 3) {
    confidence += 5; // High z-score = clearer anomaly
  }
  
  return Math.min(confidence, 95);
}
