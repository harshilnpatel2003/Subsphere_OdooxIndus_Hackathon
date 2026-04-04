import traceback
from rest_framework.test import force_authenticate
from django.test import RequestFactory
from apps.users.models import User
from apps.subscriptions.views import SubscriptionViewSet

with open('debug_trace.txt', 'w') as f:
    try:
        user = User.objects.first()
        factory = RequestFactory()
        request = factory.post('/api/subscriptions/', {'customer': user.id, 'status': 'quotation', 'lines': [{'product': 1, 'quantity': 1, 'unit_price': 10}]}, content_type='application/json')
        force_authenticate(request, user=user)

        view = SubscriptionViewSet.as_view({'post': 'create'})
        response = view(request)
        f.write(f"Status Code: {response.status_code}")
    except Exception as e:
        traceback.print_exc(file=f)
