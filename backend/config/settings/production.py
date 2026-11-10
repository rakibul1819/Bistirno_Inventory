"""
Production settings.
"""
import dj_database_url
from .base import *

DEBUG = False

# Security & SSL
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = 'DENY'
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Database from environment
db_from_env = dj_database_url.config(conn_max_age=600)
DATABASES['default'].update(db_from_env)

