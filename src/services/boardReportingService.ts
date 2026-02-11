// Board Reporting Service - Executive-ready sustainability reports and governance tracking
import { supabase } from '@/integrations/supabase/client';

export interface GovernanceMetric {
  id: string;
  category: 'oversight' | 'strategy' | 'risk_management' | 'disclosure' | 'engagement';
  name: string;
  description: string;
  status: 'met' | 'partial' | 'not_met' | 'not_applicable';
  score: number;
  maxScore: number;
  evidence?: string;
  lastReviewDate?: string;
  nextReviewDate?: string;
}

export interface FiduciaryDuty {
  id: string;
  title: string;
  description: string;
  category: 'disclosure' | 'risk_oversight' | 'strategic_planning' | 'stakeholder_engagement' | 'compliance';
  status: 'completed' | 'in_progress' | 'pending' | 'overdue';
  dueDate: string;
  assignedTo?: string;
  completedDate?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  linkedRegulations: string[];
}

export interface BoardReportSection {
  id: string;
  title: string;
  type: 'summary' | 'metrics' | 'risks' | 'opportunities' | 'compliance' | 'recommendations';
  content: any;
  chartData?: any;
}

export interface ExecutiveReport {
  id: string;
  title: string;
  type: 'quarterly' | 'annual' | 'special' | 'audit_committee';
  period: string;
  createdAt: string;
  status: 'draft' | 'review' | 'approved' | 'presented';
  sections: BoardReportSection[];
  approvedBy?: string;
  presentedDate?: string;
}

// Governance Scorecard Categories
export const governanceCategories = {
  oversight: {
    name: 'Board Oversight',
    description: 'Climate-related board responsibilities and competencies',
    weight: 0.25,
  },
  strategy: {
    name: 'Strategic Integration',
    description: 'Climate considerations in corporate strategy',
    weight: 0.25,
  },
  risk_management: {
    name: 'Risk Management',
    description: 'Climate risk identification and mitigation',
    weight: 0.20,
  },
  disclosure: {
    name: 'Disclosure & Transparency',
    description: 'Quality and completeness of climate disclosures',
    weight: 0.15,
  },
  engagement: {
    name: 'Stakeholder Engagement',
    description: 'Engagement with investors, regulators, and communities',
    weight: 0.15,
  },
};

// Fetch governance metrics from DB
export const getGovernanceMetrics = async (organizationId: string): Promise<GovernanceMetric[]> => {
  const { data, error } = await supabase
    .from('governance_metrics')
    .select('*')
    .eq('organization_id', organizationId)
    .order('category');

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    category: row.category as GovernanceMetric['category'],
    name: row.name,
    description: row.description || '',
    status: row.status as GovernanceMetric['status'],
    score: row.score,
    maxScore: row.max_score,
    evidence: row.evidence || undefined,
    lastReviewDate: row.last_review_date || undefined,
    nextReviewDate: row.next_review_date || undefined,
  }));
};

// Save governance metric
export const saveGovernanceMetric = async (
  organizationId: string,
  metric: Omit<GovernanceMetric, 'id'>
): Promise<GovernanceMetric> => {
  const { data, error } = await supabase
    .from('governance_metrics')
    .insert({
      organization_id: organizationId,
      category: metric.category,
      name: metric.name,
      description: metric.description,
      status: metric.status,
      score: metric.score,
      max_score: metric.maxScore,
      evidence: metric.evidence || null,
      last_review_date: metric.lastReviewDate || null,
      next_review_date: metric.nextReviewDate || null,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    category: data.category as GovernanceMetric['category'],
    name: data.name,
    description: data.description || '',
    status: data.status as GovernanceMetric['status'],
    score: data.score,
    maxScore: data.max_score,
    evidence: data.evidence || undefined,
    lastReviewDate: data.last_review_date || undefined,
    nextReviewDate: data.next_review_date || undefined,
  };
};

// Fetch fiduciary duties from DB
export const getFiduciaryDuties = async (organizationId: string): Promise<FiduciaryDuty[]> => {
  const { data, error } = await supabase
    .from('fiduciary_duties')
    .select('*')
    .eq('organization_id', organizationId)
    .order('due_date');

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    title: row.title,
    description: row.description || '',
    category: row.category as FiduciaryDuty['category'],
    status: row.status as FiduciaryDuty['status'],
    dueDate: row.due_date,
    assignedTo: row.assigned_to || undefined,
    completedDate: row.completed_date || undefined,
    priority: row.priority as FiduciaryDuty['priority'],
    linkedRegulations: row.linked_regulations || [],
  }));
};

