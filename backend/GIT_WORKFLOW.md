# 🚀 Remote Team Git & GitHub Workflow Guide

## 1. Branch Strategy

We follow a clean, feature-branch workflow. **Direct pushes to `main` and `develop` are prohibited.**

```
main          ─────────────────────────● (Production Releases)
                 ▲
develop       ───┴───●───────────●─────● (Integration & Staging)
                     ▲           ▲
feature/auth         └──●──●─────┘
feature/employees          └──●──●
feature/projects                └──●
```

### Branch Naming Conventions:
- **Authentication**: `feature/auth-<short-description>` (e.g. `feature/auth-jwt-refresh`)
- **Employees & Payroll**: `feature/emp-<short-description>` (e.g. `feature/emp-payslip-pdf`)
- **Customers**: `feature/customer-<short-description>` (e.g. `feature/customer-timeline`)
- **Projects**: `feature/project-<short-description>` (e.g. `feature/project-milestones`)
- **Finance**: `feature/finance-<short-description>` (e.g. `feature/finance-ledger-entry`)
- **Reports**: `feature/reports-<short-description>` (e.g. `feature/reports-kpi-summary`)
- **Bug fixes**: `bugfix/<module>-<short-description>`
- **Hot fixes**: `hotfix/<short-description>`

---

## 2. Daily Developer Routine

### Step 1: Pull Latest Changes Before Starting
```bash
git checkout develop
git pull origin develop
```

### Step 2: Create a Feature Branch
```bash
git checkout -b feature/emp-salary-breakdown
```

### Step 3: Work strictly within your assigned module directory
For example, if you are Developer 2:
- Edit files inside `backend/apps/employees/` and `backend/apps/finance/`.
- Do not edit `backend/apps/customers/` or other teammates' modules without coordination.

### Step 4: Run Tests Locally Before Committing
```bash
python manage.py test apps.employees
```

### Step 5: Commit and Push
```bash
git add backend/apps/employees/
git commit -m "feat(employees): implement monthly payroll generation service"
git push origin feature/emp-salary-breakdown
```

---

## 3. Resolving Django Database Migration Conflicts

If two developers create migrations concurrently:
1. Fetch latest changes from `develop`:
   ```bash
   git pull origin develop
   ```
2. If Django reports conflicting leaf migrations:
   ```bash
   python manage.py makemigrations --merge
   ```
3. Commit the merge migration file and push.

---

## 4. Pull Request (PR) Checklist

When creating a PR on GitHub:
1. Target branch must be `develop`.
2. Fill out the PR template (`.github/PULL_REQUEST_TEMPLATE.md`).
3. Ensure CI checks pass on GitHub Actions (`.github/workflows/ci.yml`).
4. Request review from at least one teammate before merging.

