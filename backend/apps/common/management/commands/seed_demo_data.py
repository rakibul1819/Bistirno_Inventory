import datetime
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.employees.models import Department, Designation, Employee, Attendance, Payroll
from apps.customers.models import Customer, CommunicationLog, CustomerReview
from apps.projects.models import ProjectCategory, Project, ProjectMilestone, ProjectRender
from apps.finance.models import FinancialAccount, ExpenseCategory, Invoice, Transaction
from apps.reports.models import SavedReport

User = get_user_model()

class Command(BaseCommand):
    help = 'Populates the database with initial demonstration studio data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Seeding demo data for Bistirno ArchStudio Pro...'))

        # 1. Admin & Users
        admin_user, _ = User.objects.get_or_create(
            email='admin@bistirno.com',
            defaults={
                'first_name': 'Alexander',
                'last_name': 'Vance',
                'role': User.Role.ADMIN,
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if not admin_user.has_usable_password():
            admin_user.set_password('admin')
            admin_user.save()

        # 2. Departments
        dept_arch, _ = Department.objects.get_or_create(code='ARCH', defaults={'name': 'Architecture & Design', 'description': 'Architectural design, drawings & spatial planning'})
        dept_int, _ = Department.objects.get_or_create(code='INT', defaults={'name': 'Interior Design', 'description': 'Commercial and luxury residential interiors'})
        dept_bim, _ = Department.objects.get_or_create(code='BIM', defaults={'name': 'Structural & BIM', 'description': 'Structural analysis, 3D modeling and BIM workflows'})
        dept_site, _ = Department.objects.get_or_create(code='SITE', defaults={'name': 'Site Supervision', 'description': 'Site execution, contractors and material inspection'})
        dept_fin, _ = Department.objects.get_or_create(code='FIN', defaults={'name': 'Finance & Accounts', 'description': 'Studio ledger, payroll and invoicing'})

        # 3. Designations
        des_princ, _ = Designation.objects.get_or_create(department=dept_arch, title='Principal Architect')
        des_lead_arch, _ = Designation.objects.get_or_create(department=dept_arch, title='Senior Architect')
        des_sr_int, _ = Designation.objects.get_or_create(department=dept_int, title='Lead Interior Designer')
        des_bim, _ = Designation.objects.get_or_create(department=dept_bim, title='BIM Specialist')
        des_site, _ = Designation.objects.get_or_create(department=dept_site, title='Site Project Engineer')
        des_acc, _ = Designation.objects.get_or_create(department=dept_fin, title='Senior Accountant')

        # 4. Employees
        emp1, _ = Employee.objects.get_or_create(
            employee_code='EMP-101',
            defaults={
                'first_name': 'Alexander',
                'last_name': 'Vance',
                'email': 'alexander.vance@bistirno.com',
                'phone': '+880 1711 000101',
                'department': dept_arch,
                'designation': des_princ,
                'joining_date': datetime.date(2021, 1, 15),
                'basic_salary': Decimal('150000.00'),
                'bank_account_name': 'Alexander Vance',
                'bank_account_no': '1012938475',
                'bank_name': 'Standard Chartered',
                'status': Employee.Status.ACTIVE,
            }
        )
        emp2, _ = Employee.objects.get_or_create(
            employee_code='EMP-102',
            defaults={
                'first_name': 'Sophia',
                'last_name': 'Lorenzi',
                'email': 'sophia.lorenzi@bistirno.com',
                'phone': '+880 1711 000102',
                'department': dept_int,
                'designation': des_sr_int,
                'joining_date': datetime.date(2022, 3, 1),
                'basic_salary': Decimal('95000.00'),
                'bank_account_name': 'Sophia Lorenzi',
                'bank_account_no': '2019485736',
                'bank_name': 'BRAC Bank',
                'status': Employee.Status.ACTIVE,
            }
        )
        emp3, _ = Employee.objects.get_or_create(
            employee_code='EMP-103',
            defaults={
                'first_name': 'Marcus',
                'last_name': 'Thorne',
                'email': 'marcus.thorne@bistirno.com',
                'phone': '+880 1711 000103',
                'department': dept_bim,
                'designation': des_bim,
                'joining_date': datetime.date(2022, 6, 15),
                'basic_salary': Decimal('85000.00'),
                'bank_account_name': 'Marcus Thorne',
                'bank_account_no': '3018274650',
                'bank_name': 'City Bank',
                'status': Employee.Status.ACTIVE,
            }
        )

        # 5. Customers
        cust1, _ = Customer.objects.get_or_create(
            client_code='CLI-201',
            defaults={
                'full_name': 'Mahmudur Rahman',
                'company_name': 'Apex Holdings Ltd',
                'client_type': Customer.ClientType.CORPORATE,
                'email': 'm.rahman@apexholdings.com',
                'phone': '+880 1819 123456',
                'billing_address': 'Plot 45, Gulshan-2, Dhaka 1212',
                'status': Customer.Status.ACTIVE,
            }
        )
        cust2, _ = Customer.objects.get_or_create(
            client_code='CLI-202',
            defaults={
                'full_name': 'Dr. Farhana Ahmed',
                'company_name': 'Farhana Residence',
                'client_type': Customer.ClientType.INDIVIDUAL,
                'email': 'dr.farhana@gmail.com',
                'phone': '+880 1912 654321',
                'billing_address': 'Road 11, Banani, Dhaka',
                'status': Customer.Status.ACTIVE,
            }
        )

        # 6. Project Categories
        cat_res, _ = ProjectCategory.objects.get_or_create(slug='residential', defaults={'name': 'Luxury Residential', 'description': 'Private duplexes, villas and luxury penthouses'})
        cat_com, _ = ProjectCategory.objects.get_or_create(slug='commercial', defaults={'name': 'Commercial Complex', 'description': 'Offices, retail centers, and towers'})
        cat_int, _ = ProjectCategory.objects.get_or_create(slug='interior', defaults={'name': 'Modern Interior', 'description': 'Corporate & high-end residence interior fit-outs'})

        # 7. Projects
        p1, _ = Project.objects.get_or_create(
            project_code='PRJ-401',
            defaults={
                'title': 'The Luminara Penthouse',
                'category': cat_int,
                'customer': cust1,
                'lead_architect': emp1,
                'location': 'Gulshan-2, Dhaka',
                'total_area_sqft': Decimal('6500.00'),
                'budget': Decimal('4500000.00'),
                'progress_percentage': 75,
                'start_date': datetime.date(2024, 1, 10),
                'status': Project.Status.CONSTRUCTION,
                'description': 'Luxury duplex penthouse interior with modern minimalist themes and imported Italian marble.',
            }
        )
        p2, _ = Project.objects.get_or_create(
            project_code='PRJ-402',
            defaults={
                'title': 'Aria Lakeside Villa',
                'category': cat_res,
                'customer': cust2,
                'lead_architect': emp2,
                'location': 'Purbachal Sector 4, Dhaka',
                'total_area_sqft': Decimal('8200.00'),
                'budget': Decimal('12000000.00'),
                'progress_percentage': 40,
                'start_date': datetime.date(2024, 4, 1),
                'status': Project.Status.DESIGN,
                'description': 'Lakeside sustainable modern villa featuring expansive cantilevered balconies and solar facade.',
            }
        )

        # 8. Milestones
        ProjectMilestone.objects.get_or_create(
            project=p1,
            title='Conceptual 3D Visuals & Client Sign-off',
            defaults={'weight_percentage': 25, 'is_completed': True, 'completed_at': datetime.datetime.now(datetime.timezone.utc)}
        )
        ProjectMilestone.objects.get_or_create(
            project=p1,
            title='Material Procurement & MEP Rough-in',
            defaults={'weight_percentage': 35, 'is_completed': True, 'completed_at': datetime.datetime.now(datetime.timezone.utc)}
        )
        ProjectMilestone.objects.get_or_create(
            project=p1,
            title='Cabinetry, Millwork & Finish Carpentry',
            defaults={'weight_percentage': 25, 'is_completed': False}
        )

        # 9. Financial Accounts
        acc_bank, _ = FinancialAccount.objects.get_or_create(
            name='SCB Corporate Operating Account',
            defaults={'account_type': FinancialAccount.AccountType.BANK, 'bank_name': 'Standard Chartered', 'account_number': '01-928374-01', 'balance': Decimal('2850000.00')}
        )
        acc_petty, _ = FinancialAccount.objects.get_or_create(
            name='Studio Petty Cash',
            defaults={'account_type': FinancialAccount.AccountType.PETTY_CASH, 'balance': Decimal('55000.00')}
        )

        # 10. Expense Categories
        exp_mat, _ = ExpenseCategory.objects.get_or_create(name='Building Materials & Hardware')
        exp_soft, _ = ExpenseCategory.objects.get_or_create(name='Software Licenses & BIM Cloud')
        exp_util, _ = ExpenseCategory.objects.get_or_create(name='Studio Utilities & Rent')

        # 11. Invoices
        inv1, _ = Invoice.objects.get_or_create(
            invoice_number='INV-2024-001',
            defaults={
                'customer': cust1,
                'project': p1,
                'issue_date': datetime.date(2024, 2, 1),
                'due_date': datetime.date(2024, 2, 15),
                'total_amount': Decimal('1500000.00'),
                'amount_paid': Decimal('1500000.00'),
                'status': Invoice.Status.PAID,
            }
        )

        # 12. Reviews
        CustomerReview.objects.get_or_create(
            customer=cust1,
            title='Exemplary Architectural Precision',
            defaults={
                'project_name': 'The Luminara Penthouse',
                'rating': 5,
                'comment': 'The Bistirno studio team brought a high level of sophistication and spatial harmony to our penthouse. Uncompromising execution quality.',
                'is_featured': True,
                'is_verified': True,
            }
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded Bistirno ArchStudio demonstration data!'))
