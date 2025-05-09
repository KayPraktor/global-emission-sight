
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, BarChart3, CheckCircle, AlertTriangle, Send, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";

// Dummy AI conversation data
type Message = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
};

// Sample recommendations
type Recommendation = {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: string;
};

const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant. I can help you analyze emissions data, provide recommendations, and generate reports. How can I assist you today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date(2023, 0, 1));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Sample recommendations
  const recommendations: Recommendation[] = [
    {
      id: '1',
      title: 'Optimize HVAC operating schedules',
      description: 'Reducing HVAC operation during non-working hours could decrease emissions by 15-20%.',
      impact: 'high',
      category: 'Energy Efficiency',
    },
    {
      id: '2',
      title: 'Lighting sensor installation',
      description: 'Installing motion sensors for lighting can reduce electricity consumption by 10-12%.',
      impact: 'medium',
      category: 'Energy Efficiency',
    },
    {
      id: '3',
      title: 'Renewable energy procurement',
      description: 'Switching to renewable energy sources for 30% of consumption could reduce carbon footprint significantly.',
      impact: 'high',
      category: 'Energy Sources',
    },
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      let aiResponse: Message;

      if (inputMessage.toLowerCase().includes('emission') || inputMessage.toLowerCase().includes('data')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          content: 'Based on the data between ' + format(startDate || new Date(), 'PP') + ' and ' + format(endDate || new Date(), 'PP') + ', emissions have decreased by 8.3% compared to the previous period. The main contributors to this reduction were improved energy efficiency and the partial switch to renewable energy sources.',
          sender: 'ai',
          timestamp: new Date(),
        };
      } else if (inputMessage.toLowerCase().includes('recommend') || inputMessage.toLowerCase().includes('suggest')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          content: 'My top recommendation is to optimize your HVAC operating schedules, which could reduce emissions by 15-20%. Additionally, installing lighting sensors could decrease electricity consumption by 10-12%.',
          sender: 'ai',
          timestamp: new Date(),
        };
      } else if (inputMessage.toLowerCase().includes('report') || inputMessage.toLowerCase().includes('summary')) {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          content: 'I\'ve generated a summary report for the selected period. Total emissions were 1,245 tCO2e, which is 8.3% lower than the previous period. The main emission sources were electricity (48%), transportation (32%), and heating (20%).',
          sender: 'ai',
          timestamp: new Date(),
        };
      } else {
        aiResponse = {
          id: (Date.now() + 1).toString(),
          content: 'I understand you\'re interested in learning more. Would you like me to analyze emissions data, provide recommendations for reduction, or generate a comprehensive report for a specific time period?',
          sender: 'ai',
          timestamp: new Date(),
        };
      }

      setMessages([...messages, userMessage, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-4">
          <h1 className="text-3xl font-bold">AI Assistant</h1>
          <p className="text-gray-600">Analyze data, get recommendations, and generate reports using our AI assistant.</p>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-3/4">
              <Tabs defaultValue="chat">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>
                
                {/* Chat Tab */}
                <TabsContent value="chat">
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Assistant Chat</CardTitle>
                      <CardDescription>Ask questions about your emissions data and get insights.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col space-y-4">
                        <div className="bg-white rounded-lg shadow p-4 h-[400px] overflow-y-auto flex flex-col space-y-4">
                          {messages.map((message) => (
                            <div 
                              key={message.id} 
                              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div 
                                className={`max-w-3/4 rounded-lg p-3 ${
                                  message.sender === 'user' 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                <p>{message.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {format(message.timestamp, 'h:mm a')}
                                </p>
                              </div>
                            </div>
                          ))}
                          {isLoading && (
                            <div className="flex justify-start">
                              <div className="max-w-3/4 rounded-lg p-3 bg-gray-100">
                                <div className="flex items-center space-x-2">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input 
                            placeholder="Ask a question about your emissions data..." 
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1"
                          />
                          <Button onClick={handleSendMessage} disabled={isLoading}>
                            <Send className="h-4 w-4 mr-2" />
                            Send
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Analysis Tab */}
                <TabsContent value="analysis">
                  <Card>
                    <CardHeader>
                      <CardTitle>Advanced Data Analysis</CardTitle>
                      <CardDescription>AI-powered analysis of your emissions data.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Time Period Selector */}
                        <div className="flex flex-wrap gap-4">
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
                            <Button>Analyze Data</Button>
                          </div>
                        </div>

                        {/* Analysis Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">Emission Trends</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="h-[200px] flex items-center justify-center bg-gray-100 rounded-md">
                                <BarChart3 className="h-16 w-16 text-gray-400" />
                              </div>
                              <p className="mt-4 text-sm text-gray-600">
                                Your emissions have decreased by 8.3% compared to the previous period, primarily due to reduced energy consumption.
                              </p>
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
                                  <Badge variant="outline">Normal</Badge>
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
                                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                    <p className="text-sm font-medium">Waste management</p>
                                  </div>
                                  <Badge variant="outline">Normal</Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Recommendations Tab */}
                <TabsContent value="recommendations">
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Recommendations</CardTitle>
                      <CardDescription>Personalized suggestions to reduce emissions.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
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
                            <div className="flex items-center mt-4 text-sm text-gray-500">
                              <Badge variant="outline">{rec.category}</Badge>
                            </div>
                          </div>
                        ))}

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
                
                {/* Reports Tab */}
                <TabsContent value="reports">
                  <Card>
                    <CardHeader>
                      <CardTitle>AI-Generated Reports</CardTitle>
                      <CardDescription>Comprehensive reports generated by our AI.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Time Period Selector (same as in Analysis) */}
                        <div className="flex flex-wrap gap-4">
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
                            <Button>Generate Report</Button>
                          </div>
                        </div>

                        {/* Report Templates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                          <div className="border rounded-lg p-4 text-center hover:border-primary hover:shadow-sm transition-all cursor-pointer">
                            <BarChart3 className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                            <h3 className="font-medium">Emissions Summary</h3>
                            <p className="text-sm text-gray-500 mt-1">Overview of all emissions sources</p>
                          </div>
                          <div className="border rounded-lg p-4 text-center hover:border-primary hover:shadow-sm transition-all cursor-pointer">
                            <BarChart3 className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                            <h3 className="font-medium">Trend Analysis</h3>
                            <p className="text-sm text-gray-500 mt-1">Historical trends and patterns</p>
                          </div>
                          <div className="border rounded-lg p-4 text-center hover:border-primary hover:shadow-sm transition-all cursor-pointer">
                            <BarChart3 className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                            <h3 className="font-medium">Reduction Roadmap</h3>
                            <p className="text-sm text-gray-500 mt-1">Strategic plan to reduce emissions</p>
                          </div>
                        </div>
                      </div>
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
                      Based on your recent data, your emissions are 8.3% lower than the previous period.
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
                      Analyze current month
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Compare to last year
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Generate summary report
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Get top recommendations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIAssistantPage;
