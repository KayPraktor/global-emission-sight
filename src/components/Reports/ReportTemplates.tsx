
import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, Search, Grid3X3, List, Star, Clock, TrendingUp, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { generateReport, Template } from '@/services/templateService';
import EnhancedTemplateCard from './EnhancedTemplateCard';
import EnhancedTemplatePreview from './EnhancedTemplatePreview';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<number[]>([]);

  const filteredTemplates = useMemo(() => {
    let filtered = activeCategory === 'all' 
      ? templates 
      : templates.filter(template => template.categories.includes(activeCategory));
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply sorting
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'date':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'popularity':
          const popularityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
          return popularityOrder[b.popularity as keyof typeof popularityOrder] - popularityOrder[a.popularity as keyof typeof popularityOrder];
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [activeCategory, searchQuery, sortBy]);

  const handlePreviewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setDialogOpen(true);
  };

  const handleGenerateReport = async () => {
    if (!selectedTemplate) return;
    
    setDialogOpen(false);
    await generateReport(selectedTemplate);
  };

  const toggleFavorite = (templateId: number) => {
    setFavorites(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const recentTemplates = templates.slice(0, 3);
  const popularTemplates = templates.filter(t => t.popularity === 'High');
  const availableTemplates = filteredTemplates.filter(t => t.available);
  const unavailableTemplates = filteredTemplates.filter(t => !t.available);

  return (
    <div className="space-y-6">
      {/* Quick Stats & Recent Templates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <GlassmorphismCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Grid3X3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{availableTemplates.length} Templates</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
          </div>
        </GlassmorphismCard>
        
        <GlassmorphismCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm font-medium">{popularTemplates.length} Popular</p>
              <p className="text-xs text-muted-foreground">High Usage</p>
            </div>
          </div>
        </GlassmorphismCard>
        
        <GlassmorphismCard className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium">{favorites.length} Favorites</p>
              <p className="text-xs text-muted-foreground">Saved</p>
            </div>
          </div>
        </GlassmorphismCard>
      </div>

      {/* Search and Filter Bar */}
      <GlassmorphismCard className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates, tags, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Popularity
                  </div>
                </SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="date">Last Updated</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex rounded-md border bg-background/50">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </GlassmorphismCard>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-sm">
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Results Summary */}
      {searchQuery && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          Found {filteredTemplates.length} templates matching "{searchQuery}"
        </div>
      )}
      
      {/* Templates Grid/List */}
      <div className={viewMode === 'grid' 
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
        : 'space-y-4'
      }>
        {filteredTemplates.map((template) => (
          <EnhancedTemplateCard
            key={template.id}
            template={template}
            onPreview={handlePreviewTemplate}
            isFavorited={favorites.includes(template.id)}
            onToggleFavorite={() => toggleFavorite(template.id)}
            viewMode={viewMode}
          />
        ))}
      </div>
      
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <Grid3X3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No templates found</p>
            <p className="text-sm">Try adjusting your search criteria or browse different categories</p>
          </div>
        </div>
      )}

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
              
              <EnhancedTemplatePreview template={selectedTemplate} />
              
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
