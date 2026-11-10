from django.contrib import admin
from .models import FinancialAccount, ExpenseCategory, Invoice, Transaction

@admin.register(FinancialAccount)
class FinancialAccountAdmin(admin.ModelAdmin):
    list_display = ('name', 'account_type', 'bank_name', 'balance', 'is_active')
    list_filter = ('account_type', 'is_active')

@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'customer', 'project', 'total_amount', 'amount_paid', 'status', 'due_date')
    list_filter = ('status', 'issue_date', 'due_date')
    search_fields = ('invoice_number', 'customer__full_name')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('transaction_ref', 'account', 'transaction_type', 'amount', 'transaction_date', 'recorded_by')
    list_filter = ('transaction_type', 'transaction_date', 'account')
    search_fields = ('transaction_ref', 'description')

