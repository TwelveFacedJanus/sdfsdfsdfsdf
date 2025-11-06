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
    
    ACCESSIBILITY_CHOICES = [
        ('subscribers', 'Подписчикам'),
        ('all', 'Всем'),
        ('my_subscribers', 'Всем моим подписчикам'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, verbose_name="Заголовок")
    preview_text = models.TextField(verbose_name="Превью текст")
    content = models.TextField(default="", verbose_name="Markdown контент")
    preview_image_link = models.TextField(null=True, blank=True, verbose_name="Ссылка на превью изображение (URL или base64)")
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
    accessibility = models.CharField(
        max_length=20,
        choices=ACCESSIBILITY_CHOICES,
        default='all',
        verbose_name="Кому доступен для просмотра"
    )
    
    class Meta:
        verbose_name = "Пост"
        verbose_name_plural = "Посты"
        ordering = ['-created_at']  # Сортировка по времени (новые сверху)
    
    def __str__(self):
        return f"{self.title} - {self.author.fio}"
    
    def save(self, *args, **kwargs):
        """Переопределяем save для обновления рейтинга автора при изменении поста"""
        super().save(*args, **kwargs)
        # Обновляем рейтинг автора при сохранении поста
        self.update_author_rating()
    
    def update_author_rating(self):
        """Обновляет рейтинг автора на основе среднего рейтинга всех его опубликованных постов"""
        from django.db.models import Avg
        # Получаем средний рейтинг всех опубликованных постов автора
        avg_rating = Post.objects.filter(
            author=self.author,
            is_published=True
        ).aggregate(Avg('rating'))['rating__avg']
        
        if avg_rating is not None and avg_rating > 0:
            # Округляем до целого числа (так как User.rating - PositiveIntegerField)
            # Но умножаем на 10 для сохранения одного знака после запятой (4.5 -> 45)
            # Или можно просто округлить до целого
            self.author.rating = round(avg_rating * 10)  # Сохраняем как целое число * 10 (4.5 -> 45)
        else:
            self.author.rating = 0
        
        self.author.save(update_fields=['rating'])


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


class PostRating(models.Model):
    """
    Оценки пользователей для постов
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='ratings',
        verbose_name="Пост"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='post_ratings',
        verbose_name="Пользователь"
    )
    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        validators=[MinValueValidator(0.0), MaxValueValidator(5.0)],
        verbose_name="Оценка"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    
    class Meta:
        verbose_name = "Оценка поста"
        verbose_name_plural = "Оценки постов"
        unique_together = ['post', 'user']  # Один пользователь может оценить пост только один раз
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.fio} - {self.rating}/5 - {self.post.title}"
    
    def save(self, *args, **kwargs):
        """Пересчитываем средний рейтинг поста при сохранении"""
        super().save(*args, **kwargs)
        self.update_post_rating()
    
    def delete(self, *args, **kwargs):
        """Пересчитываем средний рейтинг поста при удалении"""
        post = self.post  # Сохраняем ссылку на пост перед удалением
        author = post.author  # Сохраняем ссылку на автора
        super().delete(*args, **kwargs)
        # Обновляем рейтинг после удаления
        from django.db.models import Avg
        avg_rating = PostRating.objects.filter(post=post).aggregate(Avg('rating'))['rating__avg']
        if avg_rating is not None:
            post.rating = round(avg_rating, 1)
        else:
            post.rating = 0.0
        post.save(update_fields=['rating'])
        # Обновляем рейтинг автора
        post.update_author_rating()
    
    def update_post_rating(self):
        """Обновляет средний рейтинг поста на основе всех оценок"""
        from django.db.models import Avg
        avg_rating = PostRating.objects.filter(post=self.post).aggregate(Avg('rating'))['rating__avg']
        if avg_rating is not None:
            self.post.rating = round(avg_rating, 1)
        else:
            self.post.rating = 0.0
        self.post.save(update_fields=['rating'])
        # Обновляем рейтинг автора
        self.post.update_author_rating()


class PrivacyPolicy(models.Model):
    """
    Политика конфиденциальности
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, default="Политика конфиденциальности", verbose_name="Заголовок")
    content = models.TextField(verbose_name="Содержание (HTML)")
    is_active = models.BooleanField(default=True, verbose_name="Активна")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")
    
    class Meta:
        verbose_name = "Политика конфиденциальности"
        verbose_name_plural = "Политики конфиденциальности"
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"{self.title} (обновлено: {self.updated_at.strftime('%d.%m.%Y %H:%M')})"
    
    @classmethod
    def get_active(cls):
        """Получить активную политику конфиденциальности"""
        return cls.objects.filter(is_active=True).first()