from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.urls import reverse
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('avatar', 'email', 'fio', 'nickname', 'country', 'language', 'rating', 'is_subscribed', 'is_email_verified', 'is_active', 'is_staff', 'date_joined', 'view_profile_button')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'country', 'language', 'is_subscribed', 'is_email_verified', 'notification_email', 'notification_push', 'date_joined')
    search_fields = ('email', 'fio', 'nickname')
    ordering = ('-date_joined',)
    date_hierarchy = 'date_joined'
    list_per_page = 25
    actions = ['make_active', 'make_inactive', 'verify_email']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Персональная информация', {'fields': ('fio', 'nickname', 'date_of_birth', 'country', 'language', 'rating', 'avatar_display')}),
        ('Подписка', {'fields': ('is_subscribed', 'subscribe_expired')}),
        ('Настройки уведомлений', {'fields': ('notification_email', 'notification_push', 'notification_inherit')}),
        ('Email подтверждение', {'fields': ('is_email_verified', 'email_verification_token', 'email_verification_token_expires')}),
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
    
    readonly_fields = ('date_joined', 'last_login', 'email_verification_token', 'email_verification_token_expires', 'avatar_display')
    
    def view_profile_button(self, obj):
        """Кнопка просмотра профиля пользователя"""
        if obj.pk:
            profile_url = f"http://103.228.171.39:3000/profile"
            return format_html(
                '<a href="{}" target="_blank" class="button" style="padding: 5px 10px; background: #417690; color: white; text-decoration: none; border-radius: 3px;">👤 Профиль</a>',
                profile_url
            )
        return '-'
    view_profile_button.short_description = 'Профиль'
    
    def avatar(self, obj):
        """Отображение аватара в списке"""
        if obj.base64_image:
            return format_html(
                '<img src="{}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;" />',
                obj.base64_image
            )
        return '👤'
    avatar.short_description = '🖼️'
    
    def avatar_display(self, obj):
        """Отображение аватара в форме редактирования"""
        if obj.base64_image:
            return format_html(
                '<img src="{}" style="max-width: 150px; max-height: 150px; border-radius: 10px;" />',
                obj.base64_image
            )
        return 'Аватар не установлен'
    avatar_display.short_description = 'Аватар'
    
    @admin.action(description='Активировать выбранных пользователей')
    def make_active(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} пользователей активировано.')
    
    @admin.action(description='Деактивировать выбранных пользователей')
    def make_inactive(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} пользователей деактивировано.')
    
    @admin.action(description='Подтвердить email выбранных пользователей')
    def verify_email(self, request, queryset):
        updated = queryset.update(is_email_verified=True)
        self.message_user(request, f'Email {updated} пользователей подтверждено.')