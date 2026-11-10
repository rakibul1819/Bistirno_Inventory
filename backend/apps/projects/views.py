from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.common.utils import api_response
from apps.common.permissions import IsAdminOrManager
from .models import ProjectCategory, Project, ProjectMilestone, ProjectRender
from .serializers import (
    ProjectCategorySerializer, ProjectSerializer,
    ProjectMilestoneSerializer, ProjectRenderSerializer
)
from .services import ProjectProgressService

class ProjectCategoryViewSet(viewsets.ModelViewSet):
    queryset = ProjectCategory.objects.all()
    serializer_class = ProjectCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.select_related('customer', 'lead_architect', 'category').prefetch_related('milestones', 'renders').all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrManager]
    filterset_fields = ['status', 'category', 'customer', 'lead_architect']
    search_fields = ['title', 'project_code', 'location', 'customer__full_name']

    @action(detail=True, methods=['post'], url_path='recalculate-progress')
    def recalculate_progress(self, request, pk=None):
        project = self.get_object()
        new_progress = ProjectProgressService.recalculate_project_progress(project)
        return api_response(
            success=True,
            message=f"Project progress updated to {new_progress}%.",
            data={'progress_percentage': new_progress}
        )

    @action(detail=True, methods=['get'])
    def milestones(self, request, pk=None):
        project = self.get_object()
        serializer = ProjectMilestoneSerializer(project.milestones.all(), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def renders(self, request, pk=None):
        project = self.get_object()
        serializer = ProjectRenderSerializer(project.renders.all(), many=True)
        return Response(serializer.data)


class ProjectMilestoneViewSet(viewsets.ModelViewSet):
    queryset = ProjectMilestone.objects.select_related('project').all()
    serializer_class = ProjectMilestoneSerializer
    permission_classes = [IsAdminOrManager]
    filterset_fields = ['project', 'is_completed']

    def perform_create(self, serializer):
        milestone = serializer.save()
        ProjectProgressService.recalculate_project_progress(milestone.project)

    def perform_update(self, serializer):
        milestone = serializer.save()
        ProjectProgressService.recalculate_project_progress(milestone.project)


class ProjectRenderViewSet(viewsets.ModelViewSet):
    queryset = ProjectRender.objects.select_related('project').all()
    serializer_class = ProjectRenderSerializer
    permission_classes = [IsAdminOrManager]
    filterset_fields = ['project', 'render_type', 'is_showcase']


class PortfolioShowcaseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Public or client-accessible endpoint powering portfolio.html
    """
    queryset = ProjectRender.objects.filter(is_showcase=True).select_related('project')
    serializer_class = ProjectRenderSerializer
    permission_classes = [permissions.AllowAny]

