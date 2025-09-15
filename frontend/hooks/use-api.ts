"use client";

import { useState, useEffect, useCallback } from 'react';
import { apiClient, ApiResponse } from '@/lib/api';


export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      if (response.error) {
        setError(response.error);
      } else {
        setData(response.data || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Specific hooks for different data types
export function useComplaints(params?: {
  skip?: number;
  limit?: number;
  product?: string;
  issue?: string;
}) {
  return useApi(
    () => apiClient.getComplaints(params),
    [params?.skip, params?.limit, params?.product, params?.issue]
  );
}

export function useComplaintStats(params?: {
  start_date?: string;
  end_date?: string;
  product?: string;
  issue?: string;
}) {
  return useApi(
    () => apiClient.getComplaintStats(params),
    [params?.start_date, params?.end_date, params?.product, params?.issue]
  );
}

export function useRiskAssessments(params?: {
  skip?: number;
  limit?: number;
  category?: string;
}) {
  return useApi(
    () => apiClient.getRiskAssessments(params),
    [params?.skip, params?.limit, params?.category]
  );
}

export function useHighRiskAlerts() {
  return useApi(() => apiClient.getHighRiskAlerts(), []);
}

export function useBenchmarks(tenantId?: string) {
  return useApi(
    () => apiClient.getBenchmarks(tenantId),
    [tenantId]
  );
}

export function useFeedbackAnalytics() {
  return useApi(() => apiClient.getFeedbackAnalytics(), []);
}

export function useTenantUsers(params?: {
  skip?: number;
  limit?: number;
  role?: string;
}) {
  return useApi(
    () => apiClient.getTenantUsers(params),
    [params?.skip, params?.limit, params?.role]
  );
}

export function useAuditLogs(params?: {
  skip?: number;
  limit?: number;
  action?: string;
}) {
  return useApi(
    () => apiClient.getAuditLogs(params),
    [params?.skip, params?.limit, params?.action]
  );
}

// Authentication hook
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string, tenantId: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.login(email, password, tenantId);
      if (response.error) {
        setError(response.error);
        return false;
      }

      if (response.data) {
        apiClient.setToken(response.data.access_token);
        
        // Get user info
        const userResponse = await apiClient.getCurrentUser();
        if (userResponse.data) {
          setUser(userResponse.data);
        }
        
        return true;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }

    return false;
  };

  const register = async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    tenant_id: string;
    role: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.register(userData);
      if (response.error) {
        setError(response.error);
        return false;
      }

      if (response.data) {
        // Auto-login after registration
        return await login(userData.email, userData.password, userData.tenant_id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }

    return false;
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
  };

  const checkAuth = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.getCurrentUser();
      if (response.data) {
        setUser(response.data);
      } else {
        apiClient.clearToken();
      }
    } catch (err) {
      apiClient.clearToken();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
}

// Complaint workflow hook
export function useComplaintWorkflow() {
  const [workflowState, setWorkflowState] = useState<{
    complaint_id?: number;
    status: 'idle' | 'processing' | 'completed' | 'error';
    currentAgent?: string;
    progress: number;
    results?: any;
    agentCommunications?: Array<{
      timestamp: number;
      from_agent: string;
      to_agent: string;
      message: string;
    }>;
    error?: string;
  }>({
    status: 'idle',
    progress: 0,
  });

  const submitComplaint = async (complaintData: {
    narrative: string;
    product?: string;
    issue?: string;
    company?: string;
  }) => {
    setWorkflowState({
      status: 'processing',
      progress: 0,
    });

    try {
      // Create complaint
      const complaintResponse = await apiClient.createComplaint(complaintData);
      
      if (complaintResponse.error) {
        setWorkflowState({
          status: 'error',
          progress: 0,
          error: complaintResponse.error,
        });
        return null;
      }

      const complaintId = complaintResponse.data?.id;
      if (!complaintId) {
        setWorkflowState({
          status: 'error',
          progress: 0,
          error: 'Failed to create complaint',
        });
        return null;
      }

      setWorkflowState(prev => ({
        ...prev,
        complaint_id: complaintId,
        progress: 20,
      }));

      // Poll for analysis results
      let attempts = 0;
      const maxAttempts = 30; // 30 seconds timeout
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
        const analysisResponse = await apiClient.getComplaintAnalysis(complaintId);
        
        if (analysisResponse.data) {
          setWorkflowState({
            status: 'completed',
            progress: 100,
            complaint_id: complaintId,
            results: analysisResponse.data,
            agentCommunications: analysisResponse.data.agent_communications,
          });
          return analysisResponse.data;
        }
        
        attempts++;
        setWorkflowState(prev => ({
          ...prev,
          progress: Math.min(20 + (attempts * 2), 90),
        }));
      }

      // Timeout
      setWorkflowState({
        status: 'error',
        progress: 0,
        error: 'Analysis timeout - please try again',
      });
      return null;

    } catch (err) {
      setWorkflowState({
        status: 'error',
        progress: 0,
        error: err instanceof Error ? err.message : 'Workflow failed',
      });
      return null;
    }
  };

  const resetWorkflow = () => {
    setWorkflowState({
      status: 'idle',
      progress: 0,
    });
  };

  return {
    workflowState,
    submitComplaint,
    resetWorkflow,
  };
}