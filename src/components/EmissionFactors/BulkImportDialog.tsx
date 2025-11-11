import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { z } from 'zod';

const emissionFactorImportSchema = z.object({
  name: z.string().min(3, 'Name too short'),
  category: z.string().min(2, 'Category required'),
  scope: z.enum(['S1', 'S2', 'S3'], { errorMap: () => ({ message: 'Invalid scope' }) }),
  factor_value: z.number().positive('Must be positive'),
  unit: z.enum(['kgCO2e/kWh', 'kgCO2e/MWh', 'kgCO2e/L', 'kgCO2e/kg', 'kgCO2e/t', 'kgCO2e/m3', 'kgCO2e/km', 'kgCO2e/passenger_km', 'kgCO2e/tonne_km', 'kgCO2e/night']),
  source: z.string().min(3, 'Source required'),
  region: z.string().optional(),
  country_code: z.string().optional(),
  methodology: z.string().optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  uncertainty: z.number().min(0).max(100).optional(),
  version: z.string().optional(),
  version_notes: z.string().optional(),
});

type ImportRow = z.infer<typeof emissionFactorImportSchema> & {
  rowNumber: number;
  status: 'valid' | 'invalid' | 'duplicate';
  errors: string[];
  duplicateOf?: string;
};

export const BulkImportDialog: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const downloadTemplate = () => {
    const template = [
      ['name', 'category', 'scope', 'factor_value', 'unit', 'source', 'region', 'country_code', 'methodology', 'year', 'uncertainty', 'version', 'version_notes'],
      ['Electricity - US Grid Average', 'Electricity', 'S2', '0.386', 'kgCO2e/kWh', 'EPA eGRID 2024', 'US', 'US', 'GHG Protocol', '2024', '5', '1.0', 'Updated grid factors']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'EmissionFactors');
    XLSX.writeFile(wb, 'emission_factors_template.xlsx');
    toast.success('Template downloaded');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    
    try {
      const data = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Fetch existing factors for duplicate detection
      const { data: existingFactors } = await supabase
        .from('emission_factors')
        .select('name, category, scope, region, version');

      const processed: ImportRow[] = jsonData.map((row: any, index) => {
        const rowNumber = index + 2; // +2 because Excel is 1-indexed and has header
        const errors: string[] = [];
        
        // Parse and validate
        const parsed = {
          name: String(row.name || '').trim(),
          category: String(row.category || '').trim(),
          scope: String(row.scope || '').trim() as 'S1' | 'S2' | 'S3',
          factor_value: parseFloat(row.factor_value),
          unit: String(row.unit || '').trim() as any,
          source: String(row.source || '').trim(),
          region: row.region ? String(row.region).trim() : undefined,
          country_code: row.country_code ? String(row.country_code).trim() : undefined,
          methodology: row.methodology ? String(row.methodology).trim() : undefined,
          year: row.year ? parseInt(row.year) : undefined,
          uncertainty: row.uncertainty ? parseFloat(row.uncertainty) : undefined,
          version: row.version ? String(row.version).trim() : undefined,
          version_notes: row.version_notes ? String(row.version_notes).trim() : undefined,
        };

        // Validate with Zod
        const validation = emissionFactorImportSchema.safeParse(parsed);
        
        if (!validation.success) {
          validation.error.errors.forEach(err => {
            errors.push(`${err.path.join('.')}: ${err.message}`);
          });
        }

        // Check for duplicates
        const isDuplicate = existingFactors?.some(existing => 
          existing.name.toLowerCase() === parsed.name.toLowerCase() &&
          existing.category.toLowerCase() === parsed.category.toLowerCase() &&
          existing.scope === parsed.scope &&
          (existing.region || '') === (parsed.region || '')
        );

        const duplicateOf = isDuplicate 
          ? existingFactors?.find(existing => 
              existing.name.toLowerCase() === parsed.name.toLowerCase() &&
              existing.category.toLowerCase() === parsed.category.toLowerCase() &&
              existing.scope === parsed.scope
            )?.name
          : undefined;

        return {
          ...(validation.success ? validation.data : parsed),
          rowNumber,
          status: errors.length > 0 ? 'invalid' : isDuplicate ? 'duplicate' : 'valid',
          errors,
          duplicateOf,
        } as ImportRow;
      });

      setParsedData(processed);
      
      const validCount = processed.filter(r => r.status === 'valid').length;
      const invalidCount = processed.filter(r => r.status === 'invalid').length;
      const duplicateCount = processed.filter(r => r.status === 'duplicate').length;
      
      toast.info(`Parsed ${processed.length} rows: ${validCount} valid, ${duplicateCount} duplicates, ${invalidCount} invalid`);
    } catch (error: any) {
      toast.error('Failed to parse file');
      console.error(error);
    }
  };

  const handleImport = async () => {
    const validRows = parsedData.filter(row => row.status === 'valid');
    
    if (validRows.length === 0) {
      toast.error('No valid rows to import');
      return;
    }

    setImporting(true);
    setImportProgress(0);
    
    try {
      const batchSize = 50;
      let imported = 0;

      for (let i = 0; i < validRows.length; i += batchSize) {
        const batch = validRows.slice(i, i + batchSize);
        
        const records = batch.map(row => ({
          user_id: user?.id,
          name: row.name,
          category: row.category,
          scope: row.scope,
          factor_value: row.factor_value,
          unit: row.unit,
          source: row.source,
          region: row.region || null,
          country_code: row.country_code || null,
          methodology: row.methodology || 'GHG Protocol',
          year: row.year || null,
          uncertainty: row.uncertainty || null,
          version: row.version || '1.0',
          version_notes: row.version_notes || null,
          is_latest: true,
          is_custom: true,
        }));

        const { error } = await supabase
          .from('emission_factors')
          .insert(records);

        if (error) throw error;

        imported += batch.length;
        setImportProgress((imported / validRows.length) * 100);
      }

      toast.success(`Successfully imported ${imported} emission factors`);
      setOpen(false);
      setParsedData([]);
      setFile(null);
    } catch (error: any) {
      toast.error('Failed to import factors');
      console.error(error);
    } finally {
      setImporting(false);
      setImportProgress(0);
    }
  };

  const validCount = parsedData.filter(r => r.status === 'valid').length;
  const invalidCount = parsedData.filter(r => r.status === 'invalid').length;
  const duplicateCount = parsedData.filter(r => r.status === 'duplicate').length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Import Emission Factors</DialogTitle>
          <DialogDescription>
            Upload CSV or Excel files to import multiple emission factors at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-auto">
          {!file ? (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Download the template to see the required format and example data
                </AlertDescription>
              </Alert>

              <Button onClick={downloadTemplate} variant="outline" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download Template
              </Button>

              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  Upload CSV or Excel file (.csv, .xlsx, .xls)
                </p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="secondary" asChild>
                    <span>Choose File</span>
                  </Button>
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{file.name}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-success" />
                      {validCount} valid
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-warning" />
                      {duplicateCount} duplicates
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-destructive" />
                      {invalidCount} invalid
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    setParsedData([]);
                  }}
                >
                  Choose Different File
                </Button>
              </div>

              {importing && (
                <div className="space-y-2">
                  <Progress value={importProgress} />
                  <p className="text-sm text-center text-muted-foreground">
                    Importing... {Math.round(importProgress)}%
                  </p>
                </div>
              )}

              <div className="border rounded-lg max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background">
                    <TableRow>
                      <TableHead className="w-12">Row</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Errors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((row) => (
                      <TableRow key={row.rowNumber}>
                        <TableCell className="font-mono text-xs">{row.rowNumber}</TableCell>
                        <TableCell>
                          {row.status === 'valid' && (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Valid
                            </Badge>
                          )}
                          {row.status === 'duplicate' && (
                            <Badge variant="secondary" className="gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Duplicate
                            </Badge>
                          )}
                          {row.status === 'invalid' && (
                            <Badge variant="destructive" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Invalid
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell>{row.scope}</TableCell>
                        <TableCell>{row.factor_value}</TableCell>
                        <TableCell>
                          {row.status === 'duplicate' && (
                            <span className="text-xs text-muted-foreground">
                              Matches: {row.duplicateOf}
                            </span>
                          )}
                          {row.errors.length > 0 && (
                            <div className="text-xs text-destructive space-y-1">
                              {row.errors.map((err, i) => (
                                <div key={i}>{err}</div>
                              ))}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={importing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={validCount === 0 || importing}
                >
                  Import {validCount} Factor{validCount !== 1 ? 's' : ''}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
