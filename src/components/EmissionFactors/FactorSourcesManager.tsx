import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, RefreshCw, ExternalLink, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import {
  getFactorSources,
  updateFactorSource,
  triggerSync,
  FactorSource
} from '@/services/factorAutoUpdateService';

export function FactorSourcesManager() {
  const [sources, setSources] = useState<FactorSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = async () => {
    try {
      setLoading(true);
      const data = await getFactorSources();
      setSources(data);
    } catch (error) {
      console.error('Failed to load sources:', error);
      toast.error('Failed to load data sources');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSource = async (source: FactorSource) => {
    try {
      await updateFactorSource(source.id, { is_enabled: !source.is_enabled });
      setSources(prev =>
        prev.map(s => s.id === source.id ? { ...s, is_enabled: !s.is_enabled } : s)
      );
      toast.success(`${source.name} ${!source.is_enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to update source:', error);
      toast.error('Failed to update source');
    }
  };

  const handleFrequencyChange = async (source: FactorSource, frequency: string) => {
    try {
      await updateFactorSource(source.id, { sync_frequency: frequency });
      setSources(prev =>
        prev.map(s => s.id === source.id ? { ...s, sync_frequency: frequency } : s)
      );
      toast.success('Sync frequency updated');
    } catch (error) {
      console.error('Failed to update frequency:', error);
      toast.error('Failed to update frequency');
    }
  };

  const handleSync = async (sourceId?: string) => {
    try {
      setSyncing(sourceId || 'all');
      const result = await triggerSync(sourceId);
      toast.success(result.message || 'Sync completed');
      await loadSources();
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Sync failed');
    } finally {
      setSyncing(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>External Data Sources</CardTitle>
            <CardDescription>
              Configure automatic emission factor updates from trusted sources
            </CardDescription>
          </div>
          <Button
            onClick={() => handleSync()}
            disabled={syncing !== null}
          >
            {syncing === 'all' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Sync All Sources
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sources.map(source => (
          <div
            key={source.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-4">
              <Switch
                checked={source.is_enabled}
                onCheckedChange={() => handleToggleSource(source)}
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{source.name}</h4>
                  <Badge variant={source.is_enabled ? 'default' : 'secondary'}>
                    {source.code}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {source.description}
                </p>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  {source.last_sync_at ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      Last sync: {formatDistanceToNow(new Date(source.last_sync_at), { addSuffix: true })}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-muted-foreground" />
                      Never synced
                    </span>
                  )}
                  {source.url && (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Source website
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={source.sync_frequency}
                  onValueChange={(value) => handleFrequencyChange(source, value)}
                  disabled={!source.is_enabled}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSync(source.id)}
                disabled={syncing !== null || !source.is_enabled}
              >
                {syncing === source.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}

        {sources.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No data sources configured
          </div>
        )}
      </CardContent>
    </Card>
  );
}
