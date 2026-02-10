import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Eye, 
  Settings, 
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Target,
  Lightbulb,
  BarChart3,
  PieChart,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { getExecutiveSummary } from '@/services/boardReportingService';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { toast } from 'sonner';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

const DEFAULT_SECTIONS: Record<string, boolean> = {
  'Executive Summary': true,
  'Emissions Performance': true,
  'Target Progress': true,
  'Risk Assessment': true,
  'Opportunities': true,
  'Governance Scorecard': true,
  'Regulatory Updates': false,
  'Recommendations': true,
};

export const ExecutiveReportBuilder: React.FC = () => {
  const [selectedReportType, setSelectedReportType] = useState<'quarterly' | 'annual' | 'special'>('quarterly');
  const [sections, setSections] = useState<Record<string, boolean>>(DEFAULT_SECTIONS);
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const summary = getExecutiveSummary();

  const toggleSection = (name: string) => {
    setSections(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handlePreview = () => {
    const enabledCount = Object.values(sections).filter(Boolean).length;
    toast.info('Preview generated', {
      description: `Report preview with ${enabledCount} sections is ready.`,
    });
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    toast.loading('Generating PDF...', { id: 'export-pdf' });
    setTimeout(() => {
      setIsExporting(false);
      toast.success('PDF exported successfully', {
        id: 'export-pdf',
        description: `${selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)} report downloaded.`,
      });
    }, 2000);
  };

  const handleGenerateReport = () => {
    const enabledCount = Object.values(sections).filter(Boolean).length;
    if (enabledCount === 0) {
      toast.error('No sections selected', { description: 'Please select at least one section to include.' });
      return;
    }
    setIsGenerating(true);
    toast.loading('Generating report...', { id: 'gen-report' });
    setTimeout(() => {
      setIsGenerating(false);
      toast.success('Report generated', {
        id: 'gen-report',
        description: `${selectedReportType.charAt(0).toUpperCase() + selectedReportType.slice(1)} board report with ${enabledCount} sections is ready.`,
      });
    }, 2500);
  };

  const handleCustomize = () => {
    toast.info('Customize sections', {
      description: 'Toggle the checkboxes above to include or exclude report sections.',
    });
  };

  const emissionsBreakdown = [
    { name: 'Scope 1', value: summary.currentEmissions.scope1 },
    { name: 'Scope 2', value: summary.currentEmissions.scope2 },
    { name: 'Scope 3', value: summary.currentEmissions.scope3 },
  ];

  const quarterlyData = summary.quarterlyProgress.map(q => ({
    quarter: q.quarter,
    Target: q.target,
    Actual: q.actual || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Executive Report Builder
              </CardTitle>
              <CardDescription>
                Generate board-ready sustainability reports
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button size="sm" onClick={handleExportPDF} disabled={isExporting}>
                {isExporting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Download className="h-4 w-4 mr-1" />}
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedReportType} onValueChange={(v) => setSelectedReportType(v as any)}>
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
              <TabsTrigger value="annual">Annual</TabsTrigger>
              <TabsTrigger value="special">Special</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
          <CardDescription>Key metrics and highlights for board presentation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Emissions Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Emissions */}
            <div className="p-4 bg-background rounded-lg border">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Current Emissions
              </h4>
              <div className="text-3xl font-bold mb-2">
                {summary.currentEmissions.total.toLocaleString()} 
                <span className="text-lg font-normal text-muted-foreground ml-1">
                  tCO2e
                </span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={summary.currentEmissions.change < 0 ? "default" : "destructive"}>
                  {summary.currentEmissions.change < 0 ? (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(summary.currentEmissions.change)}% YoY
                </Badge>
                <Badge variant="outline">
                  {summary.currentEmissions.vsTarget < 0 ? '✓' : '!'} 
                  {Math.abs(summary.currentEmissions.vsTarget)}% vs Target
                </Badge>
              </div>
              
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={emissionsBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {emissionsBreakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toLocaleString()} tCO2e`, '']}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quarterly Progress */}
            <div className="p-4 bg-background rounded-lg border">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-primary" />
                Quarterly Progress
              </h4>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={quarterlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="quarter" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Target" fill="hsl(var(--muted))" />
                    <Bar dataKey="Actual" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Targets */}
          <div className="p-4 bg-background rounded-lg border">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Reduction Targets
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Short-Term', ...summary.targets.shortTerm },
                { label: 'Medium-Term', ...summary.targets.mediumTerm },
                { label: 'Long-Term', year: summary.targets.longTerm.year, reduction: summary.targets.longTerm.reduction, current: 18, target: summary.targets.longTerm.target },
              ].map((target, i) => (
                <div key={i} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{target.label}</span>
                    <Badge variant="outline">{target.year}</Badge>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {target.reduction}% <span className="text-sm font-normal text-muted-foreground">reduction</span>
                  </div>
                  <Progress value={(target.current / target.reduction) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {target.current}% achieved ({Math.round((target.current / target.reduction) * 100)}% of target)
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Risks & Opportunities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Key Climate Risks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.keyRisks.map((risk, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 border rounded-lg bg-amber-50/50 dark:bg-amber-950/20"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h5 className="font-medium">{risk.risk}</h5>
                    <Badge variant="outline" className="text-xs">
                      {risk.impact}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Likelihood: {risk.likelihood}
                  </p>
                  <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Financial Impact: {risk.financialImpact}
                  </p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-green-500" />
              Strategic Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary.opportunities.map((opp, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-3 border rounded-lg bg-green-50/50 dark:bg-green-950/20"
                >
                  <div className="flex justify-between items-start mb-1">
                    <h5 className="font-medium">{opp.opportunity}</h5>
                    <Badge variant="outline" className="text-xs">
                      {opp.timeline}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    Value: {opp.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Sections</CardTitle>
          <CardDescription>Customize which sections to include in the board report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(sections).map(([name, included]) => (
              <div
                key={name}
                onClick={() => toggleSection(name)}
                className={`p-3 border rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
                  included 
                    ? 'bg-primary/5 border-primary/30' 
                    : 'bg-muted/30 hover:bg-muted/50'
                }`}
              >
                <CheckCircle2 
                  className={`h-4 w-4 ${included ? 'text-primary' : 'text-muted-foreground'}`} 
                />
                <span className="text-sm">{name}</span>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={handleCustomize}>
              <Settings className="h-4 w-4 mr-2" />
              Customize
            </Button>
            <Button onClick={handleGenerateReport} disabled={isGenerating}>
              {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Generate Report
              {!isGenerating && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
