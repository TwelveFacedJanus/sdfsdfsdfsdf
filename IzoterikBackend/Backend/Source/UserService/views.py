from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from .serializers import UserSignUpSerializer, UserSignInSerializer, UserSerializer, UserUpdateSerializer
from .models import User


@api_view(['POST'])
@permission_classes([AllowAny])
def sign_up(request):
    """
    Регистрация нового пользователя
    POST /api/user/sign-up
    """
    serializer = UserSignUpSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            user = serializer.save()
            return Response({
                'message': 'Пользователь успешно зарегистрирован',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'error': 'Ошибка при создании пользователя',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'error': 'Ошибка валидации',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def sign_in(request):
    """
    Авторизация пользователя
    POST /api/user/sign-in
    """
    serializer = UserSignInSerializer(data=request.data)
    
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        return Response({
            'message': 'Успешная авторизация',
            'user': UserSerializer(user).data,
            'tokens': {
                'access': str(access_token),
                'refresh': str(refresh)
            }
        }, status=status.HTTP_200_OK)
    
    return Response({
        'error': 'Ошибка авторизации',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    """
    Получение и обновление профиля пользователя
    GET /api/user/profile/ - получение профиля
    PATCH /api/user/profile/ - обновление профиля
    """
    if request.method == 'GET':
        # Получение профиля пользователя
        return Response({
            'user': UserSerializer(request.user).data
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'PATCH':
        # Обновление профиля пользователя
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        
        if serializer.is_valid():
            try:
                serializer.save()
                return Response({
                    'message': 'Профиль успешно обновлен',
                    'user': UserSerializer(request.user).data
                }, status=status.HTTP_200_OK)
            except Exception as e:
                return Response({
                    'error': 'Ошибка при обновлении профиля',
                    'details': str(e)
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'error': 'Ошибка валидации',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


# JWT Token Views
class CustomTokenRefreshView(TokenRefreshView):
    """
    Обновление JWT токена
    POST /api/user/token/refresh/
    """
    pass


class CustomTokenBlacklistView(TokenBlacklistView):
    """
    Выход из системы (черный список токена)
    POST /api/user/logout/
    """
    pass


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_history(request):
    """
    Получение истории активности пользователя
    GET /api/user/history/?category=subscription&date_from=2025-01-01&date_to=2025-12-31
    """
    try:
        category = request.GET.get('category')
        date_from = request.GET.get('date_from')
        date_to = request.GET.get('date_to')
        
        # Моковые данные для истории (в реальном проекте это будет из базы данных)
        history_items = [
            {
                'id': 1,
                'description': '«Активирован абонемент»',
                'date': '2025-08-15',
                'category': 'subscription',
                'type': 'subscription_activated'
            },
            {
                'id': 2,
                'description': '«Участие в Лайве: Таро-практика»',
                'date': '2025-07-20',
                'category': 'live',
                'type': 'live_participation'
            },
            {
                'id': 3,
                'description': '«Пожертвование 5 € практику А»',
                'date': '2025-08-15',
                'category': 'donation',
                'type': 'donation'
            },
            {
                'id': 4,
                'description': '«Скачан файл: Годовой прогноз PDF»',
                'date': '2025-08-02',
                'category': 'download',
                'type': 'file_download'
            },
            {
                'id': 5,
                'description': '«Просмотр статьи: Основы астрологии»',
                'date': '2025-07-28',
                'category': 'content',
                'type': 'article_view'
            },
            {
                'id': 6,
                'description': '«Добавлено в избранное: Карты Таро»',
                'date': '2025-07-25',
                'category': 'favorites',
                'type': 'favorite_added'
            }
        ]
        
        # Фильтрация по категории
        if category:
            history_items = [item for item in history_items if item['category'] == category]
        
        # Фильтрация по дате
        if date_from:
            history_items = [item for item in history_items if item['date'] >= date_from]
        
        if date_to:
            history_items = [item for item in history_items if item['date'] <= date_to]
        
        # Сортировка по дате (новые сначала)
        history_items.sort(key=lambda x: x['date'], reverse=True)
        
        return Response({
            'history': history_items,
            'total': len(history_items)
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Ошибка при получении истории',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def get_user_settings(request):
    """
    Получение и обновление настроек пользователя
    GET /api/user/settings/ - получение настроек
    PATCH /api/user/settings/ - обновление настроек
    """
    if request.method == 'GET':
        # Получение настроек пользователя
        user = request.user
        settings_data = {
            'language': user.language or 'ru',
            'notifications': {
                'email': user.notification_email,
                'internal': user.notification_inherit,
                'push': user.notification_push
            },
            'subscription': {
                'isActive': user.is_subscribed,
                'expiresAt': user.subscribe_expired.isoformat() if user.subscribe_expired else None,
                'plan': 'premium' if user.is_subscribed else 'free'
            }
        }
        
        return Response({
            'settings': settings_data
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'PATCH':
        # Обновление настроек пользователя
        user = request.user
        
        # Обновляем язык
        if 'language' in request.data:
            user.language = request.data['language']
        
        # Обновляем настройки уведомлений
        if 'notifications' in request.data:
            notifications = request.data['notifications']
            if 'email' in notifications:
                user.notification_email = notifications['email']
            if 'internal' in notifications:
                user.notification_inherit = notifications['internal']
            if 'push' in notifications:
                user.notification_push = notifications['push']
        
        try:
            user.save()
            return Response({
                'message': 'Настройки успешно обновлены',
                'settings': {
                    'language': user.language or 'ru',
                    'notifications': {
                        'email': user.notification_email,
                        'internal': user.notification_inherit,
                        'push': user.notification_push
                    },
                    'subscription': {
                        'isActive': user.is_subscribed,
                        'expiresAt': user.subscribe_expired.isoformat() if user.subscribe_expired else None,
                        'plan': 'premium' if user.is_subscribed else 'free'
                    }
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Ошибка при обновлении настроек',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Смена пароля пользователя
    POST /api/user/change-password/
    """
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    if not current_password or not new_password:
        return Response({
            'error': 'Необходимо указать текущий и новый пароль'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = request.user
    
    # Проверяем текущий пароль
    if not user.check_password(current_password):
        return Response({
            'error': 'Неверный текущий пароль'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Устанавливаем новый пароль
    try:
        user.set_password(new_password)
        user.save()
        return Response({
            'message': 'Пароль успешно изменен'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Ошибка при смене пароля',
            'details': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_payment_history(request):
    """
    Получение истории платежей пользователя
    GET /api/user/payment-history/
    """
    # Моковые данные для истории платежей
    payment_history = [
        {
            'id': 1,
            'date': '2025-08-15',
            'amount': 999,
            'currency': 'RUB',
            'description': 'Подписка Premium на 1 месяц',
            'status': 'completed',
            'payment_method': 'card'
        },
        {
            'id': 2,
            'date': '2025-07-15',
            'amount': 999,
            'currency': 'RUB',
            'description': 'Подписка Premium на 1 месяц',
            'status': 'completed',
            'payment_method': 'card'
        },
        {
            'id': 3,
            'date': '2025-06-15',
            'amount': 999,
            'currency': 'RUB',
            'description': 'Подписка Premium на 1 месяц',
            'status': 'completed',
            'payment_method': 'card'
        }
    ]
    
    return Response({
        'payments': payment_history,
        'total': len(payment_history)
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_top_users(request):
    """
    Получение топ пользователей по рейтингу
    GET /api/user/top-users/?limit=3
    """
    try:
        limit = int(request.GET.get('limit', 3))
        limit = min(limit, 10)  # Максимум 10 пользователей
        
        # Получаем пользователей с наибольшим рейтингом
        top_users = User.objects.filter(
            rating__gt=0  # Только пользователи с рейтингом больше 0
        ).order_by('-rating')[:limit]
        
        # Если пользователей с рейтингом > 0 недостаточно, добавляем пользователей с рейтингом 0
        if len(top_users) < limit:
            remaining_limit = limit - len(top_users)
            users_with_zero_rating = User.objects.filter(
                rating=0
            ).order_by('-date_joined')[:remaining_limit]  # Сортируем по дате регистрации
            
            # Объединяем querysets
            top_users = list(top_users) + list(users_with_zero_rating)
        
        # Сериализуем данные
        users_data = []
        for user in top_users:
            users_data.append({
                'id': str(user.id),
                'fio': user.fio,
                'rating': user.rating,
                'nickname': user.nickname,
                'country': user.country,
            })
        
        return Response({
            'message': 'Топ пользователей получены',
            'users': users_data,
            'count': len(users_data)
        }, status=status.HTTP_200_OK)
        
    except ValueError:
        return Response({
            'error': 'Неверный параметр limit'
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            'error': 'Ошибка при получении топ пользователей',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)