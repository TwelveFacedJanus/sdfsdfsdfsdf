from django.contrib import admin
from django.utils.html import format_html
from .models import UserStory


@admin.register(UserStory)
class UserStoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'content_short', 'category', 'created_at')
    list_filter = ('category', 'created_at', 'user')
    search_fields = ('user__fio', 'user__email', 'content')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at')
    date_hierarchy = 'created_at'
    list_per_page = 25
    
    fieldsets = (
        (None, {
            'fields': ('user', 'content', 'category')
        }),
        ('Системная информация', {
            'fields': ('id', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    def content_short(self, obj):
        """Показывать сокращенное содержание"""
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_short.short_description = 'Содержание'
    
    def get_queryset(self, request):
        """Оптимизация запросов"""
        return super().get_queryset(request).select_related('user')