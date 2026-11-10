from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectCategoryViewSet, ProjectViewSet,
    ProjectMilestoneViewSet, ProjectRenderViewSet, PortfolioShowcaseViewSet
)

app_name = 'projects'

router = DefaultRouter()
router.register(r'categories', ProjectCategoryViewSet, basename='category')
router.register(r'items', ProjectViewSet, basename='project')
router.register(r'milestones', ProjectMilestoneViewSet, basename='milestone')
router.register(r'renders', ProjectRenderViewSet, basename='render')
router.register(r'portfolio', PortfolioShowcaseViewSet, basename='portfolio')

urlpatterns = [
    path('', include(router.urls)),
]

