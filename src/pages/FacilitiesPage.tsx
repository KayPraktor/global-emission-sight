import React, { useState, useEffect } from 'react';
import { Plus, Building2, AlertCircle, Loader2, Upload, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FacilityCard } from '@/components/Facilities/FacilityCard';
import { FacilityForm } from '@/components/Facilities/FacilityForm';
import { FacilitiesMap } from '@/components/Facilities/FacilitiesMap';
import { CSVImportDialog } from '@/components/Facilities/CSVImportDialog';
import { FacilityService } from '@/services/facilityService';
import { Facility } from '@/types/database';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [facilityToDelete, setFacilityToDelete] = useState<string | null>(null);
  const [emissionsDialogOpen, setEmissionsDialogOpen] = useState(false);
  const [selectedFacilityEmissions, setSelectedFacilityEmissions] = useState<any[]>([]);
  const [isLoadingEmissions, setIsLoadingEmissions] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // SEO
  useEffect(() => {
    document.title = 'Facility Management | BARYON Carbon Management';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Manage your facilities, track locations, and monitor emissions across all sites in your carbon management platform.');
  }, []);

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    setIsLoading(true);
    const { data, error } = await FacilityService.getFacilities();
    
    if (error) {
      toast.error('Failed to load facilities', { description: error });
    } else if (data) {
      setFacilities(data);
    }
    
    setIsLoading(false);
  };

  const handleCreateFacility = () => {
    setSelectedFacility(null);
    setIsDialogOpen(true);
  };

  const handleEditFacility = (facility: Facility) => {
    setSelectedFacility(facility);
    setIsDialogOpen(true);
  };

  const handleDeleteFacility = (id: string) => {
    setFacilityToDelete(id);
  };

  const confirmDelete = async () => {
    if (!facilityToDelete) return;
    
    const { success, error } = await FacilityService.deleteFacility(facilityToDelete);
    
    if (error) {
      toast.error('Failed to delete facility', { description: error });
    } else {
      toast.success('Facility deleted successfully');
      loadFacilities();
    }
    
    setFacilityToDelete(null);
  };

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      if (selectedFacility) {
        const { data: updated, error } = await FacilityService.updateFacility(selectedFacility.id, data);
        
        if (error) {
          toast.error('Failed to update facility', { description: error });
        } else {
          toast.success('Facility updated successfully');
          setIsDialogOpen(false);
          loadFacilities();
        }
      } else {
        const { data: created, error } = await FacilityService.createFacility(data);
        
        if (error) {
          toast.error('Failed to create facility', { description: error });
        } else {
          toast.success('Facility created successfully');
          setIsDialogOpen(false);
          loadFacilities();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewEmissions = async (facility: Facility) => {
    setSelectedFacility(facility);
    setEmissionsDialogOpen(true);
    setIsLoadingEmissions(true);
    
    const { data, error } = await FacilityService.getFacilityEmissions(facility.id);
    
    if (error) {
      toast.error('Failed to load emissions data', { description: error });
      setSelectedFacilityEmissions([]);
    } else {
      setSelectedFacilityEmissions(data || []);
    }
    
    setIsLoadingEmissions(false);
  };

  const getEmissionsCount = (facilityId: string) => {
    // This would be better fetched from the database, but for now we'll return 0
    return 0;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Facility Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your facilities, track locations, and monitor emissions across all sites
          </p>
        </div>
        <div className="flex gap-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'map')}>
            <TabsList>
              <TabsTrigger value="grid">
                <Building2 className="h-4 w-4 mr-1" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="map">
                <Map className="h-4 w-4 mr-1" />
                Map
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" onClick={() => setCsvImportOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button onClick={handleCreateFacility}>
            <Plus className="h-4 w-4 mr-2" />
            Add Facility
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {!isLoading && facilities.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No facilities yet</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-md">
              Get started by adding your first facility. You can track emissions, manage locations, and monitor performance across all your sites.
            </p>
            <Button onClick={handleCreateFacility}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Facility
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Facilities Grid or Map View */}
      {!isLoading && facilities.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.map((facility) => (
                <FacilityCard
                  key={facility.id}
                  facility={facility}
                  onEdit={handleEditFacility}
                  onDelete={handleDeleteFacility}
                  onViewEmissions={handleViewEmissions}
                  emissionsCount={getEmissionsCount(facility.id)}
                />
              ))}
            </div>
          ) : (
            <FacilitiesMap 
              facilities={facilities} 
              onViewEmissions={handleViewEmissions}
            />
          )}
        </>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedFacility ? 'Edit Facility' : 'Create New Facility'}
            </DialogTitle>
            <DialogDescription>
              {selectedFacility 
                ? 'Update the facility information below.' 
                : 'Add a new facility to your carbon management system.'}
            </DialogDescription>
          </DialogHeader>
          <FacilityForm
            facility={selectedFacility}
            onSubmit={handleSubmit}
            onCancel={() => setIsDialogOpen(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!facilityToDelete} onOpenChange={() => setFacilityToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Facility</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this facility? This action cannot be undone.
              All associated emissions entries will remain but will no longer be linked to this facility.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Emissions Dialog */}
      <Dialog open={emissionsDialogOpen} onOpenChange={setEmissionsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Emissions Entries - {selectedFacility?.name}
            </DialogTitle>
            <DialogDescription>
              View all emissions entries associated with this facility
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingEmissions ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedFacilityEmissions.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No emissions entries found for this facility yet.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Scope</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">CO₂e (t)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedFacilityEmissions.map((entry: any) => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.entry_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{entry.scope}</Badge>
                      </TableCell>
                      <TableCell>{entry.category}</TableCell>
                      <TableCell>{Number(entry.quantity).toLocaleString()}</TableCell>
                      <TableCell>{entry.unit}</TableCell>
                      <TableCell className="text-right font-medium">
                        {entry.calculations && entry.calculations[0]
                          ? Number(entry.calculations[0].calculated_emissions).toFixed(2)
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CSV Import Dialog */}
      <CSVImportDialog
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
        onImportComplete={loadFacilities}
      />
    </div>
  );
}
