
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, FileSpreadsheet, FileText, Download, Copy, Clipboard, ClipboardCheck, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define template categories
const categories = [
  { id: 'all', name: 'All Templates' },
  { id: 'ghg', name: 'GHG Protocol' },
  { id: 'cdp', name: 'CDP' },
  { id: 'tcfd', name: 'TCFD' },
  { id: 'custom', name: 'Custom' },
];

// Define report templates
const templates = [
  {
    id: 1,
    title: 'GHG Protocol Corporate Standard',
    description: 'Comprehensive emissions reporting according to the GHG Protocol Corporate Standard.',
    categories: ['ghg'],
    tags: ['Standard', 'Comprehensive'],
    lastUpdated: '2025-04-10',
    format: 'Excel, PDF',
    popularity: 'High',
    previewImage: '/placeholder.svg',
  },
  {
    id: 2,
    title: 'CDP Climate Change Questionnaire',
    description: 'Pre-formatted template for CDP Climate Change reporting with automated data mapping.',
    categories: ['cdp'],
    tags: ['Questionnaire', 'Annual Submission'],
    lastUpdated: '2025-03-22',
    format: 'Web Form, Excel',
    popularity: 'Medium',
    previewImage: '/placeholder.svg',
  },
  {
    id: 3,
    title: 'TCFD Financial Disclosure',
    description: 'Climate-related financial disclosure template following TCFD recommendations.',
    categories: ['tcfd'],
    tags: ['Financial', 'Disclosure'],
    lastUpdated: '2025-04-30',
    format: 'PDF, PowerPoint',
    popularity: 'Medium',
    previewImage: '/placeholder.svg',
  },
  {
    id: 4,
    title: 'Executive Summary Dashboard',
    description: 'High-level emissions overview for executive presentations.',
    categories: ['custom'],
    tags: ['Executive', 'Dashboard'],
    lastUpdated: '2025-05-01',
    format: 'PowerPoint, Dashboard',
    popularity: 'High',
    previewImage: '/placeholder.svg',
  },
  {
    id: 5,
    title: 'Scope 3 Detailed Analysis',
    description: 'Comprehensive breakdown of Scope 3 emissions across categories.',
    categories: ['ghg', 'custom'],
    tags: ['Scope 3', 'Detailed'],
    lastUpdated: '2025-04-15',
    format: 'Excel, PDF',
    popularity: 'Medium',
    previewImage: '/placeholder.svg',
  },
  {
    id: 6,
    title: 'GHG Inventory Management Plan',
    description: 'Template for documenting GHG inventory processes, methodologies, and responsibilities.',
    categories: ['ghg'],
    tags: ['Management', 'Documentation'],
    lastUpdated: '2025-03-10',
    format: 'Word, PDF',
    popularity: 'Low',
    previewImage: '/placeholder.svg',
  },
];

const ReportTemplates = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredTemplates = activeCategory === 'all' 
    ? templates 
    : templates.filter(template => template.categories.includes(activeCategory));

  const handleUseTemplate = (template: any) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
    toast.success(`Template "${template.title}" selected`);
  };

  const handleDownloadTemplate = (template: any) => {
    toast.success(`Template "${template.title}" downloaded`);
  };

  const handleDuplicateTemplate = (template: any) => {
    toast.success(`Template "${template.title}" duplicated`);
  };

  return (
    <div>
      <div className="mb-6">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle>{template.title}</CardTitle>
                <Badge variant="outline" className="ml-2">
                  {template.categories[0].toUpperCase()}
                </Badge>
              </div>
              <CardDescription className="mt-1.5">{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <img 
                  src={template.previewImage} 
                  alt={`Preview of ${template.title}`} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                  <Button variant="secondary" onClick={() => handleUseTemplate(template)}>
                    Preview Template
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {template.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Format</p>
                    <p>{template.format}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p>{template.lastUpdated}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-4 px-4 border-t">
              <div className="flex justify-between items-center w-full">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDuplicateTemplate(template)}
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Duplicate
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadTemplate(template)}
                  >
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Download
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleUseTemplate(template)}
                  >
                    Use Template
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Template Preview Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTemplate.title}</DialogTitle>
                <DialogDescription>
                  {selectedTemplate.description}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[500px] border rounded-md p-4">
                <div className="space-y-6">
                  <div className="text-center p-4 border-b">
                    <h2 className="text-2xl font-bold mb-2">
                      {selectedTemplate.title.includes("GHG") ? "GHG Emissions Report" : 
                       selectedTemplate.title.includes("CDP") ? "CDP Climate Change Response" :
                       selectedTemplate.title.includes("TCFD") ? "TCFD Disclosure Report" : 
                       "Emissions Report"}
                    </h2>
                    <p className="text-muted-foreground">
                      Generated for ACME Corporation • Reporting Period: Jan 2025 - May 2025
                    </p>
                  </div>
                  
                  <div className="border p-4 rounded-md">
                    <h3 className="font-medium mb-2 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Organizational Information
                    </h3>
                    <div className="space-y-2 pl-6">
                      <p>Company Name: ACME Corporation</p>
                      <p>Reporting Period: January 1, 2025 - May 18, 2025</p>
                      <p>Reporting Boundary: Operational Control</p>
                      <p>Verification Status: Pending External Verification</p>
                    </div>
                  </div>
                  
                  <div className="border p-4 rounded-md">
                    <h3 className="font-medium mb-2 flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2 text-blue-500" />
                      Emissions Summary
                    </h3>
                    <div className="pl-6">
                      <div className="aspect-video bg-muted flex items-center justify-center mb-4">
                        <img 
                          src="/placeholder.svg" 
                          alt="Emissions summary chart" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <p>Total GHG Emissions: 12,450 tCO₂e</p>
                        <p>Scope 1: 3,820 tCO₂e (30.7%)</p>
                        <p>Scope 2: 5,230 tCO₂e (42.0%)</p>
                        <p>Scope 3: 3,400 tCO₂e (27.3%)</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border p-4 rounded-md">
                    <h3 className="font-medium mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-purple-500" />
                      Methodology
                    </h3>
                    <div className="space-y-2 pl-6">
                      <p>Standards Applied: GHG Protocol Corporate Standard</p>
                      <p>Calculation Tools: BARYON Emissions Management Platform</p>
                      <p>Emissions Factors: 2024 EPA Emissions Factors for Stationary Combustion</p>
                      <p>Global Warming Potentials: IPCC Fifth Assessment Report (AR5)</p>
                    </div>
                  </div>
                  
                  <div className="border p-4 rounded-md">
                    <h3 className="font-medium mb-2 flex items-center">
                      <ClipboardCheck className="h-4 w-4 mr-2 text-amber-500" />
                      Performance Against Targets
                    </h3>
                    <div className="pl-6">
                      <div className="aspect-video bg-muted flex items-center justify-center mb-4">
                        <img 
                          src="/placeholder.svg" 
                          alt="Performance targets chart" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-2">
                        <p>2025 Target: 15% reduction from 2020 baseline</p>
                        <p>Current Progress: 12% reduction achieved</p>
                        <p>Status: On track</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <div className="flex justify-end space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleDownloadTemplate(selectedTemplate)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={() => {
                  toast.success(`Using template "${selectedTemplate.title}"`);
                  setDialogOpen(false);
                }}>
                  Generate Report
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportTemplates;
