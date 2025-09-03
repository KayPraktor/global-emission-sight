// Comprehensive Enterprise Sample Data
export interface EnterpriseFacility {
  id: string;
  name: string;
  location: string;
  type: 'manufacturing' | 'office' | 'warehouse' | 'datacenter';
  emissions: {
    scope1: number;
    scope2: number;
    scope3: number;
    total: number;
  };
  financials: {
    revenue: number;
    opex: number;
    carbonCost: number;
  };
  performance: {
    efficiency: number;
    complianceScore: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  coordinates: [number, number];
}

export interface ExecutiveKPI {
  id: string;
  title: string;
  value: number;
  unit: string;
  change: number;
  target?: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  category: 'emissions' | 'financial' | 'compliance' | 'operational';
}

export interface AIInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'anomaly' | 'recommendation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: {
    co2Reduction: number;
    costSaving: number;
    timeline: string;
  };
  confidence: number;
  category: string;
}

export interface ScenarioAnalysis {
  scenario: string;
  description: string;
  probability: number;
  impact: {
    emissions: number;
    cost: number;
    timeline: string;
  };
  actions: string[];
}

// Sample Enterprise Facilities
export const enterpriseFacilities: EnterpriseFacility[] = [
  {
    id: 'fac-001',
    name: 'Silicon Valley HQ',
    location: 'Palo Alto, CA',
    type: 'office',
    emissions: { scope1: 450, scope2: 1250, scope3: 2800, total: 4500 },
    financials: { revenue: 125000000, opex: 32000000, carbonCost: 180000 },
    performance: { efficiency: 87, complianceScore: 92, riskLevel: 'low' },
    coordinates: [-122.1430, 37.4419]
  },
  {
    id: 'fac-002',
    name: 'Austin Manufacturing',
    location: 'Austin, TX',
    type: 'manufacturing',
    emissions: { scope1: 2800, scope2: 1950, scope3: 1200, total: 5950 },
    financials: { revenue: 98000000, opex: 45000000, carbonCost: 238000 },
    performance: { efficiency: 72, complianceScore: 84, riskLevel: 'medium' },
    coordinates: [-97.7431, 30.2672]
  },
  {
    id: 'fac-003',
    name: 'Frankfurt Data Center',
    location: 'Frankfurt, Germany',
    type: 'datacenter',
    emissions: { scope1: 120, scope2: 3200, scope3: 850, total: 4170 },
    financials: { revenue: 67000000, opex: 28000000, carbonCost: 167000 },
    performance: { efficiency: 93, complianceScore: 89, riskLevel: 'low' },
    coordinates: [8.6821, 50.1109]
  },
  {
    id: 'fac-004',
    name: 'Shanghai Manufacturing',
    location: 'Shanghai, China',
    type: 'manufacturing',
    emissions: { scope1: 3400, scope2: 2100, scope3: 1800, total: 7300 },
    financials: { revenue: 156000000, opex: 62000000, carbonCost: 292000 },
    performance: { efficiency: 68, complianceScore: 76, riskLevel: 'high' },
    coordinates: [121.4737, 31.2304]
  },
  {
    id: 'fac-005',
    name: 'London Office',
    location: 'London, UK',
    type: 'office',
    emissions: { scope1: 280, scope2: 890, scope3: 1450, total: 2620 },
    financials: { revenue: 87000000, opex: 25000000, carbonCost: 105000 },
    performance: { efficiency: 81, complianceScore: 94, riskLevel: 'low' },
    coordinates: [-0.1276, 51.5074]
  }
];

