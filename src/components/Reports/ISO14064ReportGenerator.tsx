import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Shield,
  CheckCircle,
  Loader2,
  Building,
  Calendar,
  Target
} from 'lucide-react';
import { iso14064ReportService } from '@/services/iso14064ReportService';

export function ISO14064ReportGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('quick');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  const handleGenerateSample = async () => {
    setIsGenerating(true);
    try {
      await iso14064ReportService.generateSampleReport();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFromData = async () => {
    setIsGenerating(true);
    try {
      await iso14064ReportService.generateReportFromDatabase(parseInt(selectedYear));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600 rounded-xl">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">ISO 14064-1:2018 GHG Inventory Report</CardTitle>
              <CardDescription>
                Generate internationally recognized greenhouse gas inventory reports
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Standard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Organizational Boundary</p>
                <p className="text-xs text-muted-foreground">Control approach</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Operational Boundary</p>
                <p className="text-xs text-muted-foreground">Scopes 1, 2, 3</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Base Year Analysis</p>
                <p className="text-xs text-muted-foreground">Progress tracking</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Uncertainty Assessment</p>
                <p className="text-xs text-muted-foreground">Data quality</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quick">Sample Report</TabsTrigger>
          <TabsTrigger value="database">From Your Data</TabsTrigger>
        </TabsList>

        {/* Sample Report */}
        <TabsContent value="quick" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Sample ISO 14064-1 Report
              </CardTitle>
              <CardDescription>
                Generate a comprehensive sample report to see the full ISO 14064-1:2018 format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <p className="text-sm font-medium">Report sections included:</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Executive Summary',
                    'Organizational Boundary',
                    'Operational Boundary',
                    'GHG Emissions Quantification',
                    'Scope 1 Direct Emissions',
                    'Scope 2 Energy Indirect',
                    'Scope 3 Other Indirect',
                    'Base Year Comparison',
                    'Uncertainty Assessment',
                    'Verification Statement',
                    'Methodology Documentation',
                    'Declaration of Accuracy'
                  ].map((section, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-500" />
                      <span className="text-muted-foreground">{section}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">ISO 14064-1:2018</Badge>
                <Badge variant="outline">GHG Protocol Aligned</Badge>
                <Badge variant="outline">IPCC AR5 GWPs</Badge>
                <Badge variant="outline">Third-party Verifiable</Badge>
              </div>
              
              <Button 
                onClick={handleGenerateSample} 
                disabled={isGenerating}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Sample ISO 14064-1 Report (PDF)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* From Database */}
        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generate from Your Emissions Data
              </CardTitle>
              <CardDescription>
                Create an ISO 14064-1 compliant report using your actual emissions entries
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Reporting Year</Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Report will include all emissions entries for the selected calendar year
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> The report will use your existing emissions data. Make sure you have entered emissions data for the selected year before generating the report.
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={handleGenerateFromData} 
                disabled={isGenerating}
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate ISO 14064-1 Report for {selectedYear}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ISO 14064 Standard Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">About ISO 14064-1:2018</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            ISO 14064-1:2018 specifies principles and requirements at the organization level for quantification and reporting of greenhouse gas (GHG) emissions and removals. This internationally recognized standard ensures transparency, accuracy, and comparability in GHG accounting.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">Quantification</h4>
              <p className="text-sm text-muted-foreground">
                Rigorous methodology for calculating emissions across all scopes
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">Transparency</h4>
              <p className="text-sm text-muted-foreground">
                Clear documentation of boundaries, methods, and assumptions
              </p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">Verification</h4>
              <p className="text-sm text-muted-foreground">
                Ready for third-party assurance and verification
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
