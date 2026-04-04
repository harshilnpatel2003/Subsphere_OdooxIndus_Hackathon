from rest_framework import serializers
from .models import Subscription, SubscriptionLine, QuotationTemplate, QuotationTemplateLine

class SubscriptionLineSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionLine
        fields = ('id', 'product', 'quantity', 'unit_price', 'tax', 'amount')
        read_only_fields = ('amount',)

class SubscriptionSerializer(serializers.ModelSerializer):
    lines = SubscriptionLineSerializer(many=True, required=False)

    class Meta:
        model = Subscription
        fields = ('id', 'subscription_number', 'customer', 'plan', 'start_date', 'expiration_date', 'payment_terms', 'status', 'lines')
        read_only_fields = ('subscription_number', 'status')

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
