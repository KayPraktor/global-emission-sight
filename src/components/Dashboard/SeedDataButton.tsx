import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Database, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SeedResult {
  success: boolean;
  message: string;
  summary?: {
    facility_created: string;
    emission_factors_created: number;
    entries_created: number;
    calculations_created: number;
    total_emissions_tco2e: number;
    scope_1_tco2e: number;
    scope_2_tco2e: number;
    scope_3_tco2e: number;
    date_range: {
      from: string;
      to: string;
    };
  };
}

const SeedDataButton: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);

  const handleSeedData = async () => {
    if (!user) {
      toast.error('You must be logged in to seed data');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('seed-sample-data');

      if (error) {
        throw error;
      }

      if (data?.success) {
        setResult(data);
        toast.success('Sample data created successfully!');
      } else {
        setResult({ success: false, message: data?.message || 'Failed to seed data' });
        toast.error(data?.message || 'Failed to seed data');
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      const message = error instanceof Error ? error.message : 'An error occurred';
      setResult({ success: false, message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (result?.success) {
    return (
      <Card className="border-green-500/20 bg-green-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            Sample Data Created
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Total Emissions</div>
              <div className="font-semibold">{result.summary?.total_emissions_tco2e} tCO2e</div>
            </div>
            <div>
              <div className="text-muted-foreground">Scope 1</div>
              <div className="font-semibold">{result.summary?.scope_1_tco2e} tCO2e</div>
            </div>
            <div>
              <div className="text-muted-foreground">Scope 2</div>
              <div className="font-semibold">{result.summary?.scope_2_tco2e} tCO2e</div>
            </div>
            <div>
              <div className="text-muted-foreground">Scope 3</div>
              <div className="font-semibold">{result.summary?.scope_3_tco2e} tCO2e</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Created {result.summary?.entries_created} entries from {result.summary?.date_range?.from} to {result.summary?.date_range?.to}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (result && !result.success) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Could not seed data</AlertTitle>
        <AlertDescription>{result.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          No Emissions Data
        </CardTitle>
        <CardDescription>
          Get started quickly with 12 months of realistic sample data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleSeedData} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating sample data...
            </>
          ) : (
            <>
              <Database className="h-4 w-4 mr-2" />
              Load Sample Data
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-3">
          This will create a demo facility with emissions data across all scopes
        </p>
      </CardContent>
    </Card>
  );
};

export default SeedDataButton;
