/**
 * Bistirno - ArchStudio Pro
 * Chart.js Analytics & Visualizations
 */

class ChartManager {
  constructor() {
    this.charts = {};
  }

  isDark() {
    return document.documentElement.classList.contains("dark");
  }

  getThemeColors() {
    const dark = this.isDark();
    return {
      text: dark ? "#94a3b8" : "#71717A",
      grid: dark ? "rgba(255, 255, 255, 0.06)" : "#E4E4E7",
      tooltipBg: dark ? "#0f172a" : "#FFFFFF",
      tooltipText: dark ? "#f8fafc" : "#18181B",
      tooltipBorder: dark ? "#334155" : "#E4E4E7",
      primary: "#18181B",
      secondary: "#A1A1AA",
      accent: "#10b981",
      danger: "#DC2626",
      purple: "#8b5cf6"
    };
  }

  destroyChart(id) {
    if (this.charts[id]) {
      this.charts[id].destroy();
      delete this.charts[id];
    }
  }

  // 1. Dashboard: Revenue vs Expenses Monthly Trend
  renderRevenueExpenseChart(canvasId = "revenueExpenseChart") {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this.destroyChart(canvasId);

    const colors = this.getThemeColors();
    const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];
    const incomeData = [210000, 340000, 290000, 480000, 390000, 1170000, 290000];
    const expenseData = [120000, 160000, 145000, 210000, 185000, 176570, 45000];

