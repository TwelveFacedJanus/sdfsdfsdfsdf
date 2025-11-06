from rest_framework import serializers
from .models import Post, Comment


class PostSerializer(serializers.ModelSerializer):
    author_fio = serializers.CharField(source='author.fio', read_only=True)
    author_nickname = serializers.CharField(source='author.nickname', read_only=True)
    author_rating = serializers.IntegerField(source='author.rating', read_only=True)
    author_avatar = serializers.CharField(source='author.base64_image', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    accessibility_display = serializers.CharField(source='get_accessibility_display', read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'preview_text', 'content', 'preview_image_link', 'rating', 'comments_count', 'views_count', 
                 'category', 'category_display', 'author', 'author_fio', 'author_nickname', 
                 'author_rating', 'author_avatar', 'created_at', 'updated_at', 'is_published', 'accessibility', 'accessibility_display']
        read_only_fields = ['id', 'comments_count', 'views_count', 'created_at', 'updated_at']


class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['title', 'preview_text', 'content', 'preview_image_link', 'rating', 'category', 'is_published', 'accessibility']
        extra_kwargs = {
            'preview_image_link': {'required': False, 'allow_null': True},
            'rating': {'required': False},
            'is_published': {'required': False},
            'accessibility': {'required': False},
        }
    
    def create(self, validated_data):
        # Автоматически устанавливаем автора из контекста запроса
        validated_data['author'] = self.context['request'].user
        
        # Преобразуем post_id в объект Post
        if 'post_id' in validated_data:
            from .models import Post
            validated_data['post'] = Post.objects.get(id=validated_data.pop('post_id'))
        
        # Преобразуем parent_id в объект Comment
        if 'parent_id' in validated_data:
            validated_data['parent'] = Comment.objects.get(id=validated_data.pop('parent_id'))
        
        return super().create(validated_data)


class PostListSerializer(serializers.ModelSerializer):
    author_fio = serializers.CharField(source='author.fio', read_only=True)
    author_nickname = serializers.CharField(source='author.nickname', read_only=True)
    author_rating = serializers.IntegerField(source='author.rating', read_only=True)
    author_avatar = serializers.CharField(source='author.base64_image', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'preview_text', 'preview_image_link', 'rating', 'comments_count', 'views_count', 
                 'category', 'category_display', 'author_fio', 'author_nickname', 
                 'author_rating', 'author_avatar', 'created_at', 'is_published']


class PostUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['title', 'preview_text', 'content', 'preview_image_link', 'rating', 'category', 'is_published', 'accessibility']
        extra_kwargs = {
            'title': {'required': False},
            'preview_text': {'required': False},
            'content': {'required': False},
            'preview_image_link': {'required': False},
            'rating': {'required': False},
            'category': {'required': False},
            'is_published': {'required': False},
            'accessibility': {'required': False}
        }


class CommentSerializer(serializers.ModelSerializer):
    author_fio = serializers.CharField(source='author.fio', read_only=True)
    author_avatar = serializers.CharField(source='author.base64_image', read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'text', 'author', 'author_fio', 'author_avatar', 'parent', 'created_at', 'updated_at', 'replies']
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
    
    def get_replies(self, obj):
        """Получает ответы на комментарий"""
        if obj.replies.exists():
            return CommentSerializer(obj.replies.filter(is_deleted=False), many=True).data
        return []


class CommentCreateSerializer(serializers.ModelSerializer):
    post_id = serializers.UUIDField(write_only=True, required=False)
    parent_id = serializers.UUIDField(write_only=True, required=False)
    
    class Meta:
        model = Comment
        fields = ['text', 'post_id', 'parent_id']
        extra_kwargs = {
            'post_id': {'required': False},
            'parent_id': {'required': False}
        }
    
    def create(self, validated_data):
        # Автоматически устанавливаем автора из контекста запроса
        validated_data['author'] = self.context['request'].user
        
        # Преобразуем post_id в объект Post
        if 'post_id' in validated_data:
            from .models import Post
            validated_data['post'] = Post.objects.get(id=validated_data.pop('post_id'))
        
        # Преобразуем parent_id в объект Comment
        if 'parent_id' in validated_data:
            validated_data['parent'] = Comment.objects.get(id=validated_data.pop('parent_id'))
        
        return super().create(validated_data)


class CommentListSerializer(serializers.ModelSerializer):
    author_fio = serializers.CharField(source='author.fio', read_only=True)
    author_avatar = serializers.CharField(source='author.base64_image', read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = Comment
        fields = ['id', 'text', 'author_fio', 'author_avatar', 'parent', 'created_at', 'replies']
    
    def get_replies(self, obj):
        """Получает ответы на комментарий"""
        if obj.replies.exists():
            return CommentListSerializer(obj.replies.filter(is_deleted=False), many=True).data
        return []
