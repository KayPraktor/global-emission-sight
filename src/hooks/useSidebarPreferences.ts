import { useState, useEffect, useCallback } from 'react';

export interface SidebarPreferences {
  collapsedSections: string[];
  pinnedItems: string[];
}

const STORAGE_KEY = 'sidebar-preferences';

const DEFAULT_PREFERENCES: SidebarPreferences = {
  collapsedSections: ['analysis', 'reporting', 'admin'], // Collapsed by default
  pinnedItems: ['/', '/data-entry'], // Default pins: Dashboard, Data Entry
};

export function useSidebarPreferences() {
  const [preferences, setPreferences] = useState<SidebarPreferences>(() => {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          collapsedSections: parsed.collapsedSections || DEFAULT_PREFERENCES.collapsedSections,
          pinnedItems: parsed.pinnedItems || DEFAULT_PREFERENCES.pinnedItems,
        };
      }
    } catch (e) {
      console.warn('Failed to parse sidebar preferences:', e);
    }
    return DEFAULT_PREFERENCES;
  });

  // Persist to localStorage whenever preferences change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.warn('Failed to save sidebar preferences:', e);
    }
  }, [preferences]);

  const toggleSection = useCallback((sectionId: string) => {
    setPreferences(prev => {
      const isCollapsed = prev.collapsedSections.includes(sectionId);
      return {
        ...prev,
        collapsedSections: isCollapsed
          ? prev.collapsedSections.filter(id => id !== sectionId)
          : [...prev.collapsedSections, sectionId],
      };
    });
  }, []);

  const isSectionCollapsed = useCallback((sectionId: string) => {
    return preferences.collapsedSections.includes(sectionId);
  }, [preferences.collapsedSections]);

  const expandSection = useCallback((sectionId: string) => {
    setPreferences(prev => ({
      ...prev,
      collapsedSections: prev.collapsedSections.filter(id => id !== sectionId),
    }));
  }, []);

  const pinItem = useCallback((path: string) => {
    setPreferences(prev => {
      if (prev.pinnedItems.includes(path)) return prev;
      if (prev.pinnedItems.length >= 5) return prev; // Max 5 pins
      return {
        ...prev,
        pinnedItems: [...prev.pinnedItems, path],
      };
    });
  }, []);

  const unpinItem = useCallback((path: string) => {
    setPreferences(prev => ({
      ...prev,
      pinnedItems: prev.pinnedItems.filter(p => p !== path),
    }));
  }, []);

  const isPinned = useCallback((path: string) => {
    return preferences.pinnedItems.includes(path);
  }, [preferences.pinnedItems]);

  const togglePin = useCallback((path: string) => {
    if (preferences.pinnedItems.includes(path)) {
      unpinItem(path);
    } else {
      pinItem(path);
    }
  }, [preferences.pinnedItems, pinItem, unpinItem]);

  return {
    preferences,
    toggleSection,
    isSectionCollapsed,
    expandSection,
    pinItem,
    unpinItem,
    isPinned,
    togglePin,
  };
}
