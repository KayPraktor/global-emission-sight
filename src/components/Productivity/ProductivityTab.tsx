
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, TrendingUp, Zap } from 'lucide-react';
import ProductivityFilter from './ProductivityFilter';
import ProcessFlowMap from './ProcessFlowMap';
import CostSavingOpportunities from './CostSavingOpportunities';

const ProductivityTab: React.FC = () => {
  const [startDate, setStartDate] = React.useState<Date | undefined>(new Date(2025, 0, 1));
  const [endDate, setEndDate] = React.useState<Date | undefined>(new Date());

  // Sample productivity opportunities data
  const opportunities = [
    {
      id: '1',
      title: 'Assembly Line Restructuring',
      description: 'Redesigning the assembly process could reduce idle time by 32% and increase throughput.',
      impact: 'high',
      category: 'Process Optimization',
      savingsEstimate: '$85,000 annually',
      emissionsReduction: '45 tCO2e annually',
    },
    {
      id: '2',
      title: 'Energy Usage Scheduling',
      description: 'Optimizing equipment usage during off-peak hours could reduce energy costs significantly.',
      impact: 'medium',
      category: 'Energy Efficiency',
      savingsEstimate: '$42,000 annually',
      emissionsReduction: '28 tCO2e annually',
    },
    {
      id: '3',
      title: 'Warehouse Space Optimization',
      description: 'AI analysis suggests reorganizing storage layout could increase capacity by 18%.',
      impact: 'high',
      category: 'Space Utilization',
      savingsEstimate: '$63,000 annually',
      emissionsReduction: '12 tCO2e annually',
    },
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <ProductivityFilter />
      
      {/* Time Period Selector */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="space-y-2">
          <p className="text-sm font-medium">Start Date</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">End Date</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex items-end">
          <Button>Analyze Productivity</Button>
        </div>
      </div>
      
      {/* Cost Savings Opportunities */}
      <CostSavingOpportunities />
      
      {/* Process Flow Map */}
      <div className="mb-6">
        <ProcessFlowMap />
      </div>
      
      {/* AI-Identified Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle>AI-Identified Productivity Opportunities</CardTitle>
          <CardDescription>Optimize operations while reducing emissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {opportunities.map((opp) => (
              <div key={opp.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{opp.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{opp.description}</p>
                  </div>
                  <Badge className={getImpactColor(opp.impact)}>
                    {opp.impact.charAt(0).toUpperCase() + opp.impact.slice(1)} Impact
                  </Badge>
                </div>
                <div className="flex items-center mt-4 text-sm text-gray-500">
                  <Badge variant="outline" className="mr-2">{opp.category}</Badge>
                  <div className="flex items-center mr-4">
                    <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                    <span>{opp.savingsEstimate}</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="h-4 w-4 mr-1 text-blue-600" />
                    <span>{opp.emissionsReduction}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-center mt-4">
              <Button className="flex items-center">
                <Zap className="mr-2 h-4 w-4" />
                Generate More Opportunities
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ProductivityTab;
