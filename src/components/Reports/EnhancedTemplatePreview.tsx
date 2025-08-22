import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, BarChart3, FileText, ClipboardCheck, Building2, Calendar, Users, Zap, ChevronRight, TrendingUp, Target, AlertCircle } from 'lucide-react';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';

interface EnhancedTemplatePreviewProps {
  template: {
    id: number;
    title: string;
    description: string;
    categories: string[];
  };
}

const EnhancedTemplatePreview: React.FC<EnhancedTemplatePreviewProps> = ({ template }) => {
  const [activeSection, setActiveSection] = useState('overview');

  const getReportTitle = () => {
    if (template.title.includes("GHG")) return "GHG Emissions Report";
    if (template.title.includes("CDP")) return "CDP Climate Change Response";
    if (template.title.includes("TCFD")) return "TCFD Disclosure Report";
    return "Emissions Report";
  };

  const getReportIcon = () => {
    if (template.title.includes("GHG")) return BarChart3;
    if (template.title.includes("CDP")) return FileText;
    if (template.title.includes("TCFD")) return Building2;
    return FileText;
  };

  const ReportIcon = getReportIcon();

  const mockChartData = [
    { name: 'Scope 1', value: 3820, color: 'hsl(var(--primary))' },
    { name: 'Scope 2', value: 5230, color: 'hsl(var(--secondary))' },
    { name: 'Scope 3', value: 3400, color: 'hsl(var(--accent))' }
  ];

  const sections = [
    { id: 'overview', name: 'Overview', icon: FileText },
    { id: 'organization', name: 'Organization', icon: Building2 },
    { id: 'emissions', name: 'Emissions', icon: BarChart3 },
    { id: 'methodology', name: 'Methodology', icon: ClipboardCheck },
    { id: 'targets', name: 'Targets', icon: Target },
  ];

  return (
    <div className="h-[600px] flex">
      {/* Sidebar Navigation */}
      <div className="w-48 border-r border-border/50 bg-muted/20">
        <div className="p-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Sections
          </h4>
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-2 px-2 py-2 text-xs rounded-md transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {section.name}
                  <ChevronRight className="h-3 w-3 ml-auto" />
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center border-b border-border/50 pb-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <ReportIcon className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold">{getReportTitle()}</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Generated for ACME Corporation • Reporting Period: Jan 2025 - May 2025
            </p>
            <div className="flex justify-center gap-2">
              <Badge variant="outline">Draft</Badge>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            </div>
          </div>
          
          {/* Content Sections */}
          {activeSection === 'overview' && (
            <div className="space-y-4">
              <GlassmorphismCard className="p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-primary" />
                  Executive Summary
                </h3>
                <div className="space-y-3 text-sm">
                  <p>
                    This report presents ACME Corporation's greenhouse gas emissions inventory 
                    for the reporting period January 1, 2025 to May 31, 2025, prepared in 
                    accordance with the GHG Protocol Corporate Standard.
                  </p>
                  <div className="grid grid-cols-3 gap-4 p-3 bg-muted/30 rounded-lg">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">12,450</p>
                      <p className="text-xs text-muted-foreground">Total tCO₂e</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">-8%</p>
                      <p className="text-xs text-muted-foreground">vs Last Year</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">92%</p>
                      <p className="text-xs text-muted-foreground">Target Progress</p>
                    </div>
                  </div>
                </div>
              </GlassmorphismCard>
              
              <GlassmorphismCard className="p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                  Key Highlights
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>8% reduction in total emissions compared to previous year</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p>Achieved 92% of 2025 emission reduction target</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <p>Scope 3 emissions increased by 3% due to business expansion</p>
                  </div>
                </div>
              </GlassmorphismCard>
            </div>
          )}

          {activeSection === 'organization' && (
            <GlassmorphismCard className="p-4">
              <h3 className="font-semibold mb-3 flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-blue-500" />
                Organizational Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Company Name</p>
                  <p className="font-medium">ACME Corporation</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Industry Sector</p>
                  <p className="font-medium">Manufacturing</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reporting Period</p>
                  <p className="font-medium">January 1, 2025 - May 31, 2025</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Employees</p>
                  <p className="font-medium">2,450 FTE</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Reporting Boundary</p>
                  <p className="font-medium">Operational Control</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Verification Status</p>
                  <p className="font-medium flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    Third-party Verified
                  </p>
                </div>
              </div>
            </GlassmorphismCard>
          )}

          {activeSection === 'emissions' && (
            <div className="space-y-4">
              <GlassmorphismCard className="p-4">
                <h3 className="font-semibold mb-3 flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2 text-purple-500" />
                  Emissions Summary
                </h3>
                
                {/* Mock Chart */}
                <div className="aspect-video bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center mb-4 rounded-lg border">
                  <div className="text-center">
                    <BarChart3 className="h-16 w-16 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Interactive Emissions Chart</p>
                    <p className="text-xs text-muted-foreground">Hover to see detailed breakdowns</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mockChartData.map((scope, index) => (
                    <div key={scope.name} className="p-3 bg-muted/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{scope.name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {((scope.value / 12450) * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold">{scope.value.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">tCO₂e</p>
                    </div>
                  ))}
                </div>
              </GlassmorphismCard>

              <GlassmorphismCard className="p-4">
                <h4 className="font-medium mb-3">Emissions by Category</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                    <span>Stationary Combustion</span>
                    <span className="font-medium">2,890 tCO₂e</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                    <span>Electricity</span>
                    <span className="font-medium">4,850 tCO₂e</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                    <span>Business Travel</span>
                    <span className="font-medium">1,240 tCO₂e</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-muted/20 rounded">
                    <span>Supply Chain</span>
                    <span className="font-medium">3,470 tCO₂e</span>
                  </div>
                </div>
              </GlassmorphismCard>
            </div>
          )}

          {activeSection === 'methodology' && (
            <GlassmorphismCard className="p-4">
              <h3 className="font-semibold mb-3 flex items-center">
                <ClipboardCheck className="h-4 w-4 mr-2 text-amber-500" />
                Methodology & Standards
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Standards Applied</h4>
                  <p>GHG Protocol Corporate Accounting and Reporting Standard (2015 Edition)</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Calculation Methodology</h4>
                  <p>Activity Data × Emission Factor × Global Warming Potential (GWP)</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Data Sources</h4>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Energy bills and meter readings</li>
                    <li>Fuel purchase receipts</li>
                    <li>Travel expense reports</li>
                    <li>Supplier emissions data</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Emission Factors</h4>
                  <p>2024 EPA Emissions Factors for Stationary Combustion, IPCC AR5 GWP values</p>
                </div>
              </div>
            </GlassmorphismCard>
          )}

          {activeSection === 'targets' && (
            <GlassmorphismCard className="p-4">
              <h3 className="font-semibold mb-3 flex items-center">
                <Target className="h-4 w-4 mr-2 text-green-500" />
                Performance Against Targets
              </h3>
              
              <div className="aspect-video bg-gradient-to-br from-green-500/5 to-green-500/10 flex items-center justify-center mb-4 rounded-lg border">
                <div className="text-center">
                  <Target className="h-16 w-16 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Target Progress Visualization</p>
                  <p className="text-xs text-muted-foreground">Track against science-based targets</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">2025 Reduction Target</h4>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      On Track
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">15% reduction from 2020 baseline</p>
                  <div className="flex justify-between text-sm">
                    <span>Current Progress: 12% reduction</span>
                    <span className="font-medium">80% Complete</span>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">2030 Science-Based Target</h4>
                    <Badge variant="outline">Long-term</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">50% reduction from 2020 baseline</p>
                </div>
              </div>
            </GlassmorphismCard>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EnhancedTemplatePreview;