import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Cog, 
  ShieldCheck, 
  Target, 
  LayoutDashboard,
  Check
} from 'lucide-react';
import { DASHBOARD_TEMPLATES, DashboardTemplate } from '@/utils/dashboardTemplates';

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: DashboardTemplate) => void;
}

const iconMap = {
  'briefcase': Briefcase,
  'cog': Cog,
  'shield-check': ShieldCheck,
  'target': Target,
  'layout-dashboard': LayoutDashboard,
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  open,
  onOpenChange,
  onSelectTemplate,
}) => {
  const handleSelectTemplate = (template: DashboardTemplate) => {
    onSelectTemplate(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose a Dashboard Template</DialogTitle>
          <DialogDescription>
            Select a pre-configured template as a starting point. You can customize it after applying.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {DASHBOARD_TEMPLATES.map((template) => {
            const Icon = iconMap[template.icon as keyof typeof iconMap];
            
            return (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleSelectTemplate(template)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Pinned KPIs ({template.pinnedKPIs.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {template.pinnedKPIs.slice(0, 4).map((kpi) => (
                          <Badge key={kpi} variant="secondary" className="text-xs">
                            {kpi}
                          </Badge>
                        ))}
                        {template.pinnedKPIs.length > 4 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.pinnedKPIs.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectTemplate(template);
                      }}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Apply Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
