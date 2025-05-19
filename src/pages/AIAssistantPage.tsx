
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
import { 
  ArrowUpCircle, 
  BarChart3, 
  CheckCircle, 
  AlertTriangle, 
  Send, 
  Zap, 
  TrendingUp, 
  LineChart, 
  Mic, 
  Volume2, 
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
import AIVoiceInterface from "@/components/AI/AIVoiceInterface";
import AIDataAnalysis from "@/components/AI/AIDataAnalysis";
import { AnalyticsFilterProvider } from '@/contexts/AnalyticsFilterContext';
import { toast } from "sonner";

const AIAssistantPage: React.FC = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(2025, 0, 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState('chat');
  const [aiModel, setAiModel] = useState('advanced');
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);

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
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="analysis">Data Analysis</TabsTrigger>
                    <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                    <TabsTrigger value="productivity">Productivity</TabsTrigger>
                    <TabsTrigger value="voiceAssistant">Voice Assistant</TabsTrigger>
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
                          <RecommendationItems startDate={startDate} endDate={endDate} />

                          <div className="flex justify-center mt-4">
                            <Button className="flex items-center">
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
                  
                  {/* Voice Assistant Tab */}
                  <TabsContent value="voiceAssistant">
                    <AIVoiceInterface />
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
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Generate emission report
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Analyze current month data
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Forecast emissions to EOY
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
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
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <Info className="h-3 w-3 mr-2 text-muted-foreground" />
                          <span className="truncate text-sm text-muted-foreground">How can we reduce Scope 2 emissions?</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <Info className="h-3 w-3 mr-2 text-muted-foreground" />
                          <span className="truncate text-sm text-muted-foreground">Generate April emissions report</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
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
    </AnalyticsFilterProvider>
  );
}

// Helper component for recommendations
const RecommendationItems = ({ startDate, endDate }: { startDate?: Date, endDate?: Date }) => {
  // Sample recommendations
  const recommendations = [
    {
      id: '1',
      title: 'Optimize HVAC operating schedules',
      description: 'Reducing HVAC operation during non-working hours could decrease emissions by 15-20%.',
      impact: 'high',
      category: 'Energy Efficiency',
      confidence: 92,
      implementation: 'medium',
      roi: 'high',
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
              <Button variant="outline" size="sm" className="h-8 rounded-full px-3">
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
