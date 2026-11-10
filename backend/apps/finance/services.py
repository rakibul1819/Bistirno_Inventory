from django.db import transaction
from .models import Transaction, FinancialAccount, Invoice

class FinanceService:
    @staticmethod
    @transaction.atomic
    def record_transaction(account: FinancialAccount, transaction_type: str, amount, description: str, **kwargs):
        """
        Records a transaction and atomically updates the associated account balance.
        """
        txn = Transaction.objects.create(
            account=account,
            transaction_type=transaction_type,
            amount=amount,
            description=description,
            **kwargs
        )

        if transaction_type == Transaction.Type.INCOME:
            account.balance += amount
        elif transaction_type == Transaction.Type.EXPENSE:
            account.balance -= amount
        account.save(update_fields=['balance'])

        # If linked to an invoice and it is income, update invoice amount_paid
        invoice = kwargs.get('invoice')
        if invoice and transaction_type == Transaction.Type.INCOME:
            invoice.amount_paid += amount
            if invoice.amount_paid >= invoice.total_amount:
                invoice.status = Invoice.Status.PAID
            elif invoice.amount_paid > 0:
                invoice.status = Invoice.Status.PARTIALLY_PAID
            invoice.save(update_fields=['amount_paid', 'status'])

        return txn

