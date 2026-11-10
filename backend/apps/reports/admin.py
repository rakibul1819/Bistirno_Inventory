from django.contrib import admin
from .models import SavedReport

@admin.register(SavedReport)
class SavedReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'report_type', 'generated_by', 'created_at')
    list_filter = ('report_type', 'created_at')
    search_fields = ('title',)

