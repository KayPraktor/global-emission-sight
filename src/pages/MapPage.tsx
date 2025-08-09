import React, { useEffect, useMemo, useState } from 'react';
import { format, subMonths } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GlobeMap } from '@/components/Map/GlobeMap';
import { countryCoords, filterData, generateSampleEmissions, groupByMonthScope, periodOverPeriod, sumByCountry, topCountries, totalTco2e } from '@/utils/emissionsSample';
import type { EmissionRecord, Scope } from '@/types/emissions';
import { TrendingDown, TrendingUp } from 'lucide-react';
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

  const [allData] = useState<EmissionRecord[]>(() => generateSampleEmissions(18));
  const [rangeKey, setRangeKey] = useState<'3M'|'6M'|'12M'|'24M'>('12M');
  const [scopes, setScopes] = useState<Scope[]>(['S1','S2','S3']);
  const [countries, setCountries] = useState<string[]>([]); // empty = all
  const [mapToken, setMapToken] = useState<string>(() => localStorage.getItem('mapbox_public_token') || '');

  const dateEnd = new Date();
  const monthsMap: Record<typeof rangeKey, number> = { '3M': 3, '6M': 6, '12M': 12, '24M': 24 } as const;
  const dateStart = subMonths(dateEnd, monthsMap[rangeKey]);

  const filtered = useMemo(() => filterData(allData, { dateStart, dateEnd, scopes, countries }), [allData, dateStart, dateEnd, scopes, countries]);
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

  useEffect(() => {
    if (mapToken) localStorage.setItem('mapbox_public_token', mapToken);
  }, [mapToken]);

  const toggleScope = (s: Scope) => {
    setScopes((prev) => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const allCountryCodes = Object.keys(countryCoords);

  return (
    <main className="space-y-6 p-4 md:p-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-semibold">Carbon Emissions Map (tCO2e)</h1>
        <p className="text-muted-foreground">Interactive world map with KPIs, trends and top emitters.</p>
        <link rel="canonical" href="/map" />
      </header>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4 items-end">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Date range</label>
            <div className="flex gap-2 flex-wrap">
              {(['3M','6M','12M','24M'] as const).map((k) => (
                <Button key={k} size="sm" variant={rangeKey===k? 'default':'outline'} onClick={() => setRangeKey(k)}>
                  {k}
                </Button>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">{format(dateStart, 'MMM d, yyyy')} – {format(dateEnd, 'MMM d, yyyy')}</div>
          </div>

          {/* Scope */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Scope</label>
            <div className="flex gap-3">
              {scopeOptions.map((s) => (
                <label key={s} className="flex items-center gap-2">
                  <Checkbox checked={scopes.includes(s)} onCheckedChange={() => toggleScope(s)} />
                  <span className="text-sm">{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Countries</label>
            <div className="grid grid-cols-2 gap-2 max-h-28 overflow-auto border rounded-md p-2">
              {allCountryCodes.map((code) => (
                <label key={code} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={countries.includes(code)}
                    onCheckedChange={() => setCountries((prev) => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code])}
                  />
                  <span>{countryCoords[code].name}</span>
                </label>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">Selected: {countries.length ? countries.length : 'All'}</div>
          </div>

          {/* Mapbox token */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Mapbox public token</label>
            <Input value={mapToken} onChange={(e) => setMapToken(e.target.value)} placeholder="pk.eyJ..." />
            <p className="text-xs text-muted-foreground">Paste your Mapbox public token to render the map.</p>
          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      <section className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-muted/40 to-muted">
          <CardHeader>
            <CardTitle>Total tCO2e</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{numberFmt(kpiTotal)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Scope Share</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="text-sm">S1 <span className="font-medium">{numberFmt(kpiScopes.p1)}%</span></div>
            <div className="text-sm">S2 <span className="font-medium">{numberFmt(kpiScopes.p2)}%</span></div>
            <div className="text-sm">S3 <span className="font-medium">{numberFmt(kpiScopes.p3)}%</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Period-over-period</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            {pop.delta >= 0 ? <TrendingUp className="h-4 w-4 text-destructive" /> : <TrendingDown className="h-4 w-4 text-green-600" />}
            <div className="text-2xl font-semibold">{numberFmt(Math.abs(pop.delta))}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Country</CardTitle>
          </CardHeader>
          <CardContent>
            {topCountryRows[0] ? (
              <div className="text-sm">
                <div className="font-medium">{topCountryRows[0].country}</div>
                <div className="text-muted-foreground">{numberFmt(topCountryRows[0].total)} tCO2e</div>
              </div>
            ) : (
              <div className="text-muted-foreground text-sm">No data</div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Map */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>World Map</CardTitle>
          </CardHeader>
          <CardContent>
            <GlobeMap token={mapToken} countryTotals={byCountryTotals} coords={countryCoords} />
          </CardContent>
        </Card>
      </section>

      {/* Charts */}
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Stacked Trend by Scope</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradS1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradS2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="gradS3" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip formatter={(v: any) => numberFmt(v as number)} />
                <Area type="monotone" dataKey="S1" stackId="1" stroke="hsl(var(--primary))" fill="url(#gradS1)" />
                <Area type="monotone" dataKey="S2" stackId="1" stroke="hsl(var(--secondary))" fill="url(#gradS2)" />
                <Area type="monotone" dataKey="S3" stackId="1" stroke="hsl(var(--accent))" fill="url(#gradS3)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCountryRows} layout="vertical" margin={{ left: 16, right: 16, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="country" width={120} />
                <Tooltip formatter={(v: any) => numberFmt(v as number)} />
                <Bar dataKey="total" radius={[4,4,4,4]} fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* Data Table */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Sample Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>First 10 rows after filters.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">EF</TableHead>
                  <TableHead className="text-right">tCO2e</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 10).map((r, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="whitespace-nowrap">{r.date}</TableCell>
                    <TableCell>{countryCoords[r.country]?.name || r.country}</TableCell>
                    <TableCell>{r.scope}</TableCell>
                    <TableCell>{r.category}</TableCell>
                    <TableCell className="text-right">{numberFmt(r.quantity)}</TableCell>
                    <TableCell>{r.unit}</TableCell>
                    <TableCell className="text-right">{r.emission_factor.value} {r.emission_factor.unit}</TableCell>
                    <TableCell className="text-right">{numberFmt((r.quantity * r.emission_factor.value)/1000)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
