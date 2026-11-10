from rest_framework import viewsets, permissions, views
from rest_framework.response import Response
from apps.common.utils import api_response
from apps.common.permissions import IsAdminOrManager
from .models import SavedReport
from .serializers import SavedReportSerializer, DashboardKPISerializer
from .services import DashboardAnalyticsService

class DashboardKPIView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        kpi_data = DashboardAnalyticsService.get_kpi_summary()
        serializer = DashboardKPISerializer(kpi_data)
        return api_response(
            success=True,
            message="Dashboard KPIs fetched successfully.",
            data=serializer.data
        )


class ProjectDistributionView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        distribution = DashboardAnalyticsService.get_project_status_distribution()
        return api_response(
            success=True,
            message="Project distribution fetched successfully.",
            data=distribution
        )


class RevenueVsExpenseChartView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        months = int(request.query_params.get('months', 6))
        chart_data = DashboardAnalyticsService.get_revenue_vs_expense_chart(months=months)
        return api_response(
            success=True,
            message="Revenue vs expense analytics fetched.",
            data=chart_data
        )


class SavedReportViewSet(viewsets.ModelViewSet):
    queryset = SavedReport.objects.select_related('generated_by').all()
    serializer_class = SavedReportSerializer
    permission_classes = [IsAdminOrManager]
    filterset_fields = ['report_type']

    def perform_create(self, serializer):
        serializer.save(generated_by=self.request.user)

