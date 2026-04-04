from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, UserListCreateView, PasswordResetView, MeView, ChangePasswordView,
    RequestManagerRoleView, ApproveManagerRoleView, RejectManagerRoleView, RevokeManagerRoleView
)

urlpatterns = [
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/reset-password/', PasswordResetView.as_view(), name='reset_password'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('users/', UserListCreateView.as_view(), name='user_list_create'),
    path('users/me/', MeView.as_view(), name='me'),
    path('users/me/request-manager/', RequestManagerRoleView.as_view(), name='request_manager'),
    path('users/<int:pk>/approve-manager/', ApproveManagerRoleView.as_view(), name='approve_manager'),
    path('users/<int:pk>/reject-manager/', RejectManagerRoleView.as_view(), name='reject_manager'),
    path('users/<int:pk>/revoke-manager/', RevokeManagerRoleView.as_view(), name='revoke_manager'),
]
