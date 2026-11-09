/**
 * Bistirno - ArchStudio Pro
 * Application Controller, Navigation, Modals, Filters & Event Handlers
 */

class App {
  constructor() {
    this.currentView = "dashboard";
    this.init();
  }

  init() {
    this.initTheme();

    // Check URL parameters for direct view routing (?view=...)
    const urlParams = new URLSearchParams(window.location.search);
    const viewParam = urlParams.get("view");
    if (viewParam) {
      this.currentView = viewParam;
    }

    this.bindEvents();
    this.renderCurrentView();

    // Browser back/forward history navigation listener
    window.addEventListener("popstate", (e) => {
      const stateView = e.state && e.state.view;
      const urlView = new URLSearchParams(window.location.search).get("view");
      const targetView = stateView || urlView || "dashboard";
      this.navigate(targetView, false);
    });

    // Subscribe to store updates to keep UI synchronized
    window.store.subscribe((action, data) => {
      this.renderCurrentView(false); // don't push history on state change
    });
  }

  // --- THEME MANAGEMENT (Light architectural background locked as requested) ---
  initTheme() {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("archstudio_theme", "light");
    this.updateThemeButtonIcon();
  }

  toggleTheme() {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("archstudio_theme", "light");
    this.updateThemeButtonIcon();
    if (window.chartManager) {
      window.chartManager.updateAll();
    }
    this.showToast("Light architectural background is permanently active", "info");
  }

  updateThemeButtonIcon() {
    const btnIcon = document.getElementById("theme-toggle-icon");
    if (btnIcon) {
      btnIcon.setAttribute("data-lucide", "sun");
      if (window.lucide) lucide.createIcons();
    }
  }

