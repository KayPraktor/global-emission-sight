// Board Reporting Service - Executive-ready sustainability reports and governance tracking

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

// Sample governance metrics
export const getGovernanceMetrics = (): GovernanceMetric[] => [
  // Board Oversight
  {
    id: 'gov-1',
    category: 'oversight',
    name: 'Board Climate Competency',
    description: 'Board members with climate/sustainability expertise',
    status: 'met',
    score: 3,
    maxScore: 3,
    evidence: '2 board members with ESG expertise, annual climate training conducted',
    lastReviewDate: '2024-01-15',
    nextReviewDate: '2025-01-15',
  },
  {
    id: 'gov-2',
    category: 'oversight',
    name: 'Climate Committee Established',
    description: 'Dedicated board committee for climate/ESG oversight',
    status: 'met',
    score: 3,
    maxScore: 3,
    evidence: 'Sustainability Committee established Q2 2023',
    lastReviewDate: '2024-02-01',
  },
  {
    id: 'gov-3',
    category: 'oversight',
    name: 'Management Incentives Linked',
    description: 'Executive compensation tied to climate targets',
    status: 'partial',
    score: 2,
    maxScore: 3,
    evidence: 'CEO bonus linked to emissions targets (15% weight)',
    lastReviewDate: '2024-01-01',
  },
  // Strategic Integration
  {
    id: 'gov-4',
    category: 'strategy',
    name: 'Net Zero Commitment',
    description: 'Science-based net zero target established',
    status: 'met',
    score: 3,
    maxScore: 3,
    evidence: 'SBTi-validated 1.5°C target submitted',
    lastReviewDate: '2024-03-01',
  },
  {
    id: 'gov-5',
    category: 'strategy',
    name: 'Transition Plan',
    description: 'Detailed decarbonization roadmap with milestones',
    status: 'partial',
    score: 2,
    maxScore: 3,
    evidence: 'Draft transition plan under development',
    lastReviewDate: '2024-02-15',
  },
  {
    id: 'gov-6',
    category: 'strategy',
    name: 'Capital Allocation',
    description: 'Climate-aligned investment criteria',
    status: 'partial',
    score: 1,
    maxScore: 3,
    evidence: 'Criteria being developed for FY25',
  },
  // Risk Management
  {
    id: 'gov-7',
    category: 'risk_management',
    name: 'Physical Risk Assessment',
    description: 'Comprehensive physical climate risk analysis',
    status: 'met',
    score: 3,
    maxScore: 3,
    evidence: 'Third-party assessment completed for all facilities',
    lastReviewDate: '2024-01-20',
  },
  {
    id: 'gov-8',
    category: 'risk_management',
    name: 'Transition Risk Assessment',
    description: 'Analysis of policy, technology, market risks',
    status: 'partial',
    score: 2,
    maxScore: 3,
    evidence: 'Policy and regulatory risks assessed; market analysis in progress',
  },
  {
    id: 'gov-9',
    category: 'risk_management',
    name: 'Scenario Analysis',
    description: 'Climate scenario analysis (1.5°C, 2°C, 3°C+)',
    status: 'met',
    score: 3,
    maxScore: 3,
    evidence: 'TCFD-aligned scenarios modeled',
    lastReviewDate: '2024-02-01',
  },
  // Disclosure
  {
    id: 'gov-10',
    category: 'disclosure',
    name: 'TCFD Alignment',
    description: 'Full TCFD disclosure implementation',
    status: 'met',
    score: 3,
    maxScore: 3,
    evidence: 'All 11 TCFD recommendations addressed',
    lastReviewDate: '2024-03-15',
  },
  {
    id: 'gov-11',
    category: 'disclosure',
    name: 'Third-Party Assurance',
    description: 'External verification of emissions data',
    status: 'partial',
    score: 2,
    maxScore: 3,
    evidence: 'Limited assurance on Scope 1&2; Scope 3 not yet assured',
  },
  {
    id: 'gov-12',
    category: 'disclosure',
    name: 'CSRD/ESRS Readiness',
    description: 'Preparation for EU sustainability reporting',
    status: 'partial',
    score: 2,
    maxScore: 3,
    evidence: 'Gap analysis completed; implementation in progress',
  },
  // Stakeholder Engagement
  {
    id: 'gov-13',
    category: 'engagement',
    name: 'Investor Engagement',
    description: 'Proactive climate engagement with investors',
    status: 'met',
    score: 3,
    maxScore: 3,
    evidence: 'Climate briefings held with top 20 investors',
    lastReviewDate: '2024-02-28',
  },
  {
    id: 'gov-14',
    category: 'engagement',
    name: 'Supply Chain Engagement',
    description: 'Supplier decarbonization program',
    status: 'partial',
    score: 2,
    maxScore: 3,
    evidence: 'Top 50 suppliers engaged; program expansion planned',
  },
  {
    id: 'gov-15',
    category: 'engagement',
    name: 'Industry Collaboration',
    description: 'Participation in climate initiatives',
    status: 'met',
    score: 3,
    maxScore: 3,
    evidence: 'Member of Climate Action 100+, SBTi, RE100',
  },
];

