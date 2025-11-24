import React, { useState } from 'react';
import EmissionsForm from '@/components/EmissionsForm/EmissionsForm';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { EmissionsCSVImportDialog } from '@/components/EmissionsForm/EmissionsCSVImportDialog';
import { BreadcrumbNav } from '@/components/navigation/BreadcrumbNav';

const DataEntryPage = () => {
  const [showImportDialog, setShowImportDialog] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <BreadcrumbNav />
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
        
        <EmissionsForm />

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
