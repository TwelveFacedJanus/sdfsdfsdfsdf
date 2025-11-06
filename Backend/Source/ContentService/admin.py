from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from django.db import models
from django.forms import Textarea
from .models import Post, Comment, PrivacyPolicy, PostRating


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('title_short', 'author', 'category', 'rating', 'views_count', 'comments_count', 'is_published', 'created_at', 'action_buttons')
    list_filter = ('category', 'is_published', 'created_at', 'author', 'rating')
    search_fields = ('title', 'preview_text', 'author__fio', 'author__email')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at', 'updated_at', 'views_count', 'comments_count', 'preview_image')
    date_hierarchy = 'created_at'
    actions = ['make_published', 'make_unpublished']
    list_per_page = 25
    
    fieldsets = (
        (None, {
            'fields': ('title', 'preview_text', 'author')
        }),
        ('Контент', {
            'fields': ('content', 'preview_image', 'preview_image_link', 'category', 'rating', 'is_published')
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
    
    def title_short(self, obj):
        """Сокращенный заголовок для списка"""
        return obj.title[:50] + '...' if len(obj.title) > 50 else obj.title
    title_short.short_description = 'Заголовок'
    
    def preview_image(self, obj):
        """Отображение превью изображения"""
        if obj.preview_image_link:
            return format_html(
                '<img src="{}" style="max-width: 200px; max-height: 200px; border-radius: 5px;" />',
                obj.preview_image_link
            )
        return 'Нет изображения'
    preview_image.short_description = 'Превью'
    
    def action_buttons(self, obj):
        """Кнопки действий"""
        if obj.pk:
            view_url = f"http://103.228.171.39:3000/posts/{obj.id}"
            edit_frontend_url = f"http://103.228.171.39:3000/edit-content/{obj.id}"
            edit_admin_url = reverse('admin:ContentService_post_change', args=[obj.pk])
            return format_html(
                '<div style="display: flex; gap: 5px; flex-wrap: wrap;">'
                '<a href="{}" target="_blank" class="button" style="padding: 5px 10px; background: #417690; color: white; text-decoration: none; border-radius: 3px; white-space: nowrap;">👁️ Посмотреть</a>'
                '<a href="{}" target="_blank" class="button" style="padding: 5px 10px; background: #70BF2B; color: white; text-decoration: none; border-radius: 3px; white-space: nowrap;">✏️ Frontend</a>'
                '<a href="{}" class="button" style="padding: 5px 10px; background: #BA55D3; color: white; text-decoration: none; border-radius: 3px; white-space: nowrap;">⚙️ Admin</a>'
                '</div>',
                view_url,
                edit_frontend_url,
                edit_admin_url
            )
        return '-'
    action_buttons.short_description = 'Действия'
    
    @admin.action(description='Опубликовать выбранные посты')
    def make_published(self, request, queryset):
        updated = queryset.update(is_published=True)
        self.message_user(request, f'{updated} постов опубликовано.')
    
    @admin.action(description='Снять с публикации выбранные посты')
    def make_unpublished(self, request, queryset):
        updated = queryset.update(is_published=False)
        self.message_user(request, f'{updated} постов снято с публикации.')
    
    class Media:
        css = {
            'all': ('admin/css/custom.css',)
        }


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('post', 'author', 'text_short', 'is_reply', 'parent', 'is_deleted', 'created_at', 'view_post_button')
    list_filter = ('is_deleted', 'created_at', 'post__category')
    search_fields = ('text', 'author__fio', 'author__email', 'post__title')
    ordering = ('-created_at',)
    readonly_fields = ('id', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'
    actions = ['mark_as_deleted', 'mark_as_not_deleted']
    
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
    
    def view_post_button(self, obj):
        """Кнопка просмотра поста"""
        if obj.post:
            view_url = f"http://103.228.171.39:3000/posts/{obj.post.id}"
            return format_html(
                '<a href="{}" target="_blank" class="button" style="padding: 5px 10px; background: #417690; color: white; text-decoration: none; border-radius: 3px;">📄 Пост</a>',
                view_url
            )
        return '-'
    view_post_button.short_description = 'Пост'
    
    @admin.action(description='Пометить как удаленные')
    def mark_as_deleted(self, request, queryset):
        updated = queryset.update(is_deleted=True)
        self.message_user(request, f'{updated} комментариев помечено как удаленные.')
    
    @admin.action(description='Восстановить комментарии')
    def mark_as_not_deleted(self, request, queryset):
        updated = queryset.update(is_deleted=False)
        self.message_user(request, f'{updated} комментариев восстановлено.')
    
    def get_queryset(self, request):
        """Оптимизация запросов"""
        return super().get_queryset(request).select_related('author', 'post', 'parent')


@admin.register(PrivacyPolicy)
class PrivacyPolicyAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'updated_at', 'created_at', 'view_policy_button')
    list_filter = ('is_active', 'created_at', 'updated_at')
    search_fields = ('title', 'content')
    readonly_fields = ('id', 'created_at', 'updated_at')
    date_hierarchy = 'updated_at'
    actions = ['make_active', 'make_inactive']
    
    fieldsets = (
        (None, {
            'fields': ('title', 'is_active')
        }),
        ('Содержание', {
            'fields': ('content',),
            'description': 'Введите HTML-контент политики конфиденциальности. Можно использовать HTML-теги для форматирования.'
        }),
        ('Системная информация', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    formfield_overrides = {
        models.TextField: {'widget': Textarea(attrs={'rows': 30, 'cols': 100, 'style': 'font-family: monospace;'})},
    }
    
    def view_policy_button(self, obj):
        """Кнопка просмотра политики на фронтенде"""
        if obj.pk:
            view_url = f"http://103.228.171.39:3000/privacy-policy"
            return format_html(
                '<a href="{}" target="_blank" class="button" style="padding: 5px 10px; background: #417690; color: white; text-decoration: none; border-radius: 3px;">👁️ Посмотреть</a>',
                view_url
            )
        return '-'
    view_policy_button.short_description = 'Просмотр'
    
    @admin.action(description='Активировать выбранные политики')
    def make_active(self, request, queryset):
        # Деактивируем все остальные политики
        PrivacyPolicy.objects.filter(is_active=True).update(is_active=False)
        # Активируем выбранные
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} политик(и) активировано. Остальные деактивированы.')
    
    @admin.action(description='Деактивировать выбранные политики')
    def make_inactive(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} политик(и) деактивировано.')
    
    def save_model(self, request, obj, form, change):
        """При сохранении, если это новая активная политика, деактивируем остальные"""
        if obj.is_active:
            PrivacyPolicy.objects.filter(is_active=True).exclude(pk=obj.pk).update(is_active=False)
        super().save_model(request, obj, form, change)


@admin.register(PostRating)
class PostRatingAdmin(admin.ModelAdmin):
    list_display = ('post', 'user', 'rating', 'created_at', 'updated_at')
    list_filter = ('rating', 'created_at', 'post__category')
    search_fields = ('post__title', 'user__email', 'user__fio')
    readonly_fields = ('id', 'created_at', 'updated_at')
    ordering = ('-created_at',)
    date_hierarchy = 'created_at'
    list_per_page = 50