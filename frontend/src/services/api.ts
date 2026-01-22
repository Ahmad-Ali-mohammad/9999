// Currency Service
export const currencyService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/currencies`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
async function handleResponse(response: Response): Promise<any> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }
  return response.json();
}

// Auth Service
export const authService = {
  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  async register(data: { name: string; email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async googleLogin(googleData: any) {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleData),
    });
    return handleResponse(response);
  },

  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async updateProfile(data: {
    name?: string;
    email?: string;
    currency?: string;
    incomePattern?: string;
    currentPassword?: string;
    newPassword?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },
};

// Dashboard Service
export const dashboardService = {
  async getOverview() {
    const response = await fetch(`${API_BASE_URL}/dashboard/overview`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getStats(period: string = 'month') {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats?period=${period}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Transactions Service
export const transactionService = {
  async getAll(filters?: any) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/transactions?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async create(data: any) {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async update(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Accounts Service
export const accountService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/accounts`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getById(id: string) {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async create(data: any) {
    const response = await fetch(`${API_BASE_URL}/accounts`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async update(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Budgets Service
export const budgetService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/budgets`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getById(id: string) {
    const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async create(data: any) {
    const response = await fetch(`${API_BASE_URL}/budgets`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async update(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Goals Service
export const goalService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/goals`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getById(id: string) {
    const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async create(data: any) {
    const response = await fetch(`${API_BASE_URL}/goals`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async update(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async addFunds(id: string, amount: number) {
    const response = await fetch(`${API_BASE_URL}/goals/${id}/add`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ amount }),
    });
    return handleResponse(response);
  },
};

export const goalTransactionService = {
  async getAll(goalId?: number) {
    const params = new URLSearchParams();
    if (goalId) params.append('goalId', goalId.toString());
    const response = await fetch(`${API_BASE_URL}/goal-transactions?${params}`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  async getById(id: string) {
    const response = await fetch(`${API_BASE_URL}/goal-transactions/${id}`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },

  async create(data: { goalId: number; amount: number; description?: string; occurredAt?: string }) {
    const response = await fetch(`${API_BASE_URL}/goal-transactions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async update(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/goal-transactions/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/goal-transactions/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Categories Service
export const categoryService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async getById(id: string) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async create(data: any) {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async update(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Reports Service
export const reportService = {
  async getFinancialSummary(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await fetch(
      `${API_BASE_URL}/reports/summary?${params}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  async getCategoryBreakdown(startDate?: string, endDate?: string, type: string = 'expense') {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    params.append('type', type);
    const response = await fetch(
      `${API_BASE_URL}/reports/category-breakdown?${params}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  async getMonthlyTrends(months: number = 12) {
    const response = await fetch(
      `${API_BASE_URL}/reports/monthly-trends?months=${months}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  async getCashFlow(period: string = 'monthly') {
    const response = await fetch(
      `${API_BASE_URL}/reports/cash-flow?period=${period}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};

// Tags Service
export const tagService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/tags`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async create(data: any) {
    const response = await fetch(`${API_BASE_URL}/tags`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async update(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/tags/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Projects Service
export const projectService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async create(data: any) {
    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async update(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async analyze(data: any) {
    const response = await fetch(`${API_BASE_URL}/projects/analyze`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }
};

// Alerts Service
export const alertService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/alerts`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async markAsRead(id: string) {
    const response = await fetch(`${API_BASE_URL}/alerts/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/alerts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async markAllAsRead() {
    const response = await fetch(`${API_BASE_URL}/alerts/mark-all-read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async checkBudgets() {
    const response = await fetch(`${API_BASE_URL}/alerts/check-budgets`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async checkGoals() {
    const response = await fetch(`${API_BASE_URL}/alerts/check-goals`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Receipts Service
export const receiptService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/receipts`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async create(data: any) {
    const isFormData = data instanceof FormData;
    const headers = isFormData
      ? { ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}) }
      : getAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/receipts`, {
      method: 'POST',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/receipts/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Budget Categories Service
export const budgetCategoryService = {
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/budget-categories`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  async create(data: any) {
    const response = await fetch(`${API_BASE_URL}/budget-categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async update(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/budget-categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  async delete(id: string) {
    const response = await fetch(`${API_BASE_URL}/budget-categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};
