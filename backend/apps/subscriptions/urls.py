from django.urls import path, include
from rest_framework import routers
from .views import SubscriptionViewSet, QuotationTemplateViewSet

router = routers.SimpleRouter()
router.register(r'subscriptions', SubscriptionViewSet)
router.register(r'quotation-templates', QuotationTemplateViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
