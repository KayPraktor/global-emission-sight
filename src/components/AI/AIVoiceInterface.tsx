
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Volume2, StopCircle, Play, Headphones, Settings } from 'lucide-react';
import { toast } from "sonner";
import { Progress } from '@/components/ui/progress';

const AIVoiceInterface: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [processingStage, setProcessingStage] = useState<'inactive' | 'listening' | 'analyzing' | 'responding'>('inactive');
  const [processingProgress, setProcessingProgress] = useState(0);

  // Simulate voice recognition
  const startListening = () => {
    setIsListening(true);
    setProcessingStage('listening');
    setTranscript('');
    setResponse(null);
    
    // Simulate progress
    const interval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // After "listening" is complete, move to "analyzing"
          setTimeout(() => {
            setIsListening(false);
            setIsProcessing(true);
            setProcessingStage('analyzing');
            setProcessingProgress(0);
            
            // Set simulated transcript
            setTranscript("What's our current emission reduction progress compared to last quarter?");
            
            // Simulate analysis progress
            const analysisInterval = setInterval(() => {
              setProcessingProgress(prev => {
                if (prev >= 100) {
                  clearInterval(analysisInterval);
                  
                  // After "analyzing" is complete, move to "responding"
                  setTimeout(() => {
                    setIsProcessing(false);
                    setIsSpeaking(true);
                    setProcessingStage('responding');
                    setProcessingProgress(0);
                    
                    // Set simulated response
                    setResponse("Based on the data from the last quarter, your emissions have decreased by 12.3% overall. This is primarily due to the renewable energy initiative you implemented, which contributed to an 18% reduction in Scope 2 emissions. However, your Scope 3 emissions from the supply chain have only decreased by 5.7%, which is below your quarterly target of 8%. Would you like me to suggest some strategies to improve your supply chain emissions?");
                    
                    // Simulate speaking progress
                    const speakingInterval = setInterval(() => {
                      setProcessingProgress(prev => {
                        if (prev >= 100) {
                          clearInterval(speakingInterval);
                          
                          // After "speaking" is complete, reset
                          setTimeout(() => {
                            setIsSpeaking(false);
                            setProcessingStage('inactive');
                            setProcessingProgress(0);
                          }, 500);
                          return 100;
                        }
                        return prev + 2;
                      });
                    }, 200);
                    
                  }, 500);
                  return 100;
                }
                return prev + 5;
              });
            }, 100);
            
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const stopCurrentAction = () => {
    if (isListening) {
      setIsListening(false);
      toast.info("Voice recording stopped");
    } else if (isProcessing) {
      setIsProcessing(false);
      toast.info("Processing cancelled");
    } else if (isSpeaking) {
      setIsSpeaking(false);
      toast.info("Audio response stopped");
    }
    
    setProcessingStage('inactive');
    setProcessingProgress(0);
  };

  const playDemoResponse = () => {
    if (!response) return;
    
    setIsSpeaking(true);
    setProcessingStage('responding');
    setProcessingProgress(0);
    
    // Simulate speaking progress
    const speakingInterval = setInterval(() => {
      setProcessingProgress(prev => {
        if (prev >= 100) {
          clearInterval(speakingInterval);
          
          // After "speaking" is complete, reset
          setTimeout(() => {
            setIsSpeaking(false);
            setProcessingStage('inactive');
            setProcessingProgress(0);
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 200);
  };

  const getStatusBadge = () => {
    switch (processingStage) {
      case 'listening':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Listening...</Badge>;
      case 'analyzing':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Analyzing...</Badge>;
      case 'responding':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Responding...</Badge>;
      default:
        return <Badge variant="outline">Ready</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Voice Assistant</CardTitle>
            <CardDescription>Interact with your AI assistant using voice</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center justify-center py-10 border rounded-lg border-dashed">
          {processingStage === 'inactive' ? (
            <Button 
              onClick={startListening} 
              className="h-16 w-16 rounded-full flex items-center justify-center mb-4"
            >
              <Mic className="h-6 w-6" />
            </Button>
          ) : (
            <Button 
              onClick={stopCurrentAction}
              variant="destructive" 
              className="h-16 w-16 rounded-full flex items-center justify-center mb-4"
            >
              <StopCircle className="h-6 w-6" />
            </Button>
          )}
          
          <p className="text-center text-sm text-muted-foreground">
            {processingStage === 'inactive' 
              ? "Click to start speaking" 
              : processingStage === 'listening' 
                ? "Listening to your question..." 
                : processingStage === 'analyzing' 
                  ? "Processing your request..." 
                  : "Speaking response..."}
          </p>
          
          {processingStage !== 'inactive' && (
            <div className="w-3/4 mt-4">
              <Progress value={processingProgress} className="h-2" />
            </div>
          )}
        </div>
        
        {transcript && (
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Mic className="h-4 w-4 mr-1 text-blue-500" />
              Your question
            </h3>
            <p className="text-sm">{transcript}</p>
          </div>
        )}
        
        {response && (
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2 flex items-center justify-between">
              <div className="flex items-center">
                <Volume2 className="h-4 w-4 mr-1 text-green-500" />
                Assistant response
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={playDemoResponse}
                disabled={isSpeaking}
                className="h-6 px-2"
              >
                <Headphones className="h-3 w-3 mr-1" />
                <span className="text-xs">Replay</span>
              </Button>
            </h3>
            <p className="text-sm">{response}</p>
          </div>
        )}
        
        <div className="flex justify-between pt-4">
          <Button variant="outline" size="sm" className="flex items-center">
            <Settings className="h-4 w-4 mr-1" />
            Voice Settings
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => toast.info("Demo version uses simulated responses. In production, this would save the conversation.")}
          >
            Save Conversation
          </Button>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 pb-4 bg-muted/30">
        <div className="w-full text-xs text-muted-foreground">
          <p>Voice assistant is currently using simulated responses. Connect to a voice API like ElevenLabs for production use.</p>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AIVoiceInterface;
