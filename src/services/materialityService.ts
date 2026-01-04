import { supabase } from '@/integrations/supabase/client';
import type { 
  SustainabilityTopic, 
  MaterialityAssessment, 
  Stakeholder,
  TopicCategory,
  ImpactMateriality,
  FinancialMateriality,
  TimeHorizon
} from '@/types/materiality';

// ESRS-aligned sustainability topics library
export const SUSTAINABILITY_TOPICS: SustainabilityTopic[] = [
  // Environmental
  { id: 'e1-1', name: 'Climate Change Mitigation', category: 'environmental', subcategory: 'Climate', esrsStandard: 'E1', description: 'GHG emissions reduction and transition to low-carbon economy' },
  { id: 'e1-2', name: 'Climate Change Adaptation', category: 'environmental', subcategory: 'Climate', esrsStandard: 'E1', description: 'Building resilience to climate change impacts' },
  { id: 'e1-3', name: 'Energy Consumption', category: 'environmental', subcategory: 'Energy', esrsStandard: 'E1', description: 'Energy efficiency and renewable energy adoption' },
  { id: 'e2-1', name: 'Air Pollution', category: 'environmental', subcategory: 'Pollution', esrsStandard: 'E2', description: 'Air emissions and air quality management' },
  { id: 'e2-2', name: 'Water Pollution', category: 'environmental', subcategory: 'Pollution', esrsStandard: 'E2', description: 'Water discharge and quality management' },
  { id: 'e2-3', name: 'Soil Pollution', category: 'environmental', subcategory: 'Pollution', esrsStandard: 'E2', description: 'Soil contamination prevention and remediation' },
  { id: 'e2-4', name: 'Substances of Concern', category: 'environmental', subcategory: 'Pollution', esrsStandard: 'E2', description: 'Management of hazardous substances' },
  { id: 'e3-1', name: 'Water Consumption', category: 'environmental', subcategory: 'Water', esrsStandard: 'E3', description: 'Water use efficiency and conservation' },
  { id: 'e3-2', name: 'Marine Resources', category: 'environmental', subcategory: 'Water', esrsStandard: 'E3', description: 'Ocean and marine ecosystem protection' },
  { id: 'e4-1', name: 'Biodiversity', category: 'environmental', subcategory: 'Ecosystems', esrsStandard: 'E4', description: 'Species and habitat protection' },
  { id: 'e4-2', name: 'Ecosystem Services', category: 'environmental', subcategory: 'Ecosystems', esrsStandard: 'E4', description: 'Dependency on natural capital' },
  { id: 'e5-1', name: 'Resource Use', category: 'environmental', subcategory: 'Circular Economy', esrsStandard: 'E5', description: 'Raw material consumption and efficiency' },
  { id: 'e5-2', name: 'Circular Economy', category: 'environmental', subcategory: 'Circular Economy', esrsStandard: 'E5', description: 'Waste reduction, recycling, and circular design' },
  
  // Social
  { id: 's1-1', name: 'Working Conditions', category: 'social', subcategory: 'Own Workforce', esrsStandard: 'S1', description: 'Employment terms, wages, and work-life balance' },
  { id: 's1-2', name: 'Equal Treatment', category: 'social', subcategory: 'Own Workforce', esrsStandard: 'S1', description: 'Diversity, inclusion, and non-discrimination' },
  { id: 's1-3', name: 'Health & Safety', category: 'social', subcategory: 'Own Workforce', esrsStandard: 'S1', description: 'Occupational health and safety management' },
  { id: 's1-4', name: 'Training & Development', category: 'social', subcategory: 'Own Workforce', esrsStandard: 'S1', description: 'Employee skills and career development' },
  { id: 's2-1', name: 'Value Chain Labor', category: 'social', subcategory: 'Value Chain Workers', esrsStandard: 'S2', description: 'Labor conditions in supply chain' },
  { id: 's2-2', name: 'Forced & Child Labor', category: 'social', subcategory: 'Value Chain Workers', esrsStandard: 'S2', description: 'Prevention of modern slavery' },
  { id: 's3-1', name: 'Community Impact', category: 'social', subcategory: 'Communities', esrsStandard: 'S3', description: 'Local community engagement and impact' },
  { id: 's3-2', name: 'Indigenous Rights', category: 'social', subcategory: 'Communities', esrsStandard: 'S3', description: 'Rights of indigenous peoples' },
  { id: 's4-1', name: 'Consumer Health & Safety', category: 'social', subcategory: 'Consumers', esrsStandard: 'S4', description: 'Product safety and consumer protection' },
  { id: 's4-2', name: 'Privacy & Data', category: 'social', subcategory: 'Consumers', esrsStandard: 'S4', description: 'Data protection and privacy rights' },
  
  // Governance
  { id: 'g1-1', name: 'Business Ethics', category: 'governance', subcategory: 'Conduct', esrsStandard: 'G1', description: 'Ethical business practices and integrity' },
  { id: 'g1-2', name: 'Anti-Corruption', category: 'governance', subcategory: 'Conduct', esrsStandard: 'G1', description: 'Bribery and corruption prevention' },
  { id: 'g1-3', name: 'Political Engagement', category: 'governance', subcategory: 'Conduct', esrsStandard: 'G1', description: 'Lobbying and political activities transparency' },
  { id: 'g1-4', name: 'Supplier Relationships', category: 'governance', subcategory: 'Conduct', esrsStandard: 'G1', description: 'Fair payment and supplier treatment' },
];

