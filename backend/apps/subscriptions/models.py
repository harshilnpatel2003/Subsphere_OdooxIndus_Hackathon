from django.db import models
from apps.users.models import User
from apps.plans.models import Plan
from apps.products.models import Product
from apps.taxes.models import Tax
from django.utils import timezone

class SubscriptionStatus(models.TextChoices):
    DRAFT = 'draft', 'Draft'
    QUOTATION = 'quotation', 'Quotation'
    QUOTATION_SENT = 'quotation_sent', 'Quotation Sent'
    CONFIRMED = 'confirmed', 'Confirmed'
    ACTIVE = 'active', 'Active'
    CLOSED = 'closed', 'Closed'
    CANCELLED = 'cancelled', 'Cancelled'

class PaymentTerm(models.Model):
    name = models.CharField(max_length=100)
    due_days = models.PositiveIntegerField(default=0, help_text="Days after order date until due")
    is_first_payment_discount = models.BooleanField(default=False)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)

    def __str__(self):
        return self.name

class Subscription(models.Model):
    subscription_number = models.CharField(max_length=50, unique=True, blank=True)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True, blank=True)
    start_date = models.DateField(default=timezone.localdate)
    expiration_date = models.DateField(null=True, blank=True)
    payment_terms = models.ForeignKey(PaymentTerm, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=SubscriptionStatus.choices, default=SubscriptionStatus.DRAFT)
    notes = models.TextField(blank=True, null=True)
    
    def save(self, *args, **kwargs):
        if not self.subscription_number:
            date_str = timezone.now().strftime('%Y%m%d')
            # basic auto generation
            import random
            self.subscription_number = f"SUB-{date_str}-{random.randint(1000,9999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.subscription_number

class SubscriptionLine(models.Model):
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name='lines')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.ForeignKey(Tax, on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True)

    def save(self, *args, **kwargs):
        self.amount = self.unit_price * self.quantity
        super().save(*args, **kwargs)

class QuotationTemplate(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    validity_days = models.PositiveIntegerField(default=30)
    plan = models.ForeignKey(Plan, on_delete=models.SET_NULL, null=True, blank=True)
    payment_terms = models.ForeignKey(PaymentTerm, on_delete=models.SET_NULL, null=True, blank=True)

class QuotationTemplateLine(models.Model):
    template = models.ForeignKey(QuotationTemplate, on_delete=models.CASCADE, related_name='lines')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
