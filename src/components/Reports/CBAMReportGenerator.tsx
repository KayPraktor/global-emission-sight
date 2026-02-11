import React, { useState, useMemo } from 'react';
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
  Package,
  AlertCircle,
  CheckCircle,
  Loader2,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  cbamReportService, 
  CBAM_CN_CODES, 
  COUNTRY_GRID_FACTORS,
  EU_DEFAULT_EMISSION_VALUES,
  calculateSpecificEmbeddedEmissions,
  validateEORI,
  CBAMProduct, 
  CBAMPrecursor,
  CBAMReportData 
} from '@/services/cbamReportService';

interface PrecursorEntry {
  name: string;
  quantity: string;
  emissionFactor: string;
}

interface ProductEntry {
  id: string;
  cnCode: string;
  productDescription: string;
  countryOfOrigin: string;
  installationName: string;
  quantityImported: string;
  netMass: string;
  embeddedEmissionsDirect: string;
  electricityConsumption: string;
  gridEmissionFactor: string;
  carbonPricePaid: string;
  precursors: PrecursorEntry[];
  dataSource: 'actual' | 'default';
}

const emptyPrecursor: PrecursorEntry = { name: '', quantity: '', emissionFactor: '' };

const emptyProduct: ProductEntry = {
  id: '',
  cnCode: '',
  productDescription: '',
  countryOfOrigin: '',
  installationName: '',
  quantityImported: '',
  netMass: '',
  embeddedEmissionsDirect: '',
  electricityConsumption: '',
  gridEmissionFactor: '',
  carbonPricePaid: '',
  precursors: [],
  dataSource: 'actual',
};

const countries = Object.keys(COUNTRY_GRID_FACTORS);

