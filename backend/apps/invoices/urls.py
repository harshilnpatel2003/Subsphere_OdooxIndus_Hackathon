from django.urls import path, include
from rest_framework import routers
from .views import InvoiceViewSet

router = routers.SimpleRouter()
router.register(r'invoices', InvoiceViewSet, basename='invoice')

urlpatterns = [
    path('', include(router.urls)),
]
