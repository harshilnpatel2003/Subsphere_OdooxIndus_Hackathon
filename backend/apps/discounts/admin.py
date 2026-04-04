from django.contrib import admin
from .models import Discount

@admin.register(Discount)
class DiscountAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'discount_type', 'value', 'applies_to', 'current_usage', 'usage_limit')
    list_filter = ('discount_type', 'applies_to', 'start_date', 'end_date')
    search_fields = ('name', 'code')
