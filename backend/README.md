# Bistirno ArchStudio Pro - Python Django Backend

Enterprise-grade, modular Python Django REST backend designed for distributed remote teams (2–3 developers) and pair programming with **Antigravity**.

---

## 🏛️ Architecture Overview

The backend is organized into decoupled Django apps under the `apps/` directory. Each developer can work independently on their designated feature modules without causing Git merge conflicts or blocking other teammates.

```
backend/
├── manage.py                          # Django execution entry point
├── requirements.txt                   # Default requirements pointer
├── requirements/
│   ├── base.txt                       # Core dependencies (Django, DRF, JWT, Spectacular)
│   ├── local.txt                      # Dev tools (Black, Flake8, PyTest, Debug Toolbar)
│   └── production.txt                 # Production servers (Gunicorn, Psycopg2, WhiteNoise)
├── .env.example                       # Environment variable blueprint
├── config/                            # Global project configuration
│   ├── __init__.py
│   ├── asgi.py                        # ASGI entry point for async/websockets
│   ├── wsgi.py                        # WSGI entry point for web servers
│   ├── urls.py                        # Centralized versioned routing (/api/v1/...)
│   └── settings/
│       ├── __init__.py
│       ├── base.py                    # Shared settings, apps registry, JWT & DRF config
│       ├── development.py             # Local dev settings (DEBUG=True, console email)
│       └── production.py              # Production security, Postgres, SSL
└── apps/                              # Isolated Feature Modules
    ├── common/                        # Shared base models, pagination & response helpers
    │   ├── models.py                  # TimeStampedUUIDModel, SoftDeleteModel
    │   ├── pagination.py              # StandardResultsSetPagination
    │   ├── permissions.py             # Role-based permissions (IsAdminOrManager, etc.)
    │   └── utils.py                   # Standardized api_response helper
    │
    ├── authentication/                # [Module 1] User Management & Auth
    │   ├── models.py                  # Custom User (Email auth, Roles: Admin, Architect, etc.)
    │   ├── serializers.py             # Registration, Login, Profile serializers
    │   ├── views.py                   # JWT Auth, Profile, User directory
    │   └── urls.py                    # /api/v1/auth/...
    │
    ├── employees/                     # [Module 2] Employee, Attendance & Payroll
    │   ├── models.py                  # Department, Designation, Employee, Attendance, Payroll
    │   ├── serializers.py             # Staff profile, Attendance log & Salary slips
    │   ├── services.py                # Payroll auto-generation & salary disbursements
    │   ├── views.py                   # Staff CRUD, Attendance records, Monthly payroll
    │   └── urls.py                    # /api/v1/employees/...
    │
    ├── customers/                     # [Module 3] Customer CRM & Communication
    │   ├── models.py                  # Customer, CommunicationLog, CustomerReview
    │   ├── serializers.py             # Client details, Interaction timeline, Reviews
    │   ├── views.py                   # CRM endpoints, Timeline logs, 1-5 Star reviews
    │   └── urls.py                    # /api/v1/customers/...
    │
    ├── projects/                      # [Module 4] Architectural Commissions
    │   ├── models.py                  # Project, Category, Milestones, Render Gallery
    │   ├── serializers.py             # Project dossiers, Milestones, Renders
    │   ├── services.py                # Auto-calculation of project progress percentage
    │   ├── views.py                   # Projects, Milestones, Renders & Portfolio showcase
    │   └── urls.py                    # /api/v1/projects/...
    │
    ├── finance/                       # [Module 5] Studio Accounting & Ledgers
    │   ├── models.py                  # Accounts, Invoices, Expenses, Transactions
    │   ├── serializers.py             # Ledger audit trail, Invoices, Expense entries
    │   ├── services.py                # Atomic balance updates & invoice payment tracking
    │   ├── views.py                   # Transaction register, Invoices, Account balances
    │   └── urls.py                    # /api/v1/finance/...
    │
    └── reports/                       # [Module 6] Reports & Dashboard Analytics
        ├── models.py                  # Saved and exported reports
        ├── serializers.py             # KPI serializer, Cashflow analytics
        ├── services.py                # Aggregate queries for dashboard & chart.js
        ├── views.py                   # Dashboard banner KPIs, Project status & Revenue chart
        └── urls.py                    # /api/v1/reports/...
```

---

## 👥 Remote Team Responsibility Matrix (2–3 Developers)

To ensure zero Git merge collisions and maximum velocity:

| Developer | Primary Assigned Modules | Frontend Pages Powered |
| :--- | :--- | :--- |
| **Developer 1** | `apps/authentication` + `apps/customers` | Login, `customers.html`, `customer-details.html`, `reviews.html` |
| **Developer 2** | `apps/employees` (Salary & Payroll) + `apps/finance` | `employees.html`, `employee-details.html`, `salaries.html`, `salary-details.html`, `finance.html` |
| **Developer 3** | `apps/projects` + `apps/reports` | `projects.html`, `project-details.html`, `portfolio.html`, `dashboard.html`, `reports.html` |

---

## ⚡ Quick Start (Local Setup)

### 1. Create and Activate Virtual Environment
```bash
cd backend
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Linux / macOS:
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Setup Environment Variables
```bash
cp .env.example .env
```

### 4. Apply Migrations & Create Superuser
```bash
python manage.py makemigrations common authentication employees customers projects finance reports
python manage.py migrate
python manage.py createsuperuser
```

### 5. Run the Local Development Server
```bash
python manage.py runserver
```
- API Base: `http://127.0.0.1:8000/api/v1/`
- Interactive Swagger UI: `http://127.0.0.1:8000/api/docs/`
- Interactive ReDoc: `http://127.0.0.1:8000/api/redoc/`
- Django Admin: `http://127.0.0.1:8000/admin/`

---

## 🤖 Using Antigravity Remotely With This Architecture

This structure is tailored for **Antigravity AI**:

1. **Self-Contained Apps**: Every module has its own `models.py`, `serializers.py`, `views.py`, `urls.py`, `services.py`, and `tests/`. Antigravity can be prompted to modify or expand any single module without touching or breaking other developers' code.
2. **Abstract Common Base**: `apps/common/models.py` provides `TimeStampedUUIDModel` so that models created across all apps share consistent UUID primary keys and timestamp tracking.
3. **Automated Documentation**: `drf-spectacular` is pre-configured, giving frontend developers and AI agents instant OpenAPI schemas at `/api/docs/`.

