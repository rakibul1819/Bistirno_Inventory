from django.contrib import admin
from django.utils.html import format_html
from .models import SavedReport


@admin.register(SavedReport)
class SavedReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'type_badge', 'generated_by', 'has_file', 'created_at')
    list_filter = ('report_type', 'created_at')
    search_fields = ('title', 'generated_by__email', 'generated_by__first_name')
    date_hierarchy = 'created_at'
    list_per_page = 20
    autocomplete_fields = ('generated_by',)

    fieldsets = (
        ('📊 Report Details', {
            'fields': (('title', 'report_type'), 'generated_by'),
        }),
        ('📁 Data & Export', {
            'fields': ('parameters', 'report_file'),
        }),
    )

    @admin.display(description='Type')
    def type_badge(self, obj):
        colors = {
            'FINANCIAL': '#059669', 'PROJECT_PERFORMANCE': '#3B82F6',
            'PAYROLL_SUMMARY': '#D97706', 'CLIENT_PORTFOLIO': '#7C3AED',
        }
        bg = colors.get(obj.report_type, '#6B7280')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;border-radius:10px;'
            'font-size:11px;font-weight:600;">{}</span>',
            bg, obj.get_report_type_display(),
        )

    @admin.display(description='File')
    def has_file(self, obj):
        if obj.report_file:
            return format_html(
                '<a href="{}" style="color:#3B82F6;font-weight:600;">📥 Download</a>',
                obj.report_file.url,
            )
        return format_html('<span style="color:#9CA3AF;">{}</span>', 'No file')
