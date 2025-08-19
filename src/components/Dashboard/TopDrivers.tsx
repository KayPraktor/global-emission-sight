import React from 'react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { ProgressBar } from '@/components/ui/loading-states';
import { PieChart, ExternalLink } from 'lucide-react';
import { DataFreshness } from '@/components/ui/data-freshness';
import { Button } from '@/components/ui/button';

interface Driver {
  category: string;
  value: number;
}

const TopDrivers: React.FC = () => {
  const drivers: Driver[] = [
    { category: 'Electricity', value: 1250.5 },
    { category: 'Natural Gas', value: 890.2 },
    { category: 'Business Travel', value: 456.8 },
    { category: 'Waste', value: 123.4 },
  ];

  const max = Math.max(...drivers.map((d) => d.value));

  return (
    <GlassmorphismCard variant="light" className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PieChart className="h-5 w-5 text-primary" />
          <div>
            <h4 className="font-medium">Top Emission Drivers</h4>
            <p className="text-sm text-muted-foreground">By category breakdown</p>
          </div>
        </div>
        <DataFreshness lastUpdated={new Date()} />
      </div>

      <div className="space-y-4">
        {drivers.map((d, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{d.category}</span>
              <span className="font-mono font-medium">{d.value.toFixed(1)} tCO₂e</span>
            </div>
            <ProgressBar value={d.value} max={max} showLabel={false} />
          </div>
        ))}
      </div>

      <div className="pt-2 border-t">
        <Button variant="ghost" size="sm" className="w-full justify-between">
          View detailed breakdown
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </GlassmorphismCard>
  );
};

export default TopDrivers;
