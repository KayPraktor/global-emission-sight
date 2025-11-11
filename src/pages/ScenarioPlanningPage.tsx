import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScenarioList } from '@/components/Scenarios/ScenarioList';
import { ScenarioBuilder } from '@/components/Scenarios/ScenarioBuilder';
import { ScenarioComparison } from '@/components/Scenarios/ScenarioComparison';
import { CostBenefitAnalysis } from '@/components/Scenarios/CostBenefitAnalysis';
import { SensitivityAnalysis } from '@/components/Scenarios/SensitivityAnalysis';
import { Plus, TrendingUp, GitCompare, LineChart } from 'lucide-react';
import { toast } from 'sonner';

const ScenarioPlanningPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('scenarios');
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [selectedScenarioData, setSelectedScenarioData] = useState<any>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  useEffect(() => {
    if (selectedScenario) {
      loadScenarioData(selectedScenario);
    }
  }, [selectedScenario]);

  const loadScenarioData = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('emission_scenarios')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setSelectedScenarioData(data);
    } catch (error) {
      console.error('Failed to load scenario:', error);
    }
  };

  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    setShowBuilder(true);
    setActiveTab('builder');
  };

  const handleCreateNew = () => {
    setSelectedScenario(null);
    setShowBuilder(true);
    setActiveTab('builder');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Scenario Planning</h1>
            <p className="text-muted-foreground">
              Model the impact of potential changes on future emissions and visualize different pathways to your goals
            </p>
          </div>
          <Button onClick={handleCreateNew} className="gap-2">
            <Plus className="h-4 w-4" />
            New Scenario
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="scenarios" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Scenarios
            </TabsTrigger>
            <TabsTrigger value="builder" className="gap-2">
              <Plus className="h-4 w-4" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-2">
              <GitCompare className="h-4 w-4" />
              Compare
            </TabsTrigger>
            <TabsTrigger value="cost-benefit" className="gap-2" disabled={!selectedScenario}>
              <LineChart className="h-4 w-4" />
              Cost-Benefit
            </TabsTrigger>
            <TabsTrigger value="sensitivity" className="gap-2" disabled={!selectedScenario}>
              <LineChart className="h-4 w-4" />
              Sensitivity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scenarios" className="mt-6">
            <ScenarioList onScenarioSelect={handleScenarioSelect} />
          </TabsContent>

          <TabsContent value="builder" className="mt-6">
            <ScenarioBuilder 
              scenarioId={selectedScenario}
              onComplete={() => {
                setActiveTab('scenarios');
                setShowBuilder(false);
              }}
            />
          </TabsContent>

          <TabsContent value="compare" className="mt-6">
            <ScenarioComparison />
          </TabsContent>

          <TabsContent value="cost-benefit" className="mt-6">
            {selectedScenario && selectedScenarioData ? (
              <CostBenefitAnalysis
                scenarioId={selectedScenario}
                baselineYear={selectedScenarioData.baseline_year}
                targetYear={selectedScenarioData.target_year}
                baselineEmissions={Number(selectedScenarioData.baseline_emissions)}
              />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Select a scenario to view cost-benefit analysis
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sensitivity" className="mt-6">
            {selectedScenario && selectedScenarioData ? (
              <SensitivityAnalysis
                scenarioId={selectedScenario}
                baselineYear={selectedScenarioData.baseline_year}
                targetYear={selectedScenarioData.target_year}
                baselineEmissions={Number(selectedScenarioData.baseline_emissions)}
              />
            ) : (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Select a scenario to view sensitivity analysis
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ScenarioPlanningPage;
