from django.contrib import admin
from .models import Post, Comment


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'rating', 'views_count', 'comments_count', 'is_published', 'created_at')
    list_filter = ('category', 'is_published', 'created_at', 'author')
    search_fields = ('title', 'preview_text', 'author__fio', 'author__email')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at', 'updated_at', 'views_count', 'comments_count')
    
    fieldsets = (
        (None, {
            'fields': ('title', 'preview_text', 'author')
        }),
        ('Контент', {
            'fields': ('content', 'preview_image_link', 'category', 'rating', 'is_published')
        }),
        ('Статистика', {
            'fields': ('views_count', 'comments_count'),
            'classes': ('collapse',)
        }),
        ('Системная информация', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Оптимизация запросов"""
        return super().get_queryset(request).select_related('author')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('post', 'author', 'text_short', 'is_reply', 'parent', 'is_deleted', 'created_at')
    list_filter = ('is_deleted', 'created_at', 'post__category')
    search_fields = ('text', 'author__fio', 'author__email', 'post__title')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        (None, {
            'fields': ('post', 'author', 'parent')
        }),
        ('Контент', {
            'fields': ('text', 'is_deleted')
        }),
        ('Системная информация', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def text_short(self, obj):
        """Показывать сокращенный текст"""
        return obj.text[:50] + '...' if len(obj.text) > 50 else obj.text
    text_short.short_description = 'Текст'
    
    def is_reply(self, obj):
        """Проверяет, является ли комментарий ответом"""
        return obj.parent is not None
    is_reply.boolean = True
    is_reply.short_description = 'Ответ'
    
    def get_queryset(self, request):
        """Оптимизация запросов"""
        return super().get_queryset(request).select_related('author', 'post', 'parent')