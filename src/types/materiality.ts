export type TopicCategory = 'environmental' | 'social' | 'governance';
export type TimeHorizon = 'short' | 'medium' | 'long';
export type InfluenceLevel = 'high' | 'medium' | 'low';
export type StakeholderCategory = 
  | 'investors' 
  | 'employees' 
  | 'customers' 
  | 'suppliers' 
  | 'communities' 
  | 'regulators' 
  | 'ngos' 
  | 'media';

export interface SustainabilityTopic {
  id: string;
  name: string;
  category: TopicCategory;
  subcategory: string;
  esrsStandard?: string;
  description: string;
}

export interface ImpactMateriality {
  scale: number;
  scope: number;
  irremediability: number;
  likelihood: number;
  overallScore: number;
}

export interface FinancialMateriality {
  magnitude: number;
  likelihood: number;
  timeHorizon: TimeHorizon;
  overallScore: number;
}

export interface MaterialityAssessment {
  id: string;
  organizationId?: string;
  userId: string;
  topicId: string;
  topicName: string;
  topicCategory: TopicCategory;
  esrsStandard?: string;
  impactMateriality: ImpactMateriality;
  financialMateriality: FinancialMateriality;
  isMaterial: boolean;
  stakeholderIds: string[];
  evidence: string;
  assessedAt: string;
}

export interface Stakeholder {
  id: string;
  organizationId?: string;
  userId: string;
  name: string;
  category: StakeholderCategory;
  influence: InfluenceLevel;
  interest: InfluenceLevel;
  engagementMethods: string[];
  topicPriorities: string[];
  lastEngaged?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface MaterialityMatrixPoint {
  topicId: string;
  topicName: string;
  category: TopicCategory;
  esrsStandard?: string;
  impactScore: number;
  financialScore: number;
  isMaterial: boolean;
  stakeholderCount: number;
}
