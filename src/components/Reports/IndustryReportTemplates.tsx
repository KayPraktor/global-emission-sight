import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Search, FileText, Building2, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getTemplatesForIndustry, getAllTemplates, IndustryReportTemplate } from '@/data/industryReportTemplates';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';

interface IndustryReportTemplatesProps {
  onGenerateReport?: (template: IndustryReportTemplate) => void;
}

const IndustryReportTemplates: React.FC<IndustryReportTemplatesProps> = ({ onGenerateReport }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<IndustryReportTemplate | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userIndustry, setUserIndustry] = useState<{ industry: string | null; subIndustry: string | null }>({
    industry: null,
    subIndustry: null,
  });
  const [activeTab, setActiveTab] = useState('recommended');

  useEffect(() => {
    fetchUserIndustry();
  }, []);

  const fetchUserIndustry = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (membership?.organization_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('industry, sub_industry')
          .eq('id', membership.organization_id)
          .single();

        if (org) {
          setUserIndustry({
            industry: org.industry,
            subIndustry: org.sub_industry,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user industry:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const recommendedTemplates = useMemo(() => {
    if (!userIndustry.industry) return [];
    return getTemplatesForIndustry(userIndustry.industry, userIndustry.subIndustry);
  }, [userIndustry]);

  const allTemplates = useMemo(() => {
    return getAllTemplates();
  }, []);

  const filteredTemplates = useMemo(() => {
    const templates = activeTab === 'recommended' ? recommendedTemplates : allTemplates;
    
    if (!searchQuery) return templates;

    return templates.filter(
      t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
           t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
           t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [activeTab, recommendedTemplates, allTemplates, searchQuery]);

  const handlePreview = (template: IndustryReportTemplate) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);
    try {
      // Simulate report generation - in production this would call a service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (onGenerateReport) {
        onGenerateReport(selectedTemplate);
      }
      
      toast.success(`${selectedTemplate.title} generated successfully`);
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Industry Context Banner */}
      {userIndustry.industry && (
        <GlassmorphismCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">
                Personalized Templates for {userIndustry.industry.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                {userIndustry.subIndustry && ` - ${userIndustry.subIndustry.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {recommendedTemplates.length} templates tailored to your industry
              </p>
            </div>
          </div>
        </GlassmorphismCard>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search industry templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="recommended" disabled={!userIndustry.industry}>
            Recommended ({recommendedTemplates.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All Templates ({allTemplates.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="mt-4">
          {recommendedTemplates.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                Set your organization's industry in Settings to see recommended templates.
              </p>
            </div>
          ) : (
            <TemplateGrid 
              templates={filteredTemplates} 
              onPreview={handlePreview}
              userIndustry={userIndustry.industry}
            />
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <TemplateGrid 
            templates={filteredTemplates} 
            onPreview={handlePreview}
            userIndustry={userIndustry.industry}
          />
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {selectedTemplate.title}
                </DialogTitle>
                <DialogDescription>
                  {selectedTemplate.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Report Sections</h4>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {selectedTemplate.sections.map((section) => (
                        <div key={section.id} className="flex items-start gap-2 p-2 rounded-lg bg-muted/50">
                          <CheckCircle2 className={`h-4 w-4 mt-0.5 ${section.required ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div>
                            <p className="text-sm font-medium">{section.title}</p>
                            <p className="text-xs text-muted-foreground">{section.description}</p>
                          </div>
                          {section.required && (
                            <Badge variant="outline" className="ml-auto text-xs">Required</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Compliance Frameworks</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.complianceFrameworks.map((framework) => (
                      <Badge key={framework} variant="outline">{framework}</Badge>
                    ))}
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Available formats:</span> {selectedTemplate.format}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface TemplateGridProps {
  templates: IndustryReportTemplate[];
  onPreview: (template: IndustryReportTemplate) => void;
  userIndustry: string | null;
}

const TemplateGrid: React.FC<TemplateGridProps> = ({ templates, onPreview, userIndustry }) => {
  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No templates match your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {templates.map((template) => (
        <Card 
          key={template.id} 
          className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onPreview(template)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-base">{template.title}</CardTitle>
              {userIndustry && template.industry === userIndustry.toLowerCase() && (
                <Badge variant="default" className="text-xs">Recommended</Badge>
              )}
            </div>
            <CardDescription className="text-xs line-clamp-2">
              {template.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-1 mb-3">
              {template.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{template.sections.length} sections</span>
              <span>{template.format.split(',')[0]}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default IndustryReportTemplates;
