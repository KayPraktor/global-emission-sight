// ESRS E1 Climate Change Disclosure Requirements
// Based on European Sustainability Reporting Standards

export interface TransitionPlanMetrics {
  hasTransitionPlan: boolean;
  targetYear: number;
  baselineYear: number;
  interimTargets: InterimTarget[];
  keyActions: string[];
  investmentPlanned: number;
  lastUpdated: string;
}

export interface InterimTarget {
  year: number;
  reductionPercentage: number;
  absoluteTarget: number;
  scope: 'all' | 'scope_1' | 'scope_2' | 'scope_3';
}

export interface ClimatePolicy {
  id: string;
  name: string;
  description: string;
  scope: string[];
  adoptedDate: string;
  reviewFrequency: 'annual' | 'biannual' | 'quarterly';
  responsibleParty: string;
  status: 'active' | 'under_review' | 'pending';
}

export interface ClimateAction {
  id: string;
  name: string;
  description: string;
  category: 'mitigation' | 'adaptation' | 'both';
  expectedReduction: number;
  investmentRequired: number;
  startDate: string;
  endDate: string;
  status: 'planned' | 'in_progress' | 'completed';
  progress: number;
}

export interface ClimateTarget {
  id: string;
  name: string;
  targetType: 'absolute' | 'intensity';
  scope: string[];
  baselineYear: number;
  baselineValue: number;
  targetYear: number;
  targetValue: number;
  currentProgress: number;
  isScieneBased: boolean;
  verificationStatus: 'pending' | 'verified' | 'expired';
}

export interface EnergyMetrics {
  totalEnergyConsumption: number;
  renewableShare: number;
  energyIntensity: number;
  bySource: {
    source: string;
    amount: number;
    unit: string;
    isRenewable: boolean;
  }[];
  year: number;
}

export interface GHGEmissionMetrics {
  scope1Total: number;
  scope2LocationBased: number;
  scope2MarketBased: number;
  scope3Total: number;
  scope3ByCategory: {
    category: number;
    name: string;
    emissions: number;
    dataQuality: 'primary' | 'secondary' | 'estimated';
  }[];
  totalEmissions: number;
  biogenicEmissions: number;
  year: number;
  methodology: string;
  verificationStatus: 'unverified' | 'limited' | 'reasonable';
}

export interface GHGRemovalMetrics {
  totalRemovals: number;
  carbonCreditsRetired: number;
  carbonCreditsHeld: number;
  byType: {
    type: string;
    amount: number;
    registry: string;
    vintage: number;
  }[];
  year: number;
}

export interface CarbonPricingMetrics {
  hasInternalPrice: boolean;
  pricePerTonne: number;
  currency: string;
  scopeCovered: string[];
  applicationMethod: 'shadow_price' | 'internal_fee' | 'both';
  year: number;
}

export interface ClimateFinancialEffects {
  physicalRisks: RiskAssessment[];
  transitionRisks: RiskAssessment[];
  opportunities: OpportunityAssessment[];
  potentialFinancialImpact: {
    shortTerm: number;
    mediumTerm: number;
    longTerm: number;
  };
}

export interface RiskAssessment {
  id: string;
  name: string;
  category: string;
  likelihood: 'low' | 'medium' | 'high' | 'very_high';
  impact: 'low' | 'medium' | 'high' | 'very_high';
  timeHorizon: 'short' | 'medium' | 'long';
  financialImpact: number;
  mitigationActions: string[];
}

export interface OpportunityAssessment {
  id: string;
  name: string;
  category: string;
  likelihood: 'low' | 'medium' | 'high' | 'very_high';
  financialBenefit: number;
  timeHorizon: 'short' | 'medium' | 'long';
  requiredInvestment: number;
}

// ESRS E1 Complete Disclosure Structure
export interface ESRS_E1_Disclosure {
  // E1-1: Transition plan for climate change mitigation
  transitionPlan: TransitionPlanMetrics;
  
  // E1-2: Policies related to climate change mitigation/adaptation
  climatePolicies: ClimatePolicy[];
  
  // E1-3: Actions and resources in relation to climate policies
  climateActions: ClimateAction[];
  
  // E1-4: Targets related to climate change mitigation/adaptation
  climateTargets: ClimateTarget[];
  
  // E1-5: Energy consumption and mix
  energyMetrics: EnergyMetrics;
  
  // E1-6: Gross Scopes 1, 2, 3 and Total GHG emissions
  ghgEmissions: GHGEmissionMetrics;
  
  // E1-7: GHG removals and carbon credits
  ghgRemovals: GHGRemovalMetrics;
  
  // E1-8: Internal carbon pricing
  carbonPricing: CarbonPricingMetrics;
  
  // E1-9: Financial effects of climate-related risks/opportunities
  financialEffects: ClimateFinancialEffects;
}

