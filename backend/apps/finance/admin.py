from django.contrib import admin
from django.utils.html import format_html
from .models import FinancialAccount, ExpenseCategory, Invoice, Transaction


# ─────────────────────────────────────────
# Inlines
# ─────────────────────────────────────────
class TransactionInline(admin.TabularInline):
    model = Transaction
    fk_name = 'account'
    extra = 0
    fields = ('transaction_ref', 'transaction_type', 'amount', 'transaction_date', 'description')
    readonly_fields = ('transaction_ref',)
    ordering = ('-transaction_date',)
    max_num = 10
    show_change_link = True


class InvoicePaymentInline(admin.TabularInline):
    model = Transaction
    fk_name = 'invoice'
    extra = 0
    fields = ('transaction_ref', 'amount', 'transaction_date', 'account')
    readonly_fields = ('transaction_ref',)
    ordering = ('-transaction_date',)
    max_num = 5
    verbose_name = 'Payment Record'
    verbose_name_plural = 'Payment History'
    show_change_link = True


# ─────────────────────────────────────────
# Financial Account
# ─────────────────────────────────────────
@admin.register(FinancialAccount)
class FinancialAccountAdmin(admin.ModelAdmin):
    list_display = ('name', 'type_badge', 'bank_name', 'account_number', 'balance_display', 'active_badge')
    list_filter = ('account_type', 'is_active')
    search_fields = ('name', 'bank_name', 'account_number')
    list_per_page = 20
    inlines = [TransactionInline]

    fieldsets = (
        ('🏦 Account Information', {
            'fields': (('name', 'account_type'), ('bank_name', 'account_number'), ('balance', 'is_active')),
        }),
    )

    @admin.display(description='Type')
    def type_badge(self, obj):
        colors = {
            'BANK': '#3B82F6', 'CASH': '#059669',
            'PETTY_CASH': '#D97706', 'MOBILE': '#7C3AED',
        }
        bg = colors.get(obj.account_type, '#6B7280')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;border-radius:10px;'
            'font-size:11px;font-weight:600;">{}</span>', bg, obj.get_account_type_display(),
        )

    @admin.display(description='Balance', ordering='balance')
    def balance_display(self, obj):
        color = '#059669' if obj.balance >= 0 else '#DC2626'
        return format_html(
            '<strong style="color:{};">৳ {}</strong>', color, f'{obj.balance:,.2f}',
        )

    @admin.display(description='Active', boolean=True)
    def active_badge(self, obj):
        return obj.is_active


# ─────────────────────────────────────────
# Expense Category
# ─────────────────────────────────────────
@admin.register(ExpenseCategory)
class ExpenseCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'transaction_count', 'created_at')
    search_fields = ('name',)
    list_per_page = 20

    fieldsets = (
        (None, {'fields': ('name', 'description')}),
    )

    @admin.display(description='Expenses')
    def transaction_count(self, obj):
        count = obj.transactions.count()
        return format_html(
            '<span style="background:#D97706;color:#fff;padding:2px 10px;border-radius:10px;'
            'font-size:12px;font-weight:600;">{}</span>', count,
        )


