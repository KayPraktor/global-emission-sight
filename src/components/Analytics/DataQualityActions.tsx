import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, CheckCircle } from 'lucide-react';

export const DataQualityActions: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleFixMissingFacilities = async () => {
    if (!user) return;

    setLoading('facilities');
    try {
      // Get entries without facilities
      const { data: entries, error: fetchError } = await supabase
        .from('emissions_entries')
        .select('id')
        .eq('user_id', user.id)
        .is('facility_id', null);

      if (fetchError) throw fetchError;

      if (!entries || entries.length === 0) {
        toast.info('All entries already have facilities assigned');
        return;
      }

      // Get default facility (first one)
      const { data: facilities, error: facilityError } = await supabase
        .from('facilities')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (facilityError) throw facilityError;

      if (!facilities || facilities.length === 0) {
        toast.error('Please create a facility first');
        return;
      }

      // Update entries
      const { error: updateError } = await supabase
        .from('emissions_entries')
        .update({ facility_id: facilities[0].id })
        .in('id', entries.map(e => e.id));

      if (updateError) throw updateError;

      toast.success(`Updated ${entries.length} entries with default facility`);
    } catch (error) {
      console.error('Error fixing facilities:', error);
      toast.error('Failed to fix missing facilities');
    } finally {
      setLoading(null);
    }
  };

  const handleVerifyEmissionFactors = async () => {
    if (!user) return;

    setLoading('factors');
    try {
      // Get entries with outdated emission factors
      const { data: entries, error } = await supabase
        .from('emissions_entries')
        .select(`
          id,
          emission_factor_id,
          emission_factors (
            superseded_by,
            is_latest
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const outdated = entries?.filter(
        e => e.emission_factors && !e.emission_factors.is_latest && e.emission_factors.superseded_by
      ) || [];

      if (outdated.length === 0) {
        toast.info('All emission factors are up to date');
        return;
      }

      toast.info(`Found ${outdated.length} entries with outdated factors. Please review them manually.`);
    } catch (error) {
      console.error('Error verifying factors:', error);
      toast.error('Failed to verify emission factors');
    } finally {
      setLoading(null);
    }
  };

  const handleCompleteMetadata = async () => {
    if (!user) return;

    setLoading('metadata');
    try {
      // Get entries with incomplete metadata
      const { data: entries, error } = await supabase
        .from('emissions_entries')
        .select('id, activity_type')
        .eq('user_id', user.id)
        .is('activity_type', null);

      if (error) throw error;

      if (!entries || entries.length === 0) {
        toast.info('All entries have complete metadata');
        return;
      }

      toast.info(`Found ${entries.length} entries with missing metadata. Add activity types to improve quality.`);
    } catch (error) {
      console.error('Error checking metadata:', error);
      toast.error('Failed to check metadata');
    } finally {
      setLoading(null);
    }
  };

  const handleRunQualityScan = async () => {
    if (!user) return;

    setLoading('scan');
    try {
      const { data, error } = await supabase.functions.invoke('run-quality-scan', {
        body: { user_id: user.id },
      });

      if (error) throw error;

      toast.success('Quality scan completed successfully');
    } catch (error) {
      console.error('Error running quality scan:', error);
      toast.error('Failed to run quality scan');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>
          Bulk actions to improve your data quality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button
          onClick={handleFixMissingFacilities}
          disabled={loading !== null}
          variant="outline"
          className="w-full justify-start"
        >
          {loading === 'facilities' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Fix Missing Facilities
        </Button>

        <Button
          onClick={handleVerifyEmissionFactors}
          disabled={loading !== null}
          variant="outline"
          className="w-full justify-start"
        >
          {loading === 'factors' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Verify Emission Factors
        </Button>

        <Button
          onClick={handleCompleteMetadata}
          disabled={loading !== null}
          variant="outline"
          className="w-full justify-start"
        >
          {loading === 'metadata' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Complete Metadata
        </Button>

        <Button
          onClick={handleRunQualityScan}
          disabled={loading !== null}
          className="w-full justify-start"
        >
          {loading === 'scan' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Run Quality Scan
        </Button>
      </CardContent>
    </Card>
  );
};
