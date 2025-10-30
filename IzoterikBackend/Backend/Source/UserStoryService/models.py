from django.db import models
from django.conf import settings
import uuid


class UserStory(models.Model):
    """
    История действий пользователя
    """
    CATEGORY_CHOICES = [
        ('subscription', 'Абонемент'),
        ('donation', 'Донат'),
        ('profile', 'Профиль'),
        ('rating', 'Рейтинг'),
        ('other', 'Другое'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        verbose_name="Пользователь"
    )
    content = models.TextField(verbose_name="Описание действия")
    category = models.CharField(
        max_length=20, 
        choices=CATEGORY_CHOICES, 
        verbose_name="Категория"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Время создания")
    
    class Meta:
        verbose_name = "История пользователя"
        verbose_name_plural = "Истории пользователей"
        ordering = ['-created_at']  # Сортировка по времени (новые сверху)
    
    def __str__(self):
        return f"{self.user.fio} - {self.get_category_display()} - {self.created_at.strftime('%d.%m.%Y %H:%M')}"