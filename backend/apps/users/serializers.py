from rest_framework import serializers
from apps.users.models import User, Role
from django.contrib.auth.password_validation import validate_password

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    name = serializers.CharField(source='first_name', required=True)

    class Meta:
        model = User
        fields = ('email', 'name', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            role=Role.PORTAL_USER
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name')
    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'role')

class InternalUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    
    class Meta:
        model = User
        fields = ('email', 'first_name', 'password', 'role')
    
    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            role=validated_data.get('role', Role.INTERNAL_USER)
        )
        return user

class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'phone', 'role', 'manager_request_pending', 'created_at')
        read_only_fields = ('email', 'role', 'manager_request_pending', 'created_at')

class UserListSerializer(serializers.ModelSerializer):
    active_subscriptions = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'manager_request_pending', 'created_at', 'active_subscriptions')
        read_only_fields = ('id', 'email', 'first_name', 'last_name', 'role', 'manager_request_pending', 'created_at', 'active_subscriptions')

class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_new_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_new_password']:
            raise serializers.ValidationError({'new_password': 'Passwords do not match.'})
        return attrs
