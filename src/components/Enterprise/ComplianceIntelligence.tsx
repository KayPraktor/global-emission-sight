import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  FileText,
  Users,
  DollarSign,
  Calendar as CalendarIcon,
  Target,
  Activity,
  Award,
  Bell
} from 'lucide-react';

interface ComplianceDeadline {
  id: string;
  title: string;
  framework: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  completionPercentage: number;
  estimatedCost: number;
  assignee: string;
  riskLevel: number;
}

interface ComplianceIntelligenceProps {
  deadlines: any[];
}

const ComplianceIntelligence: React.FC<ComplianceIntelligenceProps> = ({ deadlines }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Enhanced compliance data
  const complianceFrameworks = [
    {
      id: 'cdp',
      name: 'CDP Climate Change',
      score: 'A-',
      status: 'compliant',
      nextDeadline: '2024-07-31',
      riskLevel: 'low',
      cost: 45000,
      completeness: 92
    },
    {
      id: 'tcfd',
      name: 'TCFD Reporting',
      score: 'B+',
      status: 'in-progress',
      nextDeadline: '2024-06-15',
      riskLevel: 'medium',
      cost: 78000,
      completeness: 67
    },
    {
      id: 'csrd',
      name: 'EU CSRD',
      score: 'B',
      status: 'pending',
      nextDeadline: '2024-12-31',
      riskLevel: 'high',
      cost: 125000,
      completeness: 34
    },
    {
      id: 'sbti',
      name: 'SBTi Validation',
      score: 'A',
      status: 'compliant',
      nextDeadline: '2025-03-15',
      riskLevel: 'low',
      cost: 32000,
      completeness: 100
    }
  ];

  const regulatoryUpdates = [
    {
      id: 'reg-001',
      title: 'EU Taxonomy Updated Guidelines',
      impact: 'high',
      date: '2024-05-15',
      description: 'New technical screening criteria for climate adaptation activities',
      action: 'Review portfolio alignment',
      deadline: '2024-08-15'
    },
    {
      id: 'reg-002',
      title: 'SEC Climate Disclosure Rules',
      impact: 'medium',
      date: '2024-04-20',
      description: 'Final rules on climate-related disclosures for public companies',
      action: 'Update reporting framework',
      deadline: '2024-10-01'
    },
    {
      id: 'reg-003',
      title: 'ISSB Standards Implementation',
      impact: 'high',
      date: '2024-03-10',
      description: 'International sustainability reporting standards effective',
      action: 'Align reporting methodology',
      deadline: '2024-12-31'
    }
  ];

  const getFrameworkColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'overdue': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-amber-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getScoreColor = (score: string) => {
    if (score.startsWith('A')) return 'text-green-600 bg-green-50';
    if (score.startsWith('B')) return 'text-blue-600 bg-blue-50';
    if (score.startsWith('C')) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
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
              <div className="p-2 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Compliance Intelligence</h3>
                <p className="text-muted-foreground">
                  AI-powered regulatory monitoring and compliance optimization
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                87% Compliant
              </Badge>
            </div>
          </div>
        </GlassmorphismCard>
      </motion.div>

      {/* Compliance Score Dashboard */}
      <motion.div variants={fadeInUp}>
        <GlassmorphismCard variant="light" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold">Framework Compliance Overview</h4>
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {complianceFrameworks.map((framework, index) => (
              <motion.div
                key={framework.id}
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
              >
                <div className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${getFrameworkColor(framework.status)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span className="font-medium text-sm">{framework.name}</span>
                    </div>
                    <Badge className={`text-xs font-bold ${getScoreColor(framework.score)}`}>
                      {framework.score}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Completeness</span>
                      <span className="text-xs font-medium">{framework.completeness}%</span>
                    </div>
                    <Progress value={framework.completeness} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Risk Level</span>
                      <span className={`text-xs font-medium ${getRiskColor(framework.riskLevel)}`}>
                        {framework.riskLevel.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Annual Cost</span>
                      <span className="text-xs font-medium">${framework.cost.toLocaleString()}</span>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Next: {new Date(framework.nextDeadline).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassmorphismCard>
      </motion.div>

      {/* Detailed Analysis */}
      <motion.div variants={fadeInUp}>
        <Tabs defaultValue="deadlines" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="deadlines">Upcoming Deadlines</TabsTrigger>
            <TabsTrigger value="regulatory">Regulatory Updates</TabsTrigger>
            <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
            <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="deadlines">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <GlassmorphismCard variant="light" className="p-6">
                  <h4 className="text-lg font-semibold mb-4">Critical Deadlines</h4>
                  <div className="space-y-4">
                    {deadlines.slice(0, 6).map((deadline, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            deadline.priority === 'critical' ? 'bg-red-500' :
                            deadline.priority === 'high' ? 'bg-amber-500' :
                            deadline.priority === 'medium' ? 'bg-blue-500' : 'bg-gray-500'
                          }`}>
                            <Clock className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-medium">{deadline.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {deadline.framework} • Due: {new Date(deadline.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className={`text-xs ${
                            deadline.status === 'completed' ? 'bg-green-100 text-green-800' :
                            deadline.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {deadline.status}
                          </Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {deadline.completionPercentage}% complete
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassmorphismCard>
              </div>

              <div>
                <GlassmorphismCard variant="light" className="p-6">
                  <h4 className="text-lg font-semibold mb-4">Compliance Calendar</h4>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                  <div className="mt-4 space-y-2">
                    <div className="text-sm font-medium">Today's Tasks</div>
                    <div className="text-xs text-muted-foreground">
                      • Review CDP water disclosure draft
                    </div>
                    <div className="text-xs text-muted-foreground">
                      • Submit TCFD scenario analysis
                    </div>
                  </div>
                </GlassmorphismCard>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="regulatory">
            <GlassmorphismCard variant="light" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold">Regulatory Intelligence</h4>
                <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4 mr-2" />
                  Subscribe to Updates
                </Button>
              </div>

              <div className="space-y-4">
                {regulatoryUpdates.map((update, index) => (
                  <div key={update.id} className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h5 className="font-semibold">{update.title}</h5>
                          <Badge className={`text-xs ${
                            update.impact === 'high' ? 'bg-red-100 text-red-800' :
                            update.impact === 'medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {update.impact.toUpperCase()} IMPACT
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {update.description}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Published: {new Date(update.date).toLocaleDateString()}</span>
                          <span>Action Required: {update.action}</span>
                          <span>Deadline: {new Date(update.deadline).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassmorphismCard>
          </TabsContent>

          <TabsContent value="risks">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassmorphismCard variant="light" className="p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
                  Risk Assessment Matrix
                </h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium mb-4">
                    <div></div>
                    <div className="text-green-600">Low Impact</div>
                    <div className="text-red-600">High Impact</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-xs font-medium text-red-600 flex items-center">High Probability</div>
                    <div className="h-12 bg-amber-200 rounded flex items-center justify-center text-xs">Medium Risk</div>
                    <div className="h-12 bg-red-200 rounded flex items-center justify-center text-xs">Critical Risk</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-xs font-medium text-green-600 flex items-center">Low Probability</div>
                    <div className="h-12 bg-green-200 rounded flex items-center justify-center text-xs">Low Risk</div>
                    <div className="h-12 bg-amber-200 rounded flex items-center justify-center text-xs">Medium Risk</div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Regulatory Non-compliance</span>
                    <Badge className="bg-red-100 text-red-800">Critical</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Data Quality Issues</span>
                    <Badge className="bg-amber-100 text-amber-800">Medium</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Reporting Delays</span>
                    <Badge className="bg-amber-100 text-amber-800">Medium</Badge>
                  </div>
                </div>
              </GlassmorphismCard>

              <GlassmorphismCard variant="light" className="p-6">
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-500" />
                  Mitigation Strategies
                </h4>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-sm">Automated Monitoring</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Real-time tracking of compliance deadlines and requirements
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-sm">Expert Advisory</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Access to regulatory experts and compliance specialists
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="w-4 h-4 text-purple-600" />
                      <span className="font-medium text-sm">Continuous Improvement</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Regular process optimization and framework updates
                    </p>
                  </div>
                </div>
              </GlassmorphismCard>
            </div>
          </TabsContent>

          <TabsContent value="costs">
            <GlassmorphismCard variant="light" className="p-6">
              <h4 className="text-lg font-semibold mb-6">Compliance Cost Analysis</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">$280K</div>
                  <div className="text-sm text-muted-foreground">Annual Compliance Cost</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">$45K</div>
                  <div className="text-sm text-muted-foreground">Saved Through Automation</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">$125K</div>
                  <div className="text-sm text-muted-foreground">Risk Exposure Value</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">92%</div>
                  <div className="text-sm text-muted-foreground">Cost Efficiency</div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="font-medium">Cost Breakdown by Framework</h5>
                {complianceFrameworks.map((framework, index) => (
                  <div key={framework.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="font-medium">{framework.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${framework.cost.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        {((framework.cost / 280000) * 100).toFixed(0)}% of total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassmorphismCard>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
};

export default ComplianceIntelligence;