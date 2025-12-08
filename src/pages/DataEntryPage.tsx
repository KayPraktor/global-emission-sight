import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IndustryAwareWizard } from '@/components/EmissionsForm/IndustryAwareWizard';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { EmissionsCSVImportDialog } from '@/components/EmissionsForm/EmissionsCSVImportDialog';

const DataEntryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Auto-open CSV import dialog if coming from onboarding
  useEffect(() => {
    if (searchParams.get('action') === 'import') {
      setShowImportDialog(true);
      // Clean up the URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Emissions Data Entry</h1>
            <p className="text-muted-foreground">Record and manage your organization's emissions data</p>
          </div>
          <Button 
            onClick={() => setShowImportDialog(true)}
            className="gap-2"
            variant="outline"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
        </div>
        
        <IndustryAwareWizard />

        <EmissionsCSVImportDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
          onImportComplete={() => {
            // Could add refresh logic here if needed
          }}
        />
      </main>
    </div>
  );
};

export default DataEntryPage;
