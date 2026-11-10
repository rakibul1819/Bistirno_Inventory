from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedUUIDModel

class SavedReport(TimeStampedUUIDModel):
    class ReportType(models.TextChoices):
        FINANCIAL = 'FINANCIAL', 'Financial & Cashflow Report'
        PROJECT_PERFORMANCE = 'PROJECT_PERFORMANCE', 'Project Milestone Performance'
        PAYROLL_SUMMARY = 'PAYROLL_SUMMARY', 'Monthly Payroll & Salary Register'
        CLIENT_PORTFOLIO = 'CLIENT_PORTFOLIO', 'Customer Commission Summary'

    title = models.CharField(max_length=200)
    report_type = models.CharField(max_length=30, choices=ReportType.choices)
    generated_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='generated_reports')
    parameters = models.JSONField(default=dict, blank=True)
    report_file = models.FileField(upload_to='reports/generated/', blank=True, null=True)

    def __str__(self):
        return f"{self.title} ({self.get_report_type_display()})"

