from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.common.utils import api_response
from apps.common.permissions import IsAccountantOrAdmin
from .models import FinancialAccount, ExpenseCategory, Invoice, Transaction
from .serializers import (
    FinancialAccountSerializer, ExpenseCategorySerializer,
    InvoiceSerializer, TransactionSerializer
)
from .services import FinanceService

class FinancialAccountViewSet(viewsets.ModelViewSet):
    queryset = FinancialAccount.objects.all()
    serializer_class = FinancialAccountSerializer
    permission_classes = [IsAccountantOrAdmin]
    filterset_fields = ['account_type', 'is_active']
    search_fields = ['name', 'bank_name', 'account_number']


class ExpenseCategoryViewSet(viewsets.ModelViewSet):
    queryset = ExpenseCategory.objects.all()
    serializer_class = ExpenseCategorySerializer
    permission_classes = [IsAccountantOrAdmin]
    search_fields = ['name']


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related('customer', 'project').all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsAccountantOrAdmin]
    filterset_fields = ['status', 'customer', 'project']
    search_fields = ['invoice_number', 'customer__full_name']


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.select_related('account', 'recorded_by', 'category', 'project', 'invoice').all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAccountantOrAdmin]
    filterset_fields = ['transaction_type', 'account', 'category', 'project']
    search_fields = ['transaction_ref', 'description']

    def perform_create(self, serializer):
        validated_data = serializer.validated_data
        account = validated_data.pop('account')
        txn_type = validated_data.pop('transaction_type')
        amount = validated_data.pop('amount')
        desc = validated_data.pop('description')
        FinanceService.record_transaction(
            account=account,
            transaction_type=txn_type,
            amount=amount,
            description=desc,
            recorded_by=self.request.user,
            **validated_data
        )

