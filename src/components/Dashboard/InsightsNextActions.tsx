import React from 'react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Target, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { DataFreshness } from '@/components/ui/data-freshness';
import { Button } from '@/components/ui/button';

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-primary" />
          <div>
            <h4 className="font-medium">AI Insights & Actions</h4>
            <p className="text-sm text-muted-foreground">Smart recommendations</p>
          </div>
        </div>
        <DataFreshness lastUpdated={new Date()} />
      </div>

      <ul className="space-y-3">
        {insights.map((it, idx) => {
          const Icon = it.icon;
          const impactColor = it.impact === 'High' ? 'text-red-600 bg-red-50' : 
                             it.impact === 'Medium' ? 'text-yellow-600 bg-yellow-50' : 
                             'text-blue-600 bg-blue-50';
          return (
            <li key={idx} className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 mt-0.5 text-primary" />
                  <div>
                    <div className="font-medium">{it.title}</div>
                    <p className="text-sm text-muted-foreground">{it.description}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${impactColor}`}>
                  {it.impact} impact
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="pt-2 border-t">
        <Button variant="ghost" size="sm" className="w-full justify-between">
          View all recommendations
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </GlassmorphismCard>
  );
};

export default InsightsNextActions;
