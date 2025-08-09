import { addMonths, format, isAfter, isBefore, parseISO, subMonths } from 'date-fns';
import type { CountryCoordsMap, CountryTotals, EmissionRecord, Scope } from '@/types/emissions';

// Minimal country coordinates for mock visualization
export const countryCoords: CountryCoordsMap = {
  US: { code: 'US', name: 'United States', lat: 37.0902, lng: -95.7129 },
  CA: { code: 'CA', name: 'Canada', lat: 56.1304, lng: -106.3468 },
  BR: { code: 'BR', name: 'Brazil', lat: -14.2350, lng: -51.9253 },
  GB: { code: 'GB', name: 'United Kingdom', lat: 55.3781, lng: -3.4360 },
  FR: { code: 'FR', name: 'France', lat: 46.2276, lng: 2.2137 },
  DE: { code: 'DE', name: 'Germany', lat: 51.1657, lng: 10.4515 },
  NL: { code: 'NL', name: 'Netherlands', lat: 52.1326, lng: 5.2913 },
  IN: { code: 'IN', name: 'India', lat: 20.5937, lng: 78.9629 },
  CN: { code: 'CN', name: 'China', lat: 35.8617, lng: 104.1954 },
  JP: { code: 'JP', name: 'Japan', lat: 36.2048, lng: 138.2529 },
  AU: { code: 'AU', name: 'Australia', lat: -25.2744, lng: 133.7751 },
  ZA: { code: 'ZA', name: 'South Africa', lat: -30.5595, lng: 22.9375 },
  MX: { code: 'MX', name: 'Mexico', lat: 23.6345, lng: -102.5528 },
};

const scopes: Scope[] = ['S1', 'S2', 'S3'];
const categoriesByScope: Record<Scope, string[]> = {
  S1: ['Natural Gas', 'Diesel', 'Gasoline'],
  S2: ['Electricity'],
  S3: ['Business Travel', 'Purchased Goods', 'Waste']
};

// Example emission factors (kgCO2e per unit)
const ef: Record<string, { value: number; unit: EmissionRecord['emission_factor']['unit']; unitOfMeasure: EmissionRecord['unit'] }> = {
  Electricity: { value: 0.45, unit: 'kgCO2e/kWh', unitOfMeasure: 'kWh' },
  'Natural Gas': { value: 2.0, unit: 'kgCO2e/m3' as any, unitOfMeasure: 'L' as any }, // fallback, treat like L
  Diesel: { value: 2.68, unit: 'kgCO2e/L', unitOfMeasure: 'L' },
  Gasoline: { value: 2.31, unit: 'kgCO2e/L', unitOfMeasure: 'L' },
  'Business Travel': { value: 0.15, unit: 'kgCO2e/km' as any, unitOfMeasure: 'kg' as any }, // approximate, will just multiply
  'Purchased Goods': { value: 1.8, unit: 'kgCO2e/kg', unitOfMeasure: 'kg' },
  Waste: { value: 0.5, unit: 'kgCO2e/kg', unitOfMeasure: 'kg' },
};

// Utility: compute tCO2e from a record
export function computeTCO2e(row: EmissionRecord): number {
  // Convert based on factor units; most are kgCO2e per unit, so result is in kgCO2e; convert to tCO2e
  const kgCO2e = row.quantity * row.emission_factor.value;
  const tCO2e = kgCO2e / 1000; // kg -> t
  return tCO2e;
}

