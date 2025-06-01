import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BarChart3, ChartPie, LineChartIcon } from 'lucide-react';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Legend, 
  Bar, 
  Line, 
  Pie, 
  Cell, 
  ReferenceLine, 
  ResponsiveContainer, 
  Tooltip,
  Area 
} from 'recharts';
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

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-sm mb-1">{`${label}`}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex justify-between items-center text-xs">
            <span style={{ color: entry.color }}>{entry.name}: </span>
            <span className="font-medium">{entry.value} {entry.unit || 'tCO₂e'}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsOverview = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="overflow-hidden border-t-4 border-t-green-500 hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
              Emissions vs Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[350px]" config={chartConfig}>
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorEmissions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#159947" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#159947" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#666', fontSize: 12 }}
                />
                <YAxis 
                  unit=" tCO₂e" 
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
                <Bar 
                  dataKey="emissions" 
                  fill="url(#colorEmissions)" 
                  name="Actual Emissions" 
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                  animationDuration={1500}
                />
                <ReferenceLine y={300} stroke="#2c7da0" strokeWidth={2} strokeDasharray="3 3" label={{ value: 'Target', position: 'right', fill: '#2c7da0' }} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-t-4 border-t-blue-500 hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ChartPie className="h-5 w-5 mr-2 text-blue-500" />
              Emission Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer className="h-[350px]" config={chartConfig}>
              <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={1500}
                  paddingAngle={2}
                >
                  {sourceData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke="#fff" 
                      strokeWidth={2} 
                    />
                  ))}
                </Pie>
                <Tooltip content={CustomTooltip} formatter={(value) => [`${value}%`, 'Contribution']} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6 overflow-hidden border-t-4 border-t-purple-500 hover:shadow-lg transition-all">
        <CardHeader>
          <CardTitle className="flex items-center">
            <LineChartIcon className="h-5 w-5 mr-2 text-purple-500" />
            Emission Intensity Over Time
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[350px]">
          <ChartContainer className="h-full" config={chartConfig}>
            <LineChart data={intensityData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <defs>
                <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#159947" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#159947" stopOpacity={0.1}/>
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
              <ReferenceLine 
                y={50} 
                label={{ 
                  value: 'Target', 
                  position: 'left', 
                  fill: '#ff7300',
                  fontSize: 12
                }} 
                stroke="#ff7300" 
                strokeDasharray="3 3" 
              />
              <Area
                type="monotone"
                dataKey="intensity"
                stroke="#159947"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorIntensity)"
                name="Emissions Intensity"
                animationDuration={1500}
                dot={{ stroke: '#159947', strokeWidth: 2, r: 4, fill: '#fff' }}
                activeDot={{ r: 6, stroke: '#159947', strokeWidth: 2, fill: '#fff' }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsOverview;
