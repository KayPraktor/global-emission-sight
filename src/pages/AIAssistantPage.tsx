
import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  ArrowUpCircle, 
  BarChart3, 
  CheckCircle, 
  AlertTriangle, 
  Zap, 
  TrendingUp, 
  LineChart, 
  FileText, 
  ArrowRight,
  PlusCircle,
  Settings,
  Info,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import ProductivityTab from "@/components/Productivity/ProductivityTab";
import AIChat from "@/components/AI/AIChat";
import AIDataAnalysis from "@/components/AI/AIDataAnalysis";
import { AnalyticsFilterProvider } from '@/contexts/AnalyticsFilterContext';
import { toast } from "sonner";

// Recommendation item type
interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
  confidence: number;
  implementation: string;
  roi: string;
  details?: {
    overview: string;
    steps: string[];
    timeline: string;
    costsEstimate: string;
    expectedResults: string;
  };
}

const AIAssistantPage: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(2025, 0, 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState('chat');
  const [aiModel, setAiModel] = useState('advanced');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [showRecommendationDetails, setShowRecommendationDetails] = useState(false);

  // Simulation of AI training process
  useEffect(() => {
    if (isTraining && trainingProgress < 100) {
      const timer = setTimeout(() => {
        setTrainingProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            setIsTraining(false);
            toast.success("AI model successfully trained on your data!");
            return 100;
          }
          return newProgress;
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isTraining, trainingProgress]);

  const startTraining = () => {
    setIsTraining(true);
    setTrainingProgress(0);
    toast.info("Starting AI training process...");
  };

  const handleQuickAction = (action: string) => {
    setActiveTab('chat');
    
    // Simulate different AI queries based on the action
    switch(action) {
      case 'generate-report':
        toast.info("Generating emission report...");
        setTimeout(() => {
          toast.success("Report generated successfully!");
        }, 2000);
        break;
      case 'analyze-month':
        toast.info("Analyzing current month data...");
        setTimeout(() => {
          toast.success("Analysis complete!");
        }, 2000);
        break;
      case 'forecast':
        toast.info("Forecasting emissions to end of year...");
        setTimeout(() => {
          toast.success("Forecast complete!");
        }, 2000);
        break;
      case 'simulate':
        toast.info("Preparing simulation environment...");
        setTimeout(() => {
          toast.success("Simulation ready!");
        }, 2000);
        break;
      default:
        break;
    }
  };

  return (
    <AnalyticsFilterProvider>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">AI Assistant</h1>
                <p className="text-gray-600">Your intelligent sustainability partner</p>
              </div>
              <div className="flex space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="flex items-center space-x-1">
                      <Settings className="h-4 w-4" />
                      <span>AI Settings</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h3 className="font-medium text-lg">AI Model Settings</h3>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Select Model</p>
                        <div className="flex flex-col space-y-2">
                          <label className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              name="model" 
                              checked={aiModel === 'standard'} 
                              onChange={() => setAiModel('standard')}
                              className="rounded-full"
                            />
                            <span>Standard</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              name="model" 
                              checked={aiModel === 'advanced'} 
                              onChange={() => setAiModel('advanced')}
                              className="rounded-full"
                            />
                            <span>Advanced (GPT-4o)</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input 
                              type="radio" 
                              name="model" 
                              checked={aiModel === 'custom'} 
                              onChange={() => setAiModel('custom')}
                              className="rounded-full"
                            />
                            <span>Custom-trained</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          onClick={startTraining} 
                          disabled={isTraining}
                          className="w-full"
                        >
                          {isTraining ? "Training in progress..." : "Train AI on Your Data"}
                        </Button>
                        
                        {isTraining && (
                          <div className="mt-3">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Training progress</span>
                              <span>{trainingProgress}%</span>
                            </div>
                            <Progress value={trainingProgress} className="h-2" />
                          </div>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Button variant="default" className="flex items-center space-x-1">
                  <PlusCircle className="h-4 w-4" />
                  <span>Create New Session</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-3/4">
                <Tabs defaultValue="chat" onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="analysis">Data Analysis</TabsTrigger>
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                    <TabsTrigger value="productivity">Productivity</TabsTrigger>
                  </TabsList>
                  
                  {/* Chat Tab */}
                  <TabsContent value="chat">
                    <AIChat 
                      startDate={startDate} 
                      endDate={endDate} 
                      modelType={aiModel}
                    />
                  </TabsContent>
                  
                  {/* Analysis Tab */}
                  <TabsContent value="analysis">
                    <AIDataAnalysis 
                      startDate={startDate} 
                      endDate={endDate}
                    />
                  </TabsContent>
                  
                  {/* Recommendations Tab */}
                  <TabsContent value="recommendations">
                    <Card>
                      <CardHeader>
                        <CardTitle>AI Recommendations</CardTitle>
                        <CardDescription>Personalized suggestions to reduce emissions and increase efficiency.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {/* Recommendation items will be rendered here */}
                          <RecommendationItems 
                            startDate={startDate} 
                            endDate={endDate} 
                            onViewDetails={(recommendation) => {
                              setSelectedRecommendation(recommendation);
                              setShowRecommendationDetails(true);
                            }}
                          />

                          <div className="flex justify-center mt-4">
                            <Button 
                              className="flex items-center"
                              onClick={() => toast.success("Generating additional recommendations...")}
                            >
                              <Zap className="mr-2 h-4 w-4" />
                              Generate More Recommendations
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  {/* Productivity Tab */}
                  <TabsContent value="productivity">
                    <Card>
                      <CardHeader>
                        <CardTitle>AI Productivity Analysis</CardTitle>
                        <CardDescription>Identify opportunities to improve operational efficiency while reducing emissions.</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ProductivityTab />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar */}
              <div className="w-full md:w-1/4 space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">AI Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm">
                        Based on your recent data, optimizing your assembly process could improve productivity by 22% while reducing emissions by 15%.
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <Zap className="mr-2 h-4 w-4" /> Get More Insights
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => handleQuickAction('generate-report')}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Generate emission report
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => handleQuickAction('analyze-month')}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analyze current month data
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => handleQuickAction('forecast')}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Forecast emissions to EOY
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                        onClick={() => handleQuickAction('simulate')}
                      >
                        <LineChart className="h-4 w-4 mr-2" />
                        Simulate reduction scenarios
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {activeTab === 'chat' && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Recent Queries</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={() => {
                            setActiveTab('chat');
                            toast.info("Query loaded to chat");
                          }}
                        >
                          <Info className="h-3 w-3 mr-2 text-muted-foreground" />
                          <span className="truncate text-sm text-muted-foreground">How can we reduce Scope 2 emissions?</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={() => {
                            setActiveTab('chat');
                            toast.info("Query loaded to chat");
                          }}
                        >
                          <Info className="h-3 w-3 mr-2 text-muted-foreground" />
                          <span className="truncate text-sm text-muted-foreground">Generate April emissions report</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full justify-start"
                          onClick={() => {
                            setActiveTab('chat');
                            toast.info("Query loaded to chat");
                          }}
                        >
                          <Info className="h-3 w-3 mr-2 text-muted-foreground" />
                          <span className="truncate text-sm text-muted-foreground">Compare Q1 vs Q4 last year</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation Details Dialog */}
      <Dialog open={showRecommendationDetails} onOpenChange={setShowRecommendationDetails}>
        <DialogContent className="max-w-3xl">
          {selectedRecommendation && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <span>{selectedRecommendation.title}</span>
                  <Badge className={getImpactColor(selectedRecommendation.impact)}>
                    {selectedRecommendation.impact.charAt(0).toUpperCase() + selectedRecommendation.impact.slice(1)} Impact
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  {selectedRecommendation.description}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">Implementation Overview</h3>
                  <p>{selectedRecommendation.details?.overview}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Implementation Steps</h3>
                  <ol className="list-decimal pl-5 space-y-1">
                    {selectedRecommendation.details?.steps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Timeline</h4>
                    <p>{selectedRecommendation.details?.timeline}</p>
                  </div>
                  <div className="border rounded-md p-4">
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Estimated Costs</h4>
                    <p>{selectedRecommendation.details?.costsEstimate}</p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h3 className="text-lg font-medium mb-2 text-green-800">Expected Results</h3>
                  <p className="text-green-700">{selectedRecommendation.details?.expectedResults}</p>
                </div>

                <div className="flex justify-between items-center border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-1" /> Helpful
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center">
                      <ThumbsDown className="h-4 w-4 mr-1" /> Not Helpful
                    </Button>
                  </div>
                  <Button 
                    onClick={() => {
                      toast.success("Recommendation saved to action plan");
                      setShowRecommendationDetails(false);
                    }}
                  >
                    Add to Action Plan
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AnalyticsFilterProvider>
  );
}

// Helper function for recommendation impact colors
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

// Helper component for recommendations
const RecommendationItems = ({ 
  startDate, 
  endDate,
  onViewDetails
}: { 
  startDate?: Date, 
  endDate?: Date,
  onViewDetails: (recommendation: Recommendation) => void
}) => {
  // Sample recommendations with detailed data
  const recommendations: Recommendation[] = [
    {
      id: '1',
      title: 'Optimize HVAC operating schedules',
      description: 'Reducing HVAC operation during non-working hours could decrease emissions by 15-20%.',
      impact: 'high',
      category: 'Energy Efficiency',
      confidence: 92,
      implementation: 'medium',
      roi: 'high',
      details: {
        overview: 'This recommendation involves implementing smart scheduling for your HVAC systems to reduce unnecessary operation during periods of low or no occupancy.',
        steps: [
          'Conduct an audit of current HVAC usage patterns across all facilities',
          'Identify peak and off-peak usage hours based on occupancy data',
          'Install smart thermostats with scheduling capabilities',
          'Program schedules based on facility usage patterns',
          'Implement gradual temperature adjustments 1-2 hours before closing',
          'Set up automated monitoring to identify further optimization opportunities'
        ],
        timeline: '3-4 months for complete implementation',
        costsEstimate: '$15,000 - $22,000 for equipment and installation',
        expectedResults: 'Expected reduction of 15-20% in HVAC-related emissions, with an estimated annual cost saving of $28,000 - $35,000.'
      }
    },
    {
      id: '2',
      title: 'Lighting sensor installation',
      description: 'Installing motion sensors for lighting can reduce electricity consumption by 10-12%.',
      impact: 'medium',
      category: 'Energy Efficiency',
      confidence: 87,
      implementation: 'low',
      roi: 'medium',
      details: {
        overview: 'Implementing occupancy-based lighting control through motion sensors to automatically manage lighting in areas with variable occupancy.',
        steps: [
          'Conduct a lighting audit to identify high-impact areas',
          'Select appropriate sensor technologies for each space type',
          'Purchase required hardware and schedule installation',
          'Install sensors with minimal disruption to operations',
          'Configure sensitivity and timeout settings for optimal performance',
          'Train facility staff on maintenance and troubleshooting'
        ],
        timeline: '6-8 weeks for full implementation',
        costsEstimate: '$8,000 - $12,000 depending on facility size',
        expectedResults: '10-12% reduction in lighting electricity consumption, with ROI achieved within 14-18 months.'
      }
    },
    {
      id: '3',
      title: 'Renewable energy procurement',
      description: 'Switching to renewable energy sources for 30% of consumption could reduce carbon footprint significantly.',
      impact: 'high',
      category: 'Energy Sources',
      confidence: 95,
      implementation: 'high',
      roi: 'high',
      details: {
        overview: 'Establishing a power purchase agreement (PPA) with a renewable energy provider to cover approximately 30% of your total energy consumption.',
        steps: [
          'Analyze current energy consumption and establish baseline',
          'Research and evaluate potential renewable energy providers',
          'Request proposals from shortlisted providers',
          'Negotiate PPA terms including pricing, duration, and delivery',
          'Finalize contract with selected provider',
          'Implement transition plan and update emissions reporting methodology'
        ],
        timeline: '6-9 months for contract negotiation and implementation',
        costsEstimate: 'Potentially cost-neutral or slight premium (2-5%) over current rates',
        expectedResults: 'Immediate 30% reduction in Scope 2 emissions, enhanced sustainability reputation, and protection against future energy price volatility.'
      }
    },
  ];

  return (
    <>
      {recommendations.map((rec) => (
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
          
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Confidence</span>
              <div className="flex items-center mt-1">
                <Progress value={rec.confidence} className="h-1.5 flex-grow" />
                <span className="ml-2 text-xs font-medium">{rec.confidence}%</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Implementation</span>
              <span className="text-sm capitalize">{rec.implementation}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">ROI</span>
              <span className="text-sm capitalize">{rec.roi}</span>
            </div>
          </div>
          
          <div className="flex items-center mt-4 justify-between">
            <Badge variant="outline">{rec.category}</Badge>
            <div className="flex space-x-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                <ThumbsUp className="h-4 w-4 text-gray-500" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                <ThumbsDown className="h-4 w-4 text-gray-500" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 rounded-full px-3"
                onClick={() => onViewDetails(rec)}
              >
                <span className="text-xs">Details</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default AIAssistantPage;
