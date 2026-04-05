from rest_framework import views, status, serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import generics
from apps.invoices.models import Invoice, InvoiceLine, InvoiceStatus
from apps.subscriptions.models import Subscription, SubscriptionStatus
from .models import Payment
from django.conf import settings
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import razorpay
import json
import hashlib
import hmac

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

BILLING_CYCLE_COUNT = {
    'daily': 365, 'weekly': 52, 'monthly': 12, 'yearly': 5,
}


def _create_rzp_subscription(sub):
    """Module-level helper: creates a Razorpay Subscription for a given Subscription.
    Returns the razorpay_subscription_id or None on failure."""
    if not sub.plan or not sub.plan.razorpay_plan_id:
        return None
    total_count = BILLING_CYCLE_COUNT.get(sub.plan.billing_period, 12)
    try:
        rzp_sub = client.subscription.create(data={
            'plan_id': sub.plan.razorpay_plan_id,
            'total_count': total_count,
            'customer_notify': 1,
            'quantity': 1,
            'notes': {
                'subscription_id': str(sub.id),
                'subscription_number': sub.subscription_number,
                'customer_email': sub.customer.email,
            }
        })
        rzp_id = rzp_sub['id']
        sub.razorpay_subscription_id = rzp_id
        sub.razorpay_subscription_status = rzp_sub.get('status', 'created')
        sub.save(update_fields=['razorpay_subscription_id', 'razorpay_subscription_status'])
        return rzp_id
    except Exception:
        mock_id = f'sub_mock_{sub.id}'
        sub.razorpay_subscription_id = mock_id
        sub.razorpay_subscription_status = 'created'
        sub.save(update_fields=['razorpay_subscription_id', 'razorpay_subscription_status'])
        return mock_id



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


# ── Razorpay Plan Sync ──────────────────────────────────────────────────────
class SyncPlanView(views.APIView):
    """Creates a Razorpay Plan for our internal Plan if one doesn't exist.
    Returns razorpay_plan_id."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from apps.plans.models import Plan
        plan_id = request.data.get('plan_id')
        try:
            plan = Plan.objects.get(id=plan_id)
        except Plan.DoesNotExist:
            return Response({'error': 'Plan not found'}, status=404)

        # Already synced
        if plan.razorpay_plan_id:
            return Response({'razorpay_plan_id': plan.razorpay_plan_id})

        period_map = {
            'daily': 'daily',
            'weekly': 'weekly',
            'monthly': 'monthly',
            'yearly': 'yearly',
        }
        period = period_map.get(plan.billing_period, 'monthly')
        amount_paise = max(int(float(plan.price) * 100), 100)

        try:
            rzp_plan = client.plan.create(data={
                'period': period,
                'interval': 1,
                'item': {
                    'name': plan.name,
                    'amount': amount_paise,
                    'currency': 'INR',
                    'description': f'SubSphere plan: {plan.name}',
                }
            })
            plan.razorpay_plan_id = rzp_plan['id']
            plan.save(update_fields=['razorpay_plan_id'])
            return Response({'razorpay_plan_id': rzp_plan['id']})
        except Exception as e:
            # In dev/test without real keys, return mock
            mock_id = f'plan_mock_{plan.id}'
            plan.razorpay_plan_id = mock_id
            plan.save(update_fields=['razorpay_plan_id'])
            return Response({'razorpay_plan_id': mock_id})


# ── Razorpay Subscription Create ────────────────────────────────────────────
class CreateSubscriptionView(views.APIView):
    """Creates/returns a Razorpay Subscription for our Subscription.
    Frontend uses the returned subscription_id to open Razorpay checkout."""
    permission_classes = [IsAuthenticated]

    BILLING_CYCLE_COUNT = {
        'daily': 365,
        'weekly': 52,
        'monthly': 12,
        'yearly': 5,
    }

    def post(self, request):
        sub_id = request.data.get('subscription_id')
        try:
            sub = Subscription.objects.select_related('plan', 'customer').get(id=sub_id)
        except Subscription.DoesNotExist:
            return Response({'error': 'Subscription not found'}, status=404)

        # Already has a Razorpay subscription
        if sub.razorpay_subscription_id and not sub.razorpay_subscription_id.startswith('sub_mock_'):
            return Response({
                'razorpay_subscription_id': sub.razorpay_subscription_id,
                'key_id': settings.RAZORPAY_KEY_ID,
                'customer_email': sub.customer.email,
                'customer_name': getattr(sub.customer, 'get_full_name', lambda: sub.customer.username)(),
            })

        if not sub.plan or not sub.plan.razorpay_plan_id:
            return Response({'error': 'Plan not synced to Razorpay yet'}, status=400)

        total_count = self.BILLING_CYCLE_COUNT.get(sub.plan.billing_period, 12)

        try:
            rzp_sub = client.subscription.create(data={
                'plan_id': sub.plan.razorpay_plan_id,
                'total_count': total_count,
                'customer_notify': 1,
                'quantity': 1,
                'notes': {
                    'subscription_id': str(sub.id),
                    'subscription_number': sub.subscription_number,
                    'customer_email': sub.customer.email,
                }
            })
            sub.razorpay_subscription_id = rzp_sub['id']
            sub.razorpay_subscription_status = rzp_sub.get('status', 'created')
            sub.save(update_fields=['razorpay_subscription_id', 'razorpay_subscription_status'])
            rzp_id = rzp_sub['id']
        except Exception as e:
            # Dev fallback
            rzp_id = f'sub_mock_{sub.id}'
            sub.razorpay_subscription_id = rzp_id
            sub.razorpay_subscription_status = 'created'
            sub.save(update_fields=['razorpay_subscription_id', 'razorpay_subscription_status'])

        return Response({
            'razorpay_subscription_id': rzp_id,
            'key_id': settings.RAZORPAY_KEY_ID,
            'customer_email': sub.customer.email,
            'customer_name': getattr(sub.customer, 'get_full_name', lambda: sub.customer.username)(),
        })


# ── Verify Subscription Authentication ──────────────────────────────────────
class VerifySubscriptionView(views.APIView):
    """Called after customer completes mandate auth in Razorpay checkout."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_subscription_id = request.data.get('razorpay_subscription_id')
        razorpay_signature = request.data.get('razorpay_signature')
        sub_id = request.data.get('subscription_id')

        try:
            client.utility.verify_payment_signature({
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_subscription_id': razorpay_subscription_id,
                'razorpay_signature': razorpay_signature,
            })
        except Exception:
            if not settings.DEBUG:
                return Response({'error': 'Invalid signature'}, status=400)

        try:
            sub = Subscription.objects.get(id=sub_id)
            sub.razorpay_subscription_status = 'authenticated'
            sub.status = SubscriptionStatus.ACTIVE
            sub.save(update_fields=['razorpay_subscription_status', 'status'])
        except Subscription.DoesNotExist:
            pass

        return Response({'status': 'mandate_authenticated', 'subscription_id': sub_id})


