from django.contrib import admin
from .models import ProjectCategory, Project, ProjectMilestone, ProjectRender

class ProjectMilestoneInline(admin.TabularInline):
    model = ProjectMilestone
    extra = 1

class ProjectRenderInline(admin.TabularInline):
    model = ProjectRender
    extra = 1

@admin.register(ProjectCategory)
class ProjectCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('project_code', 'title', 'category', 'customer', 'status', 'progress_percentage', 'budget')
    list_filter = ('status', 'category', 'created_at')
    search_fields = ('project_code', 'title', 'customer__full_name')
    inlines = [ProjectMilestoneInline, ProjectRenderInline]

@admin.register(ProjectMilestone)
class ProjectMilestoneAdmin(admin.ModelAdmin):
    list_display = ('project', 'title', 'weight_percentage', 'due_date', 'is_completed')
    list_filter = ('is_completed', 'due_date')

@admin.register(ProjectRender)
class ProjectRenderAdmin(admin.ModelAdmin):
    list_display = ('project', 'title', 'render_type', 'is_showcase')
    list_filter = ('render_type', 'is_showcase')

