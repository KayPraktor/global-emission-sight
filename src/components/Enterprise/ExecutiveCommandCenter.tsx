import React from 'react';
import { motion } from 'framer-motion';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  Shield, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { ExecutiveKPI } from '@/utils/enterpriseData';

interface ExecutiveCommandCenterProps {
  kpis: ExecutiveKPI[];
}

const ExecutiveCommandCenter: React.FC<ExecutiveCommandCenterProps> = ({ kpis }) => {
  const getKPIIcon = (category: string) => {
    switch (category) {
      case 'emissions': return <Activity className="w-5 h-5" />;
      case 'financial': return <DollarSign className="w-5 h-5" />;
      case 'compliance': return <Shield className="w-5 h-5" />;
      case 'operational': return <Zap className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'good': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') {
      return <TrendingUp className={`w-4 h-4 ${change > 0 ? 'text-red-500' : 'text-green-500'}`} />;
    } else if (trend === 'down') {
      return <TrendingDown className={`w-4 h-4 ${change < 0 ? 'text-green-500' : 'text-red-500'}`} />;
    }
    return <Activity className="w-4 h-4 text-gray-500" />;
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
      {/* Strategic Overview */}
      <motion.div variants={fadeInUp}>
        <GlassmorphismCard variant="light" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Executive Command Center</h3>
              <p className="text-muted-foreground">
                Real-time portfolio performance and strategic insights
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                All Systems Operational
              </Badge>
            </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.map((kpi, index) => (
              <motion.div
                key={kpi.id}
                variants={fadeInUp}
                className="relative"
              >
                <div className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${getStatusColor(kpi.status)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getKPIIcon(kpi.category)}
                      <span className="text-sm font-medium text-muted-foreground">
                        {kpi.title}
                      </span>
                    </div>
                    {getTrendIcon(kpi.trend, kpi.change)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold">
                        {kpi.value.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {kpi.unit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <span className={`text-sm font-medium ${
                          kpi.change > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                        </span>
                        <span className="text-xs text-muted-foreground">vs last month</span>
                      </div>
                      
                      {kpi.target && (
                        <div className="text-xs text-muted-foreground">
                          Target: {kpi.target.toLocaleString()} {kpi.unit}
                        </div>
                      )}
                    </div>

                    {kpi.target && (
                      <div className="space-y-1">
                        <Progress 
                          value={Math.min((kpi.value / kpi.target) * 100, 100)} 
                          className="h-2"
                        />
                        <div className="text-xs text-muted-foreground text-right">
                          {((kpi.value / kpi.target) * 100).toFixed(0)}% of target
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassmorphismCard>
      </motion.div>

      {/* Strategic Goals Progress */}
      <motion.div variants={fadeInUp}>
        <GlassmorphismCard variant="light" className="p-6">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-primary" />
            Net Zero Progress Tracker
          </h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600">34%</div>
                <div className="text-sm text-muted-foreground">Progress to Net Zero</div>
                <Progress value={34} className="mt-2 h-2" />
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">2030</div>
                <div className="text-sm text-muted-foreground">Target Year</div>
                <div className="text-xs mt-1">6 years remaining</div>
              </div>
              
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">66%</div>
                <div className="text-sm text-muted-foreground">Reduction Required</div>
                <div className="text-xs mt-1">16,200 tCO₂e</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">2024 Annual Reduction Target</span>
                <span className="text-sm text-muted-foreground">2,450 tCO₂e</span>
              </div>
              <Progress value={68} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1,666 tCO₂e achieved</span>
                <span>68% complete</span>
              </div>
            </div>
          </div>
        </GlassmorphismCard>
      </motion.div>
    </motion.div>
  );
};

export default ExecutiveCommandCenter;