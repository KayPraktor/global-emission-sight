import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Calendar, Clock, AlertTriangle, CheckCircle, FileCheck,
  Building2, Leaf, Fuel, Zap, HardHat, Factory, Wheat
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toPersianDate, getDaysRemainingPersian, formatComplianceDate } from '@/utils/persianDate';

interface ComplianceDeadline {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  priority: string;
  status: string;
  completion_percentage: number | null;
  framework_id: string | null;
  framework_name?: string;
  jurisdiction?: string;
}

// Iranian regulatory body mapping
const getIranRegulatoryBody = (frameworkName: string): { 
  name: string; 
  nameEn: string; 
  color: string; 
  icon: React.ReactNode 
} | null => {
  const name = frameworkName.toLowerCase();
  
  if (name.includes('محیط زیست') || name.includes('doe') || name.includes('eia')) {
    return { 
      name: 'سازمان محیط زیست', 
      nameEn: 'DOE', 
      color: 'bg-green-500/10 text-green-600 border-green-500/30', 
      icon: <Leaf className="h-3 w-3" /> 
    };
  }
  if (name.includes('صمت') || name.includes('mimt') || name.includes('industry')) {
    return { 
      name: 'وزارت صمت', 
      nameEn: 'MIMT', 
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', 
      icon: <Building2 className="h-3 w-3" /> 
    };
  }
  if (name.includes('نفت') || name.includes('nioc') || name.includes('petrochemical')) {
    return { 
      name: 'شرکت ملی نفت', 
      nameEn: 'NIOC', 
      color: 'bg-orange-500/10 text-orange-600 border-orange-500/30', 
      icon: <Fuel className="h-3 w-3" /> 
    };
  }
  if (name.includes('نیرو') || name.includes('energy') || name.includes('moe')) {
    return { 
      name: 'وزارت نیرو', 
      nameEn: 'MoE', 
      color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30', 
      icon: <Zap className="h-3 w-3" /> 
    };
  }
  if (name.includes('استاندارد') || name.includes('isiri')) {
    return { 
      name: 'سازمان استاندارد', 
      nameEn: 'ISIRI', 
      color: 'bg-purple-500/10 text-purple-600 border-purple-500/30', 
      icon: <FileCheck className="h-3 w-3" /> 
    };
  }
  if (name.includes('hse') || name.includes('ایمنی')) {
    return { 
      name: 'HSE ایران', 
      nameEn: 'HSE', 
      color: 'bg-red-500/10 text-red-600 border-red-500/30', 
      icon: <HardHat className="h-3 w-3" /> 
    };
  }
  if (name.includes('کشاورزی') || name.includes('agriculture') || name.includes('maj')) {
    return { 
      name: 'وزارت جهاد کشاورزی', 
      nameEn: 'MAJ', 
      color: 'bg-lime-500/10 text-lime-600 border-lime-500/30', 
      icon: <Wheat className="h-3 w-3" /> 
    };
  }
  if (name.includes('ساختمان') || name.includes('construction') || name.includes('mrud')) {
    return { 
      name: 'وزارت راه و شهرسازی', 
      nameEn: 'MRUD', 
      color: 'bg-slate-500/10 text-slate-600 border-slate-500/30', 
      icon: <Factory className="h-3 w-3" /> 
    };
  }
  
  return null;
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
    case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-500" />;
    case 'in-progress': 
    case 'in_progress': return <Clock className="w-4 h-4 text-amber-500" />;
    default: return <Calendar className="w-4 h-4 text-muted-foreground" />;
  }
};

