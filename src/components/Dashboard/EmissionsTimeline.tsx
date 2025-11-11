import React, { useState } from 'react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { MonthlyEmissions } from '@/services/analyticsService';
import { ChevronRight, TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { DataFreshness } from '@/components/ui/data-freshness';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SampleDataBadge } from '@/components/ui/sample-data-badge';

interface EmissionsTimelineProps {
  monthlyData: MonthlyEmissions[];
  hasData: boolean;
}

const EmissionsTimeline: React.FC<EmissionsTimelineProps> = ({ monthlyData, hasData }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | '6months' | '3months'>('6months');

  const filterData = () => {
    if (!monthlyData || monthlyData.length === 0) return [];
    const monthsMap = { '3months': 3, '6months': 6, 'all': monthlyData.length };
    const months = monthsMap[selectedPeriod];
    return monthlyData.slice(-months);
  };

  const filteredData = filterData();

  return (
    <GlassmorphismCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Emissions Timeline</h3>
            <p className="text-sm text-muted-foreground">Monthly tracking & progress</p>
          </div>
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
        <div className="space-y-3">
          {filteredData.map((item, index) => {
            const prevMonth = index > 0 ? filteredData[index - 1] : null;
            const change = prevMonth ? ((item.total - prevMonth.total) / prevMonth.total) * 100 : 0;
            const isIncrease = change > 0;

            return (
              <motion.div
                key={item.month}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/50 hover:bg-background/80 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{item.month}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Scope 1: {item.scope1.toFixed(1)}</span>
                      <span>•</span>
                      <span>Scope 2: {item.scope2.toFixed(1)}</span>
                      <span>•</span>
                      <span>Scope 3: {item.scope3.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-foreground">
                      {item.total.toFixed(1)} <span className="text-sm font-normal text-muted-foreground">tCO₂e</span>
                    </div>
                    {prevMonth && (
                      <div className={`flex items-center gap-1 text-xs ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                        {isIncrease ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>{Math.abs(change).toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </GlassmorphismCard>
  );
};

export default EmissionsTimeline;
