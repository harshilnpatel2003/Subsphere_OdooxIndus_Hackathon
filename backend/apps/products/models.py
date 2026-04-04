from django.db import models

class ProductType(models.TextChoices):
    SERVICE = 'service', 'Service'
    PHYSICAL = 'physical', 'Physical'

class Product(models.Model):
    name = models.CharField(max_length=255)
    product_type = models.CharField(max_length=20, choices=ProductType.choices, default=ProductType.SERVICE)
    sales_price = models.DecimalField(max_digits=10, decimal_places=2)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True, null=True)
    is_recurring = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    attribute = models.CharField(max_length=100)
    value = models.CharField(max_length=100)
    extra_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.product.name} - {self.attribute}: {self.value}"
