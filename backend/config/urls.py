"""
Root URL Configuration for Bistirno ArchStudio Pro.
All modules are isolated under clean, versioned API namespaces (/api/v1/...).
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('admin/', admin.site.urls),

    # API Documentation (Swagger / ReDoc)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Modular API Endpoints (isolated for remote team development)
    path('api/v1/auth/', include('apps.authentication.urls', namespace='authentication')),
    path('api/v1/employees/', include('apps.employees.urls', namespace='employees')),
    path('api/v1/customers/', include('apps.customers.urls', namespace='customers')),
    path('api/v1/projects/', include('apps.projects.urls', namespace='projects')),
    path('api/v1/finance/', include('apps.finance.urls', namespace='finance')),
    path('api/v1/reports/', include('apps.reports.urls', namespace='reports')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

