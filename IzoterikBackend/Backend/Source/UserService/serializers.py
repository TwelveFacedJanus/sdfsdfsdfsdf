from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserSignUpSerializer(serializers.ModelSerializer):
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['fio', 'email', 'password', 'password_confirm', 'nickname', 'date_of_birth', 'country', 'language']
        extra_kwargs = {
            'password': {'write_only': True},
            'nickname': {'required': False},
            'date_of_birth': {'required': False},
            'country': {'required': False},
            'language': {'required': False}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Пароли не совпадают")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['email'],  # Используем email как username
            email=validated_data['email'],
            fio=validated_data['fio'],
            password=validated_data['password']
        )
        return user


class UserSignInSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError("Неверные учетные данные")
            if not user.is_active:
                raise serializers.ValidationError("Аккаунт деактивирован")
            attrs['user'] = user
        else:
            raise serializers.ValidationError("Необходимо указать email и пароль")
        
        return attrs


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['fio', 'nickname', 'date_of_birth', 'country', 'language', 'base64_image', 'notification_email', 'notification_push', 'notification_inherit']
        extra_kwargs = {
            'fio': {'required': False},
            'nickname': {'required': False},
            'date_of_birth': {'required': False},
            'country': {'required': False},
            'language': {'required': False},
            'base64_image': {'required': False},
            'notification_email': {'required': False},
            'notification_push': {'required': False},
            'notification_inherit': {'required': False}
        }


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'fio', 'email', 'nickname', 'date_of_birth', 'country', 'language', 'rating', 'base64_image',
                 'is_subscribed', 'subscribe_expired', 'notification_email', 'notification_push', 'notification_inherit']
