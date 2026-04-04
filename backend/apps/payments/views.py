from rest_framework import views, status
from rest_framework.response import Response
from apps.invoices.models import Invoice, InvoiceStatus
from apps.subscriptions.models import SubscriptionStatus
from .models import Payment
from django.conf import settings
from django.utils import timezone
import razorpay

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

class CreateOrderView(views.APIView):
    def post(self, request):
        invoice_id = request.data.get('invoice_id')
        try:
            invoice = Invoice.objects.get(id=invoice_id)
        except Invoice.DoesNotExist:
            return Response({'error': 'Invoice not found'}, status=404)
        
        amount_paise = int(invoice.total * 100)
        data = {
            "amount": amount_paise,
            "currency": "INR",
            "receipt": f"receipt_{invoice.id}"
        }
        order = client.order.create(data=data)
        
        return Response({
            'razorpay_order_id': order['id'],
            'amount': order['amount'],
            'key_id': settings.RAZORPAY_KEY_ID
        })

class VerifyPaymentView(views.APIView):
    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')
        invoice_id = request.data.get('invoice_id')
        
        try:
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })
        except razorpay.errors.SignatureVerificationError:
            # Maybe skip hard verification for local dev if they enter dummy data
            if settings.DEBUG and razorpay_signature == 'dummy':
                pass
            else:
                return Response({'error': 'Invalid signature'}, status=400)
        
        invoice = Invoice.objects.get(id=invoice_id)
        
        Payment.objects.create(
            invoice=invoice,
            razorpay_order_id=razorpay_order_id,
            razorpay_payment_id=razorpay_payment_id,
            amount=invoice.total,
            paid_at=timezone.now(),
            status='success'
        )
        
        invoice.status = InvoiceStatus.PAID
        invoice.save()
        
        if invoice.subscription and invoice.subscription.status != SubscriptionStatus.ACTIVE:
            invoice.subscription.status = SubscriptionStatus.ACTIVE
            invoice.subscription.save()
            
        return Response({'status': 'payment verified'})
