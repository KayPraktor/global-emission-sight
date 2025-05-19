
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Download, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useAnalyticsFilters } from '@/contexts/AnalyticsFilterContext';

// Mock data for cost savings across departments
const costSavingsData = [
  { department: 'Operations', currentCost: 240000, projectedCost: 192000, savings: 48000 },
  { department: 'IT', currentCost: 180000, projectedCost: 162000, savings: 18000 },
  { department: 'Finance', currentCost: 120000, projectedCost: 108000, savings: 12000 },
  { department: 'HR', currentCost: 90000, projectedCost: 85500, savings: 4500 },
  { department: 'Marketing', currentCost: 150000, projectedCost: 127500, savings: 22500 },
];

// Chart configuration for the cost savings chart
const chartConfig = {
  currentCost: {
    label: "Current Cost",
    color: "#94a3b8"
  },
  projectedCost: {
    label: "Projected Cost",
    color: "#3b82f6"
  },
  savings: {
    label: "Potential Savings",
    color: "#10b981"
  }
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-md shadow-lg">
        <p className="font-medium text-gray-700 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm flex justify-between gap-4">
            <span>{entry.name}:</span>
            <span className="font-medium">${entry.value.toLocaleString()}</span>
          </p>
        ))}
        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
          Click bar for implementation details
        </div>
      </div>
    );
  }
  return null;
};

const CostSavingOpportunities: React.FC = () => {
  const { filters } = useAnalyticsFilters();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Filter data based on selected department (if any)
  const filteredData = filters.department !== 'all' 
    ? costSavingsData.filter(item => item.department.toLowerCase().includes(filters.department.substring(3))) 
    : costSavingsData;

  // Calculate total potential savings
  const totalSavings = filteredData.reduce((acc, curr) => acc + curr.savings, 0);

  // Calculate percentage savings for each department
  const dataWithPercentage = filteredData.map(item => ({
    ...item,
    savingsPercentage: ((item.savings / item.currentCost) * 100).toFixed(1)
  }));
  
  // Custom click handler for bar chart
  const handleBarClick = (data) => {
    setExpandedSection(expandedSection === data.department ? null : data.department);
  };
  
  return (
    <Card className="mb-6 overflow-hidden hover:shadow-lg transition-all border-t-4 border-t-green-500">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Cost-Saving Opportunities</CardTitle>
            <CardDescription>AI-identified financial efficiency improvements</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 transition-all duration-300 ${isExpanded ? 'h-[550px]' : 'h-[350px]'}`}>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={dataWithPercentage}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  onClick={(data) => data && data.activePayload && handleBarClick(data.activePayload[0].payload)}
                  className={`cursor-pointer [&_.recharts-rectangle:hover]:opacity-80 [&_.recharts-rectangle]:transition-opacity [&_.recharts-cartesian-grid-horizontal_line]:stroke-muted [&_.recharts-cartesian-grid-vertical_line]:stroke-muted`}
                >
                  <defs>
                    <linearGradient id="colorCurrentCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="colorProjectedCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    </linearGradient>
                    <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.2}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="department" 
                    angle={-45} 
                    textAnchor="end" 
                    height={70} 
                    tick={{ fontSize: 12 }}
                    axisLine={false} 
                    tickLine={false}
                  />
                  <YAxis 
                    tickFormatter={(value) => `$${value/1000}k`}
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar 
                    dataKey="currentCost" 
                    name="Current Cost" 
                    fill="url(#colorCurrentCost)"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                    animationDuration={1500}
                  >
                    {dataWithPercentage.map((entry, index) => (
                      <Cell 
                        key={`cell-current-${index}`} 
                        cursor="pointer" 
                        strokeWidth={expandedSection === entry.department ? 2 : 0}
                        stroke={expandedSection === entry.department ? "#000" : "none"}
                      />
                    ))}
                  </Bar>
                  <Bar 
                    dataKey="projectedCost" 
                    name="Projected Cost" 
                    fill="url(#colorProjectedCost)"
                    barSize={30}
                    animationDuration={1500}
                    animationBegin={300}
                  >
                    {dataWithPercentage.map((entry, index) => (
                      <Cell 
                        key={`cell-projected-${index}`} 
                        cursor="pointer"
                        strokeWidth={expandedSection === entry.department ? 2 : 0}
                        stroke={expandedSection === entry.department ? "#000" : "none"}
                      />
                    ))}
                  </Bar>
                  <Bar 
                    dataKey="savings" 
                    name="Potential Savings" 
                    fill="url(#colorSavings)"
                    radius={[0, 0, 4, 4]}
                    barSize={30}
                    animationDuration={1500}
                    animationBegin={600}
                  >
                    {dataWithPercentage.map((entry, index) => (
                      <Cell 
                        key={`cell-savings-${index}`} 
                        cursor="pointer"
                        strokeWidth={expandedSection === entry.department ? 2 : 0}
                        stroke={expandedSection === entry.department ? "#000" : "none"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            {expandedSection && (
              <div className="mt-4 bg-green-50 p-4 rounded-lg border border-green-100 animate-fade-in">
                <h3 className="font-medium text-green-800">
                  {expandedSection} Implementation Details
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {expandedSection === 'Operations' && 'Process automation and energy efficiency improvements could save up to 20% of operational costs.'}
                  {expandedSection === 'IT' && 'Cloud infrastructure consolidation and software license optimization could reduce IT costs by 10%.'}
                  {expandedSection === 'Finance' && 'Automated reporting and AI-powered financial analysis tools could save 10% in process costs.'}
                  {expandedSection === 'HR' && 'Digital onboarding and training systems could reduce administrative costs by 5%.'}
                  {expandedSection === 'Marketing' && 'Data-driven campaign optimization and content reuse could improve ROI by 15%.'}
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-100 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Total Potential Savings</div>
              <div className="text-2xl font-bold text-green-700">
                ${totalSavings.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Implementing AI recommendations could reduce operational costs while maintaining or improving productivity.
              </div>
            </div>
            
            <div className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
              <h4 className="font-medium mb-2 text-gray-800">Implementation Strategy</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start group hover:bg-blue-50 p-2 -mx-2 rounded-md transition-colors">
                  <span className="bg-blue-100 text-blue-800 font-medium rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 group-hover:bg-blue-200 transition-colors">1</span>
                  <span>Implement process automation in Operations</span>
                </li>
                <li className="flex items-start group hover:bg-blue-50 p-2 -mx-2 rounded-md transition-colors">
                  <span className="bg-blue-100 text-blue-800 font-medium rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 group-hover:bg-blue-200 transition-colors">2</span>
                  <span>Optimize energy usage in all facilities</span>
                </li>
                <li className="flex items-start group hover:bg-blue-50 p-2 -mx-2 rounded-md transition-colors">
                  <span className="bg-blue-100 text-blue-800 font-medium rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 group-hover:bg-blue-200 transition-colors">3</span>
                  <span>Restructure resource allocation in Marketing</span>
                </li>
                <li className="flex items-start group hover:bg-blue-50 p-2 -mx-2 rounded-md transition-colors">
                  <span className="bg-blue-100 text-blue-800 font-medium rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5 group-hover:bg-blue-200 transition-colors">4</span>
                  <span>Consolidate IT infrastructure and services</span>
                </li>
              </ul>
            </div>
            
            <Button variant="outline" className="w-full mt-4 justify-between" onClick={() => setIsExpanded(!isExpanded)}>
              <span>{isExpanded ? 'Show Less Details' : 'Show More Details'}</span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            <Button className="w-full mt-2 justify-between bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
              <span>Generate Full Cost-Savings Report</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostSavingOpportunities;
