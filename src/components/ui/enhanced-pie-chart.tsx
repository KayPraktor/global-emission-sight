
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LabelList } from 'recharts';

interface EnhancedPieChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  centerContent?: React.ReactNode;
  className?: string;
}

const EnhancedPieChart: React.FC<EnhancedPieChartProps> = ({ 
  data, 
  centerContent,
  className = '' 
}) => {
  const COLORS = [
    'hsl(var(--ocean-500))',
    'hsl(var(--carbon-500))',
    'hsl(var(--primary))',
    'hsl(var(--accent))',
    'hsl(var(--muted-foreground))'
  ];
  
  // Calculate total for percentages
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  
  // Add percentage to data
  const dataWithPercentages = data.map((entry, index) => ({
    ...entry,
    percentage: ((entry.value / total) * 100).toFixed(1),
    color: entry.color || COLORS[index % COLORS.length]
  }));

  // Custom label renderer for percentages
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show labels for very small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-sm font-semibold"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataWithPercentages}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={120}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
            stroke="none"
          >
            {dataWithPercentages.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center content */}
      {centerContent && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            {centerContent}
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {dataWithPercentages.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground font-medium">
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedPieChart;