  // --- NAVIGATION ROUTING ---
  navigate(viewName, pushState = true) {
    this.currentView = viewName;

    // Smoothly update browser URL query without reload
    if (pushState && window.history && window.history.pushState) {
      const url = new URL(window.location.href);
      url.searchParams.set("view", viewName);
      window.history.pushState({ view: viewName }, "", url.toString());
    }

    // Update active state on sidebar links
    document.querySelectorAll(".sidebar-link, .nav-link").forEach(link => {
      if (link.getAttribute("data-view") === viewName) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Update Topbar View Title & Subtitle
    const titleEl = document.getElementById("current-view-title");
    const subEl = document.getElementById("current-view-subtitle");
    if (titleEl) {
      const titles = {
        dashboard: { title: "Dashboard", sub: "Stock, projects and purchases at a glance" },
        inventory: { title: "Products & Materials", sub: "Material inventory, stock in/out and warehouse tracking" },
        projects: { title: "Project Allocation", sub: "Architecture & interior site management" },
        employees: { title: "Users & Roles", sub: "Architects, designers & studio staff directory" },
        attendance: { title: "Daily Attendance", sub: "Architect & studio staff attendance roster" },
        salaries: { title: "Salaries & Payroll", sub: "Employee monthly compensation & payroll register" },
        customers: { title: "Vendors & Clients", sub: "Suppliers, contractors & client portfolio" },
        financials: { title: "Purchase Orders & Ledger", sub: "Material procurement, billing & studio accounting" },
        reports: { title: "Reports & Analytics", sub: "Financial audit, progress tracking & performance metrics" },
        portfolio: { title: "Architecture Portfolio", sub: "Modern buildings, residences & luxury interior showcases" },
        reviews: { title: "Ratings & Reviews", sub: "Client feedback, verified testimonials & service ratings" },
        notifications: { title: "Notifications", sub: "Operational alerts, inventory warnings and studio updates" },
        settings: { title: "Settings", sub: "Studio configuration, admin profile & database management" }
      };
      const info = titles[viewName] || { title: "Bistirno Pro", sub: "Inventory & Architecture Management" };
      titleEl.textContent = info.title;
      if (subEl) subEl.textContent = info.sub;
    }

    // Close mobile sidebar if open
    this.closeMobileMenu();

    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  renderCurrentView(resetScroll = true) {
    const container = document.getElementById("main-content-container");
    if (!container) return;

    let html = "";
    switch (this.currentView) {
      case "dashboard":
        html = window.uiRenderer.renderDashboard();
        break;
      case "projects":
        html = window.uiRenderer.renderProjects();
        break;
      case "employees":
        html = window.uiRenderer.renderEmployees();
        break;
      case "attendance":
        html = window.uiRenderer.renderAttendance();
        break;
      case "salaries":
        html = window.uiRenderer.renderSalaries();
        break;
      case "customers":
        html = window.uiRenderer.renderCustomers();
        break;
      case "inventory":
        html = window.uiRenderer.renderInventory();
        break;
      case "financials":
        html = window.uiRenderer.renderFinancials();
        break;
      case "reviews":
        html = window.uiRenderer.renderReviews();
        break;
      case "reports":
        html = window.uiRenderer.renderReports();
        break;
      case "portfolio":
        html = window.uiRenderer.renderPortfolio();
        break;
      case "notifications":
        html = window.uiRenderer.renderNotifications ? window.uiRenderer.renderNotifications() : "";
        break;
      case "settings":
        html = window.uiRenderer.renderSettings();
        break;
      default:
        html = window.uiRenderer.renderDashboard();
    }

    container.innerHTML = `<div class="view-fade-in">${html}</div>`;
    lucide.createIcons();

    // Trigger charts rendering for dashboard, financials, reviews, reports & employees
    setTimeout(() => {
      if (this.currentView === "dashboard") {
        window.chartManager.renderRevenueExpenseChart();
        window.chartManager.renderProjectStatusChart();
      } else if (this.currentView === "employees" || this.currentView === "attendance") {
        window.chartManager.renderDepartmentShareChart("employeeDeptChart");
        window.chartManager.renderAttendanceWeeklyChart("attendanceWeeklyChart");
      } else if (this.currentView === "financials") {
        window.chartManager.renderFinancialCategoriesChart();
      } else if (this.currentView === "reviews") {
        window.chartManager.renderRatingDistributionChart();
      } else if (this.currentView === "reports") {
        window.chartManager.renderRevenueExpenseChart();
        window.chartManager.renderProjectStatusChart();
        window.chartManager.renderFinancialCategoriesChart();
        window.chartManager.renderDepartmentShareChart();
      }
    }, 50);
  }

  // Stock In / Stock Out Quick Helpers
  openStockInModal() {
    const title = document.getElementById("modal-stock-title");
    const submitBtn = document.getElementById("modal-stock-submit-btn");
    const modeInput = document.getElementById("modal-stock-mode");
    if (title) title.textContent = "Stock In - Add Materials to Inventory";
    if (submitBtn) submitBtn.textContent = "+ Receive Stock";
    if (modeInput) modeInput.value = "in";
    this.openModal("modal-add-stock");
  }

  openStockOutModal() {
    const title = document.getElementById("modal-stock-title");
    const submitBtn = document.getElementById("modal-stock-submit-btn");
    const modeInput = document.getElementById("modal-stock-mode");
    if (title) title.textContent = "Stock Out - Issue Materials to Site";
    if (submitBtn) submitBtn.textContent = "- Issue Stock";
    if (modeInput) modeInput.value = "out";
    this.openModal("modal-add-stock");
  }

  reorderItem(name, category, unitCost) {
    this.openModal("modal-add-purchase-order");
    setTimeout(() => {
      const matInput = document.querySelector("#modal-add-purchase-order input[name='material']");
      const amtInput = document.querySelector("#modal-add-purchase-order input[name='amount']");
      if (matInput) matInput.value = name || "";
      if (amtInput && unitCost) amtInput.value = unitCost * 20;
    }, 50);
  }

  switchMovementTab(range) {
    document.querySelectorAll(".time-tab").forEach(t => {
      if (t.textContent.toLowerCase() === range.toLowerCase()) {
        t.classList.add("active");
      } else {
        t.classList.remove("active");
      }
    });
    this.showToast("Stock movement filtered: " + range.toUpperCase());
  }

  // --- MOBILE SIDEBAR MENU ---
  toggleMobileMenu() {
    const sidebar = document.querySelector(".desktop-sidebar") || document.getElementById("mobile-sidebar");
    const overlay = document.getElementById("mobile-sidebar-backdrop") || document.getElementById("mobile-sidebar-overlay");
    if (sidebar) {
      const isHidden = sidebar.classList.contains("hidden");
      if (isHidden) {
        sidebar.classList.remove("hidden");
        sidebar.classList.add("fixed", "inset-y-0", "left-0", "z-50", "flex", "shadow-2xl");
        if (overlay) overlay.classList.remove("hidden");
      } else {
        sidebar.classList.add("hidden");
        sidebar.classList.remove("fixed", "inset-y-0", "left-0", "z-50", "flex", "shadow-2xl");
        if (overlay) overlay.classList.add("hidden");
      }
    }
  }

  closeMobileMenu() {
    const sidebar = document.querySelector(".desktop-sidebar") || document.getElementById("mobile-sidebar");
    const overlay = document.getElementById("mobile-sidebar-backdrop") || document.getElementById("mobile-sidebar-overlay");
    if (sidebar && sidebar.classList.contains("fixed")) {
      sidebar.classList.add("hidden");
      sidebar.classList.remove("fixed", "inset-y-0", "left-0", "z-50", "flex", "shadow-2xl");
      if (overlay) overlay.classList.add("hidden");
    }
  }

  // --- SALARY SELECTION HELPER ---
  onSalaryEmployeeSelect(empId) {
    if (!empId) return;
    const emp = window.store.getEmployeeById(empId);
    if (emp) {
      const basicInput = document.getElementById("salary-basic-input");
      if (basicInput) basicInput.value = emp.basicSalary;
    }
  }

  // --- EDIT EMPLOYEE HELPER ---
  editEmployee(empId) {
    const emp = window.store.getEmployeeById(empId);
    if (!emp) return;

    const newDesignation = prompt(`Edit designation for ${emp.name}:`, emp.designation);
    if (newDesignation === null) return;

    const newSalary = prompt(`Edit basic salary for ${emp.name}:`, emp.basicSalary);
    if (newSalary === null) return;

    const newStatus = prompt(`Edit status (Active / Inactive) for ${emp.name}:`, emp.status);
    if (newStatus === null) return;

    window.store.updateEmployee(empId, {
      designation: newDesignation.trim() || emp.designation,
      basicSalary: Number(newSalary) || emp.basicSalary,
      status: (newStatus.trim() === "Inactive") ? "Inactive" : "Active"
    });

    this.showToast(`Updated employee details for ${emp.name}`);
  }

  // --- EDIT CUSTOMER HELPER ---
  editCustomer(custId) {
    const cust = window.store.getCustomerById(custId);
    if (!cust) return;

    const newCompany = prompt(`Edit company for ${cust.name}:`, cust.company);
    if (newCompany === null) return;

    const newPhone = prompt(`Edit phone for ${cust.name}:`, cust.phone);
    if (newPhone === null) return;

    const newStatus = prompt(`Edit status (VIP / Active Client / Lead / Past Client) for ${cust.name}:`, cust.status);
    if (newStatus === null) return;

    window.store.updateCustomer(custId, {
      company: newCompany.trim() || cust.company,
      phone: newPhone.trim() || cust.phone,
      status: newStatus.trim() || cust.status
    });

    this.showToast(`Updated client profile for ${cust.name}`);
  }

  // --- MODAL MANAGEMENT ---
  openModal(modalId) {
    if (modalId === "modal-add-salary") {
      this.populateSalaryEmployeeOptions();
    } else if (modalId === "modal-add-project") {
      this.populateClientDatalist();
    }
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
      document.body.classList.add("overflow-hidden");
      lucide.createIcons();
    }
  }

  populateClientDatalist() {
    const datalist = document.getElementById("clients-datalist");
    if (!datalist) return;
    const customers = window.store.getCustomers();
    datalist.innerHTML = customers.map(c => `<option value="${window.uiRenderer.escapeHTML(c.name)}">${window.uiRenderer.escapeHTML(c.company || '')}</option>`).join("");
  }

  populateSalaryEmployeeOptions() {
    const select = document.getElementById("salary-employee-select");
    if (!select) return;
    const employees = window.store.getEmployees();
    select.innerHTML = '<option value="">-- Choose Employee --</option>' + 
      employees.map(e => `<option value="${e.id}">${window.uiRenderer.escapeHTML(e.name)} (${window.uiRenderer.escapeHTML(e.designation)})</option>`).join("");
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      document.body.classList.remove("overflow-hidden");
    }
  }

  // --- TOAST NOTIFICATIONS ---
  showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast-item flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-white text-xs font-semibold backdrop-blur-md border ${
      type === "success" ? "bg-slate-900/95 border-emerald-500/40 text-emerald-400" :
      type === "error" ? "bg-slate-900/95 border-rose-500/40 text-rose-400" :
      "bg-slate-900/95 border-amber-500/40 text-amber-400"
    }`;

    const iconName = type === "success" ? "check-circle-2" : type === "error" ? "alert-circle" : "info";
    toast.innerHTML = `
      <i data-lucide="${iconName}" class="w-4 h-4 flex-shrink-0"></i>
      <span class="text-slate-100">${window.uiRenderer.escapeHTML(message)}</span>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --- PROJECT ACTIONS ---
  handleCreateProject(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const projectData = {
      name: formData.get("name"),
      category: formData.get("category"),
      client: formData.get("client"),
      budget: Number(formData.get("budget")),
      spent: Number(formData.get("spent") || 0),
      location: formData.get("location"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      lead: formData.get("lead"),
      status: formData.get("status") || "Pending",
      description: formData.get("description"),
      gallery: formData.get("image") ? [formData.get("image")] : [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
      ]
    };

    window.store.addProject(projectData);
    this.closeModal("modal-add-project");
    form.reset();
    this.showToast("Architectural project created successfully!");
  }

  showProjectDetails(projectId) {
    const project = window.store.getProjectById(projectId);
    if (!project) return;

    const curr = window.store.getSettings().currency || "$";
    const modalContent = document.getElementById("project-details-content");
    if (!modalContent) return;

    modalContent.innerHTML = `
      <div class="relative h-64 md:h-80 overflow-hidden rounded-2xl mb-6 bg-slate-900">
        <img id="detail-active-img" src="${project.gallery[0]}" alt="${project.name}" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
        <div class="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <span class="px-2.5 py-0.5 rounded font-mono font-bold text-xs bg-black/60 backdrop-blur-md text-amber-400 border border-amber-400/30">${project.id}</span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${window.uiRenderer.getStatusBadgeClass(project.status)}">${project.status}</span>
            </div>
            <h2 class="text-2xl md:text-3xl font-bold font-display text-white leading-tight">${window.uiRenderer.escapeHTML(project.name)}</h2>
            <p class="text-xs text-slate-300 mt-1 flex items-center gap-2">
              <i data-lucide="map-pin" class="w-3.5 h-3.5 inline"></i> ${window.uiRenderer.escapeHTML(project.location)}
              <span>·</span>
              <span>Lead Architect: <strong>${window.uiRenderer.escapeHTML(project.lead)}</strong></span>
            </p>
          </div>

          <div class="bg-black/60 backdrop-blur-md p-3 rounded-xl border border-white/10 text-right">
            <div class="text-[10px] text-slate-300 uppercase font-semibold">Total Budget</div>
            <div class="text-xl font-bold text-amber-400">${curr}${Number(project.budget).toLocaleString()}</div>
            <div class="text-[11px] text-slate-300">Spent: ${curr}${Number(project.spent).toLocaleString()}</div>
          </div>
        </div>
      </div>

      <!-- Description & Metadata -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="md:col-span-2">
          <h4 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Architectural Brief & Description</h4>
          <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
            ${window.uiRenderer.escapeHTML(project.description)}
          </p>

          <!-- Interactive Milestones -->
          <h4 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
            <span>Project Milestones & Deliverables</span>
            <span class="text-xs text-amber-500 font-bold">${project.progress}% Complete</span>
          </h4>
          <div class="space-y-2 mb-6">
            ${(project.milestones || []).map((m, idx) => `
              <div onclick="window.app.toggleMilestone('${project.id}', ${idx})" class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <div class="flex items-center gap-3">
                  <div class="w-5 h-5 rounded-md flex items-center justify-center border ${m.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-400'}">
                    ${m.completed ? '<i data-lucide="check" class="w-3.5 h-3.5"></i>' : ''}
                  </div>
                  <span class="text-xs font-semibold ${m.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}">
                    ${window.uiRenderer.escapeHTML(m.title)}
                  </span>
                </div>
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded ${m.completed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}">
                  ${m.completed ? 'Done' : 'In Progress'}
                </span>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Right Side: Gallery & Client Details -->
        <div class="space-y-6">
          <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <h5 class="font-bold text-slate-900 dark:text-white uppercase text-[11px] mb-2">Commission Client</h5>
            <div>
              <span class="text-slate-400">Name:</span>
              <span class="font-semibold text-slate-800 dark:text-slate-200 ml-1">${window.uiRenderer.escapeHTML(project.client)}</span>
            </div>
            <div>
              <span class="text-slate-400">Company:</span>
              <span class="font-semibold text-slate-800 dark:text-slate-200 ml-1">${window.uiRenderer.escapeHTML(project.clientCompany || 'Direct Client')}</span>
            </div>
            <div>
              <span class="text-slate-400">Start Date:</span>
              <span class="font-semibold text-slate-800 dark:text-slate-200 ml-1">${project.startDate}</span>
            </div>
            <div>
              <span class="text-slate-400">Target Handover:</span>
              <span class="font-semibold text-slate-800 dark:text-slate-200 ml-1">${project.endDate}</span>
            </div>
          </div>

          <!-- Image Gallery Thumbnails -->
          <div>
            <h5 class="font-bold text-slate-900 dark:text-white uppercase text-[11px] mb-2">Renderings & Blueprints</h5>
            <div class="grid grid-cols-3 gap-2">
              ${(project.gallery || []).map((imgUrl, i) => `
                <img 
                  src="${imgUrl}" 
                  alt="" 
                  onclick="document.getElementById('detail-active-img').src = '${imgUrl}'" 
                  class="h-16 w-full object-cover rounded-lg cursor-pointer hover:opacity-80 border border-slate-200 dark:border-slate-700 transition-all" 
                />
              `).join("")}
            </div>

            <!-- Add image to project gallery -->
            <div class="mt-3">
              <input 
                type="url" 
                id="new-gallery-url-${project.id}" 
                placeholder="Paste architectural render URL..." 
                class="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white mb-1.5"
              />
              <button 
                onclick="window.app.addGalleryImageToProject('${project.id}')" 
                class="w-full py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all"
              >
                + Add Image to Gallery
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.openModal("modal-project-details");
    lucide.createIcons();
  }

  toggleMilestone(projectId, milestoneIndex) {
    window.store.toggleProjectMilestone(projectId, milestoneIndex);
    this.showProjectDetails(projectId);
    this.showToast("Project milestone status updated!");
  }

  addGalleryImageToProject(projectId) {
    const input = document.getElementById(`new-gallery-url-${projectId}`);
    if (input && input.value.trim()) {
      window.store.addProjectGalleryImage(projectId, input.value.trim());
      input.value = "";
      this.showProjectDetails(projectId);
      this.showToast("Image added to architectural project gallery!");
    }
  }

  deleteProject(projectId) {
    if (confirm("Are you sure you want to delete this architectural project?")) {
      window.store.deleteProject(projectId);
      this.showToast("Project removed from studio database.", "info");
    }
  }

  filterProjects() {
    const searchVal = (document.getElementById("project-search")?.value || "").toLowerCase();
    const statusVal = document.getElementById("project-status-filter")?.value || "All";
    const catVal = document.getElementById("project-category-filter")?.value || "All";

    const cards = document.querySelectorAll(".project-card");
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const status = card.getAttribute("data-status");
      const category = card.getAttribute("data-category");

      const matchesSearch = text.includes(searchVal);
      const matchesStatus = statusVal === "All" || status === statusVal;
      const matchesCat = catVal === "All" || category === catVal;

      card.style.display = (matchesSearch && matchesStatus && matchesCat) ? "flex" : "none";
    });
  }

