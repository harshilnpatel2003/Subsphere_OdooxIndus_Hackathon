from rest_framework import viewsets
from .models import Tax
from .serializers import TaxSerializer
from apps.users.permissions import IsAdminOrReadOnly

class TaxViewSet(viewsets.ModelViewSet):
    queryset = Tax.objects.all()
    serializer_class = TaxSerializer
    permission_classes = [IsAdminOrReadOnly]
