import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  FileText, 
  Shield, 
  ClipboardCheck,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  Plus
} from 'lucide-react';
import { GovernanceScorecard } from './GovernanceScorecard';
import { FiduciaryDutyTracker } from './FiduciaryDutyTracker';
import { ExecutiveReportBuilder } from './ExecutiveReportBuilder';
import { 
  getGovernanceMetrics, 
  getFiduciaryDuties, 
  calculateGovernanceScore,
  getExecutiveSummary 
} from '@/services/boardReportingService';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { isPast } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const BoardReportDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { organization } = useAuth();
  const navigate = useNavigate();
  const orgId = organization?.id;

  const { data: metrics = [], isLoading: loadingMetrics } = useQuery({
    queryKey: ['governance-metrics', orgId],
    queryFn: () => getGovernanceMetrics(orgId!),
    enabled: !!orgId,
  });

  const { data: duties = [], isLoading: loadingDuties } = useQuery({
    queryKey: ['fiduciary-duties', orgId],
    queryFn: () => getFiduciaryDuties(orgId!),
    enabled: !!orgId,
  });

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['board-executive-summary', orgId],
    queryFn: () => getExecutiveSummary(orgId!),
    enabled: !!orgId,
  });

  const isLoading = loadingMetrics || loadingDuties || loadingSummary;

  const { overall, rating } = calculateGovernanceScore(metrics);

  const completedDuties = duties.filter(d => d.status === 'completed').length;
  const overdueDuties = duties.filter(d => 
    d.status !== 'completed' && isPast(new Date(d.dueDate))
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasMetrics = metrics.length > 0;
  const hasDuties = duties.length > 0;
  const hasData = hasMetrics || hasDuties;

  // Empty state
  if (!hasData) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Board Reporting Data Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Set up governance metrics and fiduciary duties to start tracking board-level sustainability oversight.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => setActiveTab('governance')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Governance Metrics
            </Button>
            <Button variant="outline" onClick={() => setActiveTab('duties')}>
              <Plus className="h-4 w-4 mr-2" />
              Add Fiduciary Duties
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const quickStats = [
    {
      title: 'Governance Score',
      value: hasMetrics ? `${Math.round(overall)}%` : '—',
      subtitle: hasMetrics ? rating : 'No metrics',
      icon: Shield,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Emissions',
      value: summary?.currentEmissions.total 
        ? `${(summary.currentEmissions.total / 1000).toFixed(1)}k`
        : '—',
      subtitle: summary?.currentEmissions.change 
        ? `${summary.currentEmissions.change}% YoY`
        : 'No data',
      icon: TrendingDown,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Fiduciary Duties',
      value: hasDuties ? `${completedDuties}/${duties.length}` : '—',
      subtitle: overdueDuties > 0 ? `${overdueDuties} overdue` : 'On track',
      icon: ClipboardCheck,
      color: overdueDuties > 0 ? 'text-amber-600' : 'text-green-600',
      bgColor: overdueDuties > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-green-100 dark:bg-green-900/30',
    },
    {
      title: 'Recent Reports',
      value: summary?.recentReports?.length?.toString() || '0',
      subtitle: 'Board reports',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Actions Alert */}
      {overdueDuties > 0 && (
        <Card className="border-amber-300 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  {overdueDuties} Overdue Fiduciary {overdueDuties === 1 ? 'Duty' : 'Duties'}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Review and address overdue board obligations to maintain compliance
                </p>
              </div>
              <Button variant="outline" size="sm" className="shrink-0" onClick={() => setActiveTab('duties')}>
                Review Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-2">
            <FileText className="h-4 w-4" />
            Executive Reports
          </TabsTrigger>
          <TabsTrigger value="governance" className="gap-2">
            <Shield className="h-4 w-4" />
            Governance Scorecard
          </TabsTrigger>
          <TabsTrigger value="duties" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Fiduciary Duties
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Reports */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Recent Board Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary?.recentReports && summary.recentReports.length > 0 ? (
                  <div className="space-y-3">
                    {summary.recentReports.map((report, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div>
                          <p className="font-medium text-sm">{report.title}</p>
                          <p className="text-xs text-muted-foreground">{report.date}</p>
                        </div>
                        <Badge variant="outline">{report.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No reports generated yet.</p>
                    <Button variant="link" size="sm" onClick={() => navigate('/reports')}>
                      Go to Reports →
                    </Button>
                  </div>
                )}
                <Button variant="ghost" className="w-full mt-4" size="sm" onClick={() => setActiveTab('reports')}>
                  View All Reports
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Governance Highlights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Governance Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasMetrics ? (
                  <div className="space-y-3">
                    {metrics.slice(0, 4).map((metric, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                        {metric.status === 'met' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : metric.status === 'partial' ? (
                          <Clock className="h-4 w-4 text-amber-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{metric.name}</p>
                          <p className="text-xs text-muted-foreground">{metric.description}</p>
                        </div>
                        <Badge variant="outline">
                          {metric.score}/{metric.maxScore}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No governance metrics configured yet.
                  </div>
                )}
                <Button variant="ghost" className="w-full mt-4" size="sm" onClick={() => setActiveTab('governance')}>
                  View Full Scorecard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Duties */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-primary" />
                  Upcoming Fiduciary Duties
                </CardTitle>
                <CardDescription>
                  Priority actions requiring board attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                {hasDuties ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {duties
                      .filter(d => d.status !== 'completed')
                      .slice(0, 6)
                      .map((duty, i) => (
                        <div 
                          key={i} 
                          className={`p-4 border rounded-lg ${
                            duty.priority === 'critical' 
                              ? 'border-red-200 bg-red-50/50 dark:bg-red-950/20' 
                              : duty.priority === 'high'
                              ? 'border-amber-200 bg-amber-50/50 dark:bg-amber-950/20'
                              : ''
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <Badge 
                              variant="outline" 
                              className={
                                duty.priority === 'critical' ? 'border-red-300 text-red-700' :
                                duty.priority === 'high' ? 'border-amber-300 text-amber-700' :
                                ''
                              }
                            >
                              {duty.priority}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Due: {new Date(duty.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <h5 className="font-medium text-sm mb-1">{duty.title}</h5>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {duty.description}
                          </p>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No fiduciary duties configured yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <ExecutiveReportBuilder />
        </TabsContent>

        <TabsContent value="governance">
          <GovernanceScorecard />
        </TabsContent>

        <TabsContent value="duties">
          <FiduciaryDutyTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
};
