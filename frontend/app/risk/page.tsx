"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Shield,
  Target,
  Activity,
  Clock,
  DollarSign,
  Users,
  FileText,
  Zap,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

const riskMetrics = [
  { title: "Overall Risk Score", value: "67", change: "-5%", trend: "down", icon: AlertTriangle, color: "text-warning" },
  { title: "High Risk Cases", value: "23", change: "+12%", trend: "up", icon: Shield, color: "text-destructive" },
  { title: "Potential Exposure", value: "$2.4M", change: "-18%", trend: "down", icon: DollarSign, color: "text-success" },
  { title: "Mitigation Rate", value: "89%", change: "+7%", trend: "up", icon: Target, color: "text-success" }
];

const riskCategories = [
  {
    category: "Financial Risk",
    score: 78,
    trend: "up",
    cases: 45,
    exposure: "$1.2M",
    description: "Unauthorized charges, billing disputes, refund requests"
  },
  {
    category: "Regulatory Risk", 
    score: 65,
    trend: "down",
    cases: 23,
    exposure: "$800K",
    description: "Compliance violations, data privacy issues"
  },
  {
    category: "Reputational Risk",
    score: 52,
    trend: "down", 
    cases: 34,
    exposure: "$400K",
    description: "Service quality, customer experience issues"
  },
  {
    category: "Operational Risk",
    score: 43,
    trend: "stable",
    cases: 18,
    exposure: "$200K", 
    description: "System failures, process breakdowns"
  }
];

const highRiskCases = [
  {
    id: "C-2024-089",
    type: "Data Breach Claim",
    customer: "Enterprise Corp",
    riskScore: 95,
    exposure: "$500K",
    probability: 85,
    timeToEscalation: "2 days",
    status: "Critical"
  },
  {
    id: "C-2024-087",
    type: "Unauthorized Charges",
    customer: "John Smith",
    riskScore: 88,
    exposure: "$50K",
    probability: 72,
    timeToEscalation: "5 days",
    status: "High"
  },
  {
    id: "C-2024-085",
    type: "Service Outage",
    customer: "Tech Solutions Ltd",
    riskScore: 82,
    exposure: "$200K",
    probability: 68,
    timeToEscalation: "7 days",
    status: "High"
  },
  {
    id: "C-2024-083",
    type: "Privacy Violation",
    customer: "Healthcare Inc",
    riskScore: 79,
    exposure: "$300K",
    probability: 65,
    timeToEscalation: "10 days",
    status: "Medium"
  }
];

const riskFactors = [
  { factor: "Customer Tier", weight: 25, impact: "High-value customers increase exposure" },
  { factor: "Issue Complexity", weight: 20, impact: "Complex issues harder to resolve quickly" },
  { factor: "Regulatory Scope", weight: 20, impact: "Compliance violations carry penalties" },
  { factor: "Historical Patterns", weight: 15, impact: "Past escalations predict future risk" },
  { factor: "Response Time", weight: 12, impact: "Delayed responses increase dissatisfaction" },
  { factor: "Communication Quality", weight: 8, impact: "Poor communication escalates issues" }
];

