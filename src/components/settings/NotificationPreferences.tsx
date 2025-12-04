import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Bell, Mail, AlertTriangle, BarChart3, Shield } from 'lucide-react';

interface NotificationSettings {
  email_weekly_insights: boolean;
  email_anomaly_alerts: boolean;
  email_quality_alerts: boolean;
  email_critical_only: boolean;
  notification_anomaly_alerts: boolean;
  notification_insights: boolean;
  notification_sound: boolean;
  quality_alert_threshold: number;
  daily_quality_digest: boolean;
}

const defaultSettings: NotificationSettings = {
  email_weekly_insights: true,
  email_anomaly_alerts: true,
  email_quality_alerts: true,
  email_critical_only: false,
  notification_anomaly_alerts: true,
  notification_insights: true,
  notification_sound: false,
  quality_alert_threshold: 70,
  daily_quality_digest: false,
};

export function NotificationPreferences() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      
      const { data } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setSettings({
          email_weekly_insights: data.email_weekly_insights ?? true,
          email_anomaly_alerts: data.email_anomaly_alerts ?? true,
          email_quality_alerts: data.email_quality_alerts ?? true,
          email_critical_only: data.email_critical_only ?? false,
          notification_anomaly_alerts: data.notification_anomaly_alerts ?? true,
          notification_insights: data.notification_insights ?? true,
          notification_sound: data.notification_sound ?? false,
          quality_alert_threshold: data.quality_alert_threshold ?? 70,
          daily_quality_digest: data.daily_quality_digest ?? false,
        });
      }
      setLoading(false);
    };
    
    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      toast.success('Notification preferences saved');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return <div className="text-muted-foreground">Loading preferences...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Configure which emails you receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Weekly Insights Report
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive a weekly summary of your emissions data and AI insights
              </p>
            </div>
            <Switch
              checked={settings.email_weekly_insights}
              onCheckedChange={(checked) => updateSetting('email_weekly_insights', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Anomaly Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Get notified when anomalies are detected in your data
              </p>
            </div>
            <Switch
              checked={settings.email_anomaly_alerts}
              onCheckedChange={(checked) => updateSetting('email_anomaly_alerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Data Quality Alerts
              </Label>
              <p className="text-sm text-muted-foreground">
                Alerts when data quality falls below threshold
              </p>
            </div>
            <Switch
              checked={settings.email_quality_alerts}
              onCheckedChange={(checked) => updateSetting('email_quality_alerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Daily Quality Digest</Label>
              <p className="text-sm text-muted-foreground">
                Receive daily summary of data quality metrics
              </p>
            </div>
            <Switch
              checked={settings.daily_quality_digest}
              onCheckedChange={(checked) => updateSetting('daily_quality_digest', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Critical Only</Label>
              <p className="text-sm text-muted-foreground">
                Only send emails for critical priority items
              </p>
            </div>
            <Switch
              checked={settings.email_critical_only}
              onCheckedChange={(checked) => updateSetting('email_critical_only', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            In-App Notifications
          </CardTitle>
          <CardDescription>
            Configure notifications within the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Anomaly Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications for detected anomalies
              </p>
            </div>
            <Switch
              checked={settings.notification_anomaly_alerts}
              onCheckedChange={(checked) => updateSetting('notification_anomaly_alerts', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>AI Insights</Label>
              <p className="text-sm text-muted-foreground">
                Show notifications for new AI-generated insights
              </p>
            </div>
            <Switch
              checked={settings.notification_insights}
              onCheckedChange={(checked) => updateSetting('notification_insights', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notification Sound</Label>
              <p className="text-sm text-muted-foreground">
                Play a sound when notifications arrive
              </p>
            </div>
            <Switch
              checked={settings.notification_sound}
              onCheckedChange={(checked) => updateSetting('notification_sound', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quality Alert Threshold</CardTitle>
          <CardDescription>
            Trigger alerts when data quality score falls below this percentage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Threshold</span>
              <span className="font-medium">{settings.quality_alert_threshold}%</span>
            </div>
            <Slider
              value={[settings.quality_alert_threshold]}
              onValueChange={([value]) => updateSetting('quality_alert_threshold', value)}
              min={0}
              max={100}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              You'll receive alerts when your data quality score drops below {settings.quality_alert_threshold}%
            </p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  );
}
