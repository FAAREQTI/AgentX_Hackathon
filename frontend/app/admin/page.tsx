"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { 
  Users, 
  Plus,
  Edit, 
  Trash2,
  Shield,
  Clock,
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Admin",
    tenant: "Acme Corp",
    status: "Active",
    lastLogin: "2024-01-15 14:30",
    permissions: ["read", "write", "admin"]
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@company.com",
    role: "Analyst",
    tenant: "Global Ltd",
    status: "Active",
    lastLogin: "2024-01-15 09:15",
    permissions: ["read", "write"]
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@company.com",
    role: "Viewer",
    tenant: "Tech Inc",
    status: "Inactive",
    lastLogin: "2024-01-10 16:45",
    permissions: ["read"]
  }
];

const mockAuditLogs = [
  {
    id: "1",
    timestamp: "2024-01-15 14:32:10",
    user: "john.doe@company.com",
    action: "User Created",
    details: "Created user jane.smith@company.com",
    ip: "192.168.1.100"
  },
  {
    id: "2",
    timestamp: "2024-01-15 14:30:45",
    user: "jane.smith@company.com",
    action: "Login",
    details: "Successful login",
    ip: "192.168.1.101"
  },
  {
    id: "3",
    timestamp: "2024-01-15 14:25:12",
    user: "admin@system.com",
    action: "Permission Modified",
    details: "Updated role for mike.johnson@company.com",
    ip: "192.168.1.1"
  }
];

export default function AdminPanel() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTenant, setSelectedTenant] = useState("all");
  const [showCreateUserForm, setShowCreateUserForm] = useState(false);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin": return "destructive";
      case "Analyst": return "secondary";
      case "Viewer": return "outline";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "Active" ? "success" : "secondary";
  };

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTenant = selectedTenant === "all" || user.tenant === selectedTenant;
    return matchesSearch && matchesTenant;
  });

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <Header 
          title="Admin Panel" 
          showNavigation={true}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMobileMenu
        />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="users" className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="users">User Management</TabsTrigger>
                  <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
                  <TabsTrigger value="audit">Audit Logs</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="users" className="space-y-6">
                {/* Users Header */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">User Management</h2>
                    <p className="text-muted-foreground">Manage user accounts and access permissions</p>
                  </div>
                  <Button onClick={() => setShowCreateUserForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>

                {/* Filters */}
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
                  <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tenants</SelectItem>
                      <SelectItem value="Acme Corp">Acme Corp</SelectItem>
                      <SelectItem value="Global Ltd">Global Ltd</SelectItem>
                      <SelectItem value="Tech Inc">Tech Inc</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>

                {/* Users Table */}
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b bg-muted/30">
                          <tr>
                            <th className="text-left p-4 font-medium">User</th>
                            <th className="text-left p-4 font-medium">Role</th>
                            <th className="text-left p-4 font-medium">Tenant</th>
                            <th className="text-left p-4 font-medium">Status</th>
                            <th className="text-left p-4 font-medium">Last Login</th>
                            <th className="text-right p-4 font-medium">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b hover:bg-muted/50">
                              <td className="p-4">
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                              </td>
                              <td className="p-4">
                                <Badge variant={getRoleColor(user.role) as any}>
                                  {user.role}
                                </Badge>
                              </td>
                              <td className="p-4">
                                <span className="text-sm">{user.tenant}</span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  {user.status === "Active" ? (
                                    <UserCheck className="h-4 w-4 text-success" />
                                  ) : (
                                    <UserX className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <Badge variant={getStatusColor(user.status) as any}>
                                    {user.status}
                                  </Badge>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="text-sm text-muted-foreground">{user.lastLogin}</span>
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
                                      Delete User
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

              <TabsContent value="roles" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Roles & Permissions</h2>
                  <p className="text-muted-foreground">Configure role-based access control</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-destructive" />
                        Admin
                      </CardTitle>
                      <CardDescription>Full system access</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Users</span>
                          <Badge variant="outline">Read, Write, Delete</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Complaints</span>
                          <Badge variant="outline">Read, Write, Delete</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Analytics</span>
                          <Badge variant="outline">Read, Write</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Settings</span>
                          <Badge variant="outline">Read, Write</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Analyst
                      </CardTitle>
                      <CardDescription>Analysis and reporting access</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Users</span>
                          <Badge variant="secondary">Read</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Complaints</span>
                          <Badge variant="outline">Read, Write</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Analytics</span>
                          <Badge variant="outline">Read, Write</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Settings</span>
                          <Badge variant="secondary">Read</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <span className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-xs">V</span>
                        Viewer
                      </CardTitle>
                      <CardDescription>Read-only access</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Users</span>
                          <Badge variant="secondary">Read</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Complaints</span>
                          <Badge variant="secondary">Read</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Analytics</span>
                          <Badge variant="secondary">Read</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Settings</span>
                          <Badge variant="secondary">None</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="audit" className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Audit Logs</h2>
                  <p className="text-muted-foreground">Track user activities and system changes</p>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b bg-muted/30">
                          <tr>
                            <th className="text-left p-4 font-medium">Timestamp</th>
                            <th className="text-left p-4 font-medium">User</th>
                            <th className="text-left p-4 font-medium">Action</th>
                            <th className="text-left p-4 font-medium">Details</th>
                            <th className="text-left p-4 font-medium">IP Address</th>
                          </tr>
                        </thead>
                        <tbody>
                          {mockAuditLogs.map((log) => (
                            <tr key={log.id} className="border-b hover:bg-muted/50">
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-mono">{log.timestamp}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="text-sm font-medium">{log.user}</span>
                              </td>
                              <td className="p-4">
                                <Badge variant="outline">{log.action}</Badge>
                              </td>
                              <td className="p-4">
                                <span className="text-sm text-muted-foreground">{log.details}</span>
                              </td>
                              <td className="p-4">
                                <span className="text-sm font-mono">{log.ip}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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