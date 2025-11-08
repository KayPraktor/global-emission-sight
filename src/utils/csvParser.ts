import { FacilityInsert } from '@/types/database';

export interface CSVParseResult {
  success: boolean;
  data?: Partial<FacilityInsert>[];
  errors?: string[];
}

export const parseFacilitiesCSV = (csvText: string): CSVParseResult => {
  const errors: string[] = [];
  const facilities: Partial<FacilityInsert>[] = [];

  try {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      return {
        success: false,
        errors: ['CSV file must contain at least a header row and one data row']
      };
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Expected headers (flexible matching)
    const requiredHeaders = ['name', 'country_code'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return {
        success: false,
        errors: [`Missing required columns: ${missingHeaders.join(', ')}`]
      };
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(',').map(v => v.trim());
      const facility: Partial<FacilityInsert> = {};

      headers.forEach((header, index) => {
        const value = values[index];
        if (!value) return;

        switch (header) {
          case 'name':
            facility.name = value;
            break;
          case 'country_code':
            facility.country_code = value;
            break;
          case 'city':
            facility.city = value;
            break;
          case 'address':
            facility.address = value;
            break;
          case 'facility_type':
          case 'type':
            facility.facility_type = value as any;
            break;
          case 'latitude':
          case 'lat':
            facility.latitude = parseFloat(value) || undefined;
            break;
          case 'longitude':
          case 'lng':
          case 'lon':
            facility.longitude = parseFloat(value) || undefined;
            break;
          case 'area_sqm':
          case 'area':
            facility.area_sqm = parseFloat(value) || undefined;
            break;
          case 'employees':
            facility.employees = parseInt(value) || undefined;
            break;
          case 'annual_revenue':
          case 'revenue':
            facility.annual_revenue = parseFloat(value) || undefined;
            break;
          case 'industry':
            facility.industry = value;
            break;
        }
      });

      // Validate required fields
      if (!facility.name) {
        errors.push(`Row ${i + 1}: Missing facility name`);
        continue;
      }
      if (!facility.country_code) {
        errors.push(`Row ${i + 1}: Missing country code`);
        continue;
      }

      facilities.push(facility);
    }

    if (facilities.length === 0) {
      return {
        success: false,
        errors: ['No valid facility data found in CSV']
      };
    }

    return {
      success: true,
      data: facilities,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
};

export const generateCSVTemplate = (): string => {
  const headers = [
    'name',
    'country_code',
    'city',
    'address',
    'facility_type',
    'latitude',
    'longitude',
    'area_sqm',
    'employees',
    'annual_revenue',
    'industry'
  ];

  const exampleRow = [
    'Main Office',
    'US',
    'New York',
    '123 Main St, New York, NY 10001',
    'office',
    '40.7128',
    '-74.0060',
    '5000',
    '150',
    '10000000',
    'Technology'
  ];

  return [headers.join(','), exampleRow.join(',')].join('\n');
};
