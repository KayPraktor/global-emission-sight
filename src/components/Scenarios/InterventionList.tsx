import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
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

interface Intervention {
  id: string;
  intervention_type: string;
  name: string;
  description: string;
  implementation_year: number;
  reduction_percentage: number;
  affected_scope: string[];
  annual_cost: number;
  one_time_cost: number;
  confidence_level: string;
}

interface InterventionListProps {
  scenarioId: string;
}

export const InterventionList: React.FC<InterventionListProps> = ({ scenarioId }) => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);
  const [interventionToDelete, setInterventionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchInterventions();

    const channel = supabase
      .channel('interventions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scenario_interventions',
          filter: `scenario_id=eq.${scenarioId}`
        },
        () => fetchInterventions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scenarioId]);

  const fetchInterventions = async () => {
    try {
      const { data, error } = await supabase
        .from('scenario_interventions')
        .select('*')
        .eq('scenario_id', scenarioId)
        .order('implementation_year');

      if (error) throw error;
      setInterventions(data || []);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!interventionToDelete || isDeleting) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('scenario_interventions')
        .delete()
        .eq('id', interventionToDelete);

      if (error) throw error;
      toast.success('Intervention deleted');
    } catch (error: any) {
      toast.error('Failed to delete intervention');
      console.error(error);
    } finally {
      setIsDeleting(false);
      setInterventionToDelete(null);
    }
  };

  if (loading) return null;

  if (interventions.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No interventions added yet. Add interventions above to model their impact.
        </CardContent>
      </Card>
    );
  }

  const getConfidenceBadge = (level: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      high: 'default',
      medium: 'secondary',
      low: 'outline'
    };
    return variants[level] || 'secondary';
  };

  const interventionName = interventions.find(i => i.id === interventionToDelete)?.name;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Interventions ({interventions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Reduction</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Investment</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interventions.map((intervention) => (
                  <TableRow key={intervention.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{intervention.name}</p>
                        {intervention.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {intervention.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{intervention.implementation_year}</TableCell>
                    <TableCell>{intervention.reduction_percentage}%</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {intervention.affected_scope.map(scope => (
                          <Badge key={scope} variant="outline" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {intervention.one_time_cost > 0 && (
                          <div>${intervention.one_time_cost.toLocaleString()} (one-time)</div>
                        )}
                        {intervention.annual_cost > 0 && (
                          <div>${intervention.annual_cost.toLocaleString()}/yr</div>
                        )}
                        {intervention.one_time_cost === 0 && intervention.annual_cost === 0 && '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getConfidenceBadge(intervention.confidence_level)}>
                        {intervention.confidence_level}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setInterventionToDelete(intervention.id)}
                        disabled={isDeleting && interventionToDelete === intervention.id}
                      >
                        {isDeleting && interventionToDelete === intervention.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!interventionToDelete} onOpenChange={(open) => !open && setInterventionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Intervention</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{interventionName}"? This action cannot be undone and will affect your scenario projections.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
