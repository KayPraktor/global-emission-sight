
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
import { ChevronDown, ChevronUp, Calendar, Download, Filter } from 'lucide-react';

// Sample data from the original component
const intensityData = [
  { year: '2020', intensity: 60 },
  { year: '2021', intensity: 55 },
  { year: '2022', intensity: 47 },
  { year: '2023', intensity: 42 },
  { year: '2024', intensity: 35 },
  { year: '2025', intensity: 31 },
];

const projectionData = [
  ...intensityData,
  { year: '2026', intensity: 27 }, 
  { year: '2027', intensity: 24 },
  { year: '2028', intensity: 21 },
  { year: '2029', intensity: 19 },
  { year: '2030', intensity: 17 },
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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const isProjectedYear = parseInt(label) > 2025;
    
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium">{label}</span>
          {isProjectedYear && (
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-800 border-blue-200">
              Projected
            </Badge>
          )}
        </div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex justify-between items-center text-sm gap-4">
            <span style={{ color: entry.color }}>{entry.name}: </span>
            <span className="font-medium">{entry.value} tCO₂e/M$</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsAdvanced = () => {
  const [showOptions, setShowOptions] = useState(false);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="mb-6 overflow-hidden border-t-4 border-t-blue-500 hover:shadow-lg transition-all">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Advanced Emissions Projection</CardTitle>
              <CardDescription className="mt-1">
                Projected emissions with current reduction strategies through 2030
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
        </CardHeader>
        <CardContent className="h-[400px]">
          <ChartContainer className="h-full" config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={projectionData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorIntensityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#159947" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#159947" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorIntensityFillFuture" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="year" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <YAxis 
                  unit=" tCO₂e/M$" 
                  domain={[0, 70]}
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <Tooltip content={CustomTooltip} />
                <Legend 
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  iconSize={8}
                />
                <Area 
                  type="monotone" 
                  dataKey="intensity" 
                  stroke="#159947"
                  strokeWidth={2}
                  fill="url(#colorIntensityFill)"
                  name="Historical & Current Data" 
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#159947', fill: 'white' }}
                  dot={(props) => {
                    // Only show dots for past years (until 2025)
                    const year = parseInt(projectionData[props.index]?.year);
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
                <Line 
                  type="monotone" 
                  dataKey="intensity" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Projection"
                  dot={(props) => {
                    // Only show dots for future years (2026+)
                    const year = parseInt(projectionData[props.index]?.year);
                    if (year && year > 2025) {
                      return (
                        <circle 
                          cx={props.cx} 
                          cy={props.cy} 
                          r={4} 
                          stroke="#8884d8" 
                          strokeWidth={2} 
                          fill="white" 
                        />
                      );
                    }
                    return null;
                  }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#8884d8', fill: 'white' }}
                />
                <ReferenceLine 
                  y={20} 
                  label={{ 
                    value: "2030 Target", 
                    position: "left", 
                    fill: "#ff7300",
                    fontSize: 12
                  }} 
                  stroke="#ff7300" 
                  strokeDasharray="3 3"
                  strokeWidth={2}
                />
                
                {/* Highlight 2020-2025 as "current" period */}
                <ReferenceLine
                  x="2025"
                  stroke="#666"
                  strokeDasharray="3 3"
                  label={{
                    value: "Current",
                    position: "top",
                    fill: "#666",
                    fontSize: 10
                  }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-all border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-blue-800">Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="text-sm flex items-start">
                <span className="bg-green-100 text-green-700 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span>Emissions decreased by 18% compared to last year, outperforming the industry average of 12%</span>
              </li>
              <li className="text-sm flex items-start">
                <span className="bg-green-100 text-green-700 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span>June-August emissions were below target for the first time in company history</span>
              </li>
              <li className="text-sm flex items-start">
                <span className="bg-amber-100 text-amber-700 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0">
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
            <CardTitle className="text-base text-green-800">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="text-sm flex items-start group hover:bg-green-50 p-2 -ml-2 rounded-lg transition-colors">
                <span className="bg-blue-100 text-blue-700 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0 group-hover:bg-blue-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <span>Implement additional energy efficiency measures in offices to reduce the 45% of emissions from electricity</span>
              </li>
              <li className="text-sm flex items-start group hover:bg-green-50 p-2 -ml-2 rounded-lg transition-colors">
                <span className="bg-blue-100 text-blue-700 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0 group-hover:bg-blue-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <span>Accelerate renewable energy transition with additional PPAs to reach 75% renewable energy by 2026</span>
              </li>
              <li className="text-sm flex items-start group hover:bg-green-50 p-2 -ml-2 rounded-lg transition-colors">
                <span className="bg-blue-100 text-blue-700 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0 group-hover:bg-blue-200">
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
            <CardTitle className="text-base text-purple-800">Projections</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="text-sm flex items-start">
                <span className="bg-gray-100 text-gray-700 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </span>
                <span>Current trajectory puts us on track for 42% reduction by 2030, exceeding the 40% target</span>
              </li>
              <li className="text-sm flex items-start">
                <span className="bg-gray-100 text-gray-700 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </span>
                <span>Carbon neutrality possible by 2038, two years ahead of the 2040 commitment</span>
              </li>
              <li className="text-sm flex items-start">
                <span className="bg-gray-100 text-gray-700 rounded-full p-1 mr-2 mt-0.5 flex-shrink-0">
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
