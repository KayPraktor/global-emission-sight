import { supabase } from "@/integrations/supabase/client";

export interface Supplier {
  id: string;
  organization_id: string;
  name: string;
  contact_email?: string;
  contact_name?: string;
  industry?: string;
  country_code?: string;
  city?: string;
  tier: 'tier_1' | 'tier_2' | 'tier_3';
  engagement_status: 'pending' | 'invited' | 'active' | 'unresponsive' | 'declined';
  emissions_data_quality?: 'primary' | 'secondary' | 'estimated' | 'spend_based';
  annual_spend?: number;
  spend_category?: string;
  spend_currency?: string;
  supplier_score?: number;
  cdp_score?: string;
  has_science_based_target?: boolean;
  last_data_submission?: string;
  data_validity_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierEmissions {
  id: string;
  supplier_id: string;
  organization_id: string;
  reporting_year: number;
  reporting_period_start?: string;
  reporting_period_end?: string;
  scope1_emissions?: number;
  scope2_emissions?: number;
  scope3_emissions?: number;
  total_emissions?: number;
  allocated_emissions?: number;
  allocation_method?: string;
  emission_intensity?: number;
  intensity_unit?: string;
  revenue?: number;
  methodology?: string;
  verification_status: 'unverified' | 'self_declared' | 'third_party_verified' | 'audited';
  verifier_name?: string;
  data_source?: string;
}

export interface SupplierEngagement {
  id: string;
  supplier_id: string;
  organization_id: string;
  engagement_type: 'survey' | 'data_request' | 'training' | 'audit' | 'collaboration';
  title: string;
  description?: string;
  sent_date?: string;
  due_date?: string;
  response_date?: string;
  status: 'pending' | 'sent' | 'viewed' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  request_details?: Record<string, unknown>;
  created_at?: string;
  response_data?: Record<string, unknown>;
}

export interface SupplierProduct {
  id: string;
  supplier_id: string;
  organization_id: string;
  product_name: string;
  product_code?: string;
  category?: string;
  unit: string;
  quantity_purchased?: number;
  unit_price?: number;
  emission_factor?: number;
  emission_factor_unit?: string;
  emission_factor_source?: string;
  total_emissions?: number;
  scope3_category?: number;
}

export interface SupplierScorecard {
  supplier: Supplier;
  emissions: SupplierEmissions | null;
  score: {
    overall: number;
    dataQuality: number;
    engagement: number;
    performance: number;
  };
  cdpGrade: string;
  trend: 'improving' | 'stable' | 'declining';
  recommendations: string[];
}

class SupplierService {
  // Get all suppliers for an organization
  async getSuppliers(organizationId: string): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('organization_id', organizationId)
      .order('name');
    
    if (error) throw error;
    return (data || []) as Supplier[];
  }

  // Get a single supplier
  async getSupplier(supplierId: string): Promise<Supplier | null> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', supplierId)
      .single();
    
