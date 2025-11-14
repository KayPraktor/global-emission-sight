import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    error: string;
    severity: 'error' | 'warning' | 'info';
  }>;
  warnings: Array<{
    field: string;
    warning: string;
  }>;
  qualityScore: number;
  suggestions: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { entry, entryId } = await req.json();

    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      qualityScore: 100,
      suggestions: [],
    };

    // Business Logic Validation
    if (entry.quantity) {
      // Check for unusual values
      if (entry.quantity > 100000 && entry.unit === 'kWh') {
        result.warnings.push({
          field: 'quantity',
          warning: 'Unusually high electricity consumption detected. Please verify this value.',
        });
        result.qualityScore -= 10;
      }

      if (entry.quantity <= 0) {
        result.errors.push({
          field: 'quantity',
          error: 'Quantity must be greater than 0',
          severity: 'error',
        });
        result.isValid = false;
        result.qualityScore -= 30;
      }
    }

    // Temporal Validation
    if (entry.entry_date) {
      const entryDate = new Date(entry.entry_date);
      const now = new Date();
      
      if (entryDate > now) {
        result.errors.push({
          field: 'entry_date',
          error: 'Entry date cannot be in the future',
          severity: 'error',
        });
        result.isValid = false;
        result.qualityScore -= 30;
      }

      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      if (entryDate < yearAgo) {
        result.warnings.push({
          field: 'entry_date',
          warning: 'Entry date is more than a year old. Consider reviewing data freshness.',
        });
        result.qualityScore -= 5;
      }
    }

    // Cross-field Validation
    if (entry.scope === 'S3' && entry.category) {
      const validS3Categories = [
        'Business Travel',
        'Employee Commuting',
        'Waste',
        'Purchased Goods',
        'Transportation',
        'Upstream',
        'Downstream',
      ];
      
      if (!validS3Categories.some(cat => entry.category.includes(cat))) {
        result.warnings.push({
          field: 'category',
          warning: 'Category may not match Scope 3 GHG Protocol standards.',
        });
        result.qualityScore -= 5;
      }
    }

    // Completeness Check
    if (!entry.facility_id) {
      result.warnings.push({
        field: 'facility_id',
        warning: 'Facility not specified. Adding a facility improves data tracking.',
      });
      result.suggestions.push('Add facility information for better tracking and reporting');
      result.qualityScore -= 15;
    }

    if (!entry.activity_type) {
      result.warnings.push({
        field: 'activity_type',
        warning: 'Activity type not specified.',
      });
      result.qualityScore -= 10;
    }

    if (!entry.notes || entry.notes.trim() === '') {
      result.suggestions.push('Add notes to provide context for this entry');
      result.qualityScore -= 5;
    }

    // Check for custom validation rules
    const { data: rules } = await supabase
      .from('validation_rules')
      .select('*')
      .eq('is_active', true);

    if (rules) {
      for (const rule of rules) {
        // Apply rule logic based on rule.condition
        const condition = rule.condition as any;
        
        if (rule.rule_type === 'field' && condition.field && entry[condition.field]) {
          const value = entry[condition.field];
          
          if (condition.min !== undefined && value < condition.min) {
            result.errors.push({
              field: condition.field,
              error: rule.error_message,
              severity: rule.severity as any,
            });
            if (rule.severity === 'error') {
              result.isValid = false;
              result.qualityScore -= 20;
            } else {
              result.qualityScore -= 10;
            }
          }
          
          if (condition.max !== undefined && value > condition.max) {
            result.errors.push({
              field: condition.field,
              error: rule.error_message,
              severity: rule.severity as any,
            });
            if (rule.severity === 'error') {
              result.isValid = false;
              result.qualityScore -= 20;
            } else {
              result.qualityScore -= 10;
            }
          }
        }
      }
    }

    // Consistency Checks (if entryId provided, compare with similar entries)
    if (entryId) {
      const { data: similarEntries } = await supabase
        .from('emissions_entries')
        .select('quantity, category, scope')
        .eq('category', entry.category)
        .eq('scope', entry.scope)
        .neq('id', entryId)
        .limit(10);

      if (similarEntries && similarEntries.length > 0) {
        const avgQuantity = similarEntries.reduce((sum, e) => sum + Number(e.quantity), 0) / similarEntries.length;
        const deviation = Math.abs(entry.quantity - avgQuantity) / avgQuantity;

        if (deviation > 2) { // More than 200% deviation
          result.warnings.push({
            field: 'quantity',
            warning: `This value is significantly different from similar entries (avg: ${avgQuantity.toFixed(2)}). Please verify.`,
          });
          result.qualityScore -= 15;
        }
      }
    }

    // Ensure quality score doesn't go below 0
    result.qualityScore = Math.max(0, result.qualityScore);

    console.log('Validation result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error validating data quality:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
