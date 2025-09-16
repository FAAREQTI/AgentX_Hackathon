"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/layout/header";
import { 
  LogIn, 
  UserPlus, 
  Building2, 
  Shield, 
  CheckCircle,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    tenantId: "bank-a",
    role: "analyst"
  });
  const [error, setError] = useState("");
  
  const router = useRouter();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let success = false;
      
      if (isLogin) {
        success = await login(formData.email, formData.password, formData.tenantId);
      } else {
        success = await register({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          tenant_id: formData.tenantId,
          role: formData.role
        });
      }

      if (success) {
        router.push('/dashboard');
      } else {
        setError(isLogin ? 'Invalid credentials' : 'Registration failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const tenants = [
    { id: "bank-a", name: "Bank A", description: "Primary Banking Services" },
    { id: "bank-b", name: "Bank B", description: "Investment Banking" },
    { id: "regulator", name: "Financial Regulator", description: "Regulatory Oversight" }
  ];

  const roles = [
    { id: "consumer", name: "Consumer", description: "File and track complaints" },
    { id: "analyst", name: "Analyst", description: "Analyze and resolve complaints" },
    { id: "admin", name: "Administrator", description: "Full system access" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl animate-float" />
      
      <Header title="Complaint Compass" />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">CC</span>
              </div>
              <h1 className="text-3xl font-bold">Complaint Compass</h1>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold">
                {isLogin ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-muted-foreground">
                {isLogin 
                  ? "Sign in to access your complaint intelligence dashboard" 
                  : "Join the enterprise complaint management platform"
                }
              </p>
            </div>
          </div>

          {/* Auth Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200",
                isLogin 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LogIn className="h-4 w-4 mr-2 inline" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={cn(
                "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200",
                !isLogin 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <UserPlus className="h-4 w-4 mr-2 inline" />
              Sign Up
            </button>
          </div>

          {/* Form */}
          <Card className="border-0 shadow-xl bg-background/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Registration Fields */}
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required={!isLogin}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required={!isLogin}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    placeholder="john.doe@company.com"
                  />
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Tenant Selection */}
                <div className="space-y-2">
                  <Label htmlFor="tenant">Organization</Label>
                  <Select value={formData.tenantId} onValueChange={(value) => handleInputChange("tenantId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          <div className="flex items-center gap-3">
                            <Building2 className="h-4 w-4 text-primary" />
                            <div>
                              <div className="font-medium">{tenant.name}</div>
                              <div className="text-xs text-muted-foreground">{tenant.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Role Selection (Registration only) */}
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            <div className="flex items-center gap-3">
                              <Shield className="h-4 w-4 text-primary" />
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
                )}

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span className="text-sm text-destructive">{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </>
                  ) : (
                    <>
                      {isLogin ? (
                        <>
                          <LogIn className="h-5 w-5 mr-2" />
                          Sign In
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-5 w-5 mr-2" />
                          Create Account
                        </>
                      )}
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>

                {/* Switch Mode */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {isLogin 
                      ? "Don't have an account? Sign up" 
                      : "Already have an account? Sign in"
                    }
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">Enterprise Security</p>
                <p className="text-xs text-muted-foreground">SOC 2 Certified</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="font-medium text-sm">GDPR Compliant</p>
                <p className="text-xs text-muted-foreground">Data Protected</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="font-medium text-sm">Multi-Tenant</p>
                <p className="text-xs text-muted-foreground">Secure Isolation</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              By continuing, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}