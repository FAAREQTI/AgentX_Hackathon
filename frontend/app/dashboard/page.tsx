"use client";

import { useState } from "react";
import { useComplaints, useComplaintStats, useHighRiskAlerts } from "@/hooks/use-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Users,
  FileText,
  Clock,
  ArrowRight,
  Activity,
  Target,
  Zap,
  Shield,
  Bell,
  Settings,
  User,
  Search,
  Filter,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const upcomingTasks = [
  {
    title: "Review high-risk complaint C-2024-156",
    due: "In 30 minutes",
    priority: "high",
    type: "Review"
  },
  {
    title: "Generate response letter for C-2024-155",
    due: "In 2 hours", 
    priority: "medium",
    type: "Generate"
  },
  {
    title: "Weekly compliance report",
    due: "Tomorrow",
    priority: "medium",
    type: "Report"
  },
  {
    title: "Team training session",
    due: "Friday 2 PM",
    priority: "low",
    type: "Training"
  }
];

const notifications = [
  {
    id: "1",
    title: "High-risk complaint detected",
    description: "Complaint C-2024-156 requires immediate attention",
    time: "5 min ago",
    type: "alert",
    read: false
  },
  {
    id: "2", 
    title: "Weekly report generated",
    description: "Your analytics report for this week is ready",
    time: "2 hours ago",
    type: "info",
    read: false
  },
  {
    id: "3",
    title: "System maintenance scheduled",
    description: "Planned maintenance on Sunday 2 AM - 4 AM EST",
    time: "1 day ago",
    type: "warning",
    read: true
  }
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // API hooks
  const { data: complaintsData, loading: complaintsLoading } = useComplaints({ limit: 10 });
  const { data: statsData, loading: statsLoading } = useComplaintStats();
  const { data: alertsData, loading: alertsLoading } = useHighRiskAlerts();

  // Transform API data to match UI expectations
  const quickStats = statsData ? [
    { 
      title: "Total Complaints", 
      value: statsData.total_complaints.toString(), 
      change: "+12%", 
      trend: "up", 
      icon: FileText, 
      color: "text-primary" 
    },
    { 
      title: "Avg Resolution Time", 
      value: `${statsData.avg_resolution_time.toFixed(1)}h`, 
      change: "-23%", 
      trend: "down", 
      icon: Clock, 
      color: "text-success" 
    },
    { 
      title: "High Risk Cases", 
      value: Math.round(statsData.high_risk_percentage).toString(), 
      change: "+2%", 
      trend: "up", 
      icon: AlertTriangle, 
      color: "text-warning" 
    },
    { 
      title: "Satisfaction Score", 
      value: `${statsData.satisfaction_rate.toFixed(1)}%`, 
      change: "+1.4%", 
      trend: "up", 
      icon: CheckCircle, 
      color: "text-success" 
    }
  ] : [];

  const recentComplaints = complaintsData?.map(complaint => ({
    id: `C-${complaint.id}`,
    type: complaint.issue || "Unknown Issue",
    customer: "Customer", // Would need user lookup
    risk: complaint.risk_score ? Math.round(complaint.risk_score * 100) : 50,
    status: "Open", // Would need status field
    time: new Date(complaint.created_at).toLocaleString(),
    priority: complaint.risk_score && complaint.risk_score > 0.7 ? "high" : 
             complaint.risk_score && complaint.risk_score > 0.4 ? "medium" : "low"
  })) || [];

  const getRiskColor = (risk: number) => {
    if (risk >= 70) return "text-destructive";
    if (risk >= 40) return "text-warning";
    return "text-success";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium": return "bg-warning/10 text-warning border-warning/20";
      case "low": return "bg-success/10 text-success border-success/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "bg-destructive/10 text-destructive";
      case "In Progress": return "bg-warning/10 text-warning";
      case "Pending Review": return "bg-primary/10 text-primary";
      case "Resolved": return "bg-success/10 text-success";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <Header 
          title="Dashboard" 
          showNavigation={true}
          showSearch={true}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMobileMenu
        />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Dashboard Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold">Good morning, John 👋</h1>
                  <p className="text-muted-foreground text-lg">Here's what's happening with your complaints today</p>
                </div>
                <div className="flex gap-3">
                  <Link href="/complaint">
                    <Button className="gap-2">
                      <Zap className="h-4 w-4" />
                      New Analysis
                    </Button>
                  </Link>
                  <Link href="/analytics">
                    <Button variant="outline" className="gap-2">
                      <Activity className="h-4 w-4" />
                      View Analytics
                    </Button>
                  </Link>
                </div>
              </div>

              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="complaints">Complaints</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {quickStats.map((stat, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className={cn("h-5 w-5", stat.color)} />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">
                          {statsLoading ? (
                            <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                          ) : (
                            stat.value
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          {stat.trend === 'up' ? (
                            <TrendingUp className={cn("h-3 w-3", 
                              stat.title === "High Risk Cases" ? "text-destructive" : "text-success"
                            )} />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-success" />
                          )}
                          <span className={cn(
                            stat.trend === 'up' 
                              ? stat.title === "High Risk Cases" ? "text-destructive" : "text-success"
                              : "text-success"
                          )}>
                            {stat.change}
                          </span>
                          <span>from yesterday</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Performance Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        Resolution Performance
                      </CardTitle>
                      <CardDescription>Your complaint resolution metrics this week</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Resolved on Time</span>
                          <span className="font-semibold">94%</span>
                        </div>
                        <Progress value={94} className="h-2" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Customer Satisfaction</span>
                          <span className="font-semibold">97%</span>
                        </div>
                        <Progress value={97} className="h-2" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span>Risk Mitigation</span>
                          <span className="font-semibold">89%</span>
                        </div>
                        <Progress value={89} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Compliance Status
                      </CardTitle>
                      <CardDescription>Regulatory compliance overview</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-success rounded-full" />
                          <span className="text-sm">GDPR Compliance</span>
                        </div>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          100%
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-success rounded-full" />
                          <span className="text-sm">SOX Compliance</span>
                        </div>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          98%
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-warning rounded-full" />
                          <span className="text-sm">Industry Standards</span>
                        </div>
                        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                          92%
                        </Badge>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <p className="text-xs text-muted-foreground">
                          Next audit: March 15, 2024
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="complaints" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Recent Complaints</CardTitle>
                      <CardDescription>Latest complaint submissions requiring attention</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Filter
                      </Button>
                      <Link href="/analytics">
                        <Button variant="ghost" size="sm" className="gap-2">
                          View All
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentComplaints.map((complaint, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-mono text-sm font-medium">{complaint.id}</span>
                              <Badge variant="outline" className={getPriorityColor(complaint.priority)}>
                                {complaint.priority}
                              </Badge>
                            </div>
                            <p className="font-medium">{complaint.type}</p>
                            <p className="text-sm text-muted-foreground">Customer: {complaint.customer}</p>
                          </div>
                          <div className="text-right space-y-2">
                            <div className="flex items-center gap-2">
                              <span className={cn("text-sm font-medium", getRiskColor(complaint.risk))}>
                                Risk: {complaint.risk}%
                              </span>
                            </div>
                            <Badge variant="secondary" className={getStatusColor(complaint.status)}>
                              {complaint.status}
                            </Badge>
                            <p className="text-xs text-muted-foreground">{complaint.time}</p>
                          </div>
                          <div className="flex gap-1 ml-4">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {complaintsLoading && (
                        <div className="space-y-4">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                          ))}
                        </div>
                      )}
                      
                      {!complaintsLoading && recentComplaints.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          No complaints found. <Link href="/complaint" className="text-primary hover:underline">File your first complaint</Link>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Resolution Time</CardTitle>
                      <CardDescription>Average time to resolve complaints</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary mb-2">1.8h</div>
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingDown className="h-4 w-4 text-success" />
                        <span className="text-success">-23% from last week</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Satisfaction</CardTitle>
                      <CardDescription>Average satisfaction rating</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-success mb-2">97.2%</div>
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-success">+1.4% from last week</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Mitigation</CardTitle>
                      <CardDescription>Successfully mitigated risks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-warning mb-2">89%</div>
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="h-4 w-4 text-success" />
                        <span className="text-success">+5% from last week</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Upcoming Tasks</CardTitle>
                        <CardDescription>Your scheduled activities</CardDescription>
                      </div>
                      <Button size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Task
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {upcomingTasks.map((task, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className={cn(
                              "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                              task.priority === "high" ? "bg-destructive" :
                              task.priority === "medium" ? "bg-warning" : "bg-success"
                            )} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium leading-tight">{task.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {task.type}
                                </Badge>
                                <span className="text-xs text-muted-foreground">{task.due}</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}