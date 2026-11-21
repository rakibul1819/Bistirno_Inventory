from django.contrib import admin
from django.utils.html import format_html
from .models import ProjectCategory, Project, ProjectMilestone, ProjectRender


# ─────────────────────────────────────────
# Inlines
# ─────────────────────────────────────────
class ProjectMilestoneInline(admin.StackedInline):
    model = ProjectMilestone
    extra = 0
    fields = (('title', 'weight_percentage'), ('due_date', 'is_completed', 'completed_at'), 'notes')
    readonly_fields = ('completed_at',)
    ordering = ('due_date',)
    max_num = 15
    show_change_link = True


class ProjectRenderInline(admin.TabularInline):
    model = ProjectRender
    extra = 0
    fields = ('image', 'title', 'render_type', 'is_showcase')
    max_num = 10
    show_change_link = True


# ─────────────────────────────────────────
# Project Category
# ─────────────────────────────────────────
@admin.register(ProjectCategory)
class ProjectCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'project_count', 'created_at')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name',)
    list_per_page = 20

    fieldsets = (
        (None, {'fields': ('name', 'slug', 'description')}),
    )

    @admin.display(description='Projects')
    def project_count(self, obj):
        count = obj.projects.count()
        return format_html(
            '<span style="background:#7C3AED;color:#fff;padding:2px 10px;border-radius:10px;'
            'font-size:12px;font-weight:600;">{}</span>', count,
        )


# ─────────────────────────────────────────
# Project
# ─────────────────────────────────────────
@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        'project_code', 'title', 'category', 'customer',
        'status_badge', 'progress_bar', 'budget_display',
        'lead_architect', 'start_date',
    )
    list_display_links = ('project_code', 'title')
    list_filter = ('status', 'category', 'created_at', 'lead_architect')
    search_fields = ('project_code', 'title', 'customer__full_name', 'location')
    list_per_page = 15
    date_hierarchy = 'start_date'
    autocomplete_fields = ('category', 'customer', 'lead_architect')
    inlines = [ProjectMilestoneInline, ProjectRenderInline]
    actions = ['mark_as_completed', 'mark_as_construction', 'mark_as_on_hold']

    fieldsets = (
        ('🏗️ Project Identity', {
            'fields': (('project_code', 'title'), ('category', 'status'), 'cover_image'),
        }),
        ('👥 Stakeholders', {
            'fields': (('customer', 'lead_architect'),),
        }),
        ('📐 Specifications', {
            'fields': (('location', 'total_area_sqft'), ('budget', 'progress_percentage')),
        }),
        ('📅 Schedule', {
            'fields': (('start_date', 'estimated_end_date'), 'actual_end_date'),
        }),
        ('📝 Description', {
            'classes': ('collapse',),
            'fields': ('description',),
        }),
    )

    @admin.display(description='Status')
    def status_badge(self, obj):
        colors = {
            'PLANNING': '#6366F1', 'DESIGN': '#3B82F6', 'APPROVAL': '#D97706',
            'CONSTRUCTION': '#F59E0B', 'COMPLETED': '#059669', 'ON_HOLD': '#DC2626',
        }
        bg = colors.get(obj.status, '#6B7280')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;border-radius:10px;'
            'font-size:11px;font-weight:600;white-space:nowrap;">{}</span>',
            bg, obj.get_status_display(),
        )

    @admin.display(description='Progress')
    def progress_bar(self, obj):
        pct = obj.progress_percentage
        if pct >= 80:
            color = '#059669'
        elif pct >= 50:
            color = '#3B82F6'
        elif pct >= 25:
            color = '#D97706'
        else:
            color = '#DC2626'
        return format_html(
            '<div style="width:100px;background:#E5E7EB;border-radius:6px;overflow:hidden;height:16px;">'
            '<div style="width:{}%;background:{};height:100%;border-radius:6px;'
            'transition:width 0.3s;"></div></div>'
            '<span style="font-size:11px;font-weight:600;color:{};">{}%</span>',
            pct, color, color, pct,
        )

    @admin.display(description='Budget', ordering='budget')
    def budget_display(self, obj):
        return format_html('<strong>৳ {}</strong>', f'{obj.budget:,.0f}')

    @admin.action(description="✅ Mark as Completed (100%%)")
    def mark_as_completed(self, request, queryset):
        updated = queryset.update(status=Project.Status.COMPLETED, progress_percentage=100)
        self.message_user(request, f"{updated} project(s) marked completed.")

    @admin.action(description="🏗️ Mark as Under Construction")
    def mark_as_construction(self, request, queryset):
        updated = queryset.update(status=Project.Status.CONSTRUCTION)
        self.message_user(request, f"{updated} project(s) set to construction.")

    @admin.action(description="⏸️ Mark as On Hold")
    def mark_as_on_hold(self, request, queryset):
        updated = queryset.update(status=Project.Status.ON_HOLD)
        self.message_user(request, f"{updated} project(s) placed on hold.")


# ─────────────────────────────────────────
# Project Milestone
# ─────────────────────────────────────────
@admin.register(ProjectMilestone)
class ProjectMilestoneAdmin(admin.ModelAdmin):
    list_display = ('project', 'title', 'weight_display', 'due_date', 'completion_badge')
    list_filter = ('is_completed', 'due_date', 'project__category')
    search_fields = ('title', 'project__title', 'project__project_code')
    list_per_page = 25
    autocomplete_fields = ('project',)

    fieldsets = (
        (None, {
            'fields': (('project', 'title'), ('weight_percentage', 'due_date'),
                       ('is_completed', 'completed_at'), 'notes'),
        }),
    )
    readonly_fields = ('completed_at',)

    @admin.display(description='Weight')
    def weight_display(self, obj):
        return format_html('{}%', obj.weight_percentage)

    @admin.display(description='Done')
    def completion_badge(self, obj):
        if obj.is_completed:
            return format_html(
                '<span style="background:#059669;color:#fff;padding:2px 10px;border-radius:10px;'
                'font-size:11px;font-weight:600;">{}</span>', '✓ Done')
        return format_html(
            '<span style="background:#D97706;color:#fff;padding:2px 10px;border-radius:10px;'
            'font-size:11px;font-weight:600;">{}</span>', '⏳ Pending')


# ─────────────────────────────────────────
# Project Render
# ─────────────────────────────────────────
@admin.register(ProjectRender)
class ProjectRenderAdmin(admin.ModelAdmin):
    list_display = ('render_thumb', 'project', 'title', 'render_type', 'is_showcase')
    list_filter = ('render_type', 'is_showcase', 'project__category')
    search_fields = ('title', 'project__title')
    list_per_page = 20
    list_editable = ('is_showcase',)
    autocomplete_fields = ('project',)

    fieldsets = (
        (None, {
            'fields': ('project', 'image', 'title', 'render_type', 'caption', 'is_showcase'),
        }),
    )

    @admin.display(description='Preview')
    def render_thumb(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width:60px;height:40px;object-fit:cover;border-radius:4px;" />',
                obj.image.url,
            )
        return '—'

    @admin.display(description='Label')
    def showcase_label(self, obj):
        if obj.is_showcase:
            return format_html(
                '<span style="background:#7C3AED;color:#fff;padding:2px 8px;border-radius:10px;'
                'font-size:11px;font-weight:600;">⭐ Portfolio</span>')
        return '—'
