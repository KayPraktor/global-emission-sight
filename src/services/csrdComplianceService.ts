import { supabase } from '@/integrations/supabase/client';
import {
  DisclosureStatus,
  DataGap,
  ComplianceReadiness,
  ESRS_E1_DISCLOSURES,
  ISSB_S2_DISCLOSURES,
  ESRS_E1_Disclosure,
  GHGEmissionMetrics,
} from '@/types/esrs-compliance';

class CSRDComplianceService {
  /**
   * Analyzes organization data against ESRS E1 disclosure requirements.
   *
   * @description Fetches emissions, goals, facilities, and materiality
   * assessments, then evaluates each ESRS E1 disclosure for completeness.
   * The overall score is a weighted blend of disclosure completeness (80%)
   * and materiality coverage (20%).
   *
   * @param organizationId - UUID of the organization to assess
   * @returns Disclosure statuses, blended overall score, and materiality score
   */
  async analyzeESRSCompliance(organizationId: string): Promise<{
    disclosures: DisclosureStatus[];
    overallScore: number;
    materialityScore: number;
  }> {
    const disclosures: DisclosureStatus[] = [];

    // Get emissions data
    const { data: emissions } = await supabase
      .from('emissions_entries')
      .select('*, calculations(calculated_emissions)')
      .eq('organization_id', organizationId);

    // Get goals data
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('organization_id', organizationId);

    // Get facilities data
    const { data: facilities } = await supabase
      .from('facilities')
      .select('*')
      .eq('organization_id', organizationId);

    // Get materiality assessments
    const { data: materialityAssessments } = await supabase
      .from('materiality_assessments')
      .select('*')
      .eq('organization_id', organizationId);

    // Analyze each ESRS E1 disclosure
    for (const disclosure of ESRS_E1_DISCLOSURES) {
      const status = this.assessDisclosureStatus(disclosure.id, {
        emissions,
        goals,
        facilities,
        materialityAssessments,
      });
      disclosures.push({
        id: disclosure.id,
        disclosureStandard: 'ESRS_E1',
        disclosureId: disclosure.id,
        disclosureName: disclosure.name,
        status: status.status,
        completenessScore: status.score,
        dataQualityScore: status.quality,
        lastUpdated: new Date().toISOString(),
      });
    }

    // Calculate materiality contribution to overall score
    const totalAssessments = materialityAssessments?.length || 0;
    const materialTopics = materialityAssessments?.filter(a => a.is_material) || [];
    const materialityScore = totalAssessments > 0
      ? Math.round((totalAssessments / 26) * 100) // 26 = total ESRS topics
      : 0;

    // Blend: 80% disclosure-based, 20% materiality-based
    const disclosureScore = Math.round(
      disclosures.reduce((sum, d) => sum + d.completenessScore, 0) / disclosures.length
    );
    const overallScore = Math.round(disclosureScore * 0.8 + materialityScore * 0.2);

    return { disclosures, overallScore, materialityScore };
  }

