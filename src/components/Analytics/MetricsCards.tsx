
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  description?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down';
    label: string;
  };
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, description, trend }) => {
  return (
    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-3xl font-bold">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        {trend && (
          <div className={`flex items-center text-sm font-medium ${
            trend.direction === 'down' ? 'text-green-600' : 'text-amber-600'
          }`}>
            {trend.direction === 'down' ? (
              <ArrowDown className="h-4 w-4 mr-1" />
            ) : (
              <ArrowUp className="h-4 w-4 mr-1" />
            )}
            <span>{trend.value} {trend.label}</span>
          </div>
        )}
        {description && (
          <div className="text-sm text-gray-600">
            <span>{description}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const MetricsCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <MetricCard 
        title="Total Emissions" 
        value="1,250 tCO₂e"
        trend={{
          value: "15%",
          direction: "down",
          label: "reduction from last year"
        }}
      />
      
      <MetricCard 
        title="Carbon Intensity" 
        value="31 tCO₂e/M$"
        trend={{
          value: "11%",
          direction: "down",
          label: "reduction from last year"
        }}
      />
      
      <MetricCard 
        title="Top Emission Source" 
        value="Electricity"
        description="45% of total emissions"
      />
      
      <MetricCard 
        title="Progress to Target" 
        value="72%"
        trend={{
          value: "8%",
          direction: "up",
          label: "improvement this quarter"
        }}
      />
    </div>
  );
};

export default MetricsCards;
