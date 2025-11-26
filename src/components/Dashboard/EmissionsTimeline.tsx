import React, { useState } from 'react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { MonthlyEmissions } from '@/services/analyticsService';
import { ChevronRight, TrendingDown, TrendingUp, Calendar, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { DataFreshness } from '@/components/ui/data-freshness';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SampleDataBadge } from '@/components/ui/sample-data-badge';
import { MiniScopeBar } from './MiniScopeBar';
import { Sparkline } from './Sparkline';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface EmissionsTimelineProps {
  monthlyData: MonthlyEmissions[];
  hasData: boolean;
  targetEmissions?: number;
}

const EmissionsTimeline: React.FC<EmissionsTimelineProps> = ({ monthlyData, hasData, targetEmissions }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '6months' | '3months'>('6months');
  const navigate = useNavigate();

  const filterData = () => {
    if (!monthlyData || monthlyData.length === 0) return [];
    const monthsMap = { '3months': 3, '6months': 6, 'all': monthlyData.length };
    const months = monthsMap[selectedPeriod];
    return monthlyData.slice(-months);
  };

  const filteredData = filterData();
  const sparklineData = filteredData.map(d => d.total);

  return (
    <GlassmorphismCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-foreground">Emissions Timeline</h3>
            {filteredData.length > 0 && (
              <Sparkline data={sparklineData} height={24} className="w-24" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">Monthly tracking & progress</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as typeof selectedPeriod)}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 months</SelectItem>
              <SelectItem value="6months">6 months</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <DataFreshness lastUpdated={new Date()} />
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>No emissions data available</p>
          <p className="text-sm mt-2">Start by adding emissions entries</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical Timeline Connector */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-border" />
          
          <div className="space-y-3">
            {filteredData.map((item, index) => {
              const prevMonth = index > 0 ? filteredData[index - 1] : null;
              const change = prevMonth ? ((item.total - prevMonth.total) / prevMonth.total) * 100 : 0;
              const isIncrease = change > 0;
              const isStable = Math.abs(change) < 2;
              
              // Target comparison
              const targetDiff = targetEmissions ? ((item.total - targetEmissions) / targetEmissions) * 100 : null;
              const isAboveTarget = targetDiff !== null && targetDiff > 0;
              const isBelowTarget = targetDiff !== null && targetDiff < 0;
              
              // Node color based on target
              const nodeColor = targetDiff === null 
                ? 'bg-primary border-primary' 
                : isAboveTarget 
                  ? 'bg-red-500 border-red-500' 
                  : isBelowTarget 
                    ? 'bg-green-500 border-green-500' 
                    : 'bg-yellow-500 border-yellow-500';

              return (
                <motion.div
                  key={item.month}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => navigate(`/analytics?month=${item.month}`)}
                  className="relative flex items-start gap-4 p-4 bg-background/50 rounded-lg border border-border/50 hover:bg-background/80 transition-all cursor-pointer group"
                >
                  {/* Timeline Node */}
                  <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 ${nodeColor} transition-all group-hover:scale-110`}>
                    {isStable ? (
                      <Minus className="h-5 w-5 text-white" />
                    ) : isIncrease ? (
                      <TrendingUp className="h-5 w-5 text-white" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">{item.month}</h4>
                      <div className="flex items-center gap-2">
                        <div className="text-lg font-semibold text-foreground">
                          {item.total.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">tCO₂e</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>

                    {/* Mini Scope Bar */}
                    <MiniScopeBar
                      scope1={item.scope1}
                      scope2={item.scope2}
                      scope3={item.scope3}
                      total={item.total}
                      className="mb-2"
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span>S1: {item.scope1.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span>S2: {item.scope2.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-purple-500" />
                          <span>S3: {item.scope3.toFixed(1)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Change Badge */}
                        {prevMonth && (
                          <Badge variant={isIncrease ? "destructive" : "default"} className="text-xs">
                            {isIncrease ? '+' : ''}{change.toFixed(1)}% vs prev
                          </Badge>
                        )}
                        
                        {/* Target Badge */}
                        {targetDiff !== null && (
                          <Badge 
                            variant={isAboveTarget ? "destructive" : "default"}
                            className="text-xs"
                          >
                            {isAboveTarget ? '+' : ''}{targetDiff.toFixed(1)}% vs target
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </GlassmorphismCard>
  );
};

export default EmissionsTimeline;
