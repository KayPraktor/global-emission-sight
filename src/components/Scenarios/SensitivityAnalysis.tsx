import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingDown, AlertTriangle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface SensitivityAnalysisProps {
  scenarioId: string;
  baselineYear: number;
  targetYear: number;
  baselineEmissions: number;
}

interface ScenarioData {
  year: number;
  bestCase: number;
  likelyCase: number;
  worstCase: number;
  baseline: number;
}

export const SensitivityAnalysis: React.FC<SensitivityAnalysisProps> = ({
  scenarioId,
  baselineYear,
  targetYear,
  baselineEmissions
}) => {
  const [variancePercent, setVariancePercent] = useState(20); // ±20% default
  const [scenarioData, setScenarioData] = useState<ScenarioData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scenarioId) {
      calculateSensitivity();
    }
  }, [scenarioId, variancePercent, baselineYear, targetYear, baselineEmissions]);

  const calculateSensitivity = async () => {
    try {
      setLoading(true);

      // Fetch interventions
      const { data: interventions, error } = await supabase
        .from('scenario_interventions')
        .select('*')
        .eq('scenario_id', scenarioId)
        .eq('is_active', true);

      if (error) throw error;

      const yearlyData: ScenarioData[] = [];

      for (let year = baselineYear; year <= targetYear; year++) {
        const activeInterventions = (interventions || []).filter(
          (i: any) => i.implementation_year <= year
        );

        // Calculate base reduction
        const baseReduction = activeInterventions.reduce(
          (sum: number, i: any) => sum + Number(i.reduction_percentage),
          0
        );

        // Apply variance for sensitivity scenarios
        const varianceFactor = variancePercent / 100;
        
        // Best case: interventions are more effective
        const bestCaseReduction = Math.min(baseReduction * (1 + varianceFactor), 100);
        const bestCaseEmissions = baselineEmissions * (1 - bestCaseReduction / 100);

        // Likely case: as planned
        const likelyCaseReduction = Math.min(baseReduction, 100);
        const likelyCaseEmissions = baselineEmissions * (1 - likelyCaseReduction / 100);

        // Worst case: interventions are less effective
        const worstCaseReduction = Math.min(baseReduction * (1 - varianceFactor), 100);
        const worstCaseEmissions = baselineEmissions * (1 - worstCaseReduction / 100);

        yearlyData.push({
          year,
          bestCase: bestCaseEmissions,
          likelyCase: likelyCaseEmissions,
          worstCase: worstCaseEmissions,
          baseline: baselineEmissions
        });
      }

      setScenarioData(yearlyData);
    } catch (error: any) {
      toast.error('Failed to calculate sensitivity analysis');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const finalData = scenarioData[scenarioData.length - 1];
  const bestCaseReduction = finalData ? ((baselineEmissions - finalData.bestCase) / baselineEmissions) * 100 : 0;
  const likelyCaseReduction = finalData ? ((baselineEmissions - finalData.likelyCase) / baselineEmissions) * 100 : 0;
  const worstCaseReduction = finalData ? ((baselineEmissions - finalData.worstCase) / baselineEmissions) * 100 : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sensitivity Analysis</CardTitle>
          <CardDescription>
            Model how varying intervention effectiveness impacts emissions reduction outcomes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Effectiveness Variance: ±{variancePercent}%</Label>
              </div>
              <Slider
                value={[variancePercent]}
                onValueChange={(value) => setVariancePercent(value[0])}
                min={5}
                max={50}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Adjust the range to see how uncertainty in intervention effectiveness affects outcomes
              </p>
            </div>
          </div>

          {scenarioData.length > 0 && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-chart-2 bg-chart-2/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="h-5 w-5 text-chart-2" />
                      <div className="text-sm font-medium text-foreground">Best Case</div>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {finalData?.bestCase.toFixed(0)} tCO₂e
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {bestCaseReduction.toFixed(1)}% reduction
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Interventions perform {variancePercent}% better than expected
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-primary bg-primary/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="h-5 w-5 text-primary" />
                      <div className="text-sm font-medium text-foreground">Likely Case</div>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {finalData?.likelyCase.toFixed(0)} tCO₂e
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {likelyCaseReduction.toFixed(1)}% reduction
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Interventions perform as planned
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-destructive bg-destructive/5">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <div className="text-sm font-medium text-foreground">Worst Case</div>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {finalData?.worstCase.toFixed(0)} tCO₂e
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {worstCaseReduction.toFixed(1)}% reduction
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Interventions perform {variancePercent}% worse than expected
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={scenarioData}>
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
                      fillOpacity={0.3}
                      name="Baseline (No Action)"
                    />
                    <Area
                      type="monotone"
                      dataKey="worstCase"
                      stroke="hsl(var(--destructive))"
                      fill="hsl(var(--destructive) / 0.2)"
                      fillOpacity={0.3}
                      name="Worst Case"
                    />
                    <Area
                      type="monotone"
                      dataKey="likelyCase"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary) / 0.2)"
                      fillOpacity={0.4}
                      strokeWidth={3}
                      name="Likely Case"
                    />
                    <Area
                      type="monotone"
                      dataKey="bestCase"
                      stroke="hsl(var(--chart-2))"
                      fill="hsl(var(--chart-2) / 0.2)"
                      fillOpacity={0.3}
                      name="Best Case"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Emissions Range by {targetYear}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Best Case:</span>
                        <span className="font-bold text-chart-2">
                          {finalData?.bestCase.toFixed(0)} tCO₂e
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Likely Case:</span>
                        <span className="font-bold text-primary">
                          {finalData?.likelyCase.toFixed(0)} tCO₂e
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Worst Case:</span>
                        <span className="font-bold text-destructive">
                          {finalData?.worstCase.toFixed(0)} tCO₂e
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Expected Range:</span>
                          <span className="font-bold">
                            {(finalData?.worstCase || 0).toFixed(0)} - {(finalData?.bestCase || 0).toFixed(0)} tCO₂e
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Reduction Uncertainty</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Best Case Reduction:</span>
                        <span className="font-bold text-chart-2">
                          {bestCaseReduction.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Likely Reduction:</span>
                        <span className="font-bold text-primary">
                          {likelyCaseReduction.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Worst Case Reduction:</span>
                        <span className="font-bold text-destructive">
                          {worstCaseReduction.toFixed(1)}%
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Uncertainty Range:</span>
                          <span className="font-bold">
                            ±{((bestCaseReduction - worstCaseReduction) / 2).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