    this.charts[canvasId] = new Chart(ctx, {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
            label: "Income ($)",
            data: incomeData,
            borderColor: "#10b981",
            backgroundColor: "rgba(16, 185, 129, 0.12)",
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointBackgroundColor: "#10b981",
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: "Expenses ($)",
            data: expenseData,
            borderColor: "#f43f5e",
            backgroundColor: "rgba(244, 63, 94, 0.08)",
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointBackgroundColor: "#f43f5e",
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
            align: "end",
            labels: {
              color: colors.text,
              usePointStyle: true,
              pointStyle: "circle",
              boxWidth: 8,
              font: { family: "Plus Jakarta Sans", size: 12, weight: "500" }
            }
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipText,
            bodyColor: colors.tooltipText,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            usePointStyle: true,
            callbacks: {
              label: (context) => ` ${context.dataset.label}: $${context.raw.toLocaleString()}`
            }
          }
        },
        scales: {
          x: {
            grid: { color: colors.grid, drawBorder: false },
            ticks: { color: colors.text, font: { family: "Plus Jakarta Sans", size: 11 } }
          },
          y: {
            grid: { color: colors.grid, drawBorder: false },
            ticks: {
              color: colors.text,
              font: { family: "Plus Jakarta Sans", size: 11 },
              callback: (val) => `$${val >= 1000 ? val / 1000 + 'k' : val}`
            }
          }
        }
      }
    });
  }

  // 2. Dashboard: Project Status Distribution Doughnut
  renderProjectStatusChart(canvasId = "projectStatusChart") {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this.destroyChart(canvasId);

    const colors = this.getThemeColors();
    const projects = window.store.getProjects();
    const ongoing = projects.filter(p => p.status === "Ongoing").length;
    const completed = projects.filter(p => p.status === "Completed").length;
    const pending = projects.filter(p => p.status === "Pending").length;

    this.charts[canvasId] = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Ongoing", "Completed", "Pending"],
        datasets: [
          {
            data: [ongoing, completed, pending],
            backgroundColor: ["#f59e0b", "#10b981", "#64748b"],
            borderWidth: 0,
            hoverOffset: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "74%",
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: colors.text,
              usePointStyle: true,
              pointStyle: "circle",
              font: { family: "Plus Jakarta Sans", size: 12 }
            }
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipText,
            bodyColor: colors.tooltipText,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
            padding: 10
          }
        }
      }
    });
  }

  // 3. Financials: Expense Breakdown By Category
  renderFinancialCategoriesChart(canvasId = "financialCategoriesChart") {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this.destroyChart(canvasId);

    const colors = this.getThemeColors();
    const transactions = window.store.getTransactions().filter(t => t.type === "Expense");
    
    // Group by category
    const catMap = {};
    transactions.forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount);
    });

    const labels = Object.keys(catMap);
    const dataVals = Object.values(catMap);

    this.charts[canvasId] = new Chart(ctx, {
      type: "pie",
      data: {
        labels: labels.length ? labels : ["Payroll", "Materials", "Subcontractors", "Overhead"],
        datasets: [
          {
            data: dataVals.length ? dataVals : [71770, 48500, 32000, 24300],
            backgroundColor: [
              "#f59e0b",
              "#0284c7",
              "#8b5cf6",
              "#10b981",
              "#ec4899",
              "#64748b"
            ],
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: colors.text,
              usePointStyle: true,
              pointStyle: "circle",
              font: { family: "Plus Jakarta Sans", size: 11 }
            }
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipText,
            bodyColor: colors.tooltipText,
            borderColor: colors.tooltipBorder,
            borderWidth: 1,
            callbacks: {
              label: (context) => ` ${context.label}: $${context.raw.toLocaleString()}`
            }
          }
        }
      }
    });
  }

  // 4. Customer Ratings Distribution Bar Chart
  renderRatingDistributionChart(canvasId = "ratingDistributionChart") {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this.destroyChart(canvasId);

    const colors = this.getThemeColors();
    const reviews = window.store.getReviews();
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      const star = Math.floor(r.rating);
      if (counts[star] !== undefined) counts[star]++;
    });

    this.charts[canvasId] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["5 Stars", "4 Stars", "3 Stars", "2 Stars", "1 Star"],
        datasets: [
          {
            label: "Reviews",
            data: [counts[5], counts[4], counts[3], counts[2], counts[1]],
            backgroundColor: [
              "#f59e0b",
              "#fbbf24",
              "#cbd5e1",
              "#94a3b8",
              "#64748b"
            ],
            borderRadius: 6,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipText,
            bodyColor: colors.tooltipText,
            borderColor: colors.tooltipBorder,
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: { color: colors.grid, drawBorder: false },
            ticks: { color: colors.text, stepSize: 1, font: { family: "Plus Jakarta Sans" } }
          },
          y: {
            grid: { display: false },
            ticks: { color: colors.text, font: { family: "Plus Jakarta Sans", weight: "500" } }
          }
        }
      }
    });
  }

  // 5. Department Headcount / Payroll Distribution
  renderDepartmentShareChart(canvasId = "departmentShareChart") {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this.destroyChart(canvasId);

    const colors = this.getThemeColors();
    const employees = window.store.getEmployees();
    const deptMap = {};
    employees.forEach(e => {
      deptMap[e.department] = (deptMap[e.department] || 0) + 1;
    });

    this.charts[canvasId] = new Chart(ctx, {
      type: "polarArea",
      data: {
        labels: Object.keys(deptMap),
        datasets: [
          {
            data: Object.values(deptMap),
            backgroundColor: [
              "rgba(245, 158, 11, 0.7)",
              "rgba(2, 132, 199, 0.7)",
              "rgba(139, 92, 246, 0.7)",
              "rgba(16, 185, 129, 0.7)",
              "rgba(244, 63, 94, 0.7)"
            ],
            borderWidth: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: colors.text,
              usePointStyle: true,
              font: { family: "Plus Jakarta Sans", size: 11 }
            }
          }
        },
        scales: {
          r: {
            grid: { color: colors.grid },
            ticks: { display: false }
          }
        }
      }
    });
  }

  // 6. Weekly Studio Attendance Pattern (Mon - Sat)
  renderAttendanceWeeklyChart(canvasId = "attendanceWeeklyChart") {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    this.destroyChart(canvasId);

    const colors = this.getThemeColors();
    this.charts[canvasId] = new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        datasets: [
          {
            label: "Present",
            data: [10, 9, 10, 9, 10, 8],
            backgroundColor: "#10b981",
            borderRadius: 6
          },
          {
            label: "Late",
            data: [0, 1, 0, 1, 0, 1],
            backgroundColor: "#f59e0b",
            borderRadius: 6
          },
          {
            label: "Leave / Absent",
            data: [0, 0, 0, 0, 0, 1],
            backgroundColor: "#ef4444",
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: colors.text,
              usePointStyle: true,
              font: { family: "Plus Jakarta Sans", size: 11 }
            }
          },
          tooltip: {
            backgroundColor: colors.tooltipBg,
            titleColor: colors.tooltipText,
            bodyColor: colors.tooltipText,
            borderColor: colors.tooltipBorder,
            borderWidth: 1
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: colors.text, font: { family: "Plus Jakarta Sans", size: 11 } }
          },
          y: {
            grid: { color: colors.grid },
            ticks: { color: colors.text, stepSize: 2, font: { family: "Plus Jakarta Sans", size: 11 } },
            max: 12
          }
        }
      }
    });
  }

  // Refresh all active charts
  updateAll() {
    this.renderRevenueExpenseChart();
    this.renderProjectStatusChart();
    this.renderFinancialCategoriesChart();
    this.renderRatingDistributionChart();
    this.renderDepartmentShareChart();
    this.renderAttendanceWeeklyChart();
  }
}

window.chartManager = new ChartManager();

