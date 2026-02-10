import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  FileText, 
  Target,
  TrendingUp,
  Shield,
  Download,
  RefreshCw,
  ChevronRight,
  Info,
  Loader2
} from 'lucide-react';
import { csrdComplianceService } from '@/services/csrdComplianceService';
import { ProfessionalPDFGenerator, BrandingConfig } from '@/services/professionalPDFGenerator';
import { 
  DisclosureStatus, 
  DataGap, 
  ComplianceReadiness,
  ESRS_E1_DISCLOSURES 
} from '@/types/esrs-compliance';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

const CSRDDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [disclosures, setDisclosures] = useState<DisclosureStatus[]>([]);
  const [dataGaps, setDataGaps] = useState<DataGap[]>([]);
  const [readiness, setReadiness] = useState<ComplianceReadiness | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadComplianceData();
  }, [user]);

  const loadComplianceData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // For now, use user.id as org ID (would need proper org context in production)
      const orgId = user.id;
      
      const [complianceResult, gaps, readinessScore] = await Promise.all([
        csrdComplianceService.analyzeESRSCompliance(orgId),
        csrdComplianceService.generateDataGapReport(orgId),
        csrdComplianceService.calculateReadinessScore(orgId),
      ]);

      setDisclosures(complianceResult.disclosures);
      setDataGaps(gaps);
      setReadiness(readinessScore);
    } catch (error) {
      console.error('Error loading compliance data:', error);
      toast.error('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_progress':
      case 'review':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'draft':
        return <FileText className="h-5 w-5 text-blue-500" />;
      default:
        return <XCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      complete: 'default',
      in_progress: 'secondary',
      review: 'secondary',
      draft: 'outline',
      not_started: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'outline'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high':
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default:
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CSRD Compliance Dashboard</h1>
          <p className="text-muted-foreground">
            ESRS E1 Climate Change Disclosure Requirements
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadComplianceData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button size="sm" disabled={!readiness} onClick={async () => {
            toast.loading('Generating CSRD report...', { id: 'csrd-export' });
            try {
              const branding: BrandingConfig = {
                companyName: 'Your Company',
                primaryColor: '#2563eb',
                secondaryColor: '#7c3aed',
                footerText: 'Confidential — Generated by Baryon ESG Platform',
              };
              const pdf = new ProfessionalPDFGenerator(branding);
              pdf.createCoverPage('CSRD Compliance Report', 'ESRS E1 Climate Change', format(new Date(), 'MMMM yyyy'), 'Compliance Report');

              pdf.addSection('Readiness Summary');
              pdf.addMetricsRow([
                { label: 'Overall Readiness', value: `${readiness?.overallScore || 0}%`, change: readiness && readiness.overallScore >= 60 ? 'On Track' : 'At Risk', changeType: readiness && readiness.overallScore >= 60 ? 'positive' : 'negative' },
                { label: 'Disclosures Complete', value: `${disclosures.filter(d => d.status === 'complete').length}/${disclosures.length}` },
                { label: 'Critical Gaps', value: String(dataGaps.filter(g => g.severity === 'critical').length) },
              ]);

              pdf.addSection('Disclosure Checklist');
              pdf.addTable(
                ['ID', 'Disclosure', 'Status', 'Completeness %', 'Data Quality %'],
                disclosures.map(d => [
                  d.disclosureId,
                  d.disclosureName,
                  d.status.replace('_', ' '),
                  `${d.completenessScore}%`,
                  `${d.dataQualityScore}%`,
                ]),
              );

              if (dataGaps.length > 0) {
                pdf.addSection('Data Gaps');
                pdf.addTable(
                  ['Disclosure', 'Description', 'Severity', 'Recommendation', 'Effort'],
                  dataGaps.map(g => [g.disclosureId, g.description, g.severity, g.recommendation, g.estimatedEffort]),
                );
              }

              if (readiness?.timeline) {
                pdf.addSection('Compliance Timeline');
                pdf.addTable(
                  ['Milestone', 'Due Date', 'Status'],
                  readiness.timeline.map(m => [m.milestone, m.dueDate, m.status.replace('_', ' ')]),
                );
              }

              if (readiness?.recommendations && readiness.recommendations.length > 0) {
                pdf.addSection('Recommendations');
                readiness.recommendations.forEach(rec => pdf.addParagraph(`• ${rec}`));
              }

              pdf.finalize(`csrd-compliance-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
              toast.success('CSRD report exported', { id: 'csrd-export', description: 'PDF downloaded successfully.' });
            } catch (e) {
              toast.error('Export failed', { id: 'csrd-export', description: String(e) });
            }
          }}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Overall Readiness</CardDescription>
            <CardTitle className={`text-3xl ${getScoreColor(readiness?.overallScore || 0)}`}>
              {readiness?.overallScore || 0}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={readiness?.overallScore || 0} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Disclosures Complete</CardDescription>
            <CardTitle className="text-3xl">
              {disclosures.filter(d => d.status === 'complete').length}/{disclosures.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              {disclosures.filter(d => d.status === 'in_progress').length} in progress
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Critical Gaps</CardDescription>
            <CardTitle className="text-3xl text-red-500">
              {dataGaps.filter(g => g.severity === 'critical').length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              {dataGaps.filter(g => g.severity === 'high').length} high priority
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Next Milestone</CardDescription>
            <CardTitle className="text-lg">
              {readiness?.timeline?.[0]?.milestone || 'Data Collection'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Due: {readiness?.timeline?.[0]?.dueDate || 'TBD'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">
            <Target className="h-4 w-4 mr-2" />
            Disclosures
          </TabsTrigger>
          <TabsTrigger value="gaps">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Data Gaps
          </TabsTrigger>
          <TabsTrigger value="roadmap">
            <TrendingUp className="h-4 w-4 mr-2" />
            Roadmap
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>ESRS E1 Disclosure Checklist</CardTitle>
              <CardDescription>
                Track your progress against each required disclosure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ESRS_E1_DISCLOSURES.map((disclosure) => {
                  const status = disclosures.find(d => d.disclosureId === disclosure.id);
                  return (
                    <div 
                      key={disclosure.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {getStatusIcon(status?.status || 'not_started')}
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {disclosure.id}: {disclosure.name}
                            {disclosure.required && (
                              <Badge variant="outline" className="text-xs">Required</Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Completeness: {status?.completenessScore || 0}% • 
                            Data Quality: {status?.dataQualityScore || 0}%
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(status?.status || 'not_started')}
                        <Button variant="ghost" size="sm">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gaps" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Gap Analysis</CardTitle>
              <CardDescription>
                Issues that need to be resolved for full compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dataGaps.length === 0 ? (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>No critical gaps detected</AlertTitle>
                  <AlertDescription>
                    Your data appears to be in good shape for CSRD compliance.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {dataGaps.map((gap) => (
                    <div 
                      key={gap.id}
                      className={`p-4 border rounded-lg ${getSeverityColor(gap.severity)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{gap.disclosureId}</Badge>
                            <span className="font-medium">{gap.description}</span>
                          </div>
                          <p className="text-sm mt-2 opacity-80">
                            {gap.recommendation}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-sm">
                            <span className="flex items-center gap-1">
                              <Shield className="h-4 w-4" />
                              {gap.gapType.replace('_', ' ')}
                            </span>
                            <span>Effort: {gap.estimatedEffort}</span>
                          </div>
                        </div>
                        <Badge 
                          variant={gap.severity === 'critical' ? 'destructive' : 'secondary'}
                        >
                          {gap.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roadmap" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Timeline</CardTitle>
              <CardDescription>
                Key milestones for CSRD readiness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {readiness?.timeline?.map((milestone, index) => (
                  <div key={index} className="flex gap-4 pb-8 last:pb-0">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        milestone.status === 'completed' ? 'bg-green-500' :
                        milestone.status === 'on_track' ? 'bg-blue-500' :
                        milestone.status === 'at_risk' ? 'bg-orange-500' :
                        'bg-muted'
                      }`} />
                      {index < (readiness?.timeline?.length || 0) - 1 && (
                        <div className="w-0.5 h-full bg-border mt-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{milestone.milestone}</h4>
                        <Badge variant={
                          milestone.status === 'completed' ? 'default' :
                          milestone.status === 'on_track' ? 'secondary' :
                          milestone.status === 'at_risk' ? 'destructive' :
                          'outline'
                        }>
                          {milestone.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Due: {milestone.dueDate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {readiness?.recommendations && readiness.recommendations.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {readiness.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ChevronRight className="h-4 w-4 mt-1 text-primary" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CSRDDashboard;
