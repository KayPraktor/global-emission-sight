
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  Search, 
  BarChart3, 
  PieChart, 
  LineChart, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight 
} from 'lucide-react';
import { toast } from "sonner";

interface AIDataAnalysisProps {
  startDate?: Date;
  endDate?: Date;
}

const AIDataAnalysis: React.FC<AIDataAnalysisProps> = ({ 
  startDate = new Date(2025, 0, 1), 
  endDate = new Date() 
}) => {
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(startDate);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | undefined>(endDate);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const handleAnalyzeData = () => {
    setIsAnalyzing(true);
    toast.info("Starting comprehensive data analysis...");
    
    // Simulate analysis delay
    setTimeout(() => {
      setIsAnalyzing(false);
      toast.success("Analysis complete! AI insights generated.");
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI-Powered Data Analysis</CardTitle>
          <CardDescription>Ask questions or get insights about your emissions data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Natural Language Query */}
          <div className="flex space-x-2">
            <Input
              placeholder="Ask a question about your emissions data..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Query
            </Button>
          </div>

          {/* Time Period Selector */}
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Start Date</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedStartDate ? format(selectedStartDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedStartDate}
                    onSelect={setSelectedStartDate}
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
                    {selectedEndDate ? format(selectedEndDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedEndDate}
                    onSelect={setSelectedEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAnalyzeData} disabled={isAnalyzing}>
                {isAnalyzing ? "Analyzing..." : "Analyze Data"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Emission Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-gray-100 rounded-md">
              <LineChart className="h-16 w-16 text-gray-400" />
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                Your emissions have decreased by 8.3% compared to the previous period, primarily due to reduced energy consumption.
              </p>
              <div className="flex justify-between items-center text-sm">
                <span>Trend prediction accuracy:</span>
                <Badge className="bg-green-100 text-green-800">92%</Badge>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-2 justify-between">
                <span>View detailed trend analysis</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Anomaly Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-sm font-medium">Energy consumption</p>
                </div>
                <Badge variant="outline" className="bg-green-50">Normal</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                  <p className="text-sm font-medium">Transportation</p>
                </div>
                <Badge variant="outline" className="bg-yellow-50">Anomaly detected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm font-medium">Manufacturing process</p>
                </div>
                <Badge variant="outline" className="bg-red-50">Critical anomaly</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-sm font-medium">Waste management</p>
                </div>
                <Badge variant="outline" className="bg-green-50">Normal</Badge>
              </div>
              <div className="pt-2">
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  <span>View anomaly details</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Emission Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-gray-100 rounded-md">
              <PieChart className="h-16 w-16 text-gray-400" />
            </div>
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm">Electricity (42%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">Transportation (28%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-sm">Heating (18%)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <span className="text-sm">Other (12%)</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-2 justify-between">
                <span>View detailed source breakdown</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">AI Insights & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-3 py-1">
                <p className="text-sm font-medium">Correlation Detected</p>
                <p className="text-xs text-gray-600">Strong correlation (0.87) between production increases and energy consumption spikes on Tuesdays.</p>
              </div>
              <div className="border-l-4 border-green-500 pl-3 py-1">
                <p className="text-sm font-medium">Opportunity Identified</p>
                <p className="text-xs text-gray-600">Rescheduling high-energy processes to off-peak hours could reduce emissions by up to 12%.</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-3 py-1">
                <p className="text-sm font-medium">Anomaly Explanation</p>
                <p className="text-xs text-gray-600">Transportation emissions spike is linked to temporary rerouting due to highway construction.</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-3 py-1">
                <p className="text-sm font-medium">Trend Prediction</p>
                <p className="text-xs text-gray-600">Current trajectory suggests meeting annual reduction goals by October rather than December.</p>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2">
                Generate Comprehensive Analysis Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIDataAnalysis;
