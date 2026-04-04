from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('phone', 'role', 'manager_request_pending')}),
    )
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_staff', 'is_active', 'manager_request_pending')
    list_filter = ('role', 'is_staff', 'is_active', 'manager_request_pending', 'groups')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)
