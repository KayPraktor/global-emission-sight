import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar,
  User,
  ExternalLink,
  Filter,
  SortAsc,
  SortDesc,
  Loader2
} from 'lucide-react';
import { getFiduciaryDuties, FiduciaryDuty } from '@/services/boardReportingService';
import { ProfessionalPDFGenerator, BrandingConfig } from '@/services/professionalPDFGenerator';
import { motion } from 'framer-motion';
import { format, isPast, isWithinInterval, addDays } from 'date-fns';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const statusConfig = {
  completed: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-200 dark:border-green-800' },
  in_progress: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800' },
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-200 dark:border-amber-800' },
  overdue: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-200 dark:border-red-800' },
};

const priorityConfig = {
  critical: { color: 'bg-red-500', label: 'Critical' },
  high: { color: 'bg-orange-500', label: 'High' },
  medium: { color: 'bg-amber-500', label: 'Medium' },
  low: { color: 'bg-green-500', label: 'Low' },
};

const categoryLabels: Record<string, string> = {
  disclosure: 'Disclosure',
  risk_oversight: 'Risk Oversight',
  strategic_planning: 'Strategic Planning',
  stakeholder_engagement: 'Stakeholder Engagement',
  compliance: 'Compliance',
};

const DutyCard: React.FC<{ duty: FiduciaryDuty }> = ({ duty }) => {
  const dueDate = new Date(duty.dueDate);
  const isOverdue = duty.status !== 'completed' && isPast(dueDate);
  const isDueSoon = !isOverdue && isWithinInterval(dueDate, { start: new Date(), end: addDays(new Date(), 14) });
  const effectiveStatus = isOverdue ? 'overdue' : duty.status;
  const status = statusConfig[effectiveStatus];
  const StatusIcon = status.icon;
  const priority = priorityConfig[duty.priority];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-lg border ${status.border} bg-card`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <StatusIcon className={`h-4 w-4 ${status.color}`} />
            <h4 className="font-semibold">{duty.title}</h4>
            <Badge variant="outline" className={`${status.bg} text-xs`}>{effectiveStatus.replace('_', ' ')}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{duty.description}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="secondary" className="text-xs">{categoryLabels[duty.category]}</Badge>
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${priority.color}`} />
              {priority.label}
            </Badge>
          </div>
          {duty.linkedRegulations.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {duty.linkedRegulations.map((reg, i) => (
                <Badge key={i} variant="outline" className="text-xs bg-muted/50">{reg}</Badge>
              ))}
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className={`flex items-center gap-1.5 ${isDueSoon ? 'text-amber-600' : isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">{format(dueDate, 'MMM d, yyyy')}</span>
          </div>
          {duty.assignedTo && (
            <div className="flex items-center gap-1.5 mt-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="text-xs">{duty.assignedTo}</span>
            </div>
          )}
          {duty.completedDate && (
            <div className="mt-2 text-xs text-green-600">
              Completed: {format(new Date(duty.completedDate), 'MMM d')}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const FiduciaryDutyTracker: React.FC = () => {
  const duties = getFiduciaryDuties();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<'priority' | 'date'>('priority');

  const getDutyStatus = (duty: FiduciaryDuty) => {
    if (duty.status === 'completed') return 'completed';
    if (isPast(new Date(duty.dueDate))) return 'overdue';
    return duty.status;
  };

  const statusCounts = {
    all: duties.length,
    completed: duties.filter(d => getDutyStatus(d) === 'completed').length,
    in_progress: duties.filter(d => getDutyStatus(d) === 'in_progress').length,
    pending: duties.filter(d => getDutyStatus(d) === 'pending').length,
    overdue: duties.filter(d => getDutyStatus(d) === 'overdue').length,
  };

  const completionRate = (statusCounts.completed / duties.length) * 100;

  // Apply status tab filter
  let filteredDuties = activeTab === 'all' ? duties : duties.filter(d => getDutyStatus(d) === activeTab);

  // Apply category filter
  if (selectedCategories.length > 0) {
    filteredDuties = filteredDuties.filter(d => selectedCategories.includes(d.category));
  }

  // Sort
  const sortedDuties = [...filteredDuties].sort((a, b) => {
    if (sortMode === 'priority') {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const handleExportReport = () => {
    setIsExporting(true);
    try {
      const branding: BrandingConfig = {
        companyName: 'Your Company',
        primaryColor: '#2563eb',
        secondaryColor: '#7c3aed',
        footerText: 'Confidential — Generated by Baryon ESG Platform',
      };
      const pdf = new ProfessionalPDFGenerator(branding);
      pdf.createCoverPage('Fiduciary Duty Report', 'Board Climate Obligations', format(new Date(), 'MMMM yyyy'), 'Governance Report');
      pdf.addSection('Fiduciary Duties Overview');
      pdf.addKeyValueSection([
        { label: 'Total Duties', value: String(duties.length) },
        { label: 'Completed', value: String(statusCounts.completed), highlight: true },
        { label: 'In Progress', value: String(statusCounts.in_progress) },
        { label: 'Overdue', value: String(statusCounts.overdue), highlight: statusCounts.overdue > 0 },
        { label: 'Completion Rate', value: `${Math.round(completionRate)}%`, highlight: true },
      ]);
      pdf.addSection('All Duties');
      pdf.addTable(
        ['Title', 'Category', 'Status', 'Priority', 'Due Date', 'Assigned To', 'Regulations'],
        duties.map(d => [
          d.title,
          categoryLabels[d.category],
          getDutyStatus(d).replace('_', ' '),
          d.priority,
          format(new Date(d.dueDate), 'MMM d, yyyy'),
          d.assignedTo || '—',
          d.linkedRegulations.join(', '),
        ]),
      );
      pdf.finalize(`fiduciary-duties-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
      toast.success('Report exported', { description: 'Fiduciary duties PDF downloaded.' });
    } catch (e) {
      toast.error('Export failed', { description: String(e) });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { key: 'all', label: 'Total Duties', count: statusCounts.all, color: 'text-primary' },
          { key: 'completed', label: 'Completed', count: statusCounts.completed, color: 'text-green-600' },
          { key: 'in_progress', label: 'In Progress', count: statusCounts.in_progress, color: 'text-blue-600' },
          { key: 'pending', label: 'Pending', count: statusCounts.pending, color: 'text-amber-600' },
          { key: 'overdue', label: 'Overdue', count: statusCounts.overdue, color: 'text-red-600' },
        ].map((stat) => (
          <Card
            key={stat.key}
            className={`cursor-pointer transition-all ${activeTab === stat.key ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}
            onClick={() => setActiveTab(stat.key)}
          >
            <CardContent className="p-4 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Fiduciary Duty Completion</CardTitle>
          <CardDescription>Overall progress on board climate fiduciary obligations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Progress value={completionRate} className="flex-1 h-3" />
            <span className="text-lg font-bold text-primary">{Math.round(completionRate)}%</span>
          </div>
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>{statusCounts.completed} of {statusCounts.all} duties completed</span>
            <span className="text-amber-600">{statusCounts.overdue > 0 && `${statusCounts.overdue} overdue`}</span>
          </div>
        </CardContent>
      </Card>

      {/* Duties List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fiduciary Duties</CardTitle>
              <CardDescription>Board-level climate responsibilities and obligations</CardDescription>
            </div>
            <div className="flex gap-2">
              {/* Category Filter Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-1" />
                    Filter
                    {selectedCategories.length > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5">{selectedCategories.length}</Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 bg-background z-50" align="end">
                  <div className="space-y-1">
                    <p className="text-sm font-medium mb-2">Filter by Category</p>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 py-1 cursor-pointer hover:bg-muted/50 rounded px-1">
                        <Checkbox
                          checked={selectedCategories.includes(key)}
                          onCheckedChange={() => toggleCategory(key)}
                        />
                        <span className="text-sm">{label}</span>
                      </label>
                    ))}
                    {selectedCategories.length > 0 && (
                      <Button variant="ghost" size="sm" className="w-full mt-2" onClick={() => setSelectedCategories([])}>
                        Clear filters
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Sort Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const next = sortMode === 'priority' ? 'date' : 'priority';
                  setSortMode(next);
                  toast.info(`Sorted by ${next === 'priority' ? 'priority' : 'due date'}`);
                }}
              >
                {sortMode === 'priority' ? <SortAsc className="h-4 w-4 mr-1" /> : <SortDesc className="h-4 w-4 mr-1" />}
                {sortMode === 'priority' ? 'Priority' : 'Due Date'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedDuties.length > 0 ? (
              sortedDuties.map((duty) => <DutyCard key={duty.id} duty={duty} />)
            ) : (
              <div className="text-center py-8 text-muted-foreground">No duties found for this filter</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="justify-start" onClick={() => toast.info('Schedule Review', { description: 'This feature requires team member management to be configured.' })}>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Review
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => toast.info('Assign Duty', { description: 'This feature requires team member management to be configured.' })}>
              <User className="h-4 w-4 mr-2" />
              Assign Duty
            </Button>
            <Button variant="outline" className="justify-start" disabled={isExporting} onClick={handleExportReport}>
              {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ExternalLink className="h-4 w-4 mr-2" />}
              Export Report
            </Button>
            <Button variant="outline" className="justify-start" onClick={() => navigate('/analytics')}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Risk Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
