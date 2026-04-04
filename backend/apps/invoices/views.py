from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Invoice, InvoiceStatus
from .serializers import InvoiceSerializer
from django.http import HttpResponse

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        invoice = self.get_object()
        invoice.status = InvoiceStatus.CONFIRMED
        invoice.save()
        return Response({'status': 'confirmed'})
        
    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        invoice = self.get_object()
        html = f"<html><body style='font-family:sans-serif; margin: 40px;'><h1>Invoice {invoice.invoice_number}</h1><p>Customer: {invoice.customer.email}</p><p>Total Amount: INR {invoice.total}</p></body></html>"
        return HttpResponse(html, content_type='text/html')
