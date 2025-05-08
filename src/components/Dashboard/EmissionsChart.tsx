
import React from 'react';
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
  Cell
} from 'recharts';
import { monthlySummary, categoryBreakdown } from '@/utils/dummyData';

const EmissionsChart: React.FC = () => {
  const COLORS = ['#159947', '#2c7da0', '#61a5c2', '#7e69ab', '#a389d9', '#c1b8e3'];
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle>Monthly Emissions by Scope</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlySummary}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" />
              <YAxis unit=" tCO₂e" />
              <Tooltip 
                formatter={(value) => [`${value} tCO₂e`, '']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend />
              <Bar dataKey="scope1" name="Scope 1" fill="#159947" stackId="a" />
              <Bar dataKey="scope2" name="Scope 2" fill="#2c7da0" stackId="a" />
              <Bar dataKey="scope3" name="Scope 3" fill="#61a5c2" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="col-span-1 lg:col-span-1">
        <CardHeader>
          <CardTitle>Emission Sources</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                label={({category, percentage}) => `${category}: ${percentage}%`}
              >
                {categoryBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value} tCO₂e`} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmissionsChart;
