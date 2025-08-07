
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))'
  ];

  const chartData = useMemo(() => {
    const total = data.reduce((sum, entry) => sum + entry.value, 0);
    let currentAngle = 0;
    
    return data.map((entry, index) => {
      const percentage = (entry.value / total) * 100;
      const angle = (entry.value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      
      currentAngle = endAngle;
      
      return {
        ...entry,
        percentage,
        angle,
        startAngle,
        endAngle,
        color: entry.color || COLORS[index % COLORS.length]
      };
    });
  }, [data]);

  const createArcPath = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
    const centerX = 120;
    const centerY = 120;
    
    const startAngleRad = ((startAngle - 90) * Math.PI) / 180;
    const endAngleRad = ((endAngle - 90) * Math.PI) / 180;
    
    const x1 = centerX + outerRadius * Math.cos(startAngleRad);
    const y1 = centerY + outerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(endAngleRad);
    const y2 = centerY + outerRadius * Math.sin(endAngleRad);
    
    const x3 = centerX + innerRadius * Math.cos(endAngleRad);
    const y3 = centerY + innerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(startAngleRad);
    const y4 = centerY + innerRadius * Math.sin(startAngleRad);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    
    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Chart Container */}
        <div className="relative flex-shrink-0">
          <TooltipProvider>
            <svg 
              width="240" 
              height="240" 
              viewBox="0 0 240 240"
              className="overflow-visible"
            >
              <defs>
                {chartData.map((entry, index) => (
                  <linearGradient 
                    key={`gradient-${index}`} 
                    id={`gradient-${index}`} 
                    gradientUnits="objectBoundingBox"
                  >
                    <stop offset="0%" stopColor={entry.color} stopOpacity="0.9"/>
                    <stop offset="100%" stopColor={entry.color} stopOpacity="1"/>
                  </linearGradient>
                ))}
                <filter id="shadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.1"/>
                </filter>
              </defs>
              
              {chartData.map((entry, index) => {
                const isHovered = hoveredIndex === index;
                const baseRadius = 90;
                const hoverRadius = 95;
                const innerRadius = 50;
                const outerRadius = isHovered ? hoverRadius : baseRadius;
                
                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      <motion.path
                        d={createArcPath(entry.startAngle, entry.endAngle, innerRadius, outerRadius)}
                        fill={`url(#gradient-${index})`}
                        stroke="hsl(var(--background))"
                        strokeWidth="2"
                        filter="url(#shadow)"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        initial={{ opacity: 0 }}
                        animate={{ 
                          opacity: 1,
                          scale: isHovered ? 1.02 : 1
                        }}
                        transition={{ 
                          duration: 0.2,
                          ease: "easeOut"
                        }}
                        style={{ transformOrigin: "120px 120px" }}
                      />
                    </TooltipTrigger>
                    <TooltipContent 
                      side="top" 
                      className="bg-card/95 backdrop-blur-sm border-border/50"
                    >
                      <div className="text-center space-y-1">
                        <p className="font-semibold text-foreground">{entry.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {entry.value.toLocaleString()} units
                        </p>
                        <p className="text-xs text-primary font-medium">
                          {entry.percentage.toFixed(1)}% of total
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
              
              {/* Percentage labels */}
              {chartData.map((entry, index) => {
                if (entry.percentage < 8) return null;
                
                const midAngle = (entry.startAngle + entry.endAngle) / 2;
                const labelRadius = 70;
                const radian = ((midAngle - 90) * Math.PI) / 180;
                const x = 120 + labelRadius * Math.cos(radian);
                const y = 120 + labelRadius * Math.sin(radian);
                
                return (
                  <motion.text
                    key={`label-${index}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-xs font-semibold fill-background"
                    style={{ 
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
                      pointerEvents: 'none'
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    {entry.percentage.toFixed(0)}%
                  </motion.text>
                );
              })}
            </svg>
          </TooltipProvider>
          
          {/* Center Content */}
          {centerContent && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div 
                className="text-center bg-background/90 backdrop-blur-sm rounded-full p-3 border border-border/50 shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              >
                {centerContent}
              </motion.div>
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex-1 min-w-0">
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            {chartData.map((entry, index) => (
              <motion.div
                key={`legend-${index}`}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  hoveredIndex === index 
                    ? 'bg-muted/70 shadow-sm' 
                    : 'hover:bg-muted/40'
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div 
                  className="w-3 h-3 rounded-full border border-background/20 flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {entry.name}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{entry.value.toLocaleString()}</span>
                    <span>•</span>
                    <span className="font-medium">{entry.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPieChart;
