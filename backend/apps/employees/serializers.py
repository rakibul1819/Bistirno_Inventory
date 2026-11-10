from rest_framework import serializers
from .models import Department, Designation, Employee, Attendance, Payroll

class DepartmentSerializer(serializers.ModelSerializer):
    employee_count = serializers.IntegerField(source='employees.count', read_only=True)

    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description', 'employee_count', 'created_at']


class DesignationSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Designation
        fields = ['id', 'title', 'department', 'department_name', 'description', 'created_at']


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_code = serializers.CharField(source='employee.employee_code', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'employee', 'employee_name', 'employee_code', 'date', 'check_in', 'check_out', 'status', 'notes', 'created_at']


class PayrollSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    employee_code = serializers.CharField(source='employee.employee_code', read_only=True)
    department_name = serializers.CharField(source='employee.department.name', read_only=True)

    class Meta:
        model = Payroll
        fields = [
            'id', 'payroll_code', 'employee', 'employee_name', 'employee_code', 'department_name',
            'month', 'year', 'basic_salary', 'bonus', 'allowance', 'deductions', 'tax',
            'net_salary', 'status', 'payment_method', 'paid_at', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'net_salary', 'created_at']


class EmployeeSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    department_details = DepartmentSerializer(source='department', read_only=True)
    designation_details = DesignationSerializer(source='designation', read_only=True)
    recent_payrolls = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            'id', 'user', 'employee_code', 'first_name', 'last_name', 'full_name',
            'email', 'phone', 'avatar', 'department', 'department_details',
            'designation', 'designation_details', 'joining_date', 'basic_salary',
            'hourly_rate', 'bank_account_name', 'bank_account_no', 'bank_name',
            'status', 'address', 'recent_payrolls', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_recent_payrolls(self, obj):
        recent = obj.payrolls.order_by('-year', '-month')[:3]
        return PayrollSerializer(recent, many=True).data

