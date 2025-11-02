from django.contrib import admin
from django.utils.html import format_html
from .models import UserFavourite


@admin.register(UserFavourite)
class UserFavouriteAdmin(admin.ModelAdmin):
    list_display = ('subscriber', 'subscribed_to', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('subscriber__fio', 'subscriber__email', 'subscribed_to__fio', 'subscribed_to__email')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at')
    date_hierarchy = 'created_at'
    list_per_page = 25
    
    fieldsets = (
        (None, {
            'fields': ('subscriber', 'subscribed_to')
        }),
        ('Системная информация', {
            'fields': ('id', 'created_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Оптимизация запросов"""
        return super().get_queryset(request).select_related('subscriber', 'subscribed_to')