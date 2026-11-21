"""
Base settings for Bistirno ArchStudio Pro.
These settings are shared across development and production environments.
"""
from datetime import timedelta
import os
from pathlib import Path
from dotenv import load_dotenv

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load environment variables from .env file if it exists
load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-archstudio-pro-secret-key-remote-dev')

DEBUG = False

ALLOWED_HOSTS = [host.strip() for host in os.getenv('ALLOWED_HOSTS', '127.0.0.1,localhost').split(',') if host.strip()]

# Application definition
DJANGO_APPS = [
    'jazzmin',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
]

LOCAL_APPS = [
    'apps.common',
    'apps.authentication',
    'apps.employees',
    'apps.customers',
    'apps.projects',
    'apps.finance',
    'apps.reports',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# Database: SQLite default, configurable via DATABASE_URL
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Custom User Model
AUTH_USER_MODEL = 'authentication.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Dhaka'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [BASE_DIR / 'static'] if (BASE_DIR / 'static').exists() else []

# Media files (Renderings, Attachments, Avatars, Pay Slips)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Django REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ),
    'DEFAULT_PAGINATION_CLASS': 'apps.common.pagination.StandardResultsSetPagination',
    'PAGE_SIZE': 15,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# JWT Settings
ACCESS_MINUTES = int(os.getenv('ACCESS_TOKEN_LIFETIME_MINUTES', 60))
REFRESH_DAYS = int(os.getenv('REFRESH_TOKEN_LIFETIME_DAYS', 7))

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=ACCESS_MINUTES),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=REFRESH_DAYS),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# DRF Spectacular (Swagger & ReDoc API Documentation)
SPECTACULAR_SETTINGS = {
    'TITLE': 'Bistirno ArchStudio Pro API',
    'DESCRIPTION': 'Enterprise Architecture, Payroll, Project, and Finance Management API',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# CORS Configuration
CORS_ALLOW_ALL_ORIGINS = os.getenv('CORS_ALLOW_ALL_ORIGINS', 'True').lower() == 'true'
CORS_ALLOWED_ORIGINS = [
    origin.strip() for origin in os.getenv('CORS_ALLOWED_ORIGINS', 'http://127.0.0.1:5500,http://localhost:5500').split(',') if origin.strip()
]

# Jazzmin Admin Theme Configuration
JAZZMIN_SETTINGS = {
    # ── Branding ──
    "site_title": "Bistirno Studio",
    "site_header": "Bistirno ArchStudio Pro",
    "site_brand": "Bistirno",
    "site_logo": None,
    "login_logo": None,
    "login_logo_dark": None,
    "site_logo_classes": "img-circle",
    "site_icon": None,
    "welcome_sign": "Welcome to Bistirno ArchStudio Management",
    "copyright": "© 2026 Bistirno ArchStudio Pro — Architecture & Inventory",

    # ── Global Search ──
    "search_model": [
        "authentication.User",
        "employees.Employee",
        "customers.Customer",
        "projects.Project",
        "finance.Invoice",
    ],
    "user_avatar": "profile_image",

    # ── Top Navigation Links ──
    "topmenu_links": [
        {"name": "Dashboard", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "API Swagger", "url": "/api/docs/", "new_window": True},
        {"name": "API ReDoc", "url": "/api/redoc/", "new_window": True},
        {"app": "projects"},
    ],

    # ── User Menu ──
    "usermenu_links": [
        {"name": "My Profile", "url": "/admin/authentication/user/", "icon": "fas fa-user"},
        {"name": "API Docs", "url": "/api/docs/", "new_window": True, "icon": "fas fa-book"},
    ],

    # ── Sidebar ──
    "show_sidebar": True,
    "navigation_expanded": False,
    "hide_apps": [],
    "hide_models": [],

    # ── App Ordering (top → bottom in sidebar) ──
    "order_with_respect_to": [
        "authentication",
        "employees",
        "customers",
        "projects",
        "finance",
        "reports",
        "auth",
    ],

    # ── Custom Sidebar Links ──
    "custom_links": {
        "projects": [{
            "name": "Portfolio Showcase",
            "url": "/admin/projects/projectrender/?is_showcase__exact=1",
            "icon": "fas fa-award",
            "permissions": ["projects.view_projectrender"],
        }],
        "finance": [{
            "name": "Overdue Invoices",
            "url": "/admin/finance/invoice/?status__exact=OVERDUE",
            "icon": "fas fa-exclamation-triangle",
            "permissions": ["finance.view_invoice"],
        }],
    },

    # ── Icons (FontAwesome 5) ──
    "icons": {
        "auth": "fas fa-shield-alt",
        "auth.group": "fas fa-users-cog",
        "authentication": "fas fa-user-shield",
        "authentication.user": "fas fa-user-circle",
        "employees": "fas fa-hard-hat",
        "employees.department": "fas fa-city",
        "employees.designation": "fas fa-id-card-alt",
        "employees.employee": "fas fa-user-tie",
        "employees.attendance": "fas fa-calendar-check",
        "employees.payroll": "fas fa-money-check-alt",
        "customers": "fas fa-handshake",
        "customers.customer": "fas fa-address-book",
        "customers.communicationlog": "fas fa-comments",
        "customers.customerreview": "fas fa-star-half-alt",
        "projects": "fas fa-drafting-compass",
        "projects.projectcategory": "fas fa-layer-group",
        "projects.project": "fas fa-project-diagram",
        "projects.projectmilestone": "fas fa-flag-checkered",
        "projects.projectrender": "fas fa-images",
        "finance": "fas fa-coins",
        "finance.financialaccount": "fas fa-university",
        "finance.expensecategory": "fas fa-tags",
        "finance.invoice": "fas fa-file-invoice-dollar",
        "finance.transaction": "fas fa-exchange-alt",
        "reports": "fas fa-chart-pie",
        "reports.savedreport": "fas fa-chart-line",
    },
    "default_icon_parents": "fas fa-folder-open",
    "default_icon_children": "fas fa-angle-right",

    # ── Forms & Modals ──
    "related_modal_active": True,
    "custom_css": None,
    "custom_js": None,
    "use_google_fonts_cdn": True,
    "show_ui_builder": False,

    # ── Change-form Layout ──
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "authentication.user": "collapsible",
        "employees.employee": "horizontal_tabs",
        "projects.project": "horizontal_tabs",
        "finance.invoice": "horizontal_tabs",
        "auth.group": "vertical_tabs",
    },
}

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-dark",
    "accent": "accent-primary",
    "navbar": "navbar-dark navbar-navy",
    "no_navbar_border": False,
    "navbar_fixed": True,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-primary",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": True,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "default",
    "default_theme_mode": "auto",
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-outline-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success",
    },
    "actions_sticky_top": True,
}


