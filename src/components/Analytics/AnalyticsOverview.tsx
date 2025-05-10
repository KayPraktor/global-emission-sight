
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart3, ChartPie, LineChartIcon } from 'lucide-react';
import { BarChart, LineChart, PieChart, CartesianGrid, XAxis, YAxis, Legend, Bar, Line, Pie, Cell, ReferenceLine, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

// Sample data from the original component
const data = [
  { month: 'Jan', emissions: 400, target: 300 },
  { month: 'Feb', emissions: 380, target: 300 },
  { month: 'Mar', emissions: 410, target: 300 },
  { month: 'Apr', emissions: 370, target: 300 },
  { month: 'May', emissions: 320, target: 300 },
  { month: 'Jun', emissions: 280, target: 300 },
  { month: 'Jul', emissions: 250, target: 300 },
  { month: 'Aug', emissions: 240, target: 300 },
  { month: 'Sep', emissions: 260, target: 300 },
  { month: 'Oct', emissions: 290, target: 300 },
  { month: 'Nov', emissions: 310, target: 300 },
  { month: 'Dec', emissions: 295, target: 300 },
];

const sourceData = [
  { name: 'Electricity', value: 45 },
  { name: 'Natural Gas', value: 25 },
  { name: 'Transportation', value: 20 },
  { name: 'Waste', value: 10 },
];

const intensityData = [
  { year: '2020', intensity: 60 },
  { year: '2021', intensity: 55 },
  { year: '2022', intensity: 47 },
  { year: '2023', intensity: 42 },
  { year: '2024', intensity: 35 },
  { year: '2025', intensity: 31 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const chartConfig = {
  emissions: {
    label: "CO₂e Emissions",
    theme: {
      light: "#159947",
      dark: "#159947",
    },
  },
  target: {
    label: "Target",
    theme: {
      light: "#2c7da0",
      dark: "#2c7da0",
    },
  },
};

const AnalyticsOverview = () => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Emissions vs Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[350px]" config={chartConfig}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis unit=" tCO₂e" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="emissions" fill="#159947" name="Actual Emissions" />
                <Bar dataKey="target" fill="#2c7da0" name="Target Emissions" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ChartPie className="h-5 w-5 mr-2" />
              Emission Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[350px]" config={chartConfig}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={800}
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <LineChartIcon className="h-5 w-5 mr-2" />
            Emission Intensity Over Time
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ChartContainer className="h-full" config={chartConfig}>
            <LineChart data={intensityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" />
              <YAxis unit=" tCO₂e/M$" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <ReferenceLine y={50} label="Target" stroke="#ff7300" strokeDasharray="3 3" />
              <Line 
                type="monotone" 
                dataKey="intensity" 
                stroke="#159947" 
                strokeWidth={2}
                activeDot={{ r: 8 }} 
                name="Emissions Intensity (tCO₂e/revenue)"
                animationDuration={1000}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsOverview;
