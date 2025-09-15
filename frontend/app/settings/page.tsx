"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { 
  Settings, 
  Save, 
  Bell, 
  Shield, 
  Globe, 
  Database,
  Key,
  Webhook,
  Clock,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Plus,
  Copy,
  RefreshCw,
  Download,
  Upload,
  User,
  Building2,
  Mail,
  Smartphone,
  Monitor
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";

interface SettingsData {
  general: {
    organizationName: string;
    domain: string;
    timezone: string;
    language: string;
    dateFormat: string;
    currency: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    weeklyReports: boolean;
    highRiskAlerts: boolean;
    systemUpdates: boolean;
    marketingEmails: boolean;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
    loginAttempts: number;
    ipWhitelist: string[];
    auditLogging: boolean;
  };
  api: {
    apiKeys: Array<{
      id: string;
      name: string;
      key: string;
      permissions: string[];
      lastUsed: string;
      expiresAt: string;
    }>;
    webhooks: Array<{
      id: string;
      url: string;
      events: string[];
      active: boolean;
      lastTriggered: string;
    }>;
    rateLimit: number;
    allowedOrigins: string[];
  };
  privacy: {
    dataRetentionDays: number;
    autoBackup: boolean;
    backupFrequency: string;
    gdprCompliance: boolean;
    ccpaCompliance: boolean;
    dataExportEnabled: boolean;
    anonymizeData: boolean;
  };
}

