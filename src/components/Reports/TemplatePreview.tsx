
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle, BarChart3, FileText, ClipboardCheck } from 'lucide-react';

interface TemplatePreviewProps {
  template: {
    id: number;
    title: string;
    description: string;
    categories: string[];
  };
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template }) => {
  const getReportTitle = () => {
    if (template.title.includes("GHG")) return "GHG Emissions Report";
    if (template.title.includes("CDP")) return "CDP Climate Change Response";
    if (template.title.includes("TCFD")) return "TCFD Disclosure Report";
    return "Emissions Report";
  };

  return (
    <ScrollArea className="h-[500px] border rounded-md p-4">
      <div className="space-y-6">
        <div className="text-center p-4 border-b">
          <h2 className="text-2xl font-bold mb-2">{getReportTitle()}</h2>
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
            <p>Reporting Period: January 1, 2025 - May 31, 2025</p>
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
            <div className="aspect-video bg-muted flex items-center justify-center mb-4 rounded">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Emissions Chart Placeholder</p>
              </div>
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
            <div className="aspect-video bg-muted flex items-center justify-center mb-4 rounded">
              <div className="text-center">
                <ClipboardCheck className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Performance Chart Placeholder</p>
              </div>
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
  );
};

export default TemplatePreview;
