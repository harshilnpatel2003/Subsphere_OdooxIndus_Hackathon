from rest_framework import views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.subscriptions.models import Subscription, SubscriptionStatus
from apps.invoices.models import Invoice, InvoiceStatus
from apps.payments.models import Payment
from apps.products.models import Product
from django.db.models import Sum, Count
from django.utils import timezone

class SummaryReportView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        now = timezone.now()
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0)

        active_subs = Subscription.objects.filter(status=SubscriptionStatus.ACTIVE).count()
        total_revenue = Payment.objects.filter(status='success').aggregate(Sum('amount'))['amount__sum'] or 0

        outstanding_invoices = Invoice.objects.filter(status=InvoiceStatus.CONFIRMED).count()
        overdue_amount = Invoice.objects.filter(status=InvoiceStatus.CONFIRMED, due_date__lt=now.date()).aggregate(Sum('total'))['total__sum'] or 0

        new_subs_month = Subscription.objects.filter(start_date__gte=this_month_start).count()
        payments_month = Payment.objects.filter(status='success', paid_at__gte=this_month_start).aggregate(Sum('amount'))['amount__sum'] or 0

        # Revenue Mix by Plan
        revenue_mix = {}
        for p in Payment.objects.filter(status='success').select_related('invoice__subscription__plan'):
            if p.invoice and p.invoice.subscription and p.invoice.subscription.plan:
                p_name = p.invoice.subscription.plan.name
            else:
                p_name = 'One-time / Custom'
            revenue_mix[p_name] = revenue_mix.get(p_name, 0) + float(p.amount)

        revenue_by_plan = [{"label": k, "amount": v} for k, v in revenue_mix.items()]
        revenue_by_plan.sort(key=lambda x: x["amount"], reverse=True)

        # Subscription status breakdown
        status_counts = {}
        for choice in SubscriptionStatus.values:
            count = Subscription.objects.filter(status=choice).count()
            if count > 0:
                status_counts[choice] = count

        # Total cost of products sold (sum of cost_price × quantity from subscription lines)
        from apps.subscriptions.models import SubscriptionLine
        cost_data = SubscriptionLine.objects.select_related('product').aggregate(
            total_cost=Sum('product__cost_price')
        )
        total_cost = float(cost_data['total_cost'] or 0)
        total_profit = float(total_revenue) - total_cost

        return Response({
            "active_subscriptions": active_subs,
            "total_revenue": float(total_revenue),
            "total_cost": total_cost,
            "total_profit": total_profit,
            "outstanding_invoices": outstanding_invoices,
            "overdue_amount": float(overdue_amount),
            "new_subscriptions_this_month": new_subs_month,
            "payments_this_month": float(payments_month),
            "revenue_by_plan": revenue_by_plan,
            "subscription_status_breakdown": [{"label": k, "count": v} for k, v in status_counts.items()],
        })

class RevenueReportView(views.APIView):
    def get(self, request):
        return Response([
            {"month": "January", "amount": 1000},
            {"month": "February", "amount": 1500},
            {"month": "March", "amount": 2000},
        ])

class SubscriptionReportView(views.APIView):
    def get(self, request):
        status_param = request.query_params.get('status')
        qs = Subscription.objects.all()
        if status_param:
            qs = qs.filter(status=status_param)
        return Response([{"id": sub.id, "sub_num": sub.subscription_number, "status": sub.status} for sub in qs])

