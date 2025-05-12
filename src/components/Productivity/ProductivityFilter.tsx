
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAnalyticsFilters } from '@/contexts/AnalyticsFilterContext';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

// Sample productivity metrics and resource types
const productivityMetrics = [
  { id: 'all', name: 'All Metrics' },
  { id: 'process-efficiency', name: 'Process Efficiency' },
  { id: 'staff-utilization', name: 'Staff Utilization' },
  { id: 'equipment-utilization', name: 'Equipment Utilization' },
  { id: 'space-utilization', name: 'Space Utilization' },
  { id: 'energy-efficiency', name: 'Energy Efficiency' },
];

const resourceTypes = [
  { id: 'all', name: 'All Resources' },
  { id: 'human', name: 'Human Resources' },
  { id: 'equipment', name: 'Equipment' },
  { id: 'energy', name: 'Energy' },
  { id: 'space', name: 'Space' },
  { id: 'materials', name: 'Materials' },
];

const ProductivityFilter: React.FC = () => {
  const { filters, updateFilters } = useAnalyticsFilters();

  const handleProductivityMetricChange = (value: string) => {
    updateFilters({ productivityMetric: value });
  };

  const handleResourceTypeChange = (value: string) => {
    updateFilters({ resourceType: value });
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Productivity Metric</label>
          <Select 
            value={filters.productivityMetric} 
            onValueChange={handleProductivityMetricChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              {productivityMetrics.map(metric => (
                <SelectItem key={metric.id} value={metric.id}>
                  {metric.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Resource Type</label>
          <Select 
            value={filters.resourceType} 
            onValueChange={handleResourceTypeChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select resource type" />
            </SelectTrigger>
            <SelectContent>
              {resourceTypes.map(resource => (
                <SelectItem key={resource.id} value={resource.id}>
                  {resource.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductivityFilter;
