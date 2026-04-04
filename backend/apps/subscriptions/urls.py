from django.urls import path, include
from rest_framework import routers
from .views import SubscriptionViewSet, QuotationTemplateViewSet, PaymentTermViewSet

router = routers.SimpleRouter()
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'quotation-templates', QuotationTemplateViewSet, basename='quotation-template')
router.register(r'payment-terms', PaymentTermViewSet, basename='payment-term')

urlpatterns = [
    path('', include(router.urls)),
]
