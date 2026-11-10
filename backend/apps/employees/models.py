from decimal import Decimal
from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedUUIDModel

class Department(TimeStampedUUIDModel):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True, default='')

    def __str__(self):
        return self.name


class Designation(TimeStampedUUIDModel):
    title = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='designations')
    description = models.TextField(blank=True, default='')

    class Meta(TimeStampedUUIDModel.Meta):
        unique_together = ('title', 'department')

    def __str__(self):
        return f"{self.title} ({self.department.name})"


class Employee(TimeStampedUUIDModel):
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Active'
        ON_LEAVE = 'ON_LEAVE', 'On Leave'
        PROBATION = 'PROBATION', 'Probation'
        TERMINATED = 'TERMINATED', 'Terminated'
        RESIGNED = 'RESIGNED', 'Resigned'

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employee_profile'
    )
    employee_code = models.CharField(max_length=30, unique=True, db_index=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20)
    avatar = models.ImageField(upload_to='employees/avatars/', blank=True, null=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='employees')
    designation = models.ForeignKey(Designation, on_delete=models.SET_NULL, null=True, related_name='employees')
    joining_date = models.DateField()
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    hourly_rate = models.DecimalField(max_digits=8, decimal_places=2, default=Decimal('0.00'), blank=True)
    bank_account_name = models.CharField(max_length=100, blank=True, default='')
    bank_account_no = models.CharField(max_length=50, blank=True, default='')
    bank_name = models.CharField(max_length=100, blank=True, default='')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    address = models.TextField(blank=True, default='')

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.employee_code} - {self.full_name}"


class Attendance(TimeStampedUUIDModel):
    class Status(models.TextChoices):
        PRESENT = 'PRESENT', 'Present'
        LATE = 'LATE', 'Late'
        ABSENT = 'ABSENT', 'Absent'
        HALF_DAY = 'HALF_DAY', 'Half Day'
        ON_LEAVE = 'ON_LEAVE', 'On Leave'

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(db_index=True)
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PRESENT)
    notes = models.CharField(max_length=255, blank=True, default='')

    class Meta(TimeStampedUUIDModel.Meta):
        unique_together = ('employee', 'date')

    def __str__(self):
        return f"{self.employee.full_name} - {self.date} ({self.status})"


class Payroll(TimeStampedUUIDModel):
    class PaymentStatus(models.TextChoices):
        PENDING = 'PENDING', 'Pending Approval'
        APPROVED = 'APPROVED', 'Approved'
        PAID = 'PAID', 'Disbursed / Paid'
        CANCELLED = 'CANCELLED', 'Cancelled'

    class PaymentMethod(models.TextChoices):
        BANK_TRANSFER = 'BANK_TRANSFER', 'Bank Transfer'
        CASH = 'CASH', 'Cash'
        CHEQUE = 'CHEQUE', 'Cheque'
        MOBILE_BANKING = 'MOBILE_BANKING', 'bKash / Nagad / Rocket'

    payroll_code = models.CharField(max_length=50, unique=True)
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='payrolls')
    month = models.PositiveSmallIntegerField()  # 1 - 12
    year = models.PositiveSmallIntegerField()   # e.g. 2026

    basic_salary = models.DecimalField(max_digits=12, decimal_places=2)
    bonus = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    allowance = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    net_salary = models.DecimalField(max_digits=12, decimal_places=2)

    status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, default=PaymentMethod.BANK_TRANSFER)
    paid_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')

    class Meta(TimeStampedUUIDModel.Meta):
        unique_together = ('employee', 'month', 'year')

    def calculate_net_salary(self):
        total_earnings = self.basic_salary + self.bonus + self.allowance
        total_deductions = self.deductions + self.tax
        return total_earnings - total_deductions

    def save(self, *args, **kwargs):
        if not self.net_salary:
            self.net_salary = self.calculate_net_salary()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.payroll_code} - {self.employee.full_name} ({self.month}/{self.year})"

