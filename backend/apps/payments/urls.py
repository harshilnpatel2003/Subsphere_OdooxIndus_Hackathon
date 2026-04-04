from django.urls import path
from .views import CreateOrderView, VerifyPaymentView, PaymentListView

urlpatterns = [
    path('payments/', PaymentListView.as_view(), name='payment-list'),
    path('payments/create-order/', CreateOrderView.as_view(), name='payment-create-order'),
    path('payments/verify/', VerifyPaymentView.as_view(), name='payment-verify'),
]