// Sample fiduciary duties
export const getFiduciaryDuties = (): FiduciaryDuty[] => [
  {
    id: 'fd-1',
    title: 'Annual Climate Risk Review',
    description: 'Board review of material climate risks and opportunities',
    category: 'risk_oversight',
    status: 'completed',
    dueDate: '2024-03-31',
    completedDate: '2024-03-15',
    priority: 'critical',
    linkedRegulations: ['TCFD', 'SEC Climate Rule'],
  },
  {
    id: 'fd-2',
    title: 'Net Zero Progress Report',
    description: 'Quarterly progress update on decarbonization targets',
    category: 'disclosure',
    status: 'in_progress',
    dueDate: '2024-04-15',
    assignedTo: 'Sustainability Team',
    priority: 'high',
    linkedRegulations: ['SBTi', 'CDP'],
  },
  {
    id: 'fd-3',
    title: 'CSRD Double Materiality Assessment',
    description: 'Complete double materiality assessment for ESRS compliance',
    category: 'compliance',
    status: 'in_progress',
    dueDate: '2024-06-30',
    assignedTo: 'ESG Reporting',
    priority: 'critical',
    linkedRegulations: ['CSRD', 'ESRS'],
  },
  {
    id: 'fd-4',
    title: 'Executive Compensation Review',
    description: 'Review and update climate-linked compensation metrics',
    category: 'strategic_planning',
    status: 'pending',
    dueDate: '2024-05-15',
    priority: 'high',
    linkedRegulations: ['Proxy Guidelines'],
  },
  {
    id: 'fd-5',
    title: 'Transition Plan Development',
    description: 'Develop and approve climate transition plan',
    category: 'strategic_planning',
    status: 'in_progress',
    dueDate: '2024-09-30',
    assignedTo: 'Strategy & Sustainability',
    priority: 'critical',
    linkedRegulations: ['UK TPT', 'ISSB'],
  },
  {
    id: 'fd-6',
    title: 'Scope 3 Assurance Planning',
    description: 'Plan for external assurance of Scope 3 emissions',
    category: 'disclosure',
    status: 'pending',
    dueDate: '2024-08-31',
    priority: 'medium',
    linkedRegulations: ['CSRD', 'SEC'],
  },
  {
    id: 'fd-7',
    title: 'Physical Risk Adaptation Strategy',
    description: 'Develop adaptation plans for high-risk facilities',
    category: 'risk_oversight',
    status: 'pending',
    dueDate: '2024-12-31',
    priority: 'high',
    linkedRegulations: ['TCFD'],
  },
  {
    id: 'fd-8',
    title: 'Annual Stakeholder Engagement Report',
    description: 'Document investor and stakeholder climate engagement',
    category: 'stakeholder_engagement',
    status: 'completed',
    dueDate: '2024-02-28',
    completedDate: '2024-02-20',
    priority: 'medium',
    linkedRegulations: ['SFDR', 'Stewardship Codes'],
  },
];

// Calculate governance score
export const calculateGovernanceScore = (metrics: GovernanceMetric[]): {
  overall: number;
  byCategory: Record<string, { score: number; maxScore: number; percentage: number }>;
  rating: 'Excellent' | 'Good' | 'Adequate' | 'Needs Improvement' | 'Poor';
} => {
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

// Get executive summary data
export const getExecutiveSummary = () => ({
  currentEmissions: {
    total: 45230,
    scope1: 12450,
    scope2: 8920,
    scope3: 23860,
    unit: 'tCO2e',
    change: -8.5,
    vsTarget: -2.3,
  },
  targets: {
    shortTerm: { year: 2025, reduction: 25, current: 18 },
    mediumTerm: { year: 2030, reduction: 50, current: 18 },
    longTerm: { year: 2050, reduction: 100, target: 'Net Zero' },
  },
  keyRisks: [
    { risk: 'Carbon pricing increase', impact: 'High', likelihood: 'Very Likely', financialImpact: '$2.4M annually' },
    { risk: 'Physical climate impacts on operations', impact: 'Medium', likelihood: 'Likely', financialImpact: '$800K - $1.5M' },
    { risk: 'Regulatory non-compliance', impact: 'High', likelihood: 'Possible', financialImpact: 'Up to $5M in penalties' },
  ],
  opportunities: [
    { opportunity: 'Renewable energy transition', value: '$1.2M annual savings', timeline: '2024-2026' },
    { opportunity: 'Green product premium', value: '8% price premium potential', timeline: '2024-2025' },
    { opportunity: 'Carbon credit revenue', value: '$500K-$800K annually', timeline: '2025+' },
  ],
  quarterlyProgress: [
    { quarter: 'Q1', target: 12000, actual: 11200, variance: -6.7 },
    { quarter: 'Q2', target: 11500, actual: 11800, variance: 2.6 },
    { quarter: 'Q3', target: 11000, actual: 10900, variance: -0.9 },
    { quarter: 'Q4', target: 10500, actual: null, variance: null },
  ],
});

// Board reporting service methods
export const boardReportingService = {
  getGovernanceMetrics,
  getFiduciaryDuties,
  calculateGovernanceScore,
  getExecutiveSummary,
  governanceCategories,
};