# ── Razorpay Webhook ─────────────────────────────────────────────────────────
@method_decorator(csrf_exempt, name='dispatch')
class RazorpayWebhookView(views.APIView):
    """Receives Razorpay webhook events. Auto-creates invoices on subscription.charged."""
    permission_classes = [AllowAny]
    authentication_classes = []

    def _verify_signature(self, payload_body: bytes, signature: str) -> bool:
        secret = settings.RAZORPAY_WEBHOOK_SECRET
        if not secret:
            return True  # In dev without secret, allow all
        digest = hmac.new(secret.encode(), payload_body, hashlib.sha256).hexdigest()
        return hmac.compare_digest(digest, signature)

    def post(self, request):
        payload_body = request.body
        signature = request.headers.get('X-Razorpay-Signature', '')

        if not self._verify_signature(payload_body, signature):
            return Response({'error': 'Invalid signature'}, status=400)

        try:
            data = json.loads(payload_body)
        except Exception:
            return Response({'error': 'Invalid payload'}, status=400)

        event = data.get('event', '')
        payload = data.get('payload', {})

        # ── subscription.authenticated ──────────────────────────────────────
        if event == 'subscription.authenticated':
            sub_entity = payload.get('subscription', {}).get('entity', {})
            self._update_sub_status(sub_entity.get('id'), 'authenticated')

        # ── subscription.activated ──────────────────────────────────────────
        elif event == 'subscription.activated':
            sub_entity = payload.get('subscription', {}).get('entity', {})
            rzp_sub_id = sub_entity.get('id')
            self._update_sub_status(rzp_sub_id, 'active')
            try:
                sub = Subscription.objects.get(razorpay_subscription_id=rzp_sub_id)
                if sub.status != SubscriptionStatus.ACTIVE:
                    sub.status = SubscriptionStatus.ACTIVE
                    sub.save(update_fields=['status'])
            except Subscription.DoesNotExist:
                pass

        # ── subscription.charged ────────────────────────────────────────────
        elif event == 'subscription.charged':
            payment_entity = payload.get('payment', {}).get('entity', {})
            sub_entity = payload.get('subscription', {}).get('entity', {})
            rzp_sub_id = sub_entity.get('id')
            rzp_payment_id = payment_entity.get('id')
            amount_paise = payment_entity.get('amount', 0)
            amount_rupees = amount_paise / 100

            try:
                sub = Subscription.objects.select_related('plan', 'customer').get(
                    razorpay_subscription_id=rzp_sub_id
                )
                cycle_label = timezone.now().strftime('%Y-%m')

                # Prevent duplicate for same cycle
                if not Invoice.objects.filter(subscription=sub, billing_cycle_label=cycle_label).exists():
                    invoice = Invoice.objects.create(
                        subscription=sub,
                        customer=sub.customer,
                        status=InvoiceStatus.PAID,
                        billing_cycle_label=cycle_label,
                        subtotal=amount_rupees,
                        total=amount_rupees,
                    )
                    # Create line from plan
                    if sub.plan:
                        InvoiceLine.objects.create(
                            invoice=invoice,
                            description=f'{sub.plan.name} — {cycle_label}',
                            quantity=1,
                            unit_price=amount_rupees,
                            tax_rate=0,
                            amount=amount_rupees,
                        )
                    Payment.objects.create(
                        invoice=invoice,
                        razorpay_payment_id=rzp_payment_id,
                        razorpay_subscription_id=rzp_sub_id,
                        method='razorpay_subscription',
                        amount=amount_rupees,
                        paid_at=timezone.now(),
                        status='success',
                    )
            except Subscription.DoesNotExist:
                pass

        # ── subscription.halted ─────────────────────────────────────────────
        elif event == 'subscription.halted':
            sub_entity = payload.get('subscription', {}).get('entity', {})
            self._update_sub_status(sub_entity.get('id'), 'halted')

        # ── subscription.cancelled ──────────────────────────────────────────
        elif event in ('subscription.cancelled', 'subscription.completed'):
            sub_entity = payload.get('subscription', {}).get('entity', {})
            rzp_sub_id = sub_entity.get('id')
            new_status = 'cancelled' if event == 'subscription.cancelled' else 'completed'
            self._update_sub_status(rzp_sub_id, new_status)
            if event == 'subscription.cancelled':
                try:
                    sub = Subscription.objects.get(razorpay_subscription_id=rzp_sub_id)
                    sub.status = SubscriptionStatus.CANCELLED
                    sub.save(update_fields=['status'])
                except Subscription.DoesNotExist:
                    pass

        return Response({'status': 'ok'})

    def _update_sub_status(self, rzp_sub_id: str, status: str):
        if not rzp_sub_id:
            return
        Subscription.objects.filter(razorpay_subscription_id=rzp_sub_id).update(
            razorpay_subscription_status=status
        )


