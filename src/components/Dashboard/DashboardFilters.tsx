import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useAnalyticsFilters } from '@/contexts/AnalyticsFilterContext';
import { countryCoords } from '@/utils/emissionsSample';

const ALL_SCOPES = ['S1','S2','S3'] as const;

const DashboardFilters: React.FC = () => {
  const { filters, updateFilters } = useAnalyticsFilters();

  const countries = useMemo(() => Object.values(countryCoords).map(c => ({ code: c.code, name: c.name })), []);

  const onDateChange = (key: 'from'|'to', value: string) => {
    const date = value ? new Date(value) : undefined;
    if (!date) return;
    updateFilters({ dateRange: { ...filters.dateRange, [key]: date } });
  };

  const onScopesChange = (values: string[]) => {
    updateFilters({ scopes: values as string[] });
  };

  const toggleCountry = (code: string) => {
    const set = new Set<string>(filters.countries || []);
    if (set.has(code)) set.delete(code); else set.add(code);
    updateFilters({ countries: Array.from(set) as string[] });
  };

  const fmt = (d: Date) => d.toISOString().slice(0,10);

  return (
    <Card className="border border-border/60">
      <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Date range</div>
          <div className="flex items-center gap-2">
            <input aria-label="From" type="date" value={fmt(filters.dateRange.from)} onChange={(e)=>onDateChange('from', e.target.value)} className="h-9 rounded-md border border-border bg-background px-3 text-sm" />
            <span className="text-muted-foreground">to</span>
            <input aria-label="To" type="date" value={fmt(filters.dateRange.to)} onChange={(e)=>onDateChange('to', e.target.value)} className="h-9 rounded-md border border-border bg-background px-3 text-sm" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Scopes</div>
          <ToggleGroup type="multiple" className="flex gap-2" value={(filters.scopes?.length ? filters.scopes : (ALL_SCOPES as unknown as string[]))} onValueChange={onScopesChange}>
            {ALL_SCOPES.map(s => (
              <ToggleGroupItem key={s} value={s} aria-label={`Toggle ${s}`}>
                {s}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Countries</div>
          <div className="flex flex-wrap gap-2">
            {countries.slice(0,10).map(c => (
              <button key={c.code} onClick={()=>toggleCountry(c.code)} className={`h-8 px-3 rounded-full border text-xs transition-colors ${filters.countries?.includes(c.code) ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-foreground border-border'}`} aria-pressed={filters.countries?.includes(c.code)}>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardFilters;
