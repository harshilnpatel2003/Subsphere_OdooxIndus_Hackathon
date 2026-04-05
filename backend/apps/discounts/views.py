from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Discount
import datetime
from django.utils import timezone
from .serializers import DiscountSerializer
from apps.users.permissions import IsAdminOrReadOnly

class DiscountViewSet(viewsets.ModelViewSet):
    queryset = Discount.objects.all()
    serializer_class = DiscountSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def validate(self, request):
        code = request.data.get('code')
        cart_total = request.data.get('cart_total', 0)
        try:
            cart_total = float(cart_total)
        except ValueError:
            return Response({'error': 'Invalid cart_total'}, status=400)
            
        discount = Discount.objects.filter(code__iexact=code).first()
        if not discount:
            return Response({'error': 'Invalid code'}, status=400)

        # Date validation
        today = datetime.date.today()
        if discount.start_date and discount.start_date > today:
            return Response({'error': 'This promotional code is not yet active.'}, status=400)
        if discount.end_date and discount.end_date < today:
            return Response({'error': 'This promotional code has expired.'}, status=400)
            
        if discount.usage_limit and discount.current_usage >= discount.usage_limit:
            return Response({'error': 'Usage limit reached'}, status=400)

        # Per-user usage check
        if discount.max_uses_per_user:
            from apps.discounts.models import DiscountUsage
            user_usage = DiscountUsage.objects.filter(discount=discount, user=request.user).count()
            if user_usage >= discount.max_uses_per_user:
                return Response({'error': f'You have already used this code the maximum allowed times ({discount.max_uses_per_user})'}, status=400)
            
        if cart_total < float(discount.min_purchase):
            return Response({'error': f'Minimum purchase of ₹{discount.min_purchase} required'}, status=400)
            
        amount_off = 0
        if discount.discount_type == 'fixed':
            amount_off = float(discount.value)
        else: # percentage
            amount_off = cart_total * float(discount.value) / 100.0
            
        return Response({
            'discount_id': discount.id,
            'discount_code': discount.code,
            'discount_amount': amount_off,
            'discount_type': discount.discount_type,
            'discount_value': float(discount.value),
            'max_uses_per_user': discount.max_uses_per_user,
        })
