from rest_framework import permissions
from apps.users.models import Role

class RolePermission(permissions.BasePermission):
    """
    Checks if a user has the appropriate role.
    Usage in view config:
    required_roles = [Role.ADMIN, Role.INTERNAL_USER]
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
            
        required_roles = getattr(view, 'required_roles', None)
        if required_roles is None:
            return True # If not explicitly restricted, allow authenticated.
            
        return request.user.role in required_roles

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and request.user.role == Role.ADMIN
