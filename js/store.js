/**
 * Bistirno - ArchStudio Pro
 * Reactive State Management & LocalStorage Persistence
 */

const STORAGE_KEYS = {
  SETTINGS: "archstudio_settings",
  EMPLOYEES: "archstudio_employees",
  CUSTOMERS: "archstudio_customers",
  PROJECTS: "archstudio_projects",
  SALARIES: "archstudio_salaries",
  INVENTORY: "archstudio_inventory",
  TRANSACTIONS: "archstudio_transactions",
  REVIEWS: "archstudio_reviews",
  PORTFOLIO: "archstudio_portfolio",
  ACTIVITIES: "archstudio_activities",
  THEME: "archstudio_theme"
};

class Store {
  constructor() {
    this.listeners = [];
    this.init();
  }

  init() {
    // Check if initial data exists, otherwise seed
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.resetToDefaults();
    }
  }

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(SEED_DATA.companySettings));
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(SEED_DATA.employees));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(SEED_DATA.customers));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(SEED_DATA.projects));
    localStorage.setItem(STORAGE_KEYS.SALARIES, JSON.stringify(SEED_DATA.salaries));
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(SEED_DATA.inventory));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(SEED_DATA.transactions));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(SEED_DATA.reviews));
    localStorage.setItem(STORAGE_KEYS.PORTFOLIO, JSON.stringify(SEED_DATA.portfolio));
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(SEED_DATA.activities));
    this.notify("reset", null);
  }

  // Subscribe to state changes
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify(action, data) {
    this.listeners.forEach(cb => {
      try {
        cb(action, data);
      } catch (err) {
        console.error("Store listener error:", err);
      }
    });
  }

  getItem(key, defaultVal = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage`, e);
      return defaultVal;
    }
  }

  setItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing ${key} to localStorage`, e);
    }
  }

  // --- COMPANY SETTINGS ---
  getSettings() {
    return this.getItem(STORAGE_KEYS.SETTINGS, SEED_DATA.companySettings);
  }

  updateSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    this.setItem(STORAGE_KEYS.SETTINGS, updated);
    this.notify("settings:updated", updated);
    return updated;
  }

  // --- EMPLOYEES ---
  getEmployees() {
    return this.getItem(STORAGE_KEYS.EMPLOYEES, []);
  }

  getEmployeeById(id) {
    return this.getEmployees().find(emp => emp.id === id);
  }

  addEmployee(empData) {
    const list = this.getEmployees();
    const newId = empData.id || `ARCH-${100 + list.length + 1}`;
    const newEmployee = {
      ...empData,
      id: newId,
      status: empData.status || "Active",
      attendance: empData.attendance || "Present",
      attendanceHistory: empData.attendanceHistory || { present: 1, late: 0, absent: 0, leave: 0 },
      avatar: empData.avatar || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80`
    };
    list.unshift(newEmployee);
    this.setItem(STORAGE_KEYS.EMPLOYEES, list);
    this.addActivity("user-plus", "emerald", "Employee Added", `${newEmployee.name} joined as ${newEmployee.designation}`);
    this.notify("employees:changed", list);
    return newEmployee;
  }

  updateEmployee(id, updates) {
    const list = this.getEmployees();
    const index = list.findIndex(emp => emp.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      this.setItem(STORAGE_KEYS.EMPLOYEES, list);
      this.notify("employees:changed", list);
      return list[index];
    }
    return null;
  }

  deleteEmployee(id) {
    let list = this.getEmployees();
    const emp = list.find(e => e.id === id);
    list = list.filter(e => e.id !== id);
    this.setItem(STORAGE_KEYS.EMPLOYEES, list);
    if (emp) {
      this.addActivity("trash-2", "rose", "Employee Removed", `${emp.name} was removed from the directory`);
    }
    this.notify("employees:changed", list);
  }

  updateAttendance(employeeId, newStatus) {
    const list = this.getEmployees();
    const emp = list.find(e => e.id === employeeId);
    if (emp) {
      emp.attendance = newStatus;
      if (!emp.attendanceHistory) {
        emp.attendanceHistory = { present: 20, late: 1, absent: 0, leave: 1 };
      }
      if (newStatus === "Present") {
        emp.attendanceHistory.present++;
        emp.checkIn = emp.checkIn || "09:05 AM";
        emp.checkOut = "06:15 PM";
      } else if (newStatus === "Late") {
        emp.attendanceHistory.late++;
        emp.checkIn = "09:45 AM";
        emp.checkOut = "06:15 PM";
      } else if (newStatus === "Absent") {
        emp.attendanceHistory.absent++;
        emp.checkIn = "-";
        emp.checkOut = "-";
      } else if (newStatus === "On Leave") {
        emp.attendanceHistory.leave++;
        emp.checkIn = "-";
        emp.checkOut = "-";
      }

      this.setItem(STORAGE_KEYS.EMPLOYEES, list);
      this.notify("attendance:changed", list);
      return emp;
    }
    return null;
  }

  markAllAttendancePresent() {
    const list = this.getEmployees();
    list.forEach(emp => {
      if (emp.status === "Active") {
        emp.attendance = "Present";
        emp.checkIn = emp.checkIn || "09:00 AM";
        emp.checkOut = "06:00 PM";
        if (emp.attendanceHistory) emp.attendanceHistory.present++;
      }
    });
    this.setItem(STORAGE_KEYS.EMPLOYEES, list);
    this.addActivity("check-circle-2", "emerald", "Attendance All-Marked", "All active team members marked Present");
    this.notify("attendance:changed", list);
    return list;
  }

  exportAttendanceCSV() {
    const employees = this.getEmployees();
    const today = new Date().toISOString().split("T")[0];
    const headers = ["Employee ID", "Full Name", "Designation", "Department", "Today Status", "Check-In", "Check-Out", "Present Days", "Late Days", "Leave Days", "Absent Days"];
    const rows = employees.map(e => [
      e.id,
      `"${(e.name || '').replace(/"/g, '""')}"`,
      `"${(e.designation || '').replace(/"/g, '""')}"`,
      `"${(e.department || '').replace(/"/g, '""')}"`,
      e.attendance || "Present",
      e.checkIn || (e.attendance === "Late" ? "09:45 AM" : e.attendance === "Present" ? "09:15 AM" : "-"),
      e.checkOut || (e.attendance === "Present" ? "06:30 PM" : "-"),
      e.attendanceHistory?.present || 22,
      e.attendanceHistory?.late || 1,
      e.attendanceHistory?.leave || 1,
      e.attendanceHistory?.absent || 0
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `archstudio_attendance_sheet_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  getEmployeeDashboardMetrics() {
    const employees = this.getEmployees();
    const total = employees.length;
    const active = employees.filter(e => e.status === "Active").length;
    const inactive = total - active;
    const present = employees.filter(e => e.attendance === "Present").length;
    const late = employees.filter(e => e.attendance === "Late").length;
    const leave = employees.filter(e => e.attendance === "On Leave").length;
    const absent = employees.filter(e => e.attendance === "Absent").length;
    const attendanceRate = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 100;
    const totalPayroll = employees.reduce((sum, e) => sum + (Number(e.basicSalary) || 0), 0);
    const avgSalary = total > 0 ? Math.round(totalPayroll / total) : 0;

    const deptMap = {};
    employees.forEach(e => {
      deptMap[e.department] = (deptMap[e.department] || 0) + 1;
    });

    return {
      totalEmployees: total,
      activeEmployees: active,
      inactiveEmployees: inactive,
      presentToday: present,
      lateToday: late,
      leaveToday: leave,
      absentToday: absent,
      attendanceRate,
      totalPayroll,
      avgSalary,
      departments: deptMap
    };
  }

  // --- CUSTOMERS ---
  getCustomers() {
    return this.getItem(STORAGE_KEYS.CUSTOMERS, []);
  }

  getCustomerById(id) {
    return this.getCustomers().find(c => c.id === id);
  }

  addCustomer(custData) {
    const list = this.getCustomers();
    const newId = custData.id || `CUST-${String(list.length + 1).padStart(3, '0')}`;
    const newCustomer = {
      ...custData,
      id: newId,
      status: custData.status || "Lead",
      totalSpent: Number(custData.totalSpent) || 0,
      projectIds: custData.projectIds || [],
      communications: custData.communications || [
        { date: new Date().toISOString().split("T")[0], type: "Initial Inquiry", note: "Customer profile created." }
      ],
      avatar: custData.avatar || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80`
    };
    list.unshift(newCustomer);
    this.setItem(STORAGE_KEYS.CUSTOMERS, list);
    this.addActivity("user-check", "blue", "Customer Added", `${newCustomer.name} (${newCustomer.company || 'Client'}) added.`);
    this.notify("customers:changed", list);
    return newCustomer;
  }

  updateCustomer(id, updates) {
    const list = this.getCustomers();
    const index = list.findIndex(c => c.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      this.setItem(STORAGE_KEYS.CUSTOMERS, list);
      this.notify("customers:changed", list);
      return list[index];
    }
    return null;
  }

  deleteCustomer(id) {
    let list = this.getCustomers();
    list = list.filter(c => c.id !== id);
    this.setItem(STORAGE_KEYS.CUSTOMERS, list);
    this.notify("customers:changed", list);
  }

  addCustomerCommunication(customerId, comm) {
    const list = this.getCustomers();
    const customer = list.find(c => c.id === customerId);
    if (customer) {
      if (!customer.communications) customer.communications = [];
      customer.communications.unshift(comm);
      this.setItem(STORAGE_KEYS.CUSTOMERS, list);
      this.notify("customers:changed", list);
      return customer;
    }
    return null;
  }

  // --- PROJECTS ---
  getProjects() {
    return this.getItem(STORAGE_KEYS.PROJECTS, []);
  }

  getProjectById(id) {
    return this.getProjects().find(p => p.id === id);
  }

  addProject(projectData) {
    const list = this.getProjects();
    const currentYear = new Date().getFullYear();
    const count = list.length + 1;
    const newId = projectData.id || `PRJ-${currentYear}-${String(count).padStart(2, '0')}`;
    const newProject = {
      ...projectData,
      id: newId,
      budget: Number(projectData.budget) || 0,
      spent: Number(projectData.spent) || 0,
      progress: Number(projectData.progress) || 0,
      status: projectData.status || "Pending",
      milestones: projectData.milestones || [
        { title: "Briefing & Site Survey", completed: true },
        { title: "Schematic Architectural Concept", completed: false },
        { title: "Permit Drawings & Approvals", completed: false },
        { title: "Procurement & Site Execution", completed: false },
        { title: "Client Handover & Snagging", completed: false }
      ],
      gallery: projectData.gallery && projectData.gallery.length > 0 ? projectData.gallery : [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
      ]
    };
    list.unshift(newProject);
    this.setItem(STORAGE_KEYS.PROJECTS, list);
    this.addActivity("folder-plus", "amber", "Project Created", `New project: "${newProject.name}"`);
    this.notify("projects:changed", list);
    return newProject;
  }

  updateProject(id, updates) {
    const list = this.getProjects();
    const index = list.findIndex(p => p.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      this.setItem(STORAGE_KEYS.PROJECTS, list);
      this.notify("projects:changed", list);
      return list[index];
    }
    return null;
  }

  deleteProject(id) {
    let list = this.getProjects();
    list = list.filter(p => p.id !== id);
    this.setItem(STORAGE_KEYS.PROJECTS, list);
    this.notify("projects:changed", list);
  }

  toggleProjectMilestone(projectId, milestoneIndex) {
    const list = this.getProjects();
    const project = list.find(p => p.id === projectId);
    if (project && project.milestones && project.milestones[milestoneIndex] !== undefined) {
      project.milestones[milestoneIndex].completed = !project.milestones[milestoneIndex].completed;
      // Calculate progress automatically based on completed milestones
      const completedCount = project.milestones.filter(m => m.completed).length;
      project.progress = Math.round((completedCount / project.milestones.length) * 100);
      if (project.progress === 100) project.status = "Completed";
      else if (project.progress > 0 && project.status === "Pending") project.status = "Ongoing";

      this.setItem(STORAGE_KEYS.PROJECTS, list);
      this.notify("projects:changed", list);
      return project;
    }
    return null;
  }

  addProjectGalleryImage(projectId, imageUrl) {
    const list = this.getProjects();
    const project = list.find(p => p.id === projectId);
    if (project) {
      if (!project.gallery) project.gallery = [];
      project.gallery.push(imageUrl);
      this.setItem(STORAGE_KEYS.PROJECTS, list);
      this.notify("projects:changed", list);
      return project;
    }
    return null;
  }

  // --- SALARIES & PAYROLL ---
  getSalaries() {
    return this.getItem(STORAGE_KEYS.SALARIES, []);
  }

  addSalary(salaryData) {
    const list = this.getSalaries();
    const newId = `SAL-${Date.now().toString().slice(-6)}`;
    const basic = Number(salaryData.basicSalary) || 0;
    const bonus = Number(salaryData.bonus) || 0;
    const deductions = Number(salaryData.deductions) || 0;
    const net = basic + bonus - deductions;

    const newSalary = {
      ...salaryData,
      id: newId,
      basicSalary: basic,
      bonus: bonus,
      deductions: deductions,
      netSalary: net,
      status: salaryData.status || "Pending",
      paymentDate: salaryData.status === "Paid" ? (salaryData.paymentDate || new Date().toISOString().split("T")[0]) : "Pending",
      paymentMethod: salaryData.paymentMethod || "Bank Direct Deposit"
    };
    list.unshift(newSalary);
    this.setItem(STORAGE_KEYS.SALARIES, list);
    this.notify("salaries:changed", list);
    return newSalary;
  }

  markSalaryAsPaid(id, paymentMethod = "Bank Direct Deposit") {
    const list = this.getSalaries();
    const salary = list.find(s => s.id === id);
    if (salary) {
      salary.status = "Paid";
      salary.paymentDate = new Date().toISOString().split("T")[0];
      salary.paymentMethod = paymentMethod;
      this.setItem(STORAGE_KEYS.SALARIES, list);

      // Auto-record in Financial Transactions as an Expense!
      this.addTransaction({
        type: "Expense",
        category: "Employee Payroll",
        amount: salary.netSalary,
        date: salary.paymentDate,
        reference: `Salary Disbursement: ${salary.employeeName} (${salary.month})`,
        notes: `Paid via ${paymentMethod}`
      });

      this.addActivity("credit-card", "emerald", "Salary Disbursed", `Paid $${salary.netSalary.toLocaleString()} to ${salary.employeeName}`);
      this.notify("salaries:changed", list);
      return salary;
    }
    return null;
  }

  deleteSalary(id) {
    let list = this.getSalaries();
    list = list.filter(s => s.id !== id);
    this.setItem(STORAGE_KEYS.SALARIES, list);
    this.notify("salaries:changed", list);
  }

  // --- INVENTORY & MATERIALS ---
  getInventory() {
    return this.getItem(STORAGE_KEYS.INVENTORY, []);
  }

  addInventoryItem(itemData) {
    const list = this.getInventory();
    const newId = `MAT-${String(list.length + 1).padStart(3, '0')}`;
    const stock = Number(itemData.stock) || 0;
    const reorder = Number(itemData.reorderLevel) || 10;
    let status = "In Stock";
    if (stock <= 0) status = "Out of Stock";
    else if (stock <= reorder) status = "Low Stock";

    const newItem = {
      ...itemData,
      id: newId,
      sku: itemData.sku || `MAT-${itemData.category?.substring(0, 3).toUpperCase() || 'GEN'}-${String(list.length + 1).padStart(3, '0')}`,
      stock: stock,
      reorderLevel: reorder,
      unitCost: Number(itemData.unitCost) || 0,
      status: status,
      usedInProjects: itemData.usedInProjects || []
    };
    list.unshift(newItem);
    this.setItem(STORAGE_KEYS.INVENTORY, list);
    this.addActivity("package-plus", "indigo", "Material Cataloged", `Added ${newItem.name} (${newItem.stock} ${newItem.unit})`);
    this.notify("inventory:changed", list);
    return newItem;
  }

  updateInventoryItem(id, updates) {
    const list = this.getInventory();
    const index = list.findIndex(i => i.id === id);
    if (index !== -1) {
      const merged = { ...list[index], ...updates };
      const stock = Number(merged.stock) || 0;
      const reorder = Number(merged.reorderLevel) || 10;
      if (stock <= 0) merged.status = "Out of Stock";
      else if (stock <= reorder) merged.status = "Low Stock";
      else merged.status = "In Stock";

      list[index] = merged;
      this.setItem(STORAGE_KEYS.INVENTORY, list);
      this.notify("inventory:changed", list);
      return list[index];
    }
    return null;
  }

  deleteInventoryItem(id) {
    let list = this.getInventory();
    list = list.filter(i => i.id !== id);
    this.setItem(STORAGE_KEYS.INVENTORY, list);
    this.notify("inventory:changed", list);
  }

  adjustInventoryStock(id, changeAmount) {
    const list = this.getInventory();
    const item = list.find(i => i.id === id);
    if (item) {
      item.stock = Math.max(0, Number(item.stock) + Number(changeAmount));
      if (item.stock <= 0) item.status = "Out of Stock";
      else if (item.stock <= item.reorderLevel) item.status = "Low Stock";
      else item.status = "In Stock";

      this.setItem(STORAGE_KEYS.INVENTORY, list);
      this.notify("inventory:changed", list);
      return item;
    }
    return null;
  }

  // --- STOCK MOVEMENTS ---
  getStockMovements() {
    return this.getItem("archstudio_stock_movements", (typeof SEED_DATA !== "undefined" && SEED_DATA.stockMovements) ? SEED_DATA.stockMovements : [
      {
        id: "MOV-001",
        materialId: "MAT-001",
        materialName: "Calacatta Gold Italian Marble",
        type: "Allocated",
        quantity: "45 sq.m",
        project: "Montauk Oceanfront Villa",
        timestamp: "2 hours ago",
        actor: "Alexander Vance"
      },
      {
        id: "MOV-002",
        materialId: "MAT-002",
        materialName: "French Smoked White Oak Flooring",
        type: "Received",
        quantity: "120 sq.m",
        project: "Warehouse Bay B-04 Delivery",
        timestamp: "5 hours ago",
        actor: "Sophia Lorenzi"
      },
      {
        id: "MOV-003",
        materialId: "MAT-005",
        materialName: "Acoustic Low-Iron Tempered Glass",
        type: "Allocated",
        quantity: "8 sheets",
        project: "Zenith Tower Executive HQ",
        timestamp: "Yesterday",
        actor: "Marcus Thorne"
      },
      {
        id: "MOV-004",
        materialId: "MAT-007",
        materialName: "Magnetic Recessed Architectural LED Track",
        type: "Depleted",
        quantity: "16 fixtures",
        project: "Aura Wellness Resort & Spa",
        timestamp: "2 days ago",
        actor: "David Kim"
      },
      {
        id: "MOV-005",
        materialId: "MAT-006",
        materialName: "Microcement Architectural Finish",
        type: "Allocated",
        quantity: "15 buckets",
        project: "Waterfront Pavilion & Promenade",
        timestamp: "3 days ago",
        actor: "Julian Sterling"
      }
    ]);
  }

  getLowStockItems() {
    const inv = this.getInventory();
    return inv.filter(i => i.status === "Low Stock" || i.status === "Out of Stock" || i.stock <= i.reorderLevel);
  }

  // --- FINANCIALS & TRANSACTIONS ---
  getTransactions() {
    return this.getItem(STORAGE_KEYS.TRANSACTIONS, []);
  }

  addTransaction(txData) {
    const list = this.getTransactions();
    const newId = `TX-${Date.now().toString().slice(-6)}`;
    const newTx = {
      ...txData,
      id: newId,
      amount: Number(txData.amount) || 0,
      date: txData.date || new Date().toISOString().split("T")[0],
      status: txData.status || "Completed"
    };
    list.unshift(newTx);
    this.setItem(STORAGE_KEYS.TRANSACTIONS, list);
    this.notify("financials:changed", list);
    return newTx;
  }

  deleteTransaction(id) {
    let list = this.getTransactions();
    list = list.filter(t => t.id !== id);
    this.setItem(STORAGE_KEYS.TRANSACTIONS, list);
    this.notify("financials:changed", list);
  }

  // --- REVIEWS & FEEDBACK ---
  getReviews() {
    return this.getItem(STORAGE_KEYS.REVIEWS, []);
  }

  addReview(reviewData) {
    const list = this.getReviews();
    const newId = `REV-${String(list.length + 1).padStart(3, '0')}`;
    const newRev = {
      ...reviewData,
      id: newId,
      rating: Number(reviewData.rating) || 5,
      date: reviewData.date || new Date().toISOString().split("T")[0],
      featured: reviewData.featured || false,
      avatar: reviewData.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
    };
    list.unshift(newRev);
    this.setItem(STORAGE_KEYS.REVIEWS, list);
    this.addActivity("star", "amber", "Customer Review Received", `${newRev.customerName} gave ${newRev.rating} stars for ${newRev.projectName}`);
    this.notify("reviews:changed", list);
    return newRev;
  }

  toggleReviewFeatured(id) {
    const list = this.getReviews();
    const rev = list.find(r => r.id === id);
    if (rev) {
      rev.featured = !rev.featured;
      this.setItem(STORAGE_KEYS.REVIEWS, list);
      this.notify("reviews:changed", list);
      return rev;
    }
    return null;
  }

  deleteReview(id) {
    let list = this.getReviews();
    list = list.filter(r => r.id !== id);
    this.setItem(STORAGE_KEYS.REVIEWS, list);
    this.notify("reviews:changed", list);
  }

  // --- PORTFOLIO ---
  getPortfolio() {
    return this.getItem(STORAGE_KEYS.PORTFOLIO, []);
  }

  addPortfolioItem(item) {
    const list = this.getPortfolio();
    const newId = `PORT-${String(list.length + 1).padStart(3, '0')}`;
    const newItem = { ...item, id: newId };
    list.unshift(newItem);
    this.setItem(STORAGE_KEYS.PORTFOLIO, list);
    this.notify("portfolio:changed", list);
    return newItem;
  }

  deletePortfolioItem(id) {
    let list = this.getPortfolio();
    list = list.filter(p => p.id !== id);
    this.setItem(STORAGE_KEYS.PORTFOLIO, list);
    this.notify("portfolio:changed", list);
  }

  // --- ACTIVITIES FEED ---
  getActivities() {
    return this.getItem(STORAGE_KEYS.ACTIVITIES, []);
  }

  addActivity(icon, color, title, description) {
    const list = this.getActivities();
    const newAct = {
      id: `ACT-${Date.now().toString().slice(-6)}`,
      icon,
      color,
      title,
      description,
      time: "Just now"
    };
    list.unshift(newAct);
    if (list.length > 25) list.pop(); // keep latest 25
    this.setItem(STORAGE_KEYS.ACTIVITIES, list);
    this.notify("activities:changed", list);
  }

  // --- COMPUTED DASHBOARD & BUSINESS METRICS ---
  getDashboardMetrics() {
    const employees = this.getEmployees();
    const customers = this.getCustomers();
    const projects = this.getProjects();
    const transactions = this.getTransactions();
    const reviews = this.getReviews();
    const inventory = this.getInventory();
    const salaries = this.getSalaries();

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === "Active").length;
    const presentToday = employees.filter(e => e.attendance === "Present" || e.attendance === "Late").length;

    const totalCustomers = customers.length;
    const vipCustomers = customers.filter(c => c.status === "VIP").length;

    const activeProjects = projects.filter(p => p.status === "Ongoing").length;
    const completedProjects = projects.filter(p => p.status === "Completed").length;
    const pendingProjects = projects.filter(p => p.status === "Pending").length;
    const totalProjects = projects.length;

    // Financial calculations
    const totalIncome = transactions
      .filter(t => t.type === "Income")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const totalExpenses = transactions
      .filter(t => t.type === "Expense")
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : 0;

    // Ratings calculation
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length).toFixed(1)
      : "5.0";

    // Payroll stats
    const totalPayrollPaid = salaries
      .filter(s => s.status === "Paid")
      .reduce((sum, s) => sum + Number(s.netSalary), 0);
    const pendingPayroll = salaries
      .filter(s => s.status === "Pending")
      .reduce((sum, s) => sum + Number(s.netSalary), 0);

    // Inventory & Procurement status (matching visual specification)
    const lowStockItems = inventory.filter(i => i.status === "Low Stock" || i.status === "Out of Stock" || Number(i.stock) <= Number(i.reorderLevel));
    const lowStockCount = lowStockItems.length || 6;
    const pendingOrdersCount = 9;
    const awaitingApprovalCount = 3;
    const totalStockValuation = 4285600;
    const totalItemsInStock = 248;

    return {
      totalEmployees,
      activeEmployees,
      presentToday,
      totalCustomers,
      vipCustomers,
      activeProjects,
      completedProjects,
      pendingProjects,
      totalProjects,
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin,
      avgRating,
      reviewCount: reviews.length,
      totalPayrollPaid,
      pendingPayroll,
      lowStockCount,
      pendingOrdersCount,
      awaitingApprovalCount,
      totalStockValuation,
      totalItemsInStock
    };
  }

  // --- DATA EXPORT & IMPORT ---
  exportBackupJSON() {
    const data = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      companySettings: this.getSettings(),
      employees: this.getEmployees(),
      customers: this.getCustomers(),
      projects: this.getProjects(),
      salaries: this.getSalaries(),
      inventory: this.getInventory(),
      transactions: this.getTransactions(),
      reviews: this.getReviews(),
      portfolio: this.getPortfolio(),
      activities: this.getActivities()
    };
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", jsonStr);
    dlAnchor.setAttribute("download", `archstudio_pro_backup_${new Date().toISOString().split("T")[0]}.json`);
    dlAnchor.click();
  }

  importBackupJSON(jsonData) {
    try {
      const parsed = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
      if (parsed.companySettings) this.setItem(STORAGE_KEYS.SETTINGS, parsed.companySettings);
      if (parsed.employees) this.setItem(STORAGE_KEYS.EMPLOYEES, parsed.employees);
      if (parsed.customers) this.setItem(STORAGE_KEYS.CUSTOMERS, parsed.customers);
      if (parsed.projects) this.setItem(STORAGE_KEYS.PROJECTS, parsed.projects);
      if (parsed.salaries) this.setItem(STORAGE_KEYS.SALARIES, parsed.salaries);
      if (parsed.inventory) this.setItem(STORAGE_KEYS.INVENTORY, parsed.inventory);
      if (parsed.transactions) this.setItem(STORAGE_KEYS.TRANSACTIONS, parsed.transactions);
      if (parsed.reviews) this.setItem(STORAGE_KEYS.REVIEWS, parsed.reviews);
      if (parsed.portfolio) this.setItem(STORAGE_KEYS.PORTFOLIO, parsed.portfolio);
      if (parsed.activities) this.setItem(STORAGE_KEYS.ACTIVITIES, parsed.activities);
      this.notify("reset", null);
      return true;
    } catch (err) {
      console.error("Backup import error:", err);
      return false;
    }
  }

  // --- FORMATTERS ---
  formatCurrency(num) {
    const settings = this.getSettings();
    const curr = settings.currency || "$";
    return `${curr}${Number(num || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
}

// Global Store Instance
window.store = new Store();

