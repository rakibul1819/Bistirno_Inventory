"""
Development settings for local team collaboration.
"""
from .base import *

DEBUG = True

ALLOWED_HOSTS = ['*']

# Optional: Enable django-debug-toolbar if available
try:
    import debug_toolbar
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE = ['debug_toolbar.middleware.DebugToolbarMiddleware'] + MIDDLEWARE
    INTERNAL_IPS = ['127.0.0.1', 'localhost']
except ImportError:
    pass

# Email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

