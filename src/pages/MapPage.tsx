import React, { useEffect, useMemo, useState } from 'react';
import { format, subMonths } from 'date-fns';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedGlobeMap } from '@/components/Map/EnhancedGlobeMap';
import { AnalyticsPanel } from '@/components/Map/AnalyticsPanel';
import { generateEnhancedEmissions, countryCoords, generateFacilities } from '@/utils/facilityData';
import { filterData, groupByMonthScope, periodOverPeriod, sumByCountry, topCountries, totalTco2e, computeTCO2e } from '@/utils/emissionsSample';
import type { EmissionRecord, Scope } from '@/types/emissions';
import type { Facility } from '@/utils/facilityData';
import { 
  TrendingDown, 
  TrendingUp, 
  MapPin,
  Filter, 
  Eye,
  BarChart3,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

const scopeOptions: Scope[] = ['S1', 'S2', 'S3'];

const numberFmt = (n: number) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);

export default function MapPage() {
  // SEO
  useEffect(() => {
    document.title = 'Carbon Emissions Map (tCO2e) | Baryon';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Explore carbon emissions by country and scope on an interactive world map, with KPIs, trends, and top emitters.');
  }, []);

  // Enhanced data with facilities
  const [allData] = useState<EmissionRecord[]>(() => generateEnhancedEmissions(18));
  const [facilities] = useState<Facility[]>(() => generateFacilities());
  
  // Filters
  const [rangeKey, setRangeKey] = useState<'6M'|'12M'|'24M'>('12M');
  const [scopes, setScopes] = useState<Scope[]>(['S1','S2','S3']);
  const [countries, setCountries] = useState<string[]>([]);
  const [mapToken, setMapToken] = useState<string>(() => localStorage.getItem('mapbox_public_token') || '');
  
  // UI State
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  const dateEnd = new Date();
  const monthsMap: Record<typeof rangeKey, number> = { '6M': 6, '12M': 12, '24M': 24 } as const;
  const dateStart = subMonths(dateEnd, monthsMap[rangeKey]);

  // Simplified filtering
  const filtered = useMemo(() => {
    return filterData(allData, { dateStart, dateEnd, scopes, countries });
  }, [allData, dateStart, dateEnd, scopes, countries]);

  // Enhanced KPIs
  const kpiTotal = useMemo(() => totalTco2e(filtered), [filtered]);
  const kpiScopes = useMemo(() => {
    const s1 = totalTco2e(filtered.filter(r => r.scope === 'S1'));
    const s2 = totalTco2e(filtered.filter(r => r.scope === 'S2'));
    const s3 = totalTco2e(filtered.filter(r => r.scope === 'S3'));
    const tot = s1 + s2 + s3 || 1;
    return { s1, s2, s3, p1: (s1/tot)*100, p2: (s2/tot)*100, p3: (s3/tot)*100 };
  }, [filtered]);
  const pop = useMemo(() => periodOverPeriod(allData, dateStart, dateEnd), [allData, dateStart, dateEnd]);
  const monthly = useMemo(() => groupByMonthScope(filtered), [filtered]);
  const byCountryTotals = useMemo(() => sumByCountry(filtered), [filtered]);
  const topCountryRows = useMemo(() => topCountries(filtered, 8), [filtered]);

  // Filtered facilities
  const filteredFacilities = useMemo(() => {
    if (countries.length === 0) return facilities;
    return facilities.filter(f => countries.includes(f.country));
  }, [facilities, countries]);

  useEffect(() => {
    if (mapToken) localStorage.setItem('mapbox_public_token', mapToken);
  }, [mapToken]);

  const toggleScope = (s: Scope) => {
    setScopes((prev) => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const allCountryCodes = Object.keys(countryCoords);

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6 space-y-6">
      {/* Enhanced Header with Glassmorphism */}
      <div className="floating-panel">
        <div>
          <h1 className="text-3xl font-bold gradient-heading">Carbon Intelligence Map</h1>
          <p className="text-muted-foreground mt-1">
            Visualize global emissions data with interactive facility-level insights
          </p>
        </div>
        <link rel="canonical" href="/map" />
      </div>

      {/* Filter Panel */}
      <GlassmorphismCard className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Filters</h2>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Time Period</label>
            <div className="flex gap-2">
              {(['6M','12M','24M'] as const).map((k) => (
                <Button key={k} size="sm" variant={rangeKey===k? 'default':'outline'} onClick={() => setRangeKey(k)}>
                  {k}
                </Button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">{format(dateStart, 'MMM d')} – {format(dateEnd, 'MMM d, yyyy')}</div>
          </div>

          {/* Scope */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Emission Scopes</label>
            <div className="space-y-2">
              {scopeOptions.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={scopes.includes(s)} onCheckedChange={() => toggleScope(s)} />
                  <span>{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Mapbox Token */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Map Token</label>
            <Input 
              value={mapToken} 
              onChange={(e) => setMapToken(e.target.value)} 
              placeholder="pk.eyJ..." 
              className="glass-panel"
            />
            <p className="text-xs text-muted-foreground">
              Get your token at <a href="https://mapbox.com" target="_blank" className="text-primary underline">mapbox.com</a>
            </p>
          </div>
        </div>
      </GlassmorphismCard>

      {/* KPI Dashboard */}
      <div className="grid gap-4 md:grid-cols-3">
        <GlassmorphismCard className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary/20 rounded-lg">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <Badge variant="secondary" className="text-xs">{filteredFacilities.length} facilities</Badge>
          </div>
          <div className="text-3xl font-bold mb-1">{numberFmt(kpiTotal)}</div>
          <div className="text-sm text-muted-foreground">Total tCO2e</div>
        </GlassmorphismCard>

        <GlassmorphismCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-5 w-5 text-secondary" />
            <span className="text-sm font-medium">Scope Distribution</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>S1 (Direct)</span>
              <span className="font-medium">{numberFmt(kpiScopes.s1)} tCO2e</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>S2 (Electricity)</span>
              <span className="font-medium">{numberFmt(kpiScopes.s2)} tCO2e</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>S3 (Indirect)</span>
              <span className="font-medium">{numberFmt(kpiScopes.s3)} tCO2e</span>
            </div>
          </div>
        </GlassmorphismCard>

        <GlassmorphismCard className="p-6">
          <div className="flex items-center gap-2 mb-4">
            {pop.delta >= 0 ? 
              <TrendingUp className="h-5 w-5 text-destructive" /> : 
              <TrendingDown className="h-5 w-5 text-green-500" />
            }
            <span className="text-sm font-medium">Period Change</span>
          </div>
          <div className="text-2xl font-bold mb-1">
            {pop.delta >= 0 ? '+' : ''}{numberFmt(pop.delta)}%
          </div>
          <div className="text-sm text-muted-foreground">
            <Badge variant="outline" className="text-xs">Demo Data</Badge>
          </div>
        </GlassmorphismCard>
      </div>

      {/* Interactive Map */}
      <GlassmorphismCard className="overflow-hidden">
        <EnhancedGlobeMap
          token={mapToken}
          countryTotals={byCountryTotals}
          coords={countryCoords}
          facilities={filteredFacilities}
          height={600}
        />
      </GlassmorphismCard>

      {/* Analytics Tabs */}
      <GlassmorphismCard className="p-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 glass-panel">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              <GlassmorphismCard className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Emission Trends by Scope
                </h3>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthly} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradS1" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="gradS2" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0.1} />
                        </linearGradient>
                        <linearGradient id="gradS3" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                      <XAxis dataKey="month" tickLine={false} axisLine={false} className="text-xs" />
                      <YAxis tickLine={false} axisLine={false} className="text-xs" />
                      <Tooltip 
                        formatter={(v: any) => [numberFmt(v as number) + ' tCO2e', '']} 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Area type="monotone" dataKey="S1" stackId="1" stroke="hsl(var(--primary))" fill="url(#gradS1)" />
                      <Area type="monotone" dataKey="S2" stackId="1" stroke="hsl(var(--secondary))" fill="url(#gradS2)" />
                      <Area type="monotone" dataKey="S3" stackId="1" stroke="hsl(var(--accent))" fill="url(#gradS3)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </GlassmorphismCard>

              <GlassmorphismCard className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Top Emitting Countries
                </h3>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topCountryRows} layout="vertical" margin={{ left: 20, right: 20, top: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="country" width={120} className="text-xs" />
                      <Tooltip 
                        formatter={(v: any) => [numberFmt(v as number) + ' tCO2e', 'Total Emissions']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="total" radius={[0, 6, 6, 0]} fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </GlassmorphismCard>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsPanel 
              facilities={filteredFacilities}
              selectedCountries={countries}
              totalEmissions={kpiTotal}
              periodChange={pop.delta}
            />
          </TabsContent>
        </Tabs>
      </GlassmorphismCard>
    </main>
  );
}
