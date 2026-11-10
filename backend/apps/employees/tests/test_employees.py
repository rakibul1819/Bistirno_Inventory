from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from apps.employees.models import Department, Designation, Employee, Payroll

class EmployeeTestCase(TestCase):
    def setUp(self):
        self.dept = Department.objects.create(name='Architecture', code='ARCH')
        self.desig = Designation.objects.create(title='Lead Architect', department=self.dept)
        self.employee = Employee.objects.create(
            employee_code='EMP-001',
            first_name='Rakibul',
            last_name='Islam',
            email='rakib@archstudio.pro',
            phone='+8801700000000',
            department=self.dept,
            designation=self.desig,
            joining_date=timezone.now().date(),
            basic_salary=Decimal('75000.00')
        )

    def test_payroll_net_salary_calculation(self):
        payroll = Payroll.objects.create(
            payroll_code='PAY-202611-EMP001',
            employee=self.employee,
            month=11,
            year=2026,
            basic_salary=Decimal('75000.00'),
            bonus=Decimal('5000.00'),
            allowance=Decimal('2000.00'),
            deductions=Decimal('1000.00'),
            tax=Decimal('2000.00')
        )
        self.assertEqual(payroll.net_salary, Decimal('79000.00'))

