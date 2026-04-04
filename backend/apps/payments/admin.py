from django.contrib import admin
from .models import Payment

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('invoice', 'razorpay_order_id', 'amount', 'paid_at', 'status')
    list_filter = ('status', 'method', 'paid_at')
    search_fields = ('razorpay_order_id', 'razorpay_payment_id', 'invoice__invoice_number')
