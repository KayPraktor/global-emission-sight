import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScenarioList } from '@/components/Scenarios/ScenarioList';
import { ScenarioBuilder } from '@/components/Scenarios/ScenarioBuilder';
import { ScenarioComparison } from '@/components/Scenarios/ScenarioComparison';
import { Plus, TrendingUp, GitCompare } from 'lucide-react';
import { toast } from 'sonner';

const ScenarioPlanningPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('scenarios');
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

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
          <TabsList className="grid w-full max-w-md grid-cols-3">
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
        </Tabs>
      </main>
    </div>
  );
};

export default ScenarioPlanningPage;
