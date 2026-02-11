import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, TrendingDown, TrendingUp } from 'lucide-react';

interface ExecutiveSummaryData {
  currentEmissions: {
    total: number;
    scope1: number;
    scope2: number;
    scope3: number;
    unit: string;
    change: number;
  };
  targets: {
    shortTerm: { year: number; reduction: number; current: number } | null;
  };
  recentReports: { title: string; date: string; status: string }[];
}

interface BoardReportPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: ExecutiveSummaryData | null;
  sections: Record<string, boolean>;
  reportType: string;
  onDownloadPDF: () => void;
}

export const BoardReportPreview: React.FC<BoardReportPreviewProps> = ({
  open,
  onOpenChange,
  summary,
  sections,
  reportType,
  onDownloadPDF,
}) => {
  if (!summary) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Board Report Preview</DialogTitle>
          <DialogDescription>
            {reportType.charAt(0).toUpperCase() + reportType.slice(1)} report — {Object.values(sections).filter(Boolean).length} sections included
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {sections['Executive Summary'] && (
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-3">Executive Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Scope 1</p>
                  <p className="text-xl font-bold">{summary.currentEmissions.scope1.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">tCO2e</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Scope 2</p>
                  <p className="text-xl font-bold">{summary.currentEmissions.scope2.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">tCO2e</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Scope 3</p>
                  <p className="text-xl font-bold">{summary.currentEmissions.scope3.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">tCO2e</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Badge variant={summary.currentEmissions.change < 0 ? 'default' : 'destructive'}>
                  {summary.currentEmissions.change < 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                  {Math.abs(summary.currentEmissions.change)}% YoY
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Total: {summary.currentEmissions.total.toLocaleString()} tCO2e
                </span>
              </div>
            </section>
          )}

          {sections['Target Progress'] && summary.targets.shortTerm && (
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-3">Reduction Targets</h3>
              <div className="p-3 bg-muted/30 rounded">
                <span className="text-sm font-medium">Target Year: {summary.targets.shortTerm.year}</span>
                <span className="text-sm text-muted-foreground ml-4">
                  {summary.targets.shortTerm.current}% / {summary.targets.shortTerm.reduction}% reduction
                </span>
              </div>
            </section>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t">
          <Button onClick={onDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
