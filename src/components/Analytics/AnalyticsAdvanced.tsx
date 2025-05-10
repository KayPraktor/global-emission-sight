
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { ComposedChart, CartesianGrid, XAxis, YAxis, Legend, Area, Line, ReferenceLine } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

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

const AnalyticsAdvanced = () => {
  return (
    <div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Advanced Emissions Projection</CardTitle>
          <CardDescription>Projected emissions with current reduction strategies</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ChartContainer className="h-full" config={chartConfig}>
            <ComposedChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" />
              <YAxis unit=" tCO₂e/M$" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="intensity" 
                stroke="#159947"
                fill="#159947"
                fillOpacity={0.3}
                name="Historical Data" 
                activeDot={{ r: 8 }}
                dot={{ r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="intensity" 
                stroke="#8884d8" 
                strokeDasharray="5 5"
                strokeWidth={2}
                name="Projection"
              />
              <ReferenceLine y={20} label="2030 Target" stroke="#ff7300" strokeDasharray="3 3" />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="text-sm flex items-start">
                <span className="bg-green-100 text-green-700 rounded-full p-1 mr-2 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span>Emissions decreased by 18% compared to last year, outperforming the industry average of 12%</span>
              </li>
              <li className="text-sm flex items-start">
                <span className="bg-green-100 text-green-700 rounded-full p-1 mr-2 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span>June-August emissions were below target for the first time in company history</span>
              </li>
              <li className="text-sm flex items-start">
                <span className="bg-amber-100 text-amber-700 rounded-full p-1 mr-2 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </span>
                <span>Electricity remains the largest emission source, but has declined 15% through efficiency initiatives</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="text-sm flex items-start">
                <span className="bg-ocean-100 text-ocean-700 rounded-full p-1 mr-2 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <span>Implement additional energy efficiency measures in offices to reduce the 45% of emissions from electricity</span>
              </li>
              <li className="text-sm flex items-start">
                <span className="bg-ocean-100 text-ocean-700 rounded-full p-1 mr-2 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <span>Accelerate renewable energy transition with additional PPAs to reach 75% renewable energy by 2026</span>
              </li>
              <li className="text-sm flex items-start">
                <span className="bg-ocean-100 text-ocean-700 rounded-full p-1 mr-2 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
                <span>Implement the EV fleet transition plan ahead of schedule to capture early transportation emissions reductions</span>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Projections</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="text-sm flex items-start">
                <span className="bg-gray-100 text-gray-700 rounded-full p-1 mr-2 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </span>
                <span>Current trajectory puts us on track for 42% reduction by 2030, exceeding the 40% target</span>
              </li>
              <li className="text-sm flex items-start">
                <span className="bg-gray-100 text-gray-700 rounded-full p-1 mr-2 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </span>
                <span>Carbon neutrality possible by 2038, two years ahead of the 2040 commitment</span>
              </li>
              <li className="text-sm flex items-start">
                <span className="bg-gray-100 text-gray-700 rounded-full p-1 mr-2 mt-0.5">
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
