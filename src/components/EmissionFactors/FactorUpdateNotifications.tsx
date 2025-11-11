import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, ArrowUpCircle, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FactorUpdate {
  id: string;
  old_factor_id: string;
  new_factor_id: string;
  old_factor_name: string;
  new_factor_name: string;
  old_version: string;
  new_version: string;
  version_notes?: string;
  created_at: string;
}

export const FactorUpdateNotifications: React.FC = () => {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<FactorUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUpdates();
      
      // Set up realtime subscription
      const channel = supabase
        .channel('factor-updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'emission_factor_updates',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchUpdates();
            toast.info('New emission factor updates available');
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('emission_factor_updates')
        .select(`
          id,
          old_factor_id,
          new_factor_id,
          created_at,
          old_factor:emission_factors!emission_factor_updates_old_factor_id_fkey(name, version),
          new_factor:emission_factors!emission_factor_updates_new_factor_id_fkey(name, version, version_notes)
        `)
        .eq('is_read', false)
        .eq('is_dismissed', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUpdates = data?.map(u => ({
        id: u.id,
        old_factor_id: u.old_factor_id,
        new_factor_id: u.new_factor_id,
        old_factor_name: u.old_factor?.name || '',
        new_factor_name: u.new_factor?.name || '',
        old_version: u.old_factor?.version || '',
        new_version: u.new_factor?.version || '',
        version_notes: u.new_factor?.version_notes,
        created_at: u.created_at
      })) || [];

      setUpdates(formattedUpdates);
    } catch (error: any) {
      console.error('Failed to fetch updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (updateId: string, newFactorId: string) => {
    try {
      // Mark notification as read
      await supabase
        .from('emission_factor_updates')
        .update({ is_read: true })
        .eq('id', updateId);

      // Update user's factor version preference
      const { data: update } = await supabase
        .from('emission_factor_updates')
        .select('old_factor_id')
        .eq('id', updateId)
        .single();

      if (update) {
        await supabase
          .from('user_emission_factor_versions')
          .upsert({
            user_id: user?.id,
            emission_factor_id: newFactorId,
            locked_version: 'latest'
          });
      }

      toast.success('Emission factor upgraded successfully');
      fetchUpdates();
    } catch (error: any) {
      toast.error('Failed to upgrade factor');
      console.error(error);
    }
  };

  const handleDismiss = async (updateId: string) => {
    try {
      await supabase
        .from('emission_factor_updates')
        .update({ is_dismissed: true })
        .eq('id', updateId);

      toast.info('Update notification dismissed');
      fetchUpdates();
    } catch (error: any) {
      toast.error('Failed to dismiss notification');
      console.error(error);
    }
  };

  if (loading) return null;
  if (updates.length === 0) return null;

  return (
    <Card className="mb-6 border-warning/50 bg-warning/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-warning" />
          Emission Factor Updates Available
        </CardTitle>
        <CardDescription>
          New versions of standard emission factors are available for your review
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {updates.map((update) => (
          <Alert key={update.id} className="border-border">
            <ArrowUpCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <div className="font-medium">{update.new_factor_name}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline" className="text-xs">
                      v{update.old_version} → v{update.new_version}
                    </Badge>
                    <span>{new Date(update.created_at).toLocaleDateString()}</span>
                  </div>
                  {update.version_notes && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {update.version_notes}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpgrade(update.id, update.new_factor_id)}
                    className="gap-1"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Upgrade
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDismiss(update.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
};
