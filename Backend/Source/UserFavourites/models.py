from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
import uuid


class UserFavourite(models.Model):
    """
    Подписки пользователей друг на друга
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subscriber = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='subscriptions',
        verbose_name="Подписчик"
    )
    subscribed_to = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='subscribers',
        verbose_name="На кого подписан"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата подписки")
    
    class Meta:
        verbose_name = "Подписка пользователя"
        verbose_name_plural = "Подписки пользователей"
        unique_together = ('subscriber', 'subscribed_to')  # Предотвращает дублирование
        ordering = ['-created_at']  # Сортировка по времени (новые сверху)
    
    def clean(self):
        """Валидация: пользователь не может подписаться сам на себя"""
        if self.subscriber == self.subscribed_to:
            raise ValidationError("Пользователь не может подписаться сам на себя")
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.subscriber.fio} подписан на {self.subscribed_to.fio}"