
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { 
  CheckCircle, 
  AlertTriangle,
  Zap,
  TrendingUp,
  Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAnalyticsFilters } from '@/contexts/AnalyticsFilterContext';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

// Mock data for productivity insights
const productivityData = [
  { name: 'Office A', efficiency: 85, target: 90 },
  { name: 'Office B', efficiency: 92, target: 90 },
  { name: 'Factory A', efficiency: 78, target: 85 },
  { name: 'Factory B', efficiency: 88, target: 85 },
  { name: 'Warehouse A', efficiency: 76, target: 80 },
  { name: 'Warehouse B', efficiency: 82, target: 80 },
];

// Mock recommendations data
const recommendations = [
  {
    id: '1',
    title: 'Optimize HVAC scheduling in Factory A',
    description: 'Adjusting HVAC operating schedules could increase productivity by 8% while reducing emissions.',
    impact: 'high',
    category: 'Energy Efficiency',
    roi: '3.5x',
    implementationTime: '2-4 weeks'
  },
  {
    id: '2',
    title: 'Resource reallocation in Warehouse A',
    description: 'Shifting 15% of resources from underutilized periods could increase throughput by 12%.',
    impact: 'medium',
    category: 'Resource Utilization',
    roi: '2.8x',
    implementationTime: '1-2 weeks'
  },
  {
    id: '3',
    title: 'Process automation for Office B reporting',
    description: 'Automating weekly reporting processes could save 8.5 hours per week of staff time.',
    impact: 'high',
    category: 'Process Optimization',
    roi: '4.2x',
    implementationTime: '3-6 weeks'
  },
];

const ProductivityInsights: React.FC = () => {
  const { filters } = useAnalyticsFilters();
  
  // In a real application, we would filter based on the selected filters
  const filteredRecommendations = recommendations.filter(rec => {
    if (filters.facility !== 'all' && !rec.title.includes(filters.facility)) {
      return false;
    }
    return true;
  });

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
    <div className="space-y-6">
      {/* Efficiency Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Process Efficiency Overview</CardTitle>
          <CardDescription>
            Current efficiency levels compared to targets across facilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={productivityData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="efficiency" fill="#3b82f6" name="Current Efficiency %" />
                <Bar dataKey="target" fill="#64748b" name="Target %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* AI-Generated Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Productivity Recommendations</CardTitle>
          <CardDescription>
            Personalized suggestions to improve productivity and reduce emissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRecommendations.map((rec) => (
              <div key={rec.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{rec.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  </div>
                  <Badge className={getImpactColor(rec.impact)}>
                    {rec.impact.charAt(0).toUpperCase() + rec.impact.slice(1)} Impact
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                  <div className="flex space-x-2">
                    <Badge variant="outline">{rec.category}</Badge>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                      <span>ROI: {rec.roi}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-blue-600" />
                    <span>{rec.implementationTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resource Utilization Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Utilization Analysis</CardTitle>
          <CardDescription>
            AI-powered analysis of resource allocation efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-sm font-medium">Office A - Staff Utilization</p>
              </div>
              <Badge variant="outline" className="bg-green-50">92% - Optimal</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                <p className="text-sm font-medium">Factory A - Equipment Utilization</p>
              </div>
              <Badge variant="outline" className="bg-yellow-50">76% - Improvement Needed</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm font-medium">Warehouse B - Space Utilization</p>
              </div>
              <Badge variant="outline" className="bg-red-50">62% - Critical</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductivityInsights;