export function EnhancedComplianceCalendar() {
  const { organization } = useAuth();
  const [deadlines, setDeadlines] = useState<ComplianceDeadline[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPersianDates, setShowPersianDates] = useState(true);

  useEffect(() => {
    const fetchDeadlines = async () => {
      if (!organization?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch deadlines with framework info
        const { data: deadlinesData, error: deadlinesError } = await supabase
          .from('compliance_deadlines')
          .select(`
            id,
            title,
            description,
            due_date,
            priority,
            status,
            completion_percentage,
            framework_id,
            compliance_frameworks!compliance_deadlines_framework_id_fkey (
              framework_name,
              metadata
            )
          `)
          .eq('organization_id', organization.id)
          .order('due_date', { ascending: true })
          .limit(10);

        if (deadlinesError) throw deadlinesError;

        // Transform the data
        const transformedDeadlines = (deadlinesData || []).map((d: any) => ({
          ...d,
          framework_name: d.compliance_frameworks?.framework_name || 'General',
          jurisdiction: (d.compliance_frameworks?.metadata as any)?.jurisdiction || null,
          completion_percentage: d.completion_percentage || 0
        }));

        setDeadlines(transformedDeadlines);
      } catch (error) {
        console.error('Error fetching compliance deadlines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeadlines();
  }, [organization?.id]);

  const iranDeadlines = deadlines.filter(d => d.jurisdiction === 'Iran');
  const globalDeadlines = deadlines.filter(d => d.jurisdiction !== 'Iran');

  const renderDeadlineCard = (deadline: ComplianceDeadline, isIran: boolean = false) => {
    const daysInfo = getDaysRemainingPersian(deadline.due_date);
    const regulatoryBody = isIran ? getIranRegulatoryBody(deadline.framework_name || '') : null;

    return (
      <div 
        key={deadline.id} 
        className="p-4 border rounded-lg hover:shadow-sm transition-shadow bg-card"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1 rtl:space-x-reverse">
              {getStatusIcon(deadline.status)}
              <h4 className="font-medium text-sm" dir={isIran ? 'rtl' : 'ltr'}>
                {deadline.title}
              </h4>
            </div>
            
            {deadline.description && (
              <p className="text-xs text-muted-foreground mb-2" dir={isIran ? 'rtl' : 'ltr'}>
                {deadline.description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getPriorityColor(deadline.priority)}>
                {deadline.priority}
              </Badge>
              
              {regulatoryBody ? (
                <Badge className={`${regulatoryBody.color} border gap-1`}>
                  {regulatoryBody.icon}
                  <span>{regulatoryBody.nameEn}</span>
                </Badge>
              ) : (
                <Badge variant="outline">{deadline.framework_name}</Badge>
              )}
            </div>
          </div>
          
          <div className="text-right rtl:text-left ml-4">
            <div className={`text-sm font-medium ${daysInfo.isOverdue ? 'text-red-600' : 'text-foreground'}`}>
              {showPersianDates ? daysInfo.persianText : (
                daysInfo.days > 0 ? `${daysInfo.days} days` : `${Math.abs(daysInfo.days)} days overdue`
              )}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {showPersianDates ? (
                <span dir="rtl">{toPersianDate(deadline.due_date, 'short')}</span>
              ) : null}
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(deadline.due_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          </div>
        </div>
        
        <div className="space-y-1 mt-3">
          <div className="flex justify-between text-xs">
            <span>{isIran ? 'پیشرفت' : 'Progress'}</span>
            <span>{deadline.completion_percentage}%</span>
          </div>
          <Progress value={deadline.completion_percentage} className="h-2" />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasDeadlines = deadlines.length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <CardTitle>Compliance Calendar</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPersianDates(!showPersianDates)}
            className="text-xs"
          >
            {showPersianDates ? '🇮🇷 تقویم شمسی' : '📅 Gregorian'}
          </Button>
        </div>
        <CardDescription>
          {showPersianDates 
            ? 'مهلت‌های انطباق بر اساس تقویم شمسی'
            : 'Upcoming compliance deadlines and regulatory requirements'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasDeadlines ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No compliance deadlines configured yet.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Add frameworks from the Industry Compliance Templates page.
            </p>
          </div>
        ) : (
          <Tabs defaultValue={iranDeadlines.length > 0 ? 'iran' : 'global'} className="w-full">
            <TabsList className="mb-4">
              {iranDeadlines.length > 0 && (
                <TabsTrigger value="iran" className="gap-2">
                  🇮🇷 ایران
                  <Badge variant="secondary" className="ml-1">{iranDeadlines.length}</Badge>
                </TabsTrigger>
              )}
              {globalDeadlines.length > 0 && (
                <TabsTrigger value="global" className="gap-2">
                  🌍 Global
                  <Badge variant="secondary" className="ml-1">{globalDeadlines.length}</Badge>
                </TabsTrigger>
              )}
              {deadlines.length > 0 && iranDeadlines.length === 0 && globalDeadlines.length === 0 && (
                <TabsTrigger value="all">
                  All
                  <Badge variant="secondary" className="ml-1">{deadlines.length}</Badge>
                </TabsTrigger>
              )}
            </TabsList>

            {iranDeadlines.length > 0 && (
              <TabsContent value="iran" className="space-y-4">
                {iranDeadlines.map(d => renderDeadlineCard(d, true))}
              </TabsContent>
            )}

            {globalDeadlines.length > 0 && (
              <TabsContent value="global" className="space-y-4">
                {globalDeadlines.map(d => renderDeadlineCard(d, false))}
              </TabsContent>
            )}

            {deadlines.length > 0 && iranDeadlines.length === 0 && globalDeadlines.length === 0 && (
              <TabsContent value="all" className="space-y-4">
                {deadlines.map(d => renderDeadlineCard(d, false))}
              </TabsContent>
            )}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

export default EnhancedComplianceCalendar;
