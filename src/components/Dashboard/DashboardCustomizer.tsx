import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  Settings2,
  GripVertical,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  Layout,
  Sparkles,
} from 'lucide-react';
import { DASHBOARD_TEMPLATES, DashboardTemplate } from '@/utils/dashboardTemplates';
import { DashboardLayout } from '@/services/dashboardPreferencesService';
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
  onSave: () => Promise<void>;
  isCustomizeMode: boolean;
  onCustomizeModeChange: (mode: boolean) => void;
}

export const DashboardCustomizer: React.FC<DashboardCustomizerProps> = ({
  widgets,
  currentLayout,
  onLayoutChange,
  onSave,
  isCustomizeMode,
  onCustomizeModeChange,
}) => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
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

  return (
    <>
      {/* Customize Mode Toggle Button */}
      <div className="flex items-center gap-2">
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
    </>
  );
};

export default DashboardCustomizer;
