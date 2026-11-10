from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DashboardKPIView, ProjectDistributionView,
    RevenueVsExpenseChartView, SavedReportViewSet
)

app_name = 'reports'

router = DefaultRouter()
router.register(r'saved', SavedReportViewSet, basename='saved-report')

urlpatterns = [
    path('dashboard/kpis/', DashboardKPIView.as_view(), name='dashboard-kpis'),
    path('dashboard/project-distribution/', ProjectDistributionView.as_view(), name='project-distribution'),
    path('dashboard/revenue-expense-chart/', RevenueVsExpenseChartView.as_view(), name='revenue-expense-chart'),
    path('', include(router.urls)),
]

