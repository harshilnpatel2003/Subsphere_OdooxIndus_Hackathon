from rest_framework import serializers
from .models import Product, ProductVariant

class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ('id', 'attribute', 'value', 'extra_price')

class ProductSerializer(serializers.ModelSerializer):
    variants = ProductVariantSerializer(many=True, read_only=True)
    photo = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = ('id', 'name', 'product_type', 'sales_price', 'cost_price', 'notes', 'is_recurring', 'variants', 'photo')
