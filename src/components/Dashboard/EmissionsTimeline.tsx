import React, { useState } from 'react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { MonthlyEmissions } from '@/services/analyticsService';
import { ChevronDown, ChevronUp, TrendingDown, TrendingUp, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { translations as t, formatPersianNumber, toPersianNumber } from '@/lib/translations';

interface EmissionsTimelineProps {
  monthlyData: MonthlyEmissions[];
  hasData: boolean;
}

const MiniSparkline: React.FC<{ data: number[] }> = ({ data }) => {
  if (data.length === 0) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 60;
    const y = 16 - ((value - min) / range) * 14;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="60" height="20" className="opacity-70">
      <polyline
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  );
};

const EmissionsTimeline: React.FC<EmissionsTimelineProps> = ({ monthlyData, hasData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const recentData = monthlyData.slice(-6);
  const displayData = isExpanded ? recentData.slice(-3) : [];
  
  const latestMonth = recentData[recentData.length - 1];
  const previousMonth = recentData[recentData.length - 2];
  const trendChange = latestMonth && previousMonth 
    ? ((latestMonth.total - previousMonth.total) / previousMonth.total) * 100 
    : 0;
  const isIncrease = trendChange > 0;

  const sparklineData = recentData.map(d => d.total);

  if (!hasData || monthlyData.length === 0) {
    return (
      <GlassmorphismCard className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{t.timeline.title}</span>
          </div>
          <span className="text-xs text-muted-foreground">{t.timeline.noData}</span>
        </div>
      </GlassmorphismCard>
    );
  }

  return (
    <GlassmorphismCard className="p-4">
      {/* Compact Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-4 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <Activity className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{t.timeline.title}</span>
        </div>
        
        <div className="flex items-center gap-4">
          <MiniSparkline data={sparklineData} />
          
          {latestMonth && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-foreground">
                {formatPersianNumber(latestMonth.total, 1)} <span className="text-xs font-normal text-muted-foreground">tCO₂e</span>
              </span>
              {previousMonth && (
                <span className={`flex items-center gap-0.5 text-xs ${isIncrease ? 'text-destructive' : 'text-green-600'}`}>
                  {isIncrease ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {toPersianNumber(Math.abs(trendChange).toFixed(1))}%
                </span>
              )}
            </div>
          )}
          
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-border/50 space-y-1">
              {displayData.reverse().map((item, index) => {
                const prevMonth = index < displayData.length - 1 ? displayData[index + 1] : null;
                const change = prevMonth ? ((item.total - prevMonth.total) / prevMonth.total) * 100 : 0;
                const itemIncrease = change > 0;

                return (
                  <div
                    key={item.month}
                    className="flex items-center justify-between py-1.5 text-sm"
                  >
                    <span className="text-muted-foreground w-20">{item.month}</span>
                    <span className="font-medium text-foreground">
                      {formatPersianNumber(item.total, 1)} tCO₂e
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t.dashboard.scope1.slice(0, 2)}: {toPersianNumber(item.scope1.toFixed(0))} • {t.dashboard.scope2.slice(0, 2)}: {toPersianNumber(item.scope2.toFixed(0))} • {t.dashboard.scope3.slice(0, 2)}: {toPersianNumber(item.scope3.toFixed(0))}
                    </span>
                    {prevMonth && (
                      <span className={`flex items-center gap-0.5 text-xs w-12 justify-end ${itemIncrease ? 'text-destructive' : 'text-green-600'}`}>
                        {itemIncrease ? '↑' : '↓'}{toPersianNumber(Math.abs(change).toFixed(0))}%
                      </span>
                    )}
                    {!prevMonth && <span className="w-12" />}
                  </div>
                );
              })}
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/analytics');
                }}
                className="w-full text-center text-xs text-primary hover:underline pt-2"
              >
                {t.timeline.viewAllAnalytics}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassmorphismCard>
  );
};

export default EmissionsTimeline;
