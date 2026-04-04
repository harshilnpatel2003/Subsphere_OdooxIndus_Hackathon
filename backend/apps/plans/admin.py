from django.contrib import admin
from .models import Plan

@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'billing_period', 'min_quantity', 'start_date', 'end_date', 'auto_close')
    list_filter = ('billing_period', 'auto_close', 'closable', 'pausable', 'renewable')
    search_fields = ('name',)
