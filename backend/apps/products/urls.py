from django.urls import path, include
from rest_framework_nested import routers
from .views import ProductViewSet, ProductVariantViewSet

router = routers.SimpleRouter()
router.register(r'products', ProductViewSet)

products_router = routers.NestedSimpleRouter(router, r'products', lookup='product')
products_router.register(r'variants', ProductVariantViewSet, basename='product-variants')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(products_router.urls)),
]
