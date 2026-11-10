from django.contrib import admin
from .models import Department, Designation, Employee, Attendance, Payroll

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'created_at')
    search_fields = ('name', 'code')

@admin.register(Designation)
class DesignationAdmin(admin.ModelAdmin):
    list_display = ('title', 'department', 'created_at')
    list_filter = ('department',)
    search_fields = ('title',)

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('employee_code', 'first_name', 'last_name', 'department', 'designation', 'status', 'joining_date')
    list_filter = ('department', 'status', 'joining_date')
    search_fields = ('employee_code', 'first_name', 'last_name', 'email', 'phone')

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'date', 'check_in', 'check_out', 'status')
    list_filter = ('status', 'date')
    search_fields = ('employee__first_name', 'employee__last_name', 'employee__employee_code')

@admin.register(Payroll)
class PayrollAdmin(admin.ModelAdmin):
    list_display = ('payroll_code', 'employee', 'month', 'year', 'basic_salary', 'net_salary', 'status', 'paid_at')
    list_filter = ('status', 'month', 'year', 'payment_method')
    search_fields = ('payroll_code', 'employee__first_name', 'employee__last_name', 'employee__employee_code')

