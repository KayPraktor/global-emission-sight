import React, { useState } from 'react';
import { PieChart, ExternalLink, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CategoryBreakdown } from '@/services/analyticsService';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface TopDriversProps {
  categoryBreakdown: CategoryBreakdown[];
}

// Driver card component
interface DriverCardProps {
  category: string;
  value: number;
  percentage: number;
  index: number;
  maxValue: number;
}

const DriverCard: React.FC<DriverCardProps> = ({ category, value, percentage, index, maxValue }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // Color based on emission level (higher = more red, lower = more green)
  const getEmissionStyles = (percent: number) => {
    if (percent >= 40) return {
      border: 'border-l-destructive',
      bg: 'from-destructive/5 to-transparent',
      progressBg: 'bg-destructive',
      iconBg: 'bg-destructive/10',
      iconText: 'text-destructive'
    };
    if (percent >= 25) return {
      border: 'border-l-amber-500',
      bg: 'from-amber-500/5 to-transparent',
      progressBg: 'bg-amber-500',
      iconBg: 'bg-amber-500/10',
      iconText: 'text-amber-600'
    };
    return {
      border: 'border-l-primary',
      bg: 'from-primary/5 to-transparent',
      progressBg: 'bg-primary',
      iconBg: 'bg-primary/10',
      iconText: 'text-primary'
    };
  };

  const styles = getEmissionStyles(percentage);
  const progressWidth = (value / maxValue) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate('/analytics?tab=sources')}
      className={`
        relative p-3 rounded-xl border border-l-4 ${styles.border}
        bg-gradient-to-r ${styles.bg}
        transition-all duration-200 cursor-pointer
        hover:shadow-md hover:scale-[1.01]
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{category}</span>
          <Badge variant="outline" className="text-xs font-mono">
            {percentage.toFixed(1)}%
          </Badge>
        </div>
        <AnimatePresence>
          {isHovered ? (
            <motion.div
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 5 }}
            >
              <ChevronRight className="h-4 w-4 text-primary" />
            </motion.div>
          ) : (
            <span className="text-sm font-mono font-medium text-muted-foreground">
              {value.toFixed(1)} tCO₂e
            </span>
          )}
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressWidth}%` }}
          transition={{ delay: index * 0.1 + 0.2, duration: 0.5, ease: "easeOut" }}
          className={`h-full rounded-full ${styles.progressBg}`}
        />
      </div>
    </motion.div>
  );
};

// Empty state
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-8"
  >
    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-muted mb-3">
      <PieChart className="h-7 w-7 text-muted-foreground" />
    </div>
    <h4 className="font-medium text-foreground mb-1">No emission data</h4>
    <p className="text-sm text-muted-foreground">
      Add emissions entries to see top drivers
    </p>
  </motion.div>
);

const TopDrivers: React.FC<TopDriversProps> = ({ categoryBreakdown }) => {
  const navigate = useNavigate();

  // Use real data or fallback to sample data
  const drivers = categoryBreakdown.length > 0 
    ? categoryBreakdown.slice(0, 4).map(item => ({
        category: item.category,
        value: item.value
      }))
    : [
        { category: 'Electricity', value: 1250.5 },
        { category: 'Natural Gas', value: 890.2 },
        { category: 'Business Travel', value: 456.8 },
        { category: 'Waste', value: 123.4 },
      ];

  const total = drivers.reduce((sum, d) => sum + d.value, 0);
  const max = Math.max(...drivers.map((d) => d.value), 1);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Header with gradient */}
      <div className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-inset ring-primary/20">
              <PieChart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Top Emission Drivers</h4>
              <p className="text-xs text-muted-foreground">By category breakdown</p>
            </div>
          </div>
          <Badge variant="secondary" className="font-mono text-xs">
            {total.toFixed(0)} tCO₂e
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {drivers.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {drivers.map((d, i) => (
              <DriverCard
                key={i}
                category={d.category}
                value={d.value}
                percentage={(d.value / total) * 100}
                index={i}
                maxValue={max}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between hover:bg-primary/5"
          onClick={() => navigate('/analytics?tab=sources')}
        >
          View detailed breakdown
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default TopDrivers;
