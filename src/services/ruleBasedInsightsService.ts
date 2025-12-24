// Rule-Based Insights Service
// Provides statistical analysis fallback when AI is unavailable

import { supabase } from '@/integrations/supabase/client';

export interface RuleBasedInsight {
  category: 'efficiency' | 'reduction' | 'risk' | 'opportunity' | 'compliance';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  finding: string;
  impact: string;
  recommendation: string;
  expected_benefit: string;
  timeframe: string;
  source: 'rule-based';
}

interface EmissionsData {
  entry_date: string;
  scope: string;
  category: string;
  quantity: number;
  calculations?: { calculated_emissions: number }[];
}

interface GoalData {
  title: string;
  target_reduction_percentage: number | null;
  progress_percentage: number | null;
  target_date: string;
  status: string | null;
}

interface AnalysisContext {
  emissions: EmissionsData[];
  goals: GoalData[];
  totalEmissions: number;
  scopeBreakdown: { S1: number; S2: number; S3: number };
  categoryBreakdown: Record<string, number>;
  monthlyTrend: { month: string; total: number }[];
}

class RuleBasedInsightsService {
  async generateInsights(userId: string): Promise<RuleBasedInsight[]> {
    const context = await this.gatherAnalysisContext(userId);
    const insights: RuleBasedInsight[] = [];

    if (context.emissions.length === 0) {
      return [{
        category: 'opportunity',
        priority: 'medium',
        title: 'Start Tracking Emissions',
        finding: 'No emissions data available for analysis.',
        impact: 'Cannot provide insights without baseline data.',
        recommendation: 'Begin by entering your organization\'s emissions data to unlock insights and recommendations.',
        expected_benefit: 'Establish baseline for reduction strategies',
        timeframe: 'Immediate',
        source: 'rule-based'
      }];
    }

    // Run all analysis rules
    const trendInsight = this.analyzeTrend(context);
    if (trendInsight) insights.push(trendInsight);

    const scopeInsight = this.analyzeScopeImbalance(context);
    if (scopeInsight) insights.push(scopeInsight);

    const categoryInsight = this.analyzeCategoryConcentration(context);
    if (categoryInsight) insights.push(categoryInsight);

    const goalInsight = this.analyzeGoalProgress(context);
    if (goalInsight) insights.push(goalInsight);

    const anomalyInsight = this.detectAnomalies(context);
    if (anomalyInsight) insights.push(anomalyInsight);

    const quickWinInsight = this.identifyQuickWins(context);
    if (quickWinInsight) insights.push(quickWinInsight);

    // Return top 5 insights sorted by priority
    return this.sortByPriority(insights).slice(0, 5);
  }