  /**
   * Generate data gap report
   */
  async generateDataGapReport(organizationId: string): Promise<DataGap[]> {
    const gaps: DataGap[] = [];
    
    // Check emissions data completeness
    const { data: emissions, count: emissionsCount } = await supabase
      .from('emissions_entries')
      .select('scope, category', { count: 'exact' })
      .eq('organization_id', organizationId);

    // Check for missing scopes - handle both enum formats (S1/S2/S3 and scope_1/scope_2/scope_3)
    const scopeValues = emissions?.map(e => e.scope?.toString().toLowerCase()) || [];
    const hasScope1 = scopeValues.some(s => s === 's1' || s === 'scope_1');
    const hasScope2 = scopeValues.some(s => s === 's2' || s === 'scope_2');
    const hasScope3 = scopeValues.some(s => s === 's3' || s === 'scope_3');
    
    if (!hasScope1) {
      gaps.push({
        id: 'gap-scope1',
        disclosureId: 'E1-6',
        disclosureName: 'GHG Emissions',
        gapType: 'missing_data',
        description: 'No Scope 1 emissions data found',
        severity: 'critical',
        recommendation: 'Add direct emissions from owned/controlled sources (stationary combustion, mobile combustion, fugitive emissions)',
        estimatedEffort: 'medium',
        resolutionStatus: 'open',
      });
    }

    if (!hasScope2) {
      gaps.push({
        id: 'gap-scope2',
        disclosureId: 'E1-6',
        disclosureName: 'GHG Emissions',
        gapType: 'missing_data',
        description: 'No Scope 2 emissions data found',
        severity: 'critical',
        recommendation: 'Add indirect emissions from purchased electricity, steam, heating, and cooling',
        estimatedEffort: 'low',
        resolutionStatus: 'open',
      });
    }

    if (!hasScope3) {
      gaps.push({
        id: 'gap-scope3',
        disclosureId: 'E1-6',
        disclosureName: 'GHG Emissions',
        gapType: 'coverage_gap',
        description: 'No Scope 3 emissions data found',
        severity: 'high',
        recommendation: 'Add value chain emissions - start with material categories like purchased goods, business travel, and employee commuting',
        estimatedEffort: 'high',
        resolutionStatus: 'open',
      });
    }

    // Check for climate targets
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('organization_id', organizationId);

    if (!goals || goals.length === 0) {
      gaps.push({
        id: 'gap-targets',
        disclosureId: 'E1-4',
        disclosureName: 'Climate Targets',
        gapType: 'missing_data',
        description: 'No climate reduction targets defined',
        severity: 'critical',
        recommendation: 'Set science-based targets for emissions reduction aligned with 1.5°C pathway',
        estimatedEffort: 'medium',
        resolutionStatus: 'open',
      });
    }

    // Check for transition plan indicators
    const hasNetZeroGoal = goals?.some(g => 
      g.title?.toLowerCase().includes('net zero') || 
      g.title?.toLowerCase().includes('carbon neutral')
    );

    if (!hasNetZeroGoal) {
      gaps.push({
        id: 'gap-transition',
        disclosureId: 'E1-1',
        disclosureName: 'Transition Plan',
        gapType: 'missing_data',
        description: 'No transition plan or net-zero target documented',
        severity: 'high',
        recommendation: 'Develop a climate transition plan with interim milestones and resource allocation',
        estimatedEffort: 'high',
        resolutionStatus: 'open',
      });
    }

    // Check data quality
    const { data: qualityMetrics } = await supabase
      .from('data_quality_metrics')
      .select('*')
      .eq('organization_id', organizationId)
      .order('metric_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (qualityMetrics && qualityMetrics.completeness_score && qualityMetrics.completeness_score < 80) {
      gaps.push({
        id: 'gap-quality',
        disclosureId: 'E1-6',
        disclosureName: 'Data Quality',
        gapType: 'quality_issue',
        description: `Data completeness score is ${qualityMetrics.completeness_score}% (target: 80%+)`,
        severity: 'medium',
        recommendation: 'Review and complete missing data fields, verify emission factors, and document estimation methodologies',
        estimatedEffort: 'medium',
        resolutionStatus: 'open',
      });
    }

    // Check for energy data
    const hasEnergyData = emissions?.some(e => 
      e.category?.toLowerCase().includes('electricity') ||
      e.category?.toLowerCase().includes('energy')
    );

    if (!hasEnergyData) {
      gaps.push({
        id: 'gap-energy',
        disclosureId: 'E1-5',
        disclosureName: 'Energy Consumption',
        gapType: 'missing_data',
        description: 'Energy consumption breakdown not documented',
        severity: 'medium',
        recommendation: 'Add detailed energy consumption data including renewable vs non-renewable breakdown',
        estimatedEffort: 'low',
        resolutionStatus: 'open',
      });
    }

    // Check for materiality assessments (ESRS 2 IRO-1 requirement)
    const { data: materialityAssessments } = await supabase
      .from('materiality_assessments')
      .select('id, is_material, topic_category')
      .eq('organization_id', organizationId);

    if (!materialityAssessments || materialityAssessments.length === 0) {
      gaps.push({
        id: 'gap-materiality',
        disclosureId: 'ESRS2-IRO1',
        disclosureName: 'Double Materiality Assessment',
        gapType: 'missing_data',
        description: 'No double materiality assessment completed — required by ESRS 2 IRO-1',
        severity: 'critical',
        recommendation: 'Complete a double materiality assessment covering all ESRS topics to identify material sustainability matters',
        estimatedEffort: 'high',
        resolutionStatus: 'open',
      });
    } else {
      const materialCount = materialityAssessments.filter(a => a.is_material).length;
      const envCount = materialityAssessments.filter(a => a.topic_category === 'environmental').length;
      const socCount = materialityAssessments.filter(a => a.topic_category === 'social').length;
      const govCount = materialityAssessments.filter(a => a.topic_category === 'governance').length;

      if (envCount === 0 || socCount === 0 || govCount === 0) {
        const missing = [
          envCount === 0 ? 'Environmental' : null,
          socCount === 0 ? 'Social' : null,
          govCount === 0 ? 'Governance' : null,
        ].filter(Boolean).join(', ');

        gaps.push({
          id: 'gap-materiality-coverage',
          disclosureId: 'ESRS2-IRO1',
          disclosureName: 'Double Materiality Assessment',
          gapType: 'coverage_gap',
          description: `Materiality assessment incomplete — missing: ${missing}`,
          severity: 'high',
          recommendation: `Complete assessments for ${missing} topics to ensure full ESRS coverage`,
          estimatedEffort: 'medium',
          resolutionStatus: 'open',
        });
      }
    }

    return gaps;
  }

