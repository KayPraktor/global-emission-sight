import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, TrendingDown, TrendingUp, Target, AlertTriangle, Lightbulb } from 'lucide-react';

interface BoardReportPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: ReturnType<typeof import('@/services/boardReportingService').getExecutiveSummary>;
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

          {sections['Emissions Performance'] && (
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-3">Quarterly Progress</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Quarter</th>
                      <th className="text-right py-2">Target</th>
                      <th className="text-right py-2">Actual</th>
                      <th className="text-right py-2">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.quarterlyProgress.map((q) => (
                      <tr key={q.quarter} className="border-b">
                        <td className="py-2 font-medium">{q.quarter}</td>
                        <td className="text-right py-2">{q.target.toLocaleString()}</td>
                        <td className="text-right py-2">{q.actual?.toLocaleString() ?? '—'}</td>
                        <td className={`text-right py-2 ${q.variance && q.variance < 0 ? 'text-green-600' : q.variance && q.variance > 0 ? 'text-red-600' : ''}`}>
                          {q.variance != null ? `${q.variance > 0 ? '+' : ''}${q.variance}%` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {sections['Target Progress'] && (
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4" /> Reduction Targets
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Short-Term', year: summary.targets.shortTerm.year, reduction: summary.targets.shortTerm.reduction, current: summary.targets.shortTerm.current },
                  { label: 'Medium-Term', year: summary.targets.mediumTerm.year, reduction: summary.targets.mediumTerm.reduction, current: summary.targets.mediumTerm.current },
                  { label: 'Long-Term', year: summary.targets.longTerm.year, reduction: summary.targets.longTerm.reduction, current: 18 },
                ].map((t, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-28 text-sm font-medium">{t.label} ({t.year})</span>
                    <Progress value={(t.current / t.reduction) * 100} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground w-24 text-right">{t.current}% / {t.reduction}%</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {sections['Risk Assessment'] && (
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Key Climate Risks
              </h3>
              <div className="space-y-2">
                {summary.keyRisks.map((risk, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                    <span className="text-sm">{risk.risk}</span>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">{risk.impact}</Badge>
                      <span className="text-xs text-muted-foreground">{risk.financialImpact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {sections['Opportunities'] && (
            <section>
              <h3 className="text-lg font-semibold border-b pb-2 mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-green-500" /> Strategic Opportunities
              </h3>
              <div className="space-y-2">
                {summary.opportunities.map((opp, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                    <span className="text-sm">{opp.opportunity}</span>
                    <div className="flex gap-2">
                      <span className="text-sm font-medium text-green-600">{opp.value}</span>
                      <Badge variant="outline" className="text-xs">{opp.timeline}</Badge>
                    </div>
                  </div>
                ))}
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
