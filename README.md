# Bistirno - ArchStudio Pro
### Inventory Management Architecture & Interior Design Management System

ArchStudio Pro is a modern web-based management application designed for architecture, interior design, and construction companies.

---

## 📁 Exact Project Structure

```
archstudio-pro/
│
├── index.html                    # Root entry point & automated redirect to dashboard
│
├── pages/
│   ├── dashboard.html            # Main studio dashboard & core analytics
│   ├── employees.html            # Staff directory, attendance & team management
│   ├── employee-details.html     # Employee profile dossier & compensation records
│   ├── customers.html            # Client management & CRM accounts
│   ├── customer-details.html     # Client profile & meeting communication timeline
│   ├── salaries.html             # Salary register & monthly payroll management
│   ├── salary-details.html       # Official printable studio salary pay slip
│   ├── projects.html             # Architectural commissions & project grid
│   ├── project-details.html      # Project dossier, milestones & render gallery
│   ├── portfolio.html            # Architectural showcase & full-screen lightbox
│   ├── reviews.html              # Customer ratings (1-5 stars) & testimonials
│   ├── finance.html              # Studio financial accounting & ledger audit trail
│   ├── reports.html              # Financial cashflow & resource analytics
│   ├── notifications.html        # System alerts, inventory warnings & payments
│   └── settings.html             # Studio branding, admin profile & database backup
│
├── css/
│   ├── style.css                 # Global theme & typography
│   ├── dashboard.css             # Dashboard banner & KPI styling
│   ├── employees.css             # Team directory & profile styles
│   ├── customers.css             # Client card styles & communication timeline
│   ├── salaries.css              # Payroll table & salary slip formatting
│   ├── projects.css              # Project cards & progress bar animation
│   ├── portfolio.css             # Architectural portfolio overlay & lightbox
│   ├── reviews.css               # Star ratings & testimonial cards
│   ├── finance.css               # Financial indicators & ledger styles
│   ├── reports.css               # Print analytics & chart containers
│   ├── settings.css              # Settings forms & preferences styling
│   ├── components.css            # Buttons, badges, modals & toast alerts
│   └── responsive.css            # Responsive layout rules & mobile drawer
│
├── assets/
│   ├── images/
│   │   ├── logo.png              # ArchStudio Pro studio emblem
│   │   ├── architecture/         # Architectural blueprint & site photography
│   │   ├── employees/            # Staff avatars & team portraits
│   │   ├── customers/            # Client logos & account avatars
│   │   └── projects/             # Architectural renderings & elevations
│   │
│   ├── icons/                    # Lucide SVG icon definitions
│   └── fonts/                    # Plus Jakarta Sans & Space Grotesk fonts
│
├── js/
│   ├── data.js                   # Pre-seeded architectural demo database
│   ├── store.js                  # LocalStorage state manager & KPI calculators
│   ├── charts.js                 # Chart.js analytics configuration
│   ├── ui.js                     # HTML component rendering engine
│   └── app.js                    # Navigation, filters, and event controllers
│
└── README.md                     # Project documentation
```

---

## 🏛️ Core Features

1. **Dashboard Management**:
   - Total Employees, Customers, Active & Completed Projects, Monthly Revenue, Expenses, Net Profit Margin, and Live Activities Feed.
   - Interactive Chart.js analytics for Revenue vs. Expenses and Project Status distribution.

2. **Employee Management**:
   - Add new employees, profile management, designations, departments (Architecture, Interior Design, Structural & BIM, Site Supervision, Estimation, Admin & HR).
   - Daily attendance register (Present, Late, Absent, On Leave) with punctuality metrics.
   - Dedicated profile dossier page (`employee-details.html`).

3. **Customer Management System**:
   - Add and manage client profiles, contact information, commissioned project histories.
   - Communication timeline (`customer-details.html`) to log meetings, site visits, and calls.

4. **Employee Salary & Payroll Management**:
   - Monthly salary statements, basic salary, performance bonus, and deductions.
   - One-click payout execution integrated into the studio financial ledger.
   - Official printable pay slip layout with authorized signature lines (`salary-details.html`).

5. **Architectural Project Management**:
   - Residential, Commercial, Interior Design, Modern Building, and Exterior Design commissions.
   - Interactive milestone checklist that auto-calculates project completion percentage.
   - Render gallery with thumbnail switcher and ability to add new render URLs (`project-details.html`).

6. **Customer Rating & Review System**:
   - 1–5 Star client ratings, verified testimonials, and star distribution breakdown chart (`reviews.html`).

7. **Architectural Showcase Portfolio**:
   - Curated gallery with category filters and interactive full-screen Lightbox inspector (`portfolio.html`).

8. **Financial Management & Ledger**:
   - Real-time income, operating expenses, salary payouts, and ledger audit trail (`finance.html`).
   - One-click CSV export of financial reports.

9. **Performance Reports & Analytics**:
   - Cashflow analysis, department resource allocation, and print-ready audit layouts (`reports.html`).

10. **Notifications & Alerts**:
    - Material low-stock warnings, client payment notifications, and permit approvals (`notifications.html`).

11. **Settings & Customization**:
    - Studio information, AIA license, currency selector (`$`, `€`, `£`, `৳`, `₹`), Dark/Light mode, and JSON database backup/restore (`settings.html`).

---

## 🚀 How to Run

Open `index.html` or `pages/dashboard.html` directly in any web browser, or serve locally with:
```powershell
python -m http.server 8080
```
and navigate to `http://localhost:8080`.
