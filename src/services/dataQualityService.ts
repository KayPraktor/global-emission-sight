
interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  overall: number;
}

interface DataValidationResult {
  isValid: boolean;
  confidence: number;
  issues: string[];
  suggestions: string[];
}

class DataQualityService {
  validateDataPoint(value: number, activityType: string, historicalData?: number[]): DataValidationResult {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let confidence = 100;

    // Range validation
    if (value < 0) {
      issues.push('Negative values not allowed for emission activities');
      confidence -= 30;
    }

    // Outlier detection using historical data
    if (historicalData && historicalData.length > 3) {
      const mean = historicalData.reduce((a, b) => a + b, 0) / historicalData.length;
      const stdDev = Math.sqrt(
        historicalData.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / historicalData.length
      );
      
      if (Math.abs(value - mean) > 2 * stdDev) {
        issues.push('Value appears to be an outlier compared to historical data');
        suggestions.push('Please verify this measurement or provide explanation for the variance');
        confidence -= 20;
      }
    }

    // Activity-specific validation
    if (activityType === 'electricity' && value > 10000) {
      issues.push('Unusually high electricity consumption detected');
      suggestions.push('Consider if units are correct (kWh vs MWh)');
      confidence -= 15;
    }

    return {
      isValid: issues.length === 0,
      confidence: Math.max(confidence, 0),
      issues,
      suggestions
    };
  }

  calculateQualityMetrics(dataset: any[]): DataQualityMetrics {
    const total = dataset.length;
    const complete = dataset.filter(d => d.value !== null && d.value !== undefined).length;
    const recent = dataset.filter(d => {
      const age = Date.now() - new Date(d.timestamp).getTime();
      return age < 90 * 24 * 60 * 60 * 1000; // 90 days
    }).length;

    const completeness = (complete / total) * 100;
    const timeliness = (recent / total) * 100;
    const accuracy = 85; // Would be calculated based on validation results
    const consistency = 90; // Would be calculated based on cross-validation

    const overall = (completeness + accuracy + consistency + timeliness) / 4;

    return {
      completeness,
      accuracy,
      consistency,
      timeliness,
      overall
    };
  }

  generateQualityReport(data: any[]): string {
    const metrics = this.calculateQualityMetrics(data);
    
    return `
Data Quality Report:
- Overall Score: ${metrics.overall.toFixed(1)}%
- Completeness: ${metrics.completeness.toFixed(1)}%
- Accuracy: ${metrics.accuracy.toFixed(1)}%
- Consistency: ${metrics.consistency.toFixed(1)}%
- Timeliness: ${metrics.timeliness.toFixed(1)}%

Recommendations:
${metrics.completeness < 80 ? '- Improve data collection processes to reduce missing values' : ''}
${metrics.timeliness < 70 ? '- Implement more frequent data updates' : ''}
${metrics.accuracy < 85 ? '- Review validation processes and data sources' : ''}
    `.trim();
  }
}

export const dataQualityService = new DataQualityService();
