from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class Post(models.Model):
    """
    Контент-посты пользователей
    """
    CATEGORY_CHOICES = [
        ('esoterics', 'Эзотерика'),
        ('astrology', 'Астрология'),
        ('tarot', 'Таро'),
        ('numerology', 'Нумерология'),
        ('meditation', 'Медитация'),
        ('spirituality', 'Духовность'),
        ('other', 'Другое'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, verbose_name="Заголовок")
    preview_text = models.TextField(verbose_name="Превью текст")
    content = models.TextField(default="", verbose_name="Markdown контент")
    preview_image_link = models.URLField(max_length=500, null=True, blank=True, verbose_name="Ссылка на превью изображение")
    rating = models.DecimalField(
        max_digits=2, 
        decimal_places=1, 
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)],
        verbose_name="Рейтинг"
    )
    comments_count = models.PositiveIntegerField(default=0, verbose_name="Количество комментариев")
    views_count = models.BigIntegerField(default=0, verbose_name="Количество просмотров")
    category = models.CharField(
        max_length=20, 
        choices=CATEGORY_CHOICES, 
        verbose_name="Категория"
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='posts',
        verbose_name="Автор"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    is_published = models.BooleanField(default=True, verbose_name="Опубликован")
    
    class Meta:
        verbose_name = "Пост"
        verbose_name_plural = "Посты"
        ordering = ['-created_at']  # Сортировка по времени (новые сверху)
    
    def __str__(self):
        return f"{self.title} - {self.author.fio}"


class Comment(models.Model):
    """
    Комментарии к постам
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name="Пост"
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name="Автор"
    )
    text = models.TextField(verbose_name="Текст комментария")
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies',
        verbose_name="Родительский комментарий"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    is_deleted = models.BooleanField(default=False, verbose_name="Удален")
    
    class Meta:
        verbose_name = "Комментарий"
        verbose_name_plural = "Комментарии"
        ordering = ['created_at']  # Сортировка по времени создания
    
    def __str__(self):
        return f"Комментарий от {self.author.fio} к посту {self.post.title}"
    
    @property
    def is_reply(self):
        """Проверяет, является ли комментарий ответом"""
        return self.parent is not None