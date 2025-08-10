import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Leaf, Rocket, Sparkles } from 'lucide-react';

const items = [
  { icon: Leaf, title: 'Energy efficiency', desc: 'Prioritize LED retrofits and HVAC tuning in top 3 facilities.' },
  { icon: Sparkles, title: 'Procurement policy', desc: 'Add low-carbon criteria for top Purchased Goods suppliers.' },
  { icon: Rocket, title: 'Renewables ramp-up', desc: 'Sign an additional 20% green power contract in high-intensity regions.' },
  { icon: CheckCircle2, title: 'Data quality', desc: 'Automate meter ingestion to reduce estimation for Scope 2.' },
];

const InsightsNextActions: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights & Next Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <it.icon className="h-4 w-4 text-primary mt-1" />
            <div>
              <div className="text-sm font-medium">{it.title}</div>
              <div className="text-sm text-muted-foreground">{it.desc}</div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default InsightsNextActions;
