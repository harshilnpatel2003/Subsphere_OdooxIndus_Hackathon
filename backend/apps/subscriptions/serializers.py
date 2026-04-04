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

    class Meta:
        model = Subscription
        fields = ('id', 'subscription_number', 'customer', 'plan', 'start_date', 'expiration_date', 'payment_terms', 'status', 'lines')
        read_only_fields = ('subscription_number',)

    def create(self, validated_data):
        lines_data = validated_data.pop('lines', [])
        subscription = Subscription.objects.create(**validated_data)
        for line_data in lines_data:
            SubscriptionLine.objects.create(subscription=subscription, **line_data)
        return subscription

class QuotationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuotationTemplate
        fields = '__all__'
