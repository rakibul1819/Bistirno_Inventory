from django.contrib import admin
from .models import Customer, CommunicationLog, CustomerReview

class CommunicationLogInline(admin.TabularInline):
    model = CommunicationLog
    extra = 1

class CustomerReviewInline(admin.TabularInline):
    model = CustomerReview
    extra = 0

@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ('client_code', 'full_name', 'company_name', 'client_type', 'phone', 'email', 'status')
    list_filter = ('client_type', 'status', 'created_at')
    search_fields = ('client_code', 'full_name', 'company_name', 'email', 'phone')
    inlines = [CommunicationLogInline, CustomerReviewInline]

@admin.register(CommunicationLog)
class CommunicationLogAdmin(admin.ModelAdmin):
    list_display = ('customer', 'comm_type', 'subject', 'logged_by', 'created_at')
    list_filter = ('comm_type', 'created_at')
    search_fields = ('customer__full_name', 'subject', 'summary')

@admin.register(CustomerReview)
class CustomerReviewAdmin(admin.ModelAdmin):
    list_display = ('customer', 'rating', 'title', 'is_featured', 'is_verified', 'created_at')
    list_filter = ('rating', 'is_featured', 'is_verified')
    search_fields = ('customer__full_name', 'title', 'project_name')

