from django.contrib import admin
from .models import Invoice, InvoiceLine

class InvoiceLineInline(admin.TabularInline):
    model = InvoiceLine
    extra = 1

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'customer', 'issue_date', 'status', 'total')
    list_filter = ('status', 'issue_date')
    search_fields = ('invoice_number', 'customer__email', 'razorpay_order_id')
    inlines = [InvoiceLineInline]
