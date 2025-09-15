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
  AlertTriangle,
  FileText,
  Loader2,
  CheckCircle,
  Bot,
  ArrowRight
} from "lucide-react";

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
          {/* Complaint Form */}
          <div className="flex-1 flex flex-col p-6">
            <div className="max-w-4xl mx-auto w-full space-y-6">
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
                      onChange={(e) =>
                        setComplaintForm(prev => ({ ...prev, narrative: e.target.value }))
                      }
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="product">Product (Optional)</Label>
                      <Select
                        value={complaintForm.product}
                        onValueChange={(value) =>
                          setComplaintForm(prev => ({ ...prev, product: value }))
                        }
                      >
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
                      <Select
                        value={complaintForm.issue}
                        onValueChange={(value) =>
                          setComplaintForm(prev => ({ ...prev, issue: value }))
                        }
                      >
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
                        onChange={(e) =>
                          setComplaintForm(prev => ({ ...prev, company: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSubmitComplaint}
                      disabled={
                        !complaintForm.narrative.trim() ||
                        workflowState.status === "processing"
                      }
                      className="flex-1"
                    >
                      {workflowState.status === "processing" ? (
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

              {/* Results Display */}
              {workflowState.results && (
                <div className="space-y-6">
                  {/* Entities */}
                  {workflowState.results.entities &&
                    Object.keys(workflowState.results.entities).length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Extracted Information</CardTitle>
                          <CardDescription>Key details identified by AI</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            {(
                              Object.entries(
                                workflowState.results.entities
                              ) as [string, string | number | boolean | null | undefined][]
                            ).map(([key, value]) =>
                              value ? (
                                <div key={key} className="flex justify-between">
                                  <span className="text-sm font-medium capitalize">
                                    {key.replace("_", " ")}
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {String(value)}
                                  </span>
                                </div>
                              ) : null
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
