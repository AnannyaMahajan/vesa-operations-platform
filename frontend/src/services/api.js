const API_BASE = 'http://localhost:5000/api';

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
