import { z } from 'zod';

export interface EmissionsCSVRow {
  entry_date: string;
  scope: 'S1' | 'S2' | 'S3';
  category: string;
  quantity: number;
  unit: 'kWh' | 'MWh' | 'L' | 'kg' | 't';
  activity_type?: string;
  notes?: string;
  facility_name?: string;
}

export interface CSVParseResult {
  success: boolean;
  data?: EmissionsCSVRow[];
  errors?: string[];
  warnings?: string[];
}

const emissionsRowSchema = z.object({
  entry_date: z.string().refine((date) => {
    const parsed = new Date(date);
    return !isNaN(parsed.getTime());
  }, 'Invalid date format (use YYYY-MM-DD)'),
  scope: z.enum(['S1', 'S2', 'S3', 'scope_1', 'scope_2', 'scope_3']),
  category: z.string().min(1, 'Category is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unit: z.enum(['kWh', 'MWh', 'L', 'kg', 't']),
  activity_type: z.string().optional(),
  notes: z.string().optional(),
  facility_name: z.string().optional(),
});

export const parseEmissionsCSV = (csvText: string): CSVParseResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const emissions: EmissionsCSVRow[] = [];

  try {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      return {
        success: false,
        errors: ['CSV file must contain at least a header row and one data row']
      };
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    
    // Required headers
    const requiredHeaders = ['entry_date', 'scope', 'category', 'quantity', 'unit'];
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

      // Handle CSV parsing with quoted values
      const values = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)?.map(v => v.replace(/^"|"$/g, '').trim()) || [];
      
      if (values.length === 0) continue;

      const row: any = {};
      headers.forEach((header, index) => {
        const value = values[index];
        if (!value) return;

        switch (header) {
          case 'entry_date':
          case 'date':
            row.entry_date = value;
            break;
          case 'scope':
            // Normalize scope format
            const scopeValue = value.toUpperCase();
            if (scopeValue.includes('1') || scopeValue === 'S1') row.scope = 'S1';
            else if (scopeValue.includes('2') || scopeValue === 'S2') row.scope = 'S2';
            else if (scopeValue.includes('3') || scopeValue === 'S3') row.scope = 'S3';
            else row.scope = value;
            break;
          case 'category':
            row.category = value;
            break;
          case 'quantity':
          case 'amount':
            const qty = parseFloat(value);
            if (!isNaN(qty)) row.quantity = qty;
            break;
          case 'unit':
            row.unit = value;
            break;
          case 'activity_type':
          case 'activity':
            row.activity_type = value;
            break;
          case 'notes':
          case 'description':
            row.notes = value;
            break;
          case 'facility_name':
          case 'facility':
            row.facility_name = value;
            break;
        }
      });

      // Validate row
      try {
        const validatedRow = emissionsRowSchema.parse(row);
        emissions.push({
          entry_date: validatedRow.entry_date,
          scope: validatedRow.scope.startsWith('scope_') 
            ? validatedRow.scope.replace('scope_', 'S').toUpperCase() as 'S1' | 'S2' | 'S3'
            : validatedRow.scope as 'S1' | 'S2' | 'S3',
          category: validatedRow.category,
          quantity: validatedRow.quantity,
          unit: validatedRow.unit,
          activity_type: validatedRow.activity_type,
          notes: validatedRow.notes,
          facility_name: validatedRow.facility_name,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push(`Row ${i + 1}: ${error.errors.map(e => e.message).join(', ')}`);
        } else {
          errors.push(`Row ${i + 1}: Invalid data`);
        }
      }
    }

    if (emissions.length === 0) {
      return {
        success: false,
        errors: errors.length > 0 ? errors : ['No valid emissions data found in CSV']
      };
    }

    return {
      success: true,
      data: emissions,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error) {
    return {
      success: false,
      errors: [`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
};

export const generateEmissionsCSVTemplate = (): string => {
  const headers = [
    'entry_date',
    'scope',
    'category',
    'quantity',
    'unit',
    'activity_type',
    'notes',
    'facility_name'
  ];

  const exampleRows = [
    [
      '2024-01-15',
      'S1',
      'Stationary Combustion',
      '1500',
      'kWh',
      'Natural Gas',
      'Main facility heating',
      'Main Office'
    ],
    [
      '2024-01-15',
      'S2',
      'Purchased Electricity',
      '2500',
      'kWh',
      'Grid Electricity',
      'Office operations',
      'Main Office'
    ],
    [
      '2024-01-15',
      'S3',
      'Business Travel',
      '500',
      'kg',
      'Air Travel',
      'Employee flights',
      ''
    ]
  ];

  return [
    headers.join(','),
    ...exampleRows.map(row => row.join(','))
  ].join('\n');
};

export const detectDuplicates = (
  newData: EmissionsCSVRow[],
  existingData: Array<{ entry_date: string; scope: string; category: string; quantity: number }>
): { duplicates: number[]; potentialDuplicates: number[] } => {
  const duplicates: number[] = [];
  const potentialDuplicates: number[] = [];

  newData.forEach((newRow, index) => {
    const exactMatch = existingData.some(existing => 
      existing.entry_date === newRow.entry_date &&
      existing.scope === newRow.scope &&
      existing.category === newRow.category &&
      existing.quantity === newRow.quantity
    );

    if (exactMatch) {
      duplicates.push(index);
      return;
    }

    const potentialMatch = existingData.some(existing =>
      existing.entry_date === newRow.entry_date &&
      existing.scope === newRow.scope &&
      existing.category === newRow.category
    );

    if (potentialMatch) {
      potentialDuplicates.push(index);
    }
  });

  return { duplicates, potentialDuplicates };
};
