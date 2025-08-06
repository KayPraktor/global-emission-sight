
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

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
  const COLORS = ['#00D4FF', '#0099CC', '#006699', '#003366', '#001A33'];
  
  // Calculate total for percentages
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  
  // Add percentage to data
  const dataWithPercentages = data.map((entry, index) => ({
    ...entry,
    percentage: ((entry.value / total) * 100).toFixed(0),
    color: entry.color || COLORS[index % COLORS.length]
  }));

  return (
    <div className={`relative ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataWithPercentages}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={140}
            paddingAngle={2}
            dataKey="value"
            animationBegin={0}
            animationDuration={800}
          >
            {dataWithPercentages.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke="none"
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
          {centerContent || (
            <div className="w-8 h-8 bg-primary rounded-full"></div>
          )}
        </div>
      </div>
      
      {/* Floating percentage labels */}
      {dataWithPercentages.map((entry, index) => {
        const angle = (360 / dataWithPercentages.length) * index - 90;
        const radius = 160;
        const x = Math.cos((angle * Math.PI) / 180) * radius + 50;
        const y = Math.sin((angle * Math.PI) / 180) * radius + 50;
        
        return (
          <div
            key={`label-${index}`}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${x}%`,
              top: `${y}%`,
            }}
          >
            <div className="bg-white px-3 py-1 rounded-full shadow-md border-2 border-gray-100">
              <div className="text-sm font-bold text-gray-800">
                {entry.percentage}%
              </div>
            </div>
            {/* Connection line */}
            <div 
              className="absolute w-8 h-0.5 bg-gray-300"
              style={{
                top: '50%',
                left: x > 50 ? '-2rem' : '100%',
                transform: 'translateY(-50%)',
              }}
            />
            {/* Small dot */}
            <div 
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: entry.color,
                top: '50%',
                left: x > 50 ? '-2.5rem' : 'calc(100% + 0.5rem)',
                transform: 'translateY(-50%)',
              }}
            />
          </div>
        );
      })}
      
      {/* Legend */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-wrap justify-center gap-4 p-4">
        {dataWithPercentages.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600 font-medium">
              {entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedPieChart;