// ISSB S2 Climate-related Disclosures (aligned with TCFD)
export interface ClimateGovernance {
  boardOversight: {
    hasOversight: boolean;
    frequency: string;
    responsibilities: string[];
    expertise: string[];
  };
  managementRole: {
    responsibleRoles: string[];
    reportingStructure: string;
    decisionProcess: string;
  };
}

export interface ClimateStrategy {
  risksIdentified: RiskAssessment[];
  opportunitiesIdentified: OpportunityAssessment[];
  businessModelImpact: string;
  valueChainImpact: string;
  scenarioAnalysis: {
    scenariosUsed: string[];
    assumptions: string[];
    outcomes: string[];
  };
  resilienceAssessment: string;
}

export interface ClimateRiskManagement {
  identificationProcess: string;
  assessmentProcess: string;
  managementProcess: string;
  integrationWithERM: boolean;
  monitoringFrequency: string;
}

export interface ClimateMetricsTargets {
  scope1Emissions: number;
  scope2Emissions: number;
  scope3Emissions: number;
  emissionIntensity: number;
  targets: ClimateTarget[];
  progressAgainstTargets: {
    targetId: string;
    currentValue: number;
    percentageComplete: number;
  }[];
}

export interface ISSB_S2_Disclosure {
  governance: ClimateGovernance;
  strategy: ClimateStrategy;
  riskManagement: ClimateRiskManagement;
  metricsAndTargets: ClimateMetricsTargets;
}

// Compliance Tracking Types
export interface DisclosureStatus {
  id: string;
  disclosureStandard: 'ESRS_E1' | 'ISSB_S2' | 'GRI' | 'CDP';
  disclosureId: string;
  disclosureName: string;
  status: 'not_started' | 'in_progress' | 'draft' | 'review' | 'complete';
  completenessScore: number;
  dataQualityScore: number;
  lastUpdated: string;
  reviewer?: string;
  reviewNotes?: string;
  dueDate?: string;
}

export interface DataGap {
  id: string;
  disclosureId: string;
  disclosureName: string;
  gapType: 'missing_data' | 'quality_issue' | 'methodology_gap' | 'coverage_gap';
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  recommendation: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  resolutionStatus: 'open' | 'in_progress' | 'resolved' | 'accepted_risk';
  owner?: string;
  dueDate?: string;
}

export interface ComplianceReadiness {
  overallScore: number;
  disclosureScores: {
    disclosureId: string;
    name: string;
    score: number;
    status: string;
  }[];
  criticalGaps: DataGap[];
  timeline: {
    milestone: string;
    dueDate: string;
    status: 'pending' | 'on_track' | 'at_risk' | 'completed';
  }[];
  recommendations: string[];
}

// ESRS Disclosure Requirements Reference
export const ESRS_E1_DISCLOSURES = [
  { id: 'E1-1', name: 'Transition plan for climate change mitigation', required: true },
  { id: 'E1-2', name: 'Policies related to climate change mitigation and adaptation', required: true },
  { id: 'E1-3', name: 'Actions and resources in relation to climate change policies and targets', required: true },
  { id: 'E1-4', name: 'Targets related to climate change mitigation and adaptation', required: true },
  { id: 'E1-5', name: 'Energy consumption and mix', required: true },
  { id: 'E1-6', name: 'Gross Scopes 1, 2, 3 and Total GHG emissions', required: true },
  { id: 'E1-7', name: 'GHG removals and GHG mitigation projects financed through carbon credits', required: true },
  { id: 'E1-8', name: 'Internal carbon pricing', required: false },
  { id: 'E1-9', name: 'Anticipated financial effects from climate-related risks and opportunities', required: true },
] as const;

export const ISSB_S2_DISCLOSURES = [
  { id: 'GOV-1', name: 'Governance - Board oversight', required: true },
  { id: 'GOV-2', name: 'Governance - Management role', required: true },
  { id: 'STR-1', name: 'Strategy - Climate-related risks and opportunities', required: true },
  { id: 'STR-2', name: 'Strategy - Business model and value chain', required: true },
  { id: 'STR-3', name: 'Strategy - Transition plan', required: true },
  { id: 'STR-4', name: 'Strategy - Climate resilience', required: true },
  { id: 'RM-1', name: 'Risk Management - Identification and assessment', required: true },
  { id: 'RM-2', name: 'Risk Management - Management processes', required: true },
  { id: 'RM-3', name: 'Risk Management - Integration with overall risk management', required: true },
  { id: 'MT-1', name: 'Metrics - GHG emissions', required: true },
  { id: 'MT-2', name: 'Metrics - Climate-related metrics', required: true },
  { id: 'MT-3', name: 'Targets - Climate-related targets', required: true },
] as const;
