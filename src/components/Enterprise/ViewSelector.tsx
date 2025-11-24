import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Layout, Save, Star, Trash2, Check } from 'lucide-react';
import { DashboardPreference } from '@/services/dashboardPreferencesService';
import { toast } from 'sonner';

interface ViewSelectorProps {
  views: DashboardPreference[];
  currentView: DashboardPreference | null;
  onSelectView: (view: DashboardPreference | null) => void;
  onSaveView: (viewName: string, isDefault: boolean) => Promise<void>;
  onDeleteView: (viewId: string) => Promise<void>;
  onSetDefault: (viewId: string) => Promise<void>;
}

export const ViewSelector: React.FC<ViewSelectorProps> = ({
  views,
  currentView,
  onSelectView,
  onSaveView,
  onDeleteView,
  onSetDefault,
}) => {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [viewName, setViewName] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveView = async () => {
    if (!viewName.trim()) {
      toast.error('Please enter a view name');
      return;
    }

    setSaving(true);
    try {
      await onSaveView(viewName.trim(), setAsDefault);
      toast.success('View saved successfully');
      setSaveDialogOpen(false);
      setViewName('');
      setSetAsDefault(false);
    } catch (error) {
      toast.error('Failed to save view');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteView = async (viewId: string, viewName: string) => {
    try {
      await onDeleteView(viewId);
      toast.success(`Deleted view "${viewName}"`);
    } catch (error) {
      toast.error('Failed to delete view');
      console.error(error);
    }
  };

  const handleSetDefault = async (viewId: string, viewName: string) => {
    try {
      await onSetDefault(viewId);
      toast.success(`Set "${viewName}" as default view`);
    } catch (error) {
      toast.error('Failed to set default view');
      console.error(error);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Layout className="w-4 h-4" />
            <span className="hidden sm:inline">
              {currentView ? currentView.view_name : 'Default View'}
            </span>
            {currentView?.is_default && (
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Dashboard Views</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => onSelectView(null)}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <span>Default View</span>
              {!currentView && <Check className="w-4 h-4" />}
            </div>
          </DropdownMenuItem>

          {views.map((view) => (
            <DropdownMenuItem
              key={view.id}
              onClick={() => onSelectView(view)}
              className="cursor-pointer group"
            >
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="truncate">{view.view_name}</span>
                  {view.is_default && (
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!view.is_default && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(view.id, view.view_name);
                      }}
                    >
                      <Star className="w-3 h-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteView(view.id, view.view_name);
                    }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                {currentView?.id === view.id && (
                  <Check className="w-4 h-4 flex-shrink-0" />
                )}
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          
          <DropdownMenuItem
            onClick={() => setSaveDialogOpen(true)}
            className="cursor-pointer"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Current View
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Dashboard View</DialogTitle>
            <DialogDescription>
              Save your current dashboard layout and pinned KPIs as a custom view.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="view-name">View Name</Label>
              <Input
                id="view-name"
                placeholder="e.g., Monthly Review, Executive Summary"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveView();
                  }
                }}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="set-default"
                checked={setAsDefault}
                onChange={(e) => setSetAsDefault(e.target.checked)}
                className="rounded border-border"
              />
              <Label htmlFor="set-default" className="cursor-pointer">
                Set as default view
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSaveDialogOpen(false);
                setViewName('');
                setSetAsDefault(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveView} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save View'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
