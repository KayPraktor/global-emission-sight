import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  AlertCircle, 
  CheckCircle, 
  DollarSign,
  Activity,
  Zap,
  Globe,
  Lightbulb
} from 'lucide-react';
import { ScenarioAnalysis } from '@/utils/enterpriseData';

interface AdvancedScenarioPlanningProps {
  scenarios: ScenarioAnalysis[];
}

const AdvancedScenarioPlanning: React.FC<AdvancedScenarioPlanningProps> = ({ scenarios }) => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioAnalysis>(scenarios[0]);
  
  // Sample data for visualization
  const scenarioData = [
    { year: '2024', 'Business as Usual': 24540, 'Accelerated': 24540, 'Regulatory Shock': 24540, 'Innovation': 24540 },
    { year: '2025', 'Business as Usual': 26800, 'Accelerated': 20200, 'Regulatory Shock': 24500, 'Innovation': 18000 },
    { year: '2026', 'Business as Usual': 28000, 'Accelerated': 18500, 'Regulatory Shock': 22000, 'Innovation': 15000 },
    { year: '2027', 'Business as Usual': 29200, 'Accelerated': 17000, 'Regulatory Shock': 20000, 'Innovation': 13000 },
    { year: '2028', 'Business as Usual': 30500, 'Accelerated': 16200, 'Regulatory Shock': 18500, 'Innovation': 12000 },
    { year: '2029', 'Business as Usual': 31800, 'Accelerated': 15800, 'Regulatory Shock': 17200, 'Innovation': 11500 },
    { year: '2030', 'Business as Usual': 33000, 'Accelerated': 15000, 'Regulatory Shock': 16000, 'Innovation': 11000 }
  ];

  const costData = [
    { year: '2024', 'Business as Usual': 982, 'Accelerated': 1200, 'Regulatory Shock': 1500, 'Innovation': 1100 },
    { year: '2025', 'Business as Usual': 1200, 'Accelerated': 1800, 'Regulatory Shock': 3600, 'Innovation': 1200 },
    { year: '2026', 'Business as Usual': 1400, 'Accelerated': 2000, 'Regulatory Shock': 3200, 'Innovation': 1000 },
    { year: '2027', 'Business as Usual': 1600, 'Accelerated': 1900, 'Regulatory Shock': 2800, 'Innovation': 900 },
    { year: '2028', 'Business as Usual': 1800, 'Accelerated': 1600, 'Regulatory Shock': 2400, 'Innovation': 800 },
    { year: '2029', 'Business as Usual': 2000, 'Accelerated': 1400, 'Regulatory Shock': 2200, 'Innovation': 750 },
    { year: '2030', 'Business as Usual': 2200, 'Accelerated': 1200, 'Regulatory Shock': 2000, 'Innovation': 700 }
  ];

  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case 'Business as Usual': return '#8884d8';
      case 'Accelerated': return '#82ca9d';
      case 'Regulatory Shock': return '#ff7c7c';
      case 'Innovation': return '#ffc658';
      default: return '#8884d8';
    }
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 75) return 'text-green-600 bg-green-50 border-green-200';
    if (probability >= 50) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (probability >= 25) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <GlassmorphismCard variant="colored" className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Advanced Scenario Planning</h3>
                <p className="text-muted-foreground">
                  Strategic carbon trajectory analysis with Monte Carlo simulations
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Target className="w-4 h-4 mr-2" />
              Run Simulation
            </Button>
          </div>
        </GlassmorphismCard>
      </motion.div>

      {/* Scenario Overview Cards */}
      <motion.div variants={fadeInUp}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {scenarios.map((scenario, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ scale: 1.05 }}
              onClick={() => setSelectedScenario(scenario)}
              className={`cursor-pointer transition-all duration-300 ${
                selectedScenario.scenario === scenario.scenario ? 'ring-2 ring-primary' : ''
              }`}
            >
              <GlassmorphismCard variant="light" className="p-4 h-full">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">{scenario.scenario}</h4>
                    <Badge className={`text-xs ${getProbabilityColor(scenario.probability)}`}>
                      {scenario.probability}%
                    </Badge>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {scenario.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2 bg-green-50 rounded">
                      <div className="text-sm font-bold text-green-600">
                        {scenario.impact.emissions.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">tCO₂e</div>
                    </div>
                    <div className="p-2 bg-blue-50 rounded">
                      <div className="text-sm font-bold text-blue-600">
                        ${scenario.impact.cost.toLocaleString()}K
                      </div>
                      <div className="text-xs text-muted-foreground">cost</div>
                    </div>
                  </div>
                </div>
              </GlassmorphismCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Detailed Analysis */}
      <motion.div variants={fadeInUp}>
        <Tabs defaultValue="emissions" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="emissions">Emissions Trajectory</TabsTrigger>
            <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
            <TabsTrigger value="actions">Action Plans</TabsTrigger>
            <TabsTrigger value="sensitivity">Sensitivity Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="emissions">
            <GlassmorphismCard variant="light" className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2">Emissions Trajectory Comparison</h4>
                <p className="text-muted-foreground">
                  7-year carbon footprint projection across different scenarios
                </p>
              </div>
              
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scenarioData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${value.toLocaleString()} tCO₂e`,
                        name
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="Business as Usual" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Accelerated" 
                      stroke="#82ca9d" 
                      strokeWidth={3}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Regulatory Shock" 
                      stroke="#ff7c7c" 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Innovation" 
                      stroke="#ffc658" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassmorphismCard>
          </TabsContent>

          <TabsContent value="costs">
            <GlassmorphismCard variant="light" className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2">Cost Impact Analysis</h4>
                <p className="text-muted-foreground">
                  Total carbon-related costs including compliance, mitigation, and risk exposure
                </p>
              </div>
              
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={costData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `$${value.toLocaleString()}K`,
                        name
                      ]}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      stackId="1"
                      dataKey="Business as Usual" 
                      stroke="#8884d8" 
                      fill="#8884d8"
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      stackId="2"
                      dataKey="Accelerated" 
                      stroke="#82ca9d" 
                      fill="#82ca9d"
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      stackId="3"
                      dataKey="Regulatory Shock" 
                      stroke="#ff7c7c" 
                      fill="#ff7c7c"
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      stackId="4"
                      dataKey="Innovation" 
                      stroke="#ffc658" 
                      fill="#ffc658"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlassmorphismCard>
          </TabsContent>

          <TabsContent value="actions">
            <GlassmorphismCard variant="light" className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2">
                  Action Plan: {selectedScenario.scenario}
                </h4>
                <p className="text-muted-foreground">
                  {selectedScenario.description}
                </p>
              </div>

              <div className="space-y-4">
                {selectedScenario.actions.map((action, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <div className="p-2 bg-blue-500 rounded-full">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">{action}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        Priority {index + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {selectedScenario.impact.emissions.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">2030 Emissions (tCO₂e)</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ${selectedScenario.impact.cost.toLocaleString()}K
                  </div>
                  <div className="text-sm text-muted-foreground">Total Investment</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedScenario.impact.timeline}
                  </div>
                  <div className="text-sm text-muted-foreground">Implementation</div>
                </div>
              </div>
            </GlassmorphismCard>
          </TabsContent>

          <TabsContent value="sensitivity">
            <GlassmorphismCard variant="light" className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-2">Sensitivity Analysis</h4>
                <p className="text-muted-foreground">
                  Impact of key variables on scenario outcomes
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="font-medium">Key Risk Factors</h5>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <span className="text-sm">Carbon Price Volatility</span>
                      <Badge variant="destructive">High Impact</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <span className="text-sm">Technology Adoption Rate</span>
                      <Badge className="bg-amber-100 text-amber-800">Medium Impact</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm">Supply Chain Disruption</span>
                      <Badge className="bg-blue-100 text-blue-800">Medium Impact</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="text-sm">Renewable Energy Costs</span>
                      <Badge className="bg-green-100 text-green-800">Low Impact</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="font-medium">Scenario Confidence</h5>
                  <div className="space-y-3">
                    {scenarios.map((scenario, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{scenario.scenario}</span>
                          <span className="text-sm">{scenario.probability}%</span>
                        </div>
                        <Progress value={scenario.probability} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassmorphismCard>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default AdvancedScenarioPlanning;