from decimal import Decimal
from django.utils import timezone
from django.db.models import Sum, Count
from apps.employees.models import Employee
from apps.customers.models import Customer
from apps.projects.models import Project
from apps.finance.models import Transaction

class DashboardAnalyticsService:
    @staticmethod
    def get_kpi_summary():
        """
        Calculates top-level KPI metrics powering dashboard.html banner.
        """
        now = timezone.now()
        current_month = now.month
        current_year = now.year

        total_employees = Employee.objects.filter(status=Employee.Status.ACTIVE).count()
        total_customers = Customer.objects.filter(status=Customer.Status.ACTIVE).count()
        
        active_projects = Project.objects.exclude(status__in=[Project.Status.COMPLETED, Project.Status.ON_HOLD]).count()
        completed_projects = Project.objects.filter(status=Project.Status.COMPLETED).count()

        # Monthly Financials
        revenue_sum = Transaction.objects.filter(
            transaction_type=Transaction.Type.INCOME,
            transaction_date__year=current_year,
            transaction_date__month=current_month
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        expense_sum = Transaction.objects.filter(
            transaction_type=Transaction.Type.EXPENSE,
            transaction_date__year=current_year,
            transaction_date__month=current_month
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

        net_profit = revenue_sum - expense_sum
        profit_margin = float((net_profit / revenue_sum) * 100) if revenue_sum > 0 else 0.0

        return {
            'total_employees': total_employees,
            'total_customers': total_customers,
            'active_projects': active_projects,
            'completed_projects': completed_projects,
            'monthly_revenue': revenue_sum,
            'monthly_expenses': expense_sum,
            'net_profit': net_profit,
            'profit_margin_percentage': round(profit_margin, 2)
        }

    @staticmethod
    def get_project_status_distribution():
        """
        Powers the Project Status doughnut/pie chart on dashboard.html.
        """
        statuses = Project.objects.values('status').annotate(count=Count('id'))
        return list(statuses)

    @staticmethod
    def get_revenue_vs_expense_chart(months: int = 6):
        """
        Powers the Revenue vs Expense bar/line chart on dashboard.html & reports.html.
        """
        # Return aggregate monthly breakdown
        chart_data = []
        now = timezone.now()
        
        for i in range(months - 1, -1, -1):
            target_date = now - timezone.timedelta(days=i * 30)
            m = target_date.month
            y = target_date.year

            rev = Transaction.objects.filter(
                transaction_type=Transaction.Type.INCOME,
                transaction_date__year=y,
                transaction_date__month=m
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            exp = Transaction.objects.filter(
                transaction_type=Transaction.Type.EXPENSE,
                transaction_date__year=y,
                transaction_date__month=m
            ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')

            chart_data.append({
                'month_name': target_date.strftime('%b %Y'),
                'revenue': float(rev),
                'expenses': float(exp),
                'profit': float(rev - exp)
            })

        return chart_data

