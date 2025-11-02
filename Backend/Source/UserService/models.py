from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid
from django.utils import timezone
from datetime import timedelta
import secrets


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    fio = models.CharField(max_length=255, verbose_name="ФИО")
    email = models.EmailField(unique=True, verbose_name="Email")
    nickname = models.CharField(max_length=100, null=True, blank=True, verbose_name="Никнейм")
    date_of_birth = models.DateField(null=True, blank=True, verbose_name="Дата рождения")
    country = models.CharField(max_length=100, null=True, blank=True, default='Россия', verbose_name="Страна")
    language = models.CharField(max_length=10, null=True, blank=True, default='ru', verbose_name="Язык")
    rating = models.PositiveIntegerField(default=0, verbose_name="Рейтинг")
    base64_image = models.TextField(null=True, blank=True, verbose_name="Аватарка (Base64)")
    
    # Subscription fields
    is_subscribed = models.BooleanField(default=False, verbose_name="Подписка активна")
    subscribe_expired = models.DateTimeField(null=True, blank=True, verbose_name="Дата окончания подписки")
    
    # Notification settings
    notification_email = models.BooleanField(default=True, verbose_name="Email уведомления")
    notification_push = models.BooleanField(default=True, verbose_name="Push уведомления")
    notification_inherit = models.BooleanField(default=True, verbose_name="Наследовать настройки уведомлений")
    
    # Email confirmation
    is_email_verified = models.BooleanField(default=False, verbose_name="Email подтвержден")
    email_verification_token = models.CharField(max_length=64, null=True, blank=True, verbose_name="Токен подтверждения email")
    email_verification_token_expires = models.DateTimeField(null=True, blank=True, verbose_name="Срок действия токена")
    
    # Password reset
    password_reset_token = models.CharField(max_length=64, null=True, blank=True, verbose_name="Токен сброса пароля")
    password_reset_token_expires = models.DateTimeField(null=True, blank=True, verbose_name="Срок действия токена сброса")
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'fio']
    
    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"
    
    def __str__(self):
        return f"{self.fio} ({self.email})"
    
    def generate_email_verification_token(self):
        """Генерация токена для подтверждения email"""
        self.email_verification_token = secrets.token_urlsafe(32)
        self.email_verification_token_expires = timezone.now() + timedelta(days=1)
        self.save()
        return self.email_verification_token
    
    def verify_email_token(self, token):
        """Проверка токена подтверждения email"""
        if self.email_verification_token == token and self.email_verification_token_expires:
            if timezone.now() <= self.email_verification_token_expires:
                self.is_email_verified = True
                self.email_verification_token = None
                self.email_verification_token_expires = None
                self.save()
                return True
        return False
    
    def generate_password_reset_token(self):
        """Генерация токена для сброса пароля"""
        self.password_reset_token = secrets.token_urlsafe(32)
        self.password_reset_token_expires = timezone.now() + timedelta(hours=1)
        self.save()
        return self.password_reset_token
    
    def verify_password_reset_token(self, token):
        """Проверка токена сброса пароля"""
        if self.password_reset_token == token and self.password_reset_token_expires:
            if timezone.now() <= self.password_reset_token_expires:
                return True
        return False