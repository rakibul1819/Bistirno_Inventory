from decimal import Decimal
from django.test import TestCase
from apps.customers.models import Customer
from apps.projects.models import Project, ProjectMilestone
from apps.projects.services import ProjectProgressService

class ProjectTestCase(TestCase):
    def setUp(self):
        self.customer = Customer.objects.create(
            client_code='CUS-001',
            full_name='Nazmul Hassan',
            email='nazmul@example.com',
            phone='+8801711111111'
        )
        self.project = Project.objects.create(
            project_code='PRJ-2026-001',
            title='Gulshan Luxury Residence',
            customer=self.customer,
            budget=Decimal('2500000.00'),
            progress_percentage=0
        )

    def test_milestone_progress_calculation(self):
        m1 = ProjectMilestone.objects.create(
            project=self.project,
            title='Structural Blueprint',
            weight_percentage=40,
            is_completed=True
        )
        m2 = ProjectMilestone.objects.create(
            project=self.project,
            title='Interior 3D Renders',
            weight_percentage=60,
            is_completed=False
        )
        progress = ProjectProgressService.recalculate_project_progress(self.project)
        self.assertEqual(progress, 40)
        self.project.refresh_from_db()
        self.assertEqual(self.project.progress_percentage, 40)

