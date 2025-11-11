import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Edit, Trash2, Play } from 'lucide-react';
import { toast } from 'sonner';

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
      toast.error('Failed to load scenarios');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scenarioId: string) => {
    if (!confirm('Are you sure you want to delete this scenario?')) return;

    try {
      const { error } = await supabase
        .from('emission_scenarios')
        .delete()
        .eq('id', scenarioId);

      if (error) throw error;
      toast.success('Scenario deleted');
      fetchScenarios();
    } catch (error: any) {
      toast.error('Failed to delete scenario');
      console.error(error);
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
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading scenarios...
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
                onClick={() => handleDelete(scenario.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
