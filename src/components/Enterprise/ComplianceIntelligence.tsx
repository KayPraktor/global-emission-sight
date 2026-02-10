import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  Bell,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';
import { RegulatoryUpdateDialog } from './RegulatoryUpdateDialog';

interface RegulatoryUpdate {
  id: string;
  title: string;
  impact: string;
  date: string;
  description: string;
  action: string;
  deadline: string;
}

interface ComplianceIntelligenceProps {
  frameworks: any[];
  deadlines: any[];
}

const ComplianceIntelligence: React.FC<ComplianceIntelligenceProps> = ({ frameworks, deadlines }) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedUpdate, setSelectedUpdate] = useState<RegulatoryUpdate | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const handleFrameworkClick = (framework: any) => {
    toast.info(`Opening ${framework.framework_name} documentation`, {
      description: 'View detailed requirements and progress'
    });
    navigate('/reports');
  };

  const handleDeadlineClick = (deadline: any) => {
    toast.info(`Opening ${deadline.title}`, {
      description: 'View deadline details and requirements'
    });
    navigate('/reports');
  };

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
      {/* Compliance Score Dashboard */}
      <motion.div variants={fadeInUp}>
        <GlassmorphismCard variant="light" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-semibold">Framework Compliance Overview</h4>
            <Button variant="outline" size="sm" onClick={() => { toast.info('Navigating to reports'); navigate('/reports'); }}>
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {frameworks.length === 0 ? (
              <div className="col-span-4 text-center p-8 text-muted-foreground">
                No compliance frameworks configured. They will be automatically initialized.
              </div>
            ) : frameworks.map((framework, index) => (
              <TooltipProvider key={framework.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      variants={fadeInUp}
                      whileHover={{ scale: 1.05 }}
                      className="cursor-pointer"
                      onClick={() => handleFrameworkClick(framework)}
                    >
                      <div className={`p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${getFrameworkColor(framework.status)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span className="font-medium text-sm">{framework.framework_name}</span>
                    </div>
                    <Badge className={`text-xs font-bold ${getScoreColor(framework.score || 'N/A')}`}>
                      {framework.score || 'N/A'}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Completeness</span>
                      <span className="text-xs font-medium">{framework.completeness_percentage || 0}%</span>
                    </div>
                    <Progress value={framework.completeness_percentage || 0} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Risk Level</span>
                      <span className={`text-xs font-medium ${getRiskColor(framework.risk_level || 'medium')}`}>
                        {(framework.risk_level || 'medium').toUpperCase()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Annual Cost</span>
                      <span className="text-xs font-medium">${(framework.estimated_cost || 0).toLocaleString()}</span>
                    </div>

                    {framework.next_deadline && (
                      <div className="text-xs text-muted-foreground">
                        Next: {new Date(framework.next_deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Click to view compliance reports and framework documentation</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
                    {deadlines.length === 0 ? (
                      <div className="text-center p-8 text-muted-foreground">
                        No upcoming deadlines found
                      </div>
                    ) : deadlines.slice(0, 6).map((deadline, index) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg cursor-pointer hover:shadow-md transition-all group relative"
                              onClick={() => handleDeadlineClick(deadline)}
                            >
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="w-3 h-3 text-primary" />
                        </div>
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
                              Due: {new Date(deadline.due_date).toLocaleDateString()}
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
                            {deadline.completion_percentage || 0}% complete
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">Click to view compliance reports and deadline details</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
                <Button variant="outline" size="sm" onClick={() => toast.success('Subscribed to regulatory updates', { description: 'You will receive notifications when new regulations are published.' })}>
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
                      <Button variant="outline" size="sm" onClick={() => { setSelectedUpdate(update); setReviewDialogOpen(true); }}>
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
                {frameworks.map((framework, index) => (
                  <div key={framework.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="font-medium">{framework.framework_name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${(framework.estimated_cost || 0).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">
                        Annual cost
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassmorphismCard>
          </TabsContent>
        </Tabs>
      </motion.div>

      <RegulatoryUpdateDialog
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
        update={selectedUpdate}
      />
    </motion.div>
  );
};

export default ComplianceIntelligence;