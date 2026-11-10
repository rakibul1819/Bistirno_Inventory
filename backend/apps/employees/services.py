import uuid
from decimal import Decimal
from django.utils import timezone
from .models import Employee, Payroll

class PayrollService:
    @staticmethod
    def generate_monthly_payroll(month: int, year: int):
        """
        Batch-generates payroll draft records for all active employees for a given month and year.
        """
        active_employees = Employee.objects.filter(status=Employee.Status.ACTIVE)
        created_payrolls = []

        for emp in active_employees:
            # Check if payroll already exists
            payroll, created = Payroll.objects.get_or_create(
                employee=emp,
                month=month,
                year=year,
                defaults={
                    'payroll_code': f"PAY-{year}{month:02d}-{emp.employee_code}",
                    'basic_salary': emp.basic_salary,
                    'bonus': Decimal('0.00'),
                    'allowance': Decimal('0.00'),
                    'deductions': Decimal('0.00'),
                    'tax': Decimal('0.00'),
                    'net_salary': emp.basic_salary,
                    'status': Payroll.PaymentStatus.PENDING,
                }
            )
            if created:
                created_payrolls.append(payroll)

        return created_payrolls

    @staticmethod
    def disburse_payment(payroll: Payroll, payment_method: str = Payroll.PaymentMethod.BANK_TRANSFER):
        """
        Marks payroll as paid and sets the timestamp.
        """
        payroll.status = Payroll.PaymentStatus.PAID
        payroll.payment_method = payment_method
        payroll.paid_at = timezone.now()
        payroll.save()
        return payroll