  // --- EMPLOYEE ACTIONS ---
  handleCreateEmployee(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const empData = {
      name: formData.get("name"),
      designation: formData.get("designation"),
      department: formData.get("department"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      joiningDate: formData.get("joiningDate") || new Date().toISOString().split("T")[0],
      basicSalary: Number(formData.get("basicSalary")),
      bonus: Number(formData.get("bonus") || 0),
      deductions: Number(formData.get("deductions") || 0),
      status: formData.get("status") || "Active",
      avatar: formData.get("avatar") || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
    };

    window.store.addEmployee(empData);
    this.closeModal("modal-add-employee");
    form.reset();
    this.showToast("New studio employee added successfully!");
  }

  deleteEmployee(id) {
    if (confirm("Are you sure you want to remove this employee from studio records?")) {
      window.store.deleteEmployee(id);
      this.showToast("Employee removed", "info");
    }
  }

  setAttendance(empId, status) {
    window.store.updateAttendance(empId, status);
    this.showToast(`Attendance for team member marked as ${status}`);
    this.renderCurrentView(false);
  }

  switchEmployeeTab(tabName) {
    document.querySelectorAll(".emp-tab-btn").forEach(btn => {
      if (btn.getAttribute("data-tab") === tabName) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    document.querySelectorAll(".emp-panel").forEach(panel => {
      if (panel.id === `emp-panel-${tabName}`) {
        panel.classList.remove("hidden");
      } else {
        panel.classList.add("hidden");
      }
    });

    if (tabName === "overview" && window.chartManager) {
      setTimeout(() => {
        window.chartManager.renderDepartmentShareChart("employeeDeptChart");
        window.chartManager.renderAttendanceWeeklyChart("attendanceWeeklyChart");
      }, 50);
    }
  }

  markAllAttendancePresent() {
    window.store.markAllAttendancePresent();
    this.showToast("All active studio team members marked as Present for today!", "success");
    this.renderCurrentView(false);
  }

  exportAttendanceCSV() {
    window.store.exportAttendanceCSV();
    this.showToast("Employee Attendance Sheet exported to CSV!");
  }

  toggleAttendanceView(viewMode) {
    const dailyView = document.getElementById("attendance-daily-view");
    const monthlyView = document.getElementById("attendance-monthly-view");
    const dailyBtn = document.getElementById("btn-att-view-daily");
    const monthlyBtn = document.getElementById("btn-att-view-monthly");

    if (viewMode === "monthly") {
      if (dailyView) dailyView.classList.add("hidden");
      if (monthlyView) monthlyView.classList.remove("hidden");
      if (dailyBtn) {
        dailyBtn.classList.remove("bg-[#18181B]", "text-white");
        dailyBtn.classList.add("bg-white", "text-[#71717A]");
      }
      if (monthlyBtn) {
        monthlyBtn.classList.remove("bg-white", "text-[#71717A]");
        monthlyBtn.classList.add("bg-[#18181B]", "text-white");
      }
    } else {
      if (dailyView) dailyView.classList.remove("hidden");
      if (monthlyView) monthlyView.classList.add("hidden");
      if (dailyBtn) {
        dailyBtn.classList.remove("bg-white", "text-[#71717A]");
        dailyBtn.classList.add("bg-[#18181B]", "text-white");
      }
      if (monthlyBtn) {
        monthlyBtn.classList.remove("bg-[#18181B]", "text-white");
        monthlyBtn.classList.add("bg-white", "text-[#71717A]");
      }
    }
  }

  filterEmployees() {
    const search = (document.getElementById("employee-search")?.value || "").toLowerCase();
    const dept = document.getElementById("employee-dept-filter")?.value || "All";
    const status = document.getElementById("employee-status-filter")?.value || "All";

    const cards = document.querySelectorAll(".employee-card");
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const cardDept = card.getAttribute("data-dept");
      const cardStatus = card.getAttribute("data-status");

      const matchSearch = text.includes(search);
      const matchDept = dept === "All" || cardDept === dept;
      const matchStatus = status === "All" || cardStatus === status;

      card.style.display = (matchSearch && matchDept && matchStatus) ? "flex" : "none";
    });
  }

  viewEmployeeProfile(empId) {
    const emp = window.store.getEmployeeById(empId);
    if (!emp) return;

    const curr = window.store.getSettings().currency || "$";
    const modalContent = document.getElementById("profile-details-content");
    if (!modalContent) return;

    modalContent.innerHTML = `
      <div class="flex items-start gap-4 mb-6">
        <img src="${emp.avatar}" alt="" class="w-20 h-20 rounded-2xl object-cover border-2 border-amber-500" />
        <div>
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">${emp.id}</span>
            <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${window.uiRenderer.getStatusBadgeClass(emp.status)}">${emp.status}</span>
          </div>
          <h2 class="text-xl font-bold font-display text-slate-900 dark:text-white mt-1">${window.uiRenderer.escapeHTML(emp.name)}</h2>
          <p class="text-xs font-semibold text-amber-500">${window.uiRenderer.escapeHTML(emp.designation)} · ${window.uiRenderer.escapeHTML(emp.department)}</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 text-xs mb-6">
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
          <span class="text-slate-400 block text-[10px] uppercase font-semibold">Email</span>
          <span class="font-medium text-slate-900 dark:text-white">${window.uiRenderer.escapeHTML(emp.email)}</span>
        </div>
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
          <span class="text-slate-400 block text-[10px] uppercase font-semibold">Phone</span>
          <span class="font-medium text-slate-900 dark:text-white">${window.uiRenderer.escapeHTML(emp.phone)}</span>
        </div>
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
          <span class="text-slate-400 block text-[10px] uppercase font-semibold">Joining Date</span>
          <span class="font-medium text-slate-900 dark:text-white">${emp.joiningDate}</span>
        </div>
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
          <span class="text-slate-400 block text-[10px] uppercase font-semibold">Base Compensation</span>
          <span class="font-bold text-emerald-500">${curr}${Number(emp.basicSalary).toLocaleString()} / month</span>
        </div>
      </div>

      <!-- Attendance Breakdown -->
      <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Monthly Attendance Statistics</h4>
      <div class="grid grid-cols-4 gap-2 text-center text-xs mb-6">
        <div class="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold">
          <div>${emp.attendanceHistory?.present || 22}</div>
          <div class="text-[10px] font-normal">Present</div>
        </div>
        <div class="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 font-bold">
          <div>${emp.attendanceHistory?.late || 1}</div>
          <div class="text-[10px] font-normal">Late</div>
        </div>
        <div class="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold">
          <div>${emp.attendanceHistory?.leave || 1}</div>
          <div class="text-[10px] font-normal">Leave</div>
        </div>
        <div class="p-2 rounded-lg bg-rose-500/10 text-rose-500 font-bold">
          <div>${emp.attendanceHistory?.absent || 0}</div>
          <div class="text-[10px] font-normal">Absent</div>
        </div>
      </div>
    `;

    this.openModal("modal-profile-details");
    lucide.createIcons();
  }

  // --- CUSTOMER ACTIONS ---
  handleCreateCustomer(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const custData = {
      name: formData.get("name"),
      company: formData.get("company"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      status: formData.get("status") || "Lead",
      totalSpent: Number(formData.get("totalSpent") || 0)
    };

    window.store.addCustomer(custData);
    this.closeModal("modal-add-customer");
    form.reset();
    this.showToast("Customer added successfully!");
  }

  deleteCustomer(id) {
    if (confirm("Are you sure you want to delete this customer record?")) {
      window.store.deleteCustomer(id);
      this.showToast("Customer removed.", "info");
    }
  }

  viewCustomerProfile(customerId) {
    const cust = window.store.getCustomerById(customerId);
    if (!cust) return;

    const curr = window.store.getSettings().currency || "$";
    const modalContent = document.getElementById("customer-details-content");
    if (!modalContent) return;

    const linkedProjects = window.store.getProjects().filter(p => cust.projectIds?.includes(p.id));

    modalContent.innerHTML = `
      <div class="flex items-start justify-between gap-4 mb-6">
        <div class="flex items-center gap-3">
          <img src="${cust.avatar}" alt="" class="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500" />
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700">${cust.id}</span>
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${window.uiRenderer.getStatusBadgeClass(cust.status)}">${cust.status}</span>
            </div>
            <h2 class="text-xl font-bold font-display text-slate-900 dark:text-white mt-1">${window.uiRenderer.escapeHTML(cust.name)}</h2>
            <p class="text-xs font-semibold text-indigo-500">${window.uiRenderer.escapeHTML(cust.company || 'Private Client')}</p>
          </div>
        </div>
        <div class="text-right">
          <span class="text-[10px] text-slate-400 uppercase font-semibold">Total Commissioned</span>
          <div class="text-xl font-bold text-emerald-500">${curr}${Number(cust.totalSpent || 0).toLocaleString()}</div>
        </div>
      </div>

      <!-- Contact details -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
        <div>
          <span class="text-slate-400 block text-[10px] uppercase font-semibold">Email</span>
          <span class="font-medium text-slate-900 dark:text-white truncate block">${window.uiRenderer.escapeHTML(cust.email)}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px] uppercase font-semibold">Phone</span>
          <span class="font-medium text-slate-900 dark:text-white truncate block">${window.uiRenderer.escapeHTML(cust.phone)}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px] uppercase font-semibold">Headquarters</span>
          <span class="font-medium text-slate-900 dark:text-white truncate block">${window.uiRenderer.escapeHTML(cust.address)}</span>
        </div>
      </div>

      <!-- Commissioned Projects -->
      <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Commissioned Projects (${linkedProjects.length})</h4>
      <div class="space-y-2 mb-6">
        ${linkedProjects.length > 0 ? linkedProjects.map(p => `
          <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <span class="text-xs font-bold text-slate-900 dark:text-white">${window.uiRenderer.escapeHTML(p.name)}</span>
              <div class="text-[11px] text-slate-400">${p.id} · ${p.location}</div>
            </div>
            <div class="text-right">
              <span class="text-xs font-bold text-amber-500">${curr}${Number(p.budget).toLocaleString()}</span>
              <span class="block text-[10px] text-slate-400">${p.status} (${p.progress}%)</span>
            </div>
          </div>
        `).join("") : `<div class="text-xs text-slate-400 italic">No commissioned projects registered yet.</div>`}
      </div>

      <!-- Communication History Log -->
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400">Communication & Meeting Logs</h4>
      </div>

      <div class="space-y-2 mb-4 max-h-48 overflow-y-auto">
        ${(cust.communications || []).map(comm => `
          <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <div class="flex items-center justify-between mb-1">
              <span class="font-semibold text-amber-500">${window.uiRenderer.escapeHTML(comm.type)}</span>
              <span class="text-slate-400 text-[10px]">${comm.date}</span>
            </div>
            <p class="text-slate-600 dark:text-slate-300">${window.uiRenderer.escapeHTML(comm.note)}</p>
          </div>
        `).join("")}
      </div>

      <!-- Add Communication Entry Form -->
      <form onsubmit="window.app.handleAddCommunication(event, '${cust.id}')" class="flex gap-2">
        <input type="text" name="note" placeholder="Log meeting, call note, or site feedback..." required class="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none" />
        <select name="type" class="px-2 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
          <option value="Call">Call</option>
          <option value="Meeting">Meeting</option>
          <option value="Site Visit">Site Visit</option>
          <option value="Email">Email</option>
        </select>
        <button type="submit" class="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs">
          Log Note
        </button>
      </form>
    `;

    this.openModal("modal-customer-details");
    lucide.createIcons();
  }

  handleAddCommunication(e, customerId) {
    e.preventDefault();
    const form = e.target;
    const note = form.note.value;
    const type = form.type.value;

    window.store.addCustomerCommunication(customerId, {
      date: new Date().toISOString().split("T")[0],
      type,
      note
    });

    this.viewCustomerProfile(customerId);
    this.showToast("Communication log recorded!");
  }

  filterCustomers() {
    const search = (document.getElementById("customer-search")?.value || "").toLowerCase();
    const status = document.getElementById("customer-status-filter")?.value || "All";

    const cards = document.querySelectorAll(".customer-card");
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const cardStatus = card.getAttribute("data-status");

      const matchSearch = text.includes(search);
      const matchStatus = status === "All" || cardStatus === status;

      card.style.display = (matchSearch && matchStatus) ? "flex" : "none";
    });
  }

