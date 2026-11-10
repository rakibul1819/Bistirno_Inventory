from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, DesignationViewSet, EmployeeViewSet, AttendanceViewSet, PayrollViewSet

app_name = 'employees'

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'designations', DesignationViewSet, basename='designation')
router.register(r'records', EmployeeViewSet, basename='employee')
router.register(r'attendance', AttendanceViewSet, basename='attendance')
router.register(r'payroll', PayrollViewSet, basename='payroll')

urlpatterns = [
    path('', include(router.urls)),
]

