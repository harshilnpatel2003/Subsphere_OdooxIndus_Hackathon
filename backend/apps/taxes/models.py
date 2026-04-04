from django.db import models

class TaxType(models.TextChoices):
    GST = 'GST', 'GST'
    VAT = 'VAT', 'VAT'
    CUSTOM = 'custom', 'Custom'

class Tax(models.Model):
    name = models.CharField(max_length=255)
    rate = models.DecimalField(max_digits=5, decimal_places=2)
    tax_type = models.CharField(max_length=20, choices=TaxType.choices, default=TaxType.GST)

    def __str__(self):
        return f"{self.name} ({self.rate}%)"
