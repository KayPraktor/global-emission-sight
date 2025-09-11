import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { DataFreshness } from '@/components/ui/data-freshness';

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

  // Enhanced sample data with scope breakdowns
  const overallData: TargetData[] = [
    { period: 'Jan', actual: 980, predicted: 980, upperBound: 1050, lowerBound: 910, target: 900, scope1: 320, scope2: 450, scope3: 210 },
    { period: 'Feb', actual: 960, predicted: 950, upperBound: 1020, lowerBound: 880, target: 880, scope1: 310, scope2: 440, scope3: 210 },
    { period: 'Mar', actual: 940, predicted: 930, upperBound: 1000, lowerBound: 860, target: 860, scope1: 300, scope2: 430, scope3: 210 },
    { period: 'Apr', actual: 920, predicted: 910, upperBound: 980, lowerBound: 840, target: 840, scope1: 290, scope2: 420, scope3: 210 },
    { period: 'May', actual: 900, predicted: 890, upperBound: 960, lowerBound: 820, target: 820, scope1: 280, scope2: 410, scope3: 210 },
    { period: 'Jun', predicted: 870, upperBound: 940, lowerBound: 800, target: 800, scope1: 270, scope2: 400, scope3: 200 },
    { period: 'Jul', predicted: 850, upperBound: 920, lowerBound: 780, target: 780, scope1: 260, scope2: 390, scope3: 200 },
    { period: 'Aug', predicted: 830, upperBound: 900, lowerBound: 760, target: 760, scope1: 250, scope2: 380, scope3: 200 },
  ];

  const facilityData = [
    { period: 'Jan', facility_a: 280, facility_b: 340, facility_c: 360, target_a: 270, target_b: 330, target_c: 350 },
    { period: 'Feb', facility_a: 275, facility_b: 335, facility_c: 350, target_a: 265, target_b: 325, target_c: 340 },
    { period: 'Mar', facility_a: 270, facility_b: 330, facility_c: 340, target_a: 260, target_b: 320, target_c: 330 },
    { period: 'Apr', facility_a: 265, facility_b: 325, facility_c: 330, target_a: 255, target_b: 315, target_c: 320 },
    { period: 'May', facility_a: 260, facility_b: 320, facility_c: 320, target_a: 250, target_b: 310, target_c: 310 },
  ];

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