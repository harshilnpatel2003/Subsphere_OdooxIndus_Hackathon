from rest_framework import views
from rest_framework.response import Response
from apps.subscriptions.models import Subscription, SubscriptionStatus
from apps.invoices.models import Invoice, InvoiceStatus
from apps.payments.models import Payment
from django.db.models import Sum
from django.utils import timezone

class SummaryReportView(views.APIView):
    def get(self, request):
        now = timezone.now()
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0)
        
        active_subs = Subscription.objects.filter(status=SubscriptionStatus.ACTIVE).count()
        total_revenue = Payment.objects.filter(status='success').aggregate(Sum('amount'))['amount__sum'] or 0
        
        outstanding_invoices = Invoice.objects.filter(status=InvoiceStatus.CONFIRMED).count()
        overdue_amount = Invoice.objects.filter(status=InvoiceStatus.CONFIRMED, due_date__lt=now.date()).aggregate(Sum('total'))['total__sum'] or 0
        
        new_subs_month = Subscription.objects.filter(start_date__gte=this_month_start).count()
        payments_month = Payment.objects.filter(status='success', paid_at__gte=this_month_start).aggregate(Sum('amount'))['amount__sum'] or 0
        
        return Response({
            "active_subscriptions": active_subs,
            "total_revenue": float(total_revenue),
            "outstanding_invoices": outstanding_invoices,
            "overdue_amount": float(overdue_amount),
            "new_subscriptions_this_month": new_subs_month,
            "payments_this_month": float(payments_month)
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
