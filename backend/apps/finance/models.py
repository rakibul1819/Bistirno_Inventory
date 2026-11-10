from decimal import Decimal
from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedUUIDModel

class FinancialAccount(TimeStampedUUIDModel):
    class AccountType(models.TextChoices):
        BANK = 'BANK', 'Bank Account'
        CASH = 'CASH', 'Cash in Hand'
        PETTY_CASH = 'PETTY_CASH', 'Petty Cash'
        MOBILE = 'MOBILE', 'Mobile Banking (bKash/Nagad)'

    name = models.CharField(max_length=100)
    account_type = models.CharField(max_length=20, choices=AccountType.choices, default=AccountType.BANK)
    account_number = models.CharField(max_length=50, blank=True, default='')
    bank_name = models.CharField(max_length=100, blank=True, default='')
    balance = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.get_account_type_display()}): ৳{self.balance}"


class ExpenseCategory(TimeStampedUUIDModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')

    def __str__(self):
        return self.name


class Invoice(TimeStampedUUIDModel):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        SENT = 'SENT', 'Sent to Client'
        PARTIALLY_PAID = 'PARTIALLY_PAID', 'Partially Paid'
        PAID = 'PAID', 'Fully Paid'
        OVERDUE = 'OVERDUE', 'Overdue'
        CANCELLED = 'CANCELLED', 'Cancelled'

    invoice_number = models.CharField(max_length=50, unique=True, db_index=True)
    customer = models.ForeignKey('customers.Customer', on_delete=models.CASCADE, related_name='invoices')
    project = models.ForeignKey('projects.Project', on_delete=models.SET_NULL, null=True, blank=True, related_name='invoices')
    issue_date = models.DateField()
    due_date = models.DateField()

    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    discount_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal('0.00'))

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    notes = models.TextField(blank=True, default='')

    @property
    def due_amount(self):
        return self.total_amount - self.amount_paid

    def __str__(self):
        return f"{self.invoice_number} - {self.customer.full_name} (৳{self.total_amount})"


class Transaction(TimeStampedUUIDModel):
    class Type(models.TextChoices):
        INCOME = 'INCOME', 'Income / Revenue'
        EXPENSE = 'EXPENSE', 'Expense'
        TRANSFER = 'TRANSFER', 'Account Transfer'

    transaction_ref = models.CharField(max_length=50, unique=True, db_index=True)
    account = models.ForeignKey(FinancialAccount, on_delete=models.CASCADE, related_name='transactions')
    transaction_type = models.CharField(max_length=20, choices=Type.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_date = models.DateField()
    
    # Optional associations
    project = models.ForeignKey('projects.Project', on_delete=models.SET_NULL, null=True, blank=True, related_name='financial_transactions')
    invoice = models.ForeignKey(Invoice, on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    category = models.ForeignKey(ExpenseCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    
    description = models.TextField()
    receipt_attachment = models.FileField(upload_to='finance/receipts/', blank=True, null=True)
    recorded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='recorded_transactions')

    def __str__(self):
        return f"{self.transaction_ref} [{self.transaction_type}] ৳{self.amount} - {self.account.name}"

