import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, DollarSign, Building2, Globe, Info, Plus, Trash2 } from 'lucide-react';
import { eeioService } from '@/services/eeioService';
import { CURRENCY_RATES, type SpendEstimationResult, type SupplierSpendInput } from '@/types/eeio';
import { toast } from 'sonner';

interface SpendEntry {
  id: string;
  supplierName: string;
  spend: string;
  currency: string;
  industry: string;
  sector: string;
  region: string;
}

export function SpendBasedCalculator() {
  const [industries, setIndustries] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  
  const [entries, setEntries] = useState<SpendEntry[]>([
    { id: '1', supplierName: '', spend: '', currency: 'USD', industry: '', sector: '', region: 'Global' }
  ]);
  
  const [results, setResults] = useState<(SpendEstimationResult & { supplierName: string; spend: number; currency: string })[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [industriesData, regionsData] = await Promise.all([
          eeioService.getIndustries(),
          eeioService.getRegions(),
        ]);
        setIndustries(industriesData);
        setRegions(regionsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleIndustryChange = async (entryId: string, industry: string) => {
    const sectorsData = await eeioService.getSectors(industry);
    setSectors(sectorsData);
    
    setEntries(prev => prev.map(e => 
      e.id === entryId ? { ...e, industry, sector: '' } : e
    ));
  };

  const updateEntry = (id: string, field: keyof SpendEntry, value: string) => {
    setEntries(prev => prev.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const addEntry = () => {
    const newId = String(Date.now());
    setEntries(prev => [...prev, {
      id: newId,
      supplierName: '',
      spend: '',
      currency: 'USD',
      industry: entries[0]?.industry || '',
      sector: '',
      region: 'Global',
    }]);
  };

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const calculateEmissions = async () => {
    const validEntries = entries.filter(e => e.spend && e.industry);
    if (validEntries.length === 0) {
      toast.error('Please fill in at least one entry with spend amount and industry');
      return;
    }

    setCalculating(true);
    try {
      const inputs: SupplierSpendInput[] = validEntries.map(e => ({
        supplierName: e.supplierName || 'Unnamed Supplier',
        spend: parseFloat(e.spend),
        currency: e.currency,
        industry: e.industry,
        sector: e.sector || undefined,
        region: e.region || undefined,
      }));

      const calcResults = await eeioService.batchCalculate(inputs);
      setResults(calcResults);
      toast.success(`Calculated emissions for ${calcResults.length} entries`);
    } catch (error) {
      console.error('Calculation error:', error);
      toast.error('Error calculating emissions');
    } finally {
      setCalculating(false);
    }
  };

  const totalEmissions = results.reduce((sum, r) => sum + r.emissions, 0);

  const getQualityBadge = (quality: string) => {
    switch (quality) {
      case 'primary':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Primary</Badge>;
      case 'secondary':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Secondary</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Estimated</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Spend-Based Emission Calculator
          </CardTitle>
          <CardDescription>
            Estimate Scope 3 emissions using EEIO (Environmentally-Extended Input-Output) factors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input entries */}
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div key={entry.id} className="p-4 rounded-lg border bg-muted/30 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Entry {index + 1}</span>
                  {entries.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEntry(entry.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`supplier-${entry.id}`}>Supplier Name (Optional)</Label>
                    <Input
                      id={`supplier-${entry.id}`}
                      placeholder="e.g., Acme Corp"
                      value={entry.supplierName}
                      onChange={(e) => updateEntry(entry.id, 'supplierName', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`spend-${entry.id}`} className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Spend Amount *
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`spend-${entry.id}`}
                        type="number"
                        placeholder="50000"
                        value={entry.spend}
                        onChange={(e) => updateEntry(entry.id, 'spend', e.target.value)}
                        className="flex-1"
                      />
                      <Select
                        value={entry.currency}
                        onValueChange={(v) => updateEntry(entry.id, 'currency', v)}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(CURRENCY_RATES).map((curr) => (
                            <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`industry-${entry.id}`} className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Industry *
                    </Label>
                    <Select
                      value={entry.industry}
                      onValueChange={(v) => handleIndustryChange(entry.id, v)}
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map((ind) => (
                          <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`sector-${entry.id}`}>Sector (Optional)</Label>
                    <Select
                      value={entry.sector}
                      onValueChange={(v) => updateEntry(entry.id, 'sector', v)}
                      disabled={!entry.industry}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sector" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectors.map((sec) => (
                          <SelectItem key={sec} value={sec}>{sec}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`region-${entry.id}`} className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Region
                    </Label>
                    <Select
                      value={entry.region}
                      onValueChange={(v) => updateEntry(entry.id, 'region', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((reg) => (
                          <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={addEntry} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Another
            </Button>
            <Button onClick={calculateEmissions} disabled={calculating} className="gap-2">
              <Calculator className="h-4 w-4" />
              {calculating ? 'Calculating...' : 'Calculate Emissions'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Estimation Results</CardTitle>
            <CardDescription>
              Spend-based Scope 3 emissions using EEIO methodology
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Estimated Emissions</span>
                <span className="text-2xl font-bold text-primary">
                  {totalEmissions.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO₂e
                </span>
              </div>
            </div>

            <Separator />

            {/* Individual results */}
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="p-4 rounded-lg border space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{result.supplierName}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({result.spend.toLocaleString()} {result.currency})
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-semibold">
                        {result.emissions.toLocaleString(undefined, { maximumFractionDigits: 2 })} tCO₂e
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    {getQualityBadge(result.dataQuality)}
                    {result.factor && (
                      <>
                        <span className="text-muted-foreground">
                          Factor: {result.factor.factor_value} kgCO₂e/USD
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-muted-foreground">
                          Source: {result.factor.source}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="h-3 w-3" />
                    Uncertainty range: {result.uncertainty.lower.toLocaleString()} - {result.uncertainty.upper.toLocaleString()} tCO₂e
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
