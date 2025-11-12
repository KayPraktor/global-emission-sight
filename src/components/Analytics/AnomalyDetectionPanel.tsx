import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { anomalyDetectionService, type Anomaly } from '@/services/anomalyDetectionService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function AnomalyDetectionPanel() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    loadAnomalies();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('anomalies')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emissions_anomalies' }, () => {
        loadAnomalies();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadAnomalies = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const data = await anomalyDetectionService.getUnacknowledgedAnomalies(user.id);
      setAnomalies(data);
    } catch (error) {
      console.error('Error loading anomalies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await anomalyDetectionService.detectAnomalies(user.id);
      await loadAnomalies();
      toast.success('Anomaly scan complete');
    } catch (error) {
      console.error('Error scanning:', error);
      toast.error('Failed to scan for anomalies');
    } finally {
      setScanning(false);
    }
  };

  const handleAcknowledge = async (anomalyId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await anomalyDetectionService.acknowledgeAnomaly(anomalyId, user.id);
      setAnomalies(prev => prev.filter(a => a.id !== anomalyId));
      toast.success('Anomaly acknowledged');
    } catch (error) {
      console.error('Error acknowledging:', error);
      toast.error('Failed to acknowledge anomaly');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case 'spike': return <TrendingUp className="h-4 w-4" />;
      case 'drop': return <TrendingDown className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Anomaly Detection
            </CardTitle>
            <CardDescription>
              Automated detection of unusual emissions patterns
            </CardDescription>
          </div>
          <Button
            onClick={handleScan}
            disabled={scanning}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
            Scan Now
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {anomalies.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription>
              No anomalies detected. All emissions data appears normal.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {anomalies.map((anomaly) => (
              <Card key={anomaly.id} className="border-l-4" style={{
                borderLeftColor: anomaly.severity === 'critical' ? 'hsl(var(--destructive))' :
                                 anomaly.severity === 'high' ? '#f97316' :
                                 anomaly.severity === 'medium' ? '#eab308' : '#3b82f6'
              }}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getAnomalyIcon(anomaly.anomaly_type)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(anomaly.severity)}>
                            {anomaly.severity}
                          </Badge>
                          <Badge variant="outline">
                            {anomaly.anomaly_type}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{anomaly.description}</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>
                            Expected: {anomaly.expected_value.toFixed(2)} tCO2e | 
                            Actual: {anomaly.actual_value.toFixed(2)} tCO2e | 
                            Deviation: {anomaly.deviation_percentage.toFixed(1)}%
                          </p>
                          <p className="italic">💡 {anomaly.recommendation}</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcknowledge(anomaly.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Acknowledge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