# ─────────────────────────────────────────
# Invoice
# ─────────────────────────────────────────
@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = (
        'invoice_number', 'customer', 'project', 'total_display',
        'paid_display', 'due_display', 'status_badge', 'due_date',
    )
    list_display_links = ('invoice_number', 'customer')
    list_filter = ('status', 'issue_date', 'due_date')
    search_fields = ('invoice_number', 'customer__full_name', 'project__title')
    date_hierarchy = 'issue_date'
    list_per_page = 20
    autocomplete_fields = ('customer', 'project')
    inlines = [InvoicePaymentInline]
    actions = ['mark_as_paid', 'mark_as_sent']

    fieldsets = (
        ('📄 Invoice Details', {
            'fields': (('invoice_number', 'status'), ('customer', 'project')),
        }),
        ('📅 Dates', {
            'fields': (('issue_date', 'due_date'),),
        }),
        ('💰 Amounts', {
            'fields': (('subtotal', 'tax_amount'), ('discount_amount', 'total_amount'), 'amount_paid'),
        }),
        ('📝 Notes', {
            'classes': ('collapse',),
            'fields': ('notes',),
        }),
    )

    @admin.display(description='Total', ordering='total_amount')
    def total_display(self, obj):
        return format_html('<strong>৳ {}</strong>', f'{obj.total_amount:,.0f}')

    @admin.display(description='Paid', ordering='amount_paid')
    def paid_display(self, obj):
        return format_html(
            '<span style="color:#059669;font-weight:600;">৳ {}</span>', f'{obj.amount_paid:,.0f}',
        )

    @admin.display(description='Due')
    def due_display(self, obj):
        due = obj.due_amount
        if due <= 0:
            return format_html('<span style="color:#059669;">{}</span>', '—')
        return format_html(
            '<span style="color:#DC2626;font-weight:600;">৳ {}</span>', f'{due:,.0f}',
        )

    @admin.display(description='Status')
    def status_badge(self, obj):
        colors = {
            'DRAFT': '#6B7280', 'SENT': '#3B82F6', 'PARTIALLY_PAID': '#D97706',
            'PAID': '#059669', 'OVERDUE': '#DC2626', 'CANCELLED': '#9CA3AF',
        }
        bg = colors.get(obj.status, '#6B7280')
        return format_html(
            '<span style="background:{};color:#fff;padding:2px 10px;border-radius:10px;'
            'font-size:11px;font-weight:600;">{}</span>', bg, obj.get_status_display(),
        )

    @admin.action(description="✅ Mark as Fully Paid")
    def mark_as_paid(self, request, queryset):
        count = 0
        for inv in queryset.exclude(status=Invoice.Status.CANCELLED):
            inv.status = Invoice.Status.PAID
            inv.amount_paid = inv.total_amount
            inv.save()
            count += 1
        self.message_user(request, f"{count} invoice(s) marked as paid.")

    @admin.action(description="📤 Mark as Sent to Client")
    def mark_as_sent(self, request, queryset):
        updated = queryset.filter(status=Invoice.Status.DRAFT).update(status=Invoice.Status.SENT)
        self.message_user(request, f"{updated} invoice(s) sent.")


# ─────────────────────────────────────────
# Transaction
# ─────────────────────────────────────────
@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = (
        'transaction_ref', 'type_badge', 'amount_display',
        'account', 'project', 'transaction_date', 'recorded_by',
    )
    list_display_links = ('transaction_ref',)
    list_filter = ('transaction_type', 'transaction_date', 'account', 'category')
    search_fields = ('transaction_ref', 'description', 'account__name', 'project__title')
    date_hierarchy = 'transaction_date'
    list_per_page = 25
    autocomplete_fields = ('account', 'project', 'invoice', 'category', 'recorded_by')

    fieldsets = (
        ('📋 Transaction Info', {
            'fields': (('transaction_ref', 'transaction_type'), ('account', 'amount'), 'transaction_date'),
        }),
        ('🔗 Associations', {
            'fields': (('project', 'invoice'), ('category', 'recorded_by')),
        }),
        ('📝 Details', {
            'fields': ('description', 'receipt_attachment'),
        }),
    )

    @admin.display(description='Type')
    def type_badge(self, obj):
        colors = {
            'INCOME': '#059669', 'EXPENSE': '#DC2626', 'TRANSFER': '#3B82F6',
        }
        icons = {'INCOME': '📈', 'EXPENSE': '📉', 'TRANSFER': '🔄'}
        bg = colors.get(obj.transaction_type, '#6B7280')
        icon = icons.get(obj.transaction_type, '')
        return format_html(
            '{} <span style="background:{};color:#fff;padding:2px 10px;border-radius:10px;'
            'font-size:11px;font-weight:600;">{}</span>',
            icon, bg, obj.get_transaction_type_display(),
        )

    @admin.display(description='Amount', ordering='amount')
    def amount_display(self, obj):
        color = '#059669' if obj.transaction_type == 'INCOME' else '#DC2626'
        prefix = '+' if obj.transaction_type == 'INCOME' else '-'
        return format_html(
            '<strong style="color:{};">{} ৳ {}</strong>',
            color, prefix, f'{obj.amount:,.0f}',
        )
