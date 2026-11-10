from decimal import Decimal
from django.db import models
from apps.common.models import TimeStampedUUIDModel

class ProjectCategory(TimeStampedUUIDModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')

    def __str__(self):
        return self.name


class Project(TimeStampedUUIDModel):
    class Status(models.TextChoices):
        PLANNING = 'PLANNING', 'Planning & Concept'
        DESIGN = 'DESIGN', 'Design & 3D Modeling'
        APPROVAL = 'APPROVAL', 'Client & Municipal Approval'
        CONSTRUCTION = 'CONSTRUCTION', 'Under Construction'
        COMPLETED = 'COMPLETED', 'Completed'
        ON_HOLD = 'ON_HOLD', 'On Hold'

    project_code = models.CharField(max_length=50, unique=True, db_index=True)
    title = models.CharField(max_length=200)
    category = models.ForeignKey(ProjectCategory, on_delete=models.SET_NULL, null=True, related_name='projects')
    customer = models.ForeignKey('customers.Customer', on_delete=models.CASCADE, related_name='projects')
    lead_architect = models.ForeignKey('employees.Employee', on_delete=models.SET_NULL, null=True, blank=True, related_name='led_projects')
    
    location = models.CharField(max_length=255, blank=True, default='')
    total_area_sqft = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), blank=True)
    budget = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal('0.00'))
    progress_percentage = models.PositiveSmallIntegerField(default=0)  # 0 to 100
    
    start_date = models.DateField(null=True, blank=True)
    estimated_end_date = models.DateField(null=True, blank=True)
    actual_end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PLANNING)
    description = models.TextField(blank=True, default='')
    cover_image = models.ImageField(upload_to='projects/covers/', blank=True, null=True)

    def __str__(self):
        return f"{self.project_code} - {self.title}"


class ProjectMilestone(TimeStampedUUIDModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='milestones')
    title = models.CharField(max_length=200)
    weight_percentage = models.PositiveSmallIntegerField(default=10)
    due_date = models.DateField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')

    class Meta(TimeStampedUUIDModel.Meta):
        ordering = ['due_date', 'created_at']

    def __str__(self):
        return f"{self.project.title} - {self.title} ({'Done' if self.is_completed else 'Pending'})"


class ProjectRender(TimeStampedUUIDModel):
    class RenderType(models.TextChoices):
        EXTERIOR = 'EXTERIOR', 'Exterior View'
        INTERIOR = 'INTERIOR', 'Interior View'
        FLOOR_PLAN = 'FLOOR_PLAN', 'Architectural Floor Plan'
        ELEVATION = 'ELEVATION', 'Elevation & Section'
        VR_360 = 'VR_360', '3D / 360 Render'

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='renders')
    image = models.ImageField(upload_to='projects/renders/')
    title = models.CharField(max_length=150)
    render_type = models.CharField(max_length=20, choices=RenderType.choices, default=RenderType.EXTERIOR)
    caption = models.CharField(max_length=255, blank=True, default='')
    is_showcase = models.BooleanField(default=False)  # For portfolio.html showcase

    def __str__(self):
        return f"{self.project.title} - {self.title}"

