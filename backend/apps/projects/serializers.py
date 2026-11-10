from rest_framework import serializers
from .models import ProjectCategory, Project, ProjectMilestone, ProjectRender

class ProjectCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectCategory
        fields = ['id', 'name', 'slug', 'description', 'created_at']


class ProjectMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectMilestone
        fields = [
            'id', 'project', 'title', 'weight_percentage', 'due_date',
            'is_completed', 'completed_at', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ProjectRenderSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(source='project.title', read_only=True)

    class Meta:
        model = ProjectRender
        fields = [
            'id', 'project', 'project_title', 'image', 'title',
            'render_type', 'caption', 'is_showcase', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ProjectSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.full_name', read_only=True)
    customer_code = serializers.CharField(source='customer.client_code', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    lead_architect_name = serializers.CharField(source='lead_architect.full_name', read_only=True)
    milestones = ProjectMilestoneSerializer(many=True, read_only=True)
    renders = ProjectRenderSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'project_code', 'title', 'category', 'category_name',
            'customer', 'customer_name', 'customer_code',
            'lead_architect', 'lead_architect_name', 'location',
            'total_area_sqft', 'budget', 'progress_percentage',
            'start_date', 'estimated_end_date', 'actual_end_date',
            'status', 'description', 'cover_image', 'milestones', 'renders',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

