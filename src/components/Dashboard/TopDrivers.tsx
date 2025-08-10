import React from 'react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { ProgressBar } from '@/components/ui/loading-states';
import { PieChart } from 'lucide-react';

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
      <div className="flex items-center">
        <PieChart className="h-5 w-5 mr-2 text-primary" />
        <h4 className="font-medium">Top Emission Drivers (Categories)</h4>
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
    </GlassmorphismCard>
  );
};

export default TopDrivers;
