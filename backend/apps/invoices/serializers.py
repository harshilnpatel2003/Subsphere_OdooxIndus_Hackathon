from rest_framework import serializers
from .models import Invoice, InvoiceLine

class InvoiceLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceLine
        fields = '__all__'

class InvoiceSerializer(serializers.ModelSerializer):
    lines = InvoiceLineSerializer(many=True, required=False)
    subscription_number = serializers.ReadOnlyField(source='subscription.subscription_number')
    customer_name = serializers.ReadOnlyField(source='customer.username')
    customer_email = serializers.ReadOnlyField(source='customer.email')
    plan_name = serializers.ReadOnlyField(source='subscription.plan.name')

    class Meta:
        model = Invoice
        fields = '__all__'
