import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Edit, Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { feedback } from '@/lib/feedback';

interface Scenario {
  id: string;
  name: string;
  description: string;
  baseline_year: number;
  target_year: number;
  baseline_emissions: number;
  status: string;
  created_at: string;
  interventionCount?: number;
}

interface ScenarioListProps {
  onScenarioSelect: (scenarioId: string) => void;
}

export const ScenarioList: React.FC<ScenarioListProps> = ({ onScenarioSelect }) => {
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [scenarioToDelete, setScenarioToDelete] = useState<Scenario | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchScenarios();
  }, [user]);

  const fetchScenarios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('emission_scenarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch intervention counts
      const scenariosWithCounts = await Promise.all(
        (data || []).map(async (scenario) => {
          const { count } = await supabase
            .from('scenario_interventions')
            .select('*', { count: 'exact', head: true })
            .eq('scenario_id', scenario.id);
          
          return { ...scenario, interventionCount: count || 0 };
        })
      );

      setScenarios(scenariosWithCounts);
    } catch (error: any) {
      feedback.crud.loadError('scenarios', fetchScenarios);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!scenarioToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('emission_scenarios')
        .delete()
        .eq('id', scenarioToDelete.id);

      if (error) throw error;
      feedback.crud.deleteSuccess('Scenario');
      fetchScenarios();
    } catch (error: any) {
      feedback.crud.deleteError('scenario');
    } finally {
      setIsDeleting(false);
      setScenarioToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'archived': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (scenarios.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-2">No Scenarios Yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first scenario to start modeling emission reduction pathways
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((scenario) => (
          <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg">{scenario.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {scenario.description || 'No description'}
                  </CardDescription>
                </div>
                <Badge variant={getStatusColor(scenario.status)}>
                  {scenario.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Baseline</p>
                  <p className="font-medium">{scenario.baseline_year}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Target</p>
                  <p className="font-medium">{scenario.target_year}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Baseline Emissions</p>
                  <p className="font-medium">{scenario.baseline_emissions.toLocaleString()} tCO₂e</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Interventions</p>
                  <p className="font-medium">{scenario.interventionCount || 0}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1"
                  onClick={() => onScenarioSelect(scenario.id)}
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setScenarioToDelete(scenario)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!scenarioToDelete} onOpenChange={() => setScenarioToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scenario</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{scenarioToDelete?.name}</strong>?
              {scenarioToDelete?.interventionCount ? (
                <>
                  <br /><br />
                  This will also remove{' '}
                  <strong>{scenarioToDelete.interventionCount} intervention(s)</strong>{' '}
                  associated with this scenario.
                </>
              ) : null}
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Scenario'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
