import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { GitCompare } from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
}

export const ScenarioComparison: React.FC = () => {
  const { user } = useAuth();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<any[]>([]);

  useEffect(() => {
    fetchScenarios();
  }, [user]);

  useEffect(() => {
    if (selectedScenarios.length > 0) {
      fetchComparisonData();
    }
  }, [selectedScenarios]);

  const fetchScenarios = async () => {
    const { data } = await supabase
      .from('emission_scenarios')
      .select('id, name')
      .order('name');
    
    setScenarios(data || []);
  };

  const fetchComparisonData = async () => {
    const allData: any = {};

    for (const scenarioId of selectedScenarios) {
      const { data } = await supabase
        .from('scenario_projections')
        .select('*')
        .eq('scenario_id', scenarioId)
        .order('year');

      const scenario = scenarios.find(s => s.id === scenarioId);

      data?.forEach(proj => {
        if (!allData[proj.year]) {
          allData[proj.year] = { year: proj.year };
        }
        allData[proj.year][scenario?.name || scenarioId] = proj.projected_emissions;
      });
    }

    const chartData = Object.values(allData).sort((a: any, b: any) => a.year - b.year);
    setComparisonData(chartData);
  };

  const handleScenarioSelect = (scenarioId: string) => {
    if (selectedScenarios.includes(scenarioId)) {
      setSelectedScenarios(selectedScenarios.filter(id => id !== scenarioId));
    } else if (selectedScenarios.length < 4) {
      setSelectedScenarios([...selectedScenarios, scenarioId]);
    }
  };

  const colors = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitCompare className="h-5 w-5" />
          Compare Scenarios
        </CardTitle>
        <CardDescription>
          Compare projected emissions across up to 4 different scenarios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map(index => (
            <div key={index} className="space-y-2">
              <Select 
                value={selectedScenarios[index] || ''} 
                onValueChange={(value) => {
                  const newSelected = [...selectedScenarios];
                  newSelected[index] = value;
                  setSelectedScenarios(newSelected.filter(Boolean));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Scenario ${index + 1}`} />
                </SelectTrigger>
                <SelectContent>
                  {scenarios
                    .filter(s => !selectedScenarios.includes(s.id) || selectedScenarios[index] === s.id)
                    .map(scenario => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>

        {comparisonData.length > 0 ? (
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis label={{ value: 'Emissions (tCO₂e)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                {selectedScenarios.map((scenarioId, index) => {
                  const scenario = scenarios.find(s => s.id === scenarioId);
                  return (
                    <Line
                      key={scenarioId}
                      type="monotone"
                      dataKey={scenario?.name || scenarioId}
                      stroke={colors[index]}
                      strokeWidth={2}
                      name={scenario?.name}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <GitCompare className="h-12 w-12 mx-auto mb-4" />
            <p>Select scenarios above to compare their projected emissions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
