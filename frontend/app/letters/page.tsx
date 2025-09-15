"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { 
  Copy, 
  Download, 
  Edit, 
  Save,
  FileText,
  Lightbulb,
  Clock,
  CheckCircle,
  RefreshCw
} from "lucide-react";

const mockLetter = `Dear [Customer Name],

Thank you for bringing this matter to our attention. We take all customer concerns seriously and have thoroughly investigated your complaint regarding unauthorized charges on your account.

INVESTIGATION FINDINGS:
After reviewing your account activity and transaction history, we have identified the following:

• Transaction Date: March 15, 2024
• Amount: $299.99
• Description: Premium Service Upgrade
• Authorization Status: Not properly verified

RESOLUTION:
We acknowledge that this charge was processed without proper authorization. To resolve this matter:

1. We will immediately reverse the unauthorized charge of $299.99
2. A full refund will be processed to your original payment method within 3-5 business days
3. We have implemented additional verification measures to prevent similar occurrences

NEXT STEPS:
• You will receive a confirmation email once the refund is processed
• Our customer service team will follow up within 48 hours to ensure your satisfaction
• We have added a flag to your account to prevent similar issues in the future

We sincerely apologize for any inconvenience this has caused and appreciate your patience as we worked to resolve this matter. Your trust is important to us, and we are committed to providing you with excellent service.

If you have any questions or concerns about this resolution, please don't hesitate to contact our customer service team at [contact information].

Sincerely,

[Customer Service Manager]
[Company Name]
Customer Relations Department`;

const tips = [
  {
    title: "Similar Cases Resolution",
    content: "In 87% of unauthorized charge cases, immediate refund with apology letter resulted in customer retention.",
    icon: CheckCircle
  },
  {
    title: "Response Time Impact",
    content: "Responding within 24 hours increases customer satisfaction scores by 34%.",
    icon: Clock
  },
  {
    title: "Regulatory Compliance",
    content: "Include specific reference to consumer protection laws and company policy violations to strengthen response.",
    icon: FileText
  }
];

export default function LetterDraft() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [letterContent, setLetterContent] = useState(mockLetter);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(letterContent);
  };

  const handleDownloadPDF = () => {
    // PDF generation would be implemented here
    console.log("Downloading PDF...");
  };

  const handleSave = () => {
    setIsEditing(false);
    // Save logic would be implemented here
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <Header 
          title="AI Solution & Letter Draft" 
          showNavigation={true}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMobileMenu
        />
        
        <div className="flex-1 flex">
          {/* Main Editor */}
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Response Letter</h1>
                  <p className="text-muted-foreground">AI-generated resolution for complaint #C-2024-001</p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCopy}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" onClick={handleDownloadPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  {isEditing ? (
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>

              {/* Complaint Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Complaint Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Issue Type</p>
                      <Badge variant="destructive">Unauthorized Charges</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Risk Level</p>
                      <Badge variant="secondary">High Risk (85%)</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Resolution Strategy</p>
                      <Badge variant="outline">Full Refund + Apology</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Letter Editor */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Generated Response Letter</CardTitle>
                    <Button variant="ghost" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                  <CardDescription>
                    AI-generated response based on complaint analysis and similar case patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      value={letterContent}
                      onChange={(e) => setLetterContent(e.target.value)}
                      rows={20}
                      readOnly={!isEditing}
                      className={`font-mono text-sm leading-relaxed resize-none ${
                        isEditing ? 'bg-background' : 'bg-muted/30'
                      }`}
                    />
                    
                    {isEditing && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Characters: {letterContent.length}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <span>Words: {letterContent.split(' ').length}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button className="flex-1">
                      Send to Customer
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Save as Draft
                    </Button>
                    <Button variant="outline" className="flex-1">
                      Request Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Tips Sidebar */}
          <div className="w-80 border-l bg-muted/30 p-6">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Tips from Similar Cases
                </h3>
                <p className="text-sm text-muted-foreground">
                  Insights based on successful resolutions
                </p>
              </div>
              
              <div className="space-y-4">
                {tips.map((tip, index) => (
                  <Card key={index}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <tip.icon className="h-4 w-4 text-primary" />
                        {tip.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {tip.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Letter Quality Score */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Response Quality</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Empathy</span>
                      <span className="font-semibold">92%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-full bg-success rounded-full" style={{ width: '92%' }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Clarity</span>
                      <span className="font-semibold">88%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-full bg-success rounded-full" style={{ width: '88%' }} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Compliance</span>
                      <span className="font-semibold">95%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-full bg-success rounded-full" style={{ width: '95%' }} />
                    </div>
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