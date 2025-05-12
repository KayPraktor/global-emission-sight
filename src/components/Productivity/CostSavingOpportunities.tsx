
import React from 'react';
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
  Legend
} from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
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

const CostSavingOpportunities: React.FC = () => {
  const { filters } = useAnalyticsFilters();
  
  // Filter data based on selected department (if any)
  const filteredData = filters.department !== 'all' 
    ? costSavingsData.filter(item => item.department.toLowerCase().includes(filters.department.substring(3))) 
    : costSavingsData;

  // Calculate total potential savings
  const totalSavings = filteredData.reduce((acc, curr) => acc + curr.savings, 0);
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Cost-Saving Opportunities</CardTitle>
            <CardDescription>AI-identified financial efficiency improvements</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="h-[350px] w-full">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={filteredData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="department" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => `$${value/1000}k`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value.toLocaleString()}`, ""]}
                      labelFormatter={(label) => `Department: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="currentCost" name="Current Cost" fill="#94a3b8" />
                    <Bar dataKey="projectedCost" name="Projected Cost" fill="#3b82f6" />
                    <Bar dataKey="savings" name="Potential Savings" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Total Potential Savings</div>
              <div className="text-2xl font-bold text-green-700">
                ${totalSavings.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Implementing AI recommendations could reduce operational costs while maintaining or improving productivity.
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Implementation Strategy</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 font-medium rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">1</span>
                  <span>Implement process automation in Operations</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 font-medium rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">2</span>
                  <span>Optimize energy usage in all facilities</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 font-medium rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">3</span>
                  <span>Restructure resource allocation in Marketing</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 font-medium rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">4</span>
                  <span>Consolidate IT infrastructure and services</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostSavingOpportunities;