export default function SettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState<string | null>(null);
  const [newApiKeyName, setNewApiKeyName] = useState("");
  const [newWebhookUrl, setNewWebhookUrl] = useState("");
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  const [settings, setSettings] = useState<SettingsData>({
    general: {
      organizationName: "Acme Corporation",
      domain: "acme.com",
      timezone: "America/New_York",
      language: "en",
      dateFormat: "MM/DD/YYYY",
      currency: "USD"
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      weeklyReports: true,
      highRiskAlerts: true,
      systemUpdates: true,
      marketingEmails: false
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: 30,
      passwordExpiry: 90,
      loginAttempts: 5,
      ipWhitelist: [],
      auditLogging: true
    },
    api: {
      apiKeys: [
        {
          id: "1",
          name: "Production API",
          key: "cc_live_1234567890abcdef",
          permissions: ["read", "write"],
          lastUsed: "2024-01-15 14:30",
          expiresAt: "2024-12-31"
        }
      ],
      webhooks: [
        {
          id: "1",
          url: "https://api.company.com/webhooks/complaints",
          events: ["complaint.created", "complaint.resolved"],
          active: true,
          lastTriggered: "2024-01-15 14:25"
        }
      ],
      rateLimit: 1000,
      allowedOrigins: ["https://app.company.com"]
    },
    privacy: {
      dataRetentionDays: 2555,
      autoBackup: true,
      backupFrequency: "daily",
      gdprCompliance: true,
      ccpaCompliance: true,
      dataExportEnabled: true,
      anonymizeData: true
    }
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Load settings from backend
  useEffect(() => {
    const loadSettings = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await apiClient.getSettings();
        if (response.data) {
          setSettings(response.data);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [isAuthenticated]);

  // Show loading while checking authentication
  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const response = await apiClient.updateSettings(settings);
      if (response.error) {
        console.error('Failed to save settings:', response.error);
      } else {
        console.log('Settings saved successfully');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateApiKey = async () => {
    if (!newApiKeyName.trim()) return;
    
    try {
      const response = await apiClient.generateApiKey(newApiKeyName);
      if (response.data) {
        setSettings(prev => ({
          ...prev,
          api: {
            ...prev.api,
            apiKeys: [...prev.api.apiKeys, response.data]
          }
        }));
        setNewApiKeyName("");
      }
    } catch (error) {
      console.error('Failed to generate API key:', error);
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    try {
      await apiClient.deleteApiKey(keyId);
      setSettings(prev => ({
        ...prev,
        api: {
          ...prev.api,
          apiKeys: prev.api.apiKeys.filter(key => key.id !== keyId)
        }
      }));
    } catch (error) {
      console.error('Failed to delete API key:', error);
    }
  };

  const handleAddWebhook = async () => {
    if (!newWebhookUrl.trim()) return;
    
    try {
      const response = await apiClient.createWebhook({
        url: newWebhookUrl,
        events: ["complaint.created", "complaint.resolved"]
      });
      if (response.data) {
        setSettings(prev => ({
          ...prev,
          api: {
            ...prev.api,
            webhooks: [...prev.api.webhooks, response.data]
          }
        }));
        setNewWebhookUrl("");
      }
    } catch (error) {
      console.error('Failed to add webhook:', error);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      await apiClient.deleteWebhook(webhookId);
      setSettings(prev => ({
        ...prev,
        api: {
          ...prev.api,
          webhooks: prev.api.webhooks.filter(webhook => webhook.id !== webhookId)
        }
      }));
    } catch (error) {
      console.error('Failed to delete webhook:', error);
    }
  };

  const updateSettings = (section: keyof SettingsData, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} />
      
      <div className="flex-1 flex flex-col">
        <Header 
          title="Settings" 
          showNavigation={true}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          showMobileMenu
        />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground text-lg">Manage your account and organization preferences</p>
              </div>
              
              <Button 
                onClick={handleSaveSettings} 
                disabled={saving}
                className="gap-2"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="api">API & Integrations</TabsTrigger>
                <TabsTrigger value="privacy">Data & Privacy</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Organization Settings
                    </CardTitle>
                    <CardDescription>Basic organization information and preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="orgName">Organization Name</Label>
                        <Input
                          id="orgName"
                          value={settings.general.organizationName}
                          onChange={(e) => updateSettings('general', 'organizationName', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="domain">Domain</Label>
                        <Input
                          id="domain"
                          value={settings.general.domain}
                          onChange={(e) => updateSettings('general', 'domain', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select 
                          value={settings.general.timezone} 
                          onValueChange={(value) => updateSettings('general', 'timezone', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                            <SelectItem value="Europe/London">London (GMT)</SelectItem>
                            <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select 
                          value={settings.general.language} 
                          onValueChange={(value) => updateSettings('general', 'language', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Español</SelectItem>
                            <SelectItem value="fr">Français</SelectItem>
                            <SelectItem value="de">Deutsch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="dateFormat">Date Format</Label>
                        <Select 
                          value={settings.general.dateFormat} 
                          onValueChange={(value) => updateSettings('general', 'dateFormat', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select 
                          value={settings.general.currency} 
                          onValueChange={(value) => updateSettings('general', 'currency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="JPY">JPY (¥)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Preferences
                    </CardTitle>
                    <CardDescription>Configure how and when you receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <Label>Email Notifications</Label>
                          </div>
                          <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                        </div>
                        <Switch
                          checked={settings.notifications.emailNotifications}
                          onCheckedChange={(checked) => updateSettings('notifications', 'emailNotifications', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-muted-foreground" />
                            <Label>SMS Notifications</Label>
                          </div>
                          <p className="text-sm text-muted-foreground">Receive critical alerts via SMS</p>
                        </div>
                        <Switch
                          checked={settings.notifications.smsNotifications}
                          onCheckedChange={(checked) => updateSettings('notifications', 'smsNotifications', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-muted-foreground" />
                            <Label>Push Notifications</Label>
                          </div>
                          <p className="text-sm text-muted-foreground">Browser push notifications</p>
                        </div>
                        <Switch
                          checked={settings.notifications.pushNotifications}
                          onCheckedChange={(checked) => updateSettings('notifications', 'pushNotifications', checked)}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h4 className="font-medium">Notification Types</h4>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label>High Risk Alerts</Label>
                              <p className="text-sm text-muted-foreground">Immediate alerts for high-risk complaints</p>
                            </div>
                            <Switch
                              checked={settings.notifications.highRiskAlerts}
                              onCheckedChange={(checked) => updateSettings('notifications', 'highRiskAlerts', checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label>Weekly Reports</Label>
                              <p className="text-sm text-muted-foreground">Weekly analytics and performance reports</p>
                            </div>
                            <Switch
                              checked={settings.notifications.weeklyReports}
                              onCheckedChange={(checked) => updateSettings('notifications', 'weeklyReports', checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label>System Updates</Label>
                              <p className="text-sm text-muted-foreground">Platform updates and maintenance notices</p>
                            </div>
                            <Switch
                              checked={settings.notifications.systemUpdates}
                              onCheckedChange={(checked) => updateSettings('notifications', 'systemUpdates', checked)}
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label>Marketing Emails</Label>
                              <p className="text-sm text-muted-foreground">Product updates and feature announcements</p>
                            </div>
                            <Switch
                              checked={settings.notifications.marketingEmails}
                              onCheckedChange={(checked) => updateSettings('notifications', 'marketingEmails', checked)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>Configure security policies and access controls</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Two-Factor Authentication</Label>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={settings.security.twoFactorEnabled}
                            onCheckedChange={(checked) => updateSettings('security', 'twoFactorEnabled', checked)}
                          />
                          {settings.security.twoFactorEnabled && (
                            <Badge variant="outline" className="bg-success/10 text-success">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Enabled
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                          <Input
                            id="sessionTimeout"
                            type="number"
                            value={settings.security.sessionTimeout}
                            onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                          <Input
                            id="passwordExpiry"
                            type="number"
                            value={settings.security.passwordExpiry}
                            onChange={(e) => updateSettings('security', 'passwordExpiry', parseInt(e.target.value))}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                          <Input
                            id="loginAttempts"
                            type="number"
                            value={settings.security.loginAttempts}
                            onChange={(e) => updateSettings('security', 'loginAttempts', parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Audit Logging</Label>
                          <p className="text-sm text-muted-foreground">Log all user actions for compliance</p>
                        </div>
                        <Switch
                          checked={settings.security.auditLogging}
                          onCheckedChange={(checked) => updateSettings('security', 'auditLogging', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="api" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      API Keys
                    </CardTitle>
                    <CardDescription>Manage API keys for programmatic access</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex gap-4">
                      <Input
                        placeholder="API key name"
                        value={newApiKeyName}
                        onChange={(e) => setNewApiKeyName(e.target.value)}
                      />
                      <Button onClick={handleGenerateApiKey} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Generate Key
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {settings.api.apiKeys.map((apiKey) => (
                        <div key={apiKey.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{apiKey.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Last used: {apiKey.lastUsed} • Expires: {apiKey.expiresAt}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                              >
                                {showApiKey === apiKey.id ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigator.clipboard.writeText(apiKey.key)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteApiKey(apiKey.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="font-mono text-sm bg-muted p-2 rounded">
                              {showApiKey === apiKey.id ? apiKey.key : '••••••••••••••••••••••••••••••••'}
                            </div>
                            <div className="flex gap-2">
                              {apiKey.permissions.map((permission) => (
                                <Badge key={permission} variant="outline">
                                  {permission}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Webhook className="h-5 w-5" />
                      Webhooks
                    </CardTitle>
                    <CardDescription>Configure webhook endpoints for real-time notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex gap-4">
                      <Input
                        placeholder="Webhook URL"
                        value={newWebhookUrl}
                        onChange={(e) => setNewWebhookUrl(e.target.value)}
                      />
                      <Button onClick={handleAddWebhook} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Webhook
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {settings.api.webhooks.map((webhook) => (
                        <div key={webhook.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-medium">{webhook.url}</h4>
                                <Badge variant={webhook.active ? "outline" : "secondary"}>
                                  {webhook.active ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Last triggered: {webhook.lastTriggered}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteWebhook(webhook.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="flex gap-2">
                            {webhook.events.map((event) => (
                              <Badge key={event} variant="outline">
                                {event}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>API Configuration</CardTitle>
                    <CardDescription>Configure API access and rate limiting</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="rateLimit">Rate Limit (requests per hour)</Label>
                      <Input
                        id="rateLimit"
                        type="number"
                        value={settings.api.rateLimit}
                        onChange={(e) => updateSettings('api', 'rateLimit', parseInt(e.target.value))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="allowedOrigins">Allowed Origins</Label>
                      <Textarea
                        id="allowedOrigins"
                        placeholder="https://app.company.com&#10;https://dashboard.company.com"
                        value={settings.api.allowedOrigins.join('\n')}
                        onChange={(e) => updateSettings('api', 'allowedOrigins', e.target.value.split('\n').filter(Boolean))}
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="privacy" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Data Management
                    </CardTitle>
                    <CardDescription>Configure data retention and privacy settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="dataRetention">Data Retention (days)</Label>
                        <Input
                          id="dataRetention"
                          type="number"
                          value={settings.privacy.dataRetentionDays}
                          onChange={(e) => updateSettings('privacy', 'dataRetentionDays', parseInt(e.target.value))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="backupFreq">Backup Frequency</Label>
                        <Select 
                          value={settings.privacy.backupFrequency} 
                          onValueChange={(value) => updateSettings('privacy', 'backupFrequency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Automatic Backups</Label>
                          <p className="text-sm text-muted-foreground">Automatically backup data at scheduled intervals</p>
                        </div>
                        <Switch
                          checked={settings.privacy.autoBackup}
                          onCheckedChange={(checked) => updateSettings('privacy', 'autoBackup', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Data Anonymization</Label>
                          <p className="text-sm text-muted-foreground">Automatically anonymize sensitive data</p>
                        </div>
                        <Switch
                          checked={settings.privacy.anonymizeData}
                          onCheckedChange={(checked) => updateSettings('privacy', 'anonymizeData', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Data Export</Label>
                          <p className="text-sm text-muted-foreground">Allow users to export their data</p>
                        </div>
                        <Switch
                          checked={settings.privacy.dataExportEnabled}
                          onCheckedChange={(checked) => updateSettings('privacy', 'dataExportEnabled', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Compliance Status</CardTitle>
                    <CardDescription>Current compliance with privacy regulations</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-success rounded-full" />
                        <span>GDPR Compliance</span>
                      </div>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Compliant
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-success rounded-full" />
                        <span>CCPA Compliance</span>
                      </div>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Compliant
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-warning rounded-full" />
                        <span>SOX Compliance</span>
                      </div>
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Review Required
                      </Badge>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-3 w-3" />
                          Export Compliance Report
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <RefreshCw className="h-3 w-3" />
                          Run Compliance Check
                        </Button>
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