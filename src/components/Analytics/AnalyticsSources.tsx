
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  PieChart,
  RadarChart,
  Pie, 
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend, 
  Cell,
  ResponsiveContainer
} from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

// Sample data from the original component
const sourceData = [
  { name: 'Electricity', value: 45 },
  { name: 'Natural Gas', value: 25 },
  { name: 'Transportation', value: 20 },
  { name: 'Waste', value: 10 },
];

const radarData = [
  { subject: 'Energy', A: 120, B: 110, fullMark: 150 },
  { subject: 'Transport', A: 98, B: 130, fullMark: 150 },
  { subject: 'Waste', A: 86, B: 130, fullMark: 150 },
  { subject: 'Water', A: 99, B: 100, fullMark: 150 },
  { subject: 'Materials', A: 85, B: 90, fullMark: 150 },
  { subject: 'Food', A: 65, B: 85, fullMark: 150 },
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
};

const AnalyticsSources = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Emission Sources Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ChartContainer className="h-full" config={chartConfig}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Performance Radar</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ChartContainer className="h-full" config={chartConfig}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid stroke="#e5e5e5" />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 150]} />
              <Radar
                name="Current Year"
                dataKey="A"
                stroke="#159947"
                fill="#159947"
                fillOpacity={0.6}
              />
              <Radar
                name="Previous Year"
                dataKey="B"
                stroke="#2c7da0"
                fill="#2c7da0"
                fillOpacity={0.6}
              />
              <Legend />
              <ChartTooltip content={<ChartTooltipContent />} />
            </RadarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSources;
