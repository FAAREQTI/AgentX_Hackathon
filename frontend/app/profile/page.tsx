"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Activity,
  Save,
  Edit,
  Camera,
  Lock,
  Eye
} from "lucide-react";
import { cn } from "@/lib/utils"; // ✅ FIX added

export default function ProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();

  const [profileData, setProfileData] = useState({
    firstName: user?.first_name || "John",
    lastName: user?.last_name || "Doe",
    email: user?.email || "john.doe@company.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    bio: "Experienced customer service analyst specializing in complaint resolution and risk assessment.",
    department: "Customer Experience",
    manager: "Sarah Wilson",
    startDate: "2023-06-15",
    employeeId: "EMP-001"
  });

  const handleSave = () => {
    setIsEditing(false);
    // Save logic goes here
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} />

      <div className="flex-1 flex flex-col">
        <Header
          title="Profile"
          showNavigation={true}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMobileMenu
        />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Header */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src="/placeholder.svg" alt="Profile" />
                  <AvatarFallback className="text-2xl">
                    {profileData.firstName[0]}
                    {profileData.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-3xl font-bold">
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    {profileData.department}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <Badge
                      variant="outline"
                      className="bg-success/10 text-success border-success/20"
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {user?.role || "Analyst"}
                    </Badge>
                    <Badge variant="outline">
                      <Activity className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary">247</div>
                    <div className="text-sm text-muted-foreground">
                      Complaints Handled
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-success">96%</div>
                    <div className="text-sm text-muted-foreground">
                      Satisfaction Score
                    </div>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-warning">2.1h</div>
                    <div className="text-sm text-muted-foreground">
                      Avg Resolution
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList>
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="work">Work Details</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              {/* Personal Info Tab */}
              <TabsContent value="personal" className="space-y-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>
                        Update your personal details and contact information
                      </CardDescription>
                    </div>
                    <Button
                      variant={isEditing ? "default" : "outline"}
                      onClick={isEditing ? handleSave : () => setIsEditing(true)}
                      className="gap-2"
                    >
                      {isEditing ? (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={profileData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={profileData.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="email"
                            value={profileData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            disabled={!isEditing}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            value={profileData.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            disabled={!isEditing}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="location">Location</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="location"
                            value={profileData.location}
                            onChange={(e) =>
                              handleInputChange("location", e.target.value)
                            }
                            disabled={!isEditing}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) =>
                            handleInputChange("bio", e.target.value)
                          }
                          disabled={!isEditing}
                          rows={3}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Work Info Tab */}
              <TabsContent value="work" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Work Information</CardTitle>
                    <CardDescription>
                      Your role and organizational details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Employee ID</Label>
                        <Input value={profileData.employeeId} disabled />
                      </div>

                      <div className="space-y-2">
                        <Label>Department</Label>
                        <Input value={profileData.department} disabled />
                      </div>

                      <div className="space-y-2">
                        <Label>Manager</Label>
                        <Input value={profileData.manager} disabled />
                      </div>

                      <div className="space-y-2">
                        <Label>Start Date</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            value={profileData.startDate}
                            disabled
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Input value={user?.role || "Analyst"} disabled />
                      </div>

                      <div className="space-y-2">
                        <Label>Tenant</Label>
                        <Input value={user?.tenant_id || "bank-a"} disabled />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>
                      Manage your account security and privacy
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input id="confirmPassword" type="password" />
                      </div>

                      <Button className="gap-2">
                        <Save className="h-4 w-4" />
                        Update Password
                      </Button>
                    </div>

                    <div className="border-t pt-6">
                      <h4 className="font-medium mb-4">Security Status</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-success rounded-full" />
                            <span className="text-sm">Strong Password</span>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-success/10 text-success"
                          >
                            Secure
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-warning rounded-full" />
                            <span className="text-sm">
                              Two-Factor Authentication
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-warning/10 text-warning"
                          >
                            Not Enabled
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-success rounded-full" />
                            <span className="text-sm">Recent Activity</span>
                          </div>
                          <Badge
                            variant="outline"
                            className="bg-success/10 text-success"
                          >
                            Normal
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>
                      Your recent actions and system interactions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { action: "Logged in", time: "2 hours ago", type: "auth" },
                        { action: "Reviewed complaint C-2024-156", time: "3 hours ago", type: "review" },
                        { action: "Generated solution letter", time: "5 hours ago", type: "solution" },
                        { action: "Updated profile information", time: "1 day ago", type: "profile" },
                        { action: "Completed compliance training", time: "2 days ago", type: "training" }
                      ].map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              activity.type === "auth"
                                ? "bg-primary"
                                : activity.type === "review"
                                ? "bg-warning"
                                : activity.type === "solution"
                                ? "bg-success"
                                : activity.type === "profile"
                                ? "bg-accent"
                                : "bg-muted-foreground"
                            )}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {activity.action}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {activity.time}
                            </p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>
                      Your performance over the last 30 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-primary/5 rounded-lg">
                        <div className="text-2xl font-bold text-primary">247</div>
                        <div className="text-sm text-muted-foreground">
                          Cases Handled
                        </div>
                      </div>
                      <div className="text-center p-4 bg-success/5 rounded-lg">
                        <div className="text-2xl font-bold text-success">96%</div>
                        <div className="text-sm text-muted-foreground">
                          Success Rate
                        </div>
                      </div>
                      <div className="text-center p-4 bg-warning/5 rounded-lg">
                        <div className="text-2xl font-bold text-warning">2.1h</div>
                        <div className="text-sm text-muted-foreground">
                          Avg Resolution
                        </div>
                      </div>
                      <div className="text-center p-4 bg-accent/5 rounded-lg">
                        <div className="text-2xl font-bold text-accent">4.8</div>
                        <div className="text-sm text-muted-foreground">Rating</div>
                      </div>
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
