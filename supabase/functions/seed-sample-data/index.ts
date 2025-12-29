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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Seeding sample data for user: ${user.id}`);

    // Check if user already has data
    const { count } = await supabase
      .from("emissions_entries")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (count && count > 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: "User already has emissions data",
        existing_count: count 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create a default facility first
    const { data: facility, error: facilityError } = await supabase
      .from("facilities")
      .insert({
        user_id: user.id,
        name: "Headquarters",
        facility_type: "office",
        country_code: "US",
        city: "San Francisco",
        address: "123 Main Street",
        employees: 150,
        area_sqm: 2500,
      })
      .select()
      .single();

    if (facilityError) {
      console.error("Error creating facility:", facilityError);
      throw facilityError;
    }

    console.log(`Created facility: ${facility.id}`);

    // Create emission factors
    const emissionFactors = [
      { name: "Natural Gas", category: "stationary_combustion", scope: "scope_1", factor_value: 2.02, unit: "kg_co2e_per_kwh", source: "EPA 2024" },
      { name: "Diesel Fuel", category: "mobile_combustion", scope: "scope_1", factor_value: 2.68, unit: "kg_co2e_per_liter", source: "EPA 2024" },
      { name: "Grid Electricity - US Average", category: "purchased_electricity", scope: "scope_2", factor_value: 0.42, unit: "kg_co2e_per_kwh", source: "eGRID 2024" },
      { name: "Business Travel - Air", category: "business_travel", scope: "scope_3", factor_value: 0.255, unit: "kg_co2e_per_km", source: "DEFRA 2024" },
      { name: "Employee Commuting", category: "employee_commuting", scope: "scope_3", factor_value: 0.21, unit: "kg_co2e_per_km", source: "DEFRA 2024" },
      { name: "Purchased Goods", category: "purchased_goods", scope: "scope_3", factor_value: 0.5, unit: "kg_co2e_per_usd", source: "EEIO 2024" },
    ];

    const { data: factors, error: factorsError } = await supabase
      .from("emission_factors")
      .insert(emissionFactors.map(ef => ({ ...ef, user_id: user.id })))
      .select();

    if (factorsError) {
      console.error("Error creating emission factors:", factorsError);
      throw factorsError;
    }

    console.log(`Created ${factors.length} emission factors`);

    // Generate 12 months of sample emissions data
    const now = new Date();
    const entries = [];

    for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
      const entryDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 15);
      const monthStr = entryDate.toISOString().split("T")[0];
      
      // Add seasonal variation
      const seasonalFactor = 1 + 0.2 * Math.sin((entryDate.getMonth() / 12) * 2 * Math.PI);
      const randomVariation = () => 0.8 + Math.random() * 0.4;

      // Scope 1: Natural Gas (higher in winter)
      const gasUsage = 15000 * seasonalFactor * randomVariation();
      entries.push({
        user_id: user.id,
        facility_id: facility.id,
        emission_factor_id: factors.find(f => f.name === "Natural Gas")?.id,
        scope: "scope_1",
        category: "stationary_combustion",
        activity_type: "natural_gas",
        quantity: gasUsage,
        unit: "kwh",
        entry_date: monthStr,
        notes: "Monthly natural gas consumption",
      });

      // Scope 1: Diesel (company vehicles)
      const dieselUsage = 800 * randomVariation();
      entries.push({
        user_id: user.id,
        facility_id: facility.id,
        emission_factor_id: factors.find(f => f.name === "Diesel Fuel")?.id,
        scope: "scope_1",
        category: "mobile_combustion",
        activity_type: "diesel",
        quantity: dieselUsage,
        unit: "liters",
        entry_date: monthStr,
        notes: "Company vehicle fleet fuel",
      });

      // Scope 2: Electricity
      const electricityUsage = 25000 * (1.1 - 0.2 * seasonalFactor) * randomVariation();
      entries.push({
        user_id: user.id,
        facility_id: facility.id,
        emission_factor_id: factors.find(f => f.name === "Grid Electricity - US Average")?.id,
        scope: "scope_2",
        category: "purchased_electricity",
        activity_type: "electricity",
        quantity: electricityUsage,
        unit: "kwh",
        entry_date: monthStr,
        notes: "Monthly electricity consumption",
      });

      // Scope 3: Business Travel
      const travelKm = 15000 * randomVariation();
      entries.push({
        user_id: user.id,
        facility_id: facility.id,
        emission_factor_id: factors.find(f => f.name === "Business Travel - Air")?.id,
        scope: "scope_3",
        category: "business_travel",
        activity_type: "air_travel",
        quantity: travelKm,
        unit: "km",
        entry_date: monthStr,
        notes: "Employee air travel",
      });

      // Scope 3: Employee Commuting
      const commuteKm = 45000 * randomVariation();
      entries.push({
        user_id: user.id,
        facility_id: facility.id,
        emission_factor_id: factors.find(f => f.name === "Employee Commuting")?.id,
        scope: "scope_3",
        category: "employee_commuting",
        activity_type: "commuting",
        quantity: commuteKm,
        unit: "km",
        entry_date: monthStr,
        notes: "Employee commuting estimate",
      });

      // Scope 3: Purchased Goods (varies by quarter)
      const purchasedGoods = 50000 * randomVariation() * (1 + 0.3 * Math.sin((entryDate.getMonth() / 3) * Math.PI));
      entries.push({
        user_id: user.id,
        facility_id: facility.id,
        emission_factor_id: factors.find(f => f.name === "Purchased Goods")?.id,
        scope: "scope_3",
        category: "purchased_goods",
        activity_type: "goods_services",
        quantity: purchasedGoods,
        unit: "usd",
        entry_date: monthStr,
        notes: "Purchased goods and services spend",
      });
    }

    // Insert all emissions entries
    const { data: insertedEntries, error: entriesError } = await supabase
      .from("emissions_entries")
      .insert(entries)
      .select();

    if (entriesError) {
      console.error("Error creating emissions entries:", entriesError);
      throw entriesError;
    }

    console.log(`Created ${insertedEntries.length} emissions entries`);

    // Create corresponding calculations
    const calculations = insertedEntries.map(entry => {
      const factor = factors.find(f => f.id === entry.emission_factor_id);
      const calculatedEmissions = entry.quantity * (factor?.factor_value || 0) / 1000; // Convert to tCO2e
      
      return {
        user_id: user.id,
        emissions_entry_id: entry.id,
        emission_factor_id: entry.emission_factor_id,
        calculated_emissions: calculatedEmissions,
        calculation_formula: `${entry.quantity} ${entry.unit} × ${factor?.factor_value || 0} ${factor?.unit || ''} / 1000`,
        confidence_score: 85 + Math.random() * 15,
      };
    });

    const { error: calcsError } = await supabase
      .from("calculations")
      .insert(calculations);

    if (calcsError) {
      console.error("Error creating calculations:", calcsError);
      throw calcsError;
    }

    console.log(`Created ${calculations.length} calculations`);

    // Calculate totals for response
    const totalEmissions = calculations.reduce((sum, c) => sum + c.calculated_emissions, 0);
    const scope1Total = calculations
      .filter((_, i) => insertedEntries[i].scope === "scope_1")
      .reduce((sum, c) => sum + c.calculated_emissions, 0);
    const scope2Total = calculations
      .filter((_, i) => insertedEntries[i].scope === "scope_2")
      .reduce((sum, c) => sum + c.calculated_emissions, 0);
    const scope3Total = calculations
      .filter((_, i) => insertedEntries[i].scope === "scope_3")
      .reduce((sum, c) => sum + c.calculated_emissions, 0);

    return new Response(JSON.stringify({
      success: true,
      message: "Sample data seeded successfully",
      summary: {
        facility_created: facility.name,
        emission_factors_created: factors.length,
        entries_created: insertedEntries.length,
        calculations_created: calculations.length,
        total_emissions_tco2e: Math.round(totalEmissions * 10) / 10,
        scope_1_tco2e: Math.round(scope1Total * 10) / 10,
        scope_2_tco2e: Math.round(scope2Total * 10) / 10,
        scope_3_tco2e: Math.round(scope3Total * 10) / 10,
        date_range: {
          from: entries[0].entry_date,
          to: entries[entries.length - 1].entry_date,
        },
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error seeding sample data:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
