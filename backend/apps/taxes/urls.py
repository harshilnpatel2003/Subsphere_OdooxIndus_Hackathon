from django.urls import path, include
from rest_framework import routers
from .views import TaxViewSet

router = routers.SimpleRouter()
router.register(r'taxes', TaxViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
