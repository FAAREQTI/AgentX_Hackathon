"use client";

import { useState, useRef, useEffect } from "react";
import { useComplaintWorkflow } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { 
  Send, 
  Mic, 
  Bot, 
  User,
  Loader2,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  Copy,
  Download,
  ThumbsUp,
  ThumbsDown,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    agent?: string;
    step?: string;
    confidence?: number;
  };
}

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "system",
      content: `Welcome to Complaint Intelligence Chat! I'm here to help you file and analyze complaints using our AI-powered system. Please describe your complaint in detail.`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { workflowState, submitComplaint, resetWorkflow } = useComplaintWorkflow();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update messages when workflow progresses
  useEffect(() => {
    if (workflowState.status === 'processing' && workflowState.currentAgent) {
      const agentMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `🤖 ${workflowState.currentAgent} is analyzing your complaint...`,
        timestamp: new Date(),
        metadata: {
          agent: workflowState.currentAgent,
          step: 'processing'
        }
      };
      
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.metadata?.agent === workflowState.currentAgent) {
          return prev; // Don't duplicate agent messages
        }
        return [...prev, agentMessage];
      });
    }

    if (workflowState.status === 'completed' && workflowState.results) {
      const completionMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: generateCompletionMessage(workflowState.results),
        timestamp: new Date(),
        metadata: {
          step: 'completed',
          confidence: 0.95
        }
      };
      
      setMessages(prev => [...prev, completionMessage]);
    }

    if (workflowState.status === 'error') {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'assistant',
        content: `❌ I encountered an error while processing your complaint: ${workflowState.error}. Please try again or contact support if the issue persists.`,
        timestamp: new Date(),
        metadata: {
          step: 'error'
        }
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  }, [workflowState]);

  const generateCompletionMessage = (results: any) => {
    const riskScore = results.risk_assessment?.risk_score || 0;
    const riskCategory = results.risk_assessment?.risk_category || 'medium';
    const similarCount = results.similar_complaints?.length || 0;
    const strategy = results.solution?.primary_solution?.resolution_strategy || 'Standard resolution';

    return `✅ **Analysis Complete!**

📊 **Risk Assessment**: ${riskCategory.toUpperCase()} risk (${(riskScore * 100).toFixed(0)}% score)
🔍 **Similar Cases**: Found ${similarCount} similar complaints in our database
💡 **Recommended Strategy**: ${strategy}
⏱️ **Estimated Resolution**: ${results.solution?.primary_solution?.estimated_resolution_time || 'TBD'}

Your complaint has been processed through our 6-stage AI workflow. You can now view the detailed analysis and generated response letter.`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    // Add processing message
    const processingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '🔄 Starting AI analysis of your complaint...',
      timestamp: new Date(),
      metadata: {
        step: 'starting'
      }
    };

    setMessages(prev => [...prev, processingMessage]);

    // Submit to workflow
    await submitComplaint({
      narrative: inputValue,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = () => {
    setIsRecording(!isRecording);
    // Voice recording implementation would go here
  };

  const handleFeedback = (messageId: string, positive: boolean) => {
    // Feedback implementation would go here
    console.log(`Feedback for message ${messageId}: ${positive ? 'positive' : 'negative'}`);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <Header 
          title="AI Chat Assistant" 
          showNavigation={true}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMobileMenu
        />
        
        <div className="flex-1 flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-4",
                    message.type === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  {message.type !== 'user' && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-primary/10">
                        {message.type === 'system' ? '🤖' : 'AI'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-3",
                      message.type === 'user'
                        ? "bg-primary text-primary-foreground ml-auto"
                        : message.type === 'system'
                        ? "bg-muted/50 border"
                        : "bg-muted border"
                    )}
                  >
                    <div className="space-y-2">
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </div>
                      
                      {message.metadata && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{message.timestamp.toLocaleTimeString()}</span>
                          {message.metadata.agent && (
                            <>
                              <span>•</span>
                              <span className="capitalize">{message.metadata.agent.replace('_', ' ')}</span>
                            </>
                          )}
                          {message.metadata.confidence && (
                            <>
                              <span>•</span>
                              <span>{(message.metadata.confidence * 100).toFixed(0)}% confidence</span>
                            </>
                          )}
                        </div>
                      )}
                      
                      {message.type === 'assistant' && message.metadata?.step === 'completed' && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFeedback(message.id, true)}
                            className="gap-1"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            Helpful
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFeedback(message.id, false)}
                            className="gap-1"
                          >
                            <ThumbsDown className="h-3 w-3" />
                            Not Helpful
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1">
                            <Copy className="h-3 w-3" />
                            Copy
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {message.type === 'user' && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {/* Workflow Progress */}
              {workflowState.status === 'processing' && (
                <div className="flex justify-center">
                  <Card className="w-full max-w-md">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm font-medium">Processing your complaint...</span>
                        </div>
                        <Progress value={workflowState.progress} className="h-2" />
                        <div className="text-xs text-muted-foreground text-center">
                          {workflowState.progress}% complete
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t bg-background p-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe your complaint in detail..."
                    className="pr-12"
                    disabled={workflowState.status === 'processing'}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                    onClick={handleVoiceInput}
                    disabled={workflowState.status === 'processing'}
                  >
                    <Mic className={cn("h-4 w-4", isRecording && "text-destructive animate-pulse")} />
                  </Button>
                </div>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || workflowState.status === 'processing'}
                  className="gap-2"
                >
                  {workflowState.status === 'processing' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send
                </Button>
              </div>
              
              {workflowState.complaint_id && workflowState.status === 'completed' && (
                <div className="flex gap-2 mt-4">
                  <Link href={`/letters?complaint_id=${workflowState.complaint_id}`}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileText className="h-4 w-4" />
                      View Solution Letter
                    </Button>
                  </Link>
                  <Link href="/analytics">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Activity className="h-4 w-4" />
                      View Analytics
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}