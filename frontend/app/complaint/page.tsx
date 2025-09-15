"use client";

import { useState } from "react";
import { useComplaintWorkflow } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { 
  Send, 
  Mic, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle, 
  TrendingUp,
  FileText,
  Clock,
  Bot,
  User,
  Loader2,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ComplaintIntake() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [complaintForm, setComplaintForm] = useState({
    narrative: "",
    product: "",
    issue: "",
    company: ""
  });
  
  const { workflowState, submitComplaint, resetWorkflow } = useComplaintWorkflow();

  const handleSubmitComplaint = async () => {
    if (!complaintForm.narrative.trim()) return;
    
    await submitComplaint({
      narrative: complaintForm.narrative,
      product: complaintForm.product || undefined,
      issue: complaintForm.issue || undefined,
      company: complaintForm.company || undefined,
    });
  };

  const handleReset = () => {
    setComplaintForm({
      narrative: "",
      product: "",
      issue: "",
      company: ""
    });
    resetWorkflow();
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <Header 
          title="Complaint Intake" 
          showNavigation={true}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMobileMenu
        />
        
        <div className="flex-1 flex">
          {/* Chat Interface */}
          <div className="flex-1 flex flex-col p-6">
            <div className="max-w-4xl mx-auto w-full space-y-6">
              {/* Complaint Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    File New Complaint
                  </CardTitle>
                  <CardDescription>
                    Describe your complaint and our AI will analyze it for risk assessment and solution generation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="narrative">Complaint Description *</Label>
                    <Textarea
                      id="narrative"
                      placeholder="Please describe your complaint in detail..."
                      value={complaintForm.narrative}
                      onChange={(e) => setComplaintForm(prev => ({ ...prev, narrative: e.target.value }))}
                      rows={6}
                      className="resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="product">Product (Optional)</Label>
                      <Select value={complaintForm.product} onValueChange={(value) => setComplaintForm(prev => ({ ...prev, product: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="loan">Loan</SelectItem>
                          <SelectItem value="mortgage">Mortgage</SelectItem>
                          <SelectItem value="deposit_account">Deposit Account</SelectItem>
                          <SelectItem value="money_transfer">Money Transfer</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="issue">Issue Type (Optional)</Label>
                      <Select value={complaintForm.issue} onValueChange={(value) => setComplaintForm(prev => ({ ...prev, issue: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select issue" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unauthorized_charges">Unauthorized Charges</SelectItem>
                          <SelectItem value="billing_dispute">Billing Dispute</SelectItem>
                          <SelectItem value="service_quality">Service Quality</SelectItem>
                          <SelectItem value="account_access">Account Access</SelectItem>
                          <SelectItem value="fraud">Fraud</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company">Company (Optional)</Label>
                      <Input
                        id="company"
                        placeholder="Company name"
                        value={complaintForm.company}
                        onChange={(e) => setComplaintForm(prev => ({ ...prev, company: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleSubmitComplaint}
                      disabled={!complaintForm.narrative.trim() || workflowState.status === 'processing'}
                      className="flex-1"
                    >
                      {workflowState.status === 'processing' ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Complaint
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleReset}>
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Workflow Progress */}
              {workflowState.status !== 'idle' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      AI Analysis Progress
                    </CardTitle>
                    <CardDescription>
                      Multi-agent workflow processing your complaint
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Processing Progress</span>
                        <span>{workflowState.progress}%</span>
                      </div>
                      <Progress value={workflowState.progress} className="h-2" />
                    </div>
                    
                    {workflowState.status === 'processing' && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>AI agents are analyzing your complaint...</span>
                      </div>
                    )}
                    
                    {workflowState.status === 'completed' && (
                      <div className="flex items-center gap-2 text-sm text-success">
                        <CheckCircle className="h-4 w-4" />
                        <span>Analysis completed successfully!</span>
                      </div>
                    )}
                    
                    {workflowState.status === 'error' && (
                      <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <span>{workflowState.error}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Agent Communications */}
              {workflowState.agentCommunications && workflowState.agentCommunications.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5" />
                      Agent Communications
                    </CardTitle>
                    <CardDescription>
                      Real-time communication between AI agents
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {workflowState.agentCommunications.map((comm, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <span className="text-primary">{comm.from_agent}</span>
                            <ArrowRight className="h-3 w-3" />
                            <span className="text-accent">{comm.to_agent}</span>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm">{comm.message}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(comm.timestamp * 1000).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Results Display */}
              {workflowState.results && (
                <div className="space-y-6">
                  {/* Entities */}
                  {workflowState.results.entities && Object.keys(workflowState.results.entities).length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Extracted Information</CardTitle>
                        <CardDescription>Key details identified by AI</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(workflowState.results.entities).map(([key, value]) => (
                            value && (
                              <div key={key} className="flex justify-between">
                                <span className="text-sm font-medium capitalize">{key.replace('_', ' ')}</span>
                                <span className="text-sm text-muted-foreground">{String(value)}</span>
                              </div>
                            )
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Risk Assessment */}
                  {workflowState.results.risk_assessment && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          Risk Assessment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span>Risk Score</span>
                            <Badge variant={
                              workflowState.results.risk_assessment.risk_score > 0.7 ? "destructive" :
                              workflowState.results.risk_assessment.risk_score > 0.4 ? "secondary" : "outline"
                            }>
                              {(workflowState.results.risk_assessment.risk_score * 100).toFixed(0)}%
                            </Badge>
                          </div>
                          <Progress value={workflowState.results.risk_assessment.risk_score * 100} />
                          
                          <div className="text-sm text-muted-foreground">
                            Category: <span className="font-medium">{workflowState.results.risk_assessment.risk_category}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Solution Preview */}
                  {workflowState.results.solution && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Generated Solution</CardTitle>
                        <CardDescription>AI-recommended resolution strategy</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <span className="text-sm font-medium">Strategy: </span>
                            <span className="text-sm">{workflowState.results.solution.primary_solution?.resolution_strategy}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Estimated Time: </span>
                            <span className="text-sm">{workflowState.results.solution.primary_solution?.estimated_resolution_time}</span>
                          </div>
                          <Button className="w-full" asChild>
                            <a href={`/letters?complaint_id=${workflowState.complaint_id}`}>
                              View Full Solution & Letter
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Analysis Panel */}
          <div className="w-96 border-l bg-muted/30 p-6 space-y-6">
            {/* Quick Stats */}
            {workflowState.results && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Analysis Results</CardTitle>
                  <CardDescription>Key insights from AI processing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {workflowState.results.similar_complaints && (
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-primary" />
                      <div className="text-sm">
                        <p className="font-medium">{workflowState.results.similar_complaints.length} similar cases</p>
                        <p className="text-muted-foreground">Found in database</p>
                      </div>
                    </div>
                  )}
                  
                  {workflowState.results.risk_assessment && (
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-warning" />
                      <div className="text-sm">
                        <p className="font-medium">{workflowState.results.risk_assessment.risk_category} risk</p>
                        <p className="text-muted-foreground">
                          {(workflowState.results.risk_assessment.risk_score * 100).toFixed(0)}% score
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {workflowState.results.solution && (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <div className="text-sm">
                        <p className="font-medium">Solution generated</p>
                        <p className="text-muted-foreground">
                          {workflowState.results.solution.primary_solution?.resolution_strategy}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}