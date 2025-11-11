import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Plus } from 'lucide-react';

const customFactorSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  category: z.string().min(2, 'Category is required'),
  scope: z.enum(['S1', 'S2', 'S3']),
  factor_value: z.string().min(1, 'Factor value is required'),
  unit: z.enum(['kgCO2e/kWh', 'kgCO2e/MWh', 'kgCO2e/L', 'kgCO2e/kg', 'kgCO2e/t', 'kgCO2e/m3', 'kgCO2e/km', 'kgCO2e/passenger_km', 'kgCO2e/tonne_km', 'kgCO2e/night']),
  region: z.string().optional(),
  country_code: z.string().optional(),
  source: z.string().min(3, 'Source is required'),
  methodology: z.string().optional(),
  year: z.string().optional(),
  uncertainty: z.string().optional(),
  notes: z.string().optional(),
  version: z.string().default('1.0'),
  version_notes: z.string().optional(),
});

type CustomFactorFormData = z.infer<typeof customFactorSchema>;

export const CustomFactorForm = () => {
  const { user } = useAuth();
  const form = useForm<CustomFactorFormData>({
    resolver: zodResolver(customFactorSchema),
    defaultValues: {
      name: '',
      category: '',
      scope: 'S1',
      factor_value: '',
      unit: 'kgCO2e/kg',
      region: '',
      country_code: '',
      source: '',
      methodology: 'Custom',
      year: new Date().getFullYear().toString(),
      uncertainty: '',
      notes: '',
      version: '1.0',
      version_notes: '',
    },
  });

  const onSubmit = async (data: CustomFactorFormData) => {
    try {
      const { error } = await supabase.from('emission_factors').insert({
        user_id: user?.id,
        name: data.name,
        category: data.category,
        scope: data.scope,
        factor_value: parseFloat(data.factor_value),
        unit: data.unit,
        region: data.region || null,
        country_code: data.country_code || null,
        source: data.source,
        methodology: data.methodology || 'Custom',
        year: data.year ? parseInt(data.year) : null,
        uncertainty: data.uncertainty ? parseFloat(data.uncertainty) : null,
        is_custom: true,
        version: data.version || '1.0',
        version_notes: data.version_notes || null,
        is_latest: true,
        metadata: { notes: data.notes },
      });

      if (error) throw error;

      toast.success('Custom emission factor created successfully');
      form.reset();
    } catch (error: any) {
      toast.error('Failed to create custom factor');
      console.error(error);
    }
  };

  return (
    <Card className="max-w-3xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Custom Emission Factor
        </CardTitle>
        <CardDescription>
          Define organization-specific emission factors for activities not covered by standard databases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factor Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Company Fleet - Diesel Truck" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Transportation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emission Scope *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="S1">Scope 1 - Direct Emissions</SelectItem>
                        <SelectItem value="S2">Scope 2 - Indirect Energy</SelectItem>
                        <SelectItem value="S3">Scope 3 - Value Chain</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="factor_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Factor Value *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.000001" placeholder="e.g., 2.68" {...field} />
                    </FormControl>
                    <FormDescription>CO₂e per unit</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="kgCO2e/kWh">kgCO₂e/kWh</SelectItem>
                        <SelectItem value="kgCO2e/MWh">kgCO₂e/MWh</SelectItem>
                        <SelectItem value="kgCO2e/L">kgCO₂e/L</SelectItem>
                        <SelectItem value="kgCO2e/kg">kgCO₂e/kg</SelectItem>
                        <SelectItem value="kgCO2e/t">kgCO₂e/t</SelectItem>
                        <SelectItem value="kgCO2e/m3">kgCO₂e/m³</SelectItem>
                        <SelectItem value="kgCO2e/km">kgCO₂e/km</SelectItem>
                        <SelectItem value="kgCO2e/passenger_km">kgCO₂e/passenger-km</SelectItem>
                        <SelectItem value="kgCO2e/tonne_km">kgCO₂e/tonne-km</SelectItem>
                        <SelectItem value="kgCO2e/night">kgCO₂e/night</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., North America" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., US" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Internal Study 2024" {...field} />
                    </FormControl>
                    <FormDescription>Data source or calculation basis</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="methodology"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Methodology</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., GHG Protocol" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2024" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="uncertainty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uncertainty (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="e.g., 15" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 1.0" {...field} />
                    </FormControl>
                    <FormDescription>Factor version number</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="version_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version Notes</FormLabel>
                    <FormControl>
                      <Input placeholder="What changed in this version?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional details about this emission factor..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Clear Form
              </Button>
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" />
                Create Custom Factor
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
