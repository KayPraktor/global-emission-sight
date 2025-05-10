
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { 
  ComposedChart, 
  ScatterChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Legend, 
  Area, 
  Line, 
  Scatter,
  Brush,
  Tooltip,
  Cell
} from 'recharts';
import { ChartContainer, ChartTooltip as ChartTooltipComponent, ChartTooltipContent } from '@/components/ui/chart';

// Sample data from the original component
const stackedData = [
  { year: '2020', scope1: 40, scope2: 50, scope3: 65 },
  { year: '2021', scope1: 38, scope2: 45, scope3: 62 },
  { year: '2022', scope1: 35, scope2: 41, scope3: 58 },
  { year: '2023', scope1: 30, scope2: 38, scope3: 52 },
  { year: '2024', scope1: 25, scope2: 32, scope3: 46 },
  { year: '2025', scope1: 20, scope2: 28, scope3: 42 }
];

const efficiencyData = [
  { x: 45, y: 100, z: 200, name: 'Office A' },
  { x: 75, y: 120, z: 300, name: 'Office B' },
  { x: 68, y: 105, z: 400, name: 'Factory A' },
  { x: 120, y: 40, z: 200, name: 'Factory B' },
  { x: 95, y: 72, z: 250, name: 'Warehouse A' },
  { x: 110, y: 55, z: 350, name: 'Warehouse B' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const chartConfig = {
  scope1: {
    label: "Scope 1",
    theme: {
      light: "#159947",
      dark: "#159947",
    },
  },
  scope2: {
    label: "Scope 2",
    theme: {
      light: "#2c7da0",
      dark: "#2c7da0",
    },
  },
  scope3: {
    label: "Scope 3",
    theme: {
      light: "#61a5c2",
      dark: "#61a5c2",
    },
  },
};

const AnalyticsTrends = () => {
  const [viewMode, setViewMode] = React.useState<string>("yearly");

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Emissions Trend Analysis</CardTitle>
          <ToggleGroup type="single" defaultValue="yearly">
            <ToggleGroupItem value="monthly" onClick={() => setViewMode("monthly")}>Monthly</ToggleGroupItem>
            <ToggleGroupItem value="quarterly" onClick={() => setViewMode("quarterly")}>Quarterly</ToggleGroupItem>
            <ToggleGroupItem value="yearly" onClick={() => setViewMode("yearly")}>Yearly</ToggleGroupItem>
          </ToggleGroup>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ChartContainer className="h-full" config={chartConfig}>
            <ComposedChart data={stackedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" />
              <YAxis unit=" tCO₂e" />
              <ChartTooltipComponent content={<ChartTooltipContent />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="scope3" 
                stackId="1"
                fill="#61a5c2" 
                stroke="#61a5c2" 
                name="Scope 3" 
              />
              <Area 
                type="monotone" 
                dataKey="scope2" 
                stackId="1"
                fill="#2c7da0" 
                stroke="#2c7da0" 
                name="Scope 2" 
              />
              <Area 
                type="monotone" 
                dataKey="scope1" 
                stackId="1"
                fill="#159947" 
                stroke="#159947" 
                name="Scope 1" 
              />
              <Line 
                type="monotone" 
                dataKey="scope1" 
                stroke="#045226" 
                strokeWidth={2}
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }} 
                name="Scope 1 Trend" 
              />
              <Brush dataKey="year" height={30} stroke="#8884d8" />
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Facility Emissions Efficiency</CardTitle>
          <CardDescription>Energy usage vs. Emissions output by facility</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          <ChartContainer className="h-full" config={chartConfig}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" dataKey="x" name="Energy Usage (MWh)" unit=" MWh" />
              <YAxis type="number" dataKey="y" name="CO₂e" unit=" tCO₂e" />
              <ChartTooltipComponent 
                cursor={{ strokeDasharray: '3 3' }}
                content={<ChartTooltipContent />}
              />
              <Legend />
              <Scatter 
                name="Facilities" 
                data={efficiencyData} 
                fill="#8884d8" 
                shape="circle"
              >
                {efficiencyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Scatter>
            </ScatterChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTrends;
