import datetime
from django.contrib import admin
from django.urls import path, reverse
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.utils import timezone
from django.utils.html import format_html
from .models import Department, Designation, Employee, Attendance, Payroll


# ─────────────────────────────────────────
# Inlines
# ─────────────────────────────────────────
class DesignationInline(admin.TabularInline):
    model = Designation
    extra = 1
    fields = ('title', 'description')
    show_change_link = True


class AttendanceInline(admin.TabularInline):
    model = Attendance
    extra = 0
    fields = ('date', 'check_in', 'check_out', 'status', 'notes')
    readonly_fields = ('created_at',)
    ordering = ('-date',)
    max_num = 10
    show_change_link = True


class PayrollInline(admin.TabularInline):
    model = Payroll
    extra = 0
    fields = ('payroll_code', 'month', 'year', 'basic_salary', 'net_salary', 'status')
    readonly_fields = ('payroll_code', 'net_salary')
    ordering = ('-year', '-month')
    max_num = 6
    show_change_link = True


# ─────────────────────────────────────────
# Department
# ─────────────────────────────────────────
@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'employee_count', 'designation_count', 'created_at')
    search_fields = ('name', 'code')
    list_per_page = 20
    inlines = [DesignationInline]

    fieldsets = (
        (None, {'fields': ('name', 'code', 'description')}),
    )

    @admin.display(description='Staff')
    def employee_count(self, obj):
        count = obj.employees.count()
        return format_html(
            '<span style="background:#3B82F6;color:#fff;padding:2px 10px;border-radius:10px;'
            'font-size:12px;font-weight:600;">{}</span>', count,
        )

    @admin.display(description='Roles')
    def designation_count(self, obj):
        return obj.designations.count()


# ─────────────────────────────────────────
# Designation
# ─────────────────────────────────────────
@admin.register(Designation)
class DesignationAdmin(admin.ModelAdmin):
    list_display = ('title', 'department', 'employee_count', 'created_at')
    list_filter = ('department',)
    search_fields = ('title', 'department__name')
    list_per_page = 25
    autocomplete_fields = ('department',)

    @admin.display(description='Assigned')
    def employee_count(self, obj):
        return obj.employees.count()


# ─────────────────────────────────────────
# Employee
# ─────────────────────────────────────────
@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = (
        'employee_code', 'avatar_thumb', 'full_name_display', 'department',
        'designation', 'status_badge', 'salary_display', 'joining_date',
    )
    list_display_links = ('employee_code', 'full_name_display')
    list_filter = ('department', 'status', 'joining_date', 'designation')
    search_fields = ('employee_code', 'first_name', 'last_name', 'email', 'phone')
    ordering = ('employee_code',)
    list_per_page = 20
    date_hierarchy = 'joining_date'
    autocomplete_fields = ('department', 'designation', 'user')
    inlines = [AttendanceInline, PayrollInline]

    fieldsets = (
        ('🏷️ Identity', {
            'fields': (('employee_code', 'user'), ('first_name', 'last_name'), 'avatar'),
        }),
        ('📞 Contact', {
            'fields': (('email', 'phone'), 'address'),
        }),
        ('🏢 Position & Department', {
            'fields': (('department', 'designation'), ('status', 'joining_date')),
        }),
        ('💰 Compensation', {
            'fields': (('basic_salary', 'hourly_rate'),),
        }),
        ('🏦 Bank Details', {
            'classes': ('collapse',),
            'fields': (('bank_name', 'bank_account_name'), 'bank_account_no'),
        }),
    )

    @admin.display(description='Photo')
    def avatar_thumb(self, obj):
        if obj.avatar:
            return format_html(
                '<img src="{}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;" />',
                obj.avatar.url,
            )
        initials = (obj.first_name[:1] + obj.last_name[:1]).upper()
        return format_html(
            '<span style="display:inline-flex;align-items:center;justify-content:center;'
            'width:30px;height:30px;border-radius:50%;background:#6366F1;color:#fff;'
            'font-size:11px;font-weight:700;">{}</span>', initials,
        )

    @admin.display(description='Name', ordering='first_name')
    def full_name_display(self, obj):
        return obj.full_name

    @admin.display(description='Status')
    def status_badge(self, obj):
        colors = {
            'ACTIVE': '#059669', 'ON_LEAVE': '#D97706', 'PROBATION': '#3B82F6',
            'TERMINATED': '#DC2626', 'RESIGNED': '#6B7280',
        }
        bg = colors.get(obj.status, '#6B7280')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;border-radius:10px;'
            'font-size:11px;font-weight:600;">{}</span>', bg, obj.get_status_display(),
        )

    @admin.display(description='Salary', ordering='basic_salary')
    def salary_display(self, obj):
        return format_html('৳ {}', f'{obj.basic_salary:,.0f}')


