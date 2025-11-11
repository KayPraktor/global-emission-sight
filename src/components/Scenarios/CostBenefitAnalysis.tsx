import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { DollarSign, TrendingUp, Percent } from 'lucide-react';
import { toast } from 'sonner';

interface CostBenefitAnalysisProps {
  scenarioId: string;
  baselineYear: number;
  targetYear: number;
  baselineEmissions: number;
}

interface AnalysisData {
  year: number;
  cumulativeCosts: number;
  cumulativeSavings: number;
  netBenefit: number;
  emissionsReduced: number;
  carbonCredits: number;
  roi: number;
}

export const CostBenefitAnalysis: React.FC<CostBenefitAnalysisProps> = ({
  scenarioId,
  baselineYear,
  targetYear,
  baselineEmissions
}) => {
  const [carbonPrice, setCarbonPrice] = useState(50); // $/tCO2e
  const [annualEnergySavings, setAnnualEnergySavings] = useState(0); // $ per year
  const [analysisData, setAnalysisData] = useState<AnalysisData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scenarioId) {
      calculateCostBenefit();
    }
  }, [scenarioId, carbonPrice, annualEnergySavings, baselineYear, targetYear, baselineEmissions]);

  const calculateCostBenefit = async () => {
    try {
      setLoading(true);

      // Fetch interventions
      const { data: interventions, error: intError } = await supabase
        .from('scenario_interventions')
        .select('*')
        .eq('scenario_id', scenarioId)
        .eq('is_active', true);

      if (intError) throw intError;

      // Fetch projections
      const { data: projections, error: projError } = await supabase
        .from('scenario_projections')
        .select('*')
        .eq('scenario_id', scenarioId)
        .order('year', { ascending: true });

      if (projError) throw projError;

      const yearlyData: AnalysisData[] = [];
      let cumulativeCosts = 0;
      let cumulativeSavings = 0;

      for (let year = baselineYear; year <= targetYear; year++) {
        // Calculate costs for this year
        const yearInterventions = (interventions || []).filter(
          (i: any) => i.implementation_year === year
        );
        
        const oneTimeCost = yearInterventions.reduce(
          (sum: number, i: any) => sum + Number(i.one_time_cost || 0),
          0
        );

        const activeInterventions = (interventions || []).filter(
          (i: any) => i.implementation_year <= year
        );

        const annualCost = activeInterventions.reduce(
          (sum: number, i: any) => sum + Number(i.annual_cost || 0),
          0
        );

        cumulativeCosts += oneTimeCost + annualCost;

        // Calculate savings
        const projection = projections?.find(p => p.year === year);
        const emissionsReduced = projection?.cumulative_reduction || 0;
        
        // Carbon credit value
        const carbonCredits = Number(emissionsReduced) * carbonPrice;
        
        // Energy savings (if interventions reduce energy use)
        const energySavings = annualEnergySavings * (year - baselineYear);
        
        cumulativeSavings = carbonCredits + energySavings;

        const netBenefit = cumulativeSavings - cumulativeCosts;
        const roi = cumulativeCosts > 0 ? (netBenefit / cumulativeCosts) * 100 : 0;

        yearlyData.push({
          year,
          cumulativeCosts,
          cumulativeSavings,
          netBenefit,
          emissionsReduced: Number(emissionsReduced),
          carbonCredits,
          roi
        });
      }

      setAnalysisData(yearlyData);
    } catch (error: any) {
      toast.error('Failed to calculate cost-benefit analysis');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const finalData = analysisData[analysisData.length - 1];
  const breakEvenYear = analysisData.find(d => d.netBenefit > 0)?.year;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cost-Benefit Analysis</CardTitle>
          <CardDescription>
            Compare intervention costs against emissions reductions and carbon credit savings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Carbon Price ($/tCO₂e)</Label>
              <Input
                type="number"
                value={carbonPrice}
                onChange={(e) => setCarbonPrice(Number(e.target.value))}
                min="0"
                step="1"
              />
            </div>
            <div className="space-y-2">
              <Label>Annual Energy Savings ($)</Label>
              <Input
                type="number"
                value={annualEnergySavings}
                onChange={(e) => setAnnualEnergySavings(Number(e.target.value))}
                min="0"
                step="1000"
              />
            </div>
          </div>

          {analysisData.length > 0 && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div className="text-2xl font-bold text-destructive">
                        ${finalData?.cumulativeCosts.toLocaleString()}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Total Costs</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div className="text-2xl font-bold text-success">
                        ${finalData?.cumulativeSavings.toLocaleString()}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Total Savings</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <div className={`text-2xl font-bold ${finalData?.netBenefit >= 0 ? 'text-success' : 'text-destructive'}`}>
                        ${finalData?.netBenefit.toLocaleString()}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Net Benefit</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Percent className="h-4 w-4 text-muted-foreground" />
                      <div className={`text-2xl font-bold ${finalData?.roi >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {finalData?.roi.toFixed(1)}%
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">ROI</p>
                  </CardContent>
                </Card>
              </div>

              {breakEvenYear && (
                <Card className="bg-success/10 border-success">
                  <CardContent className="pt-6">
                    <p className="text-sm font-medium">
                      Break-even Point: <span className="text-lg font-bold">{breakEvenYear}</span>
                    </p>
                  </CardContent>
                </Card>
              )}

              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="cumulativeCosts"
                      stroke="hsl(var(--destructive))"
                      fill="hsl(var(--destructive) / 0.2)"
                      name="Cumulative Costs"
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulativeSavings"
                      stroke="hsl(var(--chart-2))"
                      fill="hsl(var(--chart-2) / 0.2)"
                      name="Cumulative Savings"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis label={{ value: 'Net Benefit ($)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="netBenefit"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      name="Net Benefit"
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="roi"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      name="ROI (%)"
                      yAxisId="right"
                      dot={{ fill: 'hsl(var(--chart-3))' }}
                    />
                    <YAxis 
                      yAxisId="right" 
                      orientation="right" 
                      label={{ value: 'ROI (%)', angle: 90, position: 'insideRight' }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysisData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis label={{ value: 'Carbon Credits ($)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Legend />
                    <Bar
                      dataKey="carbonCredits"
                      fill="hsl(var(--chart-4))"
                      name="Carbon Credit Value"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
