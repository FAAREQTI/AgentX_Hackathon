
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.detail || 'An error occurred',
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      };
    }
  }

  // Authentication endpoints
  async login(email: string, password: string, tenantId: string) {
    return this.request<{
      access_token: string;
      token_type: string;
      expires_in: number;
      user_id: string;
      tenant_id: string;
      role: string;
    }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        tenant_id: tenantId,
      }),
    });
  }

  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    tenant_id: string;
    role: string;
  }) {
    return this.request<{
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      tenant_id: string;
      role: string;
      is_active: boolean;
      created_at: string;
    }>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request<{
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      tenant_id: string;
      role: string;
      is_active: boolean;
      created_at: string;
    }>('/api/v1/auth/me');
  }

  // Complaint endpoints
  async createComplaint(complaintData: {
    narrative: string;
    product?: string;
    issue?: string;
    company?: string;
  }) {
    return this.request<{
      id: number;
      tenant_id: string;
      user_id: string;
      narrative: string;
      product?: string;
      issue?: string;
      company?: string;
      created_at: string;
    }>('/api/v1/complaints/', {
      method: 'POST',
      body: JSON.stringify(complaintData),
    });
  }

  async getComplaints(params?: {
    skip?: number;
    limit?: number;
    product?: string;
    issue?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.append('skip', params.skip.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.product) searchParams.append('product', params.product);
    if (params?.issue) searchParams.append('issue', params.issue);

    return this.request<Array<{
      id: number;
      tenant_id: string;
      user_id: string;
      narrative: string;
      product?: string;
      issue?: string;
      company?: string;
      created_at: string;
      risk_score?: number;
      risk_category?: string;
    }>>(`/api/v1/complaints/?${searchParams.toString()}`);
  }

  async getComplaintAnalysis(complaintId: number) {
    return this.request<{
      complaint_id: number;
      entities: Record<string, any>;
      classification: Record<string, string>;
      risk_assessment: Record<string, any>;
      similar_complaints: Array<any>;
      benchmarks: Record<string, any>;
      agent_communications?: Array<{
        timestamp: number;
        from_agent: string;
        to_agent: string;
        message: string;
      }>;
    }>(`/api/v1/complaints/${complaintId}/analysis`);
  }

  // Statistics endpoints
  async getComplaintStats(params?: {
    start_date?: string;
    end_date?: string;
    product?: string;
    issue?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.start_date) searchParams.append('start_date', params.start_date);
    if (params?.end_date) searchParams.append('end_date', params.end_date);
    if (params?.product) searchParams.append('product', params.product);
    if (params?.issue) searchParams.append('issue', params.issue);

    return this.request<{
      total_complaints: number;
      avg_resolution_time: number;
      satisfaction_rate: number;
      high_risk_percentage: number;
      top_issues: Array<{ issue: string; count: number }>;
      trends: Record<string, any>;
    }>(`/api/v1/stats/?${searchParams.toString()}`);
  }

  async getBenchmarks(tenantId?: string) {
    const searchParams = new URLSearchParams();
    if (tenantId) searchParams.append('tenant_id', tenantId);

    return this.request<{
      tenant_performance: Record<string, any>;
      industry_average: Record<string, any>;
      peer_comparison: Array<any>;
    }>(`/api/v1/stats/benchmarks?${searchParams.toString()}`);
  }

  // Risk assessment endpoints
  async getRiskAssessments(params?: {
    skip?: number;
    limit?: number;
    category?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.append('skip', params.skip.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.category) searchParams.append('category', params.category);

    return this.request<Array<{
      complaint_id: number;
      risk_score: number;
      risk_category: string;
      factors: Record<string, any>;
      model_version: string;
      confidence: number;
    }>>(`/api/v1/risk/?${searchParams.toString()}`);
  }

  async getHighRiskAlerts() {
    return this.request<{
      alerts: Array<{
        complaint_id: number;
        narrative_preview: string;
        risk_score: number;
        risk_category: string;
        factors: Record<string, any>;
        created_at: string;
        urgency: string;
      }>;
      total_count: number;
      critical_count: number;
      generated_at: string;
    }>('/api/v1/risk/high-risk/alerts');
  }

  // Solution endpoints
  async getSolutions(params?: {
    skip?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.append('skip', params.skip.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return this.request<Array<{
      id: number;
      complaint_id: number;
      tenant_id: string;
      solution_text: string;
      resolution_strategy: string;
      created_at: string;
    }>>(`/api/v1/solutions/?${searchParams.toString()}`);
  }

  async getSolutionByComplaint(complaintId: number) {
    return this.request<{
      id: number;
      complaint_id: number;
      tenant_id: string;
      solution_text: string;
      resolution_strategy: string;
      created_at: string;
    }>(`/api/v1/solutions/${complaintId}`);
  }

  async getSolutionLetter(complaintId: number, format: string = 'text') {
    return this.request<{
      format: string;
      content: string;
      resolution_strategy?: string;
      complaint_id?: number;
      created_at?: string;
    }>(`/api/v1/solutions/${complaintId}/letter?format=${format}`);
  }

  // Feedback endpoints
  async createFeedback(feedbackData: {
    complaint_id: number;
    rating: number;
    comment?: string;
  }) {
    return this.request<{
      id: number;
      complaint_id: number;
      tenant_id: string;
      rating: number;
      comment?: string;
      created_at: string;
    }>('/api/v1/feedback/', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  }

  async getFeedbackAnalytics() {
    return this.request<{
      average_rating: number;
      total_feedback: number;
      satisfaction_rate: number;
      rating_distribution: Record<string, number>;
      insights: {
        most_common_rating: string;
        improvement_needed: boolean;
        performance_level: string;
      };
    }>('/api/v1/feedback/analytics/summary');
  }

  // Admin endpoints
  async getTenants(params?: {
    skip?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.append('skip', params.skip.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    return this.request<Array<{
      id: string;
      name: string;
      domain: string;
      is_active: boolean;
      settings: Record<string, any>;
      created_at: string;
    }>>(`/api/v1/admin/tenants?${searchParams.toString()}`);
  }

  async getTenantUsers(params?: {
    skip?: number;
    limit?: number;
    role?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.append('skip', params.skip.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.role) searchParams.append('role', params.role);

    return this.request<Array<{
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      tenant_id: string;
      role: string;
      is_active: boolean;
      created_at: string;
    }>>(`/api/v1/admin/users?${searchParams.toString()}`);
  }

  async getAuditLogs(params?: {
    skip?: number;
    limit?: number;
    action?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.skip) searchParams.append('skip', params.skip.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.action) searchParams.append('action', params.action);

    return this.request<Array<{
      id: number;
      tenant_id: string;
      user_id: string;
      action: string;
      payload: Record<string, any>;
      created_at: string;
    }>>(`/api/v1/admin/audit-logs?${searchParams.toString()}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types for use in components
export type {
  ApiResponse
};