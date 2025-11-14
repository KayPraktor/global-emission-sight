import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface QualityTrendsChartProps {
  data: Array<{
    date: string;
    overall: number;
    completeness?: number;
    accuracy?: number;
    freshness?: number;
    consistency?: number;
  }>;
  showBreakdown?: boolean;
}

export const QualityTrendsChart: React.FC<QualityTrendsChartProps> = ({
  data,
  showBreakdown = false,
}) => {
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quality Trends</CardTitle>
        <CardDescription>
          Data quality metrics over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="overall"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="Overall Score"
              dot={{ r: 4 }}
            />
            {showBreakdown && (
              <>
                <Line
                  type="monotone"
                  dataKey="completeness"
                  stroke="#10b981"
                  strokeWidth={1.5}
                  name="Completeness"
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#3b82f6"
                  strokeWidth={1.5}
                  name="Accuracy"
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="freshness"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  name="Freshness"
                  strokeDasharray="5 5"
                />
                <Line
                  type="monotone"
                  dataKey="consistency"
                  stroke="#8b5cf6"
                  strokeWidth={1.5}
                  name="Consistency"
                  strokeDasharray="5 5"
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
