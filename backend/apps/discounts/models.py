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
    max_uses_per_user = models.PositiveIntegerField(null=True, blank=True, help_text='Max times a single user can apply this code. Null = unlimited.')
    applies_to = models.CharField(max_length=20, choices=AppliesToType.choices, default=AppliesToType.PRODUCT)

    def __str__(self):
        return self.name


class DiscountUsage(models.Model):
    """Tracks each time a specific user redeems a discount code."""
    discount = models.ForeignKey(Discount, on_delete=models.CASCADE, related_name='usages')
    user = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='discount_usages')
    used_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Discount Usages'

    def __str__(self):
        return f"{self.user} used {self.discount.code}"