# ─────────────────────────────────────────
# Attendance
# ─────────────────────────────────────────
@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('employee_cell', 'date', 'check_in', 'check_out', 'working_hours_display', 'status_badge', 'notes')
    list_display_links = ('employee_cell',)
    list_filter = ('status', 'date', 'employee__department')
    search_fields = ('employee__first_name', 'employee__last_name', 'employee__employee_code')
    date_hierarchy = 'date'
    list_per_page = 30
    list_editable = ('check_in', 'check_out')
    autocomplete_fields = ('employee',)
    actions = [
        'mark_as_present',
        'mark_as_late',
        'mark_as_half_day',
        'mark_as_on_leave',
        'mark_as_absent',
        'generate_today_roster',
    ]

    fieldsets = (
        (None, {
            'fields': (('employee', 'date'), ('check_in', 'check_out'), 'status', 'notes'),
        }),
    )

    @admin.display(description='Employee', ordering='employee__first_name')
    def employee_cell(self, obj):
        return format_html(
            '<div><strong>{}</strong><br/><span style="color:#71717A;font-size:11px;">{} · {}</span></div>',
            obj.employee.full_name, obj.employee.employee_code, obj.employee.department.name if obj.employee.department else '—'
        )

    @admin.display(description='Hours Worked')
    def working_hours_display(self, obj):
        hours = obj.working_hours
        if hours != '—':
            return format_html(
                '<span style="background:#F4F4F5;color:#18181B;padding:2px 8px;border-radius:6px;'
                'font-size:11px;font-family:monospace;font-weight:600;">⏱️ {}</span>', hours
            )
        return format_html('<span style="color:#9CA3AF;">{}</span>', '—')

    @admin.display(description='Status')
    def status_badge(self, obj):
        colors = {
            'PRESENT': '#059669', 'LATE': '#D97706', 'ABSENT': '#DC2626',
            'HALF_DAY': '#7C3AED', 'ON_LEAVE': '#3B82F6',
        }
        bg = colors.get(obj.status, '#6B7280')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;border-radius:10px;'
            'font-size:11px;font-weight:600;">{}</span>', bg, obj.get_status_display(),
        )

    @admin.action(description="🟢 Mark selected as Present (09:00 AM)")
    def mark_as_present(self, request, queryset):
        default_in = datetime.time(9, 0)
        updated = 0
        for att in queryset:
            att.status = Attendance.Status.PRESENT
            if not att.check_in:
                att.check_in = default_in
            if not att.check_out:
                att.check_out = datetime.time(18, 0)
            att.save()
            updated += 1
        self.message_user(request, f"{updated} attendance record(s) marked as Present.")

    @admin.action(description="🟡 Mark selected as Late (09:45 AM)")
    def mark_as_late(self, request, queryset):
        updated = queryset.update(status=Attendance.Status.LATE, check_in=datetime.time(9, 45))
        self.message_user(request, f"{updated} attendance record(s) marked as Late.")

    @admin.action(description="🟣 Mark selected as Half Day")
    def mark_as_half_day(self, request, queryset):
        updated = queryset.update(status=Attendance.Status.HALF_DAY)
        self.message_user(request, f"{updated} attendance record(s) marked as Half Day.")

    @admin.action(description="🔵 Mark selected as On Leave")
    def mark_as_on_leave(self, request, queryset):
        updated = queryset.update(status=Attendance.Status.ON_LEAVE, check_in=None, check_out=None)
        self.message_user(request, f"{updated} attendance record(s) marked as On Leave.")

    @admin.action(description="🔴 Mark selected as Absent")
    def mark_as_absent(self, request, queryset):
        updated = queryset.update(status=Attendance.Status.ABSENT, check_in=None, check_out=None)
        self.message_user(request, f"{updated} attendance record(s) marked as Absent.")

    @admin.action(description="📅 Generate Today's Roster for all Active Staff")
    def generate_today_roster(self, request, queryset):
        today = datetime.date.today()
        active_staff = Employee.objects.filter(status=Employee.Status.ACTIVE)
        created_count = 0
        for emp in active_staff:
            _, created = Attendance.objects.get_or_create(
                employee=emp,
                date=today,
                defaults={'status': Attendance.Status.PRESENT, 'check_in': datetime.time(9, 0), 'check_out': datetime.time(18, 0)}
            )
            if created:
                created_count += 1
        self.message_user(request, f"Generated today's roster ({today}): {created_count} new entries created.")


