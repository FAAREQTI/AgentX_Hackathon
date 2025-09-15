"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  FileText,
  Download,
  Eye,
  Calendar,
  Users,
  Lock,
  Globe,
  Award,
  TrendingUp,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

const complianceMetrics = [
  { title: "Overall Compliance", value: "98.2%", change: "+1.2%", trend: "up", icon: Shield, color: "text-success" },
  { title: "Active Audits", value: "3", change: "0", trend: "stable", icon: Activity, color: "text-primary" },
  { title: "Pending Reviews", value: "12", change: "-5", trend: "down", icon: Clock, color: "text-warning" },
  { title: "Violations", value: "2", change: "-3", trend: "down", icon: AlertTriangle, color: "text-destructive" }
];

const regulations = [
  {
    name: "GDPR",
    description: "General Data Protection Regulation",
    compliance: 100,
    status: "Compliant",
    lastAudit: "2024-01-10",
    nextReview: "2024-04-10",
    requirements: 47,
    violations: 0
  },
  {
    name: "CCPA",
    description: "California Consumer Privacy Act", 
    compliance: 98,
    status: "Compliant",
    lastAudit: "2024-01-05",
    nextReview: "2024-04-05",
    requirements: 32,
    violations: 1
  },
  {
    name: "SOX",
    description: "Sarbanes-Oxley Act",
    compliance: 96,
    status: "Minor Issues",
    lastAudit: "2023-12-20",
    nextReview: "2024-03-20",
    requirements: 28,
    violations: 2
  },
  {
    name: "PCI DSS",
    description: "Payment Card Industry Data Security Standard",
    compliance: 100,
    status: "Compliant",
    lastAudit: "2024-01-15",
    nextReview: "2024-07-15",
    requirements: 12,
    violations: 0
  }
];

const auditHistory = [
  {
    id: "AUD-2024-001",
    regulation: "GDPR",
    auditor: "External Compliance Corp",
    date: "2024-01-10",
    duration: "5 days",
    status: "Completed",
    score: 100,
    findings: 0,
    recommendations: 2
  },
  {
    id: "AUD-2024-002", 
    regulation: "CCPA",
    auditor: "Internal Audit Team",
    date: "2024-01-05",
    duration: "3 days",
    status: "Completed",
    score: 98,
    findings: 1,
    recommendations: 3
  },
  {
    id: "AUD-2023-015",
    regulation: "SOX",
    auditor: "External Compliance Corp",
    date: "2023-12-20",
    duration: "7 days", 
    status: "Completed",
    score: 96,
    findings: 2,
    recommendations: 5
  }
];

const upcomingDeadlines = [
  {
    title: "GDPR Annual Review",
    date: "2024-04-10",
    daysLeft: 85,
    priority: "medium",
    description: "Annual compliance review and documentation update"
  },
  {
    title: "SOX Quarterly Assessment",
    date: "2024-03-20",
    daysLeft: 64,
    priority: "high",
    description: "Quarterly financial controls assessment"
  },
  {
    title: "CCPA Data Mapping Update",
    date: "2024-04-05",
    daysLeft: 80,
    priority: "medium",
    description: "Update consumer data processing maps"
  },
  {
    title: "PCI DSS Vulnerability Scan",
    date: "2024-02-15",
    daysLeft: 30,
    priority: "high",
    description: "Quarterly vulnerability assessment"
  }
];

