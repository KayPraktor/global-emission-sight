import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileText, TrendingUp, Calendar } from 'lucide-react';
import { comprehensiveReportService } from '@/services/comprehensiveReportService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ComprehensiveReportGenerator = () => {
  const [generatingQuarterly, setGeneratingQuarterly] = useState(false);
  const [generatingAnnual, setGeneratingAnnual] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedQuarter, setSelectedQuarter] = useState('1');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);
  const quarters = [
    { value: '1', label: 'Q1 (Jan - Mar)' },
    { value: '2', label: 'Q2 (Apr - Jun)' },
    { value: '3', label: 'Q3 (Jul - Sep)' },
    { value: '4', label: 'Q4 (Oct - Dec)' }
  ];

  const handleGenerateQuarterly = async () => {
    setGeneratingQuarterly(true);
    try {
      await comprehensiveReportService.generateQuarterlyReport(
        parseInt(selectedYear),
        parseInt(selectedQuarter)
      );
    } finally {
      setGeneratingQuarterly(false);
    }
  };

  const handleGenerateAnnual = async () => {
    setGeneratingAnnual(true);
    try {
      await comprehensiveReportService.generateAnnualReport(parseInt(selectedYear));
    } finally {
      setGeneratingAnnual(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Comprehensive Reports
        </CardTitle>
        <CardDescription>
          Generate quarterly or annual reports with year-over-year comparisons and trend analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="quarterly" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quarterly">Quarterly Report</TabsTrigger>
            <TabsTrigger value="annual">Annual Report</TabsTrigger>
          </TabsList>

          <TabsContent value="quarterly" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Quarter</label>
                <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {quarters.map((quarter) => (
                      <SelectItem key={quarter.value} value={quarter.value}>
                        {quarter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Quarterly Report Includes:
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Quarter-over-quarter comparison with previous quarter</li>
                <li>Year-over-year comparison with same quarter last year</li>
                <li>Scope-level emissions breakdown and trends</li>
                <li>Top emission sources for the quarter</li>
                <li>Monthly emissions trend within the quarter</li>
                <li>Percentage changes and trend indicators</li>
              </ul>
            </div>

            <Button
              onClick={handleGenerateQuarterly}
              disabled={generatingQuarterly}
              className="w-full"
            >
              {generatingQuarterly ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Calendar className="mr-2 h-4 w-4" />
                  Generate Q{selectedQuarter} {selectedYear} Report
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="annual" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Annual Report Includes:
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Year-over-year comparison with previous year</li>
                <li>Comprehensive scope analysis with trend indicators</li>
                <li>Annual total emissions and data point statistics</li>
                <li>Top 5 emission sources ranked by impact</li>
                <li>Monthly emissions breakdown for the entire year</li>
                <li>Detailed percentage changes across all scopes</li>
                <li>Trend analysis (improving/increasing indicators)</li>
              </ul>
            </div>

            <Button
              onClick={handleGenerateAnnual}
              disabled={generatingAnnual}
              className="w-full"
            >
              {generatingAnnual ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Generate {selectedYear} Annual Report
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ComprehensiveReportGenerator;
