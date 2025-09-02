import { addMonths, format, subMonths } from 'date-fns';
import type { CountryCoordsMap, EmissionRecord, Scope } from '@/types/emissions';

export interface Facility {
  id: string;
  name: string;
  type: 'factory' | 'office' | 'warehouse' | 'data_center' | 'retail';
  industry: 'manufacturing' | 'technology' | 'logistics' | 'retail' | 'finance';
  country: string;
  city: string;
  lat: number;
  lng: number;
  employees: number;
  area_sqm: number;
  annual_revenue: number; // USD
}

export const facilityTypes = {
  factory: { icon: '🏭', color: '#ef4444' },
  office: { icon: '🏢', color: '#3b82f6' },
  warehouse: { icon: '🏪', color: '#f59e0b' },
  data_center: { icon: '🖥️', color: '#8b5cf6' },
  retail: { icon: '🏬', color: '#10b981' }
};

export const industries = {
  manufacturing: { name: 'Manufacturing', icon: '⚙️', intensity: 2.8 },
  technology: { name: 'Technology', icon: '💻', intensity: 0.9 },
  logistics: { name: 'Logistics', icon: '🚛', intensity: 3.2 },
  retail: { name: 'Retail', icon: '🛒', intensity: 1.1 },
  finance: { name: 'Finance', icon: '💳', intensity: 0.6 }
};

// Enhanced country coordinates with major cities
export const enhancedCountryCoords: CountryCoordsMap = {
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

// Major cities for facility locations
const cityLocations = {
  US: [
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
    { name: 'Houston', lat: 29.7604, lng: -95.3698 },
    { name: 'San Francisco', lat: 37.7749, lng: -122.4194 }
  ],
  GB: [
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'Manchester', lat: 53.4808, lng: -2.2426 },
    { name: 'Birmingham', lat: 52.4862, lng: -1.8904 }
  ],
  DE: [
    { name: 'Berlin', lat: 52.5200, lng: 13.4050 },
    { name: 'Munich', lat: 48.1351, lng: 11.5820 },
    { name: 'Frankfurt', lat: 50.1109, lng: 8.6821 }
  ],
  CN: [
    { name: 'Beijing', lat: 39.9042, lng: 116.4074 },
    { name: 'Shanghai', lat: 31.2304, lng: 121.4737 },
    { name: 'Shenzhen', lat: 22.5431, lng: 114.0579 }
  ],
  JP: [
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { name: 'Osaka', lat: 34.6937, lng: 135.5023 }
  ],
  // Add more cities for other countries
  CA: [{ name: 'Toronto', lat: 43.6532, lng: -79.3832 }],
  FR: [{ name: 'Paris', lat: 48.8566, lng: 2.3522 }],
  BR: [{ name: 'São Paulo', lat: -23.5505, lng: -46.6333 }],
  IN: [{ name: 'Mumbai', lat: 19.0760, lng: 72.8777 }],
  AU: [{ name: 'Sydney', lat: -33.8688, lng: 151.2093 }],
  NL: [{ name: 'Amsterdam', lat: 52.3676, lng: 4.9041 }],
  ZA: [{ name: 'Cape Town', lat: -33.9249, lng: 18.4241 }],
  MX: [{ name: 'Mexico City', lat: 19.4326, lng: -99.1332 }]
};

export function generateFacilities(): Facility[] {
  const facilities: Facility[] = [];
  const facilityTypeKeys = Object.keys(facilityTypes) as (keyof typeof facilityTypes)[];
  const industryKeys = Object.keys(industries) as (keyof typeof industries)[];
  
  let facilityId = 1;

  Object.entries(cityLocations).forEach(([countryCode, cities]) => {
    cities.forEach(city => {
      // Generate 3-8 facilities per city
      const numFacilities = 3 + Math.floor(Math.random() * 6);
      
      for (let i = 0; i < numFacilities; i++) {
        const facilityType = facilityTypeKeys[Math.floor(Math.random() * facilityTypeKeys.length)];
        const industry = industryKeys[Math.floor(Math.random() * industryKeys.length)];
        
        // Add some randomness to coordinates (within 0.1 degree radius)
        const latOffset = (Math.random() - 0.5) * 0.2;
        const lngOffset = (Math.random() - 0.5) * 0.2;
        
        facilities.push({
          id: `FAC-${String(facilityId).padStart(3, '0')}`,
          name: `${city.name} ${facilityType.charAt(0).toUpperCase() + facilityType.slice(1)} ${i + 1}`,
          type: facilityType,
          industry,
          country: countryCode,
          city: city.name,
          lat: city.lat + latOffset,
          lng: city.lng + lngOffset,
          employees: 10 + Math.floor(Math.random() * 1000),
          area_sqm: 500 + Math.floor(Math.random() * 10000),
          annual_revenue: 100000 + Math.floor(Math.random() * 50000000)
        });
        
        facilityId++;
      }
    });
  });

  return facilities;
}

