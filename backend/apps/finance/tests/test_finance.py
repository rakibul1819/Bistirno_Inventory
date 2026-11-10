from decimal import Decimal
from django.test import TestCase
from django.utils import timezone
from apps.finance.models import FinancialAccount, Transaction
from apps.finance.services import FinanceService

class FinanceTestCase(TestCase):
    def setUp(self):
        self.account = FinancialAccount.objects.create(
            name='BRAC Bank Main Account',
            account_type=FinancialAccount.AccountType.BANK,
            balance=Decimal('500000.00')
        )

    def test_record_income_transaction(self):
        txn = FinanceService.record_transaction(
            account=self.account,
            transaction_ref='TXN-001',
            transaction_type=Transaction.Type.INCOME,
            amount=Decimal('150000.00'),
            transaction_date=timezone.now().date(),
            description='Client Architectural Advance'
        )
        self.account.refresh_from_db()
        self.assertEqual(self.account.balance, Decimal('650000.00'))

    def test_record_expense_transaction(self):
        txn = FinanceService.record_transaction(
            account=self.account,
            transaction_ref='TXN-002',
            transaction_type=Transaction.Type.EXPENSE,
            amount=Decimal('50000.00'),
            transaction_date=timezone.now().date(),
            description='Office Utilities'
        )
        self.account.refresh_from_db()
        self.assertEqual(self.account.balance, Decimal('450000.00'))

