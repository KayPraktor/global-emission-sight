import { supabase } from '@/integrations/supabase/client';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface QualityReportData {
  dateRange: { start: string; end: string };
  overallScore: number;
  trends: Array<{
    date: string;
    score: number;
  }>;
  breakdown: {
    completeness: number;
    accuracy: number;
    freshness: number;
    consistency: number;
  };
  issues: {
    critical: number;
    warnings: number;
  };
  recommendations: string[];
  comparison: {
    previousScore: number;
    change: number;
  };
}

class QualityReportService {
  async getReportData(userId: string, startDate: string, endDate: string): Promise<QualityReportData> {
    // Get quality tracking data
    const { data: tracking, error } = await supabase
      .from('quality_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('metric_date', startDate)
      .lte('metric_date', endDate)
      .order('metric_date', { ascending: true });

    if (error) throw error;

    if (!tracking || tracking.length === 0) {
      return {
        dateRange: { start: startDate, end: endDate },
        overallScore: 0,
        trends: [],
        breakdown: {
          completeness: 0,
          accuracy: 0,
          freshness: 0,
          consistency: 0,
        },
        issues: {
          critical: 0,
          warnings: 0,
        },
        recommendations: ['No data available for this period'],
        comparison: {
          previousScore: 0,
          change: 0,
        },
      };
    }

    const latest = tracking[tracking.length - 1];
    const trends = tracking.map(t => ({
      date: t.metric_date,
      score: t.overall_score || 0,
    }));

    // Get previous period score for comparison
    const periodDays = Math.floor(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    const previousStart = new Date(new Date(startDate).getTime() - periodDays * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    
    const { data: previousData } = await supabase
      .from('quality_tracking')
      .select('overall_score')
      .eq('user_id', userId)
      .gte('metric_date', previousStart)
      .lt('metric_date', startDate)
      .order('metric_date', { ascending: false })
      .limit(1)
      .single();

    const previousScore = previousData?.overall_score || 0;
    const currentScore = latest.overall_score || 0;

    // Generate recommendations
    const recommendations: string[] = [];
    
    if ((latest.completeness_score || 0) < 80) {
      recommendations.push('Improve data completeness by adding facility and activity type information');
    }
    if ((latest.freshness_score || 0) < 70) {
      recommendations.push('Update your emissions data more frequently to improve freshness score');
    }
    if ((latest.critical_issues || 0) > 0) {
      recommendations.push(`Resolve ${latest.critical_issues} critical issues in your data entries`);
    }
    if ((latest.warnings || 0) > 5) {
      recommendations.push('Address data quality warnings to improve overall score');
    }
    if ((latest.accuracy_score || 0) < 50) {
      recommendations.push('Verify more entries to improve accuracy score');
    }

    return {
      dateRange: { start: startDate, end: endDate },
      overallScore: currentScore,
      trends,
      breakdown: {
        completeness: latest.completeness_score || 0,
        accuracy: latest.accuracy_score || 0,
        freshness: latest.freshness_score || 0,
        consistency: latest.consistency_score || 0,
      },
      issues: {
        critical: latest.critical_issues || 0,
        warnings: latest.warnings || 0,
      },
      recommendations: recommendations.length > 0 ? recommendations : ['Keep up the good work!'],
      comparison: {
        previousScore,
        change: currentScore - previousScore,
      },
    };
  }

  async generatePDFReport(data: QualityReportData, companyName: string = 'Your Organization'): Promise<Blob> {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.text('Data Quality Report', pageWidth / 2, 20, { align: 'center' });

    // Company name
    doc.setFontSize(12);
    doc.text(companyName, pageWidth / 2, 30, { align: 'center' });

    // Date range
    doc.setFontSize(10);
    doc.text(
      `Period: ${new Date(data.dateRange.start).toLocaleDateString()} - ${new Date(data.dateRange.end).toLocaleDateString()}`,
      pageWidth / 2,
      38,
      { align: 'center' }
    );

    // Overall Score
    doc.setFontSize(16);
    const scoreColor = data.overallScore >= 80 ? [34, 197, 94] : data.overallScore >= 60 ? [234, 179, 8] : [239, 68, 68];
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(`Overall Quality Score: ${data.overallScore.toFixed(1)}%`, 20, 55);
    doc.setTextColor(0, 0, 0);

    // Comparison
    doc.setFontSize(10);
    const changeText = data.comparison.change >= 0 
      ? `↑ ${data.comparison.change.toFixed(1)}%` 
      : `↓ ${Math.abs(data.comparison.change).toFixed(1)}%`;
    const changeColor = data.comparison.change >= 0 ? [34, 197, 94] : [239, 68, 68];
    doc.setTextColor(changeColor[0], changeColor[1], changeColor[2]);
    doc.text(`Change from previous period: ${changeText}`, 20, 62);
    doc.setTextColor(0, 0, 0);

    // Score Breakdown Table
    doc.setFontSize(12);
    doc.text('Score Breakdown', 20, 75);
    
    (doc as any).autoTable({
      startY: 80,
      head: [['Metric', 'Score']],
      body: [
        ['Completeness', `${data.breakdown.completeness.toFixed(1)}%`],
        ['Accuracy', `${data.breakdown.accuracy.toFixed(1)}%`],
        ['Freshness', `${data.breakdown.freshness.toFixed(1)}%`],
        ['Consistency', `${data.breakdown.consistency.toFixed(1)}%`],
      ],
      theme: 'grid',
    });

    // Issues Summary
    const finalY = (doc as any).lastAutoTable.finalY || 110;
    doc.setFontSize(12);
    doc.text('Issues Summary', 20, finalY + 15);
    
    (doc as any).autoTable({
      startY: finalY + 20,
      head: [['Severity', 'Count']],
      body: [
        ['Critical Issues', data.issues.critical.toString()],
        ['Warnings', data.issues.warnings.toString()],
      ],
      theme: 'grid',
    });

    // Recommendations
    const finalY2 = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(12);
    doc.text('Recommendations', 20, finalY2 + 15);
    
    doc.setFontSize(10);
    let yPos = finalY2 + 22;
    data.recommendations.forEach((rec, index) => {
      const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, pageWidth - 40);
      doc.text(lines, 20, yPos);
      yPos += lines.length * 7;
    });

    return doc.output('blob');
  }

  async exportQualityMetrics(userId: string, startDate: string, endDate: string): Promise<string> {
    const { data, error } = await supabase
      .from('quality_tracking')
      .select('*')
      .eq('user_id', userId)
      .gte('metric_date', startDate)
      .lte('metric_date', endDate)
      .order('metric_date', { ascending: true });

    if (error) throw error;

    if (!data || data.length === 0) {
      return 'Date,Overall Score,Completeness,Accuracy,Freshness,Consistency,Critical Issues,Warnings\n';
    }

    const headers = 'Date,Overall Score,Completeness,Accuracy,Freshness,Consistency,Critical Issues,Warnings\n';
    const rows = data.map(row => 
      `${row.metric_date},${row.overall_score},${row.completeness_score},${row.accuracy_score},${row.freshness_score},${row.consistency_score},${row.critical_issues},${row.warnings}`
    ).join('\n');

    return headers + rows;
  }
}

export const qualityReportService = new QualityReportService();
