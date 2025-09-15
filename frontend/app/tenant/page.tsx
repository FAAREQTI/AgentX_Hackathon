"use client";

import { useState } from "react";
import { useTenantUsers, useAuditLogs } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { 
  Building2, 
  Users, 
  Settings,
  Shield,
  Activity,
  TrendingUp,
  BarChart3,
  Globe,
  Lock,
  Database,
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock,
  FileText,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const tenantMetrics = [
  { title: "Total Users", value: "247", change: "+12%", trend: "up", icon: Users, color: "text-primary" },
  { title: "Active Sessions", value: "89", change: "+5%", trend: "up", icon: Activity, color: "text-success" },
  { title: "Storage Used", value: "2.4GB", change: "+18%", trend: "up", icon: Database, color: "text-warning" },
  { title: "API Calls", value: "15.2K", change: "+23%", trend: "up", icon: Zap, color: "text-accent" }
];

const tenantSettings = {
  name: "Acme Corporation",
  domain: "acme.com",
  industry: "Financial Services",
  region: "North America",
  plan: "Enterprise",
  users: 247,
  maxUsers: 500,
  features: ["AI Analysis", "Risk Assessment", "Compliance", "Multi-language", "API Access"],
  compliance: ["GDPR", "CCPA", "SOX", "PCI DSS"],
  integrations: ["Salesforce", "ServiceNow", "Slack", "Microsoft Teams"]
};

export default function TenantManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  const { data: usersData, loading: usersLoading } = useTenantUsers();
  const { data: auditData, loading: auditLoading } = useAuditLogs({ limit: 20 });

  const filteredUsers = usersData?.filter(user => {
    const matchesSearch = user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  }) || [];

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "analyst": return "secondary";
      case "consumer": return "outline";
      default: return "secondary";
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "success" : "secondary";
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <Header 
          title="Tenant Management" 
          showNavigation={true}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMobileMenu
        />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">Tenant Overview</h1>
                <p className="text-muted-foreground text-lg">Manage your organization settings and users</p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Tenant Settings
                </Button>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
              </div>
            </div>

            {/* Tenant Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tenantMetrics.map((metric, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                    <metric.icon className={cn("h-5 w-5", metric.color)} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{metric.value}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <TrendingUp className={cn("h-3 w-3", 
                        metric.title === "Storage Used" ? "text-warning" : "text-success"
                      )} />
                      <span className={cn(
                        metric.title === "Storage Used" ? "text-warning" : "text-success"
                      )}>
                        {metric.change}
                      </span>
                      <span>from last month</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
                <TabsTrigger value="audit">Audit Logs</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-primary" />
                        Organization Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Organization</p>
                          <p className="font-semibold">{tenantSettings.name}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Domain</p>
                          <p className="font-semibold">{tenantSettings.domain}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Industry</p>
                          <p className="font-semibold">{tenantSettings.industry}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Region</p>
                          <p className="font-semibold">{tenantSettings.region}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Plan</p>
                          <Badge variant="outline" className="bg-primary/10 text-primary">
                            {tenantSettings.plan}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Users</p>
                          <p className="font-semibold">{tenantSettings.users}/{tenantSettings.maxUsers}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-success" />
                        Compliance Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {tenantSettings.compliance.map((standard, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{standard}</span>
                            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Compliant
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Active Features</CardTitle>
                    <CardDescription>Features enabled for your organization</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {tenantSettings.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="bg-primary/5 text-primary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="consumer">Consumer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b bg-muted/30">
                          <tr>
                            <th className="text-left p-4 font-medium">User</th>
                            <th className="text-left p-4 font-medium">Role</th>
                            <th className="text-left p-4 font-medium">Status</th>
                            <th className="text-left p-4 font-medium">Last Active</th>
                            <th className="text-right p-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-muted/50">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {user.first_name[0]}{user.last_name[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">{user.first_name} {user.last_name}</p>
                                    <p className="text-sm text-muted-foreground">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge variant={getRoleColor(user.role) as any}>
                                  {user.role}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <Badge variant={getStatusColor(user.is_active) as any}>
                                  {user.is_active ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <span className="text-sm text-muted-foreground">
                                  {new Date(user.created_at).toLocaleDateString()}
                                </span>
                              </td>
                              <td className="p-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit User
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Shield className="h-4 w-4 mr-2" />
                                      Manage Permissions
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Deactivate
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Organization Settings</CardTitle>
                      <CardDescription>Basic organization information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="orgName">Organization Name</Label>
                        <Input id="orgName" defaultValue={tenantSettings.name} />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="domain">Domain</Label>
                        <Input id="domain" defaultValue={tenantSettings.domain} />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Select defaultValue="financial">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="financial">Financial Services</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button className="w-full">Save Changes</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Security & Compliance</CardTitle>
                      <CardDescription>Security settings and compliance status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Data Encryption</span>
                          <Badge variant="outline" className="bg-success/10 text-success">
                            <Lock className="h-3 w-3 mr-1" />
                            Enabled
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Audit Logging</span>
                          <Badge variant="outline" className="bg-success/10 text-success">
                            <FileText className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Multi-Factor Auth</span>
                          <Badge variant="outline" className="bg-warning/10 text-warning">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Optional
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Data Retention</span>
                          <span className="text-sm font-medium">7 years</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="audit" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Audit Trail
                    </CardTitle>
                    <CardDescription>Recent system activities and user actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {auditData?.map((log) => (
                        <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{log.action}</span>
                              <Badge variant="outline" className="text-xs">
                                {log.user_id}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {JSON.stringify(log.payload)}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(log.created_at).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8 text-muted-foreground">
                          {auditLoading ? "Loading audit logs..." : "No audit logs available"}
                        </div>
                      )}
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