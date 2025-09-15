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
  Save, 
  Bell, 
  Shield, 
  Database,
  Key,
  Webhook,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Trash2,
  Plus,
  Copy,
  RefreshCw,
  Download,
  Building2,
  Mail,
  Smartphone,
  Monitor
} from "lucide-react";
import { apiClient } from "@/lib/api";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  lastUsed: string;
  expiresAt: string;
}

interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  lastTriggered: string;
}

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
    apiKeys: ApiKey[];
    webhooks: WebhookConfig[];
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
  const { loading: authLoading, isAuthenticated } = useAuth();

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
      apiKeys: [],
      webhooks: [],
      rateLimit: 1000,
      allowedOrigins: []
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
          setSettings(response.data as SettingsData);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [isAuthenticated]);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

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
        const newKey = response.data as ApiKey;
        setSettings(prev => ({
          ...prev,
          api: {
            ...prev.api,
            apiKeys: [...prev.api.apiKeys, newKey],
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
          apiKeys: prev.api.apiKeys.filter(key => key.id !== keyId),
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
        const newWebhook = response.data as WebhookConfig;
        setSettings(prev => ({
          ...prev,
          api: {
            ...prev.api,
            webhooks: [...prev.api.webhooks, newWebhook],
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
          webhooks: prev.api.webhooks.filter(webhook => webhook.id !== webhookId),
        }
      }));
    } catch (error) {
      console.error('Failed to delete webhook:', error);
    }
  };

  const updateSettings = <K extends keyof SettingsData>(
    section: K,
    field: keyof SettingsData[K],
    value: any
  ) => {
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
          {/* 🔥 Keep all your Tab code here (General / Notifications / Security / API / Privacy) exactly the same */}
        </div>
      </div>
    </div>
  );
}
