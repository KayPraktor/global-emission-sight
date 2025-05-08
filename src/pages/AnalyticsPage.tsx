
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  BarChart,
  LineChart,
  PieChart,
  RadarChart,
  ComposedChart,
  ScatterChart,
  AreaChart,
  Bar,
  Line,
  Pie,
  Radar,
  RadarAxis,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Scatter,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Brush
} from 'recharts';
import {
  ChartPie,
  BarChart3,
  LineChart as LineChartIcon,
  Calendar as CalendarIcon,
  ArrowDown,
  ArrowUp,
  Download,
  FileChartColumn,
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

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

// Enhanced data for radar chart
const radarData = [
  { subject: 'Energy', A: 120, B: 110, fullMark: 150 },
  { subject: 'Transport', A: 98, B: 130, fullMark: 150 },
  { subject: 'Waste', A: 86, B: 130, fullMark: 150 },
  { subject: 'Water', A: 99, B: 100, fullMark: 150 },
  { subject: 'Materials', A: 85, B: 90, fullMark: 150 },
  { subject: 'Food', A: 65, B: 85, fullMark: 150 },
];

// Data for stacked area chart
const stackedData = [
  { year: '2020', scope1: 40, scope2: 50, scope3: 65 },
  { year: '2021', scope1: 38, scope2: 45, scope3: 62 },
  { year: '2022', scope1: 35, scope2: 41, scope3: 58 },
  { year: '2023', scope1: 30, scope2: 38, scope3: 52 },
  { year: '2024', scope1: 25, scope2: 32, scope3: 46 },
  { year: '2025', scope1: 20, scope2: 28, scope3: 42 }
];

// Efficiency data for scatter plot
const efficiencyData = [
  { x: 45, y: 100, z: 200, name: 'Office A' },
  { x: 75, y: 120, z: 300, name: 'Office B' },
  { x: 68, y: 105, z: 400, name: 'Factory A' },
  { x: 120, y: 40, z: 200, name: 'Factory B' },
  { x: 95, y: 72, z: 250, name: 'Warehouse A' },
  { x: 110, y: 55, z: 350, name: 'Warehouse B' },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<string>("yearly");

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Emissions Analytics</h1>
            <p className="text-gray-500">In-depth analysis of your emissions data and trends</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="bg-white p-2 rounded-md shadow-sm flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium">Jan 2025 - Dec 2025</span>
            </div>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
        
        {/* Top metrics cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardDescription>Total Emissions</CardDescription>
              <CardTitle className="text-3xl font-bold">1,250 tCO₂e</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600 font-medium">
                <ArrowDown className="h-4 w-4 mr-1" />
                <span>15% reduction from last year</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardDescription>Carbon Intensity</CardDescription>
              <CardTitle className="text-3xl font-bold">31 tCO₂e/M$</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-green-600 font-medium">
                <ArrowDown className="h-4 w-4 mr-1" />
                <span>11% reduction from last year</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardDescription>Top Emission Source</CardDescription>
              <CardTitle className="text-3xl font-bold">Electricity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                <span>45% of total emissions</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="pb-2">
              <CardDescription>Progress to Target</CardDescription>
              <CardTitle className="text-3xl font-bold">72%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-amber-600 font-medium">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>8% improvement this quarter</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="overview" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Emission Trends</TabsTrigger>
            <TabsTrigger value="sources">Emission Sources</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
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
          </TabsContent>
          
          <TabsContent value="trends">
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
                      <ChartTooltip content={<ChartTooltipContent />} />
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
                      <ChartTooltip 
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
          </TabsContent>
          
          <TabsContent value="sources">
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
          </TabsContent>
          
          <TabsContent value="advanced">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Advanced Emissions Projection</CardTitle>
                <CardDescription>Projected emissions with current reduction strategies</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ChartContainer className="h-full" config={chartConfig}>
                  <ComposedChart data={[...intensityData, 
                    {year: '2026', intensity: 27}, 
                    {year: '2027', intensity: 24},
                    {year: '2028', intensity: 21},
                    {year: '2029', intensity: 19},
                    {year: '2030', intensity: 17},
                  ]}>
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
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t border-gray-200 py-4 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">© 2025 BARYON. All rights reserved.</p>
          <div className="flex space-x-4 mt-2 md:mt-0">
            <a href="#" className="text-sm text-gray-500 hover:text-carbon">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-carbon">Terms of Service</a>
            <a href="#" className="text-sm text-gray-500 hover:text-carbon">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AnalyticsPage;