export const STAKEHOLDER_CATEGORIES = [
  { value: 'investors', label: 'Investors & Shareholders' },
  { value: 'employees', label: 'Employees' },
  { value: 'customers', label: 'Customers' },
  { value: 'suppliers', label: 'Suppliers' },
  { value: 'communities', label: 'Local Communities' },
  { value: 'regulators', label: 'Regulators' },
  { value: 'ngos', label: 'NGOs & Civil Society' },
  { value: 'media', label: 'Media' },
];

export const ENGAGEMENT_METHODS = [
  'Surveys',
  'Interviews',
  'Focus Groups',
  'Town Halls',
  'Advisory Panels',
  'Annual Reports',
  'Social Media',
  'Customer Feedback',
  'Investor Calls',
  'Community Meetings',
];

// Calculate impact materiality score
export function calculateImpactScore(impact: Omit<ImpactMateriality, 'overallScore'>): number {
  const baseScore = (impact.scale + impact.scope + impact.irremediability) / 3;
  const likelihoodWeight = impact.likelihood / 5;
  return Math.round(baseScore * likelihoodWeight * 20 * 100) / 100;
}

// Calculate financial materiality score
export function calculateFinancialScore(financial: Omit<FinancialMateriality, 'overallScore'>): number {
  const timeHorizonWeight = financial.timeHorizon === 'short' ? 1.2 : financial.timeHorizon === 'medium' ? 1.0 : 0.8;
  const likelihoodWeight = financial.likelihood / 5;
  return Math.round(financial.magnitude * likelihoodWeight * timeHorizonWeight * 20 * 100) / 100;
}

// Determine if topic is material based on thresholds
export function isMaterialTopic(impactScore: number, financialScore: number, threshold = 60): boolean {
  return impactScore >= threshold || financialScore >= threshold || (impactScore >= 40 && financialScore >= 40);
}

