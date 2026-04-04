from django.urls import path, include
from rest_framework import routers
from .views import DiscountViewSet

router = routers.SimpleRouter()
router.register(r'discounts', DiscountViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
