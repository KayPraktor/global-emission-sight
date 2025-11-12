import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Palette, Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BrandingSettings {
  company_name: string;
  company_logo_url: string;
  primary_color: string;
  secondary_color: string;
  header_text: string;
  footer_text: string;
}

export function BrandingSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<BrandingSettings>({
    company_name: '',
    company_logo_url: '',
    primary_color: '#2563eb',
    secondary_color: '#1e40af',
    header_text: '',
    footer_text: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('report_branding_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings({
          company_name: data.company_name || '',
          company_logo_url: data.company_logo_url || '',
          primary_color: data.primary_color || '#2563eb',
          secondary_color: data.secondary_color || '#1e40af',
          header_text: data.header_text || '',
          footer_text: data.footer_text || ''
        });
      }
    } catch (error) {
      console.error('Error loading branding settings:', error);
      toast.error('Failed to load branding settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('report_branding_settings')
        .upsert({
          user_id: user.id,
          company_name: settings.company_name,
          company_logo_url: settings.company_logo_url,
          primary_color: settings.primary_color,
          secondary_color: settings.secondary_color,
          header_text: settings.header_text,
          footer_text: settings.footer_text
        });

      if (error) throw error;
      toast.success('Branding settings saved successfully');
    } catch (error) {
      console.error('Error saving branding settings:', error);
      toast.error('Failed to save branding settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Report Branding Settings
        </CardTitle>
        <CardDescription>
          Customize the appearance of your PDF reports with company branding
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="company-name">Company Name</Label>
          <Input
            id="company-name"
            placeholder="Your Company Name"
            value={settings.company_name}
            onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo-url">Company Logo URL</Label>
          <div className="flex gap-2">
            <Input
              id="logo-url"
              placeholder="https://example.com/logo.png"
              value={settings.company_logo_url}
              onChange={(e) => setSettings({ ...settings, company_logo_url: e.target.value })}
            />
            <Button variant="outline" size="icon" disabled>
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter a URL to your company logo image (recommended: 200x60px)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primary-color">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="primary-color"
                type="color"
                value={settings.primary_color}
                onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={settings.primary_color}
                onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                placeholder="#2563eb"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary-color">Secondary Color</Label>
            <div className="flex gap-2">
              <Input
                id="secondary-color"
                type="color"
                value={settings.secondary_color}
                onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                className="w-20 h-10"
              />
              <Input
                value={settings.secondary_color}
                onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                placeholder="#1e40af"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="header-text">Custom Header Text</Label>
          <Input
            id="header-text"
            placeholder="e.g., Confidential - Internal Use Only"
            value={settings.header_text}
            onChange={(e) => setSettings({ ...settings, header_text: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="footer-text">Custom Footer Text</Label>
          <Textarea
            id="footer-text"
            placeholder="e.g., © 2025 Your Company. All rights reserved."
            value={settings.footer_text}
            onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
            rows={3}
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Branding Settings'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
