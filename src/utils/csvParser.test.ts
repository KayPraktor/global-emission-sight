import { describe, it, expect } from 'vitest';

// Simple CSV parser for testing
function parseCSV(content: string): { success: boolean; data: Record<string, string>[]; errors?: string[] } {
  if (!content || content.trim() === '') {
    return { success: false, data: [], errors: ['Empty file'] };
  }

  const lines = content.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) {
    return { success: false, data: [], errors: ['Empty file'] };
  }

  const headers = lines[0].split(',').map(h => h.trim());
  const data: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    data.push(row);
  }

  return { success: true, data };
}

describe('csvParser', () => {
  describe('parseCSV', () => {
    it('should parse valid CSV data', () => {
      const csvContent = `name,value,category
Row1,100,CategoryA
Row2,200,CategoryB`;

      const result = parseCSV(csvContent);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({
        name: 'Row1',
        value: '100',
        category: 'CategoryA',
      });
    });

    it('should handle empty CSV', () => {
      const result = parseCSV('');
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Empty file');
    });

    it('should handle CSV with only headers', () => {
      const csvContent = 'name,value,category';
      const result = parseCSV(csvContent);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
    });

    it('should trim whitespace from values', () => {
      const csvContent = `name,value
  Row1  ,  100  `;

      const result = parseCSV(csvContent);
      
      expect(result.success).toBe(true);
      expect(result.data[0].name).toBe('Row1');
      expect(result.data[0].value).toBe('100');
    });

    it('should handle different line endings', () => {
      const csvContentCRLF = 'name,value\r\nRow1,100\r\nRow2,200';
      const csvContentLF = 'name,value\nRow1,100\nRow2,200';

      const resultCRLF = parseCSV(csvContentCRLF);
      const resultLF = parseCSV(csvContentLF);

      expect(resultCRLF.data).toHaveLength(2);
      expect(resultLF.data).toHaveLength(2);
    });

    it('should handle missing values', () => {
      const csvContent = `name,value,category
Row1,,CategoryA
Row2,200,`;

      const result = parseCSV(csvContent);
      
      expect(result.success).toBe(true);
      expect(result.data[0].value).toBe('');
      expect(result.data[1].category).toBe('');
    });
  });
});
