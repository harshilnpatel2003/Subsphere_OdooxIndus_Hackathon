from django.contrib import admin
from .models import Subscription, SubscriptionLine, PaymentTerm, QuotationTemplate, QuotationTemplateLine

class SubscriptionLineInline(admin.TabularInline):
    model = SubscriptionLine
    extra = 1

@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('subscription_number', 'customer', 'plan', 'start_date', 'status')
    list_filter = ('status', 'plan', 'start_date')
    search_fields = ('subscription_number', 'customer__email', 'notes')
    inlines = [SubscriptionLineInline]

@admin.register(PaymentTerm)
class PaymentTermAdmin(admin.ModelAdmin):
    list_display = ('name', 'due_days', 'is_first_payment_discount', 'discount_percentage')

class QuotationTemplateLineInline(admin.TabularInline):
    model = QuotationTemplateLine
    extra = 1

@admin.register(QuotationTemplate)
class QuotationTemplateAdmin(admin.ModelAdmin):
    list_display = ('name', 'validity_days', 'plan')
    inlines = [QuotationTemplateLineInline]
