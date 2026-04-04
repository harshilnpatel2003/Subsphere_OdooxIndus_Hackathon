from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Count, Q
from .serializers import (
    RegisterSerializer, UserSerializer, InternalUserCreateSerializer,
    PasswordResetSerializer, UserProfileSerializer, ChangePasswordSerializer,
    UserListSerializer
)
from .models import User, Role
from .permissions import RolePermission
import uuid


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


class PasswordResetView(views.APIView):
    permission_classes = (AllowAny,)
    serializer_class = PasswordResetSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        user = User.objects.filter(email=email).first()
        if user:
            token = str(uuid.uuid4())
            return Response({'token': token, 'message': 'Use this token to reset password.'})
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


class UserListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, RolePermission]
    required_roles = [Role.ADMIN]

    def get_queryset(self):
        return User.objects.annotate(
            active_subscriptions=Count(
                'subscriptions',
                filter=Q(subscriptions__status='active')
            )
        ).order_by('-created_at')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return InternalUserCreateSerializer
        return UserListSerializer


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user
        if not user.check_password(serializer.validated_data['current_password']):
            return Response({'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({'message': 'Password changed successfully.'})

class RequestManagerRoleView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        if user.role == Role.PORTAL_USER:
            user.manager_request_pending = True
            user.save()
            return Response({'message': 'Manager role requested.'})
        return Response({'error': 'Only portal users can request manager role.'}, status=status.HTTP_400_BAD_REQUEST)

class ApproveManagerRoleView(generics.UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, RolePermission]
    required_roles = [Role.ADMIN]

    def post(self, request, pk=None):
        user = self.get_object()
        if user.manager_request_pending:
            user.role = Role.MANAGER
            user.manager_request_pending = False
            user.save()
            return Response({'message': 'User approved as manager.'})
        return Response({'error': 'User has not requested manager role.'}, status=status.HTTP_400_BAD_REQUEST)


class RejectManagerRoleView(generics.UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, RolePermission]
    required_roles = [Role.ADMIN]

    def post(self, request, pk=None):
        user = self.get_object()
        if user.manager_request_pending:
            user.manager_request_pending = False
            user.save()
            return Response({'message': 'Manager request rejected.'})
        return Response({'error': 'User has not requested manager role.'}, status=status.HTTP_400_BAD_REQUEST)


class RevokeManagerRoleView(generics.UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, RolePermission]
    required_roles = [Role.ADMIN]

    def post(self, request, pk=None):
        user = self.get_object()
        if user.role in (Role.MANAGER, 'internal_user'):
            user.role = Role.PORTAL_USER
            user.save()
            return Response({'message': 'Manager role revoked. User is now a Customer.'})
        return Response({'error': 'User is not a manager.'}, status=status.HTTP_400_BAD_REQUEST)
