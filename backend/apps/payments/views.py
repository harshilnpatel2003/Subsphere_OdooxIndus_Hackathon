from rest_framework import views, status, serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from apps.invoices.models import Invoice, InvoiceStatus
from apps.subscriptions.models import SubscriptionStatus
from .models import Payment
from django.conf import settings
from django.utils import timezone
import razorpay

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'


class PaymentListView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Payment.objects.all()
        invoice_id = self.request.query_params.get('invoice')
        if invoice_id:
            qs = qs.filter(invoice_id=invoice_id)
        return qs


class CreateOrderView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        invoice_id = request.data.get('invoice_id')
        try:
            invoice = Invoice.objects.get(id=invoice_id)
        except Invoice.DoesNotExist:
            return Response({'error': 'Invoice not found'}, status=404)

        # If the invoice already has a razorpay_order_id, try to use it
        if invoice.razorpay_order_id and not invoice.razorpay_order_id.startswith('order_mock_'):
            return Response({
                'razorpay_order_id': invoice.razorpay_order_id,
                'amount': max(int(float(invoice.total) * 100), 100),
                'key_id': settings.RAZORPAY_KEY_ID,
                'invoice_id': invoice.id,
                'currency': 'INR',
            })

        amount_paise = max(int(float(invoice.total) * 100), 100)  # Razorpay minimum 1 INR
        data = {
            "amount": amount_paise,
            "currency": "INR",
            "receipt": f"receipt_{invoice.id}"
        }
        try:
            order = client.order.create(data=data)
        except Exception as e:
            # For dev without real Razorpay keys, return a mock order
            order = {
                'id': f'order_mock_{invoice.id}',
                'amount': amount_paise,
            }

        # Store the razorpay order id on the invoice
        invoice.razorpay_order_id = order['id']
        invoice.save()

        return Response({
            'razorpay_order_id': order['id'],
            'amount': order['amount'],
            'key_id': settings.RAZORPAY_KEY_ID,
            'invoice_id': invoice.id,
            'currency': 'INR',
        })


class VerifyPaymentView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')
        invoice_id = request.data.get('invoice_id')

        if not invoice_id:
            return Response({'error': 'invoice_id required'}, status=400)

        try:
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })
        except Exception:
            # Allow dummy flow in DEBUG mode
            if not settings.DEBUG:
                return Response({'error': 'Invalid signature'}, status=400)

        try:
            invoice = Invoice.objects.get(id=invoice_id)
        except Invoice.DoesNotExist:
            return Response({'error': 'Invoice not found'}, status=404)

        Payment.objects.create(
            invoice=invoice,
            razorpay_order_id=razorpay_order_id or 'mock',
            razorpay_payment_id=razorpay_payment_id or 'mock',
            amount=invoice.total,
            paid_at=timezone.now(),
            status='success'
        )

        invoice.status = InvoiceStatus.PAID
        invoice.razorpay_payment_id = razorpay_payment_id or 'mock'
        invoice.save()

        if invoice.subscription and invoice.subscription.status != SubscriptionStatus.ACTIVE:
            invoice.subscription.status = SubscriptionStatus.ACTIVE
            invoice.subscription.save()

        return Response({'status': 'payment verified', 'invoice_id': invoice.id})
