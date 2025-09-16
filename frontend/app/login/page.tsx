"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Shield, 
  Users, 
  Mail, 
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle
} from "lucide-react";
import Link from "next/link";

const tenants = [
  { id: "bank-a", name: "Bank A", type: "Financial Institution" },
  { id: "bank-b", name: "Bank B", type: "Financial Institution" },
  { id: "credit-union", name: "Community Credit Union", type: "Credit Union" },
  { id: "regulator", name: "Financial Regulator", type: "Regulatory Body" }
];

const roles = [
  { 
    id: "consumer", 
    name: "Consumer", 
    description: "File complaints and receive solutions",
    permissions: ["File complaints", "View solutions", "Download letters"]
  },
  { 
    id: "analyst", 
    name: "Analyst", 
    description: "Review complaints and access analytics dashboard",
    permissions: ["Review complaints", "Access dashboard", "Generate reports", "View analytics"]
  },
  { 
    id: "admin", 
    name: "Administrator", 
    description: "Manage tenant users and system configuration",
    permissions: ["User management", "RBAC configuration", "Audit logs", "System settings"]
  }
];

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [selectedTenant, setSelectedTenant] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    organization: ""
  });

  const { login, register, error } = useAuth();
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    if (!selectedTenant || !formData.email || !formData.password) return;
    
    setIsLoading(true);
    const success = await login(formData.email, formData.password, selectedTenant);
    setIsLoading(false);
    
    if (success) {
      router.push("/dashboard");
    }
  };

  const handleRegister = async () => {
    if (!selectedTenant || !selectedRole || !formData.email || !formData.password || 
        formData.password !== formData.confirmPassword || !formData.firstName || !formData.lastName) {
      return;
    }
    
    setIsLoading(true);
    const success = await register({
      email: formData.email,
      password: formData.password,
      first_name: formData.firstName,
      last_name: formData.lastName,
      tenant_id: selectedTenant,
      role: selectedRole
    });
    setIsLoading(false);
    
    if (success) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">CC</span>
            </div>
            <h1 className="text-3xl font-bold">Complaint Compass</h1>
          </Link>
          <p className="text-muted-foreground text-lg">
            Access your enterprise complaint management platform
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-background/80 backdrop-blur-sm">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b bg-muted/30">
                <TabsList className="grid w-full grid-cols-2 bg-transparent h-16">
                  <TabsTrigger value="login" className="text-lg py-4">Sign In</TabsTrigger>
                  <TabsTrigger value="register" className="text-lg py-4">Create Account</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="login" className="p-8 space-y-6">
                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenant-login">Select Organization</Label>
                    <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            <div className="flex items-center gap-3">
                              <Building2 className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{tenant.name}</div>
                                <div className="text-xs text-muted-foreground">{tenant.type}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-login">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email-login"
                        type="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-login">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password-login"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className="pl-10 pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="remember" className="rounded" />
                      <Label htmlFor="remember" className="text-sm">Remember me</Label>
                    </div>
                    <Button variant="link" className="p-0 h-auto text-sm">
                      Forgot password?
                    </Button>
                  </div>

                  <Button 
                    onClick={handleLogin} 
                    className="w-full gap-2 py-6 text-lg"
                    disabled={!selectedTenant || !formData.email || !formData.password || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>

                  <Separator />

                  <Button variant="outline" className="w-full gap-2 py-6">
                    <Shield className="h-5 w-5" />
                    Sign in with SSO
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="register" className="p-8 space-y-6">
                {error && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-register">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email-register"
                        type="email"
                        placeholder="john.doe@company.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tenant-register">Organization</Label>
                    <Select value={selectedTenant} onValueChange={setSelectedTenant}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your organization" />
                      </SelectTrigger>
                      <SelectContent>
                        {tenants.map((tenant) => (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            <div className="flex items-center gap-3">
                              <Building2 className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{tenant.name}</div>
                                <div className="text-xs text-muted-foreground">{tenant.type}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role-register">Role</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            <div className="flex items-center gap-3">
                              <Users className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{role.name}</div>
                                <div className="text-xs text-muted-foreground">{role.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedRole && (
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Role Permissions:</h4>
                        <div className="space-y-1">
                          {roles.find(r => r.id === selectedRole)?.permissions.map((permission, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-success" />
                              <span>{permission}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password-register">Password</Label>
                      <Input
                        id="password-register"
                        type="password"
                        placeholder="Create password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="terms" className="rounded" />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the <Button variant="link" className="p-0 h-auto text-sm">Terms of Service</Button> and <Button variant="link" className="p-0 h-auto text-sm">Privacy Policy</Button>
                    </Label>
                  </div>

                  <Button 
                    onClick={handleRegister}
                    className="w-full gap-2 py-6 text-lg"
                    disabled={!selectedTenant || !selectedRole || !formData.email || !formData.password || formData.password !== formData.confirmPassword || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Need help? <Button variant="link" className="p-0 h-auto text-sm">Contact Support</Button>
          </p>
        </div>
      </div>
    </div>
  );
}