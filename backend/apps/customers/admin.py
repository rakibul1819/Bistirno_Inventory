from django.contrib import admin
from django.utils.html import format_html
from .models import Customer, CommunicationLog, CustomerReview


# ─────────────────────────────────────────
# Inlines
# ─────────────────────────────────────────
class CommunicationLogInline(admin.StackedInline):
    model = CommunicationLog
    extra = 0
    fields = (('comm_type', 'subject', 'logged_by'), 'summary', 'follow_up_date')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
    max_num = 10
    show_change_link = True


class CustomerReviewInline(admin.StackedInline):
    model = CustomerReview
    extra = 0
    fields = (('rating', 'title', 'project_name'), 'comment', ('is_featured', 'is_verified'))
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
    max_num = 5
    show_change_link = True


# ─────────────────────────────────────────
# Customer
# ─────────────────────────────────────────
@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = (
        'client_code', 'avatar_thumb', 'full_name', 'company_name',
        'type_badge', 'phone', 'email', 'status_badge', 'project_count',
    )
    list_display_links = ('client_code', 'full_name')
    list_filter = ('client_type', 'status', 'created_at')
    search_fields = ('client_code', 'full_name', 'company_name', 'email', 'phone')
    list_per_page = 20
    date_hierarchy = 'created_at'
    inlines = [CommunicationLogInline, CustomerReviewInline]

    fieldsets = (
        ('🏷️ Client Identity', {
            'fields': (('client_code', 'client_type'), ('full_name', 'company_name'), 'avatar'),
        }),
        ('📞 Contact Details', {
            'fields': (('email', 'phone'), 'secondary_phone', 'billing_address'),
        }),
        ('📊 Account Status', {
            'fields': ('status', 'notes'),
        }),
    )

    @admin.display(description='Photo')
    def avatar_thumb(self, obj):
        if obj.avatar:
            return format_html(
                '<img src="{}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;" />',
                obj.avatar.url,
            )
        initials = obj.full_name[:2].upper() if obj.full_name else '?'
        return format_html(
            '<span style="display:inline-flex;align-items:center;justify-content:center;'
            'width:30px;height:30px;border-radius:50%;background:#7C3AED;color:#fff;'
            'font-size:11px;font-weight:700;">{}</span>', initials,
        )

    @admin.display(description='Type')
    def type_badge(self, obj):
        colors = {
            'INDIVIDUAL': '#3B82F6', 'CORPORATE': '#7C3AED',
            'GOVERNMENT': '#059669', 'DEVELOPER': '#D97706',
        }
        bg = colors.get(obj.client_type, '#6B7280')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;border-radius:10px;'
            'font-size:11px;font-weight:600;">{}</span>', bg, obj.get_client_type_display(),
        )

    @admin.display(description='Status')
    def status_badge(self, obj):
        colors = {
            'LEAD': '#D97706', 'ACTIVE': '#059669',
            'INACTIVE': '#6B7280', 'ARCHIVED': '#9CA3AF',
        }
        bg = colors.get(obj.status, '#6B7280')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;border-radius:10px;'
            'font-size:11px;font-weight:600;">{}</span>', bg, obj.get_status_display(),
        )

    @admin.display(description='Projects')
    def project_count(self, obj):
        count = obj.projects.count()
        if count == 0:
            return '—'
        return format_html(
            '<span style="background:#2563EB;color:#fff;padding:2px 10px;border-radius:10px;'
            'font-size:12px;font-weight:600;">{}</span>', count,
        )


# ─────────────────────────────────────────
# Communication Log
# ─────────────────────────────────────────
@admin.register(CommunicationLog)
class CommunicationLogAdmin(admin.ModelAdmin):
    list_display = ('customer', 'type_icon', 'subject', 'logged_by', 'follow_up_date', 'created_at')
    list_filter = ('comm_type', 'created_at', 'follow_up_date')
    search_fields = ('customer__full_name', 'subject', 'summary')
    date_hierarchy = 'created_at'
    list_per_page = 25
    autocomplete_fields = ('customer',)

    fieldsets = (
        (None, {
            'fields': (('customer', 'comm_type'), ('subject', 'logged_by'), 'summary', 'follow_up_date'),
        }),
    )

    @admin.display(description='Type')
    def type_icon(self, obj):
        icons = {
            'CALL': '📞', 'MEETING': '🤝', 'SITE_VISIT': '🏗️',
            'EMAIL': '📧', 'WHATSAPP': '💬',
        }
        icon = icons.get(obj.comm_type, '📋')
        return format_html('{} {}', icon, obj.get_comm_type_display())


# ─────────────────────────────────────────
# Customer Review
# ─────────────────────────────────────────
@admin.register(CustomerReview)
class CustomerReviewAdmin(admin.ModelAdmin):
    list_display = ('customer', 'star_display', 'title', 'project_name', 'is_featured', 'verified_badge', 'created_at')
    list_filter = ('rating', 'is_featured', 'is_verified')
    search_fields = ('customer__full_name', 'title', 'project_name')
    list_per_page = 20
    list_editable = ('is_featured',)
    autocomplete_fields = ('customer',)

    fieldsets = (
        (None, {
            'fields': (('customer', 'project_name'), ('rating', 'title'), 'comment', ('is_featured', 'is_verified')),
        }),
    )

    @admin.display(description='Rating')
    def star_display(self, obj):
        stars = '⭐' * obj.rating + '☆' * (5 - obj.rating)
        return format_html('<span style="font-size:14px;">{}</span>', stars)

    @admin.display(description='Featured', boolean=True)
    def featured_badge(self, obj):
        return obj.is_featured

    @admin.display(description='Verified', boolean=True)
    def verified_badge(self, obj):
        return obj.is_verified
