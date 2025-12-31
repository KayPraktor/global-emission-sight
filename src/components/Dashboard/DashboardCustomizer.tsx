import React, { useState, useCallback } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import {
  Settings2,
  GripVertical,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Layout,
  Sparkles,
  ChevronDown,
  Star,
  Trash2,
  Check,
} from 'lucide-react';
import { DASHBOARD_TEMPLATES, DashboardTemplate } from '@/utils/dashboardTemplates';
import { DashboardLayout, DashboardPreference } from '@/services/dashboardPreferencesService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface WidgetConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  defaultVisible: boolean;
}

interface DashboardCustomizerProps {
  widgets: WidgetConfig[];
  currentLayout: DashboardLayout;
  onLayoutChange: (layout: DashboardLayout) => void;
  onSave: (viewName?: string, isDefault?: boolean) => Promise<void>;
  isCustomizeMode: boolean;
  onCustomizeModeChange: (mode: boolean) => void;
  // View selector props
  views?: DashboardPreference[];
  currentView?: DashboardPreference | null;
  onSelectView?: (view: DashboardPreference | null) => void;
  onDeleteView?: (viewId: string) => Promise<void>;
  onSetDefault?: (viewId: string) => Promise<void>;
}

export const DashboardCustomizer: React.FC<DashboardCustomizerProps> = ({
  widgets,
  currentLayout,
  onLayoutChange,
  onSave,
  isCustomizeMode,
  onCustomizeModeChange,
  views = [],
  currentView,
  onSelectView,
  onDeleteView,
  onSetDefault,
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [viewName, setViewName] = useState('');
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [widgetOrder, setWidgetOrder] = useState<string[]>(
    currentLayout.widgetOrder.length > 0 
      ? currentLayout.widgetOrder 
      : widgets.map(w => w.id)
  );

  const isWidgetVisible = (widgetId: string) => {
    return !currentLayout.hiddenWidgets.includes(widgetId);
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    const newHidden = isWidgetVisible(widgetId)
      ? [...currentLayout.hiddenWidgets, widgetId]
      : currentLayout.hiddenWidgets.filter(id => id !== widgetId);
    
    onLayoutChange({
      ...currentLayout,
      hiddenWidgets: newHidden,
    });
  };

  const handleReorder = useCallback((newOrder: string[]) => {
    setWidgetOrder(newOrder);
    onLayoutChange({
      ...currentLayout,
      widgetOrder: newOrder,
    });
  }, [currentLayout, onLayoutChange]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
      toast.success('Dashboard layout saved');
      setSheetOpen(false);
      onCustomizeModeChange(false);
    } catch (error) {
      toast.error('Failed to save layout');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAsView = async () => {
    if (!viewName.trim()) {
      toast.error('Please enter a view name');
      return;
    }
    setSaving(true);
    try {
      await onSave(viewName.trim(), setAsDefault);
      toast.success(`View "${viewName}" saved`);
      setSaveDialogOpen(false);
      setViewName('');
      setSetAsDefault(false);
    } catch (error) {
      toast.error('Failed to save view');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTemplate = (template: DashboardTemplate) => {
    onLayoutChange({
      ...currentLayout,
      widgetOrder: template.widgetOrder,
      pinnedKPIs: template.pinnedKPIs,
      hiddenWidgets: widgets
        .filter(w => !template.widgetOrder.includes(w.id))
        .map(w => w.id),
    });
    setWidgetOrder(template.widgetOrder);
    toast.success(`Applied "${template.name}" template`);
  };

  const handleReset = () => {
    const defaultOrder = widgets.map(w => w.id);
    setWidgetOrder(defaultOrder);
    onLayoutChange({
      pinnedKPIs: [],
      widgetOrder: defaultOrder,
      hiddenWidgets: [],
    });
    toast.info('Layout reset to default');
  };

  const getWidgetConfig = (widgetId: string) => {
    return widgets.find(w => w.id === widgetId);
  };

  const hasViewSelector = views.length > 0 || onSelectView;

  return (
    <>
      {/* View Selector and Customize Controls */}
      <div className="flex items-center gap-2">
        {/* View Selector Dropdown */}
        {hasViewSelector && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Layout className="w-4 h-4" />
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {currentView?.view_name || 'Default View'}
                </span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => onSelectView?.(null)}>
                <Layout className="w-4 h-4 mr-2" />
                Default View
                {!currentView && <Check className="w-4 h-4 ml-auto" />}
              </DropdownMenuItem>
              {views.length > 0 && <DropdownMenuSeparator />}
              {views.map((view) => (
                <DropdownMenuItem
                  key={view.id}
                  className="flex items-center justify-between group"
                  onClick={() => onSelectView?.(view)}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {view.is_default && <Star className="w-3 h-3 text-amber-500 flex-shrink-0" />}
                    <span className="truncate">{view.view_name}</span>
                    {currentView?.id === view.id && <Check className="w-4 h-4 ml-auto flex-shrink-0" />}
                  </div>
                  <div className="hidden group-hover:flex items-center gap-1 ml-2">
                    {!view.is_default && onSetDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSetDefault(view.id);
                        }}
                      >
                        <Star className="w-3 h-3" />
                      </Button>
                    )}
                    {onDeleteView && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteView(view.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSaveDialogOpen(true)}>
                <Save className="w-4 h-4 mr-2" />
                Save Current as View...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {isCustomizeMode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2"
          >
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Layout'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCustomizeModeChange(false)}
            >
              Cancel
            </Button>
          </motion.div>
        )}

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">Customize</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                Customize Dashboard
              </SheetTitle>
              <SheetDescription>
                Drag widgets to reorder, toggle visibility, or apply a template.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-6 py-6">
              {/* Templates Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h4 className="font-medium">Quick Templates</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {DASHBOARD_TEMPLATES.slice(0, 4).map((template) => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      className="h-auto py-2 px-3 flex flex-col items-start text-left"
                      onClick={() => handleApplyTemplate(template)}
                    >
                      <span className="font-medium text-sm">{template.name}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1">
                        {template.description}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Widget Order Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Widget Order & Visibility</h4>
                  <Button variant="ghost" size="sm" onClick={handleReset}>
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Reset
                  </Button>
                </div>
                
                <Reorder.Group
                  axis="y"
                  values={widgetOrder}
                  onReorder={handleReorder}
                  className="space-y-2"
                >
                  {widgetOrder.map((widgetId) => {
                    const widget = getWidgetConfig(widgetId);
                    if (!widget) return null;
                    
                    const visible = isWidgetVisible(widgetId);
                    
                    return (
                      <Reorder.Item
                        key={widgetId}
                        value={widgetId}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border bg-card cursor-grab active:cursor-grabbing transition-colors",
                          !visible && "opacity-50"
                        )}
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex-shrink-0 text-muted-foreground">
                          {widget.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{widget.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {widget.description}
                          </p>
                        </div>
                        <Switch
                          checked={visible}
                          onCheckedChange={() => toggleWidgetVisibility(widgetId)}
                          aria-label={`Toggle ${widget.name} visibility`}
                        />
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
              </div>

              {/* Hidden Widgets */}
              {currentLayout.hiddenWidgets.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-muted-foreground flex items-center gap-2">
                    <EyeOff className="w-4 h-4" />
                    Hidden Widgets
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentLayout.hiddenWidgets.map((widgetId) => {
                      const widget = getWidgetConfig(widgetId);
                      if (!widget) return null;
                      
                      return (
                        <Badge
                          key={widgetId}
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary/10"
                          onClick={() => toggleWidgetVisibility(widgetId)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          {widget.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <SheetFooter>
              <Button variant="outline" onClick={() => setSheetOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Save View Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as View</DialogTitle>
            <DialogDescription>
              Save your current dashboard layout as a named view.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="view-name" className="text-sm font-medium">
                View Name
              </label>
              <Input
                id="view-name"
                placeholder="e.g., Executive Summary"
                value={viewName}
                onChange={(e) => setViewName(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="set-default"
                checked={setAsDefault}
                onCheckedChange={(checked) => setSetAsDefault(checked === true)}
              />
              <label htmlFor="set-default" className="text-sm">
                Set as default view
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAsView} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save View'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DashboardCustomizer;
