from django.urls import path
from .views import CreateOrderView, VerifyPaymentView

urlpatterns = [
    path('payments/create-order/', CreateOrderView.as_view(), name='payment-create-order'),
    path('payments/verify/', VerifyPaymentView.as_view(), name='payment-verify'),
]
