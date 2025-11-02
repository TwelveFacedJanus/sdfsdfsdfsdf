from django.contrib import admin
from .models import Post


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