export default function RiskAssessment() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const getRiskColor = (score: number) => {
    if (score >= 80) return "text-destructive";
    if (score >= 60) return "text-warning";
    if (score >= 40) return "text-primary";
    return "text-success";
  };

  const getRiskBg = (score: number) => {
    if (score >= 80) return "bg-destructive/10 border-destructive/20";
    if (score >= 60) return "bg-warning/10 border-warning/20";
    if (score >= 40) return "bg-primary/10 border-primary/20";
    return "bg-success/10 border-success/20";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Critical": return "bg-destructive text-destructive-foreground";
      case "High": return "bg-warning text-warning-foreground";
      case "Medium": return "bg-primary text-primary-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <Header 
          title="Risk Assessment" 
          showNavigation={true}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMobileMenu
        />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Controls */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">Risk Assessment Dashboard</h1>
                <p className="text-muted-foreground text-lg">Monitor and analyze complaint risk factors in real-time</p>
              </div>
              
              <div className="flex gap-3">
                <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="regulatory">Regulatory</SelectItem>
                    <SelectItem value="reputational">Reputational</SelectItem>
                    <SelectItem value="operational">Operational</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button className="gap-2">
                  <Activity className="h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </div>

            {/* Risk Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {riskMetrics.map((metric, index) => (
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
                          metric.title.includes("Risk") || metric.title.includes("Cases") ? "text-destructive" : "text-success"
                        )} />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-success" />
                      )}
                      <span className={cn(
                        metric.trend === 'up' 
                          ? metric.title.includes("Risk") || metric.title.includes("Cases") ? "text-destructive" : "text-success"
                          : "text-success"
                      )}>
                        {metric.change}
                      </span>
                      <span>from last period</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Risk Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Risk Categories Analysis
                </CardTitle>
                <CardDescription>Breakdown of risk by category with trend analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {riskCategories.map((category, index) => (
                    <div key={index} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{category.category}</h4>
                            <Badge variant="outline" className={getRiskBg(category.score)}>
                              Score: {category.score}
                            </Badge>
                            {category.trend === 'up' ? (
                              <TrendingUp className="h-4 w-4 text-destructive" />
                            ) : category.trend === 'down' ? (
                              <TrendingDown className="h-4 w-4 text-success" />
                            ) : (
                              <Activity className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>{category.cases} cases</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>{category.exposure} exposure</span>
                            </div>
                          </div>
                        </div>
                        <div className="w-32">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Risk Level</span>
                            <span className={getRiskColor(category.score)}>{category.score}%</span>
                          </div>
                          <Progress value={category.score} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* High Risk Cases */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      High Risk Cases
                    </CardTitle>
                    <CardDescription>Cases requiring immediate attention and monitoring</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {highRiskCases.map((case_, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="font-mono text-sm font-medium">{case_.id}</span>
                                <Badge className={getStatusColor(case_.status)}>
                                  {case_.status}
                                </Badge>
                              </div>
                              <h4 className="font-semibold">{case_.type}</h4>
                              <p className="text-sm text-muted-foreground">Customer: {case_.customer}</p>
                            </div>
                            <div className="text-right">
                              <div className={cn("text-2xl font-bold", getRiskColor(case_.riskScore))}>
                                {case_.riskScore}%
                              </div>
                              <p className="text-xs text-muted-foreground">Risk Score</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Exposure</p>
                              <p className="font-semibold">{case_.exposure}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Probability</p>
                              <p className="font-semibold">{case_.probability}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Time to Escalation</p>
                              <p className="font-semibold">{case_.timeToEscalation}</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline" className="gap-2">
                              <Eye className="h-3 w-3" />
                              Review
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2">
                              <Zap className="h-3 w-3" />
                              Mitigate
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Risk Factors */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Risk Factors
                    </CardTitle>
                    <CardDescription>Key factors influencing risk assessment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {riskFactors.map((factor, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{factor.factor}</span>
                            <span className="text-sm text-muted-foreground">{factor.weight}%</span>
                          </div>
                          <Progress value={factor.weight} className="h-1" />
                          <p className="text-xs text-muted-foreground">{factor.impact}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Risk Mitigation Actions */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-success" />
                      Mitigation Actions
                    </CardTitle>
                    <CardDescription>Recommended risk reduction strategies</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-success/5 rounded-lg border border-success/20">
                        <div className="w-2 h-2 bg-success rounded-full mt-2" />
                        <div>
                          <p className="text-sm font-medium">Prioritize High-Value Customers</p>
                          <p className="text-xs text-muted-foreground">Focus on enterprise clients to reduce exposure</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-warning/5 rounded-lg border border-warning/20">
                        <div className="w-2 h-2 bg-warning rounded-full mt-2" />
                        <div>
                          <p className="text-sm font-medium">Improve Response Times</p>
                          <p className="text-xs text-muted-foreground">Reduce average response time by 30%</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                        <div>
                          <p className="text-sm font-medium">Enhance Training</p>
                          <p className="text-xs text-muted-foreground">Improve agent communication skills</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}