  // --- SALARIES & PAYROLL ACTIONS ---
  handleCreateSalary(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const empId = formData.get("employeeId");
    const emp = window.store.getEmployeeById(empId);

    const salaryData = {
      employeeId: empId,
      employeeName: emp ? emp.name : "Employee",
      designation: emp ? emp.designation : "",
      department: emp ? emp.department : "",
      month: formData.get("month"),
      basicSalary: Number(formData.get("basicSalary")),
      bonus: Number(formData.get("bonus") || 0),
      deductions: Number(formData.get("deductions") || 0),
      status: formData.get("status") || "Pending",
      notes: formData.get("notes") || ""
    };

    window.store.addSalary(salaryData);
    this.closeModal("modal-add-salary");
    form.reset();
    this.showToast("Salary statement generated!");
  }

  markSalaryPaid(id) {
    window.store.markSalaryAsPaid(id);
    this.showToast("Salary payment disbursed and recorded into Financial Expenses!");
  }

  deleteSalary(id) {
    if (confirm("Delete this salary statement?")) {
      window.store.deleteSalary(id);
      this.showToast("Salary statement deleted", "info");
    }
  }

  viewPaySlip(salaryId) {
    const salary = window.store.getSalaries().find(s => s.id === salaryId);
    if (!salary) return;

    const settings = window.store.getSettings();
    const curr = settings.currency || "$";
    const slipContainer = document.getElementById("payslip-modal-content");
    if (!slipContainer) return;

    slipContainer.innerHTML = `
      <div id="printable-payslip" class="p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
        <!-- Studio Header -->
        <div class="flex items-start justify-between border-b pb-6 border-slate-200 dark:border-slate-800">
          <div>
            <div class="inline-flex items-center gap-2 mb-1">
              <i data-lucide="compass" class="w-6 h-6 text-amber-500"></i>
              <span class="text-xl font-bold font-display uppercase tracking-wider text-slate-900 dark:text-white">${window.uiRenderer.escapeHTML(settings.name)}</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">${window.uiRenderer.escapeHTML(settings.tagline)}</p>
            <p class="text-xs text-slate-400 mt-1">${window.uiRenderer.escapeHTML(settings.address)} · ${window.uiRenderer.escapeHTML(settings.phone)}</p>
          </div>
          <div class="text-right">
            <span class="text-xs uppercase font-bold text-amber-500 tracking-wider block">Official Salary Slip</span>
            <div class="text-sm font-mono font-bold mt-1 text-slate-700 dark:text-slate-300">${salary.id}</div>
            <div class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Pay Period: ${salary.month}</div>
          </div>
        </div>

        <!-- Employee Info -->
        <div class="grid grid-cols-2 gap-4 py-6 text-xs border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="text-slate-400 block uppercase font-semibold text-[10px]">Employee Name</span>
            <span class="text-base font-bold text-slate-900 dark:text-white">${window.uiRenderer.escapeHTML(salary.employeeName)}</span>
            <span class="text-slate-500 dark:text-slate-400 block">${window.uiRenderer.escapeHTML(salary.designation)} (${window.uiRenderer.escapeHTML(salary.department)})</span>
          </div>
          <div class="text-right">
            <span class="text-slate-400 block uppercase font-semibold text-[10px]">Disbursement Status</span>
            <span class="inline-block px-3 py-1 rounded-full text-xs font-bold ${salary.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 'bg-yellow-500/10 text-yellow-500'}">
              ${salary.status}
            </span>
            <div class="text-slate-400 text-[11px] mt-1">Paid on: ${salary.paymentDate || 'Pending'}</div>
          </div>
        </div>

        <!-- Earnings & Deductions Breakdown -->
        <div class="py-6">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase">
                <th class="text-left pb-3">Earnings Component</th>
                <th class="text-right pb-3">Amount</th>
                <th class="text-left pb-3 pl-8">Deductions Component</th>
                <th class="text-right pb-3">Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td class="py-2.5 font-medium">Basic Salary</td>
                <td class="py-2.5 text-right font-bold">${curr}${Number(salary.basicSalary).toLocaleString()}</td>
                <td class="py-2.5 pl-8 font-medium">Income Tax & Withholding</td>
                <td class="py-2.5 text-right font-bold text-rose-500">-${curr}${Number(salary.deductions || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td class="py-2.5 font-medium">Project Performance Bonus</td>
                <td class="py-2.5 text-right font-bold text-emerald-600">+${curr}${Number(salary.bonus || 0).toLocaleString()}</td>
                <td class="py-2.5 pl-8 font-medium">Unpaid Leave / Adjustments</td>
                <td class="py-2.5 text-right font-bold text-slate-400">${curr}0</td>
              </tr>
              <tr class="bg-slate-50 dark:bg-slate-800/50 font-bold text-sm">
                <td class="py-3">Total Gross Earnings</td>
                <td class="py-3 text-right text-emerald-600">${curr}${(Number(salary.basicSalary) + Number(salary.bonus || 0)).toLocaleString()}</td>
                <td class="py-3 pl-8">Total Deductions</td>
                <td class="py-3 text-right text-rose-500">-${curr}${Number(salary.deductions || 0).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <!-- Net Pay Card -->
          <div class="mt-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span class="text-xs uppercase font-semibold text-amber-600 dark:text-amber-400">Total Net Disbursed Compensation</span>
              <div class="text-[11px] text-slate-500">Authorized by Bistirno Studio Managing Director</div>
            </div>
            <div class="text-2xl font-bold font-display text-slate-900 dark:text-white">
              ${curr}${Number(salary.netSalary).toLocaleString()}
            </div>
          </div>
        </div>

        <!-- Footer & Signatures -->
        <div class="grid grid-cols-2 gap-8 pt-8 mt-4 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
          <div>
            <div class="w-36 h-0.5 bg-slate-300 dark:bg-slate-700 mx-auto mb-2"></div>
            <span>Employee Signature</span>
          </div>
          <div>
            <div class="w-36 h-0.5 bg-slate-300 dark:bg-slate-700 mx-auto mb-2"></div>
            <span>Authorized Principal Architect Signature</span>
          </div>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3 no-print">
        <button onclick="window.print()" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-all shadow-md">
          <i data-lucide="printer" class="w-4 h-4"></i> Print Official Pay Slip
        </button>
      </div>
    `;

    this.openModal("modal-view-payslip");
    lucide.createIcons();
  }

