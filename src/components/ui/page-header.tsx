
import React, { ReactNode } from 'react';
import { Calendar as CalendarIcon, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: string;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ 
  title, 
  subtitle, 
  children, 
  actions,
  className 
}: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>
        
        {actions && (
          <div className="mt-4 md:mt-0 flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
      
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
}

export function PageHeaderDateFilter({
  defaultValue,
  onChange
}: {
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <Button variant="outline" size="sm" className="bg-background shadow-sm">
      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
      <span>{defaultValue || "Filter by date"}</span>
    </Button>
  );
}

export function PageHeaderExport() {
  return (
    <Button variant="outline" size="sm" className="bg-background shadow-sm">
      <Download className="mr-2 h-4 w-4" />
      Export
    </Button>
  );
}

export function PageHeaderFilter() {
  return (
    <Button variant="outline" size="sm" className="bg-background shadow-sm">
      <Filter className="mr-2 h-4 w-4" />
      Filter
    </Button>
  );
}
