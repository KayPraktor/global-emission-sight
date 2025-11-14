import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface ValidationError {
  field: string;
  error: string;
  severity: 'error' | 'warning' | 'info';
}

interface ValidationWarning {
  field: string;
  warning: string;
}

interface ValidationFeedbackProps {
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
  qualityScore?: number;
  suggestions?: string[];
  className?: string;
}

export const ValidationFeedback: React.FC<ValidationFeedbackProps> = ({
  errors = [],
  warnings = [],
  qualityScore,
  suggestions = [],
  className = '',
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Needs Improvement';
    return 'Poor';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {qualityScore !== undefined && (
        <div className={`p-3 rounded-lg border ${getScoreColor(qualityScore)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {qualityScore >= 80 ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertTriangle className="h-5 w-5" />
              )}
              <span className="font-medium">Data Quality Score</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{qualityScore}%</span>
              <Badge variant="outline">{getScoreLabel(qualityScore)}</Badge>
            </div>
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="space-y-2">
          {errors.map((error, index) => (
            <Alert key={index} variant="destructive">
              <div className="flex items-start gap-2">
                {getSeverityIcon(error.severity)}
                <div className="flex-1">
                  <AlertDescription>
                    <span className="font-medium">{error.field}:</span> {error.error}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((warning, index) => (
            <Alert key={index} className="border-yellow-200 bg-yellow-50">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <div className="flex-1">
                  <AlertDescription className="text-yellow-800">
                    <span className="font-medium">{warning.field}:</span> {warning.warning}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {suggestions.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="font-medium mb-1">Suggestions to improve quality:</div>
            <ul className="list-disc list-inside space-y-1">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm">{suggestion}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {errors.length === 0 && warnings.length === 0 && suggestions.length === 0 && qualityScore === 100 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            All validation checks passed! Your data quality is excellent.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