  filterSalaries() {
    const search = (document.getElementById("salary-search")?.value || "").toLowerCase();
    const rows = document.querySelectorAll("#salaries-tbody tr");
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(search) ? "" : "none";
    });
  }

  // --- INVENTORY ACTIONS ---
  handleCreateInventory(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const itemData = {
      name: formData.get("name"),
      category: formData.get("category"),
      sku: formData.get("sku"),
      stock: Number(formData.get("stock")),
      unit: formData.get("unit"),
      reorderLevel: Number(formData.get("reorderLevel") || 10),
      unitCost: Number(formData.get("unitCost")),
      supplier: formData.get("supplier"),
      location: formData.get("location")
    };

    window.store.addInventoryItem(itemData);
    this.closeModal("modal-add-inventory");
    form.reset();
    this.showToast("Material cataloged in inventory!");
  }

  adjustStock(id, amount) {
    window.store.adjustInventoryStock(id, amount);
    this.showToast("Material stock adjusted");
  }

  deleteInventory(id) {
    if (confirm("Delete this inventory material item?")) {
      window.store.deleteInventoryItem(id);
      this.showToast("Material deleted", "info");
    }
  }

  filterInventory() {
    const search = (document.getElementById("inventory-search")?.value || "").toLowerCase();
    const status = document.getElementById("inventory-status-filter")?.value || "All";
    const cat = document.getElementById("inventory-category-filter")?.value || "All";

    const rows = document.querySelectorAll("#inventory-tbody tr");
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      const matchSearch = text.includes(search);
      const matchStatus = status === "All" || text.includes(status.toLowerCase());
      const matchCat = cat === "All" || text.includes(cat.toLowerCase());

      row.style.display = (matchSearch && matchStatus && matchCat) ? "" : "none";
    });
  }

  // --- FINANCIALS ACTIONS ---
  handleCreateTransaction(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const txData = {
      type: formData.get("type"),
      category: formData.get("category"),
      amount: Number(formData.get("amount")),
      date: formData.get("date") || new Date().toISOString().split("T")[0],
      reference: formData.get("reference"),
      notes: formData.get("notes") || ""
    };

    window.store.addTransaction(txData);
    this.closeModal("modal-add-transaction");
    form.reset();
    this.showToast("Financial transaction recorded in ledger!");
  }

  deleteTransaction(id) {
    if (confirm("Delete this transaction entry?")) {
      window.store.deleteTransaction(id);
      this.showToast("Transaction deleted", "info");
    }
  }

  filterTransactions() {
    const type = document.getElementById("financial-type-filter")?.value || "All";
    const rows = document.querySelectorAll("#financials-tbody tr");
    rows.forEach(row => {
      const text = row.textContent;
      if (type === "All") {
        row.style.display = "";
      } else {
        row.style.display = text.includes(type) ? "" : "none";
      }
    });
  }

  exportFinancialsCSV() {
    const transactions = window.store.getTransactions();
    const headers = ["Transaction ID", "Date", "Type", "Category", "Reference", "Amount", "Status"];
    const rows = transactions.map(t => [
      t.id,
      t.date,
      t.type,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${(t.reference || '').replace(/"/g, '""')}"`,
      t.amount,
      t.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `archstudio_financial_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    this.showToast("Financial CSV Report downloaded!");
  }

  // --- REVIEWS ACTIONS ---
  handleCreateReview(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const reviewData = {
      customerName: formData.get("customerName"),
      company: formData.get("company"),
      projectName: formData.get("projectName"),
      rating: Number(formData.get("rating")),
      title: formData.get("title"),
      comment: formData.get("comment"),
      category: formData.get("category"),
      featured: formData.get("featured") === "on"
    };

    window.store.addReview(reviewData);
    this.closeModal("modal-add-review");
    form.reset();
    this.showToast("Customer review submitted!");
  }

  toggleFeaturedReview(id) {
    window.store.toggleReviewFeatured(id);
    this.showToast("Review featured status updated!");
  }

  deleteReview(id) {
    if (confirm("Delete this review?")) {
      window.store.deleteReview(id);
      this.showToast("Review removed", "info");
    }
  }

  // --- PORTFOLIO ACTIONS ---
  handleCreatePortfolio(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const item = {
      title: formData.get("title"),
      category: formData.get("category"),
      location: formData.get("location"),
      year: formData.get("year") || "2024",
      area: formData.get("area"),
      architect: formData.get("architect"),
      image: formData.get("image"),
      description: formData.get("description")
    };

    window.store.addPortfolioItem(item);
    this.closeModal("modal-add-portfolio");
    form.reset();
    this.showToast("Item added to architecture portfolio!");
  }

  deletePortfolio(id) {
    if (confirm("Remove this portfolio item?")) {
      window.store.deletePortfolioItem(id);
      this.showToast("Portfolio item removed", "info");
    }
  }

  filterPortfolioCategory(cat) {
    document.querySelectorAll(".portfolio-filter-btn").forEach(btn => {
      if (btn.textContent.includes(cat) || (cat === "All" && btn.textContent.includes("All"))) {
        btn.className = "portfolio-filter-btn px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-amber-500 text-slate-950 shadow-md";
      } else {
        btn.className = "portfolio-filter-btn px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800";
      }
    });

    const items = document.querySelectorAll(".portfolio-item");
    items.forEach(item => {
      const itemCat = item.getAttribute("data-cat");
      item.style.display = (cat === "All" || itemCat === cat) ? "" : "none";
    });
  }

  openLightbox(imageUrl, title, description, location) {
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxTitle = document.getElementById("lightbox-title");
    const lightboxDesc = document.getElementById("lightbox-desc");
    const lightboxLoc = document.getElementById("lightbox-loc");

    if (lightboxImg) lightboxImg.src = imageUrl;
    if (lightboxTitle) lightboxTitle.textContent = title;
    if (lightboxDesc) lightboxDesc.textContent = description;
    if (lightboxLoc) lightboxLoc.textContent = location;

    this.openModal("modal-lightbox");
  }

  // --- SETTINGS ACTIONS ---
  saveCompanySettings(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    window.store.updateSettings({
      name: formData.get("name"),
      tagline: formData.get("tagline"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      license: formData.get("license"),
      currency: formData.get("currency")
    });

    this.showToast("Studio company settings updated!");
  }

  saveAdminSettings(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const currentSettings = window.store.getSettings();
    window.store.updateSettings({
      adminProfile: {
        ...currentSettings.adminProfile,
        name: formData.get("name"),
        role: formData.get("role"),
        avatar: formData.get("avatar"),
        bio: formData.get("bio")
      }
    });

    this.showToast("Admin profile updated!");
  }

  handleBackupImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const success = window.store.importBackupJSON(event.target.result);
      if (success) {
        this.showToast("System database successfully restored!");
        this.renderCurrentView();
      } else {
        this.showToast("Failed to parse JSON backup file.", "error");
      }
    };
    reader.readAsText(file);
  }

  confirmResetDemoData() {
    if (confirm("Are you sure you want to reset all studio data back to initial sample demo data? Any custom entries will be replaced.")) {
      window.store.resetToDefaults();
      this.showToast("System reset to sample studio demo data!");
      this.renderCurrentView();
    }
  }

  // Global search from top bar
  handleGlobalSearch(query) {
    if (!query) return;
    const q = query.toLowerCase();

    // Check if query matches a project, employee, or customer
    const projects = window.store.getProjects();
    const employees = window.store.getEmployees();
    const customers = window.store.getCustomers();

    if (projects.some(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))) {
      this.navigate("projects");
      setTimeout(() => {
        const input = document.getElementById("project-search");
        if (input) {
          input.value = query;
          this.filterProjects();
        }
      }, 100);
    } else if (employees.some(e => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q))) {
      this.navigate("employees");
      setTimeout(() => {
        const input = document.getElementById("employee-search");
        if (input) {
          input.value = query;
          this.filterEmployees();
        }
      }, 100);
    } else if (customers.some(c => c.name.toLowerCase().includes(q))) {
      this.navigate("customers");
      setTimeout(() => {
        const input = document.getElementById("customer-search");
        if (input) {
          input.value = query;
          this.filterCustomers();
        }
      }, 100);
    } else {
      this.navigate("projects");
    }
  }

  bindEvents() {
    // Global sidebar menu search real-time filtering
    document.addEventListener("input", (e) => {
      if (e.target && e.target.id === "sidebar-search-input") {
        const q = (e.target.value || "").toLowerCase().trim();
        document.querySelectorAll(".sidebar-link").forEach(link => {
          const text = link.textContent.toLowerCase();
          if (!q || text.includes(q)) {
            link.style.display = "flex";
          } else {
            link.style.display = "none";
          }
        });
        document.querySelectorAll(".sidebar-nav-group").forEach(group => {
          const visibleLinks = group.querySelectorAll(".sidebar-link:not([style*='display: none'])");
          group.style.display = (visibleLinks.length > 0 || !q) ? "block" : "none";
        });
      }
    });

    // Close modal on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".modal-container, .modal-overlay").forEach(modal => {
          if (!modal.classList.contains("hidden")) {
            modal.classList.add("hidden");
            modal.classList.remove("flex");
          }
        });
        document.body.classList.remove("overflow-hidden");
      }
    });
  }
}

