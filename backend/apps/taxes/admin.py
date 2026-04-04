from django.contrib import admin
from .models import Tax

@admin.register(Tax)
class TaxAdmin(admin.ModelAdmin):
    list_display = ('name', 'rate', 'tax_type')
    list_filter = ('tax_type',)
    search_fields = ('name',)
