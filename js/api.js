/**
 * Bistirno - ArchStudio Pro
 * Centralized API Client for Backend Services
 * Connects frontend UI to http://localhost:5000/api/v1
 */

const API_BASE_URL = window.API_BASE_URL || "http://localhost:5000/api/v1";

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  getToken() {
    return localStorage.getItem("archstudio_token") || null;
  }

  setToken(token) {
    if (token) {
      localStorage.setItem("archstudio_token", token);
    } else {
      localStorage.removeItem("archstudio_token");
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.message || `HTTP ${response.status}: Request failed`);
      }
      return json;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // --- 1. Authentication & User Management ---
  auth = {
    login: (credentials) => this.request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
    register: (userData) => this.request("/auth/register", { method: "POST", body: JSON.stringify(userData) }),
    getProfile: () => this.request("/auth/me"),
  };

  // --- 2. Employee Management - Salary & Payroll ---
  employees = {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/employees${query ? `?${query}` : ""}`);
    },
    getById: (id) => this.request(`/employees/${id}`),
    create: (data) => this.request("/employees", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => this.request(`/employees/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    updateAttendance: (id, status) => this.request(`/employees/${id}/attendance`, { method: "PATCH", body: JSON.stringify({ status }) }),
    // Payroll
    getPayrollList: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/employees/payroll/list${query ? `?${query}` : ""}`);
    },
    getSalarySlip: (id) => this.request(`/employees/payroll/${id}`),
    generatePayroll: (data) => this.request("/employees/payroll/generate", { method: "POST", body: JSON.stringify(data) }),
    markSalaryPaid: (id, paymentData = {}) => this.request(`/employees/payroll/${id}/pay`, { method: "PATCH", body: JSON.stringify(paymentData) }),
  };

  // --- 3. Customer Management ---
  customers = {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/customers${query ? `?${query}` : ""}`);
    },
    getById: (id) => this.request(`/customers/${id}`),
    create: (data) => this.request("/customers", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => this.request(`/customers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    addTimeline: (id, entry) => this.request(`/customers/${id}/timeline`, { method: "POST", body: JSON.stringify(entry) }),
  };

  // --- 4. Architectural Project Management ---
  projects = {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/projects${query ? `?${query}` : ""}`);
    },
    getById: (id) => this.request(`/projects/${id}`),
    create: (data) => this.request("/projects", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => this.request(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    toggleMilestone: (projectId, milestoneId) => this.request(`/projects/${projectId}/milestones/${milestoneId}/toggle`, { method: "PATCH" }),
  };

  // --- 5. Finance Management ---
  finance = {
    getTransactions: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.request(`/finance/transactions${query ? `?${query}` : ""}`);
    },
    recordTransaction: (data) => this.request("/finance/transactions", { method: "POST", body: JSON.stringify(data) }),
    getSummary: () => this.request("/finance/summary"),
  };

  // --- 6. Reports & Dashboard ---
  reports = {
    getDashboard: () => this.request("/reports/dashboard"),
    getCashflow: () => this.request("/reports/cashflow"),
  };
}

// Global API instance
window.API = new ApiClient(API_BASE_URL);