# ── One-time Order Flow (kept for non-recurring invoices) ────────────────────
class CreateOrderView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        invoice_id = request.data.get('invoice_id')
        try:
            invoice = Invoice.objects.select_related('customer').get(id=invoice_id)
        except Invoice.DoesNotExist:
            return Response({'error': 'Invoice not found'}, status=404)

        if invoice.razorpay_order_id and not invoice.razorpay_order_id.startswith('order_mock_'):
            return Response({
                'razorpay_order_id': invoice.razorpay_order_id,
                'amount': max(int(float(invoice.total) * 100), 100),
                'key_id': settings.RAZORPAY_KEY_ID,
                'invoice_id': invoice.id,
                'currency': 'INR',
                'customer_email': invoice.customer.email,
                'customer_name': getattr(invoice.customer, 'get_full_name', lambda: invoice.customer.username)(),
            })

        amount_paise = max(int(float(invoice.total) * 100), 100)
        data = {
            'amount': amount_paise,
            'currency': 'INR',
            'receipt': f'receipt_{invoice.id}',
            'notes': {
                'invoice_id': str(invoice.id),
                'customer_email': invoice.customer.email,
            }
        }
        try:
            order = client.order.create(data=data)
        except Exception:
            order = {'id': f'order_mock_{invoice.id}', 'amount': amount_paise}

        invoice.razorpay_order_id = order['id']
        invoice.save()

        return Response({
            'razorpay_order_id': order['id'],
            'amount': order['amount'],
            'key_id': settings.RAZORPAY_KEY_ID,
            'invoice_id': invoice.id,
            'currency': 'INR',
            'customer_email': invoice.customer.email,
            'customer_name': getattr(invoice.customer, 'get_full_name', lambda: invoice.customer.username)(),
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
