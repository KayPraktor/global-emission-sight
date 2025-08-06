import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList
} from 'recharts';
import { monthlySummary, categoryBreakdown } from '@/utils/dummyData';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import EnhancedPieChart from '@/components/ui/enhanced-pie-chart';

const EmissionsChart: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const COLORS = ['#159947', '#2c7da0', '#61a5c2', '#7e69ab', '#a389d9', '#c1b8e3'];
  
  // Calculate total emissions for the most recent month
  const latestMonth = monthlySummary[monthlySummary.length - 1];
  const totalEmissions = latestMonth.scope1 + latestMonth.scope2 + latestMonth.scope3;
  
  // Calculate trend compared to previous month
  const previousMonth = monthlySummary[monthlySummary.length - 2];
  const previousTotal = previousMonth.scope1 + previousMonth.scope2 + previousMonth.scope3;
  const percentageChange = ((totalEmissions - previousTotal) / previousTotal) * 100;
  const isDecreasing = percentageChange < 0;
  
  const CustomBarLabel = (props) => {
    const { x, y, width, height, value } = props;
    return (
      <text 
        x={x + width / 2} 
        y={y - 8} 
        fill="#666" 
        textAnchor="middle"
        fontSize={12}
      >
        {value}
      </text>
    );
  };
  
  const CustomPieLabel = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, category } = props;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill={COLORS[index % COLORS.length]} 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-md shadow-lg">
          <p className="font-medium text-gray-700">{`Month: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value} tCO₂e`}
            </p>
          ))}
          <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
            Click for more detailed analysis
          </div>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-6 mt-6 animate-fade-in">
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="text-2xl font-bold">Emissions Breakdown</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Latest monthly total: {totalEmissions.toFixed(1)} tCO₂e</span>
          <Badge className={isDecreasing ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
            {isDecreasing ? '▼' : '▲'} {Math.abs(percentageChange).toFixed(1)}%
          </Badge>
        </div>
      </div>
      
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-500 ${isExpanded ? 'max-h-[1500px]' : 'max-h-[450px] overflow-hidden'}`}>
        <Card className="col-span-1 lg:col-span-2 hover:shadow-lg transition-shadow border-t-4 border-t-primary">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Monthly Emissions by Scope</span>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">View details</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlySummary}
                margin={{ top: 30, right: 30, left: 20, bottom: 5 }}
                className="[&_.recharts-cartesian-grid-horizontal_line]:stroke-muted [&_.recharts-cartesian-grid-vertical_line]:stroke-muted"
              >
                <defs>
                  <linearGradient id="colorScope1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#159947" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#159947" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorScope2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2c7da0" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2c7da0" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="colorScope3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#61a5c2" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#61a5c2" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
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
                  wrapperStyle={{ paddingTop: 10 }}
                  iconType="circle"
                  iconSize={8}
                />
                <Bar 
                  dataKey="scope1" 
                  name="Scope 1" 
                  fill="url(#colorScope1)" 
                  stackId="a" 
                  barSize={36}
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
                <Bar 
                  dataKey="scope2" 
                  name="Scope 2" 
                  fill="url(#colorScope2)" 
                  stackId="a" 
                  barSize={36}
                  radius={[0, 0, 0, 0]}
                  animationDuration={1500}
                  animationBegin={300}
                />
                <Bar 
                  dataKey="scope3" 
                  name="Scope 3" 
                  fill="url(#colorScope3)" 
                  stackId="a" 
                  barSize={36}
                  radius={[0, 0, 4, 4]}
                  animationDuration={1500}
                  animationBegin={600}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 hover:shadow-lg transition-shadow border-t-4 border-t-primary">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between">
              <span>Emission Sources</span>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">View details</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] relative">
            <EnhancedPieChart
              data={categoryBreakdown}
              className="h-full"
              centerContent={
                <div className="text-center">
                  <div className="text-xs text-gray-500">Total</div>
                  <div className="text-sm font-bold text-gray-800">
                    {categoryBreakdown.reduce((sum, item) => sum + item.value, 0)} tCO₂e
                  </div>
                </div>
              }
            />
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-3 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle>Emission Trends Analysis</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <h3 className="text-lg font-medium text-green-800 mb-2">Key Insights</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 mr-2"></span>
                    <span>Scope 1 emissions decreased by 15% compared to previous quarter</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                    <span>Energy efficiency measures yielded 8.3% reduction in electricity usage</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></span>
                    <span>Transportation emissions increased slightly due to expanded operations</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                <h3 className="text-lg font-medium text-blue-800 mb-2">Recommendations</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                    <span>Implement renewable energy sourcing for manufacturing facilities</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                    <span>Optimize logistics routes to minimize transportation emissions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 mr-2"></span>
                    <span>Audit heating systems for efficiency improvements</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                <h3 className="text-lg font-medium text-purple-800 mb-2">Projections</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></span>
                    <span>On track to meet 2025 reduction targets if current trends continue</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></span>
                    <span>Projected 12% overall reduction by end of fiscal year</span>
                  </li>
                  <li className="flex items-start">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 mr-2"></span>
                    <span>Manufacturing emissions expected to decrease further with new equipment</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-center">
        <Button 
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          {isExpanded ? (
            <>Show Less <ChevronUp className="h-4 w-4" /></>
          ) : (
            <>Show More <ChevronDown className="h-4 w-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EmissionsChart;
