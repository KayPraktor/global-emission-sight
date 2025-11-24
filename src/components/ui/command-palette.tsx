
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
  MonitorSmartphone,
  Zap,
  Settings,
  PlusCircle,
  Download,
  Upload,
  Search,
  Calendar,
} from 'lucide-react';

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const navigate = useNavigate();

  const navigationCommands = [
    { id: 'nav-dashboard', label: 'Go to Dashboard', icon: Home, action: () => navigate('/') },
    { id: 'nav-enterprise', label: 'Go to Executive Dashboard', icon: Building2, action: () => navigate('/enterprise') },
    { id: 'nav-data-entry', label: 'Go to Data Entry', icon: ClipboardList, action: () => navigate('/data-entry') },
    { id: 'nav-facilities', label: 'Go to Facilities', icon: Building2, action: () => navigate('/facilities') },
    { id: 'nav-analytics', label: 'Go to Analytics', icon: BarChart3, action: () => navigate('/analytics') },
    { id: 'nav-scenario', label: 'Go to Scenario Planning', icon: Target, action: () => navigate('/scenario-planning') },
    { id: 'nav-goals', label: 'Go to Goals', icon: Target, action: () => navigate('/goals') },
    { id: 'nav-reports', label: 'Go to Reports', icon: FileSpreadsheet, action: () => navigate('/reports') },
    { id: 'nav-settings', label: 'Go to Settings', icon: Settings, action: () => navigate('/settings') },
  ];

  const actionCommands = [
    { id: 'action-new-report', label: 'Create New Report', icon: PlusCircle, action: () => console.log('New report') },
    { id: 'action-export-data', label: 'Export Data', icon: Download, action: () => console.log('Export data') },
    { id: 'action-import-data', label: 'Import Data', icon: Upload, action: () => console.log('Import data') },
    { id: 'action-search', label: 'Advanced Search', icon: Search, action: () => console.log('Search') },
    { id: 'action-calendar', label: 'View Calendar', icon: Calendar, action: () => console.log('Calendar') },
  ];

  const handleCommand = (command: typeof navigationCommands[0]) => {
    command.action();
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
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
        
        <CommandGroup heading="Actions">
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
