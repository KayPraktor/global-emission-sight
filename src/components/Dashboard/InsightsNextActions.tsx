import React from 'react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Target, AlertTriangle, Info } from 'lucide-react';

interface Insight {
  icon: React.ElementType;
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
}

const Badge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-foreground/80 border">{children}</span>
);

const InsightsNextActions: React.FC = () => {
  const insights: Insight[] = [
    {
      icon: Target,
      title: 'Scope 2 reduction opportunity',
      description: 'Negotiate green tariffs to cut electricity emissions by ~12%.',
      impact: 'High',
    },
    {
      icon: AlertTriangle,
      title: 'CDP deadline approaching',
      description: 'Prepare data package and assign reviewer this week.',
      impact: 'Medium',
    },
    {
      icon: Info,
      title: 'Travel emissions rising',
      description: 'Promote rail for <800km and enable virtual-first policy.',
      impact: 'Low',
    },
  ];

  return (
    <GlassmorphismCard variant="light" className="p-6 space-y-4">
      <div className="flex items-center">
        <Target className="h-5 w-5 mr-2 text-primary" />
        <h4 className="font-medium">Insights & Next Actions</h4>
      </div>

      <ul className="space-y-3">
        {insights.map((it, idx) => {
          const Icon = it.icon;
          return (
            <li key={idx} className="p-3 rounded-lg border bg-card">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 mt-0.5 text-primary" />
                  <div>
                    <div className="font-medium">{it.title}</div>
                    <p className="text-sm text-muted-foreground">{it.description}</p>
                  </div>
                </div>
                <Badge>{it.impact} impact</Badge>
              </div>
            </li>
          );
        })}
      </ul>
    </GlassmorphismCard>
  );
};

export default InsightsNextActions;