export default function Compliance() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedRegulation, setSelectedRegulation] = useState("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState("12m");

  const getComplianceColor = (score: number) => {
    if (score >= 98) return "text-success";
    if (score >= 90) return "text-warning";
    return "text-destructive";
  };

  const getComplianceBg = (score: number) => {
    if (score >= 98) return "bg-success/10 border-success/20";
    if (score >= 90) return "bg-warning/10 border-warning/20";
    return "bg-destructive/10 border-destructive/20";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Compliant": return "bg-success text-success-foreground";
      case "Minor Issues": return "bg-warning text-warning-foreground";
      case "Non-Compliant": return "bg-destructive text-destructive-foreground";
      case "Under Review": return "bg-primary text-primary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium": return "bg-warning/10 text-warning border-warning/20";
      case "low": return "bg-success/10 text-success border-success/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <Header 
          title="Compliance Management" 
          showNavigation={true}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMobileMenu
        />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
                <p className="text-muted-foreground text-lg">Monitor regulatory compliance and audit status</p>
              </div>
              
              <div className="flex gap-3">
                <Select value={selectedRegulation} onValueChange={setSelectedRegulation}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regulations</SelectItem>
                    <SelectItem value="gdpr">GDPR</SelectItem>
                    <SelectItem value="ccpa">CCPA</SelectItem>
                    <SelectItem value="sox">SOX</SelectItem>
                    <SelectItem value="pci">PCI DSS</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3m">Last 3 months</SelectItem>
                    <SelectItem value="6m">Last 6 months</SelectItem>
                    <SelectItem value="12m">Last 12 months</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* Compliance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {complianceMetrics.map((metric, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                    <metric.icon className={cn("h-5 w-5", metric.color)} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{metric.value}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      {metric.trend === 'up' ? (
                        <TrendingUp className={cn("h-3 w-3", 
                          metric.title.includes("Violations") ? "text-destructive" : "text-success"
                        )} />
                      ) : metric.trend === 'down' ? (
                        <TrendingUp className="h-3 w-3 text-success rotate-180" />
                      ) : (
                        <Activity className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span className={cn(
                        metric.trend === 'up' 
                          ? metric.title.includes("Violations") ? "text-destructive" : "text-success"
                          : metric.trend === 'down' ? "text-success" : "text-muted-foreground"
                      )}>
                        {metric.change}
                      </span>
                      <span>from last period</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="regulations" className="space-y-6">
              <TabsList>
                <TabsTrigger value="regulations">Regulations</TabsTrigger>
                <TabsTrigger value="audits">Audit History</TabsTrigger>
                <TabsTrigger value="deadlines">Upcoming Deadlines</TabsTrigger>
              </TabsList>

              <TabsContent value="regulations" className="space-y-6">
                <div className="grid gap-6">
                  {regulations.map((regulation, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Globe className="h-5 w-5 text-primary" />
                                {regulation.name}
                              </div>
                              <Badge className={getStatusColor(regulation.status)}>
                                {regulation.status}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {regulation.description}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className={cn("text-3xl font-bold", getComplianceColor(regulation.compliance))}>
                              {regulation.compliance}%
                            </div>
                            <p className="text-sm text-muted-foreground">Compliance Score</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Compliance Level</span>
                              <span className={getComplianceColor(regulation.compliance)}>
                                {regulation.compliance}%
                              </span>
                            </div>
                            <Progress value={regulation.compliance} className="h-2" />
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Requirements</p>
                              <p className="font-semibold">{regulation.requirements}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Violations</p>
                              <p className={cn("font-semibold", 
                                regulation.violations === 0 ? "text-success" : "text-destructive"
                              )}>
                                {regulation.violations}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Last Audit</p>
                              <p className="font-semibold">{regulation.lastAudit}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Next Review</p>
                              <p className="font-semibold">{regulation.nextReview}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" className="gap-2">
                              <Eye className="h-3 w-3" />
                              View Details
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2">
                              <FileText className="h-3 w-3" />
                              Documentation
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2">
                              <Download className="h-3 w-3" />
                              Export Report
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="audits" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Audit History
                    </CardTitle>
                    <CardDescription>Recent compliance audits and assessments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {auditHistory.map((audit, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-mono text-sm font-medium">{audit.id}</span>
                                <Badge variant="outline">{audit.regulation}</Badge>
                                <Badge className={getStatusColor(audit.status)}>
                                  {audit.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">Auditor: {audit.auditor}</p>
                            </div>
                            <div className="text-right">
                              <div className={cn("text-2xl font-bold", getComplianceColor(audit.score))}>
                                {audit.score}%
                              </div>
                              <p className="text-xs text-muted-foreground">Score</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Date</p>
                              <p className="font-semibold">{audit.date}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Duration</p>
                              <p className="font-semibold">{audit.duration}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Findings</p>
                              <p className={cn("font-semibold", 
                                audit.findings === 0 ? "text-success" : "text-warning"
                              )}>
                                {audit.findings}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Recommendations</p>
                              <p className="font-semibold">{audit.recommendations}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline" className="gap-2">
                              <Eye className="h-3 w-3" />
                              View Report
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2">
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="deadlines" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Upcoming Deadlines
                    </CardTitle>
                    <CardDescription>Important compliance dates and milestones</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingDeadlines.map((deadline, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className="font-semibold">{deadline.title}</h4>
                                <Badge variant="outline" className={getPriorityColor(deadline.priority)}>
                                  {deadline.priority} priority
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{deadline.description}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span>Due: {deadline.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>{deadline.daysLeft} days left</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={cn("text-2xl font-bold", 
                                deadline.daysLeft <= 30 ? "text-destructive" : 
                                deadline.daysLeft <= 60 ? "text-warning" : "text-success"
                              )}>
                                {deadline.daysLeft}
                              </div>
                              <p className="text-xs text-muted-foreground">Days Left</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="gap-2">
                              <Eye className="h-3 w-3" />
                              View Details
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2">
                              <Users className="h-3 w-3" />
                              Assign Team
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}