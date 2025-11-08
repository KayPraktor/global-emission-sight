import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { parseFacilitiesCSV, generateCSVTemplate } from '@/utils/csvParser';
import { FacilityService } from '@/services/facilityService';
import { toast } from 'sonner';

interface CSVImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export const CSVImportDialog: React.FC<CSVImportDialogProps> = ({
  open,
  onOpenChange,
  onImportComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [successCount, setSuccessCount] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setErrors([]);
      setSuccessCount(0);
    }
  };

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'facilities_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrors([]);
    setSuccessCount(0);

    try {
      const text = await file.text();
      const result = parseFacilitiesCSV(text);

      if (!result.success || !result.data) {
        setErrors(result.errors || ['Failed to parse CSV']);
        setIsProcessing(false);
        return;
      }

      // Import facilities one by one
      let successfulImports = 0;
      const importErrors: string[] = [];

      for (const facilityData of result.data) {
        const { error } = await FacilityService.createFacility(facilityData as any);
        if (error) {
          importErrors.push(`Failed to import ${facilityData.name}: ${error}`);
        } else {
          successfulImports++;
        }
      }

      setSuccessCount(successfulImports);
      
      if (importErrors.length > 0) {
        setErrors(importErrors);
      }

      if (successfulImports > 0) {
        toast.success(`Successfully imported ${successfulImports} facilities`);
        onImportComplete();
      }

      if (successfulImports === result.data.length) {
        setTimeout(() => {
          onOpenChange(false);
        }, 2000);
      }

    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Failed to import facilities']);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Facilities from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file to bulk import multiple facilities at once.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Template */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <p className="font-medium text-sm">Download CSV Template</p>
              <p className="text-xs text-muted-foreground">
                Start with our template to ensure correct formatting
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <label htmlFor="csv-upload" className="block text-sm font-medium">
              Select CSV File
            </label>
            <div className="flex items-center gap-2">
              <input
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="flex-1 text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            {file && (
              <p className="text-xs text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Success Message */}
          {successCount > 0 && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Successfully imported {successCount} facilities!
              </AlertDescription>
            </Alert>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-medium">Import errors:</p>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    {errors.slice(0, 5).map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                    {errors.length > 5 && (
                      <li>...and {errors.length - 5} more errors</li>
                    )}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Required Format Info */}
          <div className="p-4 bg-muted/50 rounded-lg text-xs space-y-2">
            <p className="font-medium">Required columns:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><code>name</code> - Facility name (required)</li>
              <li><code>country_code</code> - ISO country code (required)</li>
            </ul>
            <p className="font-medium mt-3">Optional columns:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><code>city, address, facility_type, latitude, longitude</code></li>
              <li><code>area_sqm, employees, annual_revenue, industry</code></li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Facilities
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
