"use client";

import { useState } from "react";
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
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@company.com",
    role: "Admin",
    tenant: "Acme Corp",
    status: "Active",
    lastLogin: "2024-01-15 14:30",
    avatar: "/placeholder.svg",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    joinDate: "2023-06-15",
    complaintsHandled: 247,
    avgResolutionTime: "2.1h",
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
    avatar: "/placeholder.svg",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    joinDate: "2023-08-22",
    complaintsHandled: 189,
    avgResolutionTime: "1.8h",
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
    avatar: "/placeholder.svg",
    phone: "+1 (555) 345-6789",
    location: "Austin, TX",
    joinDate: "2023-11-03",
    complaintsHandled: 56,
    avgResolutionTime: "3.2h",
    permissions: ["read"]
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah.wilson@company.com", 
    role: "Analyst",
    tenant: "Acme Corp",
    status: "Active",
    lastLogin: "2024-01-15 11:22",
    avatar: "/placeholder.svg",
    phone: "+1 (555) 456-7890",
    location: "Chicago, IL",
    joinDate: "2023-09-12",
    complaintsHandled: 203,
    avgResolutionTime: "1.9h",
    permissions: ["read", "write"]
  }
];

const mockTeams = [
  {
    id: "1",
    name: "Customer Success",
    description: "Primary customer complaint handling team",
    members: 12,
    lead: "John Doe",
    avgResolutionTime: "2.1h",
    satisfactionScore: 96
  },
  {
    id: "2", 
    name: "Risk Assessment",
    description: "Specialized team for high-risk complaint analysis",
    members: 8,
    lead: "Jane Smith",
    avgResolutionTime: "3.4h",
    satisfactionScore: 94
  },
  {
    id: "3",
    name: "Compliance",
    description: "Regulatory compliance and audit team",
    members: 6,
    lead: "Mike Johnson",
    avgResolutionTime: "4.2h",
    satisfactionScore: 98
  }
];

export default function UserManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTenant, setSelectedTenant] = useState("all");
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
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
          title="User Management" 
          showNavigation={true}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMobileMenu
        />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Tabs defaultValue="users" className="space-y-6">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="users">Users</TabsTrigger>
                  <TabsTrigger value="teams">Teams</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="users" className="space-y-6">
                {/* Users Header */}
                <div className="flex flex-col lg:flex-row gap-4 justify-between">
                  <div>
                    <h2 className="text-3xl font-bold">User Management</h2>
                    <p className="text-muted-foreground text-lg">Manage user accounts, roles, and permissions</p>
                  </div>
                  <Dialog open={showCreateUserForm} onOpenChange={setShowCreateUserForm}>
                    <DialogTrigger asChild>
                      <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                          Create a new user account with appropriate permissions.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" placeholder="Enter full name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="Enter email address" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="analyst">Analyst</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tenant">Tenant</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select tenant" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="acme">Acme Corp</SelectItem>
                              <SelectItem value="global">Global Ltd</SelectItem>
                              <SelectItem value="tech">Tech Inc</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button className="flex-1">Create User</Button>
                          <Button variant="outline" className="flex-1" onClick={() => setShowCreateUserForm(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
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
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    More Filters
                  </Button>
                </div>

                {/* Users Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {filteredUsers.map((user) => (
                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-lg">{user.name}</h3>
                              <p className="text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedUser(user)}>
                                <Edit className="h-4 w-4 mr-2" />
                                View Details
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
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Role</span>
                            <Badge variant={getRoleColor(user.role) as any}>
                              {user.role}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
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
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Tenant</span>
                            <span className="text-sm font-medium">{user.tenant}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Last Login</span>
                            <span className="text-sm">{user.lastLogin}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                            <div className="text-center">
                              <div className="text-lg font-bold text-primary">{user.complaintsHandled}</div>
                              <div className="text-xs text-muted-foreground">Complaints</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-success">{user.avgResolutionTime}</div>
                              <div className="text-xs text-muted-foreground">Avg Resolution</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="teams" className="space-y-6">
                <div className="flex flex-col lg:flex-row gap-4 justify-between">
                  <div>
                    <h2 className="text-3xl font-bold">Team Management</h2>
                    <p className="text-muted-foreground text-lg">Organize users into teams and manage team performance</p>
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Team
                  </Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {mockTeams.map((team) => (
                    <Card key={team.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            {team.name}
                          </CardTitle>
                          <Badge variant="outline">{team.members} members</Badge>
                        </div>
                        <CardDescription>{team.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Team Lead</span>
                            <span className="text-sm font-medium">{team.lead}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <div className="text-lg font-bold text-primary">{team.avgResolutionTime}</div>
                              <div className="text-xs text-muted-foreground">Avg Resolution</div>
                            </div>
                            <div className="text-center p-3 bg-muted/50 rounded-lg">
                              <div className="text-lg font-bold text-success">{team.satisfactionScore}%</div>
                              <div className="text-xs text-muted-foreground">Satisfaction</div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              View Members
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              Edit Team
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="permissions" className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold">Permissions & Roles</h2>
                  <p className="text-muted-foreground text-lg">Configure role-based access control and permissions</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-destructive" />
                        Admin
                      </CardTitle>
                      <CardDescription>Full system access and management</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">User Management</span>
                          <Badge variant="outline">Full Access</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Complaint Management</span>
                          <Badge variant="outline">Full Access</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Analytics & Reports</span>
                          <Badge variant="outline">Full Access</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">System Settings</span>
                          <Badge variant="outline">Full Access</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Audit Logs</span>
                          <Badge variant="outline">Read/Write</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Analyst
                      </CardTitle>
                      <CardDescription>Analysis and complaint handling</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">User Management</span>
                          <Badge variant="secondary">Read Only</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Complaint Management</span>
                          <Badge variant="outline">Read/Write</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Analytics & Reports</span>
                          <Badge variant="outline">Read/Write</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">System Settings</span>
                          <Badge variant="secondary">Read Only</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Audit Logs</span>
                          <Badge variant="secondary">Read Only</Badge>
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
                      <CardDescription>Read-only access to data</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">User Management</span>
                          <Badge variant="secondary">No Access</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Complaint Management</span>
                          <Badge variant="secondary">Read Only</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Analytics & Reports</span>
                          <Badge variant="secondary">Read Only</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">System Settings</span>
                          <Badge variant="secondary">No Access</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Audit Logs</span>
                          <Badge variant="secondary">No Access</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="sm:max-w-2xl">
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                    <AvatarFallback>{selectedUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  {selectedUser.name}
                </DialogTitle>
                <DialogDescription>
                  Detailed user information and activity
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{selectedUser.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{selectedUser.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="font-medium">{selectedUser.location}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Join Date</p>
                        <p className="font-medium">{selectedUser.joinDate}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Last Login</p>
                        <p className="font-medium">{selectedUser.lastLogin}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Role</p>
                        <Badge variant={getRoleColor(selectedUser.role) as any}>
                          {selectedUser.role}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{selectedUser.complaintsHandled}</div>
                    <div className="text-sm text-muted-foreground">Complaints Handled</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{selectedUser.avgResolutionTime}</div>
                    <div className="text-sm text-muted-foreground">Avg Resolution Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-warning">96%</div>
                    <div className="text-sm text-muted-foreground">Satisfaction Score</div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex-1">Edit User</Button>
                  <Button variant="outline" className="flex-1">Reset Password</Button>
                  <Button variant="outline" onClick={() => setSelectedUser(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}