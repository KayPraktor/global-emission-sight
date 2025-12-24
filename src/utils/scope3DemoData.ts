// Demo data for Scope 3 dashboard - realistic emissions across all 15 categories

export interface DemoScope3Summary {
  category_number: number;
  category_name: string;
  emissions_tco2e: number;
  data_quality: string;
  supplier_data_percentage: number;
  spend_based_percentage: number;
  industry_average_percentage: number;
}

export interface DemoScope3Hotspot {
  category_number: number;
  category_name: string;
  emissions_tco2e: number;
  percentage_of_total: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  top_contributors: {
    name: string;
    emissions: number;
    type: 'supplier' | 'activity';
  }[];
  reduction_potential: number;
  recommended_actions: string[];
}

// Realistic demo data based on typical manufacturing company Scope 3 profile
export const DEMO_SCOPE3_SUMMARY: DemoScope3Summary[] = [
  {
    category_number: 1,
    category_name: 'Purchased Goods & Services',
    emissions_tco2e: 45200,
    data_quality: 'secondary',
    supplier_data_percentage: 35,
    spend_based_percentage: 55,
    industry_average_percentage: 10
  },
  {
    category_number: 2,
    category_name: 'Capital Goods',
    emissions_tco2e: 8400,
    data_quality: 'spend_based',
    supplier_data_percentage: 10,
    spend_based_percentage: 80,
    industry_average_percentage: 10
  },
  {
    category_number: 3,
    category_name: 'Fuel & Energy Related Activities',
    emissions_tco2e: 6200,
    data_quality: 'primary',
    supplier_data_percentage: 85,
    spend_based_percentage: 15,
    industry_average_percentage: 0
  },
  {
    category_number: 4,
    category_name: 'Upstream Transportation & Distribution',
    emissions_tco2e: 12800,
    data_quality: 'secondary',
    supplier_data_percentage: 45,
    spend_based_percentage: 40,
    industry_average_percentage: 15
  },
  {
    category_number: 5,
    category_name: 'Waste Generated in Operations',
    emissions_tco2e: 2100,
    data_quality: 'primary',
    supplier_data_percentage: 90,
    spend_based_percentage: 10,
    industry_average_percentage: 0
  },
  {
    category_number: 6,
    category_name: 'Business Travel',
    emissions_tco2e: 3400,
    data_quality: 'primary',
    supplier_data_percentage: 95,
    spend_based_percentage: 5,
    industry_average_percentage: 0
  },
  {
    category_number: 7,
    category_name: 'Employee Commuting',
    emissions_tco2e: 4200,
    data_quality: 'estimated',
    supplier_data_percentage: 20,
    spend_based_percentage: 30,
    industry_average_percentage: 50
  },
  {
    category_number: 8,
    category_name: 'Upstream Leased Assets',
    emissions_tco2e: 1800,
    data_quality: 'secondary',
    supplier_data_percentage: 60,
    spend_based_percentage: 30,
    industry_average_percentage: 10
  },
  {
    category_number: 9,
    category_name: 'Downstream Transportation & Distribution',
    emissions_tco2e: 9600,
    data_quality: 'estimated',
    supplier_data_percentage: 25,
    spend_based_percentage: 50,
    industry_average_percentage: 25
  },
  {
    category_number: 10,
    category_name: 'Processing of Sold Products',
    emissions_tco2e: 5400,
    data_quality: 'spend_based',
    supplier_data_percentage: 15,
    spend_based_percentage: 70,
    industry_average_percentage: 15
  },
  {
    category_number: 11,
    category_name: 'Use of Sold Products',
    emissions_tco2e: 32000,
    data_quality: 'estimated',
    supplier_data_percentage: 0,
    spend_based_percentage: 40,
    industry_average_percentage: 60
  },
  {
    category_number: 12,
    category_name: 'End-of-Life Treatment of Sold Products',
    emissions_tco2e: 4800,
    data_quality: 'estimated',
    supplier_data_percentage: 10,
    spend_based_percentage: 30,
    industry_average_percentage: 60
  },
  {
    category_number: 13,
    category_name: 'Downstream Leased Assets',
    emissions_tco2e: 1200,
    data_quality: 'secondary',
    supplier_data_percentage: 55,
    spend_based_percentage: 35,
    industry_average_percentage: 10
  },
  {
    category_number: 14,
    category_name: 'Franchises',
    emissions_tco2e: 0,
    data_quality: 'none',
    supplier_data_percentage: 0,
    spend_based_percentage: 0,
    industry_average_percentage: 0
  },
  {
    category_number: 15,
    category_name: 'Investments',
    emissions_tco2e: 2400,
    data_quality: 'spend_based',
    supplier_data_percentage: 20,
    spend_based_percentage: 70,
    industry_average_percentage: 10
  }
];

