from django.db import models

class DiscountType(models.TextChoices):
    FIXED = 'fixed', 'Fixed'
    PERCENTAGE = 'percentage', 'Percentage'

class AppliesToType(models.TextChoices):
    PRODUCT = 'product', 'Product'
    SUBSCRIPTION = 'subscription', 'Subscription'

class Discount(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True, null=True, blank=True)
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    min_purchase = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    min_quantity = models.PositiveIntegerField(default=1)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    current_usage = models.PositiveIntegerField(default=0)
    applies_to = models.CharField(max_length=20, choices=AppliesToType.choices, default=AppliesToType.PRODUCT)

    def __str__(self):
        return self.name