// Global convenience wrappers so inline HTML onclicks always work smoothly
window.toggleMobileMenu = function() {
  if (window.app && window.app.toggleMobileMenu) {
    window.app.toggleMobileMenu();
  } else {
    const sidebar = document.querySelector(".desktop-sidebar");
    const overlay = document.getElementById("mobile-sidebar-backdrop");
    if (sidebar) {
      const isHidden = sidebar.classList.contains("hidden");
      if (isHidden) {
        sidebar.classList.remove("hidden");
        sidebar.classList.add("fixed", "inset-y-0", "left-0", "z-50", "flex", "shadow-2xl");
        if (overlay) overlay.classList.remove("hidden");
      } else {
        sidebar.classList.add("hidden");
        sidebar.classList.remove("fixed", "inset-y-0", "left-0", "z-50", "flex", "shadow-2xl");
        if (overlay) overlay.classList.add("hidden");
      }
    }
  }
};

window.closeMobileMenu = function() {
  if (window.app && window.app.closeMobileMenu) {
    window.app.closeMobileMenu();
  } else {
    const sidebar = document.querySelector(".desktop-sidebar");
    const overlay = document.getElementById("mobile-sidebar-backdrop");
    if (sidebar && sidebar.classList.contains("fixed")) {
      sidebar.classList.add("hidden");
      sidebar.classList.remove("fixed", "inset-y-0", "left-0", "z-50", "flex", "shadow-2xl");
      if (overlay) overlay.classList.add("hidden");
    }
  }
};

