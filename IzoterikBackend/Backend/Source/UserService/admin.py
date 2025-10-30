from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'fio', 'nickname', 'country', 'language', 'rating', 'is_subscribed', 'is_active', 'is_staff', 'date_joined')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'country', 'language', 'is_subscribed', 'notification_email', 'notification_push', 'date_joined')
    search_fields = ('email', 'fio', 'nickname')
    ordering = ('email',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Персональная информация', {'fields': ('fio', 'nickname', 'date_of_birth', 'country', 'language', 'rating')}),
        ('Подписка', {'fields': ('is_subscribed', 'subscribe_expired')}),
        ('Настройки уведомлений', {'fields': ('notification_email', 'notification_push', 'notification_inherit')}),
        ('Права доступа', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Важные даты', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'fio', 'password1', 'password2'),
        }),
    )