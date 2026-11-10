from rest_framework import serializers
from .models import FinancialAccount, ExpenseCategory, Invoice, Transaction

class FinancialAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialAccount
        fields = ['id', 'name', 'account_type', 'account_number', 'bank_name', 'balance', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class ExpenseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpenseCategory
        fields = ['id', 'name', 'description', 'created_at']


class InvoiceSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    due_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'customer', 'customer_name', 'project', 'project_title',
            'issue_date', 'due_date', 'subtotal', 'tax_amount', 'discount_amount',
            'total_amount', 'amount_paid', 'due_amount', 'status', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'due_amount', 'created_at']


class TransactionSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)
    recorded_by_name = serializers.CharField(source='recorded_by.get_full_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'transaction_ref', 'account', 'account_name', 'transaction_type',
            'amount', 'transaction_date', 'project', 'invoice', 'category', 'category_name',
            'description', 'receipt_attachment', 'recorded_by', 'recorded_by_name', 'created_at'
        ]
        read_only_fields = ['id', 'recorded_by', 'created_at']

