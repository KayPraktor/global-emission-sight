export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  pinnedKPIs: string[];
  widgetOrder: string[];
}

export const DASHBOARD_TEMPLATES: DashboardTemplate[] = [
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    description: 'High-level KPIs for executive oversight and strategic decision-making',
    icon: 'briefcase',
    pinnedKPIs: [
      'Total Emissions',
      'Net Zero Progress',
      'Carbon Cost',
      'Compliance Score',
      'Risk Exposure',
      'YoY Reduction'
    ],
    widgetOrder: ['kpis', 'netZero', 'insights', 'compliance']
  },
  {
    id: 'operational-focus',
    name: 'Operational Focus',
    description: 'Detailed operational metrics for day-to-day management',
    icon: 'cog',
    pinnedKPIs: [
      'Scope 1 Emissions',
      'Scope 2 Emissions',
      'Scope 3 Emissions',
      'Carbon Intensity',
      'Data Quality Score',
      'Monthly Trend'
    ],
    widgetOrder: ['kpis', 'insights', 'scenarios', 'compliance']
  },
  {
    id: 'compliance-focus',
    name: 'Compliance Focus',
    description: 'Regulatory compliance and reporting metrics',
    icon: 'shield-check',
    pinnedKPIs: [
      'Compliance Score',
      'Risk Exposure',
      'Reporting Readiness',
      'Data Quality Score',
      'Verification Status',
      'Total Emissions'
    ],
    widgetOrder: ['compliance', 'kpis', 'insights', 'scenarios']
  },
  {
    id: 'sustainability-strategy',
    name: 'Sustainability Strategy',
    description: 'Long-term planning and scenario analysis',
    icon: 'target',
    pinnedKPIs: [
      'Net Zero Progress',
      'Target Achievement',
      'Carbon Cost',
      'Investment Required',
      'Reduction Potential',
      'YoY Reduction'
    ],
    widgetOrder: ['netZero', 'scenarios', 'insights', 'kpis']
  },
  {
    id: 'full-overview',
    name: 'Full Overview',
    description: 'Complete dashboard with all available widgets and KPIs',
    icon: 'layout-dashboard',
    pinnedKPIs: [
      'Total Emissions',
      'Scope 1 Emissions',
      'Scope 2 Emissions',
      'Scope 3 Emissions',
      'Carbon Intensity',
      'Net Zero Progress',
      'Compliance Score',
      'Carbon Cost'
    ],
    widgetOrder: ['kpis', 'netZero', 'insights', 'scenarios', 'compliance']
  }
];
