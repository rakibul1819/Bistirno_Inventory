from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FinancialAccountViewSet, ExpenseCategoryViewSet, InvoiceViewSet, TransactionViewSet

app_name = 'finance'

router = DefaultRouter()
router.register(r'accounts', FinancialAccountViewSet, basename='account')
router.register(r'categories', ExpenseCategoryViewSet, basename='category')
router.register(r'invoices', InvoiceViewSet, basename='invoice')
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(router.urls)),
]

