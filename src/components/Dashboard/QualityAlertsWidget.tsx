import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, 
  AlertCircle,
  ArrowRight,
  Loader2,
  Bell,
  CheckCircle
} from 'lucide-react';
import { dataQualityService, type ValidationError } from '@/services/dataQualityService';

export const QualityAlertsWidget: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [criticalIssues, setCriticalIssues] = useState<ValidationError[]>([]);
  const [warnings, setWarnings] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAlerts();
    }
  }, [user]);

  const loadAlerts = async () => {
    if (!user) return;

    try {
      const errors = await dataQualityService.validateEntries(user.id);
      const critical = errors.filter(e => e.severity === 'error');
      const warns = errors.filter(e => e.severity === 'warning');
      
      setCriticalIssues(critical);
      setWarnings(warns);
    } catch (error) {
      console.error('Error loading quality alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Quality Alerts</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalIssues = criticalIssues.length + warnings.length;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Quality Alerts</CardTitle>
            {totalIssues > 0 && (
              <Badge variant="destructive" className="ml-2">
                {totalIssues}
              </Badge>
            )}
          </div>
          {totalIssues > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/advanced-analytics?tab=quality')}
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {totalIssues === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
            <p className="text-sm font-medium text-foreground">All Clear!</p>
            <p className="text-xs text-muted-foreground mt-1">
              No quality issues detected in your data
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Critical Errors */}
            {criticalIssues.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-red-900">
                        Critical Issues
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        {criticalIssues.length}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {criticalIssues.slice(0, 3).map((issue, index) => (
                        <p key={index} className="text-xs text-red-800">
                          • {issue.field}: {issue.error}
                        </p>
                      ))}
                      {criticalIssues.length > 3 && (
                        <p className="text-xs text-red-700 italic">
                          +{criticalIssues.length - 3} more issues
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-yellow-900">
                        Warnings
                      </span>
                      <Badge variant="outline" className="text-xs bg-yellow-100 border-yellow-300">
                        {warnings.length}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {warnings.slice(0, 2).map((warning, index) => (
                        <p key={index} className="text-xs text-yellow-800">
                          • {warning.field}: {warning.error}
                        </p>
                      ))}
                      {warnings.length > 2 && (
                        <p className="text-xs text-yellow-700 italic">
                          +{warnings.length - 2} more warnings
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate('/advanced-analytics?tab=quality')}
            >
              Review & Fix Issues
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