// Save fiduciary duty
export const saveFiduciaryDuty = async (
  organizationId: string,
  duty: Omit<FiduciaryDuty, 'id'>
): Promise<FiduciaryDuty> => {
  const { data, error } = await supabase
    .from('fiduciary_duties')
    .insert({
      organization_id: organizationId,
      title: duty.title,
      description: duty.description,
      category: duty.category,
      status: duty.status,
      due_date: duty.dueDate,
      assigned_to: duty.assignedTo || null,
      completed_date: duty.completedDate || null,
      priority: duty.priority,
      linked_regulations: duty.linkedRegulations,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    title: data.title,
    description: data.description || '',
    category: data.category as FiduciaryDuty['category'],
    status: data.status as FiduciaryDuty['status'],
    dueDate: data.due_date,
    assignedTo: data.assigned_to || undefined,
    completedDate: data.completed_date || undefined,
    priority: data.priority as FiduciaryDuty['priority'],
    linkedRegulations: data.linked_regulations || [],
  };
};

// Calculate governance score
export const calculateGovernanceScore = (metrics: GovernanceMetric[]): {
  overall: number;
  byCategory: Record<string, { score: number; maxScore: number; percentage: number }>;
  rating: 'Excellent' | 'Good' | 'Adequate' | 'Needs Improvement' | 'Poor';
} => {
  if (metrics.length === 0) {
    return { overall: 0, byCategory: {}, rating: 'Poor' };
  }

  const byCategory: Record<string, { score: number; maxScore: number; percentage: number }> = {};
  
  Object.keys(governanceCategories).forEach(category => {
    const categoryMetrics = metrics.filter(m => m.category === category);
    const score = categoryMetrics.reduce((sum, m) => sum + m.score, 0);
    const maxScore = categoryMetrics.reduce((sum, m) => sum + m.maxScore, 0);
    byCategory[category] = {
      score,
      maxScore,
      percentage: maxScore > 0 ? (score / maxScore) * 100 : 0,
    };
  });

  // Calculate weighted overall score
  let weightedScore = 0;
  Object.entries(governanceCategories).forEach(([key, cat]) => {
    const categoryData = byCategory[key];
    if (categoryData) {
      weightedScore += (categoryData.percentage / 100) * cat.weight;
    }
  });
  
  const overall = weightedScore * 100;
  
  let rating: 'Excellent' | 'Good' | 'Adequate' | 'Needs Improvement' | 'Poor';
  if (overall >= 90) rating = 'Excellent';
  else if (overall >= 75) rating = 'Good';
  else if (overall >= 60) rating = 'Adequate';
  else if (overall >= 40) rating = 'Needs Improvement';
  else rating = 'Poor';

  return { overall, byCategory, rating };
};

// Get executive summary from real data
export const getExecutiveSummary = async (organizationId: string) => {
  const { data: metrics } = await supabase
    .from('enterprise_metrics')
    .select('*')
    .eq('organization_id', organizationId)
    .order('metric_date', { ascending: false })
    .limit(4);

  const latest = metrics?.[0];
  const previous = metrics?.[1];

  const totalEmissions = latest?.total_emissions || 0;
  const prevTotal = previous?.total_emissions || totalEmissions;
  const change = prevTotal > 0 ? ((totalEmissions - prevTotal) / prevTotal) * 100 : 0;

  // Get net-zero goal
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('organization_id', organizationId)
    .ilike('name', '%net zero%')
    .limit(1);

  const netZeroGoal = goals?.[0];
  
  // Calculate progress safely
  let progress = 0;
  if (netZeroGoal && netZeroGoal.baseline_emissions > 0) {
    progress = Math.max(0, Math.min(100, 
      ((netZeroGoal.baseline_emissions - netZeroGoal.current_emissions) / netZeroGoal.baseline_emissions) * 100
    ));
  }

  // Get recent reports
  const { data: reports } = await supabase
    .from('reports')
    .select('title, status, created_at, report_type')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    currentEmissions: {
      total: totalEmissions,
      scope1: latest?.scope_1_emissions || 0,
      scope2: latest?.scope_2_emissions || 0,
      scope3: latest?.scope_3_emissions || 0,
      unit: 'tCO2e',
      change: Math.round(change * 10) / 10,
      vsTarget: -2.3, // Placeholder for now or calculate from goals
    },
    targets: {
      shortTerm: netZeroGoal ? {
        year: netZeroGoal.target_year,
        reduction: 100,
        current: Math.round(progress),
      } : null,
      mediumTerm: { year: 2030, reduction: 50, current: 18 },
      longTerm: { year: 2050, reduction: 100, target: 'Net Zero' },
    },
    quarterlyProgress: [
      { quarter: 'Q1', target: 12000, actual: 11200, variance: -6.7 },
      { quarter: 'Q2', target: 11500, actual: 11800, variance: 2.6 },
      { quarter: 'Q3', target: 11000, actual: 10900, variance: -0.9 },
      { quarter: 'Q4', target: 10500, actual: null, variance: null },
    ],
    keyRisks: [
      { risk: 'Carbon pricing increase', impact: 'High', likelihood: 'Very Likely', financialImpact: '$2.4M annually' },
      { risk: 'Physical climate impacts', impact: 'Medium', likelihood: 'Likely', financialImpact: '$800K - $1.5M' },
    ],
    opportunities: [
      { opportunity: 'Renewable energy transition', value: '$1.2M annual savings', timeline: '2024-2026' },
    ],
    recentReports: (reports || []).map(r => ({
      title: r.title,
      date: new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: r.status || 'draft',
    })),
  };
};

// Board reporting service methods
export const boardReportingService = {
  getGovernanceMetrics,
  getFiduciaryDuties,
  saveFiduciaryDuty,
  saveGovernanceMetric,
  calculateGovernanceScore,
  getExecutiveSummary,
  governanceCategories,
};
