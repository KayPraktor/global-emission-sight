import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Calculator, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

interface ScenarioProjectionProps {
  scenarioId: string;
  baselineYear: number;
  targetYear: number;
  baselineEmissions: number;
}

interface Intervention {
  implementation_year: number;
  reduction_percentage: number;
  affected_scope: string[];
}

export const ScenarioProjection: React.FC<ScenarioProjectionProps> = ({
  scenarioId,
  baselineYear,
  targetYear,
  baselineEmissions
}) => {
  const [calculating, setCalculating] = useState(false);
  const [projectionData, setProjectionData] = useState<any[]>([]);
  const [totalReduction, setTotalReduction] = useState(0);

  const calculateProjections = async () => {
    try {
      setCalculating(true);

      // Fetch interventions
      const { data: interventions, error } = await supabase
        .from('scenario_interventions')
        .select('*')
        .eq('scenario_id', scenarioId)
        .eq('is_active', true);

      if (error) throw error;

      const yearlyData: any[] = [];
      let cumulativeReduction = 0;
      let totalInvestment = 0;

      for (let year = baselineYear; year <= targetYear; year++) {
        // Calculate reductions from interventions implemented by this year
        const activeInterventions = (interventions || []).filter(
          (i: Intervention) => i.implementation_year <= year
        );

        // Simple model: sum reduction percentages (in reality would be more complex)
        const yearReduction = activeInterventions.reduce(
          (sum: number, i: Intervention) => sum + Number(i.reduction_percentage),
          0
        );

        const effectiveReduction = Math.min(yearReduction, 100); // Cap at 100%
        const projectedEmissions = baselineEmissions * (1 - effectiveReduction / 100);
        cumulativeReduction = baselineEmissions - projectedEmissions;

        // Calculate investment
        const newInterventions = (interventions || []).filter(
          (i: any) => i.implementation_year === year
        );
        const yearInvestment = newInterventions.reduce(
          (sum: number, i: any) => sum + Number(i.one_time_cost || 0),
          0
        );
        totalInvestment += yearInvestment;

        yearlyData.push({
          year,
          baseline: baselineEmissions,
          projected: projectedEmissions,
          reduction: cumulativeReduction,
          reductionPercentage: effectiveReduction,
          investment: totalInvestment
        });
      }

      setProjectionData(yearlyData);
      setTotalReduction(cumulativeReduction);

      // Save projections to database
      await supabase.from('scenario_projections').delete().eq('scenario_id', scenarioId);
      
      const projectionsToSave = yearlyData.map(d => ({
        scenario_id: scenarioId,
        year: d.year,
        projected_emissions: d.projected,
        cumulative_reduction: d.reduction,
        total_investment: d.investment
      }));

      await supabase.from('scenario_projections').insert(projectionsToSave);

      toast.success('Projections calculated');
    } catch (error: any) {
      toast.error('Failed to calculate projections');
      console.error(error);
    } finally {
      setCalculating(false);
    }
  };

  useEffect(() => {
    // Auto-calculate when interventions change
    const channel = supabase
      .channel('scenario-interventions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scenario_interventions',
          filter: `scenario_id=eq.${scenarioId}`
        },
        () => {
          // Debounce recalculation
          setTimeout(() => calculateProjections(), 500);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scenarioId, baselineYear, targetYear, baselineEmissions]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Emission Projections</CardTitle>
            <CardDescription>
              Modeled impact of interventions on future emissions
            </CardDescription>
          </div>
          <Button onClick={calculateProjections} disabled={calculating} className="gap-2">
            <Calculator className="h-4 w-4" />
            {calculating ? 'Calculating...' : 'Calculate'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {projectionData.length > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{totalReduction.toFixed(0)} tCO₂e</div>
                  <p className="text-xs text-muted-foreground">Total Reduction by {targetYear}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {((totalReduction / baselineEmissions) * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Percentage Reduction</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {projectionData[projectionData.length - 1]?.projected.toFixed(0)} tCO₂e
                  </div>
                  <p className="text-xs text-muted-foreground">Projected Emissions in {targetYear}</p>
                </CardContent>
              </Card>
            </div>

            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: 'Emissions (tCO₂e)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="baseline"
                    stroke="hsl(var(--muted-foreground))"
                    fill="hsl(var(--muted))"
                    name="Baseline (No Action)"
                  />
                  <Area
                    type="monotone"
                    dataKey="projected"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.2)"
                    name="Projected Emissions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projectionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis label={{ value: 'Cumulative Investment ($)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="investment"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    name="Total Investment"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {projectionData.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <TrendingDown className="h-12 w-12 mx-auto mb-4" />
            <p>Click "Calculate" to generate emission projections</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