  /**
   * Map emissions data to ESRS disclosure format
   */
  async mapToESRSFormat(organizationId: string): Promise<Partial<ESRS_E1_Disclosure>> {
    // Get all emissions with calculations
    const { data: entries } = await supabase
      .from('emissions_entries')
      .select('*, calculations(calculated_emissions)')
      .eq('organization_id', organizationId);

    const year = new Date().getFullYear();

    // Calculate totals by scope
    let scope1Total = 0;
    let scope2Total = 0;
    let scope3Total = 0;
    const scope3ByCategory: GHGEmissionMetrics['scope3ByCategory'] = [];

    entries?.forEach(entry => {
      const emissions = entry.calculations?.[0]?.calculated_emissions || 0;
      const scope = entry.scope?.toLowerCase();
      
      if (scope === 'scope_1' || scope === 's1') {
        scope1Total += emissions;
      } else if (scope === 'scope_2' || scope === 's2') {
        scope2Total += emissions;
      } else if (scope === 'scope_3' || scope === 's3') {
        scope3Total += emissions;
        
        // Group by category
        const existingCategory = scope3ByCategory.find(c => c.name === entry.category);
        if (existingCategory) {
          existingCategory.emissions += emissions;
        } else {
          scope3ByCategory.push({
            category: scope3ByCategory.length + 1,
            name: entry.category,
            emissions,
            dataQuality: 'secondary',
          });
        }
      }
    });

    // Get goals for targets
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('organization_id', organizationId);

    return {
      ghgEmissions: {
        scope1Total,
        scope2LocationBased: scope2Total,
        scope2MarketBased: scope2Total, // Would need separate tracking for market-based
        scope3Total,
        scope3ByCategory,
        totalEmissions: scope1Total + scope2Total + scope3Total,
        biogenicEmissions: 0, // Would need separate tracking
        year,
        methodology: 'GHG Protocol Corporate Standard',
        verificationStatus: 'unverified',
      },
      climateTargets: goals?.map(goal => ({
        id: goal.id,
        name: goal.title,
        targetType: goal.target_reduction_percentage ? 'intensity' as const : 'absolute' as const,
        scope: goal.scope_covered || ['scope_1', 'scope_2'],
        baselineYear: goal.baseline_year || year - 1,
        baselineValue: goal.baseline_emissions || 0,
        targetYear: new Date(goal.target_date).getFullYear(),
        targetValue: goal.target_emissions || 0,
        currentProgress: goal.progress_percentage || 0,
        isScieneBased: false,
        verificationStatus: 'pending' as const,
      })) || [],
    };
  }

