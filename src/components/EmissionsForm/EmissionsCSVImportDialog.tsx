import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Download, AlertCircle, CheckCircle, AlertTriangle, Loader2, Sparkles } from 'lucide-react';
import { parseEmissionsCSV, generateEmissionsCSVTemplate, detectDuplicates, EmissionsCSVRow } from '@/utils/emissionsCsvParser';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { getIndustryMapping, getAllMappingsForIndustry, IndustryColumnMapping } from '@/data/industryCsvMappings';

interface EmissionsCSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
  facilityId?: string;
}

export const EmissionsCSVImportDialog: React.FC<EmissionsCSVImportDialogProps> = ({
  open,
  onOpenChange,
  onImportComplete,
  facilityId
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ReturnType<typeof parseEmissionsCSV> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duplicateInfo, setDuplicateInfo] = useState<{ duplicates: number[]; potentialDuplicates: number[] } | null>(null);
  const [userIndustry, setUserIndustry] = useState<{ industry: string | null; subIndustry: string | null }>({ industry: null, subIndustry: null });
  const [selectedMapping, setSelectedMapping] = useState<string>('standard');
  const [availableMappings, setAvailableMappings] = useState<IndustryColumnMapping[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      fetchUserIndustry();
    }
  }, [open]);

  const fetchUserIndustry = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: membership } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (membership?.organization_id) {
        const { data: org } = await supabase
          .from('organizations')
          .select('industry, sub_industry')
          .eq('id', membership.organization_id)
          .single();

        if (org?.industry) {
          setUserIndustry({ industry: org.industry, subIndustry: org.sub_industry });
          
          // Get available mappings for user's industry
          const mappings = getAllMappingsForIndustry(org.industry);
          setAvailableMappings(mappings);
          
          // Auto-select the best matching mapping
          const bestMatch = getIndustryMapping(org.industry, org.sub_industry);
          if (bestMatch) {
            setSelectedMapping(bestMatch.subIndustry || bestMatch.industry);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user industry:', error);
    }
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large', {
        description: 'Please upload a file smaller than 10MB'
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);
    
    try {
      const text = await file.text();
      const result = parseEmissionsCSV(text);
      setParseResult(result);

      // Check for duplicates if parsing was successful
      if (result.success && result.data) {
        const { data: existingEmissions } = await supabase
          .from('emissions_entries')
          .select('entry_date, scope, category, quantity')
          .order('entry_date', { ascending: false })
          .limit(1000);

        if (existingEmissions) {
          const dupes = detectDuplicates(result.data, existingEmissions);
          setDuplicateInfo(dupes);
        }
      }
    } catch (error) {
      toast.error('Failed to read file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = () => {
    const template = generateEmissionsCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emissions_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!parseResult?.success || !parseResult.data) return;

    setIsProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get or create facilities map
      const facilityMap = new Map<string, string>();
      if (facilityId) {
        facilityMap.set('default', facilityId);
      }

      // Fetch facilities for matching
      const { data: facilities } = await supabase
        .from('facilities')
        .select('id, name')
        .eq('user_id', user.id);

      facilities?.forEach(f => {
        facilityMap.set(f.name.toLowerCase(), f.id);
      });

      let successCount = 0;
      let skipCount = 0;
      const errors: string[] = [];

      // Filter out exact duplicates if user wants to skip them
      const rowsToImport = parseResult.data.filter((_, index) => 
        !duplicateInfo?.duplicates.includes(index)
      );

      for (const row of rowsToImport) {
        try {
          // Find matching facility
          let targetFacilityId = facilityId;
          if (!targetFacilityId && row.facility_name) {
            targetFacilityId = facilityMap.get(row.facility_name.toLowerCase());
          }

          // Get default emission factor for this category
          const { data: emissionFactors } = await supabase
            .from('emission_factors')
            .select('id')
            .eq('category', row.category)
            .eq('scope', row.scope)
            .or(`user_id.is.null,user_id.eq.${user.id}`)
            .order('is_custom', { ascending: true })
            .limit(1);

          const emissionFactorId = emissionFactors?.[0]?.id;

          const { error } = await supabase
            .from('emissions_entries')
            .insert({
              user_id: user.id,
              facility_id: targetFacilityId,
              entry_date: row.entry_date,
              scope: row.scope,
              category: row.category,
              quantity: row.quantity,
              unit: row.unit,
              activity_type: row.activity_type,
              notes: row.notes,
              emission_factor_id: emissionFactorId,
              data_quality_score: 0.8,
            });

          if (error) throw error;
          successCount++;
        } catch (error) {
          errors.push(`Failed to import row: ${error instanceof Error ? error.message : 'Unknown error'}`);
          skipCount++;
        }
      }

      toast.success(`Successfully imported ${successCount} emissions entries${skipCount > 0 ? ` (${skipCount} skipped)` : ''}`);
      
      if (errors.length > 0) {
        console.error('Import errors:', errors);
      }

      onImportComplete();
      handleClose();
    } catch (error) {
      toast.error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setParseResult(null);
    setDuplicateInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Emissions Data from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import emissions entries. Download the template to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-auto">
          {/* Industry Mapping Selection */}
          {availableMappings.length > 0 && (
            <Alert className="bg-primary/5 border-primary/20">
              <Sparkles className="h-4 w-4 text-primary" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span className="text-sm">
                    Industry-specific format detected for <strong>{userIndustry.industry?.replace(/_/g, ' ')}</strong>
                  </span>
                  <Select value={selectedMapping} onValueChange={setSelectedMapping}>
                    <SelectTrigger className="w-48 h-8">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Format</SelectItem>
                      {availableMappings.map((mapping) => (
                        <SelectItem 
                          key={mapping.subIndustry || mapping.industry} 
                          value={mapping.subIndustry || mapping.industry}
                        >
                          {mapping.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Template Download */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
            {selectedMapping !== 'standard' && (
              <Badge variant="secondary" className="text-xs">
                Using {availableMappings.find(m => (m.subIndustry || m.industry) === selectedMapping)?.displayName || 'Custom'} format
              </Badge>
            )}
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">Click to upload CSV file</p>
                <p className="text-sm text-muted-foreground">or drag and drop</p>
              </div>
              {selectedFile && (
                <Badge variant="secondary" className="mt-2">
                  {selectedFile.name}
                </Badge>
              )}
            </label>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>Processing CSV file...</AlertDescription>
            </Alert>
          )}

          {/* Parse Results */}
          {parseResult && !isProcessing && (
            <>
              {/* Errors */}
              {parseResult.errors && parseResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-1">Validation Errors:</div>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {parseResult.errors.slice(0, 5).map((error, i) => (
                        <li key={i}>{error}</li>
                      ))}
                      {parseResult.errors.length > 5 && (
                        <li>...and {parseResult.errors.length - 5} more errors</li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Success with warnings */}
              {parseResult.success && parseResult.data && (
                <>
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Successfully parsed {parseResult.data.length} emissions entries
                    </AlertDescription>
                  </Alert>

                  {/* Duplicate warnings */}
                  {duplicateInfo && (duplicateInfo.duplicates.length > 0 || duplicateInfo.potentialDuplicates.length > 0) && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription>
                        {duplicateInfo.duplicates.length > 0 && (
                          <div className="mb-2">
                            <span className="font-semibold text-yellow-800">
                              {duplicateInfo.duplicates.length} exact duplicate(s) found
                            </span> - these will be skipped
                          </div>
                        )}
                        {duplicateInfo.potentialDuplicates.length > 0 && (
                          <div>
                            <span className="font-semibold text-yellow-800">
                              {duplicateInfo.potentialDuplicates.length} potential duplicate(s)
                            </span> - similar entries exist with different quantities
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Preview Table */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Preview (first 10 rows):</h4>
                    <ScrollArea className="h-64 rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Scope</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Activity</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parseResult.data.slice(0, 10).map((row, index) => (
                            <TableRow key={index} className={
                              duplicateInfo?.duplicates.includes(index) ? 'bg-red-50' :
                              duplicateInfo?.potentialDuplicates.includes(index) ? 'bg-yellow-50' : ''
                            }>
                              <TableCell>{index + 1}</TableCell>
                              <TableCell className="text-xs">{row.entry_date}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{row.scope}</Badge>
                              </TableCell>
                              <TableCell className="text-xs">{row.category}</TableCell>
                              <TableCell>{row.quantity}</TableCell>
                              <TableCell>{row.unit}</TableCell>
                              <TableCell className="text-xs">{row.activity_type || '-'}</TableCell>
                              <TableCell>
                                {duplicateInfo?.duplicates.includes(index) && (
                                  <Badge variant="destructive" className="text-xs">Duplicate</Badge>
                                )}
                                {duplicateInfo?.potentialDuplicates.includes(index) && (
                                  <Badge variant="secondary" className="text-xs">Similar</Badge>
                                )}
                                {!duplicateInfo?.duplicates.includes(index) && 
                                 !duplicateInfo?.potentialDuplicates.includes(index) && (
                                  <Badge variant="secondary" className="text-xs">New</Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>

                  {/* Required Info */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="text-sm space-y-1">
                        <p className="font-semibold">Required columns:</p>
                        <ul className="list-disc list-inside text-xs">
                          <li>entry_date (YYYY-MM-DD format)</li>
                          <li>scope (S1, S2, or S3)</li>
                          <li>category (e.g., "Stationary Combustion")</li>
                          <li>quantity (positive number)</li>
                          <li>unit (kWh, MWh, L, kg, or t)</li>
                        </ul>
                        <p className="font-semibold mt-2">Optional columns:</p>
                        <ul className="list-disc list-inside text-xs">
                          <li>activity_type, notes, facility_name</li>
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!parseResult?.success || !parseResult.data || isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Import {parseResult?.data?.length ? `${parseResult.data.length - (duplicateInfo?.duplicates.length || 0)}` : ''} Entries
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