window.toggleTheme = function() {
  if (window.app && window.app.toggleTheme) {
    window.app.toggleTheme();
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("archstudio_theme", "light");
    const icon = document.getElementById("theme-toggle-icon");
    if (icon) {
      icon.setAttribute("data-lucide", "sun");
      if (window.lucide) lucide.createIcons();
    }
  }
};

window.handleNav = function(view, fallbackUrl, event) {
  if (window.app && window.app.navigate && document.getElementById("main-content-container")) {
    if (event) event.preventDefault();
    window.app.navigate(view);
    window.closeMobileMenu();
    return false;
  }
  return true;
};

window.openModal = function(id) {
  if (window.app && window.app.openModal) {
    window.app.openModal(id);
  } else {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove("hidden");
      el.classList.add("flex");
      document.body.classList.add("overflow-hidden");
      if (window.lucide) lucide.createIcons();
    }
  }
};

window.closeModal = function(id) {
  if (window.app && window.app.closeModal) {
    window.app.closeModal(id);
  } else {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add("hidden");
      el.classList.remove("flex");
      document.body.classList.remove("overflow-hidden");
    }
  }
};

window.openStockInModal = function() {
  if (window.app && window.app.openStockInModal) {
    window.app.openStockInModal();
  } else {
    window.openModal("modal-add-stock");
  }
};