// Calculate totals from demo data
export function getDemoScope3Totals(): { total: number; upstream: number; downstream: number } {
  let upstream = 0;
  let downstream = 0;

  DEMO_SCOPE3_SUMMARY.forEach(cat => {
    if (cat.category_number <= 8) {
      upstream += cat.emissions_tco2e;
    } else {
      downstream += cat.emissions_tco2e;
    }
  });

  return {
    total: upstream + downstream,
    upstream,
    downstream
  };
}

// Get data quality score from demo data
export function getDemoDataQualityScore(): { score: number; breakdown: Record<string, number> } {
  const qualityWeights: Record<string, number> = {
    'primary': 100,
    'secondary': 75,
    'estimated': 50,
    'spend_based': 25,
    'none': 0
  };

  let totalScore = 0;
  let countWithData = 0;
  const breakdown: Record<string, number> = {
    'primary': 0,
    'secondary': 0,
    'estimated': 0,
    'spend_based': 0
  };

  DEMO_SCOPE3_SUMMARY.forEach(cat => {
    if (cat.emissions_tco2e > 0) {
      const quality = cat.data_quality;
      totalScore += qualityWeights[quality] || 50;
      countWithData++;
      if (breakdown[quality] !== undefined) {
        breakdown[quality]++;
      }
    }
  });

  return {
    score: countWithData > 0 ? Math.round(totalScore / countWithData) : 0,
    breakdown
  };
}

// Generate demo hotspots
export function getDemoHotspots(): DemoScope3Hotspot[] {
  const totals = getDemoScope3Totals();
  
  const recommendedActions: Record<number, string[]> = {
    1: [
      'Engage top 20 suppliers to set science-based targets',
      'Switch to recycled/low-carbon materials for packaging',
      'Implement sustainable procurement scorecard'
    ],
    11: [
      'Redesign products for energy efficiency',
      'Develop product longevity programs',
      'Create customer guidance on sustainable use'
    ],
    4: [
      'Shift 30% of air freight to sea/rail transport',
      'Consolidate shipments from suppliers',
      'Partner with logistics providers using EVs'
    ],
    9: [
      'Optimize last-mile delivery routes',
      'Introduce electric delivery fleet',
      'Offer customer pickup points'
    ],
    2: [
      'Extend equipment lifecycle by 25%',
      'Source refurbished IT equipment',
      'Implement asset sharing programs'
    ]
  };

  const topContributors: Record<number, { name: string; emissions: number; type: 'supplier' | 'activity' }[]> = {
    1: [
      { name: 'Global Components Ltd', emissions: 12500, type: 'supplier' },
      { name: 'Precision Materials Inc', emissions: 8200, type: 'supplier' },
      { name: 'Pacific Polymers Co', emissions: 6800, type: 'supplier' }
    ],
    11: [
      { name: 'Product Usage Phase', emissions: 24000, type: 'activity' },
      { name: 'Energy Consumption', emissions: 8000, type: 'activity' }
    ],
    4: [
      { name: 'FastFreight Logistics', emissions: 4500, type: 'supplier' },
      { name: 'Continental Shipping', emissions: 3800, type: 'supplier' },
      { name: 'AirCargo Express', emissions: 2100, type: 'supplier' }
    ],
    9: [
      { name: 'Regional Distribution', emissions: 4200, type: 'activity' },
      { name: 'Last-Mile Delivery', emissions: 3100, type: 'activity' },
      { name: 'Export Shipping', emissions: 2300, type: 'activity' }
    ],
    2: [
      { name: 'Manufacturing Equipment', emissions: 4200, type: 'activity' },
      { name: 'IT Infrastructure', emissions: 2800, type: 'activity' },
      { name: 'Facility Construction', emissions: 1400, type: 'activity' }
    ]
  };

  const trends: Record<number, 'increasing' | 'decreasing' | 'stable'> = {
    1: 'decreasing',
    11: 'stable',
    4: 'decreasing',
    9: 'increasing',
    2: 'stable'
  };

  const reductionPotentials: Record<number, number> = {
    1: 25,
    11: 30,
    4: 35,
    9: 28,
    2: 15
  };

  return DEMO_SCOPE3_SUMMARY
    .filter(cat => cat.emissions_tco2e > 0)
    .sort((a, b) => b.emissions_tco2e - a.emissions_tco2e)
    .slice(0, 5)
    .map(cat => ({
      category_number: cat.category_number,
      category_name: cat.category_name,
      emissions_tco2e: cat.emissions_tco2e,
      percentage_of_total: (cat.emissions_tco2e / totals.total) * 100,
      trend: trends[cat.category_number] || 'stable',
      top_contributors: topContributors[cat.category_number] || [],
      reduction_potential: reductionPotentials[cat.category_number] || 20,
      recommended_actions: recommendedActions[cat.category_number] || [
        'Review and assess emission reduction opportunities',
        'Engage stakeholders on sustainability goals',
        'Implement monitoring and tracking systems'
      ]
    }));
}