// Fetch stakeholders
export async function getStakeholders(): Promise<Stakeholder[]> {
  const { data, error } = await supabase
    .from('stakeholders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    organizationId: row.organization_id,
    userId: row.user_id,
    name: row.name,
    category: row.category as Stakeholder['category'],
    influence: row.influence as Stakeholder['influence'],
    interest: row.interest as Stakeholder['interest'],
    engagementMethods: row.engagement_methods || [],
    topicPriorities: row.topic_priorities || [],
    lastEngaged: row.last_engaged,
    metadata: row.metadata as Record<string, unknown> | undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

// Save stakeholder
export async function saveStakeholder(stakeholder: Omit<Stakeholder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Stakeholder> {
  const { data, error } = await supabase
    .from('stakeholders')
    .insert({
      organization_id: stakeholder.organizationId || null,
      user_id: stakeholder.userId,
      name: stakeholder.name,
      category: stakeholder.category,
      influence: stakeholder.influence,
      interest: stakeholder.interest,
      engagement_methods: stakeholder.engagementMethods,
      topic_priorities: stakeholder.topicPriorities,
      last_engaged: stakeholder.lastEngaged || null,
      metadata: stakeholder.metadata ? JSON.parse(JSON.stringify(stakeholder.metadata)) : null,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    organizationId: data.organization_id,
    userId: data.user_id,
    name: data.name,
    category: data.category as Stakeholder['category'],
    influence: data.influence as Stakeholder['influence'],
    interest: data.interest as Stakeholder['interest'],
    engagementMethods: data.engagement_methods || [],
    topicPriorities: data.topic_priorities || [],
    lastEngaged: data.last_engaged,
    metadata: data.metadata as Record<string, unknown> | undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Update stakeholder
export async function updateStakeholder(id: string, updates: Partial<Stakeholder>): Promise<void> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.influence !== undefined) updateData.influence = updates.influence;
  if (updates.interest !== undefined) updateData.interest = updates.interest;
  if (updates.engagementMethods !== undefined) updateData.engagement_methods = updates.engagementMethods;
  if (updates.topicPriorities !== undefined) updateData.topic_priorities = updates.topicPriorities;
  if (updates.lastEngaged !== undefined) updateData.last_engaged = updates.lastEngaged;
  if (updates.metadata !== undefined) updateData.metadata = JSON.parse(JSON.stringify(updates.metadata));

  const { error } = await supabase
    .from('stakeholders')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;
}

// Delete stakeholder
export async function deleteStakeholder(id: string): Promise<void> {
  const { error } = await supabase
    .from('stakeholders')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Fetch materiality assessments
export async function getAssessments(): Promise<MaterialityAssessment[]> {
  const { data, error } = await supabase
    .from('materiality_assessments')
    .select('*')
    .order('assessed_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    id: row.id,
    organizationId: row.organization_id,
    userId: row.user_id,
    topicId: row.topic_id,
    topicName: row.topic_name,
    topicCategory: row.topic_category as TopicCategory,
    esrsStandard: row.esrs_standard,
    impactMateriality: {
      scale: row.impact_scale || 1,
      scope: row.impact_scope || 1,
      irremediability: row.impact_irremediability || 1,
      likelihood: row.impact_likelihood || 1,
      overallScore: row.impact_score || 0,
    },
    financialMateriality: {
      magnitude: row.financial_magnitude || 1,
      likelihood: row.financial_likelihood || 1,
      timeHorizon: (row.financial_time_horizon as TimeHorizon) || 'medium',
      overallScore: row.financial_score || 0,
    },
    isMaterial: row.is_material || false,
    stakeholderIds: row.stakeholder_ids || [],
    evidence: row.evidence || '',
    assessedAt: row.assessed_at,
  }));
}

// Save assessment
export async function saveAssessment(
  assessment: Omit<MaterialityAssessment, 'id' | 'assessedAt'>
): Promise<MaterialityAssessment> {
  const impactScore = calculateImpactScore(assessment.impactMateriality);
  const financialScore = calculateFinancialScore(assessment.financialMateriality);
  const isMaterial = isMaterialTopic(impactScore, financialScore);

  const { data, error } = await supabase
    .from('materiality_assessments')
    .insert({
      organization_id: assessment.organizationId,
      user_id: assessment.userId,
      topic_id: assessment.topicId,
      topic_name: assessment.topicName,
      topic_category: assessment.topicCategory,
      esrs_standard: assessment.esrsStandard,
      impact_scale: assessment.impactMateriality.scale,
      impact_scope: assessment.impactMateriality.scope,
      impact_irremediability: assessment.impactMateriality.irremediability,
      impact_likelihood: assessment.impactMateriality.likelihood,
      impact_score: impactScore,
      financial_magnitude: assessment.financialMateriality.magnitude,
      financial_likelihood: assessment.financialMateriality.likelihood,
      financial_time_horizon: assessment.financialMateriality.timeHorizon,
      financial_score: financialScore,
      is_material: isMaterial,
      stakeholder_ids: assessment.stakeholderIds,
      evidence: assessment.evidence,
      assessed_by: assessment.userId,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    organizationId: data.organization_id,
    userId: data.user_id,
    topicId: data.topic_id,
    topicName: data.topic_name,
    topicCategory: data.topic_category as TopicCategory,
    esrsStandard: data.esrs_standard,
    impactMateriality: {
      scale: data.impact_scale || 1,
      scope: data.impact_scope || 1,
      irremediability: data.impact_irremediability || 1,
      likelihood: data.impact_likelihood || 1,
      overallScore: data.impact_score || 0,
    },
    financialMateriality: {
      magnitude: data.financial_magnitude || 1,
      likelihood: data.financial_likelihood || 1,
      timeHorizon: (data.financial_time_horizon as TimeHorizon) || 'medium',
      overallScore: data.financial_score || 0,
    },
    isMaterial: data.is_material || false,
    stakeholderIds: data.stakeholder_ids || [],
    evidence: data.evidence || '',
    assessedAt: data.assessed_at,
  };
}

// Update assessment
export async function updateAssessment(
  id: string,
  assessment: Partial<MaterialityAssessment>
): Promise<void> {
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (assessment.impactMateriality) {
    const impactScore = calculateImpactScore(assessment.impactMateriality);
    updates.impact_scale = assessment.impactMateriality.scale;
    updates.impact_scope = assessment.impactMateriality.scope;
    updates.impact_irremediability = assessment.impactMateriality.irremediability;
    updates.impact_likelihood = assessment.impactMateriality.likelihood;
    updates.impact_score = impactScore;
  }

  if (assessment.financialMateriality) {
    const financialScore = calculateFinancialScore(assessment.financialMateriality);
    updates.financial_magnitude = assessment.financialMateriality.magnitude;
    updates.financial_likelihood = assessment.financialMateriality.likelihood;
    updates.financial_time_horizon = assessment.financialMateriality.timeHorizon;
    updates.financial_score = financialScore;
  }

  if (assessment.impactMateriality && assessment.financialMateriality) {
    const impactScore = calculateImpactScore(assessment.impactMateriality);
    const financialScore = calculateFinancialScore(assessment.financialMateriality);
    updates.is_material = isMaterialTopic(impactScore, financialScore);
  }

  if (assessment.stakeholderIds) updates.stakeholder_ids = assessment.stakeholderIds;
  if (assessment.evidence !== undefined) updates.evidence = assessment.evidence;

  const { error } = await supabase
    .from('materiality_assessments')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

// Delete assessment
export async function deleteAssessment(id: string): Promise<void> {
  const { error } = await supabase
    .from('materiality_assessments')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Get mock data for demo purposes
export function getMockAssessments(): MaterialityAssessment[] {
  return [
    {
      id: '1',
      userId: 'demo',
      topicId: 'e1-1',
      topicName: 'Climate Change Mitigation',
      topicCategory: 'environmental',
      esrsStandard: 'E1',
      impactMateriality: { scale: 5, scope: 5, irremediability: 4, likelihood: 5, overallScore: 93 },
      financialMateriality: { magnitude: 5, likelihood: 5, timeHorizon: 'short', overallScore: 100 },
      isMaterial: true,
      stakeholderIds: [],
      evidence: 'Core to business strategy',
      assessedAt: new Date().toISOString(),
    },
    {
      id: '2',
      userId: 'demo',
      topicId: 'e1-3',
      topicName: 'Energy Consumption',
      topicCategory: 'environmental',
      esrsStandard: 'E1',
      impactMateriality: { scale: 4, scope: 4, irremediability: 3, likelihood: 5, overallScore: 73 },
      financialMateriality: { magnitude: 4, likelihood: 4, timeHorizon: 'short', overallScore: 77 },
      isMaterial: true,
      stakeholderIds: [],
      evidence: 'Major operational cost driver',
      assessedAt: new Date().toISOString(),
    },
    {
      id: '3',
      userId: 'demo',
      topicId: 's1-3',
      topicName: 'Health & Safety',
      topicCategory: 'social',
      esrsStandard: 'S1',
      impactMateriality: { scale: 5, scope: 4, irremediability: 4, likelihood: 4, overallScore: 69 },
      financialMateriality: { magnitude: 3, likelihood: 3, timeHorizon: 'short', overallScore: 43 },
      isMaterial: true,
      stakeholderIds: [],
      evidence: 'Critical for workforce',
      assessedAt: new Date().toISOString(),
    },
    {
      id: '4',
      userId: 'demo',
      topicId: 'g1-2',
      topicName: 'Anti-Corruption',
      topicCategory: 'governance',
      esrsStandard: 'G1',
      impactMateriality: { scale: 4, scope: 3, irremediability: 3, likelihood: 3, overallScore: 40 },
      financialMateriality: { magnitude: 4, likelihood: 3, timeHorizon: 'medium', overallScore: 48 },
      isMaterial: false,
      stakeholderIds: [],
      evidence: 'Compliance requirement',
      assessedAt: new Date().toISOString(),
    },
    {
      id: '5',
      userId: 'demo',
      topicId: 'e5-2',
      topicName: 'Circular Economy',
      topicCategory: 'environmental',
      esrsStandard: 'E5',
      impactMateriality: { scale: 3, scope: 3, irremediability: 2, likelihood: 4, overallScore: 43 },
      financialMateriality: { magnitude: 3, likelihood: 4, timeHorizon: 'long', overallScore: 38 },
      isMaterial: false,
      stakeholderIds: [],
      evidence: 'Growing importance',
      assessedAt: new Date().toISOString(),
    },
  ];
}

export function getMockStakeholders(): Stakeholder[] {
  return [
    {
      id: '1',
      userId: 'demo',
      name: 'Institutional Investors',
      category: 'investors',
      influence: 'high',
      interest: 'high',
      engagementMethods: ['Investor Calls', 'Annual Reports'],
      topicPriorities: ['e1-1', 'e1-3', 'g1-2'],
      lastEngaged: '2024-01-15',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      userId: 'demo',
      name: 'Employees',
      category: 'employees',
      influence: 'medium',
      interest: 'high',
      engagementMethods: ['Surveys', 'Town Halls'],
      topicPriorities: ['s1-1', 's1-3', 's1-4'],
      lastEngaged: '2024-01-10',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '3',
      userId: 'demo',
      name: 'Environmental NGOs',
      category: 'ngos',
      influence: 'medium',
      interest: 'high',
      engagementMethods: ['Focus Groups', 'Community Meetings'],
      topicPriorities: ['e1-1', 'e4-1', 'e5-2'],
      lastEngaged: '2024-01-05',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '4',
      userId: 'demo',
      name: 'Regulators',
      category: 'regulators',
      influence: 'high',
      interest: 'medium',
      engagementMethods: ['Annual Reports'],
      topicPriorities: ['e1-1', 'g1-1', 'g1-2'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}
