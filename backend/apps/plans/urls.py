from django.urls import path, include
from rest_framework import routers
from .views import PlanViewSet

router = routers.SimpleRouter()
router.register(r'plans', PlanViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
