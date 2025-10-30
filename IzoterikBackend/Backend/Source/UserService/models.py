from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid


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
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'fio']
    
    class Meta:
        verbose_name = "Пользователь"
        verbose_name_plural = "Пользователи"
    
    def __str__(self):
        return f"{self.fio} ({self.email})"