
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PredictiveDataPoint {
  period: string;
  actual?: number;
  predicted: number;
  upperBound: number;
  lowerBound: number;
  target?: number;
}

interface PredictiveChartProps {
  data: PredictiveDataPoint[];
  title: string;
  unit: string;
}

const PredictiveChart: React.FC<PredictiveChartProps> = ({ data, title, unit }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${value?.toFixed(1)} ${unit}`,
                name
              ]}
            />
            <Legend />
            
            {/* Confidence interval */}
            <Area
              type="monotone"
              dataKey="upperBound"
              stackId="1"
              stroke="none"
              fill="#e5e7eb"
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="lowerBound"
              stackId="1"
              stroke="none"
              fill="#ffffff"
              fillOpacity={1}
            />
            
            {/* Actual values */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="#059669"
              strokeWidth={2}
              dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
              name="Actual"
            />
            
            {/* Predicted values */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#2563eb"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
              name="Predicted"
            />
            
            {/* Target line */}
            <Line
              type="monotone"
              dataKey="target"
              stroke="#dc2626"
              strokeWidth={2}
              dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
              name="Target"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PredictiveChart;
