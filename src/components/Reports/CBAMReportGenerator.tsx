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
  Plus, 
  Trash2, 
  Globe, 
  Factory, 
  Package,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { cbamReportService, CBAM_CN_CODES, CBAMProduct, CBAMReportData } from '@/services/cbamReportService';

interface ProductEntry {
  id: string;
  cnCode: string;
  productDescription: string;
  countryOfOrigin: string;
  installationName: string;
  quantityImported: string;
  embeddedEmissionsDirect: string;
  embeddedEmissionsIndirect: string;
  carbonPricePaid: string;
}

const emptyProduct: ProductEntry = {
  id: '',
  cnCode: '',
  productDescription: '',
  countryOfOrigin: '',
  installationName: '',
  quantityImported: '',
  embeddedEmissionsDirect: '',
  embeddedEmissionsIndirect: '',
  carbonPricePaid: ''
};

export function CBAMReportGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('quick');
  
  // Report period
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  
  // Declarant info
  const [declarantName, setDeclarantName] = useState('');
  const [declarantPosition, setDeclarantPosition] = useState('');
  const [declarantCompany, setDeclarantCompany] = useState('');
  const [eoriNumber, setEoriNumber] = useState('');
  
  // Products
  const [products, setProducts] = useState<ProductEntry[]>([{ ...emptyProduct, id: '1' }]);

  const handleGenerateSample = async () => {
    setIsGenerating(true);
    try {
      await cbamReportService.generateSampleCBAMReport();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCustom = async () => {
    // Validation
    if (!periodStart || !periodEnd) {
      toast.error('Please specify the reporting period');
      return;
    }
    if (!declarantName || !declarantCompany) {
      toast.error('Please provide declarant information');
      return;
    }
    if (products.length === 0 || !products.some(p => p.cnCode && p.quantityImported)) {
      toast.error('Please add at least one product');
      return;
    }

    setIsGenerating(true);
    try {
      const validProducts: CBAMProduct[] = products
        .filter(p => p.cnCode && p.quantityImported)
        .map(p => {
          const direct = parseFloat(p.embeddedEmissionsDirect) || 0;
          const indirect = parseFloat(p.embeddedEmissionsIndirect) || 0;
          const quantity = parseFloat(p.quantityImported) || 1;
          return {
            id: p.id,
            cnCode: p.cnCode,
            productDescription: p.productDescription || 'Not specified',
            countryOfOrigin: p.countryOfOrigin || 'Unknown',
            installationName: p.installationName || 'Unknown Installation',
            quantityImported: quantity,
            quantityUnit: 'tonnes',
            embeddedEmissionsDirect: direct,
            embeddedEmissionsIndirect: indirect,
            totalEmbeddedEmissions: direct + indirect,
            specificEmbeddedEmissions: (direct + indirect) / quantity,
            carbonPricePaid: parseFloat(p.carbonPricePaid) || 0,
            carbonPriceCurrency: 'EUR'
          };
        });

      const reportData: CBAMReportData = {
        reportingPeriod: { start: periodStart, end: periodEnd },
        declarant: {
          name: declarantName,
          position: declarantPosition,
          company: declarantCompany,
          eoriNumber: eoriNumber || undefined
        },
        products: validProducts,
        totalEmissions: validProducts.reduce((sum, p) => sum + p.totalEmbeddedEmissions, 0),
        totalCarbonPricePaid: validProducts.reduce((sum, p) => sum + p.carbonPricePaid, 0),
        methodology: 'Calculated using actual installation data and EU CBAM default values where applicable.'
      };

      await cbamReportService.generateCBAMReport(reportData);
    } finally {
      setIsGenerating(false);
    }
  };

  const addProduct = () => {
    setProducts([...products, { ...emptyProduct, id: Date.now().toString() }]);
  };

  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const updateProduct = (id: string, field: keyof ProductEntry, value: string) => {
    setProducts(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const getCNCodeCategory = (code: string): string => {
    const match = CBAM_CN_CODES.find(c => code.startsWith(c.code));
    return match?.category || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">EU CBAM Report Generator</CardTitle>
              <CardDescription>
                Generate Carbon Border Adjustment Mechanism declarations for EU imports
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quick">Quick Sample Report</TabsTrigger>
          <TabsTrigger value="custom">Custom Report</TabsTrigger>
        </TabsList>

        {/* Quick Sample Report */}
        <TabsContent value="quick" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Sample CBAM Report
              </CardTitle>
              <CardDescription>
                Generate a sample CBAM report with demonstration data to see the report format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">Sample includes:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Steel products (Semi-finished iron) from Turkey
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Aluminium (Unwrought) from Russia
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Cement (Portland) from Egypt
                  </li>
                </ul>
              </div>
              
              <Button 
                onClick={handleGenerateSample} 
                disabled={isGenerating}
                className="w-full"
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
                    Download Sample CBAM Report (PDF)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Report */}
        <TabsContent value="custom" className="space-y-4">
          {/* Reporting Period */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reporting Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input 
                    type="date" 
                    value={periodStart} 
                    onChange={(e) => setPeriodStart(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input 
                    type="date" 
                    value={periodEnd} 
                    onChange={(e) => setPeriodEnd(e.target.value)} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Declarant Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Declarant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input 
                    placeholder="Your Company Ltd." 
                    value={declarantCompany}
                    onChange={(e) => setDeclarantCompany(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>EORI Number</Label>
                  <Input 
                    placeholder="DE123456789012345" 
                    value={eoriNumber}
                    onChange={(e) => setEoriNumber(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Authorized Representative *</Label>
                  <Input 
                    placeholder="John Smith" 
                    value={declarantName}
                    onChange={(e) => setDeclarantName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input 
                    placeholder="Sustainability Manager" 
                    value={declarantPosition}
                    onChange={(e) => setDeclarantPosition(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Imported Products
                </CardTitle>
                <Button variant="outline" size="sm" onClick={addProduct}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {products.map((product, index) => (
                <div key={product.id} className="p-4 border rounded-lg space-y-4 relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Product {index + 1}</Badge>
                      {product.cnCode && getCNCodeCategory(product.cnCode) && (
                        <Badge variant="secondary">{getCNCodeCategory(product.cnCode)}</Badge>
                      )}
                    </div>
                    {products.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CN Code *</Label>
                      <Select 
                        value={product.cnCode} 
                        onValueChange={(v) => updateProduct(product.id, 'cnCode', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select CN code" />
                        </SelectTrigger>
                        <SelectContent>
                          {CBAM_CN_CODES.map(code => (
                            <SelectItem key={code.code} value={code.code}>
                              {code.code} - {code.description.substring(0, 40)}...
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Product Description</Label>
                      <Input 
                        placeholder="Detailed product description"
                        value={product.productDescription}
                        onChange={(e) => updateProduct(product.id, 'productDescription', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Country of Origin</Label>
                      <Input 
                        placeholder="e.g., Turkey, China"
                        value={product.countryOfOrigin}
                        onChange={(e) => updateProduct(product.id, 'countryOfOrigin', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Installation Name</Label>
                      <Input 
                        placeholder="Production facility name"
                        value={product.installationName}
                        onChange={(e) => updateProduct(product.id, 'installationName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Quantity (tonnes) *</Label>
                      <Input 
                        type="number"
                        placeholder="0"
                        value={product.quantityImported}
                        onChange={(e) => updateProduct(product.id, 'quantityImported', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Direct Emissions (tCO₂e)</Label>
                      <Input 
                        type="number"
                        placeholder="0"
                        value={product.embeddedEmissionsDirect}
                        onChange={(e) => updateProduct(product.id, 'embeddedEmissionsDirect', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Indirect Emissions (tCO₂e)</Label>
                      <Input 
                        type="number"
                        placeholder="0"
                        value={product.embeddedEmissionsIndirect}
                        onChange={(e) => updateProduct(product.id, 'embeddedEmissionsIndirect', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Carbon Price Paid (EUR)</Label>
                      <Input 
                        type="number"
                        placeholder="0"
                        value={product.carbonPricePaid}
                        onChange={(e) => updateProduct(product.id, 'carbonPricePaid', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <p className="text-sm text-amber-700">
                  If actual emissions data is unavailable, EU default values will be applied.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button 
            onClick={handleGenerateCustom} 
            disabled={isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating CBAM Report...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate CBAM Declaration Report
              </>
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
