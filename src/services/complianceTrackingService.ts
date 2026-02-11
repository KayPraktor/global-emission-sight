import { supabase } from '@/integrations/supabase/client';

export interface FrameworkStatus {
  name: string;
  status: 'compliant' | 'in_progress' | 'partial' | 'not_started';
  statusLabel: string;
  progress: number;
  color: 'emerald' | 'amber' | 'red' | 'gray';
}

export interface UpcomingDeadline {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  framework: string | null;
  priority: string;
  status: string;
  daysRemaining: number;
  urgency: 'high' | 'medium' | 'low';
  linkedRoute: string | null;
}

const FRAMEWORK_MAP: Record<string, string> = {
  'ghg_protocol': 'GHG Protocol',
  'ghg-protocol': 'GHG Protocol',
  'iso_14064': 'ISO 14064',
  'iso-14064': 'ISO 14064',
  'cdp': 'CDP Reporting',
  'tcfd': 'TCFD Alignment',
  'csrd': 'CSRD',
  'cbam': 'CBAM',
  'sbti': 'SBTi',
};

const DEFAULT_FRAMEWORKS = ['GHG Protocol', 'ISO 14064', 'CDP Reporting', 'TCFD Alignment'];

function mapReportStatusToCompliance(reportStatus: string | null): { status: FrameworkStatus['status']; label: string; progress: number; color: FrameworkStatus['color'] } {
  switch (reportStatus) {
    case 'published':
      return { status: 'compliant', label: 'Compliant', progress: 100, color: 'emerald' };
    case 'approved':
      return { status: 'compliant', label: 'Compliant', progress: 100, color: 'emerald' };
    case 'draft':
      return { status: 'in_progress', label: 'In Progress', progress: 50, color: 'amber' };
    case 'in_review':
      return { status: 'in_progress', label: 'In Review', progress: 75, color: 'amber' };
    default:
      return { status: 'not_started', label: 'Not Started', progress: 0, color: 'gray' };
  }
}

class ComplianceTrackingService {
  async getFrameworkStatuses(organizationId: string): Promise<FrameworkStatus[]> {
    // First check compliance_frameworks table
    const { data: frameworks } = await supabase
      .from('compliance_frameworks')
      .select('framework_name, status, completeness_percentage, score')
      .eq('organization_id', organizationId);

    if (frameworks && frameworks.length > 0) {
      return frameworks.map(fw => {
        const progress = fw.completeness_percentage ?? (fw.score ?? 0);
        let status: FrameworkStatus['status'] = 'not_started';
        let color: FrameworkStatus['color'] = 'gray';
        let statusLabel = 'Not Started';

        if (fw.status === 'compliant' || progress >= 100) {
          status = 'compliant'; color = 'emerald'; statusLabel = 'Compliant';
        } else if (fw.status === 'in_progress' || progress >= 25) {
          status = progress >= 60 ? 'partial' : 'in_progress';
          color = 'amber';
          statusLabel = progress >= 60 ? 'Partial' : 'In Progress';
        }

        return { name: fw.framework_name, status, statusLabel, progress, color };
      });
    }

    // Fallback: derive from reports table
    const { data: reports } = await supabase
      .from('reports')
      .select('report_type, status')
      .eq('organization_id', organizationId);

    const reportMap = new Map<string, string>();
    (reports || []).forEach(r => {
      const existing = reportMap.get(r.report_type);
      // Keep the "best" status per report_type
      if (!existing || r.status === 'published' || (r.status === 'approved' && existing !== 'published')) {
        reportMap.set(r.report_type, r.status || 'draft');
      }
    });

    return DEFAULT_FRAMEWORKS.map(name => {
      // Try to match report_type to framework name
      const matchKey = Object.entries(FRAMEWORK_MAP).find(([, v]) => v === name)?.[0];
      const reportStatus = matchKey ? reportMap.get(matchKey) : null;
      // Also try lowercase/normalized name
      const altStatus = reportMap.get(name.toLowerCase().replace(/\s+/g, '_'));
      const finalStatus = reportStatus || altStatus || null;
      const mapped = mapReportStatusToCompliance(finalStatus);
      return { name, ...mapped, statusLabel: mapped.label };
    });
  }

  async getUpcomingDeadlines(organizationId: string): Promise<UpcomingDeadline[]> {
    const { data, error } = await supabase
      .from('compliance_deadlines')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('due_date', new Date().toISOString().split('T')[0])
      .order('due_date', { ascending: true })
      .limit(10);

    if (error) {
      console.error('Error fetching deadlines:', error);
      return [];
    }

    return (data || []).map(d => {
      const dueDate = new Date(d.due_date);
      const now = new Date();
      const diffMs = dueDate.getTime() - now.getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

      let urgency: UpcomingDeadline['urgency'] = 'low';
      if (daysRemaining <= 30) urgency = 'high';
      else if (daysRemaining <= 90) urgency = 'medium';

      return {
        id: d.id,
        title: d.title,
        description: d.description,
        dueDate: d.due_date,
        framework: d.framework_id,
        priority: d.priority,
        status: d.status,
        daysRemaining,
        urgency,
        linkedRoute: null, // could be extended
      };
    });
  }
}

export const complianceTrackingService = new ComplianceTrackingService();
