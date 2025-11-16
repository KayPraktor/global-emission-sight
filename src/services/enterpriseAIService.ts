import { supabase } from '@/integrations/supabase/client';

export interface EnterpriseInsight {
  id: string;
  type: 'opportunity' | 'risk' | 'anomaly' | 'recommendation';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: {
    co2Reduction?: number;
    costSaving?: number;
    timeline?: string;
  };
  confidence: number;
  category: string;
  status?: 'active' | 'dismissed' | 'resolved';
}

export class EnterpriseAIService {
  async aggregateInsights(organizationId: string): Promise<EnterpriseInsight[]> {
    try {
      const insights: EnterpriseInsight[] = [];

      // Fetch quality scan results
      const { data: qualityData, error: qualityError } = await supabase
        .from('quality_tracking')
        .select('*')
        .eq('organization_id', organizationId)
        .order('metric_date', { ascending: false })
        .limit(1);

      if (qualityError) throw qualityError;

      // Fetch anomalies
      const { data: anomalies, error: anomaliesError } = await supabase
        .from('emissions_anomalies')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_acknowledged', false)
        .order('detected_at', { ascending: false })
        .limit(10);

      if (anomaliesError) throw anomaliesError;

      // Fetch existing insights
      const { data: existingInsights, error: insightsError } = await supabase
        .from('emissions_insights')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_dismissed', false)
        .order('generated_at', { ascending: false })
        .limit(10);

      if (insightsError) throw insightsError;

      // Convert quality data to insights
      if (qualityData && qualityData.length > 0) {
        const quality = qualityData[0];
        
        if (quality.overall_score < 70) {
          insights.push({
            id: `quality-${quality.id}`,
            type: 'risk',
            priority: quality.overall_score < 50 ? 'critical' : 'high',
            title: 'Data Quality Below Target',
            description: `Your overall data quality score is ${quality.overall_score}%. This affects reporting accuracy and compliance readiness.`,
            impact: {
              timeline: 'Immediate action required'
            },
            confidence: 0.95,
            category: 'Data Quality',
            status: 'active'
          });
        }

        if (quality.critical_issues > 0) {
          insights.push({
            id: `critical-${quality.id}`,
            type: 'risk',
            priority: 'critical',
            title: `${quality.critical_issues} Critical Data Issues Detected`,
            description: 'Critical validation errors found in emissions data that must be resolved for compliance.',
            impact: {
              costSaving: quality.critical_issues * 5000,
              timeline: 'Within 7 days'
            },
            confidence: 1.0,
            category: 'Compliance',
            status: 'active'
          });
        }

        if (quality.completeness_score < 80) {
          insights.push({
            id: `completeness-${quality.id}`,
            type: 'opportunity',
            priority: 'medium',
            title: 'Improve Data Completeness',
            description: `${quality.completeness_score}% of required data fields are complete. Fill missing data to improve reporting accuracy.`,
            impact: {
              timeline: '2-4 weeks'
            },
            confidence: 0.85,
            category: 'Data Quality',
            status: 'active'
          });
        }
      }

      // Convert anomalies to insights
      anomalies?.forEach((anomaly) => {
        insights.push({
          id: `anomaly-${anomaly.id}`,
          type: 'anomaly',
          priority: anomaly.severity === 'critical' ? 'critical' : anomaly.severity === 'high' ? 'high' : 'medium',
          title: anomaly.anomaly_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          description: anomaly.description || 'Unusual pattern detected in emissions data',
          impact: {
            co2Reduction: Math.abs(anomaly.deviation_percentage || 0) * 0.1,
            timeline: 'Requires investigation'
          },
          confidence: Math.min(Math.abs(anomaly.z_score || 0) / 3, 1),
          category: 'Anomaly Detection',
          status: 'active'
        });
      });

      // Convert existing insights
      existingInsights?.forEach((insight) => {
        insights.push({
          id: insight.id,
          type: insight.category === 'reduction_opportunity' ? 'opportunity' : 'recommendation',
          priority: insight.priority as any,
          title: insight.title,
          description: insight.finding || insight.recommendation || '',
          impact: {
            co2Reduction: parseFloat(insight.expected_benefit || '0'),
            timeline: insight.timeframe || 'Not specified'
          },
          confidence: 0.75,
          category: insight.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          status: 'active'
        });
      });

      // Add optimization opportunities based on data patterns
      const { data: emissions } = await supabase
        .from('emissions_entries')
        .select('scope, category, quantity')
        .eq('organization_id', organizationId);

      if (emissions && emissions.length > 0) {
        const scope3Total = emissions.filter(e => e.scope === 'S3').reduce((sum, e) => sum + e.quantity, 0);
        const totalEmissions = emissions.reduce((sum, e) => sum + e.quantity, 0);
        const scope3Percentage = (scope3Total / totalEmissions) * 100;

        if (scope3Percentage > 60) {
          insights.push({
            id: 'scope3-opportunity',
            type: 'opportunity',
            priority: 'high',
            title: 'High Scope 3 Emissions Detected',
            description: `Scope 3 represents ${scope3Percentage.toFixed(1)}% of total emissions. Focus on supply chain optimization for significant reductions.`,
            impact: {
              co2Reduction: scope3Total * 0.2,
              costSaving: scope3Total * 0.15 * 50,
              timeline: '6-12 months'
            },
            confidence: 0.80,
            category: 'Reduction Opportunity',
            status: 'active'
          });
        }
      }

      // Save insights to database
      await this.saveInsights(organizationId, insights);

      return insights.slice(0, 15); // Return top 15 insights
    } catch (error) {
      console.error('Error aggregating insights:', error);
      return [];
    }
  }

  async saveInsights(organizationId: string, insights: EnterpriseInsight[]) {
    const insightsToSave = insights.map(insight => ({
      organization_id: organizationId,
      insight_type: insight.type,
      priority: insight.priority,
      title: insight.title,
      description: insight.description,
      impact_co2_reduction: insight.impact.co2Reduction,
      impact_cost_saving: insight.impact.costSaving,
      confidence_score: insight.confidence,
      category: insight.category,
      source: 'ai_aggregation',
      status: insight.status || 'active',
      metadata: {
        timeline: insight.impact.timeline
      }
    }));

    const { error } = await supabase
      .from('enterprise_insights')
      .insert(insightsToSave);

    if (error && !error.message.includes('duplicate')) {
      console.error('Error saving insights:', error);
    }
  }

  async dismissInsight(insightId: string) {
    const { error } = await supabase
      .from('enterprise_insights')
      .update({ status: 'dismissed' })
      .eq('id', insightId);

    if (error) {
      console.error('Error dismissing insight:', error);
    }
  }

  async resolveInsight(insightId: string) {
    const { error } = await supabase
      .from('enterprise_insights')
      .update({ status: 'resolved' })
      .eq('id', insightId);

    if (error) {
      console.error('Error resolving insight:', error);
    }
  }
}

export const enterpriseAIService = new EnterpriseAIService();
