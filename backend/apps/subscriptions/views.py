from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Subscription, SubscriptionStatus, QuotationTemplate
from .serializers import SubscriptionSerializer, QuotationTemplateSerializer
from apps.invoices.models import Invoice, InvoiceLine, InvoiceStatus

class SubscriptionViewSet(viewsets.ModelViewSet):
    queryset = Subscription.objects.all()
    serializer_class = SubscriptionSerializer

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        sub = self.get_object()
        if sub.status not in [SubscriptionStatus.DRAFT, SubscriptionStatus.QUOTATION]:
            return Response({'error': 'Can only confirm draft/quotation'}, status=status.HTTP_400_BAD_REQUEST)
        
        sub.status = SubscriptionStatus.ACTIVE
        sub.save()
        
        invoice = Invoice.objects.create(
            subscription=sub,
            customer=sub.customer,
            status=InvoiceStatus.DRAFT
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

        return Response({'status': 'confirmed', 'invoice_id': invoice.id})

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
        # simplistic renew
        sub.status = SubscriptionStatus.ACTIVE
        sub.save()
        return Response({'status': 'renewed'})

class QuotationTemplateViewSet(viewsets.ModelViewSet):
    queryset = QuotationTemplate.objects.all()
    serializer_class = QuotationTemplateSerializer

    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        template = self.get_object()
        if 'customer_id' not in request.data:
            return Response({'error': 'customer_id required'}, status=400)
            
        sub = Subscription.objects.create(
            customer_id=request.data['customer_id'],
            plan=template.plan,
            status=SubscriptionStatus.QUOTATION,
            payment_terms=f"Valid for {template.validity_days} days"
        )
        # Also copy lines realistically
        from .models import SubscriptionLine
        for line in template.lines.all():
            SubscriptionLine.objects.create(
                subscription=sub,
                product=line.product,
                quantity=line.quantity,
                unit_price=line.product.sales_price,
            )
        return Response({'subscription_id': sub.id})
