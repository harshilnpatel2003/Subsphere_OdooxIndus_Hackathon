from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Subscription, SubscriptionStatus, QuotationTemplate, SubscriptionLine
from .serializers import SubscriptionSerializer, QuotationTemplateSerializer
from apps.invoices.models import Invoice, InvoiceLine, InvoiceStatus
from apps.users.models import Role


class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Subscription.objects.all()
        user = self.request.user
        # Portal users can only see their own subscriptions
        if user.role == Role.PORTAL_USER:
            qs = qs.filter(customer=user)
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        sub_id = self.request.query_params.get('subscription')
        if sub_id:
            qs = qs.filter(id=sub_id)
        return qs

    def perform_create(self, serializer):
        # If portal user, force customer to themselves
        if self.request.user.role == Role.PORTAL_USER:
            serializer.save(customer=self.request.user)
        else:
            serializer.save()

    def _generate_invoice(self, sub):
        invoice = Invoice.objects.create(
            subscription=sub,
            customer=sub.customer,
            status=InvoiceStatus.CONFIRMED,
        )
        subtotal = 0
        tax_total = 0
        for line in sub.lines.all():
            InvoiceLine.objects.create(
                invoice=invoice,
                description=line.product.name,
                quantity=line.quantity,
                unit_price=line.unit_price,
                tax_rate=line.tax.rate if line.tax else 0,
                amount=line.amount
            )
            subtotal += line.amount
            if line.tax:
                tax_total += (line.amount * line.tax.rate / 100)
        invoice.subtotal = subtotal
        invoice.tax_amount = tax_total
        invoice.total = subtotal + tax_total
        invoice.save()
        return invoice

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        sub = self.get_object()
        if sub.status not in [SubscriptionStatus.DRAFT, SubscriptionStatus.QUOTATION]:
            return Response({'error': 'Can only confirm draft/quotation'}, status=status.HTTP_400_BAD_REQUEST)
        sub.status = SubscriptionStatus.ACTIVE
        sub.save()
        invoice = self._generate_invoice(sub)
        return Response({'status': 'confirmed', 'invoice_id': invoice.id})

    @action(detail=False, methods=['post'], url_path='from-cart')
    def from_cart(self, request):
        """Accept cart items, create one subscription + auto-confirm + generate invoice."""
        items = request.data.get('items', [])
        plan_id = request.data.get('plan_id')
        if not items:
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        sub = Subscription.objects.create(
            customer=request.user,
            plan_id=plan_id if plan_id else None,
            status=SubscriptionStatus.DRAFT,
        )

        for item in items:
            SubscriptionLine.objects.create(
                subscription=sub,
                product_id=item['productId'],
                quantity=item.get('quantity', 1),
                unit_price=item['unitPrice'],
                tax_id=item.get('taxId') or None,
            )

        # Auto-confirm
        sub.status = SubscriptionStatus.ACTIVE
        sub.save()
        invoice = self._generate_invoice(sub)

        return Response({
            'subscription_id': sub.id,
            'subscription_number': sub.subscription_number,
            'invoice_id': invoice.id,
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        sub = self.get_object()
        if sub.plan and not sub.plan.closable:
            return Response({'error': 'Plan not closable'}, status=400)
        sub.status = SubscriptionStatus.CLOSED
        sub.save()
        return Response({'status': 'closed'})

    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        sub = self.get_object()
        if sub.plan and not sub.plan.pausable:
            return Response({'error': 'Plan not pausable'}, status=400)
        return Response({'status': 'paused'})

    @action(detail=True, methods=['post'])
    def renew(self, request, pk=None):
        sub = self.get_object()
        if sub.plan and not sub.plan.renewable:
            return Response({'error': 'Plan not renewable'}, status=400)
        sub.status = SubscriptionStatus.ACTIVE
        sub.save()
        return Response({'status': 'renewed'})


class QuotationTemplateViewSet(viewsets.ModelViewSet):
    queryset = QuotationTemplate.objects.all()
    serializer_class = QuotationTemplateSerializer

    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        template = self.get_object()
        customer_id = request.data.get('customer_id') or request.user.id
        sub = Subscription.objects.create(
            customer_id=customer_id,
            plan=template.plan,
            status=SubscriptionStatus.QUOTATION,
            payment_terms=f"Valid for {template.validity_days} days"
        )
        for line in template.lines.all():
            SubscriptionLine.objects.create(
                subscription=sub,
                product=line.product,
                quantity=line.quantity,
                unit_price=line.product.sales_price,
            )
        return Response({'subscription_id': sub.id})
