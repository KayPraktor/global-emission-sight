import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  dashboardPreferencesService, 
  DashboardLayout, 
  DashboardPreference 
} from '@/services/dashboardPreferencesService';
import { DASHBOARD_TEMPLATES } from '@/utils/dashboardTemplates';
import { toast } from 'sonner';

const DEFAULT_LAYOUT: DashboardLayout = {
  pinnedKPIs: [],
  widgetOrder: ['overview', 'chart', 'timeline', 'quickWins', 'notifications', 'compliance', 'deadlines', 'dataQuality', 'industryKPIs', 'performance'],
  hiddenWidgets: [],
};

const LOCAL_STORAGE_KEY = 'dashboard-layout';

export const useDashboardLayout = (organizationId?: string) => {
  const [layout, setLayout] = useState<DashboardLayout>(DEFAULT_LAYOUT);
  const [savedViews, setSavedViews] = useState<DashboardPreference[]>([]);
  const [currentView, setCurrentView] = useState<DashboardPreference | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCustomizeMode, setIsCustomizeMode] = useState(false);

  // Load layout from localStorage or Supabase
  useEffect(() => {
    const loadLayout = async () => {
      try {
        // Try to load from localStorage first (for quick load)
        const localLayout = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localLayout) {
          setLayout(JSON.parse(localLayout));
        }

        // If we have an organization, load from Supabase
        if (organizationId) {
          const views = await dashboardPreferencesService.getPreferences(organizationId);
          setSavedViews(views);

          // Find and apply default view
          const defaultView = views.find(v => v.is_default);
          if (defaultView) {
            setLayout(defaultView.layout_config);
            setCurrentView(defaultView);
          }
        }
      } catch (error) {
        console.error('Error loading dashboard layout:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLayout();
  }, [organizationId]);

  // Save layout to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(layout));
    }
  }, [layout, isLoading]);

  const updateLayout = useCallback((newLayout: DashboardLayout) => {
    setLayout(newLayout);
  }, []);

  const saveLayout = useCallback(async (viewName?: string, isDefault?: boolean) => {
    if (!organizationId) {
      // Save to localStorage only
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(layout));
      toast.success('Layout saved locally');
      return;
    }

    try {
      const savedPreference = await dashboardPreferencesService.savePreference(
        organizationId,
        viewName || currentView?.view_name || 'Custom View',
        layout,
        isDefault ?? currentView?.is_default ?? false
      );

      // Refresh saved views
      const views = await dashboardPreferencesService.getPreferences(organizationId);
      setSavedViews(views);
      setCurrentView(savedPreference);
    } catch (error) {
      console.error('Error saving layout:', error);
      throw error;
    }
  }, [organizationId, layout, currentView]);

  const selectView = useCallback((view: DashboardPreference | null) => {
    if (view) {
      setLayout(view.layout_config);
      setCurrentView(view);
    } else {
      setLayout(DEFAULT_LAYOUT);
      setCurrentView(null);
    }
  }, []);

  const deleteView = useCallback(async (viewId: string) => {
    if (!organizationId) return;

    try {
      await dashboardPreferencesService.deletePreference(viewId);
      
      // Refresh saved views
      const views = await dashboardPreferencesService.getPreferences(organizationId);
      setSavedViews(views);

      // If we deleted the current view, reset to default
      if (currentView?.id === viewId) {
        setLayout(DEFAULT_LAYOUT);
        setCurrentView(null);
      }
    } catch (error) {
      console.error('Error deleting view:', error);
      throw error;
    }
  }, [organizationId, currentView]);

  const setDefaultView = useCallback(async (viewId: string) => {
    if (!organizationId) return;

    try {
      await dashboardPreferencesService.setDefaultPreference(viewId, organizationId);
      
      // Refresh saved views
      const views = await dashboardPreferencesService.getPreferences(organizationId);
      setSavedViews(views);
    } catch (error) {
      console.error('Error setting default view:', error);
      throw error;
    }
  }, [organizationId]);

  const applyTemplate = useCallback((templateId: string) => {
    const template = DASHBOARD_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setLayout({
        pinnedKPIs: template.pinnedKPIs,
        widgetOrder: template.widgetOrder,
        hiddenWidgets: [],
      });
      toast.success(`Applied "${template.name}" template`);
    }
  }, []);

  const resetLayout = useCallback(() => {
    setLayout(DEFAULT_LAYOUT);
    setCurrentView(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    toast.info('Layout reset to default');
  }, []);

  const isWidgetVisible = useCallback((widgetId: string) => {
    return !layout.hiddenWidgets.includes(widgetId);
  }, [layout.hiddenWidgets]);

  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    setLayout(prev => ({
      ...prev,
      hiddenWidgets: prev.hiddenWidgets.includes(widgetId)
        ? prev.hiddenWidgets.filter(id => id !== widgetId)
        : [...prev.hiddenWidgets, widgetId],
    }));
  }, []);

  const reorderWidgets = useCallback((newOrder: string[]) => {
    setLayout(prev => ({
      ...prev,
      widgetOrder: newOrder,
    }));
  }, []);

  return {
    layout,
    savedViews,
    currentView,
    isLoading,
    isCustomizeMode,
    setIsCustomizeMode,
    updateLayout,
    saveLayout,
    selectView,
    deleteView,
    setDefaultView,
    applyTemplate,
    resetLayout,
    isWidgetVisible,
    toggleWidgetVisibility,
    reorderWidgets,
  };
};

export default useDashboardLayout;
