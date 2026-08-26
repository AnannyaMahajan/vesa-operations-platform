import {
  MOCK_USERS,
  MOCK_DEPARTMENTS,
  MOCK_SLA_CONFIGS,
  MOCK_REQUESTS,
  MOCK_NOTIFICATIONS,
  MOCK_AUDIT_LOGS
} from './mockData';

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

async function handleMockRequest(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : {};

  if (endpoint.startsWith('/auth/login')) {
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === (body.email || '').toLowerCase()) || MOCK_USERS[0];
    return {
      message: 'Authentication successful (Demo Mode)',
      token: 'vesa_demo_jwt_token_2026',
      user
    };
  }

  if (endpoint.startsWith('/auth/register')) {
    const newUser = {
      id: Date.now(),
      email: body.email || 'user@company.com',
      full_name: body.full_name || 'New Employee',
      role: body.role || 'Employee',
      department_id: body.department_id || 1,
      department_name: 'Product Engineering',
      department_code: 'ENG'
    };
    return {
      message: 'User registered successfully (Demo Mode)',
      token: 'vesa_demo_jwt_token_2026',
      user: newUser
    };
  }

  if (endpoint.startsWith('/auth/me')) {
    const saved = localStorage.getItem('vesa_user');
    const user = saved ? JSON.parse(saved) : MOCK_USERS[0];
    return { user };
  }

  if (endpoint.startsWith('/analytics/dashboard')) {
    return {
      total_requests: MOCK_REQUESTS.length,
      pending_approvals: MOCK_REQUESTS.filter(r => r.status === 'APPROVAL_PENDING' || r.status === 'UNDER_REVIEW').length,
      completed_requests: MOCK_REQUESTS.filter(r => r.status === 'COMPLETED').length,
      overdue_requests: MOCK_REQUESTS.filter(r => r.sla_status === 'OVERDUE').length,
      total_users: MOCK_USERS.length,
      sla_compliance_rate: 85,
      department_breakdown: [
        { department_name: 'Product Engineering', count: 2 },
        { department_name: 'Marketing & Growth', count: 1 },
        { department_name: 'Operations & Logistics', count: 1 }
      ]
    };
  }

  if (endpoint.startsWith('/analytics/bottlenecks')) {
    return {
      bottlenecks: [
        { stage_name: 'Department Director Final Sign-off', avg_hours: 42, pending_count: 1 },
        { stage_name: 'Finance Verification', avg_hours: 18, pending_count: 1 }
      ]
    };
  }

  if (endpoint.startsWith('/requests/')) {
    const id = parseInt(endpoint.split('/')[2], 10);
    const reqItem = MOCK_REQUESTS.find(r => r.id === id) || MOCK_REQUESTS[0];
    if (endpoint.endsWith('/action')) {
      reqItem.status = body.action === 'APPROVED' ? 'COMPLETED' : 'REJECTED';
      return { message: `Request ${body.action} successfully (Demo Mode)`, request: reqItem };
    }
    if (endpoint.endsWith('/comments')) {
      const commentObj = {
        id: Date.now(),
        author_name: 'Current User',
        author_role: 'User',
        message: body.message || 'Comment added',
        created_at: new Date().toISOString()
      };
      if (!reqItem.comments) reqItem.comments = [];
      reqItem.comments.push(commentObj);
      return { message: 'Comment added (Demo Mode)', comment: commentObj };
    }
    return { request: reqItem };
  }

  if (endpoint.startsWith('/requests')) {
    if (method === 'POST') {
      const newReq = {
        id: MOCK_REQUESTS.length + 1,
        request_number: `REQ-2026-${String(MOCK_REQUESTS.length + 1).padStart(5, '0')}`,
        title: body.title || 'New Request',
        priority: body.priority || 'MEDIUM',
        status: 'UNDER_REVIEW',
        requester_name: 'Current User',
        department_name: 'Product Engineering',
        created_at: new Date().toISOString(),
        sla_status: 'WITHIN_SLA',
        workflow_stages: []
      };
      MOCK_REQUESTS.unshift(newReq);
      return { message: 'Request created successfully (Demo Mode)', request: newReq };
    }
    return { requests: MOCK_REQUESTS, total: MOCK_REQUESTS.length, page: 1, limit: 100 };
  }

  if (endpoint.startsWith('/admin/users')) {
    return { users: MOCK_USERS };
  }

  if (endpoint.startsWith('/admin/departments')) {
    return { departments: MOCK_DEPARTMENTS };
  }

  if (endpoint.startsWith('/admin/sla-config')) {
    return { sla_configs: MOCK_SLA_CONFIGS };
  }

  if (endpoint.startsWith('/notifications')) {
    return { notifications: MOCK_NOTIFICATIONS };
  }

  if (endpoint.startsWith('/audit-logs')) {
    return { audit_logs: MOCK_AUDIT_LOGS };
  }

  return {};
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('vesa_jwt_token');

  const headers = {
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.error?.message || data?.message || 'API request failed';
      const err = new Error(errorMsg);
      err.status = response.status;
      err.code = data?.error?.code;
      throw err;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' || err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('Network request failed')) {
      console.warn(`[VESA Demo Mode] Backend server unavailable at ${API_BASE}. Active fallback to client-side demo mode.`);
      return handleMockRequest(endpoint, options);
    }
    throw err;
  }
}

