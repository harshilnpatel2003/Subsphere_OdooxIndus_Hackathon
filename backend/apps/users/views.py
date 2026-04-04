from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import (
    RegisterSerializer, UserSerializer, InternalUserCreateSerializer,
    PasswordResetSerializer, UserProfileSerializer, ChangePasswordSerializer
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


class InternalUserCreateView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = InternalUserCreateSerializer
    permission_classes = [IsAuthenticated, RolePermission]
    required_roles = [Role.ADMIN]


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
