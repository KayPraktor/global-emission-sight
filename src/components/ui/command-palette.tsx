
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Home,
  Building2,
  ClipboardList,
  FileSpreadsheet,
  BarChart3,
  Target,
  Settings,
  PlusCircle,
  Download,
  Upload,
  Search,
  Calendar,
} from 'lucide-react';
import { translations as t } from '@/lib/translations';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();

  const navigationCommands = [
    { id: 'nav-dashboard', label: `${t.commands.goTo} ${t.navItems.dashboard}`, icon: Home, action: () => navigate('/') },
    { id: 'nav-enterprise', label: `${t.commands.goTo} ${t.navItems.executive}`, icon: Building2, action: () => navigate('/enterprise') },
    { id: 'nav-data-entry', label: `${t.commands.goTo} ${t.navItems.dataEntry}`, icon: ClipboardList, action: () => navigate('/data-entry') },
    { id: 'nav-facilities', label: `${t.commands.goTo} ${t.navItems.facilities}`, icon: Building2, action: () => navigate('/facilities') },
    { id: 'nav-analytics', label: `${t.commands.goTo} ${t.navItems.analytics}`, icon: BarChart3, action: () => navigate('/analytics') },
    { id: 'nav-scenario', label: `${t.commands.goTo} ${t.navItems.scenarioPlanning}`, icon: Target, action: () => navigate('/scenario-planning') },
    { id: 'nav-goals', label: `${t.commands.goTo} ${t.navItems.goals}`, icon: Target, action: () => navigate('/goals') },
    { id: 'nav-reports', label: `${t.commands.goTo} ${t.navItems.reports}`, icon: FileSpreadsheet, action: () => navigate('/reports') },
    { id: 'nav-settings', label: `${t.commands.goTo} ${t.navItems.settings}`, icon: Settings, action: () => navigate('/settings') },
  ];

  const actionCommands = [
    { id: 'action-new-report', label: t.commands.createNewReport, icon: PlusCircle, action: () => console.log('New report') },
    { id: 'action-export-data', label: t.commands.exportData, icon: Download, action: () => console.log('Export data') },
    { id: 'action-import-data', label: t.commands.importData, icon: Upload, action: () => console.log('Import data') },
    { id: 'action-search', label: t.commands.advancedSearch, icon: Search, action: () => console.log('Search') },
    { id: 'action-calendar', label: t.commands.viewCalendar, icon: Calendar, action: () => console.log('Calendar') },
  ];

  const handleCommand = (command: typeof navigationCommands[0]) => {
    command.action();
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder={t.commands.placeholder} />
      <CommandList>
        <CommandEmpty>{t.commands.noResults}</CommandEmpty>
        
        <CommandGroup heading={t.commands.navigation}>
          {navigationCommands.map((command) => (
            <CommandItem
              key={command.id}
              onSelect={() => handleCommand(command)}
              className="flex items-center gap-2 px-2 py-3"
            >
              <command.icon className="h-4 w-4" />
              <span>{command.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading={t.commands.actions}>
          {actionCommands.map((command) => (
            <CommandItem
              key={command.id}
              onSelect={() => handleCommand(command)}
              className="flex items-center gap-2 px-2 py-3"
            >
              <command.icon className="h-4 w-4" />
              <span>{command.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

// Hook for command palette
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return { open, setOpen };
}
