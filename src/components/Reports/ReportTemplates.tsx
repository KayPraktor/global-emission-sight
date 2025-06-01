
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { generateReport, Template } from '@/services/templateService';
import TemplateCard from './TemplateCard';
import TemplatePreview from './TemplatePreview';

// Define template categories
const categories = [
  { id: 'all', name: 'All Templates' },
  { id: 'ghg', name: 'GHG Protocol' },
  { id: 'cdp', name: 'CDP' },
  { id: 'tcfd', name: 'TCFD' },
  { id: 'custom', name: 'Custom' },
];

// Define report templates with availability status
const templates: Template[] = [
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
    fileName: 'ghg_protocol_corporate_standard',
    available: true,
  },
  {
    id: 2,
    title: 'CDP Climate Change Questionnaire',
    description: 'Pre-formatted template for CDP Climate Change reporting with automated data mapping.',
    categories: ['cdp'],
    tags: ['Questionnaire', 'Annual Submission'],
    lastUpdated: '2025-03-22',
    format: 'Excel, Word',
    popularity: 'Medium',
    previewImage: '/placeholder.svg',
    fileName: 'cdp_climate_change_questionnaire',
    available: true,
  },
  {
    id: 3,
    title: 'TCFD Financial Disclosure',
    description: 'Climate-related financial disclosure template following TCFD recommendations.',
    categories: ['tcfd'],
    tags: ['Financial', 'Disclosure'],
    lastUpdated: '2025-04-30',
    format: 'PDF, Word',
    popularity: 'Medium',
    previewImage: '/placeholder.svg',
    fileName: 'tcfd_financial_disclosure',
    available: true,
  },
  {
    id: 4,
    title: 'Executive Summary Dashboard',
    description: 'High-level emissions overview for executive presentations.',
    categories: ['custom'],
    tags: ['Executive', 'Dashboard'],
    lastUpdated: '2025-05-01',
    format: 'PDF, Excel',
    popularity: 'High',
    previewImage: '/placeholder.svg',
    fileName: 'executive_summary_dashboard',
    available: true,
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
    fileName: 'scope3_detailed_analysis',
    available: true,
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
    fileName: 'ghg_inventory_management_plan',
    available: false, // This template is currently unavailable
  },
];

const ReportTemplates = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredTemplates = activeCategory === 'all' 
    ? templates 
    : templates.filter(template => template.categories.includes(activeCategory));

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const handleGenerateReport = async () => {
    if (!selectedTemplate) return;
    
    setDialogOpen(false);
    await generateReport(selectedTemplate);
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
          <TemplateCard
            key={template.id}
            template={template}
            onPreview={handlePreviewTemplate}
          />
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
              
              <TemplatePreview template={selectedTemplate} />
              
              <div className="flex justify-end space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleGenerateReport}>
                  <Download className="h-4 w-4 mr-2" />
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
