from rest_framework import serializers
from .models import SavedReport

class SavedReportSerializer(serializers.ModelSerializer):
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)

    class Meta:
        model = SavedReport
        fields = ['id', 'title', 'report_type', 'generated_by', 'generated_by_name', 'parameters', 'report_file', 'created_at']
        read_only_fields = ['id', 'created_at']


class DashboardKPISerializer(serializers.Serializer):
    total_employees = serializers.IntegerField()
    total_customers = serializers.IntegerField()
    active_projects = serializers.IntegerField()
    completed_projects = serializers.IntegerField()
    monthly_revenue = serializers.DecimalField(max_digits=14, decimal_places=2)
    monthly_expenses = serializers.DecimalField(max_digits=14, decimal_places=2)
    net_profit = serializers.DecimalField(max_digits=14, decimal_places=2)
    profit_margin_percentage = serializers.FloatField()

