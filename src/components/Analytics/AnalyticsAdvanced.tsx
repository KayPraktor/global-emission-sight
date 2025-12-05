import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { ComposedChart, CartesianGrid, XAxis, YAxis, Legend, Area, Line, ReferenceLine, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Calendar, Download, Filter, Eye, EyeOff } from 'lucide-react';
import ForecastInsightsPanel from './ForecastInsightsPanel';

// Scenario data with confidence bands
const scenarioData = {
  conservative: [
    { year: '2020', intensity: 60, upper: 60, lower: 60 },
    { year: '2021', intensity: 55, upper: 55, lower: 55 },
    { year: '2022', intensity: 47, upper: 47, lower: 47 },
    { year: '2023', intensity: 42, upper: 42, lower: 42 },
    { year: '2024', intensity: 35, upper: 35, lower: 35 },
    { year: '2025', intensity: 31, upper: 31, lower: 31 },
    { year: '2026', intensity: 29, upper: 32, lower: 26 },
    { year: '2027', intensity: 27, upper: 31, lower: 23 },
    { year: '2028', intensity: 25, upper: 30, lower: 20 },
    { year: '2029', intensity: 23, upper: 29, lower: 17 },
    { year: '2030', intensity: 21, upper: 28, lower: 14 },
  ],
  moderate: [
    { year: '2020', intensity: 60, upper: 60, lower: 60 },
    { year: '2021', intensity: 55, upper: 55, lower: 55 },
    { year: '2022', intensity: 47, upper: 47, lower: 47 },
    { year: '2023', intensity: 42, upper: 42, lower: 42 },
    { year: '2024', intensity: 35, upper: 35, lower: 35 },
    { year: '2025', intensity: 31, upper: 31, lower: 31 },
    { year: '2026', intensity: 27, upper: 30, lower: 24 },
    { year: '2027', intensity: 24, upper: 28, lower: 20 },
    { year: '2028', intensity: 21, upper: 26, lower: 16 },
    { year: '2029', intensity: 19, upper: 24, lower: 14 },
    { year: '2030', intensity: 17, upper: 22, lower: 12 },
  ],
  aggressive: [
    { year: '2020', intensity: 60, upper: 60, lower: 60 },
    { year: '2021', intensity: 55, upper: 55, lower: 55 },
    { year: '2022', intensity: 47, upper: 47, lower: 47 },
    { year: '2023', intensity: 42, upper: 42, lower: 42 },
    { year: '2024', intensity: 35, upper: 35, lower: 35 },
    { year: '2025', intensity: 31, upper: 31, lower: 31 },
    { year: '2026', intensity: 25, upper: 28, lower: 22 },
    { year: '2027', intensity: 20, upper: 24, lower: 16 },
    { year: '2028', intensity: 16, upper: 20, lower: 12 },
    { year: '2029', intensity: 13, upper: 17, lower: 9 },
    { year: '2030', intensity: 10, upper: 14, lower: 6 },
  ],
};

const scenarios = [
  { name: 'Conservative', reduction: 65, confidence: 92, color: '#f59e0b' },
  { name: 'Moderate', reduction: 72, confidence: 85, color: '#8884d8' },
  { name: 'Aggressive', reduction: 83, confidence: 72, color: '#10b981' },
];

