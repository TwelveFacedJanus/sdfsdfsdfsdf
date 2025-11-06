from rest_framework import serializers
from .models import UserFavourite
from django.conf import settings


class UserFavouriteSerializer(serializers.ModelSerializer):
    subscribed_to_fio = serializers.CharField(source='subscribed_to.fio', read_only=True)
    subscribed_to_email = serializers.CharField(source='subscribed_to.email', read_only=True)
    subscribed_to_nickname = serializers.CharField(source='subscribed_to.nickname', read_only=True)
    subscribed_to_rating = serializers.IntegerField(source='subscribed_to.rating', read_only=True)
    
    class Meta:
        model = UserFavourite
        fields = ['id', 'subscribed_to', 'subscribed_to_fio', 'subscribed_to_email', 
                 'subscribed_to_nickname', 'subscribed_to_rating', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserFavouriteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserFavourite
        fields = ['subscribed_to']
    
    def create(self, validated_data):
        # Автоматически устанавливаем подписчика из контекста запроса
        validated_data['subscriber'] = self.context['request'].user
        return super().create(validated_data)


class UserFavouriteListSerializer(serializers.ModelSerializer):
    subscribed_to_fio = serializers.CharField(source='subscribed_to.fio', read_only=True)
    subscribed_to_email = serializers.CharField(source='subscribed_to.email', read_only=True)
    subscribed_to_nickname = serializers.CharField(source='subscribed_to.nickname', read_only=True)
    subscribed_to_rating = serializers.IntegerField(source='subscribed_to.rating', read_only=True)
    subscribed_to_avatar = serializers.CharField(source='subscribed_to.base64_image', read_only=True)
    subscribed_to = serializers.UUIDField(source='subscribed_to.id', read_only=True)
    
    class Meta:
        model = UserFavourite
        fields = ['id', 'subscribed_to', 'subscribed_to_fio', 'subscribed_to_email', 
                 'subscribed_to_nickname', 'subscribed_to_rating', 'subscribed_to_avatar', 'created_at']


class SubscriberSerializer(serializers.ModelSerializer):
    subscriber_fio = serializers.CharField(source='subscriber.fio', read_only=True)
    subscriber_email = serializers.CharField(source='subscriber.email', read_only=True)
    subscriber_nickname = serializers.CharField(source='subscriber.nickname', read_only=True)
    subscriber_rating = serializers.IntegerField(source='subscriber.rating', read_only=True)
    
    class Meta:
        model = UserFavourite
        fields = ['id', 'subscriber_fio', 'subscriber_email', 
                 'subscriber_nickname', 'subscriber_rating', 'created_at']
