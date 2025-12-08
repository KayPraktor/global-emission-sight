import { 
  Factory, 
  Zap, 
  Landmark, 
  Monitor, 
  Hospital, 
  ShoppingBag, 
  Truck, 
  Building2, 
  Wheat,
  HelpCircle,
  type LucideIcon
} from 'lucide-react';

export interface Industry {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
  color: string;
}

export const industries: Industry[] = [
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: Factory,
    description: 'Steel, cement, chemicals, automotive, pharmaceuticals',
    color: 'text-orange-500'
  },
  {
    id: 'energy_utilities',
    name: 'Energy & Utilities',
    icon: Zap,
    description: 'Power generation, oil & gas, renewables, water utilities',
    color: 'text-yellow-500'
  },
  {
    id: 'financial_services',
    name: 'Financial Services',
    icon: Landmark,
    description: 'Banking, insurance, asset management, real estate investment',
    color: 'text-blue-500'
  },
  {
    id: 'technology',
    name: 'Technology',
    icon: Monitor,
    description: 'Software, hardware, telecommunications',
    color: 'text-purple-500'
  },
  {
    id: 'healthcare_pharma',
    name: 'Healthcare & Pharma',
    icon: Hospital,
    description: 'Hospitals, medical devices, biotechnology',
    color: 'text-red-500'
  },
  {
    id: 'retail_consumer',
    name: 'Retail & Consumer',
    icon: ShoppingBag,
    description: 'Retail stores, e-commerce, consumer goods',
    color: 'text-pink-500'
  },
  {
    id: 'transportation_logistics',
    name: 'Transportation & Logistics',
    icon: Truck,
    description: 'Trucking, shipping, aviation, rail, warehousing',
    color: 'text-green-500'
  },
  {
    id: 'construction_real_estate',
    name: 'Construction & Real Estate',
    icon: Building2,
    description: 'Construction, commercial and residential real estate',
    color: 'text-amber-500'
  },
  {
    id: 'agriculture_food',
    name: 'Agriculture & Food',
    icon: Wheat,
    description: 'Farming, food processing, agribusiness',
    color: 'text-lime-500'
  },
  {
    id: 'other',
    name: 'Other',
    icon: HelpCircle,
    description: 'Other industries not listed above',
    color: 'text-gray-500'
  }
];

export const getIndustryById = (id: string): Industry | undefined => {
  return industries.find(i => i.id === id);
};

export const industryTips: Record<string, string[]> = {
  manufacturing: [
    'Focus on Scope 1 process emissions from production',
    'Consider fuel switching for industrial boilers',
    'Track energy intensity per unit produced',
    'Evaluate waste heat recovery opportunities'
  ],
  energy_utilities: [
    'Monitor carbon intensity per MWh',
    'Track methane emissions from operations',
    'Consider renewable energy transition pathways',
    'Evaluate grid losses and transmission efficiency'
  ],
  financial_services: [
    'Calculate financed emissions using PCAF methodology',
    'Track Scope 3 Category 15 investments',
    'Focus on data center efficiency',
    'Consider green financing opportunities'
  ],
  technology: [
    'Focus on data center PUE optimization',
    'Track cloud computing emissions',
    'Consider renewable energy procurement',
    'Evaluate supply chain emissions'
  ],
  healthcare_pharma: [
    'Track HVAC and cleanroom energy use',
    'Monitor medical gases and refrigerants',
    'Consider cold chain optimization',
    'Evaluate lab equipment efficiency'
  ],
  retail_consumer: [
    'Focus on store operations and refrigeration',
    'Track last-mile delivery emissions',
    'Consider packaging optimization',
    'Evaluate supply chain transparency'
  ],
  transportation_logistics: [
    'Track fleet fuel consumption',
    'Consider alternative fuels and EVs',
    'Monitor route optimization opportunities',
    'Evaluate modal shifts'
  ],
  construction_real_estate: [
    'Track embodied carbon in materials',
    'Monitor building operations efficiency',
    'Consider green building certifications',
    'Evaluate tenant engagement opportunities'
  ],
  agriculture_food: [
    'Track agricultural emissions (N2O, CH4)',
    'Monitor land use changes',
    'Consider regenerative practices',
    'Evaluate supply chain traceability'
  ],
  other: [
    'Start with a comprehensive emissions inventory',
    'Identify your biggest emission sources',
    'Set science-based targets',
    'Engage stakeholders in your climate journey'
  ]
};