    if (error) throw error;
    return data as Supplier | null;
  }

  // Create a new supplier
  async createSupplier(supplier: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .insert(supplier)
      .select()
      .single();
    
    if (error) throw error;
    return data as Supplier;
  }

  // Update a supplier
  async updateSupplier(supplierId: string, updates: Partial<Supplier>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .update(updates)
      .eq('id', supplierId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Supplier;
  }

  // Delete a supplier
  async deleteSupplier(supplierId: string): Promise<void> {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id', supplierId);
    
    if (error) throw error;
  }

  // Get supplier emissions
  async getSupplierEmissions(supplierId: string, year?: number): Promise<SupplierEmissions[]> {
    let query = supabase
      .from('supplier_emissions')
      .select('*')
      .eq('supplier_id', supplierId)
      .order('reporting_year', { ascending: false });
    
    if (year) {
      query = query.eq('reporting_year', year);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as SupplierEmissions[];
  }

  // Save supplier emissions
  async saveSupplierEmissions(emissions: Omit<SupplierEmissions, 'id'>): Promise<SupplierEmissions> {
    const { data, error } = await supabase
      .from('supplier_emissions')
      .insert(emissions)
      .select()
      .single();
    
    if (error) throw error;
    return data as SupplierEmissions;
  }

  // Get supplier engagements
  async getSupplierEngagements(supplierId: string): Promise<SupplierEngagement[]> {
    const { data, error } = await supabase
      .from('supplier_engagements')
      .select('*')
      .eq('supplier_id', supplierId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return (data || []) as SupplierEngagement[];
  }

  // Create an engagement
  async createEngagement(engagement: Omit<SupplierEngagement, 'id' | 'created_at'>): Promise<SupplierEngagement> {
    const { data, error } = await supabase
      .from('supplier_engagements')
      .insert([engagement])
      .select()
      .single();
    
    if (error) throw error;
    return data as SupplierEngagement;
  }

  // Update engagement status
  async updateEngagementStatus(
    engagementId: string, 
    status: SupplierEngagement['status'],
    responseData?: Record<string, unknown>
  ): Promise<void> {
    const updates: Record<string, unknown> = { status };
    
    if (status === 'completed') {
      updates.response_date = new Date().toISOString();
    }
    if (responseData) {
      updates.response_data = responseData;
    }

    const { error } = await supabase
      .from('supplier_engagements')
      .update(updates)
      .eq('id', engagementId);
    
    if (error) throw error;
  }

  // Get supplier products
  async getSupplierProducts(supplierId: string): Promise<SupplierProduct[]> {
    const { data, error } = await supabase
      .from('supplier_products')
      .select('*')
      .eq('supplier_id', supplierId)
      .order('product_name');
    
    if (error) throw error;
    return (data || []) as SupplierProduct[];
  }

  // Add supplier product
  async addSupplierProduct(product: Omit<SupplierProduct, 'id'>): Promise<SupplierProduct> {
    const { data, error } = await supabase
      .from('supplier_products')
      .insert(product)
      .select()
      .single();
    
    if (error) throw error;
    return data as SupplierProduct;
  }

  // Get supplier scorecard
  async getSupplierScorecard(supplierId: string): Promise<SupplierScorecard> {
    const supplier = await this.getSupplier(supplierId);
    if (!supplier) throw new Error('Supplier not found');

    const emissions = await this.getSupplierEmissions(supplierId);
    const latestEmissions = emissions[0] || null;
    const engagements = await this.getSupplierEngagements(supplierId);

    // Calculate scores
    const dataQualityScore = this.calculateDataQualityScore(supplier, latestEmissions);
    const engagementScore = this.calculateEngagementScore(engagements);
    const performanceScore = this.calculatePerformanceScore(emissions);
    const overallScore = Math.round((dataQualityScore + engagementScore + performanceScore) / 3);

    // Determine CDP grade
    const cdpGrade = supplier.cdp_score || this.estimateCDPGrade(overallScore);

    // Determine trend
    const trend = this.determineTrend(emissions);

    // Generate recommendations
    const recommendations = this.generateRecommendations(supplier, latestEmissions, engagements);

    return {
      supplier,
      emissions: latestEmissions,
      score: {
        overall: overallScore,
        dataQuality: dataQualityScore,
        engagement: engagementScore,
        performance: performanceScore
      },
      cdpGrade,
      trend,
      recommendations
    };
  }

  // Calculate data quality score (0-100)
  private calculateDataQualityScore(supplier: Supplier, emissions: SupplierEmissions | null): number {
    let score = 0;

    // Has emissions data (+30)
    if (emissions) score += 30;

    // Data quality level
    const qualityScores: Record<string, number> = {
      'primary': 25,
      'secondary': 20,
      'estimated': 10,
      'spend_based': 5
    };
    score += qualityScores[supplier.emissions_data_quality || 'estimated'] || 10;

    // Verification status (+20)
    if (emissions) {
      const verificationScores: Record<string, number> = {
        'audited': 20,
        'third_party_verified': 15,
        'self_declared': 10,
        'unverified': 0
      };
      score += verificationScores[emissions.verification_status] || 0;
    }

    // Has SBT (+15)
    if (supplier.has_science_based_target) score += 15;

    // Recent data (+10)
    if (supplier.last_data_submission) {
      const daysSinceSubmission = Math.floor(
        (Date.now() - new Date(supplier.last_data_submission).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceSubmission < 365) score += 10;
    }

    return Math.min(100, score);
  }

  // Calculate engagement score (0-100)
  private calculateEngagementScore(engagements: SupplierEngagement[]): number {
    if (engagements.length === 0) return 0;

    const completedEngagements = engagements.filter(e => e.status === 'completed').length;
    const totalEngagements = engagements.length;
    const responseRate = (completedEngagements / totalEngagements) * 100;

    // Recent activity bonus
    const recentEngagements = engagements.filter(e => {
      const date = new Date(e.sent_date || e.created_at || '');
      return (Date.now() - date.getTime()) < 180 * 24 * 60 * 60 * 1000; // Last 6 months
    }).length;

    const activityBonus = Math.min(20, recentEngagements * 5);

    return Math.min(100, Math.round(responseRate * 0.8 + activityBonus));
  }

  // Calculate performance score based on emissions trend
  private calculatePerformanceScore(emissions: SupplierEmissions[]): number {
    if (emissions.length < 2) return 50; // Not enough data

    const sorted = [...emissions].sort((a, b) => a.reporting_year - b.reporting_year);
    const latest = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];

    if (!latest.total_emissions || !previous.total_emissions) return 50;

    const change = ((latest.total_emissions - previous.total_emissions) / previous.total_emissions) * 100;

    if (change <= -10) return 100;
    if (change <= -5) return 85;
    if (change <= 0) return 70;
    if (change <= 5) return 50;
    if (change <= 10) return 30;
    return 15;
  }

  // Estimate CDP grade from overall score
  private estimateCDPGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 70) return 'B';
    if (score >= 60) return 'B-';
    if (score >= 50) return 'C';
    if (score >= 40) return 'C-';
    if (score >= 30) return 'D';
    if (score >= 20) return 'D-';
    return 'F';
  }

  // Determine emissions trend
  private determineTrend(emissions: SupplierEmissions[]): 'improving' | 'stable' | 'declining' {
    if (emissions.length < 2) return 'stable';

    const sorted = [...emissions].sort((a, b) => a.reporting_year - b.reporting_year);
    const latest = sorted[sorted.length - 1];
    const previous = sorted[sorted.length - 2];

    if (!latest.total_emissions || !previous.total_emissions) return 'stable';

    const change = ((latest.total_emissions - previous.total_emissions) / previous.total_emissions) * 100;

    if (change <= -5) return 'improving';
    if (change >= 5) return 'declining';
    return 'stable';
  }

  // Generate recommendations
  private generateRecommendations(
    supplier: Supplier,
    emissions: SupplierEmissions | null,
    engagements: SupplierEngagement[]
  ): string[] {
    const recommendations: string[] = [];

    // Data quality recommendations
    if (!emissions) {
      recommendations.push('Request emissions data from this supplier');
    } else if (emissions.verification_status === 'unverified') {
      recommendations.push('Encourage third-party verification of emissions data');
    }

    // SBT recommendation
    if (!supplier.has_science_based_target) {
      recommendations.push('Engage supplier to set science-based targets');
    }

    // Engagement recommendations
    const recentEngagements = engagements.filter(e => {
      const date = new Date(e.sent_date || '');
      return (Date.now() - date.getTime()) < 90 * 24 * 60 * 60 * 1000;
    });
    if (recentEngagements.length === 0) {
      recommendations.push('Schedule a supplier engagement session');
    }

    // Tier-based recommendations
    if (supplier.tier === 'tier_1' && supplier.emissions_data_quality !== 'primary') {
      recommendations.push('Prioritize primary data collection for this Tier 1 supplier');
    }

    // Spend-based recommendations
    if (supplier.annual_spend && supplier.annual_spend > 1000000) {
      recommendations.push('Consider collaborative decarbonization project');
    }

    return recommendations.slice(0, 4); // Return max 4 recommendations
  }

  // Get supplier statistics
  async getSupplierStats(organizationId: string): Promise<{
    total: number;
    byTier: Record<string, number>;
    byStatus: Record<string, number>;
    byDataQuality: Record<string, number>;
    withSBT: number;
    averageScore: number;
  }> {
    const suppliers = await this.getSuppliers(organizationId);
    
    const byTier: Record<string, number> = { tier_1: 0, tier_2: 0, tier_3: 0 };
    const byStatus: Record<string, number> = {};
    const byDataQuality: Record<string, number> = {};
    let withSBT = 0;
    let totalScore = 0;

    suppliers.forEach(s => {
      byTier[s.tier] = (byTier[s.tier] || 0) + 1;
      byStatus[s.engagement_status] = (byStatus[s.engagement_status] || 0) + 1;
      byDataQuality[s.emissions_data_quality || 'unknown'] = (byDataQuality[s.emissions_data_quality || 'unknown'] || 0) + 1;
      if (s.has_science_based_target) withSBT++;
      totalScore += s.supplier_score || 0;
    });

    return {
      total: suppliers.length,
      byTier,
      byStatus,
      byDataQuality,
      withSBT,
      averageScore: suppliers.length > 0 ? Math.round(totalScore / suppliers.length) : 0
    };
  }

  // Bulk import suppliers from CSV data
  async bulkImportSuppliers(
    organizationId: string,
    suppliers: Array<{
      name: string;
      contact_email?: string;
      industry?: string;
      country_code?: string;
      tier?: string;
      annual_spend?: number;
      spend_category?: string;
    }>
  ): Promise<{ imported: number; errors: string[] }> {
    const errors: string[] = [];
    let imported = 0;

    for (const supplier of suppliers) {
      try {
        await this.createSupplier({
          organization_id: organizationId,
          name: supplier.name,
          contact_email: supplier.contact_email,
          industry: supplier.industry,
          country_code: supplier.country_code,
          tier: (supplier.tier as 'tier_1' | 'tier_2' | 'tier_3') || 'tier_1',
          engagement_status: 'pending',
          annual_spend: supplier.annual_spend,
          spend_category: supplier.spend_category
        });
        imported++;
      } catch (error) {
        errors.push(`Failed to import ${supplier.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { imported, errors };
  }
}

export const supplierService = new SupplierService();