// Enhanced emission factors by industry and facility type
const emissionFactors = {
  manufacturing: {
    electricity: { value: 0.52, unit: 'kgCO2e/kWh' },
    natural_gas: { value: 2.2, unit: 'kgCO2e/m3' },
    diesel: { value: 2.8, unit: 'kgCO2e/L' }
  },
  technology: {
    electricity: { value: 0.45, unit: 'kgCO2e/kWh' },
    business_travel: { value: 0.18, unit: 'kgCO2e/km' }
  },
  logistics: {
    diesel: { value: 2.7, unit: 'kgCO2e/L' },
    electricity: { value: 0.48, unit: 'kgCO2e/kWh' }
  },
  retail: {
    electricity: { value: 0.47, unit: 'kgCO2e/kWh' },
    waste: { value: 0.6, unit: 'kgCO2e/kg' }
  },
  finance: {
    electricity: { value: 0.42, unit: 'kgCO2e/kWh' },
    business_travel: { value: 0.16, unit: 'kgCO2e/km' }
  }
};

export function generateEnhancedEmissions(monthsBack: number = 18): EmissionRecord[] {
  const facilities = generateFacilities();
  const records: EmissionRecord[] = [];
  const start = subMonths(new Date(), monthsBack);
  const scopes: Scope[] = ['S1', 'S2', 'S3'];

  const categoriesByScope = {
    S1: ['Natural Gas', 'Diesel', 'Gasoline'],
    S2: ['Electricity'],
    S3: ['Business Travel', 'Purchased Goods', 'Waste']
  };

  for (let m = 0; m <= monthsBack; m++) {
    const date = addMonths(start, m);
    const dateStr = format(date, 'yyyy-MM-') + '15';

    facilities.forEach(facility => {
      scopes.forEach(scope => {
        const categories = categoriesByScope[scope];
        
        categories.forEach(category => {
          // Skip some categories based on facility type and industry
          if (category === 'Business Travel' && facility.type === 'factory') return;
          if (category === 'Diesel' && facility.industry === 'finance') return;

          const industryIntensity = industries[facility.industry].intensity;
          const baseQuantity = getBaseQuantity(category, facility);
          const seasonal = 0.8 + 0.4 * Math.sin((m / 12) * Math.PI * 2);
          const quantity = Math.max(1, baseQuantity * industryIntensity * seasonal);

          const factor = getEmissionFactor(category, facility.industry);

          records.push({
            date: dateStr,
            country: facility.country,
            scope,
            category,
            quantity: Math.round(quantity * 100) / 100,
            unit: getUnit(category),
            emission_factor: factor,
            facility_id: facility.id,
            facility_name: facility.name,
            facility_type: facility.type,
            industry: facility.industry
          } as EmissionRecord & {
            facility_id: string;
            facility_name: string;
            facility_type: string;
            industry: string;
          });
        });
      });
    });
  }

  return records;
}

function getBaseQuantity(category: string, facility: Facility): number {
  const sizeMultiplier = Math.sqrt(facility.area_sqm / 1000);
  const employeeMultiplier = Math.sqrt(facility.employees / 100);

  switch (category) {
    case 'Electricity':
      return 1000 + (sizeMultiplier * 500) + (employeeMultiplier * 200);
    case 'Natural Gas':
      return 100 + (sizeMultiplier * 50);
    case 'Diesel':
      return facility.type === 'warehouse' ? 200 + sizeMultiplier * 100 : 50;
    case 'Business Travel':
      return employeeMultiplier * 100;
    case 'Purchased Goods':
      return facility.annual_revenue / 10000;
    case 'Waste':
      return employeeMultiplier * 20;
    default:
      return 100;
  }
}

function getEmissionFactor(category: string, industry: keyof typeof industries) {
  const factors = emissionFactors[industry] as any;
  
  switch (category) {
    case 'Electricity':
      return factors?.electricity || { value: 0.45, unit: 'kgCO2e/kWh' };
    case 'Natural Gas':
      return factors?.natural_gas || { value: 2.0, unit: 'kgCO2e/m3' };
    case 'Diesel':
      return factors?.diesel || { value: 2.68, unit: 'kgCO2e/L' };
    case 'Business Travel':
      return factors?.business_travel || { value: 0.15, unit: 'kgCO2e/km' };
    case 'Purchased Goods':
      return { value: 1.8, unit: 'kgCO2e/kg' };
    case 'Waste':
      return { value: 0.5, unit: 'kgCO2e/kg' };
    default:
      return { value: 1.0, unit: 'kgCO2e/kg' };
  }
}

function getUnit(category: string): EmissionRecord['unit'] {
  switch (category) {
    case 'Electricity': return 'kWh';
    case 'Natural Gas': return 'L'; // Simplified
    case 'Diesel': return 'L';
    case 'Business Travel': return 'kg'; // Simplified as km->kg
    case 'Purchased Goods': return 'kg';
    case 'Waste': return 'kg';
    default: return 'kg';
  }
}

export { enhancedCountryCoords as countryCoords };