export const api = {
  // Auth
  login: (emailOrCredentials, password) => {
    const payload = (typeof emailOrCredentials === 'object' && emailOrCredentials !== null)
      ? emailOrCredentials
      : { email: emailOrCredentials, password };
    return request('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
  },
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),
  getProfile: () => request('/auth/me'),

  // Requests
  createRequest: (reqData) => request('/requests', { method: 'POST', body: JSON.stringify(reqData) }),
  getRequests: (params = {}) => {
    const queryStr = new URLSearchParams(params).toString();
    return request(`/requests?${queryStr}`);
  },
  getRequestById: (id) => request(`/requests/${id}`),
  executeAction: (id, action, comment, next_assignee_id) => {
    const payload = (typeof action === 'object' && action !== null)
      ? action
      : { action, comment, next_assignee_id };
    return request(`/requests/${id}/action`, { method: 'POST', body: JSON.stringify(payload) });
  },
  addComment: (id, commentData) => {
    const payload = (typeof commentData === 'object' && commentData !== null)
      ? commentData
      : { message: commentData };
    return request(`/requests/${id}/comments`, { method: 'POST', body: JSON.stringify(payload) });
  },
  uploadAttachment: (id, formData) => request(`/requests/${id}/attachments`, { method: 'POST', body: formData }),
  addAttachment: (id, formData) => request(`/requests/${id}/attachments`, { method: 'POST', body: formData }),
  downloadAttachment: (id) => `${API_BASE}/requests/attachments/${id}/download`,

  // Analytics
  getDashboardStats: () => request('/analytics/dashboard'),
  getBottlenecks: () => request('/analytics/bottlenecks'),
  exportReport: (format = 'csv') => `${API_BASE}/analytics/export?format=${format}`,

  // Admin
  getUsers: () => request('/admin/users'),
  createUser: (user) => request('/admin/users', { method: 'POST', body: JSON.stringify(user) }),
  updateUser: (id, data) => request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  getDepartments: () => request('/admin/departments'),
  getSlaConfigs: () => request('/admin/sla-config'),
  updateSlaConfig: (id, hours) => request(`/admin/sla-config/${id}`, { method: 'PATCH', body: JSON.stringify({ target_sla_hours: hours }) }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PATCH' }),

  // Audit Logs
  getAuditLogs: (params = {}) => {
    const queryStr = new URLSearchParams(params).toString();
    return request(`/audit-logs?${queryStr}`);
  }
};

export default api;
