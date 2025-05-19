
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Mic, PauseCircle, AlertCircle, CheckCircle, Paperclip, ArrowDown } from 'lucide-react';
import { format } from "date-fns";
import { toast } from "sonner";
import { Progress } from '@/components/ui/progress';

// Message types
type MessageRole = 'user' | 'ai' | 'system';

type Message = {
  id: string;
  content: string;
  role: MessageRole;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
  feedback?: 'positive' | 'negative';
  attachments?: string[];
};

type AIStreamChunk = {
  content: string;
  isComplete: boolean;
};

interface AIChatProps {
  startDate?: Date;
  endDate?: Date;
  modelType?: string;
}

const AIChat: React.FC<AIChatProps> = ({ 
  startDate = new Date(2025, 0, 1), 
  endDate = new Date(),
  modelType = 'advanced'
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI sustainability assistant. I can help you analyze emissions data, provide recommendations, and generate reports. How can I assist you today?',
      role: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamProgress, setStreamProgress] = useState(0);
  const [currentStreamedContent, setCurrentStreamedContent] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate streaming AI response
  const simulateStreamResponse = (prompt: string) => {
    // Different responses based on the prompt content
    let response = '';
    let totalChunks = 20;
    
    if (prompt.toLowerCase().includes('emission') || prompt.toLowerCase().includes('data')) {
      response = `Based on the data between ${format(startDate, 'PP')} and ${format(endDate, 'PP')}, emissions have decreased by 8.3% compared to the previous period. The main contributors to this reduction were improved energy efficiency and the partial switch to renewable energy sources.\n\nSpecifically:\n• Energy consumption decreased by 12.5%\n• Transportation emissions reduced by 5.2%\n• Process emissions remained stable with a slight decrease of 1.7%\n\nHowever, there was a notable increase in supply chain emissions (Scope 3) of about 3.4%, primarily due to expanded operations with suppliers in regions with higher carbon intensity electricity grids.`;
    } else if (prompt.toLowerCase().includes('recommend') || prompt.toLowerCase().includes('suggest')) {
      response = `Based on your emission profile and operational patterns, here are my top recommendations:\n\n1. **HVAC Optimization**: Implement smart controls for your heating and cooling systems to reduce energy consumption during non-operational hours. This could yield a 15-20% reduction in related emissions.\n\n2. **Renewable Energy Procurement**: Consider a power purchase agreement (PPA) for renewable energy to cover at least 30% of your electricity needs. This would directly impact your Scope 2 emissions.\n\n3. **Supplier Engagement Program**: Develop a structured program to engage with your top 20 suppliers (by emissions impact) to help them reduce their carbon footprint, which would positively affect your Scope 3 emissions.\n\n4. **Fleet Electrification**: Begin transitioning your logistics and company vehicle fleet to electric alternatives, starting with 25% of the fleet over the next 18 months.\n\nWould you like me to elaborate on any of these recommendations or suggest implementation strategies?`;
    } else if (prompt.toLowerCase().includes('report') || prompt.toLowerCase().includes('summary')) {
      response = `I've generated a summary report for the selected period (${format(startDate, 'PP')} to ${format(endDate, 'PP')}).\n\n**Emissions Overview**:\n• Total emissions: 1,245 tCO2e (↓8.3% vs previous period)\n• Scope 1: 324 tCO2e (26% of total)\n• Scope 2: 598 tCO2e (48% of total)\n• Scope 3: 323 tCO2e (26% of total)\n\n**Key Findings**:\n• Energy efficiency measures implemented in Q1 have shown significant impact\n• The partial renewable energy transition has reduced Scope 2 emissions by 14%\n• New supplier onboarding has increased supply chain emissions slightly\n\n**Recommendations**:\n• Continue energy efficiency program with focus on manufacturing facilities\n• Accelerate renewable energy transition\n• Engage with new suppliers on emission reduction strategies\n\nWould you like me to generate a detailed PDF report or focus on any specific aspect of this summary?`;
    } else if (prompt.toLowerCase().includes('forecast') || prompt.toLowerCase().includes('predict')) {
      response = `Based on current trends and planned initiatives, here's my emissions forecast through the end of 2025:\n\n**Projected Total Emissions**: 4,120 tCO2e (↓12.5% vs 2024)\n\n**Breakdown by Scope**:\n• Scope 1: 1,030 tCO2e (↓8.2% YoY)\n• Scope 2: 1,870 tCO2e (↓18.7% YoY)\n• Scope 3: 1,220 tCO2e (↓7.1% YoY)\n\n**Key Growth Factors**:\n• Planned production increase of 15%\n• New facility opening in Q3\n\n**Key Reduction Factors**:\n• Renewable energy transition (75% completion expected)\n• Process efficiency improvements\n• Fleet electrification program\n\nThe forecast indicates you're on track to meet your 2026 reduction targets, though Scope 3 reductions are slightly behind schedule. Would you like me to suggest focused interventions to accelerate Scope 3 reductions?`;
    } else {
      response = `I understand you're interested in learning more about "${prompt}". How would you like me to help? I can:\n\n• Analyze emissions data for any time period\n• Provide specific recommendations for emission reduction\n• Generate comprehensive reports\n• Forecast future emissions based on various scenarios\n• Simulate the impact of specific initiatives\n\nJust let me know what specific information or assistance you need regarding sustainability and emissions management.`;
    }
    
    // Start streaming
    setIsStreaming(true);
    setCurrentStreamedContent('');
    setStreamProgress(0);
    
    const words = response.split(' ');
    let currentChunk = 0;
    
    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      content: prompt,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Add an empty AI message that will be filled with the streamed content
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      content: '',
      role: 'ai',
      timestamp: new Date(),
      status: 'sending',
    };
    
    setMessages(prev => [...prev, aiMessage]);
    
    // Simulate streaming
    const interval = setInterval(() => {
      if (currentChunk < words.length) {
        // Determine how many words to add in this chunk (random 1-3)
        const wordsToAdd = Math.min(Math.floor(Math.random() * 3) + 1, words.length - currentChunk);
        const newChunk = words.slice(currentChunk, currentChunk + wordsToAdd).join(' ') + ' ';
        
        setCurrentStreamedContent(prev => prev + newChunk);
        
        // Update the AI message in the messages array
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, content: msg.content + newChunk } 
              : msg
          )
        );
        
        currentChunk += wordsToAdd;
        setStreamProgress(Math.min((currentChunk / words.length) * 100, 100));
      } else {
        clearInterval(interval);
        setIsStreaming(false);
        setIsProcessing(false);
        
        // Mark message as sent
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessageId 
              ? { ...msg, status: 'sent' } 
              : msg
          )
        );
      }
    }, 50); // Speed of streaming - adjust as needed
    
    return () => clearInterval(interval);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate API delay and then start streaming
    setTimeout(() => {
      simulateStreamResponse(inputMessage);
      setInputMessage('');
    }, 500);
  };

  const handleFileUpload = () => {
    toast.info("File upload simulation: Analyzing uploaded document...");
    setTimeout(() => {
      toast.success("Document analyzed successfully! Found 32 data points relating to emissions.");
    }, 2500);
  };

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    setMessages(messages.map(message => 
      message.id === messageId ? { ...message, feedback } : message
    ));
    
    toast.success(`Thank you for your feedback! This helps improve the AI assistant.`);
  };

  return (
    <Card className="h-[70vh] flex flex-col">
      <CardHeader>
        <CardTitle>AI Assistant Chat</CardTitle>
        <CardDescription>Ask questions about your emissions data and get insights</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden flex flex-col h-full">
        <div className="flex flex-col space-y-4 overflow-y-auto flex-grow pr-2" ref={chatContainerRef}>
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : message.role === 'system' 
                      ? 'bg-muted text-muted-foreground border border-border' 
                      : 'bg-card text-card-foreground border border-border'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                <div className="flex justify-between items-center mt-2 text-xs opacity-70">
                  <span>{format(message.timestamp, 'h:mm a')}</span>
                  
                  {message.role === 'ai' && message.status === 'sent' && (
                    <div className="flex space-x-2 items-center">
                      <button 
                        onClick={() => handleFeedback(message.id, 'positive')}
                        className={`opacity-60 hover:opacity-100 ${message.feedback === 'positive' ? 'text-green-500 opacity-100' : ''}`}
                        aria-label="Helpful"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleFeedback(message.id, 'negative')}
                        className={`opacity-60 hover:opacity-100 ${message.feedback === 'negative' ? 'text-red-500 opacity-100' : ''}`}
                        aria-label="Not helpful"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isStreaming && (
            <div className="w-full pt-1 pb-3">
              <Progress value={streamProgress} className="h-1" />
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="border-t py-3">
        <div className="flex items-center space-x-2 w-full">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleFileUpload}
            title="Upload a document"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Input 
            placeholder="Ask about your emissions data..." 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isProcessing}
            className="flex-1"
          />
          
          <Button 
            onClick={handleSendMessage} 
            disabled={isProcessing || !inputMessage.trim()}
            className="shrink-0"
          >
            {isProcessing ? <PauseCircle className="h-4 w-4 mr-2 animate-pulse" /> : <Send className="h-4 w-4 mr-2" />}
            Send
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => toast.info("Voice input feature coming soon")}
            title="Voice input"
          >
            <Mic className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AIChat;