# ─────────────────────────────────────────
# Payroll
# ─────────────────────────────────────────
@admin.register(Payroll)
class PayrollAdmin(admin.ModelAdmin):
    list_display = (
        'payroll_code', 'employee_cell', 'period_display', 'salary_display',
        'allowances_display', 'deductions_display', 'net_display',
        'payment_method_badge', 'status_badge', 'slip_link',
    )
    list_display_links = ('payroll_code',)
    list_filter = ('status', 'year', 'month', 'payment_method', 'employee__department')
    search_fields = ('payroll_code', 'employee__first_name', 'employee__last_name', 'employee__employee_code')
    list_per_page = 25
    autocomplete_fields = ('employee',)
    actions = ['mark_as_approved', 'mark_as_paid', 'recalculate_selected']

    fieldsets = (
        ('📋 Payroll Identity', {
            'fields': (('payroll_code', 'employee'), ('month', 'year')),
        }),
        ('💵 Earnings', {
            'fields': (('basic_salary', 'bonus'), ('allowance',)),
        }),
        ('📉 Deductions', {
            'fields': (('deductions', 'tax'),),
        }),
        ('💎 Net & Payment', {
            'fields': ('net_salary', ('status', 'payment_method'), 'paid_at', 'notes'),
        }),
    )
    readonly_fields = ('net_salary', 'paid_at')

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('<uuid:payroll_id>/payslip/', self.admin_site.admin_view(self.payslip_view), name='payroll_payslip'),
        ]
        return custom_urls + urls

    def payslip_view(self, request, payroll_id):
        payroll = get_object_or_404(
            Payroll.objects.select_related('employee', 'employee__department', 'employee__designation'),
            pk=payroll_id
        )
        emp = payroll.employee
        dept_name = emp.department.name if emp.department else 'Architecture & Interior'
        desig_title = emp.designation.title if emp.designation else 'Staff'
        period = f"{payroll.month_name} {payroll.year}"
        disbursed_on = payroll.paid_at.strftime('%d %b, %Y') if payroll.paid_at else 'Pending Approval'

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Payslip {payroll.payroll_code} | Bistirno ArchStudio Pro</title>
  <style>
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #F4F4F5; color: #18181B; padding: 40px 20px; }}
    .slip-container {{ max-width: 820px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E4E4E7; border-radius: 16px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
    .header {{ display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #18181B; margin-bottom: 24px; }}
    .brand h1 {{ font-size: 24px; font-weight: 800; letter-spacing: 1px; color: #18181B; }}
    .brand p {{ font-size: 13px; color: #71717A; margin-top: 4px; }}
    .slip-title {{ text-align: right; }}
    .slip-title h2 {{ font-size: 16px; font-weight: 800; color: #18181B; text-transform: uppercase; letter-spacing: 0.5px; }}
    .slip-code {{ font-family: monospace; font-size: 14px; font-weight: 700; color: #3B82F6; margin-top: 4px; }}
    .grid-2 {{ display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }}
    .info-card {{ background: #FAFAFA; border: 1px solid #E4E4E7; border-radius: 12px; padding: 16px; font-size: 13px; }}
    .info-card h3 {{ font-size: 11px; text-transform: uppercase; color: #71717A; font-weight: 700; margin-bottom: 8px; letter-spacing: 0.5px; }}
    .info-row {{ display: flex; justify-content: space-between; margin-bottom: 6px; }}
    .info-label {{ color: #71717A; }}
    .info-val {{ font-weight: 600; color: #18181B; }}
    table {{ width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }}
    th {{ background: #F4F4F5; padding: 12px 16px; text-align: left; font-weight: 700; color: #18181B; border-bottom: 1px solid #E4E4E7; }}
    td {{ padding: 12px 16px; border-bottom: 1px solid #F4F4F5; }}
    .amount {{ text-align: right; font-family: monospace; font-weight: 700; }}
    .positive {{ color: #059669; }}
    .negative {{ color: #DC2626; }}
    .total-box {{ background: #18181B; color: #FFFFFF; border-radius: 12px; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }}
    .total-title {{ font-size: 14px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px; }}
    .total-amount {{ font-size: 26px; font-weight: 800; font-family: monospace; color: #10B981; }}
    .signatures {{ display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; padding-top: 20px; }}
    .sig-line {{ border-top: 1px solid #D4D4D8; text-align: center; padding-top: 8px; font-size: 12px; color: #71717A; }}
    .btn-bar {{ max-width: 820px; margin: 0 auto 20px auto; display: flex; justify-content: flex-end; gap: 10px; }}
    .btn {{ padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; border: none; }}
    .btn-print {{ background: #18181B; color: #FFFFFF; }}
    .btn-back {{ background: #FFFFFF; color: #18181B; border: 1px solid #D4D4D8; }}
    @media print {{
      body {{ background: #FFFFFF; padding: 0; }}
      .slip-container {{ border: none; box-shadow: none; padding: 20px 0; }}
      .btn-bar {{ display: none; }}
    }}
  </style>
</head>
<body>
  <div class="btn-bar">
    <button onclick="window.print()" class="btn btn-print">🖨️ Print / Save as PDF</button>
    <a href="javascript:window.close()" class="btn btn-back">✕ Close Window</a>
  </div>

  <div class="slip-container">
    <div class="header">
      <div class="brand">
        <h1>BISTIRNO ARCHSTUDIO PRO</h1>
        <p>Architectural Planning, Interior Design & Construction Management</p>
        <p style="color:#A1A1AA;font-size:11px;margin-top:2px;">Dhaka, Bangladesh · contact@bistirno.com</p>
      </div>
      <div class="slip-title">
        <h2>Official Salary Statement</h2>
        <div class="slip-code">{payroll.payroll_code}</div>
        <div style="font-size:12px;color:#71717A;margin-top:4px;">Period: <strong>{period}</strong></div>
      </div>
    </div>

    <div class="grid-2">
      <div class="info-card">
        <h3>Staff Profile</h3>
        <div class="info-row"><span class="info-label">Name:</span><span class="info-val">{emp.full_name}</span></div>
        <div class="info-row"><span class="info-label">Code:</span><span class="info-val">{emp.employee_code}</span></div>
        <div class="info-row"><span class="info-label">Designation:</span><span class="info-val">{desig_title}</span></div>
        <div class="info-row"><span class="info-label">Department:</span><span class="info-val">{dept_name}</span></div>
        <div class="info-row"><span class="info-label">Joining Date:</span><span class="info-val">{emp.joining_date}</span></div>
      </div>

      <div class="info-card">
        <h3>Payment & Bank Details</h3>
        <div class="info-row"><span class="info-label">Bank Name:</span><span class="info-val">{emp.bank_name or 'City Bank / BRAC Bank'}</span></div>
        <div class="info-row"><span class="info-label">Account No:</span><span class="info-val">{emp.bank_account_no or '—'}</span></div>
        <div class="info-row"><span class="info-label">Method:</span><span class="info-val">{payroll.get_payment_method_display()}</span></div>
        <div class="info-row"><span class="info-label">Status:</span><span class="info-val" style="color:#059669;">{payroll.get_status_display()}</span></div>
        <div class="info-row"><span class="info-label">Disbursed Date:</span><span class="info-val">{disbursed_on}</span></div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Earnings Component</th>
          <th style="text-align:right;">Amount (BDT)</th>
          <th>Deductions & Withholdings</th>
          <th style="text-align:right;">Amount (BDT)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Basic Fixed Salary</td>
          <td class="amount">৳ {payroll.basic_salary:,.2f}</td>
          <td>Income Tax (TDS)</td>
          <td class="amount negative">- ৳ {payroll.tax:,.2f}</td>
        </tr>
        <tr>
          <td>Conveyance / House Allowance</td>
          <td class="amount positive">+ ৳ {payroll.allowance:,.2f}</td>
          <td>Provident / Statutory Deductions</td>
          <td class="amount negative">- ৳ {payroll.deductions:,.2f}</td>
        </tr>
        <tr>
          <td>Project / Performance Bonus</td>
          <td class="amount positive">+ ৳ {payroll.bonus:,.2f}</td>
          <td style="color:#A1A1AA;">—</td>
          <td class="amount" style="color:#A1A1AA;">—</td>
        </tr>
        <tr style="background:#FAFAFA;font-weight:700;">
          <td>Total Gross Earnings</td>
          <td class="amount positive">৳ {payroll.total_earnings:,.2f}</td>
          <td>Total Deductions</td>
          <td class="amount negative">- ৳ {payroll.total_deductions:,.2f}</td>
        </tr>
      </tbody>
    </table>

    <div class="total-box">
      <div>
        <div class="total-title">Net Disbursed Compensation</div>
        <div style="font-size:11px;color:#A1A1AA;margin-top:2px;">Transferred via {payroll.get_payment_method_display()}</div>
      </div>
      <div class="total-amount">৳ {payroll.net_salary:,.2f}</div>
    </div>

    <div class="signatures">
      <div class="sig-line">
        <strong>{emp.full_name}</strong><br />Employee Signature
      </div>
      <div class="sig-line">
        <strong>Authorized Principal Architect</strong><br />Bistirno ArchStudio Management
      </div>
    </div>
  </div>
</body>
</html>"""
        return HttpResponse(html)

    @admin.display(description='Employee', ordering='employee__first_name')
    def employee_cell(self, obj):
        return format_html(
            '<div><strong>{}</strong><br/><span style="color:#71717A;font-size:11px;">{}</span></div>',
            obj.employee.full_name, obj.employee.employee_code
        )

    @admin.display(description='Period')
    def period_display(self, obj):
        months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        return f"{months[obj.month]} {obj.year}"

    @admin.display(description='Basic', ordering='basic_salary')
    def salary_display(self, obj):
        return format_html('৳ {}', f'{obj.basic_salary:,.0f}')

    @admin.display(description='Allowance & Bonus')
    def allowances_display(self, obj):
        total = (obj.allowance or 0) + (obj.bonus or 0)
        return format_html(
            '<span style="color:#059669;font-weight:600;">+ ৳ {}</span>', f'{total:,.0f}'
        )

    @admin.display(description='Deductions')
    def deductions_display(self, obj):
        total = (obj.deductions or 0) + (obj.tax or 0)
        if total > 0:
            return format_html(
                '<span style="color:#DC2626;font-weight:600;">- ৳ {}</span>', f'{total:,.0f}'
            )
        return format_html('<span style="color:#9CA3AF;">{}</span>', '—')

    @admin.display(description='Net Pay', ordering='net_salary')
    def net_display(self, obj):
        return format_html(
            '<strong style="color:#059669;font-size:13px;">৳ {}</strong>', f'{obj.net_salary:,.0f}',
        )

    @admin.display(description='Method')
    def payment_method_badge(self, obj):
        return obj.get_payment_method_display()

    @admin.display(description='Status')
    def status_badge(self, obj):
        colors = {
            'PENDING': '#D97706', 'APPROVED': '#3B82F6',
            'PAID': '#059669', 'CANCELLED': '#DC2626',
        }
        bg = colors.get(obj.status, '#6B7280')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;border-radius:10px;'
            'font-size:11px;font-weight:600;">{}</span>', bg, obj.get_status_display(),
        )

    @admin.display(description='Statement / Slip')
    def slip_link(self, obj):
        url = reverse('admin:payroll_payslip', args=[obj.pk])
        return format_html(
            '<a href="{}" target="_blank" style="background:#18181B;color:#fff;padding:3px 8px;border-radius:6px;'
            'font-size:11px;font-weight:600;text-decoration:none;display:inline-flex;align-items:center;gap:4px;">'
            '🖨️ Payslip</a>', url
        )

    @admin.action(description="✅ Approve selected payrolls")
    def mark_as_approved(self, request, queryset):
        updated = queryset.filter(status=Payroll.PaymentStatus.PENDING).update(
            status=Payroll.PaymentStatus.APPROVED)
        self.message_user(request, f"{updated} payroll(s) approved.")

    @admin.action(description="💸 Mark selected as Disbursed / Paid")
    def mark_as_paid(self, request, queryset):
        updated = queryset.exclude(status=Payroll.PaymentStatus.CANCELLED).update(
            status=Payroll.PaymentStatus.PAID, paid_at=timezone.now())
        self.message_user(request, f"{updated} payroll(s) marked as paid.")

    @admin.action(description="🔄 Recalculate Net Salaries")
    def recalculate_selected(self, request, queryset):
        for p in queryset:
            p.net_salary = p.calculate_net_salary()
            p.save()
        self.message_user(request, f"{queryset.count()} payroll record(s) recalculated.")
