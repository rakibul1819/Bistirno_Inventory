from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Polished User admin with avatar preview, role badge,
    and collapsible fieldset sections.
    """
    list_display = (
        'avatar_thumb', 'email', 'full_name_display',
        'role_badge', 'is_staff', 'is_active', 'created_at',
    )
    list_display_links = ('email', 'full_name_display')
    list_filter = ('role', 'is_staff', 'is_active', 'is_superuser', 'created_at')
    search_fields = ('email', 'first_name', 'last_name', 'phone_number')
    ordering = ('-created_at',)
    list_per_page = 25
    date_hierarchy = 'created_at'

    fieldsets = (
        ('🔐 Login Credentials', {
            'fields': ('email', 'password'),
        }),
        ('👤 Personal Information', {
            'fields': ('first_name', 'last_name', 'phone_number', 'profile_image', 'bio'),
        }),
        ('🛡️ Role & Access Control', {
            'fields': ('role', 'is_active', 'is_staff', 'is_superuser'),
        }),
        ('👥 Groups & Permissions', {
            'classes': ('collapse',),
            'fields': ('groups', 'user_permissions'),
        }),
        ('📅 Timestamps', {
            'classes': ('collapse',),
            'fields': ('last_login', 'date_joined'),
        }),
    )
    add_fieldsets = (
        ('Create New Studio User', {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'role', 'password1', 'password2', 'phone_number'),
        }),
    )
    readonly_fields = ('last_login', 'date_joined', 'created_at')

    @admin.display(description='Avatar')
    def avatar_thumb(self, obj):
        if obj.profile_image:
            return format_html(
                '<img src="{}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;" />',
                obj.profile_image.url,
            )
        initials = (obj.first_name[:1] + obj.last_name[:1]).upper() if obj.first_name else '?'
        return format_html(
            '<span style="display:inline-flex;align-items:center;justify-content:center;'
            'width:32px;height:32px;border-radius:50%;background:#3B82F6;color:#fff;'
            'font-size:12px;font-weight:700;">{}</span>',
            initials,
        )

    @admin.display(description='Full Name')
    def full_name_display(self, obj):
        return obj.get_full_name() or '—'

    @admin.display(description='Role')
    def role_badge(self, obj):
        colors = {
            'ADMIN': '#DC2626', 'MANAGER': '#7C3AED', 'ARCHITECT': '#2563EB',
            'DESIGNER': '#D97706', 'ACCOUNTANT': '#059669', 'SITE_ENGINEER': '#0891B2',
            'STAFF': '#6B7280',
        }
        bg = colors.get(obj.role, '#6B7280')
        return format_html(
            '<span style="background:{};color:#fff;padding:3px 10px;border-radius:12px;'
            'font-size:11px;font-weight:600;white-space:nowrap;">{}</span>',
            bg, obj.get_role_display(),
        )
