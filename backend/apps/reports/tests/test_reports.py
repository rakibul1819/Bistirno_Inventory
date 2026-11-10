from django.test import TestCase
from apps.reports.services import DashboardAnalyticsService

class ReportsTestCase(TestCase):
    def test_kpi_summary_empty(self):
        kpis = DashboardAnalyticsService.get_kpi_summary()
        self.assertEqual(kpis['total_employees'], 0)
        self.assertEqual(kpis['total_customers'], 0)
        self.assertEqual(kpis['active_projects'], 0)

