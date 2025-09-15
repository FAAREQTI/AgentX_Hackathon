"use client";

import { useState } from "react";
import Link from "next/link";
import { useComplaintStats, useBenchmarks } from "@/hooks/use-api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  FileText,
  Clock,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState("all");
  const [dateRange, setDateRange] = useState("30d");

  // API hooks
  const { data: statsData, loading: statsLoading, error: statsError } = useComplaintStats();
  const { data: benchmarkData, loading: benchmarkLoading } = useBenchmarks();

  // Transform API data
  const overview = statsData ? [
    { title: "Total Complaints", value: statsData.total_complaints.toString(), change: "+12%", trend: "up", icon: FileText },
    { title: "Avg Resolution Time", value: `${statsData.avg_resolution_time.toFixed(1)}h`, change: "-8%", trend: "down", icon: Clock },
    { title: "Customer Satisfaction", value: `${statsData.satisfaction_rate.toFixed(0)}%`, change: "+3%", trend: "up", icon: CheckCircle },
    { title: "High Risk Cases", value: Math.round(statsData.high_risk_percentage).toString(), change: "+5%", trend: "up", icon: AlertTriangle }
  ] : [];

  const topIssues = statsData?.top_issues?.map(issue => ({
    issue: issue.issue,
    count: issue.count,
    risk: issue.count > 100 ? "high" : issue.count > 50 ? "medium" : "low"
  })) || [];

  const getRiskColor = (risk: string | number) => {
    if (typeof risk === 'string') {
      switch (risk) {
        case 'high': return 'text-destructive';
        case 'medium': return 'text-warning';
        case 'low': return 'text-success';
        default: return 'text-muted-foreground';
      }
    } else {
      if (risk >= 70) return 'text-destructive';
      if (risk >= 40) return 'text-warning';
      return 'text-success';
    }
  };

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <Header 
          title="Analytics Dashboard" 
          showNavigation={true}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMobileMenu
        />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h1 className="text-2xl font-bold">Analytics Overview</h1>
                <p className="text-muted-foreground">Comprehensive complaint insights and trends</p>
              </div>
              
              <div className="flex gap-3">
                <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Select tenant" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tenants</SelectItem>
                    <SelectItem value="tenant1">Acme Corp</SelectItem>
                    <SelectItem value="tenant2">Global Ltd</SelectItem>
                    <SelectItem value="tenant3">Tech Inc</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>

            {/* Alert Banner */}
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium text-foreground">
                    Spike in High-Risk Complaints Detected
                  </p>
                  <Link href="/complaint" className="text-sm text-primary hover:underline">
                    23% increase in unauthorized charge complaints in the last 24 hours. View details →
                  </Link>
                </div>
              </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overview.map((item, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {statsLoading ? (
                        <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                      ) : (
                        item.value
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      {item.trend === 'up' ? (
                        <TrendingUp className={cn("h-3 w-3", item.title === "High Risk Cases" ? "text-destructive" : "text-success")} />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-success" />
                      )}
                      <span className={cn(
                        item.trend === 'up' 
                          ? item.title === "High Risk Cases" ? "text-destructive" : "text-success"
                          : "text-success"
                      )}>
                        {item.change}
                      </span>
                      <span>from last period</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Issues */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Complaint Issues</CardTitle>
                  <CardDescription>Most frequent complaint categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topIssues.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{item.issue}</p>
                          <p className="text-sm text-muted-foreground">{item.count} complaints</p>
                        </div>
                        <Badge variant={getRiskBadgeVariant(item.risk)} className="ml-2">
                          {item.risk} risk
                        </Badge>
                      </div>
                    ))}
                    
                    {statsLoading && (
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                        ))}
                      </div>
                    )}
                    
                    {!statsLoading && topIssues.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No complaint data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Industry Benchmarks */}
              <Card>
                <CardHeader>
                  <CardTitle>Industry Benchmarks</CardTitle>
                  <CardDescription>Performance vs industry average</CardDescription>
                </CardHeader>
                <CardContent>
                  {benchmarkLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                      ))}
                    </div>
                  ) : benchmarkData ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Resolution Time</span>
                        <div className="text-right">
                          <p className="text-sm font-bold text-success">
                            {benchmarkData.tenant_performance.avg_resolution_time}h
                          </p>
                          <p className="text-xs text-muted-foreground">
                            vs {benchmarkData.industry_average.avg_resolution_time}h industry
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Satisfaction Rate</span>
                        <div className="text-right">
                          <p className="text-sm font-bold text-success">
                            {benchmarkData.tenant_performance.satisfaction_rate}%
                          </p>
                          <p className="text-xs text-muted-foreground">
                            vs {benchmarkData.industry_average.satisfaction_rate}% industry
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No benchmark data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Heatmap Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Heatmap</CardTitle>
                <CardDescription>Complaint risk levels across different categories and time periods</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Interactive heatmap visualization would be rendered here</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Table */}
            <Card>
              <CardHeader>
                <CardTitle>Recent High-Risk Complaints</CardTitle>
                <CardDescription>Latest complaints requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                    <span>ID</span>
                    <span>Issue Type</span>
                    <span>Risk Level</span>
                    <span>Status</span>
                    <span>Time</span>
                  </div>
                  {[
                    { id: "C-2024-001", issue: "Unauthorized Charges", risk: 85, status: "Open", time: "2h ago" },
                    { id: "C-2024-002", issue: "Service Quality", risk: 67, status: "In Progress", time: "4h ago" },
                    { id: "C-2024-003", issue: "Billing Dispute", risk: 45, status: "Resolved", time: "6h ago" },
                    { id: "C-2024-004", issue: "Account Access", risk: 78, status: "Open", time: "8h ago" }
                  ].map((item, index) => (
                    <div key={index} className="grid grid-cols-5 gap-4 text-sm py-2 hover:bg-muted/50 rounded-md -mx-2 px-2">
                      <span className="font-mono">{item.id}</span>
                      <span>{item.issue}</span>
                      <span className={getRiskColor(item.risk)}>{item.risk}%</span>
                      <Badge variant={item.status === "Resolved" ? "outline" : item.status === "Open" ? "destructive" : "secondary"}>
                        {item.status}
                      </Badge>
                      <span className="text-muted-foreground">{item.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
