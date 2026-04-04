from django.urls import path, include
from rest_framework import routers
from .views import SubscriptionViewSet, QuotationTemplateViewSet

router = routers.SimpleRouter()
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'quotation-templates', QuotationTemplateViewSet, basename='quotation-template')

urlpatterns = [
    path('', include(router.urls)),
]
