
import React from 'react';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  dateRange?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, dateRange = "Jan 2025 - Dec 2025" }) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500">{subtitle}</p>
      </div>
      
      <div className="mt-4 md:mt-0 flex items-center space-x-4">
        <div className="bg-white p-2 rounded-md shadow-sm flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <span className="text-sm font-medium">{dateRange}</span>
        </div>
        
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Data
        </Button>
      </div>
    </div>
  );
};

export default PageHeader;
