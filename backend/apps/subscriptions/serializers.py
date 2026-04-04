from rest_framework import serializers
from .models import Subscription, SubscriptionLine, QuotationTemplate, QuotationTemplateLine, PaymentTerm

class PaymentTermSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTerm
        fields = '__all__'

class SubscriptionLineSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    product_photo = serializers.SerializerMethodField()

    class Meta:
        model = SubscriptionLine
        fields = ('id', 'product', 'product_name', 'product_photo', 'quantity', 'unit_price', 'tax', 'amount')
        read_only_fields = ('amount',)

    def get_product_photo(self, obj):
        request = self.context.get('request')
        if obj.product.photo:
            url = obj.product.photo.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return None

class SubscriptionSerializer(serializers.ModelSerializer):
    lines = SubscriptionLineSerializer(many=True, required=False)
    customer_name = serializers.ReadOnlyField(source='customer.username', default=None)
    plan_name = serializers.ReadOnlyField(source='plan.name', default=None)
    payment_terms_name = serializers.ReadOnlyField(source='payment_terms.name', default=None)

    class Meta:
        model = Subscription
        fields = ('id', 'subscription_number', 'customer', 'customer_name', 'plan', 'plan_name', 'start_date', 'expiration_date', 'payment_terms', 'payment_terms_name', 'status', 'notes', 'lines')
        read_only_fields = ('subscription_number',)

    def create(self, validated_data):
        lines_data = validated_data.pop('lines', [])
        subscription = Subscription.objects.create(**validated_data)
        for line_data in lines_data:
            SubscriptionLine.objects.create(subscription=subscription, **line_data)
        return subscription

    def update(self, instance, validated_data):
        lines_data = validated_data.pop('lines', None)
        
        # Update main fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update lines if provided
        if lines_data is not None:
            # Simple approach: clear and recreation or map by ID. 
            # For simplicity in this UI, we'll assume we send the full set of lines.
            instance.lines.all().delete()
            for line_data in lines_data:
                SubscriptionLine.objects.create(subscription=instance, **line_data)
        
        return instance

class QuotationTemplateLineSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')

    class Meta:
        model = QuotationTemplateLine
        fields = ('id', 'product', 'product_name', 'quantity')

class QuotationTemplateSerializer(serializers.ModelSerializer):
    lines = QuotationTemplateLineSerializer(many=True, read_only=True)
    plan_name = serializers.ReadOnlyField(source='plan.name', default=None)
    plan_billing_period = serializers.ReadOnlyField(source='plan.billing_period', default=None)
    payment_terms_name = serializers.ReadOnlyField(source='payment_terms.name', default=None)

    class Meta:
        model = QuotationTemplate
        fields = ('id', 'name', 'description', 'validity_days', 'plan', 'plan_name', 'plan_billing_period', 'payment_terms', 'payment_terms_name', 'lines')
