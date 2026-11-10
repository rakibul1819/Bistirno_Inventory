/**
 * Bistirno - ArchStudio Pro
 * Dynamic UI Rendering & View Component Controllers
 */

class UIRenderer {
  constructor() {
    this.currentView = "dashboard";
    this.selectedProject = null;
    this.selectedCustomer = null;
    this.selectedEmployee = null;
  }

  escapeHTML(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // --- 1. DASHBOARD VIEW ---
  renderDashboard() {
    const metrics = window.store.getDashboardMetrics();
    const settings = window.store.getSettings();
    const curr = settings.currency || "TK ";
    const stockMovements = window.store.getStockMovements ? window.store.getStockMovements().slice(0, 5) : [];
    const lowStockItems = window.store.getLowStockItems ? window.store.getLowStockItems().slice(0, 6) : [];
    const recentProjects = window.store.getProjects().slice(0, 4);

    return `
      <!-- Welcome Banner (Exact match with reference) -->
      <div class="dashboard-welcome-banner shadow-sm">
        <div class="dashboard-welcome-circle circle-1"></div>
        <div class="dashboard-welcome-circle circle-2"></div>

        <div class="relative z-10 max-w-2xl">
          <h2 class="text-2xl md:text-3xl font-extrabold font-display text-white tracking-tight">
            Welcome back, Admin
          </h2>
          <p class="mt-2 text-xs md:text-sm text-[#A1A1AA] leading-relaxed">
            ${metrics.lowStockCount || 6} items are below minimum stock and ${metrics.awaitingApprovalCount || 3} purchase orders are waiting for approval.
          </p>

          <div class="mt-5 flex flex-wrap items-center gap-3">
            <button onclick="window.app ? window.app.openModal('modal-add-stock') : openModal('modal-add-stock')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#18181B] font-bold text-xs md:text-sm hover:bg-[#F4F4F5] transition-all shadow-sm">
              <i data-lucide="plus" class="w-4 h-4 stroke-[2.5]"></i>
              Add stock
            </button>
            <button onclick="window.app ? window.app.openModal('modal-add-purchase-order') : openModal('modal-add-purchase-order')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-transparent border border-[#3F3F46] text-white font-medium text-xs md:text-sm hover:bg-white/10 transition-all">
              <i data-lucide="file-text" class="w-4 h-4"></i>
              New purchase order
            </button>
          </div>
        </div>
      </div>

      <!-- 4 Core Metric Cards (Exact match with reference) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6">
        
        <!-- 1. Total stock value -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <span class="metric-label">Total stock value</span>
            <div class="metric-icon-box">
              <i data-lucide="wallet" class="w-5 h-5 stroke-[1.8]"></i>
            </div>
          </div>
          <div class="mt-3">
            <div class="metric-value">
              TK 42,85,600
            </div>
            <div class="metric-trend-green mt-2">
              <i data-lucide="arrow-up-right" class="w-3.5 h-3.5 stroke-[2.5]"></i>
              <span>8.2% from last month</span>
            </div>
          </div>
        </div>

        <!-- 2. Items in stock -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <span class="metric-label">Items in stock</span>
            <div class="metric-icon-box">
              <i data-lucide="box" class="w-5 h-5 stroke-[1.8]"></i>
            </div>
          </div>
          <div class="mt-3">
            <div class="metric-value">
              248
            </div>
            <div class="metric-trend-green mt-2">
              <i data-lucide="arrow-up-right" class="w-3.5 h-3.5 stroke-[2.5]"></i>
              <span>12 new items this month</span>
            </div>
          </div>
        </div>

        <!-- 3. Low stock alerts -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <span class="metric-label">Low stock alerts</span>
            <div class="metric-icon-box">
              <i data-lucide="alert-triangle" class="w-5 h-5 stroke-[1.8] text-[#DC2626]"></i>
            </div>
          </div>
          <div class="mt-3">
            <div class="metric-value">
              6
            </div>
            <div class="metric-trend-red mt-2">
              <i data-lucide="arrow-down-right" class="w-3.5 h-3.5 stroke-[2.5]"></i>
              <span>Needs reorder</span>
            </div>
          </div>
        </div>

        <!-- 4. Pending orders -->
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <span class="metric-label">Pending orders</span>
            <div class="metric-icon-box">
              <i data-lucide="truck" class="w-5 h-5 stroke-[1.8]"></i>
            </div>
          </div>
          <div class="mt-3">
            <div class="metric-value">
              9
            </div>
            <div class="metric-trend-gray mt-2">
              <i data-lucide="clock" class="w-3.5 h-3.5 stroke-[2]"></i>
              <span>3 awaiting approval</span>
            </div>
          </div>
        </div>

      </div>

      <!-- Middle Section: Stock Movement Card (Exact match with reference) -->
      <div class="stock-movement-card mb-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F4F4F5]">
          <div class="flex items-center gap-3">
            <div class="stock-movement-icon-box">
              <i data-lucide="arrow-left-right" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="text-base font-bold font-display text-[#18181B]">Stock movement</h3>
              <p class="text-xs text-[#71717A]">Items received and issued</p>
            </div>
          </div>

          <!-- Time Tabs: Week (Active: Black), Month, Year -->
          <div class="inline-flex items-center p-1 rounded-xl bg-[#F4F4F5] border border-[#E4E4E7] self-start sm:self-auto">
            <button class="time-tab active" onclick="switchMovementTab(this, 'week')">Week</button>
            <button class="time-tab" onclick="switchMovementTab(this, 'month')">Month</button>
            <button class="time-tab" onclick="switchMovementTab(this, 'year')">Year</button>
          </div>
        </div>

        <!-- Stock Movement List Entries -->
        <div class="mt-4 space-y-2.5">
          ${stockMovements.length > 0 ? stockMovements.map(mov => `
            <div class="stock-movement-item">
              <div class="flex items-center gap-3 min-w-0">
                <div class="w-9 h-9 rounded-xl ${mov.type === 'Received' ? 'bg-emerald-50 text-emerald-600' : mov.type === 'Allocated' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'} flex items-center justify-center flex-shrink-0">
                  <i data-lucide="${mov.type === 'Received' ? 'arrow-down-left' : mov.type === 'Allocated' ? 'building-2' : 'arrow-up-right'}" class="w-4 h-4"></i>
                </div>
                <div class="min-w-0">
                  <h4 class="text-xs md:text-sm font-bold text-[#18181B] truncate">${this.escapeHTML(mov.materialName)}</h4>
                  <p class="text-[11px] text-[#71717A] truncate">
                    <span>${this.escapeHTML(mov.project || 'Inventory Staging')}</span>
                    <span class="mx-1.5">·</span>
                    <span>By ${this.escapeHTML(mov.actor || 'Admin')}</span>
                  </p>
                </div>
              </div>

              <div class="text-right flex-shrink-0 pl-3">
                <span class="inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${mov.type === 'Received' ? 'bg-emerald-100/60 text-emerald-700' : 'bg-[#E4E4E7] text-[#18181B]'} mb-0.5">
                  ${mov.type === 'Received' ? '+' : '-'}${this.escapeHTML(mov.quantity)}
                </span>
                <span class="text-[10px] text-[#71717A] block">${this.escapeHTML(mov.timestamp)}</span>
              </div>
            </div>
          `).join('') : `
            <p class="text-xs text-[#71717A] py-4 text-center">No recent stock movements logged.</p>
          `}
        </div>
      </div>

      <!-- Two-Column Grid: Low Stock Alert Details & Ongoing Commissions -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        <!-- Low Stock Alerts Detailed Card -->
        <div class="bg-white rounded-3xl p-6 border border-[#E4E4E7] shadow-sm">
          <div class="flex items-center justify-between pb-4 border-b border-[#F4F4F5] mb-4">
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold font-display text-[#18181B]">Low stock alerts</h3>
                <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-[#DC2626]">6 Items</span>
              </div>
              <p class="text-xs text-[#71717A] mt-0.5">Materials at or below reorder threshold</p>
            </div>
            <button onclick="window.app ? window.app.navigate('inventory') : window.location.href='inventory.html'" class="text-xs font-semibold text-[#18181B] hover:underline">
              Inventory
            </button>
          </div>

          <div class="space-y-2.5">
            ${lowStockItems.map(item => `
              <div class="stock-alert-row">
                <div class="min-w-0 pr-2">
                  <h5 class="text-xs md:text-sm font-bold text-[#18181B] truncate">${this.escapeHTML(item.name)}</h5>
                  <p class="text-[11px] text-[#71717A] truncate">
                    <span>${this.escapeHTML(item.category)}</span>
                    <span class="mx-1">·</span>
                    <span>Current: <strong class="text-[#18181B]">${item.stock} ${this.escapeHTML(item.unit)}</strong> (Min: ${item.reorderLevel})</span>
                  </p>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <span class="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-red-50 text-[#DC2626] border border-red-200">
                    Needs reorder
                  </span>
                  <button onclick="window.app ? window.app.reorderItem('${this.escapeHTML(item.name)}', '${this.escapeHTML(item.category)}', ${item.unitCost}) : (window.openModal ? openModal('modal-add-purchase-order') : null)" class="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#18181B] text-white hover:bg-[#27272A] transition-colors">
                    Reorder
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Project Allocations / Commissions Card -->
        <div class="bg-white rounded-3xl p-6 border border-[#E4E4E7] shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-4 border-b border-[#F4F4F5] mb-4">
              <div>
                <h3 class="text-base font-bold font-display text-[#18181B]">Project Allocation</h3>
                <p class="text-xs text-[#71717A] mt-0.5">Active architecture sites & material usage</p>
              </div>
              <button onclick="window.app ? window.app.navigate('projects') : window.location.href='projects.html'" class="text-xs font-semibold text-[#18181B] hover:underline">
                View All
              </button>
            </div>

            <div class="space-y-3">
              ${recentProjects.map(p => `
                <div class="flex items-center justify-between p-3.5 rounded-2xl bg-[#F9FAFB] border border-[#F4F4F5] hover:border-[#E4E4E7] transition-all">
                  <div class="flex items-center gap-3 min-w-0">
                    <img src="${p.gallery[0]}" alt="${this.escapeHTML(p.name)}" class="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-[#E4E4E7] text-[#18181B]">${p.id}</span>
                        <span class="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">${p.status}</span>
                      </div>
                      <h4 class="text-xs md:text-sm font-bold text-[#18181B] truncate mt-0.5">${this.escapeHTML(p.name)}</h4>
                      <p class="text-[11px] text-[#71717A] truncate">${this.escapeHTML(p.location)}</p>
                    </div>
                  </div>
                  <div class="text-right flex-shrink-0 pl-3">
                    <span class="text-xs font-bold text-[#18181B]">${p.progress}%</span>
                    <div class="w-16 h-1.5 bg-[#E4E4E7] rounded-full overflow-hidden mt-1">
                      <div class="h-full bg-[#18181B] rounded-full" style="width: ${p.progress}%"></div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-[#F4F4F5] flex items-center justify-between text-xs text-[#71717A]">
            <span>6 Ongoing Commissions</span>
            <span class="font-bold text-[#18181B]">Total: TK 42,85,600 Stock Allocated</span>
          </div>
        </div>

      </div>

      <!-- Charts Section: Cashflow & Inventory Analytics -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div class="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#E4E4E7] shadow-sm">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 class="text-base font-bold font-display text-[#18181B]">Revenue & Stock Expenditure</h3>
              <p class="text-xs text-[#71717A]">Monthly material procurement vs milestone billings</p>
            </div>
            <span class="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-[#F4F4F5] text-[#18181B]">
              <i data-lucide="calendar" class="w-3.5 h-3.5"></i>
              Fiscal 2024
            </span>
          </div>
          <div class="h-64 w-full">
            <canvas id="revenueExpenseChart"></canvas>
          </div>
        </div>

        <div class="bg-white rounded-3xl p-6 border border-[#E4E4E7] shadow-sm flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-base font-bold font-display text-[#18181B]">Project Pipeline</h3>
              <span class="text-xs text-[#71717A]">Architecture</span>
            </div>
            <p class="text-xs text-[#71717A] mb-4">Commission status distribution</p>
            <div class="h-48 relative flex items-center justify-center">
              <canvas id="projectStatusChart"></canvas>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2 pt-4 border-t border-[#F4F4F5] text-center">
            <div>
              <div class="text-base font-bold text-[#18181B]">6</div>
              <div class="text-[11px] text-[#71717A]">Ongoing</div>
            </div>
            <div>
              <div class="text-base font-bold text-emerald-600">${metrics.completedProjects || 2}</div>
              <div class="text-[11px] text-[#71717A]">Completed</div>
            </div>
            <div>
              <div class="text-base font-bold text-[#71717A]">3</div>
              <div class="text-[11px] text-[#71717A]">Approval</div>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  // Status badge styling helper
  getStatusBadgeClass(status) {
    switch (status) {
      case "Ongoing":
      case "Active":
      case "In Stock":
      case "Paid":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20";
      case "Completed":
      case "Present":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
      case "Pending":
      case "Late":
      case "Low Stock":
        return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20";
      case "On Hold":
      case "On Leave":
      case "Out of Stock":
      case "Inactive":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400";
    }
  }

  // --- 2. PROJECTS MANAGEMENT VIEW ---
  renderProjects() {
    const projects = window.store.getProjects();
    const curr = window.store.getSettings().currency || "$";

    return `
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-2xl font-bold font-display text-slate-900 dark:text-white">Architecture & Interior Projects</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Manage design phases, budgets, milestones, and technical blueprints</p>
        </div>
        <button onclick="window.app.openModal('modal-add-project')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-md">
          <i data-lucide="plus" class="w-4 h-4"></i> Create New Project
        </button>
      </div>

      <!-- Filters & Controls -->
      <div class="bg-white dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <!-- Search -->
        <div class="relative flex-1 max-w-md">
          <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400"></i>
          <input 
            type="text" 
            id="project-search" 
            oninput="window.app.filterProjects()" 
            placeholder="Search by project name, code, client, or location..." 
            class="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <!-- Filter Dropdowns -->
        <div class="flex flex-wrap items-center gap-3">
          <select id="project-status-filter" onchange="window.app.filterProjects()" class="px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500">
            <option value="All">All Statuses</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>

          <select id="project-category-filter" onchange="window.app.filterProjects()" class="px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500">
            <option value="All">All Categories</option>
            <option value="Residential Architecture">Residential</option>
            <option value="Commercial Architecture">Commercial</option>
            <option value="Interior Design Projects">Interior Design</option>
            <option value="Modern Building Designs">Modern Architecture</option>
            <option value="Exterior Design Projects">Exterior & Landscape</option>
          </select>
        </div>

      </div>

      <!-- Project Grid -->
      <div id="projects-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${projects.map(p => this.renderProjectCard(p, curr)).join("")}
      </div>
    `;
  }

  renderProjectCard(p, curr) {
    const budget = Number(p.budget);
    const spent = Number(p.spent);
    const budgetPct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

    return `
      <div class="project-card group bg-white dark:bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between" data-category="${p.category}" data-status="${p.status}">
        <div>
          <!-- Thumbnail with Category Pill -->
          <div class="relative h-48 overflow-hidden bg-slate-800 cursor-pointer" onclick="window.app.showProjectDetails('${p.id}')">
            <img src="${p.gallery[0]}" alt="${this.escapeHTML(p.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30"></div>
            
            <div class="absolute top-3 left-3 flex items-center gap-2">
              <span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-black/60 backdrop-blur-md text-white border border-white/10 font-mono">
                ${p.id}
              </span>
            </div>

            <div class="absolute top-3 right-3">
              <span class="px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md ${this.getStatusBadgeClass(p.status)}">
                ${p.status}
              </span>
            </div>

            <div class="absolute bottom-3 left-3 right-3">
              <span class="text-[11px] font-semibold uppercase tracking-wider text-amber-400 block mb-0.5">
                ${this.escapeHTML(p.category)}
              </span>
              <h3 class="text-base font-bold text-white leading-snug truncate">
                ${this.escapeHTML(p.name)}
              </h3>
            </div>
          </div>

          <!-- Body details -->
          <div class="p-5">
            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
              ${this.escapeHTML(p.description)}
            </p>

            <div class="grid grid-cols-2 gap-2 text-xs mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <div>
                <span class="text-slate-400 block text-[10px] uppercase font-semibold">Client</span>
                <span class="font-medium text-slate-800 dark:text-slate-200 truncate block">${this.escapeHTML(p.client)}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[10px] uppercase font-semibold">Location</span>
                <span class="font-medium text-slate-800 dark:text-slate-200 truncate block">${this.escapeHTML(p.location)}</span>
              </div>
              <div class="mt-2">
                <span class="text-slate-400 block text-[10px] uppercase font-semibold">Budget</span>
                <span class="font-bold text-slate-900 dark:text-white">${curr}${budget.toLocaleString()}</span>
              </div>
              <div class="mt-2">
                <span class="text-slate-400 block text-[10px] uppercase font-semibold">Spent</span>
                <span class="font-bold ${spent > budget ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}">${curr}${spent.toLocaleString()}</span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div>
              <div class="flex items-center justify-between text-xs mb-1">
                <span class="text-slate-500 dark:text-slate-400 font-medium">Design & Execution</span>
                <span class="font-bold text-slate-900 dark:text-white">${p.progress}%</span>
              </div>
              <div class="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div class="h-full rounded-full ${p.progress === 100 ? 'bg-emerald-500' : 'bg-amber-500'}" style="width: ${p.progress}%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div class="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <i data-lucide="user" class="w-3.5 h-3.5"></i>
            <span>${this.escapeHTML(p.lead)}</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.app.showProjectDetails('${p.id}')" class="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold transition-all">
              Details & Blueprint
            </button>
            <button onclick="window.app.deleteProject('${p.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all" title="Delete Project">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // --- 3. EMPLOYEES MANAGEMENT & ATTENDANCE DASHBOARD VIEW ---
  renderEmployees(defaultTab = "overview") {
    const employees = window.store.getEmployees();
    const metrics = window.store.getEmployeeDashboardMetrics ? window.store.getEmployeeDashboardMetrics() : {
      totalEmployees: employees.length,
      activeEmployees: employees.filter(e => e.status === "Active").length,
      inactiveEmployees: employees.filter(e => e.status === "Inactive").length,
      presentToday: employees.filter(e => e.attendance === "Present").length,
      lateToday: employees.filter(e => e.attendance === "Late").length,
      leaveToday: employees.filter(e => e.attendance === "On Leave").length,
      absentToday: employees.filter(e => e.attendance === "Absent").length,
      attendanceRate: 90,
      totalPayroll: 74000,
      avgSalary: 7400,
      departments: { "Architecture": 4, "Interior Design": 2, "Structural": 2, "Site Supervision": 1, "Admin & HR": 1 }
    };
    const settings = window.store.getSettings();
    const curr = settings.currency || "TK ";
    const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // 30 days dummy matrix sample generator
    const daysArray = Array.from({ length: 30 }, (_, i) => i + 1);

    return `
      <!-- Top Header & Primary Action Controls -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-2xl font-bold font-display text-[#18181B] tracking-tight">Employee Management System</h2>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ${metrics.totalEmployees} Team Members
            </span>
          </div>
          <p class="text-xs text-[#71717A] mt-1">
            Architectural staff roster, role permissions, daily check-in attendance and studio operations
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button onclick="window.app ? window.app.markAllAttendancePresent() : markAllAttendancePresent()" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm">
            <i data-lucide="check-check" class="w-4 h-4"></i>
            Mark All Present
          </button>
          <button onclick="window.app ? window.app.exportAttendanceCSV() : exportAttendanceCSV()" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[#E4E4E7] text-[#18181B] hover:bg-[#F4F4F5] transition-all shadow-sm">
            <i data-lucide="download" class="w-4 h-4"></i>
            Export Attendance (CSV)
          </button>
          <button onclick="window.app ? window.app.openModal('modal-add-employee') : openModal('modal-add-employee')" class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#18181B] hover:bg-[#27272A] text-white transition-all shadow-sm">
            <i data-lucide="user-plus" class="w-4 h-4"></i>
            + Add Employee
          </button>
        </div>
      </div>

      <!-- Segmented Navigation Tabs -->
      <div class="emp-tab-nav mb-6 flex-wrap">
        <button 
          data-tab="overview" 
          onclick="window.app ? window.app.switchEmployeeTab('overview') : switchEmployeeTab('overview')" 
          class="emp-tab-btn ${defaultTab === 'overview' ? 'active' : ''}"
        >
          <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
          <span>Employee Dashboard</span>
        </button>
        <button 
          data-tab="attendance" 
          onclick="window.app ? window.app.switchEmployeeTab('attendance') : switchEmployeeTab('attendance')" 
          class="emp-tab-btn ${defaultTab === 'attendance' ? 'active' : ''}"
        >
          <i data-lucide="calendar-check" class="w-4 h-4"></i>
          <span>Attendance Sheet</span>
          <span class="px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">${metrics.presentToday} Present</span>
        </button>
        <button 
          data-tab="directory" 
          onclick="window.app ? window.app.switchEmployeeTab('directory') : switchEmployeeTab('directory')" 
          class="emp-tab-btn ${defaultTab === 'directory' ? 'active' : ''}"
        >
          <i data-lucide="users" class="w-4 h-4"></i>
          <span>Staff Directory</span>
        </button>
        <button 
          data-tab="departments" 
          onclick="window.app ? window.app.switchEmployeeTab('departments') : switchEmployeeTab('departments')" 
          class="emp-tab-btn ${defaultTab === 'departments' ? 'active' : ''}"
        >
          <i data-lucide="briefcase" class="w-4 h-4"></i>
          <span>Department Teams</span>
        </button>
      </div>

      <!-- ==================== TAB 1: EMPLOYEE DASHBOARD OVERVIEW ==================== -->
      <div id="emp-panel-overview" class="emp-panel ${defaultTab === 'overview' ? '' : 'hidden'} space-y-6">
        
        <!-- 4 Core Executive Metric Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <!-- Metric 1: Total Headcount -->
          <div class="emp-stat-card">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-[#71717A]">Total Headcount</span>
              <div class="w-9 h-9 rounded-xl bg-[#F4F4F5] flex items-center justify-center text-[#18181B]">
                <i data-lucide="users" class="w-4 h-4 stroke-[2]"></i>
              </div>
            </div>
            <div class="mt-3">
              <div class="text-2xl font-bold font-display text-[#18181B]">${metrics.totalEmployees}</div>
              <div class="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600">
                <i data-lucide="check-circle" class="w-3.5 h-3.5"></i>
                <span>${metrics.activeEmployees} Active on Studio Roster</span>
              </div>
            </div>
          </div>

          <!-- Metric 2: Attendance Rate -->
          <div class="emp-stat-card">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-[#71717A]">Today's Attendance</span>
              <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <i data-lucide="clock" class="w-4 h-4 stroke-[2]"></i>
              </div>
            </div>
            <div class="mt-3">
              <div class="text-2xl font-bold font-display text-emerald-600">${metrics.attendanceRate}%</div>
              <div class="flex items-center gap-2 mt-2 text-[11px] text-[#71717A]">
                <span class="text-emerald-700 font-bold">${metrics.presentToday} Present</span>
                <span>·</span>
                <span class="text-amber-600 font-bold">${metrics.lateToday} Late</span>
                <span>·</span>
                <span class="text-rose-600 font-bold">${metrics.absentToday} Absent</span>
              </div>
            </div>
          </div>

          <!-- Metric 3: Monthly Studio Payroll -->
          <div class="emp-stat-card">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-[#71717A]">Monthly Payroll Budget</span>
              <div class="w-9 h-9 rounded-xl bg-[#F4F4F5] flex items-center justify-center text-[#18181B]">
                <i data-lucide="credit-card" class="w-4 h-4 stroke-[2]"></i>
              </div>
            </div>
            <div class="mt-3">
              <div class="text-2xl font-bold font-display text-[#18181B]">${curr}${metrics.totalPayroll.toLocaleString()}</div>
              <div class="text-[11px] text-[#71717A] mt-2">
                Avg ${curr}${metrics.avgSalary.toLocaleString()} per team member
              </div>
            </div>
          </div>

          <!-- Metric 4: Studio Divisions -->
          <div class="emp-stat-card">
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-[#71717A]">Studio Divisions</span>
              <div class="w-9 h-9 rounded-xl bg-[#F4F4F5] flex items-center justify-center text-[#18181B]">
                <i data-lucide="building" class="w-4 h-4 stroke-[2]"></i>
              </div>
            </div>
            <div class="mt-3">
              <div class="text-2xl font-bold font-display text-[#18181B]">${Object.keys(metrics.departments).length} Departments</div>
              <div class="text-[11px] text-[#71717A] mt-2">
                Architecture, Interior, BIM, Site & Admin
              </div>
            </div>
          </div>

        </div>

        <!-- 2 Analytical Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <!-- Chart 1: Department Workforce Distribution -->
          <div class="bg-white rounded-3xl p-6 border border-[#E4E4E7] shadow-sm">
            <div class="flex items-center justify-between pb-4 border-b border-[#F4F4F5] mb-4">
              <div>
                <h3 class="text-base font-bold font-display text-[#18181B]">Department Staff Distribution</h3>
                <p class="text-xs text-[#71717A]">Team headcount allocation across studio disciplines</p>
              </div>
              <span class="px-2.5 py-1 rounded-xl text-xs font-semibold bg-[#F4F4F5] text-[#18181B]">
                ${metrics.totalEmployees} Staff
              </span>
            </div>
            <div class="h-64 w-full relative flex items-center justify-center">
              <canvas id="employeeDeptChart"></canvas>
            </div>
          </div>

          <!-- Chart 2: Weekly Attendance Trend -->
          <div class="bg-white rounded-3xl p-6 border border-[#E4E4E7] shadow-sm">
            <div class="flex items-center justify-between pb-4 border-b border-[#F4F4F5] mb-4">
              <div>
                <h3 class="text-base font-bold font-display text-[#18181B]">Weekly Attendance Pattern</h3>
                <p class="text-xs text-[#71717A]">Presence, punctuality, and leaves (Mon – Sat)</p>
              </div>
              <span class="px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700">
                Punctuality 94%
              </span>
            </div>
            <div class="h-64 w-full">
              <canvas id="attendanceWeeklyChart"></canvas>
            </div>
          </div>

        </div>

        <!-- Department Teams Overview & Recent Hires -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Department Quick Breakdown -->
          <div class="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#E4E4E7] shadow-sm">
            <div class="flex items-center justify-between pb-4 border-b border-[#F4F4F5] mb-4">
              <div>
                <h3 class="text-base font-bold font-display text-[#18181B]">Department Divisions & Leads</h3>
                <p class="text-xs text-[#71717A]">Key operational units of Bistirno ArchStudio</p>
              </div>
              <button onclick="window.app ? window.app.switchEmployeeTab('departments') : switchEmployeeTab('departments')" class="text-xs font-semibold text-[#18181B] hover:underline">
                View All Teams
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${Object.entries(metrics.departments).map(([dept, count]) => `
                <div class="p-4 rounded-2xl bg-[#F9FAFB] border border-[#E4E4E7] flex items-center justify-between">
                  <div>
                    <h4 class="text-xs font-bold text-[#18181B]">${dept}</h4>
                    <span class="text-[11px] text-[#71717A] block mt-0.5">${count} Architect${count > 1 ? 's' : ''} / Member${count > 1 ? 's' : ''}</span>
                  </div>
                  <span class="w-8 h-8 rounded-xl bg-white border border-[#E4E4E7] text-[#18181B] font-mono font-bold text-xs flex items-center justify-center">
                    ${count}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Studio Highlights / Recent Additions -->
          <div class="bg-white rounded-3xl p-6 border border-[#E4E4E7] shadow-sm flex flex-col justify-between">
            <div>
              <div class="pb-4 border-b border-[#F4F4F5] mb-4">
                <h3 class="text-base font-bold font-display text-[#18181B]">Studio Leadership & Staff</h3>
                <p class="text-xs text-[#71717A]">Active directory highlights</p>
              </div>

              <div class="space-y-3">
                ${employees.slice(0, 4).map(emp => `
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2.5 min-w-0">
                      <img src="${emp.avatar}" alt="" class="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
                      <div class="min-w-0">
                        <h5 class="text-xs font-bold text-[#18181B] truncate">${this.escapeHTML(emp.name)}</h5>
                        <p class="text-[11px] text-[#71717A] truncate">${this.escapeHTML(emp.designation)}</p>
                      </div>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${this.getStatusBadgeClass(emp.attendance)}">
                      ${emp.attendance}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>

            <div class="pt-4 border-t border-[#F4F4F5] mt-4 flex items-center justify-between">
              <span class="text-xs text-[#71717A]">Need to onboard staff?</span>
              <button onclick="window.app ? window.app.openModal('modal-add-employee') : openModal('modal-add-employee')" class="text-xs font-bold text-[#18181B] hover:underline">
                + New Hire
              </button>
            </div>
          </div>

        </div>

      </div>

      <!-- ==================== TAB 2: EMPLOYEE ATTENDANCE SHEET ==================== -->
      <div id="emp-panel-attendance" class="emp-panel ${defaultTab === 'attendance' ? '' : 'hidden'} space-y-6">
        
        <!-- Attendance Control Bar with Live Counters & View Toggles -->
        <div class="bg-white rounded-3xl p-5 border border-[#E4E4E7] shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-[#18181B] text-white flex items-center justify-center flex-shrink-0">
              <i data-lucide="calendar" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-base font-bold font-display text-[#18181B]">Attendance Sheet & Daily Roster</h3>
                <span class="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#F4F4F5] text-[#18181B] border border-[#E4E4E7]">${today}</span>
              </div>
              <p class="text-xs text-[#71717A] mt-0.5">Real-time check-in logging, daily attendance verification and monthly matrix</p>
            </div>
          </div>

          <!-- Counter Badges -->
          <div class="flex flex-wrap items-center gap-2">
            <span class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              🟢 ${metrics.presentToday} Present
            </span>
            <span class="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              🟡 ${metrics.lateToday} Late
            </span>
            <span class="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              🔵 ${metrics.leaveToday} On Leave
            </span>
            <span class="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              🔴 ${metrics.absentToday} Absent
            </span>
          </div>

          <!-- View Switcher & Action -->
          <div class="inline-flex items-center p-1 rounded-xl bg-[#F4F4F5] border border-[#E4E4E7]">
            <button 
              id="btn-att-view-daily" 
              onclick="window.app ? window.app.toggleAttendanceView('daily') : toggleAttendanceView('daily')" 
              class="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#18181B] text-white transition-all shadow-sm"
            >
              Daily Roster Table
            </button>
            <button 
              id="btn-att-view-monthly" 
              onclick="window.app ? window.app.toggleAttendanceView('monthly') : toggleAttendanceView('monthly')" 
              class="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-[#71717A] hover:text-[#18181B] transition-all"
            >
              30-Day Monthly Matrix
            </button>
          </div>
        </div>

        <!-- 2A. DAILY ATTENDANCE ROSTER SHEET TABLE -->
        <div id="attendance-daily-view" class="bg-white rounded-3xl border border-[#E4E4E7] shadow-sm overflow-hidden">
          <div class="p-4 border-b border-[#F4F4F5] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 class="text-sm font-bold text-[#18181B]">Today's Staff Check-In Register</h4>
              <p class="text-xs text-[#71717A]">Click any status button to instantly mark attendance</p>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="window.app ? window.app.markAllAttendancePresent() : markAllAttendancePresent()" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
                ✓ Mark All Present
              </button>
              <button onclick="window.app ? window.app.exportAttendanceCSV() : exportAttendanceCSV()" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#F4F4F5] text-[#18181B] border border-[#E4E4E7] hover:bg-[#E4E4E7] transition-colors">
                Export Sheet
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-[#F9FAFB] text-[#71717A] uppercase font-bold border-b border-[#E4E4E7]">
                <tr>
                  <th class="p-4">Employee</th>
                  <th class="p-4">Designation & Dept</th>
                  <th class="p-4">Check-In</th>
                  <th class="p-4">Check-Out</th>
                  <th class="p-4">Today Status</th>
                  <th class="p-4">Quick Mark Status</th>
                  <th class="p-4">Monthly Rate</th>
                  <th class="p-4">Station</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#F4F4F5]">
                ${employees.map(emp => {
                  const hist = emp.attendanceHistory || { present: 22, late: 1, absent: 0, leave: 1 };
                  const totalDays = (hist.present || 0) + (hist.late || 0) + (hist.absent || 0) + (hist.leave || 0);
                  const rate = totalDays > 0 ? Math.round(((hist.present + hist.late) / totalDays) * 100) : 95;
                  const checkInTime = emp.checkIn || (emp.attendance === "Late" ? "09:45 AM" : emp.attendance === "Present" ? "09:12 AM" : "-");
                  const checkOutTime = emp.checkOut || (emp.attendance === "Present" ? "06:15 PM" : "-");

                  return `
                    <tr class="hover:bg-[#F9FAFB] transition-colors">
                      <td class="p-4">
                        <div class="flex items-center gap-3">
                          <img src="${emp.avatar}" alt="" class="w-10 h-10 rounded-xl object-cover border border-[#E4E4E7]" />
                          <div>
                            <div class="font-bold text-[#18181B] text-xs">${this.escapeHTML(emp.name)}</div>
                            <span class="text-[10px] font-mono text-[#A1A1AA]">${emp.id}</span>
                          </div>
                        </div>
                      </td>
                      <td class="p-4">
                        <div class="font-semibold text-[#18181B]">${this.escapeHTML(emp.designation)}</div>
                        <div class="text-[11px] text-[#71717A]">${this.escapeHTML(emp.department)}</div>
                      </td>
                      <td class="p-4">
                        <span class="inline-block px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-[#F4F4F5] text-[#18181B] border border-[#E4E4E7]">
                          ${checkInTime}
                        </span>
                      </td>
                      <td class="p-4">
                        <span class="inline-block px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-[#F4F4F5] text-[#71717A] border border-[#E4E4E7]">
                          ${checkOutTime}
                        </span>
                      </td>
                      <td class="p-4">
                        <span class="px-2.5 py-1 rounded-full text-xs font-bold ${this.getStatusBadgeClass(emp.attendance)}">
                          ${emp.attendance}
                        </span>
                      </td>
                      <td class="p-4">
                        <div class="inline-flex items-center gap-1 p-1 rounded-xl bg-[#F4F4F5] border border-[#E4E4E7]">
                          <button 
                            onclick="window.app ? window.app.setAttendance('${emp.id}', 'Present') : setAttendance('${emp.id}', 'Present')" 
                            class="btn-att-toggle btn-att-present ${emp.attendance === 'Present' ? 'active' : ''}" 
                            title="Mark Present"
                          >
                            Present
                          </button>
                          <button 
                            onclick="window.app ? window.app.setAttendance('${emp.id}', 'Late') : setAttendance('${emp.id}', 'Late')" 
                            class="btn-att-toggle btn-att-late ${emp.attendance === 'Late' ? 'active' : ''}" 
                            title="Mark Late Check-in"
                          >
                            Late
                          </button>
                          <button 
                            onclick="window.app ? window.app.setAttendance('${emp.id}', 'On Leave') : setAttendance('${emp.id}', 'On Leave')" 
                            class="btn-att-toggle btn-att-leave ${emp.attendance === 'On Leave' ? 'active' : ''}" 
                            title="Mark On Leave"
                          >
                            Leave
                          </button>
                          <button 
                            onclick="window.app ? window.app.setAttendance('${emp.id}', 'Absent') : setAttendance('${emp.id}', 'Absent')" 
                            class="btn-att-toggle btn-att-absent ${emp.attendance === 'Absent' ? 'active' : ''}" 
                            title="Mark Absent"
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                      <td class="p-4">
                        <div class="flex items-center gap-2">
                          <div class="w-16 h-1.5 rounded-full bg-[#E4E4E7] overflow-hidden">
                            <div class="h-full bg-emerald-500 rounded-full" style="width: ${rate}%"></div>
                          </div>
                          <span class="font-bold text-[#18181B] text-xs">${rate}%</span>
                        </div>
                      </td>
                      <td class="p-4 text-[11px] text-[#71717A]">
                        ${emp.department === 'Site Supervision' ? 'Site Staging' : 'Studio Level 4'}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 2B. 30-DAY MONTHLY ATTENDANCE MATRIX SHEET -->
        <div id="attendance-monthly-view" class="bg-white rounded-3xl border border-[#E4E4E7] shadow-sm p-6 hidden space-y-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F4F4F5]">
            <div>
              <h4 class="text-sm font-bold text-[#18181B]">Monthly 30-Day Attendance Matrix Sheet</h4>
              <p class="text-xs text-[#71717A]">Comprehensive day-by-day attendance tracking for all architectural personnel</p>
            </div>
            <div class="flex items-center gap-2 text-xs">
              <span class="inline-flex items-center gap-1 font-semibold text-emerald-700"><span class="matrix-badge matrix-p">P</span> Present</span>
              <span class="inline-flex items-center gap-1 font-semibold text-amber-700"><span class="matrix-badge matrix-l">L</span> Late</span>
              <span class="inline-flex items-center gap-1 font-semibold text-blue-700"><span class="matrix-badge matrix-o">O</span> Leave</span>
              <span class="inline-flex items-center gap-1 font-semibold text-rose-700"><span class="matrix-badge matrix-a">A</span> Absent</span>
            </div>
          </div>

          <div class="attendance-matrix-wrapper">
            <table class="attendance-matrix-table">
              <thead>
                <tr>
                  <th class="matrix-emp-col">Team Member</th>
                  ${daysArray.map(d => `<th class="w-7">${d}</th>`).join('')}
                  <th class="px-3 bg-emerald-50 text-emerald-800">Pres</th>
                  <th class="px-3 bg-amber-50 text-amber-800">Late</th>
                  <th class="px-3 bg-blue-50 text-blue-800">Leav</th>
                  <th class="px-3 bg-rose-50 text-rose-800">Abst</th>
                  <th class="px-3 bg-[#18181B] text-white">Rate</th>
                </tr>
              </thead>
              <tbody>
                ${employees.map(emp => {
                  const hist = emp.attendanceHistory || { present: 22, late: 1, absent: 0, leave: 1 };
                  const total = (hist.present || 22) + (hist.late || 1) + (hist.leave || 1) + (hist.absent || 0);
                  const rate = Math.round(((hist.present || 22) / total) * 100);

                  return `
                    <tr>
                      <td class="matrix-emp-col">
                        <div class="font-bold text-[#18181B] truncate">${this.escapeHTML(emp.name)}</div>
                        <div class="text-[10px] text-[#71717A] truncate">${this.escapeHTML(emp.designation)}</div>
                      </td>
                      ${daysArray.map(d => {
                        // pseudo deterministic realistic pattern based on index & day
                        let badgeClass = "matrix-p";
                        let letter = "P";
                        if (d === 14 && emp.id === "ARCH-105") { badgeClass = "matrix-l"; letter = "L"; }
                        else if (d === 22 && emp.id === "INT-102") { badgeClass = "matrix-o"; letter = "O"; }
                        else if (d === 8 && emp.id === "STR-103") { badgeClass = "matrix-l"; letter = "L"; }
                        else if (d === 29 && emp.attendance === "Absent") { badgeClass = "matrix-a"; letter = "A"; }
                        else if (d === 30 && emp.attendance === "Late") { badgeClass = "matrix-l"; letter = "L"; }
                        else if (d === 30 && emp.attendance === "On Leave") { badgeClass = "matrix-o"; letter = "O"; }
                        return `<td><span class="matrix-badge ${badgeClass}">${letter}</span></td>`;
                      }).join('')}
                      <td class="font-bold text-emerald-600">${hist.present || 22}</td>
                      <td class="font-bold text-amber-600">${hist.late || 1}</td>
                      <td class="font-bold text-blue-600">${hist.leave || 1}</td>
                      <td class="font-bold text-rose-600">${hist.absent || 0}</td>
                      <td class="font-bold text-[#18181B] font-mono">${rate}%</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- ==================== TAB 3: STAFF DIRECTORY ==================== -->
      <div id="emp-panel-directory" class="emp-panel ${defaultTab === 'directory' ? '' : 'hidden'} space-y-6">
        
        <!-- Search & Filter Toolbar -->
        <div class="bg-white rounded-3xl p-4 border border-[#E4E4E7] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="relative flex-1 max-w-md">
            <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-3.5 text-[#A1A1AA]"></i>
            <input 
              type="text" 
              id="employee-search" 
              oninput="window.app ? window.app.filterEmployees() : filterEmployeeList()" 
              placeholder="Search by architect name, designation, or ID..." 
              class="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[#F9FAFB] border border-[#E4E4E7] text-[#18181B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#18181B]"
            />
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <select id="employee-dept-filter" onchange="window.app ? window.app.filterEmployees() : filterEmployeeList()" class="px-3 py-2 text-xs rounded-xl bg-[#F9FAFB] border border-[#E4E4E7] text-[#18181B] focus:outline-none">
              <option value="All">All Departments</option>
              <option value="Architecture">Architecture</option>
              <option value="Interior Design">Interior Design</option>
              <option value="Structural">Structural & BIM</option>
              <option value="Site Supervision">Site Supervision</option>
              <option value="Estimation">Estimation</option>
              <option value="Admin & HR">Admin & HR</option>
            </select>

            <select id="employee-status-filter" onchange="window.app ? window.app.filterEmployees() : filterEmployeeList()" class="px-3 py-2 text-xs rounded-xl bg-[#F9FAFB] border border-[#E4E4E7] text-[#18181B] focus:outline-none">
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <button onclick="window.app ? window.app.openModal('modal-add-employee') : openModal('modal-add-employee')" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#18181B] hover:bg-[#27272A] text-white transition-colors shadow-sm">
              + New Staff
            </button>
          </div>
        </div>

        <!-- Cards Grid of Personnel -->
        <div id="employees-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${employees.map(emp => `
            <div class="employee-card bg-white rounded-3xl p-5 border border-[#E4E4E7] shadow-sm flex flex-col justify-between" data-dept="${emp.department}" data-status="${emp.status}">
              <div>
                <div class="flex items-start justify-between gap-3 mb-4">
                  <div class="flex items-center gap-3">
                    <img src="${emp.avatar}" alt="" class="w-14 h-14 rounded-2xl object-cover avatar-ring" />
                    <div>
                      <h3 class="text-base font-bold font-display text-[#18181B]">${this.escapeHTML(emp.name)}</h3>
                      <p class="text-xs font-semibold text-[#71717A]">${this.escapeHTML(emp.designation)}</p>
                      <span class="text-[11px] font-mono text-[#A1A1AA]">${emp.id}</span>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 rounded-full text-[11px] font-bold ${this.getStatusBadgeClass(emp.status)}">
                    ${emp.status}
                  </span>
                </div>

                <div class="space-y-2 text-xs py-3 border-y border-[#F4F4F5] text-[#71717A]">
                  <div class="flex items-center justify-between">
                    <span class="text-[#A1A1AA]">Department</span>
                    <span class="font-semibold text-[#18181B]">${this.escapeHTML(emp.department)}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-[#A1A1AA]">Joining Date</span>
                    <span class="font-medium text-[#18181B]">${emp.joiningDate}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-[#A1A1AA]">Base Salary</span>
                    <span class="font-bold text-emerald-600">${curr}${Number(emp.basicSalary).toLocaleString()} /mo</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-[#A1A1AA]">Today's Status</span>
                    <span class="px-2 py-0.5 rounded text-[11px] font-bold ${this.getStatusBadgeClass(emp.attendance)}">
                      ${emp.attendance}
                    </span>
                  </div>
                </div>

                <div class="mt-3 text-xs text-[#71717A] space-y-1">
                  <div class="truncate"><i data-lucide="mail" class="w-3.5 h-3.5 inline mr-1 text-[#A1A1AA]"></i> ${this.escapeHTML(emp.email)}</div>
                  <div><i data-lucide="phone" class="w-3.5 h-3.5 inline mr-1 text-[#A1A1AA]"></i> ${this.escapeHTML(emp.phone)}</div>
                </div>
              </div>

              <div class="mt-4 pt-3 border-t border-[#F4F4F5] flex items-center justify-between">
                <button onclick="window.app ? window.app.viewEmployeeProfile('${emp.id}') : (window.location.href='employee-details.html?id=${emp.id}')" class="text-xs font-bold text-[#18181B] hover:underline flex items-center gap-1">
                  View Dossier <i data-lucide="arrow-right" class="w-3 h-3"></i>
                </button>
                <div class="flex items-center gap-1">
                  <button onclick="window.app ? window.app.editEmployee('${emp.id}') : (window.location.href='employee-details.html?id=${emp.id}')" class="p-1.5 rounded-lg text-[#71717A] hover:text-[#18181B] hover:bg-[#F4F4F5] transition-all" title="Edit Profile">
                    <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                  </button>
                  <button onclick="window.app ? window.app.deleteEmployee('${emp.id}') : deleteEmployee('${emp.id}')" class="p-1.5 rounded-lg text-[#71717A] hover:text-rose-600 hover:bg-rose-50 transition-all" title="Delete Employee">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

      </div>

      <!-- ==================== TAB 4: DEPARTMENT TEAMS ==================== -->
      <div id="emp-panel-departments" class="emp-panel ${defaultTab === 'departments' ? '' : 'hidden'} space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          ${Object.entries(metrics.departments).map(([dept, count]) => {
            const teamMembers = employees.filter(e => e.department === dept);
            return `
              <div class="bg-white rounded-3xl p-6 border border-[#E4E4E7] shadow-sm">
                <div class="flex items-center justify-between pb-4 border-b border-[#F4F4F5] mb-4">
                  <div>
                    <h3 class="text-base font-bold font-display text-[#18181B]">${dept}</h3>
                    <p class="text-xs text-[#71717A]">${count} Assigned Team Member${count > 1 ? 's' : ''}</p>
                  </div>
                  <span class="px-2.5 py-1 rounded-xl text-xs font-bold bg-[#F4F4F5] text-[#18181B]">
                    ${count} Staff
                  </span>
                </div>

                <div class="space-y-3">
                  ${teamMembers.map(m => `
                    <div class="p-3 rounded-2xl bg-[#F9FAFB] border border-[#F4F4F5] flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <img src="${m.avatar}" alt="" class="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <h5 class="text-xs font-bold text-[#18181B]">${this.escapeHTML(m.name)}</h5>
                          <p class="text-[11px] text-[#71717A]">${this.escapeHTML(m.designation)} · ${m.id}</p>
                        </div>
                      </div>
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${this.getStatusBadgeClass(m.attendance)}">
                        ${m.attendance}
                      </span>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Attendance Register direct view alias
  renderAttendance() {
    return this.renderEmployees("attendance");
  }

  // --- 5. SALARY & PAYROLL MANAGEMENT VIEW ---
  renderSalaries() {
    const salaries = window.store.getSalaries();
    const curr = window.store.getSettings().currency || "$";
    const totalPaid = salaries.filter(s => s.status === "Paid").reduce((sum, s) => sum + Number(s.netSalary), 0);
    const pendingPaid = salaries.filter(s => s.status === "Pending").reduce((sum, s) => sum + Number(s.netSalary), 0);

    return `
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-2xl font-bold font-display text-slate-900 dark:text-white">Studio Payroll & Salary Management</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Monthly compensation register, allowances, tax deductions, and pay slip generation</p>
        </div>
        <button onclick="window.app.openModal('modal-add-salary')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-md">
          <i data-lucide="plus" class="w-4 h-4"></i> Issue Salary Slip
        </button>
      </div>

      <!-- Financial Payroll Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs uppercase font-semibold text-slate-400">Total Disbursed</span>
            <div class="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <i data-lucide="check-circle" class="w-5 h-5"></i>
            </div>
          </div>
          <div class="text-2xl font-bold font-display text-slate-900 dark:text-white mt-2">${curr}${totalPaid.toLocaleString()}</div>
          <span class="text-xs text-emerald-600 font-medium">Successfully processed</span>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs uppercase font-semibold text-slate-400">Pending Payouts</span>
            <div class="w-9 h-9 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
              <i data-lucide="clock" class="w-5 h-5"></i>
            </div>
          </div>
          <div class="text-2xl font-bold font-display text-slate-900 dark:text-white mt-2">${curr}${pendingPaid.toLocaleString()}</div>
          <span class="text-xs text-yellow-600 font-medium">Awaiting director sign-off</span>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-xs uppercase font-semibold text-slate-400">Total Payroll Records</span>
            <div class="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <i data-lucide="file-text" class="w-5 h-5"></i>
            </div>
          </div>
          <div class="text-2xl font-bold font-display text-slate-900 dark:text-white mt-2">${salaries.length} Slips</div>
          <span class="text-xs text-blue-600 font-medium">Archived & active payroll entries</span>
        </div>
      </div>

      <!-- Salary Register Table -->
      <div class="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Monthly Salary Statements</h3>
          <div class="flex items-center gap-2">
            <input 
              type="text" 
              id="salary-search" 
              oninput="window.app.filterSalaries()" 
              placeholder="Search employee or slip ID..." 
              class="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold">
              <tr>
                <th class="p-4">Slip ID</th>
                <th class="p-4">Employee</th>
                <th class="p-4">Period</th>
                <th class="p-4">Basic</th>
                <th class="p-4">Bonus / Allowances</th>
                <th class="p-4">Deductions</th>
                <th class="p-4">Net Salary</th>
                <th class="p-4">Status</th>
                <th class="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="salaries-tbody" class="divide-y divide-slate-100 dark:divide-slate-800">
              ${salaries.map(s => `
                <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td class="p-4 font-mono font-semibold text-slate-400">${s.id}</td>
                  <td class="p-4">
                    <div class="font-bold text-slate-900 dark:text-white">${this.escapeHTML(s.employeeName)}</div>
                    <div class="text-[11px] text-slate-400">${this.escapeHTML(s.designation)} · ${this.escapeHTML(s.department)}</div>
                  </td>
                  <td class="p-4 text-slate-600 dark:text-slate-300 font-medium">${this.escapeHTML(s.month)}</td>
                  <td class="p-4 text-slate-700 dark:text-slate-300">${curr}${Number(s.basicSalary).toLocaleString()}</td>
                  <td class="p-4 text-emerald-600 font-medium">+${curr}${Number(s.bonus || 0).toLocaleString()}</td>
                  <td class="p-4 text-rose-500 font-medium">-${curr}${Number(s.deductions || 0).toLocaleString()}</td>
                  <td class="p-4 font-bold text-slate-900 dark:text-white text-sm">${curr}${Number(s.netSalary).toLocaleString()}</td>
                  <td class="p-4">
                    <span class="px-2.5 py-1 rounded-full font-semibold ${this.getStatusBadgeClass(s.status)}">
                      ${s.status}
                    </span>
                  </td>
                  <td class="p-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      ${s.status === "Pending" ? `
                        <button onclick="window.app.markSalaryPaid('${s.id}')" class="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-[11px] transition-all">
                          Pay Now
                        </button>
                      ` : `
                        <button onclick="window.app.viewPaySlip('${s.id}')" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-[11px] transition-all">
                          <i data-lucide="printer" class="w-3.5 h-3.5"></i> Pay Slip
                        </button>
                      `}
                      <button onclick="window.app.deleteSalary('${s.id}')" class="p-1 rounded text-slate-400 hover:text-rose-500 transition-all">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --- 6. CUSTOMER MANAGEMENT VIEW ---
  renderCustomers() {
    const customers = window.store.getCustomers();
    const curr = window.store.getSettings().currency || "$";

    return `
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-2xl font-bold font-display text-slate-900 dark:text-white">Customer & Client Directory</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Client dossiers, commissioned project histories, and communication records</p>
        </div>
        <button onclick="window.app.openModal('modal-add-customer')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-md">
          <i data-lucide="user-plus" class="w-4 h-4"></i> Add New Client
        </button>
      </div>

      <!-- Search & Filters -->
      <div class="bg-white dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400"></i>
          <input 
            type="text" 
            id="customer-search" 
            oninput="window.app.filterCustomers()" 
            placeholder="Search by client name, company, or email..." 
            class="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <select id="customer-status-filter" onchange="window.app.filterCustomers()" class="px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500">
          <option value="All">All Client Types</option>
          <option value="VIP">VIP Client</option>
          <option value="Active Client">Active Client</option>
          <option value="Lead">Prospective Lead</option>
          <option value="Past Client">Past Client</option>
        </select>
      </div>

      <!-- Customers Grid -->
      <div id="customers-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${customers.map(c => `
          <div class="customer-card bg-white dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between" data-status="${c.status}">
            <div>
              <div class="flex items-start justify-between gap-3 mb-4">
                <div class="flex items-center gap-3">
                  <img src="${c.avatar}" alt="${this.escapeHTML(c.name)}" class="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/30" />
                  <div>
                    <h3 class="text-base font-bold text-slate-900 dark:text-white">${this.escapeHTML(c.name)}</h3>
                    <p class="text-xs font-semibold text-indigo-500 truncate max-w-[160px]">${this.escapeHTML(c.company || 'Private Client')}</p>
                    <span class="text-[11px] font-mono text-slate-400">${c.id}</span>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${c.status === 'VIP' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40' : this.getStatusBadgeClass(c.status)}">
                  ${c.status}
                </span>
              </div>

              <div class="space-y-2 text-xs py-3 border-y border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
                <div class="flex items-center gap-2 truncate">
                  <i data-lucide="mail" class="w-3.5 h-3.5 text-slate-400 flex-shrink-0"></i>
                  <span class="truncate">${this.escapeHTML(c.email)}</span>
                </div>
                <div class="flex items-center gap-2">
                  <i data-lucide="phone" class="w-3.5 h-3.5 text-slate-400 flex-shrink-0"></i>
                  <span>${this.escapeHTML(c.phone)}</span>
                </div>
                <div class="flex items-center gap-2 truncate">
                  <i data-lucide="map-pin" class="w-3.5 h-3.5 text-slate-400 flex-shrink-0"></i>
                  <span class="truncate">${this.escapeHTML(c.address)}</span>
                </div>
              </div>

              <!-- Projects & Communications Count -->
              <div class="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span class="text-slate-400 block text-[10px] uppercase font-semibold">Commissioned</span>
                  <span class="font-bold text-slate-900 dark:text-white">${c.projectIds?.length || 0} Projects</span>
                </div>
                <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <span class="text-slate-400 block text-[10px] uppercase font-semibold">Lifetime Value</span>
                  <span class="font-bold text-emerald-500">${curr}${Number(c.totalSpent || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button onclick="window.app.viewCustomerProfile('${c.id}')" class="text-xs font-semibold text-amber-500 hover:text-amber-400 flex items-center gap-1">
                View Dossier & Comms <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
              </button>
              <div class="flex items-center gap-2">
                <button onclick="window.app.editCustomer('${c.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-all">
                  <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                </button>
                <button onclick="window.app.deleteCustomer('${c.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  // --- 7. INVENTORY & MATERIAL MANAGEMENT VIEW ---
  renderInventory() {
    const inventory = window.store.getInventory();
    const curr = window.store.getSettings().currency || "$";

    return `
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-2xl font-bold font-display text-slate-900 dark:text-white">Material & Interior Sample Inventory</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Track architectural finishes, stone, timber, lighting fixtures, and project stock reserves</p>
        </div>
        <button onclick="window.app.openModal('modal-add-inventory')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-md">
          <i data-lucide="plus" class="w-4 h-4"></i> Catalog New Material
        </button>
      </div>

      <!-- Filters & Search -->
      <div class="bg-white dark:bg-slate-900/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <i data-lucide="search" class="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400"></i>
          <input 
            type="text" 
            id="inventory-search" 
            oninput="window.app.filterInventory()" 
            placeholder="Search material name, SKU, or supplier..." 
            class="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div class="flex items-center gap-3">
          <select id="inventory-status-filter" onchange="window.app.filterInventory()" class="px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500">
            <option value="All">All Stock Levels</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>

          <select id="inventory-category-filter" onchange="window.app.filterInventory()" class="px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500">
            <option value="All">All Categories</option>
            <option value="Stone & Marble">Stone & Marble</option>
            <option value="Flooring">Flooring</option>
            <option value="Wood & Millwork">Wood & Millwork</option>
            <option value="Hardware & Fixtures">Hardware & Fixtures</option>
            <option value="Glass & Glazing">Glass & Glazing</option>
            <option value="Lighting">Lighting</option>
            <option value="Paints & Finishes">Paints & Finishes</option>
            <option value="Fabrics & Upholstery">Fabrics & Upholstery</option>
          </select>
        </div>
      </div>

      <!-- Inventory Table -->
      <div class="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold">
              <tr>
                <th class="p-4">SKU / Item</th>
                <th class="p-4">Category</th>
                <th class="p-4">Stock Level</th>
                <th class="p-4">Unit Cost</th>
                <th class="p-4">Total Value</th>
                <th class="p-4">Supplier</th>
                <th class="p-4">Status</th>
                <th class="p-4 text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody id="inventory-tbody" class="divide-y divide-slate-100 dark:divide-slate-800">
              ${inventory.map(item => {
                const totalVal = Number(item.stock) * Number(item.unitCost);
                return `
                  <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td class="p-4">
                      <div class="font-bold text-slate-900 dark:text-white text-sm">${this.escapeHTML(item.name)}</div>
                      <div class="text-[11px] font-mono text-slate-400">${item.sku} · ${this.escapeHTML(item.location || 'Warehouse')}</div>
                    </td>
                    <td class="p-4 text-slate-600 dark:text-slate-300 font-medium">${this.escapeHTML(item.category)}</td>
                    <td class="p-4">
                      <div class="font-bold text-slate-900 dark:text-white">${item.stock} <span class="font-normal text-slate-400">${item.unit}</span></div>
                      <div class="text-[10px] text-slate-400">Reorder at ${item.reorderLevel} ${item.unit}</div>
                    </td>
                    <td class="p-4 text-slate-700 dark:text-slate-300">${curr}${Number(item.unitCost).toLocaleString()}</td>
                    <td class="p-4 font-bold text-slate-900 dark:text-white">${curr}${totalVal.toLocaleString()}</td>
                    <td class="p-4 text-slate-600 dark:text-slate-300">${this.escapeHTML(item.supplier)}</td>
                    <td class="p-4">
                      <span class="px-2.5 py-1 rounded-full font-semibold ${this.getStatusBadgeClass(item.status)}">
                        ${item.status}
                      </span>
                    </td>
                    <td class="p-4 text-right">
                      <div class="inline-flex items-center gap-1">
                        <button onclick="window.app.adjustStock('${item.id}', -1)" class="w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center transition-all" title="Decrease Stock">
                          -
                        </button>
                        <button onclick="window.app.adjustStock('${item.id}', 1)" class="w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center transition-all" title="Increase Stock">
                          +
                        </button>
                        <button onclick="window.app.deleteInventory('${item.id}')" class="p-1.5 rounded text-slate-400 hover:text-rose-500 transition-all ml-1">
                          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --- 8. FINANCIAL MANAGEMENT VIEW ---
  renderFinancials() {
    const transactions = window.store.getTransactions();
    const curr = window.store.getSettings().currency || "$";
    const metrics = window.store.getDashboardMetrics();

    return `
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-2xl font-bold font-display text-slate-900 dark:text-white">Studio Financial Accounting & Cashflow</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Fee billings, material procurement, project expenses, and quarterly financial reports</p>
        </div>
        <div class="flex items-center gap-3">
          <button onclick="window.app.exportFinancialsCSV()" class="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all">
            <i data-lucide="download" class="w-4 h-4"></i> Export CSV
          </button>
          <button onclick="window.app.openModal('modal-add-transaction')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-md">
            <i data-lucide="plus" class="w-4 h-4"></i> Record Transaction
          </button>
        </div>
      </div>

      <!-- Financial Metric Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span class="text-xs uppercase font-semibold text-slate-400">Total Income</span>
          <div class="text-2xl font-bold font-display text-emerald-500 mt-1">${curr}${metrics.totalIncome.toLocaleString()}</div>
          <span class="text-xs text-slate-400">Milestone billings & retainers</span>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span class="text-xs uppercase font-semibold text-slate-400">Total Expenses</span>
          <div class="text-2xl font-bold font-display text-rose-500 mt-1">${curr}${metrics.totalExpenses.toLocaleString()}</div>
          <span class="text-xs text-slate-400">Materials, payroll & overhead</span>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span class="text-xs uppercase font-semibold text-slate-400">Net Profit</span>
          <div class="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1">${curr}${metrics.netProfit.toLocaleString()}</div>
          <span class="text-xs text-emerald-600 font-medium">${metrics.profitMargin}% Profit Margin</span>
        </div>

        <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span class="text-xs uppercase font-semibold text-slate-400">Salary Expenses</span>
          <div class="text-2xl font-bold font-display text-blue-500 mt-1">${curr}${metrics.totalPayrollPaid.toLocaleString()}</div>
          <span class="text-xs text-slate-400">Team compensation paid</span>
        </div>
      </div>

      <!-- Expense Category Breakdown Chart -->
      <div class="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold font-display text-slate-900 dark:text-white">Expense Distribution by Category</h3>
            <p class="text-xs text-slate-500">Proportional allocation of studio capital</p>
          </div>
        </div>
        <div class="h-64 w-full">
          <canvas id="financialCategoriesChart"></canvas>
        </div>
      </div>

      <!-- Transactions Ledger Table -->
      <div class="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 class="text-base font-bold text-slate-900 dark:text-white">Financial Ledger & Audit Trail</h3>
          <div class="flex items-center gap-3">
            <select id="financial-type-filter" onchange="window.app.filterTransactions()" class="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none">
              <option value="All">All Transactions</option>
              <option value="Income">Income Only</option>
              <option value="Expense">Expense Only</option>
            </select>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold">
              <tr>
                <th class="p-4">Tx ID</th>
                <th class="p-4">Date</th>
                <th class="p-4">Type</th>
                <th class="p-4">Category</th>
                <th class="p-4">Reference / Memo</th>
                <th class="p-4">Amount</th>
                <th class="p-4">Status</th>
                <th class="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody id="financials-tbody" class="divide-y divide-slate-100 dark:divide-slate-800">
              ${transactions.map(t => `
                <tr class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td class="p-4 font-mono font-semibold text-slate-400">${t.id}</td>
                  <td class="p-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">${t.date}</td>
                  <td class="p-4">
                    <span class="px-2.5 py-0.5 rounded-full font-semibold ${t.type === 'Income' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500'}">
                      ${t.type}
                    </span>
                  </td>
                  <td class="p-4 font-medium text-slate-800 dark:text-slate-200">${this.escapeHTML(t.category)}</td>
                  <td class="p-4 text-slate-600 dark:text-slate-300">
                    <div class="truncate max-w-xs font-medium">${this.escapeHTML(t.reference)}</div>
                    ${t.notes ? `<div class="text-[11px] text-slate-400 truncate max-w-xs">${this.escapeHTML(t.notes)}</div>` : ''}
                  </td>
                  <td class="p-4 font-bold text-sm ${t.type === 'Income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}">
                    ${t.type === 'Income' ? '+' : '-'}${curr}${Number(t.amount).toLocaleString()}
                  </td>
                  <td class="p-4">
                    <span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      ${t.status}
                    </span>
                  </td>
                  <td class="p-4 text-right">
                    <button onclick="window.app.deleteTransaction('${t.id}')" class="p-1 rounded text-slate-400 hover:text-rose-500 transition-all">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // --- 9. CUSTOMER RATING & REVIEW SYSTEM VIEW ---
  renderReviews() {
    const reviews = window.store.getReviews();
    const metrics = window.store.getDashboardMetrics();

    return `
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-2xl font-bold font-display text-slate-900 dark:text-white">Customer Rating & Review System</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Client satisfaction scores, architectural testimonials, and feedback management</p>
        </div>
        <button onclick="window.app.openModal('modal-add-review')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-md">
          <i data-lucide="star" class="w-4 h-4"></i> Add Client Review
        </button>
      </div>

      <!-- Rating Analytics Summary -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        <!-- Score Card -->
        <div class="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center text-center">
          <span class="text-xs uppercase font-semibold text-slate-400 tracking-wider">Overall Client Satisfaction</span>
          <div class="text-5xl font-black font-display text-amber-500 my-2">${metrics.avgRating}</div>
          <div class="flex items-center gap-1 text-amber-500 mb-2">
            ${[1, 2, 3, 4, 5].map(i => `<i data-lucide="star" class="w-5 h-5 fill-amber-500 text-amber-500"></i>`).join("")}
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400">Based on ${metrics.reviewCount} verified architecture reviews</p>
        </div>

        <!-- Rating Distribution Bar Chart -->
        <div class="lg:col-span-2 bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 class="text-base font-bold font-display text-slate-900 dark:text-white mb-3">Star Rating Breakdown</h3>
          <div class="h-44 w-full">
            <canvas id="ratingDistributionChart"></canvas>
          </div>
        </div>

      </div>

      <!-- Reviews Feed Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        ${reviews.map(rev => `
          <div class="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div class="flex items-start justify-between gap-4 mb-3">
                <div class="flex items-center gap-3">
                  <img src="${rev.avatar}" alt="" class="w-12 h-12 rounded-full object-cover border-2 border-amber-500/40" />
                  <div>
                    <h4 class="text-sm font-bold text-slate-900 dark:text-white">${this.escapeHTML(rev.customerName)}</h4>
                    <p class="text-xs text-slate-400">${this.escapeHTML(rev.company || 'Private Client')}</p>
                  </div>
                </div>

                <div class="flex items-center gap-1 text-amber-500">
                  ${Array.from({ length: rev.rating }).map(() => `<i data-lucide="star" class="w-4 h-4 fill-amber-500 text-amber-500"></i>`).join("")}
                </div>
              </div>

              <div class="mb-3">
                <span class="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-2">
                  ${this.escapeHTML(rev.projectName)}
                </span>
                <h5 class="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">${this.escapeHTML(rev.title)}</h5>
                <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                  "${this.escapeHTML(rev.comment)}"
                </p>
              </div>
            </div>

            <div class="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span class="text-slate-400">${rev.date} · ${this.escapeHTML(rev.category || 'General')}</span>
              <div class="flex items-center gap-2">
                <button onclick="window.app.toggleFeaturedReview('${rev.id}')" class="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${rev.featured ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}">
                  ${rev.featured ? 'Featured on Web' : 'Feature'}
                </button>
                <button onclick="window.app.deleteReview('${rev.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-all">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  // --- 10. ARCHITECTURE PORTFOLIO VIEW ---
  renderPortfolio() {
    const portfolio = window.store.getPortfolio();

    return `
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-2xl font-bold font-display text-slate-900 dark:text-white">Architecture & Design Portfolio</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">Curated showcase of residential villas, commercial structures, interior transformations, and urban concepts</p>
        </div>
        <button onclick="window.app.openModal('modal-add-portfolio')" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-md">
          <i data-lucide="plus" class="w-4 h-4"></i> Add Portfolio Item
        </button>
      </div>

      <!-- Category Filter Pills -->
      <div class="flex flex-wrap items-center gap-2 mb-8">
        <button onclick="window.app.filterPortfolioCategory('All')" class="portfolio-filter-btn px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-amber-500 text-slate-950 shadow-md">
          All Works (${portfolio.length})
        </button>
        <button onclick="window.app.filterPortfolioCategory('Modern Building Designs')" class="portfolio-filter-btn px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800">
          Modern Building Designs
        </button>
        <button onclick="window.app.filterPortfolioCategory('Residential Architecture')" class="portfolio-filter-btn px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800">
          Residential Architecture
        </button>
        <button onclick="window.app.filterPortfolioCategory('Commercial Architecture')" class="portfolio-filter-btn px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800">
          Commercial Architecture
        </button>
        <button onclick="window.app.filterPortfolioCategory('Interior Design Projects')" class="portfolio-filter-btn px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800">
          Interior Design Projects
        </button>
        <button onclick="window.app.filterPortfolioCategory('Exterior Design Projects')" class="portfolio-filter-btn px-4 py-2 rounded-xl text-xs font-semibold transition-all bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800">
          Exterior Design Projects
        </button>
      </div>

      <!-- Portfolio Gallery Grid -->
      <div id="portfolio-gallery" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${portfolio.map(item => `
          <div class="portfolio-item group relative rounded-2xl overflow-hidden bg-slate-900 shadow-lg border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:-translate-y-1" data-cat="${item.category}">
            <div class="h-72 w-full overflow-hidden">
              <img src="${item.image}" alt="${this.escapeHTML(item.title)}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            </div>

            <!-- Dark Overlay with architectural typography -->
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity flex flex-col justify-end p-6">
              <span class="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
                ${this.escapeHTML(item.category)}
              </span>
              <h3 class="text-lg font-bold font-display text-white leading-tight mb-1">
                ${this.escapeHTML(item.title)}
              </h3>
              <p class="text-xs text-slate-300 line-clamp-2 mb-3">
                ${this.escapeHTML(item.description)}
              </p>

              <div class="flex items-center justify-between text-xs text-slate-300 pt-3 border-t border-white/10">
                <span><i data-lucide="map-pin" class="w-3.5 h-3.5 inline"></i> ${this.escapeHTML(item.location)}</span>
                <span>${item.year} · ${this.escapeHTML(item.area || '')}</span>
              </div>

              <div class="mt-3 flex items-center justify-between">
                <button onclick="window.app.openLightbox('${item.image}', '${this.escapeHTML(item.title)}', '${this.escapeHTML(item.description)}', '${this.escapeHTML(item.location)}')" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-all">
                  <i data-lucide="maximize-2" class="w-3.5 h-3.5"></i> Inspect Render
                </button>
                <button onclick="window.app.deletePortfolio('${item.id}')" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 transition-all" title="Delete">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }

  // --- 11. SETTINGS VIEW ---
  renderSettings() {
    const settings = window.store.getSettings();

    return `
      <!-- Header -->
      <div class="mb-6">
        <h2 class="text-2xl font-bold font-display text-slate-900 dark:text-white">Studio Configuration & Profile Settings</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">Manage studio identity, admin credentials, currency symbols, and database backups</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left Column: Company & Profile -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Company Info Form -->
          <div class="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <i data-lucide="building-2" class="w-5 h-5 text-amber-500"></i>
              Company Architecture Studio Information
            </h3>

            <form id="settings-company-form" onsubmit="window.app.saveCompanySettings(event)" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Company / Firm Name</label>
                  <input type="text" name="name" value="${this.escapeHTML(settings.name)}" required class="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Tagline / Specialization</label>
                  <input type="text" name="tagline" value="${this.escapeHTML(settings.tagline)}" class="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Official Contact Email</label>
                  <input type="email" name="email" value="${this.escapeHTML(settings.email)}" class="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Phone Number</label>
                  <input type="text" name="phone" value="${this.escapeHTML(settings.phone)}" class="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Studio Headquarters Address</label>
                <input type="text" name="address" value="${this.escapeHTML(settings.address)}" class="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500" />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Architecture Board License / Reg</label>
                  <input type="text" name="license" value="${this.escapeHTML(settings.license)}" class="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Default Currency Symbol</label>
                  <select name="currency" class="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500">
                    <option value="$" ${settings.currency === '$' ? 'selected' : ''}>$ (USD / AUD / CAD)</option>
                    <option value="€" ${settings.currency === '€' ? 'selected' : ''}>€ (EUR)</option>
                    <option value="£" ${settings.currency === '£' ? 'selected' : ''}>£ (GBP)</option>
                    <option value="৳" ${settings.currency === '৳' ? 'selected' : ''}>৳ (BDT)</option>
                    <option value="₹" ${settings.currency === '₹' ? 'selected' : ''}>₹ (INR)</option>
                  </select>
                </div>
              </div>

              <div class="pt-2 text-right">
                <button type="submit" class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-md">
                  Save Studio Changes
                </button>
              </div>
            </form>
          </div>

          <!-- Principal Architect / Admin Profile -->
          <div class="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <i data-lucide="user-check" class="w-5 h-5 text-indigo-500"></i>
              Managing Director / Admin Dossier
            </h3>

            <form id="settings-admin-form" onsubmit="window.app.saveAdminSettings(event)" class="space-y-4">
              <div class="flex items-center gap-4 mb-2">
                <img src="${settings.adminProfile?.avatar}" alt="Admin" class="w-16 h-16 rounded-2xl object-cover border-2 border-amber-500/40" />
                <div class="flex-1">
                  <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Avatar Photo URL</label>
                  <input type="url" name="avatar" value="${this.escapeHTML(settings.adminProfile?.avatar)}" class="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Administrator Name</label>
                  <input type="text" name="name" value="${this.escapeHTML(settings.adminProfile?.name)}" required class="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Professional Role</label>
                  <input type="text" name="role" value="${this.escapeHTML(settings.adminProfile?.role)}" class="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Bio & Credentials</label>
                <textarea name="bio" rows="2" class="w-full px-3 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">${this.escapeHTML(settings.adminProfile?.bio)}</textarea>
              </div>

              <div class="pt-2 text-right">
                <button type="submit" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-md">
                  Update Admin Profile
                </button>
              </div>
            </form>
          </div>

        </div>

        <!-- Right Column: Preferences, Backup & Danger Zone -->
        <div class="space-y-6">
          
          <!-- System Preferences -->
          <div class="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <i data-lucide="sliders" class="w-5 h-5 text-amber-500"></i>
              System Preferences
            </h3>

            <div class="space-y-4 text-xs">
              <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div>
                  <div class="font-bold text-slate-900 dark:text-white">Dark / Light Interface</div>
                  <div class="text-slate-400">Toggle dark architectural studio mode</div>
                </div>
                <button onclick="window.app.toggleTheme()" class="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 font-semibold text-slate-800 dark:text-slate-200">
                  Switch Theme
                </button>
              </div>

              <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div>
                  <div class="font-bold text-slate-900 dark:text-white">Project Deadline Alerts</div>
                  <div class="text-slate-400">Notify 7 days prior to handover</div>
                </div>
                <input type="checkbox" checked class="w-4 h-4 rounded text-amber-500 focus:ring-amber-500" />
              </div>

              <div class="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <div>
                  <div class="font-bold text-slate-900 dark:text-white">Material Low Stock Alerts</div>
                  <div class="text-slate-400">Alert when stock hits reorder level</div>
                </div>
                <input type="checkbox" checked class="w-4 h-4 rounded text-amber-500 focus:ring-amber-500" />
              </div>
            </div>
          </div>

          <!-- Data Backup & Reset -->
          <div class="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 class="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <i data-lucide="database" class="w-5 h-5 text-emerald-500"></i>
              Data Backup & Restore
            </h3>

            <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Export all architectural projects, employee salaries, and inventory records as a standardized JSON backup file.
            </p>

            <div class="space-y-3">
              <button onclick="window.store.exportBackupJSON()" class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-sm">
                <i data-lucide="download" class="w-4 h-4"></i> Export System Backup (.JSON)
              </button>

              <label class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all cursor-pointer">
                <i data-lucide="upload" class="w-4 h-4"></i> Import System Backup
                <input type="file" id="backup-import-file" accept=".json" onchange="window.app.handleBackupImport(event)" class="hidden" />
              </label>

              <div class="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button onclick="window.app.confirmResetDemoData()" class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-semibold text-xs transition-all border border-rose-500/20">
                  <i data-lucide="refresh-cw" class="w-4 h-4"></i> Reset to Sample Studio Demo Data
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    `;
  }

  renderReports() {
    return `
      <div class="space-y-6">
        <div class="flex items-center justify-between pb-4 border-b border-[#E4E4E7]">
          <div>
            <h2 class="text-xl font-bold font-display text-[#18181B]">Studio Performance Audit & Analytics</h2>
            <p class="text-xs text-[#71717A]">Comprehensive financial, project and workforce audit</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.print()" class="btn-secondary py-1.5 px-3 text-xs inline-flex items-center gap-1.5">
              <i data-lucide="printer" class="w-3.5 h-3.5"></i> Print Audit
            </button>
            <button onclick="window.app ? window.app.exportFinancialsCSV() : null" class="btn-primary py-1.5 px-3 text-xs inline-flex items-center gap-1.5">
              <i data-lucide="download" class="w-3.5 h-3.5"></i> Export CSV
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="card-base bg-white p-6 shadow-sm">
            <h3 class="text-base font-bold font-display text-[#18181B] mb-4">Cashflow Trend Analysis</h3>
            <div class="h-64 w-full">
              <canvas id="revenueExpenseChart"></canvas>
            </div>
          </div>

          <div class="card-base bg-white p-6 shadow-sm">
            <h3 class="text-base font-bold font-display text-[#18181B] mb-4">Architecture Portfolio Allocation</h3>
            <div class="h-64 w-full">
              <canvas id="projectStatusChart"></canvas>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="card-base bg-white p-6 shadow-sm">
            <h3 class="text-base font-bold font-display text-[#18181B] mb-4">Expense Categories</h3>
            <div class="h-64 w-full">
              <canvas id="financialCategoriesChart"></canvas>
            </div>
          </div>

          <div class="card-base bg-white p-6 shadow-sm">
            <h3 class="text-base font-bold font-display text-[#18181B] mb-4">Team Headcount Distribution</h3>
            <div class="h-64 w-full">
              <canvas id="departmentShareChart"></canvas>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --- 11. NOTIFICATIONS VIEW ---
  renderNotifications() {
    return `
      <div class="max-w-4xl mx-auto space-y-4">
        <div class="flex items-center justify-between pb-4 border-b border-[#E4E4E7]">
          <div>
            <h2 class="text-xl font-bold font-display text-[#18181B]">Operational Notifications & System Alerts</h2>
            <p class="text-xs text-[#71717A]">Real-time material procurement, purchase orders and site alerts</p>
          </div>
          <button onclick="window.app ? window.app.showToast('All notifications marked as read!') : null" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#18181B] text-white hover:bg-[#27272A] transition-colors shadow-sm">
            Mark all read
          </button>
        </div>

        <div class="space-y-3" id="notifications-list">
          <div class="p-5 rounded-3xl bg-white border border-[#E4E4E7] shadow-sm flex items-start gap-4">
            <div class="w-10 h-10 rounded-2xl bg-rose-50 text-[#DC2626] flex items-center justify-center flex-shrink-0 mt-0.5">
              <i data-lucide="alert-triangle" class="w-5 h-5"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-[#18181B]">Material Low Stock Alert</h4>
                <span class="text-[10px] text-[#A1A1AA]">10m ago</span>
              </div>
              <p class="text-xs text-[#71717A] mt-1">
                Magnetic Recessed Architectural LED Track is currently Out of Stock (0 units remaining). Needs reorder for Zenith Tower.
              </p>
            </div>
          </div>

          <div class="p-5 rounded-3xl bg-white border border-[#E4E4E7] shadow-sm flex items-start gap-4">
            <div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i data-lucide="clock" class="w-5 h-5"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-[#18181B]">Purchase Orders Awaiting Approval</h4>
                <span class="text-[10px] text-[#A1A1AA]">45m ago</span>
              </div>
              <p class="text-xs text-[#71717A] mt-1">
                3 purchase orders (PO-8819, PO-8820, PO-8822) require executive signoff before dispatch to Nordic Timber Co.
              </p>
            </div>
          </div>

          <div class="p-5 rounded-3xl bg-white border border-[#E4E4E7] shadow-sm flex items-start gap-4">
            <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i data-lucide="dollar-sign" class="w-5 h-5"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-[#18181B]">Client Retainer Payment Credited</h4>
                <span class="text-[10px] text-[#A1A1AA]">1h ago</span>
              </div>
              <p class="text-xs text-[#71717A] mt-1">
                Elysium Developments transferred TK 28,50,000 for Montauk Villa Phase 3 Interior Millwork release.
              </p>
            </div>
          </div>

          <div class="p-5 rounded-3xl bg-white border border-[#E4E4E7] shadow-sm flex items-start gap-4">
            <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i data-lucide="check-circle" class="w-5 h-5"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-[#18181B]">Zoning Permitting Approved</h4>
                <span class="text-[10px] text-[#A1A1AA]">3h ago</span>
              </div>
              <p class="text-xs text-[#71717A] mt-1">
                Waterfront Pavilion promenade geotechnical safety clearance confirmed by municipal board.
              </p>
            </div>
          </div>

          <div class="p-5 rounded-3xl bg-white border border-[#E4E4E7] shadow-sm flex items-start gap-4">
            <div class="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <i data-lucide="star" class="w-5 h-5"></i>
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-[#18181B]">New Client Testimonial Received</h4>
                <span class="text-[10px] text-[#A1A1AA]">Yesterday</span>
              </div>
              <p class="text-xs text-[#71717A] mt-1">
                Henry Kensington submitted a 5-star rating praising Alexander Vance and the architectural engineering team.
              </p>
            </div>
          </div>
        </div>
      </div>
    `;
  }
}

window.uiRenderer = new UIRenderer();

