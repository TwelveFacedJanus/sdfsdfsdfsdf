from rest_framework import serializers
from .models import UserStory


class UserStorySerializer(serializers.ModelSerializer):
    user_fio = serializers.CharField(source='user.fio', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = UserStory
        fields = ['id', 'user', 'user_fio', 'content', 'category', 'category_display', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserStoryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStory
        fields = ['content', 'category']
    
    def create(self, validated_data):
        # Автоматически устанавливаем пользователя из контекста запроса
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class UserStoryListSerializer(serializers.ModelSerializer):
    user_fio = serializers.CharField(source='user.fio', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = UserStory
        fields = ['id', 'user_fio', 'content', 'category', 'category_display', 'created_at']
