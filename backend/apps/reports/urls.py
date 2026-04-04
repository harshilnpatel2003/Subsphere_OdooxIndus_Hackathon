from django.urls import path
from .views import SummaryReportView, RevenueReportView, SubscriptionReportView

urlpatterns = [
    path('reports/summary/', SummaryReportView.as_view(), name='report-summary'),
    path('reports/revenue/', RevenueReportView.as_view(), name='report-revenue'),
    path('reports/subscriptions/', SubscriptionReportView.as_view(), name='report-subscriptions'),
]