// Executive KPIs
export const executiveKPIs: ExecutiveKPI[] = [
  {
    id: 'kpi-001',
    title: 'Total Portfolio Emissions',
    value: 24540,
    unit: 'tCO₂e',
    change: -8.2,
    target: 20000,
    status: 'good',
    trend: 'down',
    category: 'emissions'
  },
  {
    id: 'kpi-002',
    title: 'Carbon Cost',
    value: 982000,
    unit: '$',
    change: 12.5,
    status: 'warning',
    trend: 'up',
    category: 'financial'
  },
  {
    id: 'kpi-003',
    title: 'Portfolio Compliance Score',
    value: 87,
    unit: '%',
    change: 4.2,
    target: 95,
    status: 'good',
    trend: 'up',
    category: 'compliance'
  },
  {
    id: 'kpi-004',
    title: 'Carbon Intensity',
    value: 46.2,
    unit: 'tCO₂e/$M',
    change: -15.8,
    target: 35.0,
    status: 'good',
    trend: 'down',
    category: 'operational'
  },
  {
    id: 'kpi-005',
    title: 'Net Zero Progress',
    value: 34,
    unit: '%',
    change: 8.1,
    target: 100,
    status: 'warning',
    trend: 'up',
    category: 'emissions'
  },
  {
    id: 'kpi-006',
    title: 'Risk Exposure',
    value: 2.4,
    unit: '$M',
    change: -22.3,
    status: 'excellent',
    trend: 'down',
    category: 'financial'
  }
];

// AI-Powered Insights
export const aiInsights: AIInsight[] = [
  {
    id: 'insight-001',
    type: 'opportunity',
    priority: 'high',
    title: 'HVAC Optimization Opportunity',
    description: 'ML analysis identified 23% potential energy reduction in Shanghai facility through predictive HVAC scheduling.',
    impact: { co2Reduction: 780, costSaving: 125000, timeline: '6 months' },
    confidence: 89,
    category: 'Energy Efficiency'
  },
  {
    id: 'insight-002',
    type: 'risk',
    priority: 'critical',
    title: 'Supply Chain Carbon Risk',
    description: 'New EU regulations may impact 34% of suppliers, potentially increasing Scope 3 emissions by 12%.',
    impact: { co2Reduction: -2940, costSaving: -340000, timeline: '12 months' },
    confidence: 92,
    category: 'Regulatory Compliance'
  },
  {
    id: 'insight-003',
    type: 'anomaly',
    priority: 'medium',
    title: 'Austin Facility Anomaly',
    description: 'Unusual spike in Scope 1 emissions detected (15% above baseline). Requires investigation.',
    impact: { co2Reduction: 450, costSaving: 67000, timeline: '2 weeks' },
    confidence: 76,
    category: 'Data Quality'
  },
  {
    id: 'insight-004',
    type: 'recommendation',
    priority: 'high',
    title: 'Renewable Energy Transition',
    description: 'Cost-benefit analysis shows optimal timing for 60% renewable transition across 3 facilities.',
    impact: { co2Reduction: 4200, costSaving: 890000, timeline: '18 months' },
    confidence: 94,
    category: 'Decarbonization'
  }
];

// Scenario Analysis Data
export const scenarioAnalyses: ScenarioAnalysis[] = [
  {
    scenario: 'Business as Usual',
    description: 'Continue current operations without additional interventions',
    probability: 100,
    impact: { emissions: 26800, cost: 1200000, timeline: '2025' },
    actions: ['Maintain existing efficiency programs', 'Monitor regulatory changes']
  },
  {
    scenario: 'Accelerated Decarbonization',
    description: 'Implement all high-impact reduction opportunities within 2 years',
    probability: 75,
    impact: { emissions: 16200, cost: 2400000, timeline: '2025' },
    actions: ['Renewable energy transition', 'Supply chain engagement', 'Technology upgrades']
  },
  {
    scenario: 'Regulatory Shock',
    description: 'New carbon pricing increases costs by 300% globally',
    probability: 30,
    impact: { emissions: 24500, cost: 3600000, timeline: '2025' },
    actions: ['Emergency decarbonization', 'Supply chain restructuring', 'Technology acceleration']
  },
  {
    scenario: 'Innovation Breakthrough',
    description: 'New carbon capture technology becomes cost-effective',
    probability: 45,
    impact: { emissions: 12000, cost: 800000, timeline: '2025' },
    actions: ['Technology deployment', 'R&D investment', 'Partnership development']
  }
];

// Financial Analysis Data
export const portfolioFinancials = {
  totalRevenue: 533000000,
  totalOpex: 192000000,
  carbonCosts: {
    current: 982000,
    projected2025: 1500000,
    projected2030: 2800000
  },
  decarbonizationInvestment: {
    required: 15200000,
    paybackPeriod: 4.2,
    roi: 23.5
  },
  riskExposure: {
    regulatory: 3400000,
    physical: 1800000,
    transition: 2200000,
    reputation: 900000
  }
};