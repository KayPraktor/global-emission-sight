import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Target, BarChart3, Gauge, ArrowRight } from 'lucide-react';

interface ScenarioMetrics {
  name: string;
  reduction: number;
  confidence: number;
  color: string;
}

interface ForecastInsightsPanelProps {
  activeScenario: string;
  scenarios: ScenarioMetrics[];
}

const ForecastInsightsPanel: React.FC<ForecastInsightsPanelProps> = ({ 
  activeScenario,
  scenarios 
}) => {
  const currentScenario = scenarios.find(s => s.name === activeScenario) || scenarios[0];
  
  // Model metrics
  const modelMetrics = {
    accuracy: 94.2,
    dataPoints: 156,
    lastUpdated: '2 hours ago',
    confidenceInterval: '±8%'
  };
  
  // Goal progress
  const goalProgress = {
    current: 31,
    target: 17,
    baseline: 60,
    progress: Math.round(((60 - 31) / (60 - 17)) * 100),
    yearsRemaining: 5
  };

  return (
    <div className="space-y-4 h-full">
      {/* Scenario Comparison */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Scenario Comparison
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {scenarios.map((scenario) => (
            <div 
              key={scenario.name}
              className={`p-2 rounded-lg transition-all ${
                scenario.name === activeScenario 
                  ? 'bg-primary/10 ring-1 ring-primary/30' 
                  : 'bg-muted/50 hover:bg-muted'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{scenario.name}</span>
                <Badge 
                  variant={scenario.name === activeScenario ? "default" : "secondary"}
                  className="text-xs"
                >
                  {scenario.reduction}% reduction
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Progress 
                  value={scenario.confidence} 
                  className="h-1.5 flex-1"
                />
                <span className="text-xs text-muted-foreground">
                  {scenario.confidence}% conf.
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Model Metrics */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Gauge className="h-4 w-4 text-blue-500" />
            Model Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-2">
              <div className="text-xs text-muted-foreground">Accuracy</div>
              <div className="text-lg font-semibold text-green-600">
                {modelMetrics.accuracy}%
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <div className="text-xs text-muted-foreground">Data Points</div>
              <div className="text-lg font-semibold">
                {modelMetrics.dataPoints}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <div className="text-xs text-muted-foreground">Confidence</div>
              <div className="text-lg font-semibold">
                {modelMetrics.confidenceInterval}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <div className="text-xs text-muted-foreground">Updated</div>
              <div className="text-sm font-medium">
                {modelMetrics.lastUpdated}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goal Progress */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-green-500" />
            2030 Goal Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress to target</span>
            <span className="font-semibold text-green-600">{goalProgress.progress}%</span>
          </div>
          <Progress value={goalProgress.progress} className="h-2" />
          
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              <span>Baseline: {goalProgress.baseline}</span>
            </div>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Current: {goalProgress.current}</span>
            </div>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Target: {goalProgress.target}</span>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-2 mt-2">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-700 dark:text-green-400">
                On track to exceed target by 2 tCO₂e/M$
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            Forecast Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Avg. annual reduction</span>
              <span className="font-medium">5.2 tCO₂e/M$</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Projected 2030 value</span>
              <span className="font-medium text-green-600">17 tCO₂e/M$</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-muted-foreground">Net Zero timeline</span>
              <span className="font-medium">2038 (est.)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForecastInsightsPanel;
