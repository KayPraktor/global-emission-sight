import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, FileCheck, AlertTriangle, Plus, Building2, Leaf, Fuel } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ComplianceDeadline {
  month: number;
  day: number;
  description: string;
  description_en?: string;
  persian_date?: string;
}

interface ComplianceTemplate {
  id: string;
  industry: string;
  framework_name: string;
  description: string | null;
  jurisdiction: string | null;
  reporting_frequency: string | null;
  typical_deadlines: ComplianceDeadline[];
  required_scopes: string[];
  key_requirements: string[];
}

// Regulatory body mapping for Iran
const getIranRegulatoryBody = (frameworkName: string): { name: string; nameEn: string; color: string; icon: React.ReactNode } | null => {
  if (frameworkName.includes('سازمان محیط زیست') || frameworkName.includes('محیط زیست') || frameworkName.includes('EIA')) {
    return { name: 'سازمان محیط زیست', nameEn: 'DOE', color: 'bg-green-500/10 text-green-600 border-green-500/30', icon: <Leaf className="h-3 w-3" /> };
  }
  if (frameworkName.includes('وزارت صمت') || frameworkName.includes('صمت')) {
    return { name: 'وزارت صمت', nameEn: 'MIMT', color: 'bg-blue-500/10 text-blue-600 border-blue-500/30', icon: <Building2 className="h-3 w-3" /> };
  }
  if (frameworkName.includes('گاز') || frameworkName.includes('پالایشگاه') || frameworkName.includes('نفت')) {
    return { name: 'شرکت ملی نفت', nameEn: 'NIOC', color: 'bg-orange-500/10 text-orange-600 border-orange-500/30', icon: <Fuel className="h-3 w-3" /> };
  }
  return null;
};

