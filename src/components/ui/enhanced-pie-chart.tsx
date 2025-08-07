
import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
    'hsl(var(--muted))',
    'hsl(var(--destructive))'
  ];

  // Calculate total and percentages
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  const dataWithPercentages = data.map((entry, index) => ({
    ...entry,
    percentage: (entry.value / total) * 100,
    color: entry.color || COLORS[index % COLORS.length],
    angle: (entry.value / total) * 360
  }));

  // Calculate path data for each segment
  const calculatePath = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
    const centerX = 150;
    const centerY = 150;
    
    const startAngleRad = (startAngle - 90) * Math.PI / 180;
    const endAngleRad = (endAngle - 90) * Math.PI / 180;
    
    const x1 = centerX + outerRadius * Math.cos(startAngleRad);
    const y1 = centerY + outerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(endAngleRad);
    const y2 = centerY + outerRadius * Math.sin(endAngleRad);
    
    const x3 = centerX + innerRadius * Math.cos(endAngleRad);
    const y3 = centerY + innerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(startAngleRad);
    const y4 = centerY + innerRadius * Math.sin(startAngleRad);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  // Calculate label position
  const calculateLabelPosition = (startAngle: number, endAngle: number, radius: number) => {
    const midAngle = (startAngle + endAngle) / 2;
    const midAngleRad = (midAngle - 90) * Math.PI / 180;
    return {
      x: 150 + radius * Math.cos(midAngleRad),
      y: 150 + radius * Math.sin(midAngleRad)
    };
  };

  let currentAngle = 0;

  const handleSegmentClick = useCallback((index: number) => {
    setSelectedIndex(selectedIndex === index ? null : index);
  }, [selectedIndex]);

  return (
    <TooltipProvider>
      <div className={`relative ${className}`}>
        <div className="relative">
          <svg
            ref={svgRef}
            width="300"
            height="300"
            viewBox="0 0 300 300"
            className="drop-shadow-lg"
          >
            {/* Glow effect background */}
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              {dataWithPercentages.map((entry, index) => (
                <radialGradient key={`gradient-${index}`} id={`gradient-${index}`}>
                  <stop offset="0%" stopColor={entry.color} stopOpacity="0.8"/>
                  <stop offset="100%" stopColor={entry.color} stopOpacity="1"/>
                </radialGradient>
              ))}
            </defs>

            {/* Segments */}
            {dataWithPercentages.map((entry, index) => {
              const startAngle = currentAngle;
              const endAngle = currentAngle + entry.angle;
              const isHovered = hoveredIndex === index;
              const isSelected = selectedIndex === index;
              const baseRadius = 110;
              const hoverRadius = 125;
              const innerRadius = 60;
              
              const outerRadius = isHovered || isSelected ? hoverRadius : baseRadius;
              const path = calculatePath(startAngle, endAngle, innerRadius, outerRadius);
              
              const labelPos = calculateLabelPosition(startAngle, endAngle, 85);
              
              const segment = (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <motion.g
                      initial={{ scale: 1 }}
                      animate={{ 
                        scale: isHovered || isSelected ? 1.05 : 1,
                      }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 25 
                      }}
                      style={{ transformOrigin: "150px 150px" }}
                    >
                      <motion.path
                        d={path}
                        fill={`url(#gradient-${index})`}
                        stroke="hsl(var(--background))"
                        strokeWidth="2"
                        filter={isHovered || isSelected ? "url(#glow)" : "none"}
                        className="cursor-pointer transition-all duration-300"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => handleSegmentClick(index)}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ 
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 200
                        }}
                      />
                      
                      {/* Percentage label */}
                      {entry.percentage > 5 && (
                        <motion.text
                          x={labelPos.x}
                          y={labelPos.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-sm font-bold fill-white"
                          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                        >
                          {entry.percentage.toFixed(0)}%
                        </motion.text>
                      )}
                    </motion.g>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-card border-border">
                    <div className="text-center">
                      <p className="font-semibold text-foreground">{entry.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.value.toLocaleString()} ({entry.percentage.toFixed(1)}%)
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
              
              currentAngle = endAngle;
              return segment;
            })}
          </svg>

          {/* Center content with animation */}
          <AnimatePresence>
            {centerContent && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              >
                <div className="text-center bg-background/80 backdrop-blur-sm rounded-full p-4 border border-border">
                  {centerContent}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Enhanced Legend */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          {dataWithPercentages.map((entry, index) => (
            <motion.div
              key={`legend-${index}`}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                hoveredIndex === index || selectedIndex === index
                  ? 'bg-muted/50 scale-105'
                  : 'hover:bg-muted/30'
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => handleSegmentClick(index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="w-4 h-4 rounded-full border-2 border-background"
                style={{ backgroundColor: entry.color }}
                animate={{
                  boxShadow: hoveredIndex === index || selectedIndex === index
                    ? `0 0 10px ${entry.color}40`
                    : '0 0 0px transparent'
                }}
              />
              <span className="text-sm font-medium text-foreground">
                {entry.name}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {entry.percentage.toFixed(1)}%
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </TooltipProvider>
  );
};

export default EnhancedPieChart;
