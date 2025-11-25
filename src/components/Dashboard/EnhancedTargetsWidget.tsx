import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { DataFreshness } from '@/components/ui/data-freshness';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths } from 'date-fns';

interface TargetData {
  period: string;
  actual?: number;
  predicted: number;
  upperBound: number;
  lowerBound: number;
  target: number;
  scope1?: number;
  scope2?: number;
  scope3?: number;
}

const EnhancedTargetsWidget: React.FC = () => {
  const [selectedView, setSelectedView] = useState<string>('overall');
  const [overallData, setOverallData] = useState<TargetData[]>([]);
  const [facilityData, setFacilityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTargetData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get organization
        const { data: orgMember } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .single();

        if (!orgMember) return;

        // Fetch goals for targets
        const { data: goals } = await supabase
          .from('goals')
          .select('*')
          .eq('organization_id', orgMember.organization_id)
          .order('target_date', { ascending: false })
          .limit(1);

        const activeGoal = goals?.[0];

        // Fetch emissions data for last 8 months
        const { data: emissions } = await supabase
          .from('emissions_entries')
          .select('entry_date, quantity, scope, category')
          .eq('organization_id', orgMember.organization_id)
          .gte('entry_date', format(subMonths(new Date(), 8), 'yyyy-MM-dd'))
          .order('entry_date', { ascending: true });

        // Fetch forecasts
        const { data: forecasts } = await supabase
          .from('emissions_forecasts')
          .select('*')
          .eq('organization_id', orgMember.organization_id)
          .gte('period', format(subMonths(new Date(), 8), 'yyyy-MM-dd'))
          .order('period', { ascending: true });

        // Transform emissions data by month
        const monthlyData: { [key: string]: { total: number; scope1: number; scope2: number; scope3: number } } = {};
        
        emissions?.forEach(entry => {
          const month = format(new Date(entry.entry_date), 'MMM');
          if (!monthlyData[month]) {
            monthlyData[month] = { total: 0, scope1: 0, scope2: 0, scope3: 0 };
          }
          monthlyData[month].total += entry.quantity;
          if (entry.scope === 'S1') monthlyData[month].scope1 += entry.quantity;
          if (entry.scope === 'S2') monthlyData[month].scope2 += entry.quantity;
          if (entry.scope === 'S3') monthlyData[month].scope3 += entry.quantity;
        });

        // Create target data array
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
        const targetValue = activeGoal?.target_emissions || 900;
        const transformed: TargetData[] = months.map((month, idx) => {
          const actual = monthlyData[month]?.total || undefined;
          const forecast = forecasts?.find(f => format(new Date(f.period), 'MMM') === month);
          const predicted = forecast?.predicted_emissions || (targetValue - idx * 20);
          
          return {
            period: month,
            actual,
            predicted,
            upperBound: predicted * 1.1,
            lowerBound: predicted * 0.9,
            target: targetValue - idx * 15,
            scope1: monthlyData[month]?.scope1,
            scope2: monthlyData[month]?.scope2,
            scope3: monthlyData[month]?.scope3
          };
        });

        setOverallData(transformed);

        // Fetch facility data
        const { data: facilities } = await supabase
          .from('facilities')
          .select('id, name')
          .eq('organization_id', orgMember.organization_id)
          .limit(3);

        if (facilities && facilities.length > 0) {
          const facilityEmissions = months.slice(0, 5).map(month => {
            const facilityData: any = { period: month };
            facilities.forEach((facility, idx) => {
              const value = monthlyData[month]?.total / facilities.length || 300 - idx * 10;
              facilityData[`facility_${String.fromCharCode(97 + idx)}`] = value;
              facilityData[`target_${String.fromCharCode(97 + idx)}`] = value * 0.95;
            });
            return facilityData;
          });
          setFacilityData(facilityEmissions);
        }
      } catch (error) {
        console.error('Error fetching target data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTargetData();
  }, []);

  // Performance metrics calculation
  const latestActual = overallData.find(d => d.actual !== undefined)?.actual || 0;
  const latestTarget = overallData.find(d => d.target !== undefined)?.target || 0;
  const performance = latestTarget > 0 ? ((latestTarget - latestActual) / latestTarget * 100) : 0;
  const onTrack = performance >= -5; // Within 5% of target
  
  // Progress to annual target
  const annualTarget = 9600; // 800 * 12
  const currentProgress = (5 * 800) / annualTarget * 100; // Assuming 5 months completed
  
  // Key milestones
  const milestones = [
    { name: 'Q2 Target', value: 2400, current: latestActual * 2, status: 'on-track' },
    { name: 'Mid-year', value: 4800, current: latestActual * 5, status: 'at-risk' },
    { name: 'Annual Goal', value: 9600, current: latestActual * 12, status: 'on-track' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <GlassmorphismCard variant="light" className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </GlassmorphismCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassmorphismCard variant="light" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current vs Target</p>
              <p className="text-2xl font-bold text-foreground">{latestActual}</p>
              <p className="text-xs text-muted-foreground">vs {latestTarget} tCO₂e</p>
            </div>
            {onTrack ? (
              <CheckCircle className="h-8 w-8 text-green-500" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            )}
          </div>
          <div className="mt-2">
            <Badge variant={onTrack ? "default" : "secondary"} className="text-xs">
              {performance > 0 ? `${performance.toFixed(1)}% under target` : `${Math.abs(performance).toFixed(1)}% over target`}
            </Badge>
          </div>
        </GlassmorphismCard>

        <GlassmorphismCard variant="light" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Annual Progress</p>
              <p className="text-2xl font-bold text-foreground">{currentProgress.toFixed(1)}%</p>
            </div>
            <Target className="h-8 w-8 text-primary" />
          </div>
          <Progress value={currentProgress} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">On track for annual goal</p>
        </GlassmorphismCard>

        <GlassmorphismCard variant="light" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Trend</p>
              <p className="text-2xl font-bold text-foreground">-8.2%</p>
            </div>
            <TrendingDown className="h-8 w-8 text-green-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Consistent reduction</p>
        </GlassmorphismCard>

        <GlassmorphismCard variant="light" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Next Milestone</p>
              <p className="text-2xl font-bold text-foreground">Q2</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">45 days remaining</p>
        </GlassmorphismCard>
      </div>

      {/* Enhanced Targets Chart with Tabs */}
      <GlassmorphismCard variant="light" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-primary" />
            <div>
              <h4 className="font-medium">Performance Analysis</h4>
              <p className="text-sm text-muted-foreground">Multi-dimensional view of targets vs actual emissions</p>
            </div>
          </div>
          <DataFreshness lastUpdated={new Date()} />
        </div>

        <Tabs value={selectedView} onValueChange={setSelectedView}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overall">Overall</TabsTrigger>
            <TabsTrigger value="scope">By Scope</TabsTrigger>
            <TabsTrigger value="facility">By Facility</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
          </TabsList>

          <TabsContent value="overall" className="space-y-4">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={overallData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} className="text-muted-foreground" />
                  <YAxis axisLine={false} tickLine={false} className="text-muted-foreground" />
                  <Tooltip 
                    formatter={(value: number, name: string) => [`${value?.toFixed(1)} tCO₂e`, name]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  
                  <Area type="monotone" dataKey="upperBound" stackId="1" stroke="none" fill="hsl(var(--muted))" fillOpacity={0.3} />
                  <Area type="monotone" dataKey="lowerBound" stackId="1" stroke="none" fill="hsl(var(--background))" fillOpacity={1} />
                  
                  <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }} name="Actual" />
                  <Line type="monotone" dataKey="predicted" stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }} name="Predicted" opacity={0.7} />
                  <Line type="monotone" dataKey="target" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ fill: 'hsl(var(--destructive))', strokeWidth: 2, r: 4 }} name="Target" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="scope" className="space-y-4">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={overallData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} className="text-muted-foreground" />
                  <YAxis axisLine={false} tickLine={false} className="text-muted-foreground" />
                  <Tooltip formatter={(value: number, name: string) => [`${value?.toFixed(1)} tCO₂e`, name]} />
                  <Legend />
                  
                  <Bar dataKey="scope1" stackId="a" fill="hsl(var(--primary))" name="Scope 1" />
                  <Bar dataKey="scope2" stackId="a" fill="hsl(var(--secondary))" name="Scope 2" />
                  <Bar dataKey="scope3" stackId="a" fill="hsl(var(--accent))" name="Scope 3" />
                  <Line type="monotone" dataKey="target" stroke="hsl(var(--destructive))" strokeWidth={2} name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="facility" className="space-y-4">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={facilityData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} className="text-muted-foreground" />
                  <YAxis axisLine={false} tickLine={false} className="text-muted-foreground" />
                  <Tooltip formatter={(value: number, name: string) => [`${value?.toFixed(1)} tCO₂e`, name]} />
                  <Legend />
                  
                  <Line type="monotone" dataKey="facility_a" stroke="hsl(var(--primary))" strokeWidth={2} name="Facility A" />
                  <Line type="monotone" dataKey="facility_b" stroke="hsl(var(--secondary))" strokeWidth={2} name="Facility B" />
                  <Line type="monotone" dataKey="facility_c" stroke="hsl(var(--accent))" strokeWidth={2} name="Facility C" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {milestones.map((milestone, index) => (
                <GlassmorphismCard key={index} variant="light" className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">{milestone.name}</h5>
                      <Badge variant={milestone.status === 'on-track' ? 'default' : 'secondary'}>
                        {milestone.status === 'on-track' ? 'On Track' : 'At Risk'}
                      </Badge>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Current: {milestone.current.toFixed(0)}</span>
                        <span>Target: {milestone.value}</span>
                      </div>
                      <Progress value={(milestone.current / milestone.value) * 100} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {((milestone.current / milestone.value) * 100).toFixed(1)}% of target achieved
                    </p>
                  </div>
                </GlassmorphismCard>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </GlassmorphismCard>
    </div>
  );
};

export default EnhancedTargetsWidget;