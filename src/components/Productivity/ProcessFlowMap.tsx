
import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { useAnalyticsFilters } from '@/contexts/AnalyticsFilterContext';

// Simplified process flow diagram as an example
const ProcessFlowMap: React.FC = () => {
  const { filters } = useAnalyticsFilters();

  // In a real app, you would use the filters to determine which process flow to show
  const selectedFacility = filters.facility !== 'all' ? filters.facility : 'Factory A';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interactive Process Flow</CardTitle>
        <CardDescription>
          {selectedFacility === 'Factory A' ? 'Factory A - Manufacturing Process' : 'Process Analysis with AI-Identified Optimization Points'}
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[800px] p-4">
          <div className="flex items-center justify-around">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-24 border rounded-lg p-2 flex flex-col items-center justify-center bg-white shadow-sm">
                <span className="text-sm font-medium">Raw Material Processing</span>
                <div className="mt-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">Efficient</Badge>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <CheckCircle className="h-4 w-4 inline mr-1 text-green-600" />
                <span>92% efficiency</span>
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight className="h-5 w-5 text-gray-400" />

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-24 border rounded-lg p-2 flex flex-col items-center justify-center bg-white shadow-sm border-red-300">
                <span className="text-sm font-medium">Assembly</span>
                <div className="mt-2">
                  <Badge variant="outline" className="bg-red-50 text-red-700">Bottleneck</Badge>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <AlertCircle className="h-4 w-4 inline mr-1 text-red-600" />
                <span>65% efficiency</span>
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight className="h-5 w-5 text-gray-400" />

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-24 border rounded-lg p-2 flex flex-col items-center justify-center bg-white shadow-sm">
                <span className="text-sm font-medium">Quality Control</span>
                <div className="mt-2">
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Moderate</Badge>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <AlertCircle className="h-4 w-4 inline mr-1 text-yellow-600" />
                <span>78% efficiency</span>
              </div>
            </div>

            {/* Arrow */}
            <ArrowRight className="h-5 w-5 text-gray-400" />

            {/* Step 4 */}
            <div className="flex flex-col items-center">
              <div className="w-32 h-24 border rounded-lg p-2 flex flex-col items-center justify-center bg-white shadow-sm">
                <span className="text-sm font-medium">Packaging & Shipping</span>
                <div className="mt-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700">Efficient</Badge>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <CheckCircle className="h-4 w-4 inline mr-1 text-green-600" />
                <span>85% efficiency</span>
              </div>
            </div>
          </div>

          {/* AI Recommendation for the bottleneck */}
          <div className="mt-8 p-4 border border-dashed border-blue-300 rounded-lg bg-blue-50">
            <h4 className="text-sm font-medium text-blue-700">AI Recommendation</h4>
            <p className="text-sm mt-1">Restructuring the assembly line workflow could increase throughput by 22% and reduce energy consumption by 15%. Estimated implementation cost: $18,500. Expected ROI: 3.2x within 6 months.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessFlowMap;
