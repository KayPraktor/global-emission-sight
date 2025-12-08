import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, FileCheck, AlertTriangle, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ComplianceTemplate {
  id: string;
  industry: string;
  framework_name: string;
  description: string | null;
  jurisdiction: string;
  reporting_frequency: string;
  typical_deadlines: { month: number; day: number; description: string }[];
  required_scopes: string[];
  key_requirements: string[];
}

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
      const { data, error } = await supabase
        .from('industry_compliance_templates')
        .select('*')
        .eq('industry', orgIndustry)
        .order('framework_name');

      if (!error && data) {
        // Parse the JSONB typical_deadlines field
        const parsedData = data.map(d => ({
          ...d,
          typical_deadlines: (d.typical_deadlines as any) || []
        }));
        setTemplates(parsedData);
      }
      setLoading(false);
    };

    fetchTemplates();
  }, [orgIndustry]);

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
      <CardContent className="space-y-4">
        {templates.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No compliance templates available for your industry yet.
          </p>
        ) : (
          templates.map((template) => (
            <Card key={template.id} className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileCheck className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">{template.framework_name}</h3>
                      <Badge variant="outline">{template.jurisdiction}</Badge>
                      <Badge variant="secondary">{template.reporting_frequency}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {template.description}
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium mb-1">Required Scopes:</p>
                        <div className="flex flex-wrap gap-1">
                          {template.required_scopes.map(scope => (
                            <Badge key={scope} variant="secondary" className="text-xs">
                              {scope.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Key Deadlines:</p>
                        <div className="space-y-1">
                          {template.typical_deadlines.slice(0, 2).map((d, i) => (
                            <p key={i} className="text-muted-foreground">
                              {new Date(2024, d.month - 1, d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {d.description}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="font-medium mb-1 text-sm">Key Requirements:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.key_requirements.slice(0, 3).map(req => (
                          <Badge key={req} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                        {template.key_requirements.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.key_requirements.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => addToComplianceCalendar(template)}
                    disabled={adding === template.id}
                  >
                    {adding === template.id ? (
                      'Adding...'
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-1" />
                        Add to Calendar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}
