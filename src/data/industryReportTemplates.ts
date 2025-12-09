// Industry-specific report templates configuration

export interface IndustryReportTemplate {
  id: string;
  title: string;
  description: string;
  industry: string;
  subIndustry?: string;
  categories: string[];
  tags: string[];
  format: string;
  sections: {
    id: string;
    title: string;
    description: string;
    required: boolean;
  }[];
  complianceFrameworks: string[];
  previewImage?: string;
}

export const industryReportTemplates: IndustryReportTemplate[] = [
  // Manufacturing - General
  {
    id: 'mfg-ghg-inventory',
    title: 'Manufacturing GHG Inventory Report',
    description: 'Comprehensive greenhouse gas inventory for manufacturing operations following GHG Protocol.',
    industry: 'manufacturing',
    categories: ['ghg', 'manufacturing'],
    tags: ['GHG Protocol', 'Manufacturing', 'Annual'],
    format: 'PDF, Excel',
    sections: [
      { id: 'exec-summary', title: 'Executive Summary', description: 'High-level emissions overview', required: true },
      { id: 'scope1-breakdown', title: 'Scope 1 Process Emissions', description: 'Detailed breakdown of direct process emissions', required: true },
      { id: 'scope2-energy', title: 'Scope 2 Energy Consumption', description: 'Purchased electricity and steam analysis', required: true },
      { id: 'intensity-metrics', title: 'Production Intensity Metrics', description: 'Emissions per unit of production', required: true },
      { id: 'yoy-comparison', title: 'Year-over-Year Comparison', description: 'Trend analysis and progress tracking', required: false },
    ],
    complianceFrameworks: ['GHG Protocol', 'ISO 14064-1'],
  },
  // Manufacturing - Cement
  {
    id: 'cement-csrd',
    title: 'Cement Industry CSRD Report',
    description: 'CSRD-compliant sustainability report tailored for cement manufacturing.',
    industry: 'manufacturing',
    subIndustry: 'cement',
    categories: ['csrd', 'manufacturing'],
    tags: ['CSRD', 'Cement', 'EU Taxonomy'],
    format: 'PDF, Word',
    sections: [
      { id: 'clinker-emissions', title: 'Clinker Production Emissions', description: 'Calcination and fuel combustion breakdown', required: true },
      { id: 'clinker-ratio', title: 'Clinker-to-Cement Ratio Analysis', description: 'Cement blend and substitution analysis', required: true },
      { id: 'alternative-fuels', title: 'Alternative Fuels Usage', description: 'Waste-derived fuel utilization', required: true },
      { id: 'carbon-intensity', title: 'Carbon Intensity per Tonne', description: 'kgCO2e per tonne of cement', required: true },
      { id: 'eu-taxonomy', title: 'EU Taxonomy Alignment', description: 'Technical screening criteria assessment', required: false },
    ],
    complianceFrameworks: ['CSRD', 'EU Taxonomy', 'GCCA'],
  },
  // Manufacturing - Steel
  {
    id: 'steel-sec-disclosure',
    title: 'Steel Industry SEC Climate Disclosure',
    description: 'SEC climate-related financial disclosure for steel manufacturers.',
    industry: 'manufacturing',
    subIndustry: 'steel',
    categories: ['sec', 'manufacturing'],
    tags: ['SEC', 'Steel', 'Financial Disclosure'],
    format: 'PDF, Word',
    sections: [
      { id: 'production-pathway', title: 'Production Pathway Analysis', description: 'BF-BOF vs EAF emissions comparison', required: true },
      { id: 'coking-emissions', title: 'Coking Coal Emissions', description: 'Coke production and consumption analysis', required: true },
      { id: 'scrap-utilization', title: 'Scrap Input Analysis', description: 'Recycled content and circularity metrics', required: true },
      { id: 'transition-risk', title: 'Transition Risk Assessment', description: 'Decarbonization pathway and stranded asset risk', required: true },
      { id: 'physical-risk', title: 'Physical Climate Risk', description: 'Supply chain and operational vulnerabilities', required: false },
    ],
    complianceFrameworks: ['SEC Climate Disclosure', 'TCFD', 'ResponsibleSteel'],
  },
  // Manufacturing - Automotive
  {
    id: 'automotive-cdp',
    title: 'Automotive CDP Climate Response',
    description: 'CDP questionnaire response template for automotive manufacturers.',
    industry: 'manufacturing',
    subIndustry: 'automotive',
    categories: ['cdp', 'manufacturing'],
    tags: ['CDP', 'Automotive', 'Supply Chain'],
    format: 'Excel, PDF',
    sections: [
      { id: 'scope1-manufacturing', title: 'Manufacturing Emissions', description: 'Paint shop, stamping, assembly operations', required: true },
      { id: 'scope2-electricity', title: 'Electricity Procurement', description: 'Grid and renewable energy analysis', required: true },
      { id: 'scope3-supply', title: 'Supply Chain Emissions', description: 'Tier 1 and Tier 2 supplier emissions', required: true },
      { id: 'product-lifecycle', title: 'Product Lifecycle Emissions', description: 'Use-phase and end-of-life analysis', required: true },
      { id: 'ev-transition', title: 'EV Transition Roadmap', description: 'Electrification strategy and targets', required: false },
    ],
    complianceFrameworks: ['CDP', 'GHG Protocol', 'IATF 16949'],
  },
  // Energy Sector
  {
    id: 'energy-tcfd',
    title: 'Energy Sector TCFD Report',
    description: 'TCFD-aligned climate disclosure for energy companies.',
    industry: 'energy',
    categories: ['tcfd', 'energy'],
    tags: ['TCFD', 'Energy', 'Climate Risk'],
    format: 'PDF, Word',
    sections: [
      { id: 'governance', title: 'Climate Governance', description: 'Board oversight and management processes', required: true },
      { id: 'strategy', title: 'Climate Strategy', description: 'Transition and physical risk scenarios', required: true },
      { id: 'risk-management', title: 'Risk Management', description: 'Climate risk identification and mitigation', required: true },
      { id: 'metrics-targets', title: 'Metrics and Targets', description: 'Emissions reduction targets and progress', required: true },
      { id: 'scenario-analysis', title: 'Scenario Analysis', description: '1.5°C and 2°C pathway alignment', required: false },
    ],
    complianceFrameworks: ['TCFD', 'SASB Energy', 'IEA Net Zero'],
  },
  // Financial Services
  {
    id: 'financial-pcaf',
    title: 'PCAF Financed Emissions Report',
    description: 'Partnership for Carbon Accounting Financials (PCAF) compliant report.',
    industry: 'financial_services',
    categories: ['pcaf', 'financial'],
    tags: ['PCAF', 'Financed Emissions', 'Portfolio'],
    format: 'PDF, Excel',
    sections: [
      { id: 'operational', title: 'Operational Emissions', description: 'Scope 1, 2, and 3 operational footprint', required: true },
      { id: 'financed-overview', title: 'Financed Emissions Overview', description: 'Portfolio carbon footprint summary', required: true },
      { id: 'asset-breakdown', title: 'Asset Class Breakdown', description: 'Emissions by listed equity, corporate bonds, mortgages', required: true },
      { id: 'sector-exposure', title: 'Sector Exposure Analysis', description: 'High-carbon sector allocation and risk', required: true },
      { id: 'nzba-targets', title: 'NZBA Target Progress', description: 'Net Zero Banking Alliance alignment', required: false },
    ],
    complianceFrameworks: ['PCAF', 'NZBA', 'TCFD Financial'],
  },
  // Healthcare
  {
    id: 'healthcare-sustainability',
    title: 'Healthcare Sustainability Report',
    description: 'Sustainability report for healthcare organizations with NHS Net Zero alignment.',
    industry: 'healthcare',
    categories: ['sustainability', 'healthcare'],
    tags: ['Healthcare', 'NHS Net Zero', 'Sustainability'],
    format: 'PDF, Word',
    sections: [
      { id: 'building-energy', title: 'Building Energy', description: 'Hospital and clinic energy consumption', required: true },
      { id: 'anesthetic-gases', title: 'Anesthetic Gas Emissions', description: 'Desflurane, sevoflurane, N2O usage', required: true },
      { id: 'supply-chain', title: 'Supply Chain Emissions', description: 'Medical devices, pharmaceuticals, consumables', required: true },
      { id: 'patient-transport', title: 'Patient & Staff Transport', description: 'Ambulances, staff commuting, patient travel', required: true },
      { id: 'clinical-waste', title: 'Clinical Waste', description: 'Incineration and disposal emissions', required: false },
    ],
    complianceFrameworks: ['NHS Net Zero', 'GHG Protocol', 'Healthcare Sustainability'],
  },
  // Technology
  {
    id: 'tech-data-center',
    title: 'Technology & Data Center Report',
    description: 'Carbon disclosure for tech companies with data center operations.',
    industry: 'technology',
    categories: ['tech', 'data-center'],
    tags: ['Technology', 'Data Center', 'PUE'],
    format: 'PDF, Excel',
    sections: [
      { id: 'data-center-energy', title: 'Data Center Energy', description: 'PUE, server efficiency, cooling systems', required: true },
      { id: 'renewable-procurement', title: 'Renewable Energy', description: 'PPAs, RECs, and 24/7 carbon-free energy', required: true },
      { id: 'cloud-emissions', title: 'Cloud Services Footprint', description: 'Customer cloud usage and allocation', required: true },
      { id: 'hardware-lifecycle', title: 'Hardware Lifecycle', description: 'Embodied carbon and e-waste', required: true },
      { id: 'remote-work', title: 'Remote Work Emissions', description: 'Employee work-from-home footprint', required: false },
    ],
    complianceFrameworks: ['RE100', 'GHG Protocol', 'The Green Grid'],
  },
  // Retail
  {
    id: 'retail-sustainability',
    title: 'Retail Sustainability Report',
    description: 'Comprehensive sustainability report for retail operations.',
    industry: 'retail',
    categories: ['sustainability', 'retail'],
    tags: ['Retail', 'Supply Chain', 'Scope 3'],
    format: 'PDF, Word',
    sections: [
      { id: 'store-operations', title: 'Store Operations', description: 'Energy, refrigeration, and lighting', required: true },
      { id: 'logistics', title: 'Logistics & Distribution', description: 'Fleet emissions and last-mile delivery', required: true },
      { id: 'product-footprint', title: 'Product Carbon Footprint', description: 'Purchased goods and services', required: true },
      { id: 'waste-circularity', title: 'Waste & Circularity', description: 'Packaging, returns, and recycling', required: true },
      { id: 'customer-use', title: 'Customer Use Phase', description: 'Product use and end-of-life emissions', required: false },
    ],
    complianceFrameworks: ['GHG Protocol Scope 3', 'CDP Supply Chain', 'SBTi'],
  },
];

export function getTemplatesForIndustry(industry: string, subIndustry?: string | null): IndustryReportTemplate[] {
  const templates: IndustryReportTemplate[] = [];
  
  // Get exact sub-industry matches first
  if (subIndustry) {
    templates.push(
      ...industryReportTemplates.filter(
        t => t.industry.toLowerCase() === industry.toLowerCase() && 
             t.subIndustry?.toLowerCase() === subIndustry.toLowerCase()
      )
    );
  }
  
  // Add general industry templates (without subIndustry)
  templates.push(
    ...industryReportTemplates.filter(
      t => t.industry.toLowerCase() === industry.toLowerCase() && !t.subIndustry
    )
  );
  
  return templates;
}

export function getAllTemplates(): IndustryReportTemplate[] {
  return industryReportTemplates;
}