  /**
   * Calculates the overall CSRD readiness score and builds a compliance
   * roadmap timeline with recommendations.
   *
   * @param organizationId - UUID of the organization
   * @returns {Promise<ComplianceReadiness>} Score, disclosure details,
   *          critical gaps, timeline milestones, and recommendations
   */
  async calculateReadinessScore(organizationId: string): Promise<ComplianceReadiness> {
    const { disclosures, overallScore } = await this.analyzeESRSCompliance(organizationId);
    const gaps = await this.generateDataGapReport(organizationId);

    const criticalGaps = gaps.filter(g => g.severity === 'critical' || g.severity === 'high');

    // Generate timeline based on typical CSRD deadlines
    const currentYear = new Date().getFullYear();
    const timeline = [
      {
        milestone: 'Data collection complete',
        dueDate: `${currentYear}-12-31`,
        status: overallScore >= 60 ? 'on_track' as const : 'at_risk' as const,
      },
      {
        milestone: 'Gap remediation',
        dueDate: `${currentYear + 1}-03-31`,
        status: criticalGaps.length === 0 ? 'on_track' as const : 'pending' as const,
      },
      {
        milestone: 'Internal review',
        dueDate: `${currentYear + 1}-06-30`,
        status: 'pending' as const,
      },
      {
        milestone: 'External assurance',
        dueDate: `${currentYear + 1}-09-30`,
        status: 'pending' as const,
      },
      {
        milestone: 'Report publication',
        dueDate: `${currentYear + 1}-12-31`,
        status: 'pending' as const,
      },
    ];

    const recommendations = [];
    
    if (criticalGaps.length > 0) {
      recommendations.push(`Address ${criticalGaps.length} critical data gaps before proceeding with compliance preparation`);
    }
    
    if (overallScore < 50) {
      recommendations.push('Focus on completing Scope 1 and Scope 2 emissions data first');
    }
    
    if (!disclosures.find(d => d.disclosureId === 'E1-4')?.completenessScore) {
      recommendations.push('Set science-based emission reduction targets');
    }
    
    recommendations.push('Consider engaging external advisors for CSRD readiness assessment');

    return {
      overallScore,
      disclosureScores: disclosures.map(d => ({
        disclosureId: d.disclosureId,
        name: d.disclosureName,
        score: d.completenessScore,
        status: d.status,
      })),
      criticalGaps,
      timeline,
      recommendations,
    };
  }

  /**
   * Generate compliance roadmap
   */
  async generateComplianceRoadmap(organizationId: string): Promise<{
    phases: {
      name: string;
      description: string;
      tasks: string[];
      duration: string;
      priority: 'high' | 'medium' | 'low';
    }[];
  }> {
    const gaps = await this.generateDataGapReport(organizationId);
    
    return {
      phases: [
        {
          name: 'Phase 1: Foundation',
          description: 'Establish baseline data collection and governance',
          tasks: [
            'Complete Scope 1 and Scope 2 emissions inventory',
            'Set up data quality management processes',
            'Identify material Scope 3 categories',
            'Establish internal governance structure',
          ],
          duration: '3 months',
          priority: 'high',
        },
        {
          name: 'Phase 2: Gap Remediation',
          description: 'Address critical data and process gaps',
          tasks: gaps.filter(g => g.severity === 'critical').map(g => g.recommendation),
          duration: '3 months',
          priority: 'high',
        },
        {
          name: 'Phase 3: Target Setting',
          description: 'Develop science-based targets and transition plan',
          tasks: [
            'Conduct scenario analysis',
            'Set science-based reduction targets',
            'Develop climate transition plan',
            'Define interim milestones',
          ],
          duration: '2 months',
          priority: 'medium',
        },
        {
          name: 'Phase 4: Reporting Preparation',
          description: 'Prepare ESRS-compliant disclosures',
          tasks: [
            'Draft E1-1 through E1-9 disclosures',
            'Conduct internal review',
            'Prepare supporting documentation',
            'Engage external assurance provider',
          ],
          duration: '3 months',
          priority: 'medium',
        },
        {
          name: 'Phase 5: Verification & Publication',
          description: 'Finalize and publish sustainability report',
          tasks: [
            'Complete external assurance',
            'Address assurance findings',
            'Finalize disclosures',
            'Publish integrated annual report',
          ],
          duration: '2 months',
          priority: 'low',
        },
      ],
    };
  }