window.openStockOutModal = function() {
  if (window.app && window.app.openStockOutModal) {
    window.app.openStockOutModal();
  } else {
    window.openModal("modal-add-stock");
  }
};

window.reorderItem = function(name, category, unitCost) {
  if (window.app && window.app.reorderItem) {
    window.app.reorderItem(name, category, unitCost);
  } else {
    window.openModal("modal-add-purchase-order");
  }
};

window.switchMovementTab = function(btn, range) {
  if (window.app && window.app.switchMovementTab) {
    window.app.switchMovementTab(range);
  } else {
    document.querySelectorAll(".time-tab").forEach(t => t.classList.remove("active"));
    if (btn) btn.classList.add("active");
  }
};

window.switchEmployeeTab = function(tabName) {
  if (window.app && window.app.switchEmployeeTab) {
    window.app.switchEmployeeTab(tabName);
  }
};

window.markAllAttendancePresent = function() {
  if (window.app && window.app.markAllAttendancePresent) {
    window.app.markAllAttendancePresent();
  } else if (window.store && window.store.markAllAttendancePresent) {
    window.store.markAllAttendancePresent();
    if (window.renderEmployees) window.renderEmployees();
  }
};

window.exportAttendanceCSV = function() {
  if (window.app && window.app.exportAttendanceCSV) {
    window.app.exportAttendanceCSV();
  } else if (window.store && window.store.exportAttendanceCSV) {
    window.store.exportAttendanceCSV();
  }
};

window.toggleAttendanceView = function(viewMode) {
  if (window.app && window.app.toggleAttendanceView) {
    window.app.toggleAttendanceView(viewMode);
  }
};

window.setAttendance = function(empId, status) {
  if (window.app && window.app.setAttendance) {
    window.app.setAttendance(empId, status);
  } else if (window.store && window.store.updateAttendance) {
    window.store.updateAttendance(empId, status);
    if (window.renderEmployees) window.renderEmployees();
  }
};

// Instantiate global app when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
});
