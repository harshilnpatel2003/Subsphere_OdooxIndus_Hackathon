from django.urls import path
from .views import (
    CreateOrderView, VerifyPaymentView, PaymentListView,
    SyncPlanView, CreateSubscriptionView, VerifySubscriptionView,
    RazorpayWebhookView,
)

urlpatterns = [
    path('payments/', PaymentListView.as_view(), name='payment-list'),
    path('payments/create-order/', CreateOrderView.as_view(), name='payment-create-order'),
    path('payments/verify/', VerifyPaymentView.as_view(), name='payment-verify'),
    path('payments/sync-plan/', SyncPlanView.as_view(), name='payment-sync-plan'),
    path('payments/create-subscription/', CreateSubscriptionView.as_view(), name='payment-create-subscription'),
    path('payments/verify-subscription/', VerifySubscriptionView.as_view(), name='payment-verify-subscription'),
    path('payments/webhook/', RazorpayWebhookView.as_view(), name='payment-webhook'),
]
