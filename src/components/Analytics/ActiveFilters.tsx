
import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAnalyticsFilters } from '@/contexts/AnalyticsFilterContext';
import { format } from 'date-fns';

// Sample data mapping - in a real app, this would come from the same source as FilterPanel
const facilityNames: Record<string, string> = {
  'all': 'All Facilities',
  'fac1': 'Office A',
  'fac2': 'Office B',
  'fac3': 'Factory A',
  'fac4': 'Factory B',
  'fac5': 'Warehouse A',
  'fac6': 'Warehouse B',
};

const departmentNames: Record<string, string> = {
  'all': 'All Departments',
  'dep1': 'Operations',
  'dep2': 'IT',
  'dep3': 'Finance',
  'dep4': 'HR',
  'dep5': 'Marketing',
};

const projectNames: Record<string, string> = {
  'all': 'All Projects',
  'proj1': 'Office Renovation',
  'proj2': 'Fleet Upgrade',
  'proj3': 'Solar Installation',
  'proj4': 'Waste Reduction',
};

const ActiveFilters: React.FC = () => {
  const { filters, updateFilters } = useAnalyticsFilters();
  
  const resetFilter = (key: 'facility' | 'department' | 'project') => {
    updateFilters({ [key]: 'all' });
  };
  
  const hasActiveFilters = 
    filters.facility !== 'all' || 
    filters.department !== 'all' || 
    filters.project !== 'all';
  
  if (!hasActiveFilters) {
    return null;
  }
  
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <span className="text-sm text-gray-500 mr-2 pt-1">Active filters:</span>
      
      {filters.facility !== 'all' && (
        <Badge variant="secondary" className="flex items-center gap-1 pl-2">
          Facility: {facilityNames[filters.facility]}
          <X 
            className="h-3 w-3 cursor-pointer ml-1" 
            onClick={() => resetFilter('facility')}
          />
        </Badge>
      )}
      
      {filters.department !== 'all' && (
        <Badge variant="secondary" className="flex items-center gap-1 pl-2">
          Department: {departmentNames[filters.department]}
          <X 
            className="h-3 w-3 cursor-pointer ml-1" 
            onClick={() => resetFilter('department')}
          />
        </Badge>
      )}
      
      {filters.project !== 'all' && (
        <Badge variant="secondary" className="flex items-center gap-1 pl-2">
          Project: {projectNames[filters.project]}
          <X 
            className="h-3 w-3 cursor-pointer ml-1" 
            onClick={() => resetFilter('project')}
          />
        </Badge>
      )}
    </div>
  );
};

export default ActiveFilters;