export function CBAMReportGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('quick');
  
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [declarantName, setDeclarantName] = useState('');
  const [declarantPosition, setDeclarantPosition] = useState('');
  const [declarantCompany, setDeclarantCompany] = useState('');
  const [eoriNumber, setEoriNumber] = useState('');
  const [eoriValid, setEoriValid] = useState<boolean | null>(null);
  
  const [products, setProducts] = useState<ProductEntry[]>([{ ...emptyProduct, id: '1' }]);

  const handleEoriChange = (value: string) => {
    setEoriNumber(value);
    setEoriValid(value.length > 0 ? validateEORI(value) : null);
  };

  const handleGenerateSample = async () => {
    setIsGenerating(true);
    try {
      await cbamReportService.generateSampleCBAMReport();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCustom = async () => {
    if (!periodStart || !periodEnd) { toast.error('Please specify the reporting period'); return; }
    if (!declarantName || !declarantCompany) { toast.error('Please provide declarant information'); return; }
    if (eoriNumber && !validateEORI(eoriNumber)) { toast.error('Invalid EORI number format (e.g. DE123456789012345)'); return; }
    if (products.length === 0 || !products.some(p => p.cnCode && p.quantityImported)) {
      toast.error('Please add at least one product'); return;
    }

    setIsGenerating(true);
    try {
      const validProducts: CBAMProduct[] = products
        .filter(p => p.cnCode && p.quantityImported)
        .map(p => {
          const direct = parseFloat(p.embeddedEmissionsDirect) || 0;
          const elecConsumption = parseFloat(p.electricityConsumption) || 0;
          const gridFactor = parseFloat(p.gridEmissionFactor) || 0;
          const netMass = parseFloat(p.netMass) || parseFloat(p.quantityImported) || 1;
          const precursors: CBAMPrecursor[] = p.precursors
            .filter(pr => pr.name && pr.quantity)
            .map(pr => {
              const qty = parseFloat(pr.quantity) || 0;
              const ef = parseFloat(pr.emissionFactor) || 0;
              return { name: pr.name, quantity: qty, emissionFactor: ef, totalEmissions: qty * ef };
            });

          const calc = calculateSpecificEmbeddedEmissions({
            embeddedEmissionsDirect: direct,
            electricityConsumption: elecConsumption,
            gridEmissionFactor: gridFactor,
            precursors,
            netMass,
          });

          return {
            id: p.id,
            cnCode: p.cnCode,
            productDescription: p.productDescription || 'Not specified',
            countryOfOrigin: p.countryOfOrigin || 'Unknown',
            installationName: p.installationName || 'Unknown Installation',
            quantityImported: parseFloat(p.quantityImported) || 0,
            quantityUnit: 'tonnes',
            netMass,
            embeddedEmissionsDirect: direct,
            embeddedEmissionsIndirect: calc.indirect,
            electricityConsumption: elecConsumption,
            gridEmissionFactor: gridFactor,
            precursors,
            totalEmbeddedEmissions: calc.total,
            specificEmbeddedEmissions: calc.specific,
            carbonPricePaid: parseFloat(p.carbonPricePaid) || 0,
            carbonPriceCurrency: 'EUR',
            dataSource: p.dataSource,
          };
        });

      const reportData: CBAMReportData = {
        reportingPeriod: { start: periodStart, end: periodEnd },
        declarant: { name: declarantName, position: declarantPosition, company: declarantCompany, eoriNumber: eoriNumber || undefined },
        products: validProducts,
        totalEmissions: validProducts.reduce((sum, p) => sum + p.totalEmbeddedEmissions, 0),
        totalCarbonPricePaid: validProducts.reduce((sum, p) => sum + p.carbonPricePaid, 0),
        methodology: 'Calculated using actual installation data and EU CBAM default values where applicable.',
      };

      await cbamReportService.generateCBAMReport(reportData);
    } finally {
      setIsGenerating(false);
    }
  };

  const addProduct = () => setProducts([...products, { ...emptyProduct, id: Date.now().toString() }]);
  const removeProduct = (id: string) => { if (products.length > 1) setProducts(products.filter(p => p.id !== id)); };

  const updateProduct = (id: string, field: keyof ProductEntry, value: any) => {
    setProducts(products.map(p => {
      if (p.id !== id) return p;
      const updated = { ...p, [field]: value };
      // Auto-populate grid factor when country changes
      if (field === 'countryOfOrigin' && COUNTRY_GRID_FACTORS[value as string]) {
        updated.gridEmissionFactor = COUNTRY_GRID_FACTORS[value as string].factor.toString();
      }
      return updated;
    }));
  };

  const addPrecursor = (productId: string) => {
    setProducts(products.map(p =>
      p.id === productId ? { ...p, precursors: [...p.precursors, { ...emptyPrecursor }] } : p
    ));
  };

  const removePrecursor = (productId: string, index: number) => {
    setProducts(products.map(p =>
      p.id === productId ? { ...p, precursors: p.precursors.filter((_, i) => i !== index) } : p
    ));
  };

  const updatePrecursor = (productId: string, index: number, field: keyof PrecursorEntry, value: string) => {
    setProducts(products.map(p =>
      p.id === productId ? {
        ...p,
        precursors: p.precursors.map((pr, i) => i === index ? { ...pr, [field]: value } : pr),
      } : p
    ));
  };

  const applyDefaults = (productId: string) => {
    setProducts(products.map(p => {
      if (p.id !== productId) return p;
      const cnCode = p.cnCode.split(' ')[0];
      const cbamCode = CBAM_CN_CODES.find(c => cnCode.startsWith(c.code));
      const category = cbamCode?.category || '';
      const defaults = EU_DEFAULT_EMISSION_VALUES[category];
      if (!defaults) { toast.error(`No EU defaults for category: ${category}`); return p; }
      const qty = parseFloat(p.quantityImported) || parseFloat(p.netMass) || 0;
      return {
        ...p,
        embeddedEmissionsDirect: (defaults.direct * qty).toFixed(2),
        dataSource: 'default' as const,
      };
    }));
  };

  const getCNCodeCategory = (code: string): string => {
    const match = CBAM_CN_CODES.find(c => code.startsWith(c.code));
    return match?.category || '';
  };

  // Live summary calculation
  const liveSummary = useMemo(() => {
    return products.map(p => {
      const direct = parseFloat(p.embeddedEmissionsDirect) || 0;
      const elec = parseFloat(p.electricityConsumption) || 0;
      const grid = parseFloat(p.gridEmissionFactor) || 0;
      const netMass = parseFloat(p.netMass) || parseFloat(p.quantityImported) || 0;
      const precursors: CBAMPrecursor[] = p.precursors.map(pr => ({
        name: pr.name, quantity: parseFloat(pr.quantity) || 0,
        emissionFactor: parseFloat(pr.emissionFactor) || 0, totalEmissions: 0,
      }));
      const calc = calculateSpecificEmbeddedEmissions({ embeddedEmissionsDirect: direct, electricityConsumption: elec, gridEmissionFactor: grid, precursors, netMass });
      return { id: p.id, cnCode: p.cnCode, total: calc.total, specific: calc.specific, indirect: calc.indirect, precursorTotal: calc.precursorTotal };
    });
  }, [products]);

  const grandTotal = liveSummary.reduce((s, p) => s + p.total, 0);

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">EU CBAM Report Generator</CardTitle>
              <CardDescription>
                Generate Carbon Border Adjustment Mechanism declarations per EU Regulation 2023/956
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
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Steel products from Turkey (with precursors)</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Aluminium from Russia</li>
                  <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" />Cement from Egypt (EU defaults)</li>
                </ul>
              </div>
              <Button onClick={handleGenerateSample} disabled={isGenerating} className="w-full" size="lg">
                {isGenerating ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating...</>) : (<><Download className="mr-2 h-4 w-4" />Download Sample CBAM Report (PDF)</>)}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          {/* Reporting Period */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Reporting Period</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Declarant */}
          <Card>
            <CardHeader><CardTitle className="text-lg">Declarant Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name *</Label>
                  <Input placeholder="Your Company Ltd." value={declarantCompany} onChange={(e) => setDeclarantCompany(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>EORI Number</Label>
                  <Input
                    placeholder="DE123456789012345"
                    value={eoriNumber}
                    onChange={(e) => handleEoriChange(e.target.value)}
                    className={eoriValid === false ? 'border-destructive' : eoriValid === true ? 'border-green-500' : ''}
                  />
                  {eoriValid === false && <p className="text-xs text-destructive">Invalid format. Expected: 2 letter code + up to 15 chars</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Authorized Representative *</Label>
                  <Input placeholder="John Smith" value={declarantName} onChange={(e) => setDeclarantName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input placeholder="Sustainability Manager" value={declarantPosition} onChange={(e) => setDeclarantPosition(e.target.value)} />
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
                  <Plus className="h-4 w-4 mr-1" /> Add Product
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {products.map((product, index) => (
                <div key={product.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Product {index + 1}</Badge>
                      {product.cnCode && getCNCodeCategory(product.cnCode) && (
                        <Badge variant="secondary">{getCNCodeCategory(product.cnCode)}</Badge>
                      )}
                      <Badge variant={product.dataSource === 'actual' ? 'default' : 'outline'}>
                        {product.dataSource === 'actual' ? 'Actual Data' : 'EU Defaults'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {product.cnCode && (
                        <Button variant="ghost" size="sm" onClick={() => applyDefaults(product.id)} title="Apply EU default values">
                          <Zap className="h-4 w-4 text-amber-500" />
                        </Button>
                      )}
                      {products.length > 1 && (
                        <Button variant="ghost" size="sm" onClick={() => removeProduct(product.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Row 1: CN Code + Description */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>CN Code *</Label>
                      <Select value={product.cnCode} onValueChange={(v) => updateProduct(product.id, 'cnCode', v)}>
                        <SelectTrigger><SelectValue placeholder="Select CN code" /></SelectTrigger>
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
                      <Input placeholder="Detailed description" value={product.productDescription} onChange={(e) => updateProduct(product.id, 'productDescription', e.target.value)} />
                    </div>
                  </div>

                  {/* Row 2: Country + Installation */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Country of Origin</Label>
                      <Select value={product.countryOfOrigin} onValueChange={(v) => updateProduct(product.id, 'countryOfOrigin', v)}>
                        <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                        <SelectContent>
                          {countries.map(c => (
                            <SelectItem key={c} value={c}>{c} ({COUNTRY_GRID_FACTORS[c].factor} tCO₂e/MWh)</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Installation Name</Label>
                      <Input placeholder="Production facility" value={product.installationName} onChange={(e) => updateProduct(product.id, 'installationName', e.target.value)} />
                    </div>
                  </div>

                  {/* Row 3: Quantities */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Quantity Imported (t) *</Label>
                      <Input type="number" placeholder="0" value={product.quantityImported} onChange={(e) => updateProduct(product.id, 'quantityImported', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Net Mass (t)</Label>
                      <Input type="number" placeholder="Same as qty" value={product.netMass} onChange={(e) => updateProduct(product.id, 'netMass', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Direct Emissions (tCO₂e)</Label>
                      <Input type="number" placeholder="0" value={product.embeddedEmissionsDirect} onChange={(e) => updateProduct(product.id, 'embeddedEmissionsDirect', e.target.value)} />
                    </div>
                  </div>

                  {/* Row 4: Electricity + Grid + Carbon Price */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Electricity (MWh)</Label>
                      <Input type="number" placeholder="0" value={product.electricityConsumption} onChange={(e) => updateProduct(product.id, 'electricityConsumption', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Grid Factor (tCO₂e/MWh)</Label>
                      <Input type="number" step="0.001" placeholder="Auto from country" value={product.gridEmissionFactor} onChange={(e) => updateProduct(product.id, 'gridEmissionFactor', e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Carbon Price Paid (EUR)</Label>
                      <Input type="number" placeholder="0" value={product.carbonPricePaid} onChange={(e) => updateProduct(product.id, 'carbonPricePaid', e.target.value)} />
                    </div>
                  </div>

                  {/* Precursors */}
                  <div className="space-y-3 border-t pt-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Precursor Materials</Label>
                      <Button variant="outline" size="sm" onClick={() => addPrecursor(product.id)}>
                        <Plus className="h-3 w-3 mr-1" /> Add Precursor
                      </Button>
                    </div>
                    {product.precursors.map((pr, prIndex) => (
                      <div key={prIndex} className="grid grid-cols-4 gap-3 items-end">
                        <div className="space-y-1">
                          <Label className="text-xs">Material Name</Label>
                          <Input placeholder="e.g. Iron Ore Pellets" value={pr.name} onChange={(e) => updatePrecursor(product.id, prIndex, 'name', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Quantity (t)</Label>
                          <Input type="number" placeholder="0" value={pr.quantity} onChange={(e) => updatePrecursor(product.id, prIndex, 'quantity', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">EF (tCO₂e/t)</Label>
                          <Input type="number" step="0.001" placeholder="0" value={pr.emissionFactor} onChange={(e) => updatePrecursor(product.id, prIndex, 'emissionFactor', e.target.value)} />
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => removePrecursor(product.id, prIndex)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    {product.precursors.length === 0 && (
                      <p className="text-xs text-muted-foreground">No precursor materials added. Click "Add Precursor" if this product uses intermediate materials.</p>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  If actual emissions data is unavailable, use ⚡ to apply EU default values by category.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Live Summary Table */}
          {products.some(p => p.cnCode) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Live Emissions Summary</CardTitle>
                <CardDescription>Calculated using SEE = (Direct + Indirect + Precursor) / Net Mass</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">Product</th>
                        <th className="text-right py-2 px-3">Direct</th>
                        <th className="text-right py-2 px-3">Indirect</th>
                        <th className="text-right py-2 px-3">Precursors</th>
                        <th className="text-right py-2 px-3 font-bold">Total (tCO₂e)</th>
                        <th className="text-right py-2 px-3 font-bold">Specific (tCO₂e/t)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {liveSummary.filter(s => s.cnCode).map((s, i) => (
                        <tr key={s.id} className="border-b">
                          <td className="py-2 px-3">{s.cnCode}</td>
                          <td className="text-right py-2 px-3">{(parseFloat(products[i]?.embeddedEmissionsDirect) || 0).toFixed(1)}</td>
                          <td className="text-right py-2 px-3">{s.indirect.toFixed(1)}</td>
                          <td className="text-right py-2 px-3">{s.precursorTotal.toFixed(1)}</td>
                          <td className="text-right py-2 px-3 font-semibold">{s.total.toFixed(1)}</td>
                          <td className="text-right py-2 px-3 font-semibold">{s.specific.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-bold border-t-2">
                        <td className="py-2 px-3">Grand Total</td>
                        <td colSpan={3}></td>
                        <td className="text-right py-2 px-3">{grandTotal.toFixed(1)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          <Button onClick={handleGenerateCustom} disabled={isGenerating} className="w-full" size="lg">
            {isGenerating ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating CBAM Report...</>) : (<><Download className="mr-2 h-4 w-4" />Generate CBAM Declaration Report</>)}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}