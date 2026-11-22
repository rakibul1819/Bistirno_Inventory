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
    queryset = Attendance.objects.select_related('employee', 'employee__department').all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAdminOrManager]
    filterset_fields = ['date', 'status', 'employee']
    ordering_fields = ['date', 'check_in']

    @action(detail=False, methods=['post'], url_path='bulk-mark')
    def bulk_mark(self, request):
        import datetime
        date_str = request.data.get('date')
        target_date = datetime.date.fromisoformat(date_str) if date_str else datetime.date.today()
        status_val = request.data.get('status', Attendance.Status.PRESENT)
        check_in = request.data.get('check_in', '09:00:00')
        employee_ids = request.data.get('employee_ids', [])

        if not employee_ids:
            employees = Employee.objects.filter(status=Employee.Status.ACTIVE)
        else:
            employees = Employee.objects.filter(id__in=employee_ids)

        records = []
        for emp in employees:
            att, created = Attendance.objects.get_or_create(
                employee=emp,
                date=target_date,
                defaults={'status': status_val, 'check_in': check_in}
            )
            if not created:
                att.status = status_val
                if check_in and not att.check_in:
                    att.check_in = check_in
                att.save()
            records.append(att)

        return api_response(
            success=True,
            message=f"Attendance updated for {len(records)} employees on {target_date}.",
            data=AttendanceSerializer(records, many=True).data
        )


class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.select_related('employee', 'employee__department', 'employee__designation').all()
    serializer_class = PayrollSerializer
    permission_classes = [IsAccountantOrAdmin]
    filterset_fields = ['month', 'year', 'status', 'employee']
    search_fields = ['payroll_code', 'employee__first_name', 'employee__last_name', 'employee__employee_code']

    @action(detail=False, methods=['get'], url_path='monthly-statement')
    def monthly_statement(self, request):
        month = request.query_params.get('month')
        year = request.query_params.get('year')
        qs = self.get_queryset()
        if month:
            qs = qs.filter(month=month)
        if year:
            qs = qs.filter(year=year)

        total_payout = sum(p.net_salary for p in qs)
        total_tax = sum(p.tax for p in qs)
        total_bonus = sum(p.bonus for p in qs)
        paid_count = qs.filter(status=Payroll.PaymentStatus.PAID).count()
        pending_count = qs.filter(status=Payroll.PaymentStatus.PENDING).count()

        return api_response(
            success=True,
            message="Monthly salary statement retrieved.",
            data={
                'total_records': qs.count(),
                'total_payout': float(total_payout),
                'total_tax': float(total_tax),
                'total_bonus': float(total_bonus),
                'paid_count': paid_count,
                'pending_count': pending_count,
                'records': PayrollSerializer(qs, many=True).data
            }
        )

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