const chartConfig = {
  intensity: {
    label: "Carbon Intensity",
    theme: {
      light: "#159947",
      dark: "#159947",
    },
  },
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name: string;
    color: string;
    dataKey: string;
  }>;
  label?: string;
  showConfidence: boolean;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label, showConfidence }) => {
  if (active && payload && payload.length) {
    const isProjectedYear = parseInt(label || '0') > 2025;
    const mainValue = payload.find(p => p.dataKey === 'intensity');
    const upperValue = payload.find(p => p.dataKey === 'upper');
    const lowerValue = payload.find(p => p.dataKey === 'lower');
    
    return (
      <div className="bg-background/95 backdrop-blur-sm p-4 border border-border rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium">{label}</span>
          {isProjectedYear && (
            <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800">
              Projected
            </Badge>
          )}
        </div>
        {mainValue && (
          <div className="flex justify-between items-center text-sm gap-4">
            <span className="text-muted-foreground">Intensity:</span>
            <span className="font-medium">{mainValue.value} tCO₂e/M$</span>
          </div>
        )}
        {showConfidence && isProjectedYear && upperValue && lowerValue && (
          <div className="flex justify-between items-center text-sm gap-4 mt-1 text-muted-foreground">
            <span>Confidence range:</span>
            <span>{lowerValue.value} - {upperValue.value}</span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const AnalyticsAdvanced = () => {
  const [showOptions, setShowOptions] = useState(false);
  const [activeScenario, setActiveScenario] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [showConfidence, setShowConfidence] = useState(true);
  const [showHistorical, setShowHistorical] = useState(true);
  const [showTarget, setShowTarget] = useState(true);

  const currentData = scenarioData[activeScenario];
  const scenarioColors = {
    conservative: '#f59e0b',
    moderate: '#8884d8',
    aggressive: '#10b981'
  };
  const currentColor = scenarioColors[activeScenario];
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Two-column hybrid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Enhanced Chart (60%) */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden border-t-4 border-t-primary hover:shadow-lg transition-all h-full">
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle>Advanced Emissions Projection</CardTitle>
                    <CardDescription className="mt-1">
                      Projected emissions with scenario modeling through 2030
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    {showOptions && (
                      <>
                        <Button variant="outline" size="sm" className="h-9 gap-1">
                          <Calendar className="h-4 w-4" />
                          <span className="hidden sm:inline">Time Range</span>
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 gap-1">
                          <Filter className="h-4 w-4" />
                          <span className="hidden sm:inline">Filters</span>
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 gap-1">
                          <Download className="h-4 w-4" />
                          <span className="hidden sm:inline">Export</span>
                        </Button>
                      </>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-9"
                      onClick={() => setShowOptions(!showOptions)}
                    >
                      {showOptions ? (
                        <><ChevronUp className="h-4 w-4 mr-1" /> Less</>
                      ) : (
                        <><ChevronDown className="h-4 w-4 mr-1" /> More</>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Scenario Toggle & Chart Controls */}
                <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-border">
                  {/* Scenario Buttons */}
                  <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                    {(['conservative', 'moderate', 'aggressive'] as const).map((scenario) => (
                      <Button
                        key={scenario}
                        variant={activeScenario === scenario ? "default" : "ghost"}
                        size="sm"
                        className="h-8 capitalize"
                        onClick={() => setActiveScenario(scenario)}
                      >
                        {scenario}
                      </Button>
                    ))}
                  </div>

                  {/* Toggle Controls */}
                  <div className="flex items-center gap-4 ml-auto">
                    <div className="flex items-center gap-2">
                      <Switch 
                        id="confidence" 
                        checked={showConfidence} 
                        onCheckedChange={setShowConfidence}
                      />
                      <Label htmlFor="confidence" className="text-xs cursor-pointer">
                        Confidence Bands
                      </Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        id="target" 
                        checked={showTarget} 
                        onCheckedChange={setShowTarget}
                      />
                      <Label htmlFor="target" className="text-xs cursor-pointer">
                        Target Line
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[420px]">
              <ChartContainer className="h-full" config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="colorIntensityFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#159947" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#159947" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorConfidenceFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={currentColor} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={currentColor} stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                    <XAxis 
                      dataKey="year" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <YAxis 
                      unit=" tCO₂e/M$" 
                      domain={[0, 70]}
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip showConfidence={showConfidence} />} />
                    <Legend 
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      onClick={(e) => {
                        if (e.dataKey === 'intensity') setShowHistorical(!showHistorical);
                      }}
                      wrapperStyle={{ cursor: 'pointer' }}
                    />
                    
                    {/* Confidence Band */}
                    {showConfidence && (
                      <>
                        <Area
                          type="monotone"
                          dataKey="upper"
                          stroke="none"
                          fill="url(#colorConfidenceFill)"
                          name="Upper Bound"
                          legendType="none"
                        />
                        <Area
                          type="monotone"
                          dataKey="lower"
                          stroke="none"
                          fill="hsl(var(--background))"
                          name="Lower Bound"
                          legendType="none"
                        />
                      </>
                    )}
                    
                    {/* Historical Data */}
                    {showHistorical && (
                      <Area 
                        type="monotone" 
                        dataKey="intensity" 
                        stroke="#159947"
                        strokeWidth={2}
                        fill="url(#colorIntensityFill)"
                        name="Historical & Projected" 
                        activeDot={{ r: 6, strokeWidth: 2, stroke: '#159947', fill: 'white' }}
                        dot={(props) => {
                          const year = parseInt(currentData[props.index]?.year);
                          if (year && year <= 2025) {
                            return (
                              <circle 
                                cx={props.cx} 
                                cy={props.cy} 
                                r={4} 
                                stroke="#159947" 
                                strokeWidth={2} 
                                fill="white" 
                              />
                            );
                          }
                          return null;
                        }}
                      />
                    )}
                    
                    {/* Projection Line */}
                    <Line 
                      type="monotone" 
                      dataKey="intensity" 
                      stroke={currentColor}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Scenario Projection"
                      dot={(props) => {
                        const year = parseInt(currentData[props.index]?.year);
                        if (year && year > 2025) {
                          return (
                            <circle 
                              cx={props.cx} 
                              cy={props.cy} 
                              r={4} 
                              stroke={currentColor}
                              strokeWidth={2} 
                              fill="white" 
                            />
                          );
                        }
                        return null;
                      }}
                      activeDot={{ r: 6, strokeWidth: 2, stroke: currentColor, fill: 'white' }}
                    />
                    
                    {/* Target Reference Line */}
                    {showTarget && (
                      <ReferenceLine 
                        y={20} 
                        label={{ 
                          value: "2030 Target", 
                          position: "left", 
                          fill: "hsl(var(--destructive))",
                          fontSize: 12
                        }} 
                        stroke="hsl(var(--destructive))" 
                        strokeDasharray="3 3"
                        strokeWidth={2}
                      />
                    )}
                    
                    {/* Current Period Marker */}
                    <ReferenceLine
                      x="2025"
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="3 3"
                      label={{
                        value: "Current",
                        position: "top",
                        fill: "hsl(var(--muted-foreground))",
                        fontSize: 10
                      }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right: Insights Panel (40%) */}
        <div className="lg:col-span-2">
          <ForecastInsightsPanel 
            activeScenario={activeScenario.charAt(0).toUpperCase() + activeScenario.slice(1)}
            scenarios={scenarios}
          />
        </div>
      </div>
      
      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-blue-800 dark:text-blue-400">Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="text-sm flex items-start">
                <span className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span>Emissions decreased by 18% compared to last year, outperforming the industry average of 12%</span>
              </li>
              <li className="text-sm flex items-start">
                <span className="bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span>June-August emissions were below target for the first time in company history</span>
              </li>
              <li className="text-sm flex items-start">
                <span className="bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </span>
                <span>Electricity remains the largest emission source, but has declined 15% through efficiency initiatives</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-green-800 dark:text-green-400">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="text-sm flex items-start group hover:bg-green-50 dark:hover:bg-green-950/30 p-2 -ml-2 rounded-lg transition-colors">
                <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0 group-hover:bg-blue-200 dark:group-hover:bg-blue-900">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <span>Implement additional energy efficiency measures in offices to reduce the 45% of emissions from electricity</span>
              </li>
              <li className="text-sm flex items-start group hover:bg-green-50 dark:hover:bg-green-950/30 p-2 -ml-2 rounded-lg transition-colors">
                <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0 group-hover:bg-blue-200 dark:group-hover:bg-blue-900">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <span>Accelerate renewable energy transition with additional PPAs to reach 75% renewable energy by 2026</span>
              </li>
              <li className="text-sm flex items-start group hover:bg-green-50 dark:hover:bg-green-950/30 p-2 -ml-2 rounded-lg transition-colors">
                <span className="bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0 group-hover:bg-blue-200 dark:group-hover:bg-blue-900">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <span>Implement the EV fleet transition plan ahead of schedule to capture early transportation emissions reductions</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-all border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-purple-800 dark:text-purple-400">Projections</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="text-sm flex items-start">
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </span>
                <span>Current trajectory puts us on track for 42% reduction by 2030, exceeding the 40% target</span>
              </li>
              <li className="text-sm flex items-start">
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </span>
                <span>Carbon neutrality possible by 2038, two years ahead of the 2040 commitment</span>
              </li>
              <li className="text-sm flex items-start">
                <span className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                <span>Need to accelerate reductions in transportation and material sourcing in Q3 and Q4</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsAdvanced;
