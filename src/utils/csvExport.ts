export interface ExportOptions {
  startDate?: string;
  endDate?: string;
  scopes?: string[];
  severities?: string[];
  priorities?: string[];
}

export function exportToCSV(data: any[], filename: string, columns: { key: string; label: string }[]): void {
  // Create CSV header
  const headers = columns.map(col => col.label).join(',');

  // Create CSV rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col.key];
      
      // Handle different value types
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      if (typeof value === 'string' && value.includes(',')) return `"${value.replace(/"/g, '""')}"`;
      
      return value;
    }).join(',');
  });

  // Combine headers and rows
  const csv = [headers, ...rows].join('\n');

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

export function exportForecastsToCSV(forecasts: any[], options: ExportOptions = {}): void {
  let filtered = [...forecasts];

  // Apply filters
  if (options.startDate) {
    filtered = filtered.filter(f => f.period >= options.startDate);
  }
  if (options.endDate) {
    filtered = filtered.filter(f => f.period <= options.endDate);
  }
  if (options.scopes && options.scopes.length > 0) {
    filtered = filtered.filter(f => options.scopes!.includes(f.scope));
  }

  const columns = [
    { key: 'period', label: 'Period' },
    { key: 'scope', label: 'Scope' },
    { key: 'predicted_emissions', label: 'Predicted Emissions (tCO2e)' },
    { key: 'confidence_score', label: 'Confidence Score' },
    { key: 'lower_bound', label: 'Lower Bound (tCO2e)' },
    { key: 'upper_bound', label: 'Upper Bound (tCO2e)' },
    { key: 'model_version', label: 'Model Version' },
    { key: 'generated_at', label: 'Generated At' },
  ];

  const filename = `emissions-forecasts-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(filtered, filename, columns);
}

export function exportAnomaliesToCSV(anomalies: any[], options: ExportOptions = {}): void {
  let filtered = [...anomalies];

  // Apply filters
  if (options.startDate) {
    filtered = filtered.filter(a => a.detected_at >= options.startDate);
  }
  if (options.endDate) {
    filtered = filtered.filter(a => a.detected_at <= options.endDate);
  }
  if (options.severities && options.severities.length > 0) {
    filtered = filtered.filter(a => options.severities!.includes(a.severity));
  }

  const columns = [
    { key: 'detected_at', label: 'Detected At' },
    { key: 'anomaly_type', label: 'Type' },
    { key: 'severity', label: 'Severity' },
    { key: 'description', label: 'Description' },
    { key: 'expected_value', label: 'Expected Value (tCO2e)' },
    { key: 'actual_value', label: 'Actual Value (tCO2e)' },
    { key: 'deviation_percentage', label: 'Deviation (%)' },
    { key: 'z_score', label: 'Z-Score' },
    { key: 'recommendation', label: 'Recommendation' },
    { key: 'is_acknowledged', label: 'Acknowledged' },
  ];

  const filename = `emissions-anomalies-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(filtered, filename, columns);
}

export function exportInsightsToCSV(insights: any[], options: ExportOptions = {}): void {
  let filtered = [...insights];

  // Apply filters
  if (options.startDate) {
    filtered = filtered.filter(i => i.generated_at >= options.startDate);
  }
  if (options.endDate) {
    filtered = filtered.filter(i => i.generated_at <= options.endDate);
  }
  if (options.priorities && options.priorities.length > 0) {
    filtered = filtered.filter(i => options.priorities!.includes(i.priority));
  }

  const columns = [
    { key: 'generated_at', label: 'Generated At' },
    { key: 'category', label: 'Category' },
    { key: 'priority', label: 'Priority' },
    { key: 'title', label: 'Title' },
    { key: 'finding', label: 'Finding' },
    { key: 'impact', label: 'Impact' },
    { key: 'recommendation', label: 'Recommendation' },
    { key: 'expected_benefit', label: 'Expected Benefit' },
    { key: 'timeframe', label: 'Timeframe' },
    { key: 'is_actioned', label: 'Actioned' },
  ];

  const filename = `emissions-insights-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(filtered, filename, columns);
}

export function exportAllAnalyticsData(
  forecasts: any[],
  anomalies: any[],
  insights: any[],
  options: ExportOptions = {}
): void {
  // Export each dataset separately
  exportForecastsToCSV(forecasts, options);
  exportAnomaliesToCSV(anomalies, options);
  exportInsightsToCSV(insights, options);
}
