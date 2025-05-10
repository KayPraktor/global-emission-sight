
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  onDateRangeChange?: (range: { from: Date; to: Date }) => void;
}

const EnhancedPageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle,
  onDateRangeChange
}) => {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(2025, 0, 1), // Jan 1, 2025
    to: new Date(2025, 11, 31), // Dec 31, 2025
  });

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const range = {
      from: dateRange.from,
      to: dateRange.to,
    };

    if (!dateRange.from || dateRange.to) {
      range.from = date;
      range.to = date;
    } else if (date < dateRange.from) {
      range.from = date;
    } else {
      range.to = date;
    }

    setDateRange(range);
    
    if (onDateRangeChange) {
      onDateRangeChange(range);
    }
  };

  const formattedDateRange = `${format(dateRange.from, 'MMM yyyy')} - ${format(dateRange.to, 'MMM yyyy')}`;

  return (
    <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500">{subtitle}</p>
      </div>
      
      <div className="mt-4 md:mt-0 flex items-center space-x-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="bg-white shadow-sm flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium">{formattedDateRange}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              defaultMonth={dateRange.from}
              selected={{
                from: dateRange.from,
                to: dateRange.to,
              }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  setDateRange({ from: range.from, to: range.to });
                  if (onDateRangeChange) {
                    onDateRangeChange({ from: range.from, to: range.to });
                  }
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>
    </div>
  );
};

export default EnhancedPageHeader;
