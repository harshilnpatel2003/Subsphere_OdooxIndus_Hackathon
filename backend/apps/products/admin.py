from django.contrib import admin
from .models import Product, ProductVariant

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'product_type', 'sales_price', 'is_recurring', 'is_active')
    list_filter = ('product_type', 'is_recurring', 'is_active')
    search_fields = ('name', 'notes')
    inlines = [ProductVariantInline]

@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ('product', 'attribute', 'value', 'extra_price')
    list_filter = ('product', 'attribute')
    search_fields = ('product__name', 'attribute', 'value')
