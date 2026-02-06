import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { IndustryAwareWizard } from '@/components/EmissionsForm/IndustryAwareWizard';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { EmissionsCSVImportDialog } from '@/components/EmissionsForm/EmissionsCSVImportDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DataEntryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const navigate = useNavigate();

  // Auto-open CSV import dialog if coming from onboarding
  useEffect(() => {
    if (searchParams.get('action') === 'import') {
      setShowImportDialog(true);
      // Clean up the URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleCancelEntry = () => {
    // Clear any draft data from localStorage
    localStorage.removeItem('emissions_wizard_draft');
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Emissions Data Entry</h1>
            <p className="text-muted-foreground">Record and manage your organization's emissions data</p>
          </div>
          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel data entry?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Any unsaved data will be lost. Are you sure you want to return to the dashboard?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Continue Editing</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelEntry}>
                    Discard & Exit
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button 
              onClick={() => setShowImportDialog(true)}
              className="gap-2"
              variant="outline"
            >
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
          </div>
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
