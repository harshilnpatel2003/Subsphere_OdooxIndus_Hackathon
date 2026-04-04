from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.users.urls')),
    path('api/', include('apps.products.urls')),
    path('api/', include('apps.plans.urls')),
    path('api/', include('apps.taxes.urls')),
    path('api/', include('apps.subscriptions.urls')),
    path('api/', include('apps.discounts.urls')),
    path('api/', include('apps.invoices.urls')),
    path('api/', include('apps.payments.urls')),
    path('api/', include('apps.reports.urls')),
    path('api/docs/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