// Generate sample dataset (roughly 12-18 months x 10+ countries)
export function generateSampleEmissions(monthsBack: number = 18): EmissionRecord[] {
  const records: EmissionRecord[] = [];
  const start = subMonths(new Date(), monthsBack);
  const countries = Object.keys(countryCoords);

  for (let m = 0; m <= monthsBack; m++) {
    const date = addMonths(start, m);
    const dateStr = format(date, 'yyyy-MM-') + '15';

    for (const code of countries) {
      for (const scope of scopes) {
        const categories = categoriesByScope[scope];
        const numEntries = Math.random() < 0.5 ? 1 : 2;
        for (let i = 0; i < numEntries; i++) {
          const category = categories[Math.floor(Math.random() * categories.length)];
          const factor = ef[category] || { value: 1, unit: 'kgCO2e/kg', unitOfMeasure: 'kg' } as any;
          const base = 100 + Math.random() * 900; // base quantity
          const regionalMultiplier = 0.6 + Math.random() * 1.2; // vary by country
          const seasonal = 0.8 + 0.4 * Math.sin((m / 12) * Math.PI * 2);
          const quantity = Math.max(10, base * regionalMultiplier * seasonal * (scope === 'S2' ? 3 : 1));

          records.push({
            date: dateStr,
            country: code,
            scope,
            category,
            quantity: Math.round(quantity * 100) / 100,
            unit: factor.unitOfMeasure as any,
            emission_factor: { value: factor.value, unit: factor.unit as any },
          });
        }
      }
    }
  }

  return records;
}

export interface Filters {
  dateStart: Date;
  dateEnd: Date;
  scopes: Scope[];
  countries: string[]; // ISO-2 codes
}

export function filterData(data: EmissionRecord[], f: Filters): EmissionRecord[] {
  return data.filter((r) => {
    const d = parseISO(r.date);
    const within = (isAfter(d, addMonths(f.dateStart, -1)) && isBefore(d, addMonths(f.dateEnd, 1)));
    const scopeOk = f.scopes.length ? f.scopes.includes(r.scope) : true;
    const countryOk = f.countries.length ? f.countries.includes(r.country) : true;
    return within && scopeOk && countryOk;
  });
}

export function groupByMonthScope(rows: EmissionRecord[]) {
  const map = new Map<string, { S1: number; S2: number; S3: number }>();
  for (const r of rows) {
    const key = format(parseISO(r.date), 'yyyy-MM');
    const curr = map.get(key) || { S1: 0, S2: 0, S3: 0 };
    const t = computeTCO2e(r);
    curr[r.scope] += t;
    map.set(key, curr);
  }
  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([month, scopes]) => ({ month, ...scopes }));
}

export function sumByCountry(rows: EmissionRecord[]): CountryTotals {
  const totals: CountryTotals = {};
  for (const r of rows) {
    const info = countryCoords[r.country];
    if (!info) continue;
    const t = computeTCO2e(r);
    const item = totals[r.country] || { country: info.name, total: 0, s1: 0, s2: 0, s3: 0 };
    item.total += t;
    if (r.scope === 'S1') item.s1 += t;
    if (r.scope === 'S2') item.s2 += t;
    if (r.scope === 'S3') item.s3 += t;
    totals[r.country] = item;
  }
  return totals;
}

export function topCountries(rows: EmissionRecord[], topN = 8) {
  const totals = sumByCountry(rows);
  const arr = Object.entries(totals).map(([code, v]) => ({ code, country: v.country, total: v.total }));
  arr.sort((a, b) => b.total - a.total);
  return arr.slice(0, topN);
}

export function totalTco2e(rows: EmissionRecord[]) {
  return rows.reduce((sum, r) => sum + computeTCO2e(r), 0);
}

export function periodOverPeriod(data: EmissionRecord[], currentStart: Date, currentEnd: Date) {
  const curr = filterData(data, { dateStart: currentStart, dateEnd: currentEnd, scopes: ['S1','S2','S3'], countries: [] });
  const lenMonths = Math.max(1, Math.round((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  const prevEnd = addMonths(currentStart, -1);
  const prevStart = addMonths(prevEnd, -lenMonths + 1);
  const prev = filterData(data, { dateStart: prevStart, dateEnd: prevEnd, scopes: ['S1','S2','S3'], countries: [] });
  const cTot = totalTco2e(curr);
  const pTot = totalTco2e(prev);
  const delta = pTot === 0 ? 0 : ((cTot - pTot) / pTot) * 100;
  return { current: cTot, previous: pTot, delta };
}
