import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb, 
  Target,
  DollarSign,
  Clock,
  ChevronRight,
  Sparkles,
  Activity,
  ExternalLink
} from 'lucide-react';
import { AIInsight } from '@/utils/enterpriseData';
import { toast } from 'sonner';

interface AIInsightsPanelProps {
  insights: AIInsight[];
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ insights }) => {
  const navigate = useNavigate();

  const getNavigationPath = (insight: AIInsight): string => {
    const category = insight.category.toLowerCase();
    
    if (category.includes('anomaly') || category.includes('detection')) {
      return '/advanced-analytics?tab=anomalies';
    } else if (category.includes('quality') || category.includes('validation')) {
      return '/advanced-analytics?tab=quality';
    } else if (category.includes('reduction') || category.includes('optimization')) {
      return '/data-entry';
    } else if (category.includes('compliance') || category.includes('reporting')) {
      return '/reports';
    } else if (category.includes('forecast') || category.includes('prediction')) {
      return '/advanced-analytics?tab=forecasts';
    }
    
    return '/advanced-analytics';
  };

  const handleInsightClick = (insight: AIInsight) => {
    const path = getNavigationPath(insight);
    toast.info(`Viewing ${insight.title}`, {
      description: 'Opening detailed analysis'
    });
    navigate(path);
  };
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'risk': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'anomaly': return <Activity className="w-5 h-5 text-amber-600" />;
      case 'recommendation': return <Lightbulb className="w-5 h-5 text-blue-600" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 80) return 'text-blue-600';
    if (confidence >= 70) return 'text-amber-600';
    return 'text-red-600';
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
      {/* Insights Grid */}
      <motion.div variants={fadeInUp}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              className="group cursor-pointer"
              onClick={() => handleInsightClick(insight)}
            >
              <GlassmorphismCard variant="light" className="p-6 h-full hover:shadow-xl transition-all duration-300 hover:border-primary/50 relative">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-4 h-4 text-primary" />
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getInsightIcon(insight.type)}
                    <div>
                      <h4 className="font-semibold text-base">{insight.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={`text-xs ${getPriorityColor(insight.priority)}`}>
                          {insight.priority.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {insight.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getConfidenceColor(insight.confidence)}`}>
                      {insight.confidence}%
                    </div>
                    <div className="text-xs text-muted-foreground">confidence</div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {insight.description}
                </p>

                {/* Impact Metrics */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {insight.impact.co2Reduction > 0 ? '-' : ''}{Math.abs(insight.impact.co2Reduction).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">tCO₂e</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {insight.impact.costSaving > 0 ? '$' : '-$'}{Math.abs(insight.impact.costSaving).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">savings</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">
                      {insight.impact.timeline}
                    </div>
                    <div className="text-xs text-muted-foreground">timeline</div>
                  </div>
                </div>

                {/* Confidence Indicator */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-muted-foreground">AI Confidence</span>
                    <span className={`text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                      {insight.confidence}%
                    </span>
                  </div>
                  <Progress value={insight.confidence} className="h-2" />
                </div>

                {/* Action Button */}
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInsightClick(insight);
                  }}
                >
                  View Details
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </GlassmorphismCard>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div variants={fadeInUp}>
        <GlassmorphismCard variant="light" className="p-6">
          <h4 className="text-lg font-semibold mb-4">AI Analysis Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {insights.filter(i => i.type === 'opportunity').length}
              </div>
              <div className="text-sm text-muted-foreground">Opportunities</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {insights.filter(i => i.type === 'risk').length}
              </div>
              <div className="text-sm text-muted-foreground">Risks</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
              <div className="text-2xl font-bold text-amber-600">
                {insights.filter(i => i.type === 'anomaly').length}
              </div>
              <div className="text-sm text-muted-foreground">Anomalies</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {insights.reduce((sum, i) => sum + i.impact.co2Reduction, 0).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Potential (tCO₂e)</div>
            </div>
          </div>
        </GlassmorphismCard>
      </motion.div>
    </motion.div>
  );
};

export default AIInsightsPanel;