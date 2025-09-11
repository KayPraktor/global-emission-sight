import React, { useState } from 'react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb, 
  Zap, 
  Shield,
  DollarSign,
  Leaf,
  BarChart3,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DataFreshness } from '@/components/ui/data-freshness';

const StrategicIntelligencePanel: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('quarterly');

  // Strategic KPIs data
  const strategicKPIs = [
    {
      category: 'Carbon Performance',
      metrics: [
        { name: 'Net Zero Progress', current: 32, target: 100, unit: '%', trend: 'up', change: '+12%', status: 'on-track' },
        { name: 'Carbon Intensity', current: 2.4, target: 1.8, unit: 'tCO₂e/M$', trend: 'down', change: '-8%', status: 'on-track' },
        { name: 'Renewable Energy', current: 65, target: 80, unit: '%', trend: 'up', change: '+5%', status: 'on-track' }
      ]
    },
    {
      category: 'Financial Impact',
      metrics: [
        { name: 'Carbon Cost Savings', current: 2.1, target: 3.0, unit: 'M$', trend: 'up', change: '+15%', status: 'on-track' },
        { name: 'ESG Investment ROI', current: 18.5, target: 20.0, unit: '%', trend: 'up', change: '+3%', status: 'on-track' },
        { name: 'Carbon Tax Liability', current: 0.8, target: 0.6, unit: 'M$', trend: 'down', change: '-12%', status: 'at-risk' }
      ]
    },
    {
      category: 'Operational Excellence',
      metrics: [
        { name: 'Energy Efficiency', current: 92, target: 95, unit: '%', trend: 'up', change: '+4%', status: 'on-track' },
        { name: 'Supply Chain Emissions', current: 1240, target: 1100, unit: 'tCO₂e', trend: 'down', change: '-8%', status: 'on-track' },
        { name: 'Waste Reduction', current: 78, target: 85, unit: '%', trend: 'up', change: '+6%', status: 'on-track' }
      ]
    }
  ];

  // AI-powered insights and recommendations
  const strategicInsights = [
    {
      type: 'opportunity',
      priority: 'high',
      title: 'Accelerate Solar Installation',
      description: 'Installing solar panels at Facility C could reduce Scope 2 emissions by 35% and save $1.2M annually.',
      impact: 'High',
      timeframe: '6 months',
      roi: '340%',
      icon: Zap
    },
    {
      type: 'risk',
      priority: 'medium',
      title: 'Supply Chain Vulnerability',
      description: 'Top supplier lacks carbon disclosure. Represents 15% of Scope 3 emissions with regulatory risk.',
      impact: 'Medium',
      timeframe: '3 months',
      roi: 'N/A',
      icon: AlertTriangle
    },
    {
      type: 'efficiency',
      priority: 'high',
      title: 'Energy Management Optimization',
      description: 'AI-driven HVAC optimization could reduce energy consumption by 12% across all facilities.',
      impact: 'High',
      timeframe: '2 months',
      roi: '180%',
      icon: Activity
    },
    {
      type: 'compliance',
      priority: 'medium',
      title: 'CSRD Readiness Assessment',
      description: 'Prepare for EU Corporate Sustainability Reporting Directive. Current readiness: 65%.',
      impact: 'Medium',
      timeframe: '8 months',
      roi: 'N/A',
      icon: Shield
    }
  ];

  // Progress tracking data
  const progressData = [
    { month: 'Jan', netZero: 28, carbonIntensity: 2.6, renewableEnergy: 58, energyEfficiency: 88 },
    { month: 'Feb', netZero: 29, carbonIntensity: 2.5, renewableEnergy: 60, energyEfficiency: 89 },
    { month: 'Mar', netZero: 30, carbonIntensity: 2.4, renewableEnergy: 62, energyEfficiency: 90 },
    { month: 'Apr', netZero: 31, carbonIntensity: 2.3, renewableEnergy: 64, energyEfficiency: 91 },
    { month: 'May', netZero: 32, carbonIntensity: 2.4, renewableEnergy: 65, energyEfficiency: 92 }
  ];

  // Risk assessment data
  const riskData = [
    { name: 'Regulatory Changes', value: 35, color: 'hsl(var(--destructive))' },
    { name: 'Supply Chain', value: 25, color: 'hsl(var(--primary))' },
    { name: 'Technology Risk', value: 20, color: 'hsl(var(--secondary))' },
    { name: 'Market Volatility', value: 15, color: 'hsl(var(--accent))' },
    { name: 'Other', value: 5, color: 'hsl(var(--muted))' }
  ];

  const getMetricIcon = (category: string) => {
    switch (category) {
      case 'Carbon Performance': return Leaf;
      case 'Financial Impact': return DollarSign;
      case 'Operational Excellence': return BarChart3;
      default: return Target;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return Lightbulb;
      case 'risk': return AlertTriangle;
      case 'efficiency': return Activity;
      case 'compliance': return Shield;
      default: return Target;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Strategic Overview Header */}
      <GlassmorphismCard variant="light" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="h-6 w-6 text-primary" />
            <div>
              <h3 className="text-lg font-semibold">Strategic Intelligence Center</h3>
              <p className="text-sm text-muted-foreground">Real-time insights and strategic performance tracking</p>
            </div>
          </div>
          <DataFreshness lastUpdated={new Date()} />
        </div>

        {/* Key Strategic Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {strategicKPIs.map((category, categoryIndex) => {
            const Icon = getMetricIcon(category.category);
            return (
              <div key={categoryIndex} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5 text-primary" />
                  <h4 className="font-medium">{category.category}</h4>
                </div>
                <div className="space-y-3">
                  {category.metrics.map((metric, metricIndex) => (
                    <div key={metricIndex} className="bg-background/50 rounded-lg p-3 border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{metric.name}</span>
                        <Badge variant={metric.status === 'on-track' ? 'default' : 'secondary'} className="text-xs">
                          {metric.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                          {metric.change}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">{metric.current} <span className="text-sm text-muted-foreground">{metric.unit}</span></span>
                        <span className="text-xs text-muted-foreground">Target: {metric.target}</span>
                      </div>
                      <Progress value={(metric.current / metric.target) * 100} className="mt-2 h-2" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </GlassmorphismCard>

      {/* Strategic Analytics Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Tracking Chart */}
        <GlassmorphismCard variant="light" className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Strategic Progress Tracking</h4>
            <div className="flex items-center gap-2">
              <select 
                value={selectedTimeframe} 
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="text-xs bg-background border border-border rounded px-2 py-1"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-muted-foreground" />
                <YAxis axisLine={false} tickLine={false} className="text-muted-foreground" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="netZero" stroke="hsl(var(--primary))" strokeWidth={2} name="Net Zero Progress %" />
                <Line type="monotone" dataKey="renewableEnergy" stroke="hsl(var(--secondary))" strokeWidth={2} name="Renewable Energy %" />
                <Line type="monotone" dataKey="energyEfficiency" stroke="hsl(var(--accent))" strokeWidth={2} name="Energy Efficiency %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassmorphismCard>

        {/* Risk Assessment */}
        <GlassmorphismCard variant="light" className="p-6">
          <h4 className="font-medium mb-4">Strategic Risk Assessment</h4>
          <div className="h-[200px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {riskData.slice(0, 3).map((risk, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: risk.color }} />
                  <span>{risk.name}</span>
                </div>
                <span className="font-medium">{risk.value}%</span>
              </div>
            ))}
          </div>
        </GlassmorphismCard>
      </div>

      {/* AI-Powered Strategic Insights */}
      <GlassmorphismCard variant="light" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="h-5 w-5 text-primary" />
          <div>
            <h4 className="font-medium">AI-Powered Strategic Recommendations</h4>
            <p className="text-sm text-muted-foreground">Intelligent insights to accelerate your sustainability journey</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {strategicInsights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type);
            return (
              <div key={index} className="bg-background/50 rounded-lg p-4 border hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      insight.type === 'opportunity' ? 'bg-green-100 text-green-600' :
                      insight.type === 'risk' ? 'bg-red-100 text-red-600' :
                      insight.type === 'efficiency' ? 'bg-blue-100 text-blue-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="font-medium">{insight.title}</h5>
                      <Badge variant={getPriorityColor(insight.priority)} className="text-xs mt-1">
                        {insight.priority} priority
                      </Badge>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <span><strong>Impact:</strong> {insight.impact}</span>
                    <span><strong>Timeframe:</strong> {insight.timeframe}</span>
                  </div>
                  {insight.roi !== 'N/A' && (
                    <Badge variant="outline">{insight.roi} ROI</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </GlassmorphismCard>
    </div>
  );
};

export default StrategicIntelligencePanel;