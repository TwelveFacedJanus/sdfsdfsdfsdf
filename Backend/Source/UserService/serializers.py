from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Notification


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
        password = validated_data.pop('password')
        
        # Устанавливаем username равным email
        validated_data['username'] = validated_data.get('email', validated_data.get('username'))
        
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        
        # Генерируем токен для подтверждения email
        try:
            user.generate_email_verification_token()
        except Exception as e:
            # Если метод не работает, логируем ошибку
            print(f"Ошибка генерации токена: {e}")
        
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
        fields = ['nickname', 'date_of_birth', 'country', 'language', 'base64_image', 'notification_email', 'notification_push', 'notification_inherit']
        extra_kwargs = {
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
                 'is_subscribed', 'subscribe_expired', 'notification_email', 'notification_push', 'notification_inherit',
                 'is_email_verified']


class NotificationSerializer(serializers.ModelSerializer):
    related_user_fio = serializers.CharField(source='related_user.fio', read_only=True)
    related_user_avatar = serializers.CharField(source='related_user.base64_image', read_only=True)
    notification_type_display = serializers.CharField(source='get_notification_type_display', read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'notification_type', 'notification_type_display', 'title', 'message', 
                 'related_user', 'related_user_fio', 'related_user_avatar', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at']
