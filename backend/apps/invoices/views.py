from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Invoice, InvoiceStatus
from .serializers import InvoiceSerializer
from django.http import HttpResponse


class InvoiceViewSet(viewsets.ModelViewSet):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Invoice.objects.all()
        # Portal users only see their own invoices
        from apps.users.models import Role
        if self.request.user.role == Role.PORTAL_USER:
            qs = qs.filter(customer=self.request.user)
        # Filter by subscription
        sub_id = self.request.query_params.get('subscription')
        if sub_id:
            qs = qs.filter(subscription_id=sub_id)
        return qs

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        invoice = self.get_object()
        invoice.status = InvoiceStatus.CONFIRMED
        invoice.save()
        return Response({'status': 'confirmed'})

    @action(detail=True, methods=['get'])
    def pdf(self, request, pk=None):
        invoice = self.get_object()
        lines_html = ''.join(
            f"<tr><td>{l.description}</td><td>{l.quantity}</td><td>₹{l.unit_price}</td><td>{l.tax_rate}%</td><td>₹{l.amount}</td></tr>"
            for l in invoice.lines.all()
        )
        html = f"""<html><body style='font-family:sans-serif;margin:40px'>
        <h1>Invoice {invoice.invoice_number}</h1>
        <p>Customer: {invoice.customer.email}</p>
        <p>Status: {invoice.status}</p>
        <table border='1' cellpadding='8' style='border-collapse:collapse;width:100%'>
          <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Tax</th><th>Amount</th></tr>
          {lines_html}
        </table>
        <hr/>
        <p>Subtotal: ₹{invoice.subtotal}</p>
        <p>Tax: ₹{invoice.tax_amount}</p>
        <p><strong>Total: ₹{invoice.total}</strong></p>
        </body></html>"""
        return HttpResponse(html, content_type='text/html')
