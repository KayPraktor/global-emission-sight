
import React from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

// Sample data - in a real app, this would come from an API or context
const facilities = [
  { id: 'all', name: 'All Facilities' },
  { id: 'fac1', name: 'Office A' },
  { id: 'fac2', name: 'Office B' },
  { id: 'fac3', name: 'Factory A' },
  { id: 'fac4', name: 'Factory B' },
  { id: 'fac5', name: 'Warehouse A' },
  { id: 'fac6', name: 'Warehouse B' },
];

const departments = [
  { id: 'all', name: 'All Departments' },
  { id: 'dep1', name: 'Operations' },
  { id: 'dep2', name: 'IT' },
  { id: 'dep3', name: 'Finance' },
  { id: 'dep4', name: 'HR' },
  { id: 'dep5', name: 'Marketing' },
];

const projects = [
  { id: 'all', name: 'All Projects' },
  { id: 'proj1', name: 'Office Renovation' },
  { id: 'proj2', name: 'Fleet Upgrade' },
  { id: 'proj3', name: 'Solar Installation' },
  { id: 'proj4', name: 'Waste Reduction' },
];

interface FilterPanelProps {
  onFilterChange: (filters: {
    facility: string;
    department: string;
    project: string;
  }) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFilterChange }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [filters, setFilters] = React.useState({
    facility: 'all',
    department: 'all',
    project: 'all',
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="mb-6">
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-full"
      >
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="mb-2 flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            {isOpen ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card>
            <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Facility</label>
                <Select 
                  value={filters.facility} 
                  onValueChange={(value) => handleFilterChange('facility', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {facilities.map(facility => (
                      <SelectItem key={facility.id} value={facility.id}>
                        {facility.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <Select 
                  value={filters.department} 
                  onValueChange={(value) => handleFilterChange('department', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(department => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <Select 
                  value={filters.project} 
                  onValueChange={(value) => handleFilterChange('project', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default FilterPanel;