export function IndustryComplianceCalendar() {
  const { organization, user } = useAuth();
  const [templates, setTemplates] = useState<ComplianceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<string | null>(null);
  const [orgIndustry, setOrgIndustry] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrgIndustry = async () => {
      if (!organization?.id) return;
      
      const { data } = await supabase
        .from('organizations')
        .select('industry')
        .eq('id', organization.id)
        .single();
      
      if (data?.industry) {
        setOrgIndustry(data.industry);
      }
    };
    
    fetchOrgIndustry();
  }, [organization]);

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!orgIndustry) {
        setLoading(false);
        return;
      }

      setLoading(true);
      // Fetch both global and Iran-specific templates for the industry
      const { data, error } = await supabase
        .from('industry_compliance_templates')
        .select('*')
        .eq('industry', orgIndustry)
        .order('jurisdiction')
        .order('framework_name');

      if (!error && data) {
        // Parse the JSONB typical_deadlines field
        const parsedData = data.map(d => ({
          ...d,
          typical_deadlines: (d.typical_deadlines as any) || [],
          required_scopes: d.required_scopes || [],
          key_requirements: d.key_requirements || []
        }));
        setTemplates(parsedData);
      }
      setLoading(false);
    };

    fetchTemplates();
  }, [orgIndustry]);

  const iranTemplates = templates.filter(t => t.jurisdiction === 'Iran');
  const globalTemplates = templates.filter(t => t.jurisdiction !== 'Iran');

  const addToComplianceCalendar = async (template: ComplianceTemplate) => {
    if (!organization?.id) {
      toast.error('No organization found');
      return;
    }

    setAdding(template.id);
    try {
      // First, create the compliance framework
      const { data: framework, error: frameworkError } = await supabase
        .from('compliance_frameworks')
        .insert({
          organization_id: organization.id,
          framework_name: template.framework_name,
          status: 'pending',
          completeness_percentage: 0,
          metadata: {
            jurisdiction: template.jurisdiction,
            required_scopes: template.required_scopes,
            key_requirements: template.key_requirements
          }
        })
        .select()
        .single();

      if (frameworkError) throw frameworkError;

      // Then add the deadlines
      const currentYear = new Date().getFullYear();
      const deadlines = template.typical_deadlines.map(deadline => ({
        organization_id: organization.id,
        framework_id: framework.id,
        title: `${template.framework_name} - ${deadline.description}`,
        description: deadline.description,
        due_date: new Date(currentYear, deadline.month - 1, deadline.day).toISOString().split('T')[0],
        priority: 'high',
        status: 'pending'
      }));

      const { error: deadlineError } = await supabase
        .from('compliance_deadlines')
        .insert(deadlines);

      if (deadlineError) throw deadlineError;

      toast.success(`${template.framework_name} added to your compliance calendar`);
    } catch (error) {
      console.error('Error adding framework:', error);
      toast.error('Failed to add compliance framework');
    } finally {
      setAdding(null);
    }
  };

  const formatIndustryName = (industry: string) => {
    return industry.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!orgIndustry) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Industry Compliance Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Please set your organization's industry in Settings to see relevant compliance frameworks.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderTemplateCard = (template: ComplianceTemplate, isIran: boolean = false) => {
    const regulatoryBody = isIran ? getIranRegulatoryBody(template.framework_name) : null;

    return (
      <Card key={template.id} className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <FileCheck className="h-5 w-5 text-primary" />
                <h3 className="font-semibold" dir={isIran ? 'rtl' : 'ltr'}>
                  {template.framework_name}
                </h3>
                {regulatoryBody && (
                  <Badge className={`${regulatoryBody.color} border gap-1`}>
                    {regulatoryBody.icon}
                    <span>{regulatoryBody.nameEn}</span>
                    <span className="text-xs opacity-75">({regulatoryBody.name})</span>
                  </Badge>
                )}
                {!isIran && template.jurisdiction && (
                  <Badge variant="outline">{template.jurisdiction}</Badge>
                )}
                {template.reporting_frequency && (
                  <Badge variant="secondary">{template.reporting_frequency}</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3" dir={isIran ? 'rtl' : 'ltr'}>
                {template.description}
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-1">
                    {isIran ? 'محدوده‌های مورد نیاز:' : 'Required Scopes:'}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {template.required_scopes.map(scope => (
                      <Badge key={scope} variant="secondary" className="text-xs">
                        {scope.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-1">
                    {isIran ? 'مهلت‌های کلیدی:' : 'Key Deadlines:'}
                  </p>
                  <div className="space-y-1">
                    {template.typical_deadlines.slice(0, 3).map((d, i) => (
                      <p key={i} className="text-muted-foreground text-xs" dir={isIran ? 'rtl' : 'ltr'}>
                        {isIran && d.persian_date ? (
                          <>
                            <span className="font-medium text-foreground">{d.persian_date}</span>
                            {' - '}
                            {d.description}
                            {d.description_en && (
                              <span className="text-muted-foreground/70 block text-xs" dir="ltr">
                                ({d.description_en})
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            {d.month > 0 && d.day > 0 ? 
                              new Date(2024, d.month - 1, d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
                              : ''
                            } - {d.description}
                          </>
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <p className="font-medium mb-1 text-sm">
                  {isIran ? 'الزامات کلیدی:' : 'Key Requirements:'}
                </p>
                <div className="flex flex-wrap gap-1" dir={isIran ? 'rtl' : 'ltr'}>
                  {template.key_requirements.slice(0, 4).map(req => (
                    <Badge key={req} variant="outline" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                  {template.key_requirements.length > 4 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.key_requirements.length - 4} {isIran ? 'مورد دیگر' : 'more'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={() => addToComplianceCalendar(template)}
              disabled={adding === template.id}
              className="shrink-0"
            >
              {adding === template.id ? (
                isIran ? 'در حال افزودن...' : 'Adding...'
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  {isIran ? 'افزودن به تقویم' : 'Add to Calendar'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Industry Compliance Templates
        </CardTitle>
        <CardDescription>
          Pre-configured compliance frameworks for {formatIndustryName(orgIndustry)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {templates.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No compliance templates available for your industry yet.
          </p>
        ) : (
          <Tabs defaultValue={iranTemplates.length > 0 ? 'iran' : 'global'} className="w-full">
            <TabsList className="mb-4">
              {iranTemplates.length > 0 && (
                <TabsTrigger value="iran" className="gap-2">
                  🇮🇷 Iran (ایران)
                  <Badge variant="secondary" className="ml-1">{iranTemplates.length}</Badge>
                </TabsTrigger>
              )}
              {globalTemplates.length > 0 && (
                <TabsTrigger value="global" className="gap-2">
                  🌍 Global
                  <Badge variant="secondary" className="ml-1">{globalTemplates.length}</Badge>
                </TabsTrigger>
              )}
            </TabsList>

            {iranTemplates.length > 0 && (
              <TabsContent value="iran" className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-3 mb-4 text-sm" dir="rtl">
                  <p className="font-medium mb-1">📋 مقررات جمهوری اسلامی ایران</p>
                  <p className="text-muted-foreground text-xs">
                    تمپلیت‌های انطباق مطابق با الزامات وزارت صمت و سازمان حفاظت محیط زیست
                  </p>
                </div>
                {iranTemplates.map(template => renderTemplateCard(template, true))}
              </TabsContent>
            )}

            {globalTemplates.length > 0 && (
              <TabsContent value="global" className="space-y-4">
                {globalTemplates.map(template => renderTemplateCard(template, false))}
              </TabsContent>
            )}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
