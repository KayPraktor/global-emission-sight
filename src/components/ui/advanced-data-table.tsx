
import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter, 
  Download,
  MoreHorizontal,
  Check,
  X
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface AdvancedDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  selectable?: boolean;
  exportable?: boolean;
  onRowSelect?: (selectedRows: T[]) => void;
  onExport?: (data: T[]) => void;
  className?: string;
}

export function AdvancedDataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  selectable = true,
  exportable = true,
  onRowSelect,
  onExport,
  className = ''
}: AdvancedDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Filtered and sorted data
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row =>
          String(row[key]).toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig, filters]);

  const handleSort = (key: keyof T) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(processedData.map((_, index) => index)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleRowSelect = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedRows(newSelected);
    
    if (onRowSelect) {
      const selectedData = Array.from(newSelected).map(i => processedData[i]);
      onRowSelect(selectedData);
    }
  };

  const handleExport = () => {
    if (onExport) {
      const selectedData = selectedRows.size > 0 
        ? Array.from(selectedRows).map(i => processedData[i])
        : processedData;
      onExport(selectedData);
    }
  };

  const getSortIcon = (key: keyof T) => {
    if (sortConfig?.key !== key) return <ChevronUp className="h-4 w-4 opacity-0" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search all columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          )}
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {selectedRows.size > 0 && (
            <Badge variant="secondary" className="mr-2">
              {selectedRows.size} selected
            </Badge>
          )}
          {exportable && (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedRows.size === processedData.length && processedData.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead 
                  key={String(column.key)} 
                  className={`${column.width ? `w-${column.width}` : ''} ${column.sortable ? 'cursor-pointer hover:bg-muted/80' : ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{column.label}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedData.map((row, index) => (
              <TableRow 
                key={index}
                className={`${selectedRows.has(index) ? 'bg-muted/50' : ''} hover:bg-muted/30 transition-colors`}
              >
                {selectable && (
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(index)}
                      onCheckedChange={(checked) => handleRowSelect(index, !!checked)}
                      aria-label={`Select row ${index + 1}`}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell key={String(column.key)} className="py-3">
                    {column.render 
                      ? column.render(row[column.key], row)
                      : String(row[column.key])
                    }
                  </TableCell>
                ))}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem>
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Table Footer */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>
          Showing {processedData.length} of {data.length} entries
        </span>
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select className="border rounded px-2 py-1 text-sm">
            <option>10</option>
            <option>25</option>
            <option>50</option>
            <option>100</option>
          </select>
        </div>
      </div>
    </div>
  );
}