  private async gatherAnalysisContext(userId: string): Promise<AnalysisContext> {
    // Fetch emissions data
    const { data: emissions } = await supabase
      .from('emissions_entries')
      .select('entry_date, scope, category, quantity, calculations(calculated_emissions)')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })
      .limit(200);

    // Fetch goals
    const { data: goals } = await supabase
      .from('goals')
      .select('title, target_reduction_percentage, progress_percentage, target_date, status')
      .eq('user_id', userId);

    const emissionsData = (emissions || []) as EmissionsData[];
    const goalsData = (goals || []) as GoalData[];

    // Calculate totals
    const totalEmissions = emissionsData.reduce(
      (sum, e) => sum + (e.calculations?.[0]?.calculated_emissions || 0), 0
    );

    // Scope breakdown
    const scopeBreakdown = {
      S1: emissionsData.filter(e => e.scope === 'S1').reduce((sum, e) => sum + (e.calculations?.[0]?.calculated_emissions || 0), 0),
      S2: emissionsData.filter(e => e.scope === 'S2').reduce((sum, e) => sum + (e.calculations?.[0]?.calculated_emissions || 0), 0),
      S3: emissionsData.filter(e => e.scope === 'S3').reduce((sum, e) => sum + (e.calculations?.[0]?.calculated_emissions || 0), 0),
    };

    // Category breakdown
    const categoryBreakdown = emissionsData.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + (e.calculations?.[0]?.calculated_emissions || 0);
      return acc;
    }, {} as Record<string, number>);

    // Monthly trend
    const monthlyData: Record<string, number> = {};
    emissionsData.forEach(e => {
      const month = e.entry_date.substring(0, 7);
      monthlyData[month] = (monthlyData[month] || 0) + (e.calculations?.[0]?.calculated_emissions || 0);
    });
    const monthlyTrend = Object.entries(monthlyData)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      emissions: emissionsData,
      goals: goalsData,
      totalEmissions,
      scopeBreakdown,
      categoryBreakdown,
      monthlyTrend
    };
  }

  private analyzeTrend(context: AnalysisContext): RuleBasedInsight | null {
    const { monthlyTrend } = context;
    if (monthlyTrend.length < 2) return null;

    const recent = monthlyTrend.slice(-3);
    if (recent.length < 2) return null;

    const firstMonth = recent[0].total;
    const lastMonth = recent[recent.length - 1].total;
    const changePercent = firstMonth > 0 ? ((lastMonth - firstMonth) / firstMonth) * 100 : 0;

    if (changePercent > 15) {
      return {
        category: 'risk',
        priority: 'high',
        title: 'Rising Emissions Trend Detected',
        finding: `Your emissions increased by ${changePercent.toFixed(1)}% over the past ${recent.length} months.`,
        impact: 'Continued increase will impact sustainability goals and potential regulatory compliance.',
        recommendation: 'Review recent operational changes and identify sources of increased emissions. Focus on the highest-growth categories.',
        expected_benefit: `Reversing this trend could reduce emissions by ${(lastMonth - firstMonth).toFixed(1)} tCO2e`,
        timeframe: '1-3 months',
        source: 'rule-based'
      };
    } else if (changePercent < -10) {
      return {
        category: 'efficiency',
        priority: 'low',
        title: 'Positive Emissions Reduction Trend',
        finding: `Your emissions decreased by ${Math.abs(changePercent).toFixed(1)}% over the past ${recent.length} months.`,
        impact: 'You are on track with emissions reduction - keep monitoring to maintain progress.',
        recommendation: 'Document what initiatives led to this reduction and consider expanding them.',
        expected_benefit: 'Maintaining this trend supports long-term sustainability goals',
        timeframe: 'Ongoing',
        source: 'rule-based'
      };
    }

    return null;
  }

  private analyzeScopeImbalance(context: AnalysisContext): RuleBasedInsight | null {
    const { scopeBreakdown, totalEmissions } = context;
    if (totalEmissions === 0) return null;

    const s3Percent = (scopeBreakdown.S3 / totalEmissions) * 100;
    const s1Percent = (scopeBreakdown.S1 / totalEmissions) * 100;
    const s2Percent = (scopeBreakdown.S2 / totalEmissions) * 100;

    // Check for limited Scope 3 tracking
    if (s3Percent < 10 && (s1Percent > 40 || s2Percent > 40)) {
      return {
        category: 'compliance',
        priority: 'medium',
        title: 'Scope 3 Emissions Underrepresented',
        finding: `Scope 3 accounts for only ${s3Percent.toFixed(1)}% of tracked emissions, while industry averages show Scope 3 typically represents 70-90% of total footprint.`,
        impact: 'Incomplete Scope 3 data may understate your true carbon footprint and create reporting gaps.',
        recommendation: 'Expand Scope 3 tracking to include supply chain, business travel, employee commuting, and purchased goods.',
        expected_benefit: 'More accurate carbon footprint assessment and better reduction targeting',
        timeframe: '3-6 months',
        source: 'rule-based'
      };
    }

    // High Scope 1 - direct emissions opportunity
    if (s1Percent > 50) {
      return {
        category: 'reduction',
        priority: 'high',
        title: 'High Direct Emissions (Scope 1)',
        finding: `Direct emissions (Scope 1) represent ${s1Percent.toFixed(1)}% of your total footprint.`,
        impact: 'Scope 1 emissions are within your direct control and offer the highest potential for targeted reduction.',
        recommendation: 'Focus on fuel efficiency, equipment upgrades, and transitioning to lower-carbon fuels.',
        expected_benefit: `Potential to directly reduce ${(scopeBreakdown.S1 * 0.2).toFixed(1)} tCO2e (20% reduction target)`,
        timeframe: '6-12 months',
        source: 'rule-based'
      };
    }

    return null;
  }

  private analyzeCategoryConcentration(context: AnalysisContext): RuleBasedInsight | null {
    const { categoryBreakdown, totalEmissions } = context;
    if (totalEmissions === 0) return null;

    const sorted = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) return null;

    const topCategory = sorted[0];
    const topPercent = (topCategory[1] / totalEmissions) * 100;

    if (topPercent > 50) {
      return {
        category: 'opportunity',
        priority: 'high',
        title: `${topCategory[0]} Dominates Your Emissions`,
        finding: `${topCategory[0]} accounts for ${topPercent.toFixed(1)}% (${topCategory[1].toFixed(1)} tCO2e) of your total emissions.`,
        impact: 'Concentrated emissions in one category means targeted action can have significant impact.',
        recommendation: `Prioritize reduction initiatives for ${topCategory[0]}. Consider efficiency improvements, alternative sources, or operational changes.`,
        expected_benefit: `A 25% reduction in ${topCategory[0]} would save ${(topCategory[1] * 0.25).toFixed(1)} tCO2e`,
        timeframe: '3-6 months',
        source: 'rule-based'
      };
    }

    return null;
  }

  private analyzeGoalProgress(context: AnalysisContext): RuleBasedInsight | null {
    const activeGoals = context.goals.filter(g => g.status !== 'completed' && g.status !== 'cancelled');
    
    for (const goal of activeGoals) {
      if (!goal.progress_percentage || !goal.target_reduction_percentage) continue;

      const targetDate = new Date(goal.target_date);
      const now = new Date();
      const daysRemaining = Math.floor((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if behind schedule
      const expectedProgress = ((now.getTime() - (targetDate.getTime() - 365 * 24 * 60 * 60 * 1000)) / 
                               (365 * 24 * 60 * 60 * 1000)) * 100;
      
      if (goal.progress_percentage < expectedProgress - 10 && daysRemaining < 180) {
        return {
          category: 'risk',
          priority: daysRemaining < 90 ? 'critical' : 'high',
          title: `Behind Schedule on "${goal.title}"`,
          finding: `Current progress is ${goal.progress_percentage.toFixed(0)}% vs expected ${expectedProgress.toFixed(0)}% with ${daysRemaining} days remaining.`,
          impact: 'Missing reduction targets can affect sustainability commitments and stakeholder confidence.',
          recommendation: 'Accelerate reduction initiatives or reassess target feasibility. Consider interim milestones.',
          expected_benefit: 'Getting back on track to meet reduction commitments',
          timeframe: `${daysRemaining} days remaining`,
          source: 'rule-based'
        };
      }
    }

    return null;
  }

  private detectAnomalies(context: AnalysisContext): RuleBasedInsight | null {
    const { monthlyTrend } = context;
    if (monthlyTrend.length < 4) return null;

    // Calculate mean and standard deviation
    const values = monthlyTrend.map(m => m.total);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length);

    // Check last month for anomaly
    const lastMonth = monthlyTrend[monthlyTrend.length - 1];
    const zScore = stdDev > 0 ? (lastMonth.total - mean) / stdDev : 0;

    if (Math.abs(zScore) > 2) {
      const isSpike = zScore > 0;
      return {
        category: 'risk',
        priority: 'high',
        title: isSpike ? 'Unusual Emissions Spike Detected' : 'Unusual Emissions Drop Detected',
        finding: `${lastMonth.month} emissions (${lastMonth.total.toFixed(1)} tCO2e) deviated significantly from the average (${mean.toFixed(1)} tCO2e).`,
        impact: isSpike 
          ? 'Unexpected spikes may indicate operational issues or data entry errors that need investigation.'
          : 'Sudden drops should be verified - could indicate data gaps or genuine improvement.',
        recommendation: isSpike
          ? 'Review operations and data entries for this period to identify the cause.'
          : 'Verify data completeness and document any changes that led to the reduction.',
        expected_benefit: 'Ensuring data accuracy and identifying operational issues',
        timeframe: 'Immediate review recommended',
        source: 'rule-based'
      };
    }

    return null;
  }

  private identifyQuickWins(context: AnalysisContext): RuleBasedInsight | null {
    const { scopeBreakdown, categoryBreakdown, totalEmissions } = context;
    if (totalEmissions === 0) return null;

    // Check for significant Scope 2 (electricity) - often easiest to address
    const s2Percent = (scopeBreakdown.S2 / totalEmissions) * 100;
    
    if (s2Percent > 20) {
      return {
        category: 'opportunity',
        priority: 'medium',
        title: 'Renewable Energy Quick Win',
        finding: `Scope 2 (electricity) accounts for ${s2Percent.toFixed(1)}% of your emissions.`,
        impact: 'Switching to renewable energy is often one of the fastest ways to reduce your carbon footprint.',
        recommendation: 'Explore renewable energy procurement options: RECs, PPAs, or on-site solar. Many utilities offer green tariffs.',
        expected_benefit: `Could reduce up to ${scopeBreakdown.S2.toFixed(1)} tCO2e (${s2Percent.toFixed(0)}% of total) by switching to 100% renewable`,
        timeframe: '1-6 months depending on approach',
        source: 'rule-based'
      };
    }

    // Check for business travel
    const travelEmissions = categoryBreakdown['Business Travel'] || categoryBreakdown['Travel'] || 0;
    const travelPercent = (travelEmissions / totalEmissions) * 100;
    
    if (travelPercent > 10) {
      return {
        category: 'efficiency',
        priority: 'medium',
        title: 'Business Travel Reduction Opportunity',
        finding: `Business travel represents ${travelPercent.toFixed(1)}% of your emissions.`,
        impact: 'Travel policies directly impact emissions and can be adjusted relatively quickly.',
        recommendation: 'Implement virtual meeting policies, choose trains over flights where possible, and consider carbon offsets for essential travel.',
        expected_benefit: `A 30% reduction in travel could save ${(travelEmissions * 0.3).toFixed(1)} tCO2e`,
        timeframe: '1-3 months',
        source: 'rule-based'
      };
    }

    return null;
  }

  private sortByPriority(insights: RuleBasedInsight[]): RuleBasedInsight[] {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }
}

export const ruleBasedInsightsService = new RuleBasedInsightsService();
