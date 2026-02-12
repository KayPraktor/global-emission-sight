import { supabase } from '@/integrations/supabase/client';

export interface ComplianceFramework {
  id: string;
  name: string;
  score: number;
  status: string;
  nextDeadline: string;
  completeness: number;
  estimatedCost: number;
  risk: string;
}

export interface ComplianceDeadline {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  framework: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  assignee?: string;
  estimatedHours?: number;
  completionPercentage: number;
  documents: string[];
  dependencies: string[];
}

export class EnterpriseComplianceService {
  async initializeFrameworks(organizationId: string) {
    // Check if frameworks already exist
    const { data: existing } = await supabase
      .from('compliance_frameworks')
      .select('id')
      .eq('organization_id', organizationId);

    if (existing && existing.length > 0) {
      return;
    }

    // Initialize standard frameworks
    const frameworks = [
      {
        organization_id: organizationId,
        framework_name: 'CDP (Carbon Disclosure Project)',
        status: 'in-progress',
        score: 0,
        completeness_percentage: 0,
        risk_level: 'medium',
        estimated_cost: 15000
      },
      {
        organization_id: organizationId,
        framework_name: 'TCFD (Task Force on Climate-related Financial Disclosures)',
        status: 'not-started',
        score: 0,
        completeness_percentage: 0,
        risk_level: 'high',
        estimated_cost: 25000
      },
      {
        organization_id: organizationId,
        framework_name: 'CSRD (Corporate Sustainability Reporting Directive)',
        status: 'not-started',
        score: 0,
        completeness_percentage: 0,
        risk_level: 'high',
        estimated_cost: 50000
      },
      {
        organization_id: organizationId,
        framework_name: 'SBTi (Science Based Targets initiative)',
        status: 'planning',
        score: 0,
        completeness_percentage: 0,
        risk_level: 'medium',
        estimated_cost: 30000
      },
      {
        organization_id: organizationId,
        framework_name: 'GRI (Global Reporting Initiative)',
        status: 'in-progress',
        score: 0,
        completeness_percentage: 0,
        risk_level: 'low',
        estimated_cost: 20000
      }
    ];

    const { error } = await supabase
      .from('compliance_frameworks')
      .insert(frameworks);

    if (error) {
      console.error('Error initializing frameworks:', error);
    }

    // Generate initial deadlines
    await this.generateDeadlines(organizationId);
  }

  async generateDeadlines(organizationId: string) {
    const currentYear = new Date().getFullYear();
    const deadlines: any[] = [];

    // CDP deadlines
    deadlines.push({
      organization_id: organizationId,
      title: 'CDP Climate Change Questionnaire',
      description: 'Complete and submit CDP Climate Change questionnaire with comprehensive emissions data',
      due_date: `${currentYear}-07-31`,
      priority: 'high',
      status: 'pending',
      completion_percentage: 0,
      estimated_hours: 80,
      documents: [],
      dependencies: []
    });

    // TCFD deadlines
    deadlines.push({
      organization_id: organizationId,
      title: 'TCFD Annual Report',
      description: 'Prepare TCFD-aligned climate risk disclosure for annual report',
      due_date: `${currentYear}-12-31`,
      priority: 'critical',
      status: 'pending',
      completion_percentage: 0,
      estimated_hours: 120,
      documents: [],
      dependencies: []
    });

    // CSRD deadlines
    deadlines.push({
      organization_id: organizationId,
      title: 'CSRD Sustainability Statement',
      description: 'Prepare comprehensive sustainability statement under CSRD requirements',
      due_date: `${currentYear + 1}-06-30`,
      priority: 'high',
      status: 'pending',
      completion_percentage: 0,
      estimated_hours: 200,
      documents: [],
      dependencies: []
    });

    // SBTi deadlines
    deadlines.push({
      organization_id: organizationId,
      title: 'SBTi Target Submission',
      description: 'Submit science-based emission reduction targets to SBTi for validation',
      due_date: `${currentYear}-09-30`,
      priority: 'medium',
      status: 'pending',
      completion_percentage: 0,
      estimated_hours: 60,
      documents: [],
      dependencies: []
    });

    // GRI deadlines
    deadlines.push({
      organization_id: organizationId,
      title: 'GRI Sustainability Report',
      description: 'Publish GRI-aligned sustainability report with verified emissions data',
      due_date: `${currentYear}-11-30`,
      priority: 'medium',
      status: 'pending',
      completion_percentage: 0,
      estimated_hours: 100,
      documents: [],
      dependencies: []
    });

    const { error } = await supabase
      .from('compliance_deadlines')
      .insert(deadlines);

    if (error && !error.message.includes('duplicate')) {
      console.error('Error generating deadlines:', error);
    }
  }

  async getFrameworks(organizationId: string): Promise<ComplianceFramework[]> {
    const { data, error } = await supabase
      .from('compliance_frameworks')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error fetching frameworks:', error);
      throw new Error(`Failed to load compliance frameworks: ${error.message}`);
    }

    return data?.map(f => ({
      id: f.id,
      name: f.framework_name,
      score: f.score || 0,
      status: f.status,
      nextDeadline: f.next_deadline || '',
      completeness: f.completeness_percentage || 0,
      estimatedCost: f.estimated_cost || 0,
      risk: f.risk_level || 'medium'
    })) || [];
  }

  async getDeadlines(organizationId: string, daysAhead: number = 90): Promise<ComplianceDeadline[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const { data, error } = await supabase
      .from('compliance_deadlines')
      .select('*')
      .eq('organization_id', organizationId)
      .lte('due_date', futureDate.toISOString().split('T')[0])
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching deadlines:', error);
      throw new Error(`Failed to load compliance deadlines: ${error.message}`);
    }

    return data?.map(d => ({
      id: d.id,
      title: d.title,
      description: d.description || '',
      dueDate: d.due_date,
      framework: d.framework_id || '',
      priority: d.priority as any,
      status: d.status as any,
      assignee: d.assignee_id,
      estimatedHours: d.estimated_hours,
      completionPercentage: d.completion_percentage || 0,
      documents: d.documents || [],
      dependencies: d.dependencies || []
    })) || [];
  }

  async updateDeadlineProgress(deadlineId: string, percentage: number) {
    const status = percentage === 100 ? 'completed' : percentage > 0 ? 'in-progress' : 'pending';
    
    const { error } = await supabase
      .from('compliance_deadlines')
      .update({ 
        completion_percentage: percentage,
        status 
      })
      .eq('id', deadlineId);

    if (error) {
      console.error('Error updating deadline:', error);
    }
  }

  async calculateComplianceScore(organizationId: string): Promise<number> {
    // Fetch data quality score
    const { data: quality } = await supabase
      .from('quality_tracking')
      .select('overall_score')
      .eq('organization_id', organizationId)
      .order('metric_date', { ascending: false })
      .limit(1);

    const qualityScore = quality?.[0]?.overall_score || 0;

    // Fetch deadlines completion
    const { data: deadlines } = await supabase
      .from('compliance_deadlines')
      .select('completion_percentage, status')
      .eq('organization_id', organizationId);

    const avgCompletion = deadlines?.reduce((sum, d) => sum + d.completion_percentage, 0) / (deadlines?.length || 1);
    const overdueCount = deadlines?.filter(d => d.status === 'overdue').length || 0;

    // Calculate weighted score
    const score = (qualityScore * 0.5) + (avgCompletion * 0.4) - (overdueCount * 5);
    return Math.max(0, Math.min(100, score));
  }
}

export const enterpriseComplianceService = new EnterpriseComplianceService();