  // Private helper methods
  private assessDisclosureStatus(
    disclosureId: string,
    data: { emissions: any[]; goals: any[]; facilities: any[]; materialityAssessments?: any[] }
  ): { status: DisclosureStatus['status']; score: number; quality: number } {
    const { emissions, goals, facilities, materialityAssessments } = data;

    switch (disclosureId) {
      case 'E1-1': // Transition plan
        const hasTransitionGoal = goals?.some(g => 
          g.title?.toLowerCase().includes('transition') ||
          g.title?.toLowerCase().includes('net zero')
        );
        return {
          status: hasTransitionGoal ? 'in_progress' : 'not_started',
          score: hasTransitionGoal ? 40 : 0,
          quality: hasTransitionGoal ? 50 : 0,
        };

      case 'E1-6': // GHG emissions
        const hasScope1 = emissions?.some(e => e.scope?.toLowerCase().includes('1'));
        const hasScope2 = emissions?.some(e => e.scope?.toLowerCase().includes('2'));
        const hasScope3 = emissions?.some(e => e.scope?.toLowerCase().includes('3'));
        const scopeScore = (hasScope1 ? 30 : 0) + (hasScope2 ? 30 : 0) + (hasScope3 ? 40 : 0);
        
        return {
          status: scopeScore >= 60 ? 'in_progress' : scopeScore > 0 ? 'draft' : 'not_started',
          score: scopeScore,
          quality: emissions?.length ? Math.min(80, 50 + emissions.length) : 0,
        };

      case 'E1-4': // Targets
        const targetCount = goals?.length || 0;
        return {
          status: targetCount > 0 ? 'in_progress' : 'not_started',
          score: Math.min(100, targetCount * 25),
          quality: targetCount > 0 ? 60 : 0,
        };

      case 'E1-5': // Energy consumption
        const hasEnergyData = emissions?.some(e => 
          e.category?.toLowerCase().includes('electricity') ||
          e.category?.toLowerCase().includes('energy')
        );
        return {
          status: hasEnergyData ? 'in_progress' : 'not_started',
          score: hasEnergyData ? 50 : 0,
          quality: hasEnergyData ? 60 : 0,
        };

      case 'E1-2': // IRO-1 / Materiality assessment
      case 'E1-3': { // Policies — boosted by materiality
        const assessments = materialityAssessments || [];
        const envAssessments = assessments.filter((a: any) => a.topic_category === 'environmental');
        const hasAssessments = envAssessments.length > 0;
        const materialTopics = envAssessments.filter((a: any) => a.is_material).length;
        const assessmentScore = hasAssessments
          ? Math.min(100, Math.round((envAssessments.length / 13) * 60 + (materialTopics > 0 ? 40 : 0)))
          : 0;
        return {
          status: assessmentScore >= 60 ? 'in_progress' : assessmentScore > 0 ? 'draft' : 'not_started',
          score: assessmentScore,
          quality: hasAssessments ? Math.min(80, 40 + envAssessments.length * 5) : 0,
        };
      }

      default:
        return {
          status: 'not_started',
          score: 0,
          quality: 0,
        };
    }
  }
}

export const csrdComplianceService = new CSRDComplianceService();
