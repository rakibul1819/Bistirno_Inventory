from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.common.utils import api_response
from apps.common.permissions import IsAdminOrManager, IsAccountantOrAdmin
from .models import Department, Designation, Employee, Attendance, Payroll
from .serializers import (
    DepartmentSerializer, DesignationSerializer,
    EmployeeSerializer, AttendanceSerializer, PayrollSerializer
)
from .services import PayrollService

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminOrManager]
    search_fields = ['name', 'code']


class DesignationViewSet(viewsets.ModelViewSet):
    queryset = Designation.objects.select_related('department').all()
    serializer_class = DesignationSerializer
    permission_classes = [IsAdminOrManager]
    filterset_fields = ['department']
    search_fields = ['title']


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related('department', 'designation').all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAdminOrManager]
    filterset_fields = ['department', 'designation', 'status']
    search_fields = ['first_name', 'last_name', 'employee_code', 'email', 'phone']

    @action(detail=True, methods=['get'])
    def attendances(self, request, pk=None):
        employee = self.get_object()
        attendances = employee.attendances.all().order_by('-date')
        page = self.paginate_queryset(attendances)
        if page is not None:
            serializer = AttendanceSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = AttendanceSerializer(attendances, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def payrolls(self, request, pk=None):
        employee = self.get_object()
        payrolls = employee.payrolls.all().order_by('-year', '-month')
        page = self.paginate_queryset(payrolls)
        if page is not None:
            serializer = PayrollSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = PayrollSerializer(payrolls, many=True)
        return Response(serializer.data)


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related('employee').all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAdminOrManager]
    filterset_fields = ['date', 'status', 'employee']
    ordering_fields = ['date', 'check_in']


class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.select_related('employee', 'employee__department').all()
    serializer_class = PayrollSerializer
    permission_classes = [IsAccountantOrAdmin]
    filterset_fields = ['month', 'year', 'status', 'employee']
    search_fields = ['payroll_code', 'employee__first_name', 'employee__last_name', 'employee__employee_code']

    @action(detail=False, methods=['post'], url_path='generate-monthly')
    def generate_monthly(self, request):
        month = int(request.data.get('month', 0))
        year = int(request.data.get('year', 0))
        if not (1 <= month <= 12 and year > 2000):
            return api_response(
                success=False,
                message="Valid 'month' (1-12) and 'year' are required.",
                status_code=status.HTTP_400_BAD_REQUEST
            )

        payrolls = PayrollService.generate_monthly_payroll(month, year)
        return api_response(
            success=True,
            message=f"Generated {len(payrolls)} payroll drafts for {month}/{year}.",
            data=PayrollSerializer(payrolls, many=True).data,
            status_code=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'], url_path='disburse')
    def disburse(self, request, pk=None):
        payroll = self.get_object()
        payment_method = request.data.get('payment_method', Payroll.PaymentMethod.BANK_TRANSFER)
        updated = PayrollService.disburse_payment(payroll, payment_method)
        return api_response(
            success=True,
            message=f"Payroll {updated.payroll_code} disbursed successfully.",
            data=PayrollSerializer(updated).data
        )

