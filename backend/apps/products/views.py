from rest_framework import viewsets
from rest_framework.pagination import PageNumberPagination
from .models import Product, ProductVariant
from .serializers import ProductSerializer, ProductVariantSerializer
from apps.users.permissions import IsAdminOrReadOnly


class OptionalPageNumberPagination(PageNumberPagination):
    """Only paginate when ?page= is present in the request.
    This keeps dropdown/select endpoints (no ?page=) returning flat arrays."""
    page_size = 12
    page_size_query_param = 'page_size'
    max_page_size = 100

    def paginate_queryset(self, queryset, request, view=None):
        if 'page' not in request.query_params:
            return None
        return super().paginate_queryset(queryset, request, view)


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]
    pagination_class = OptionalPageNumberPagination

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True)
        product_type = self.request.query_params.get('type')
        if product_type:
            qs = qs.filter(product_type=product_type)
        recurring = self.request.query_params.get('recurring')
        if recurring == 'true':
            qs = qs.filter(is_recurring=True)
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(name__icontains=search)
        limit = self.request.query_params.get('limit')
        if limit:
            try:
                qs = qs[:int(limit)]
            except ValueError:
                pass
        return qs


class ProductVariantViewSet(viewsets.ModelViewSet):
    serializer_class = ProductVariantSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        return ProductVariant.objects.filter(product_id=self.kwargs['product_pk'])

    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_pk')
        serializer.save(product_id=product_id)
