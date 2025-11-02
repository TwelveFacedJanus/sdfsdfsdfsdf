from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .serializers import UserSignUpSerializer, UserSignInSerializer, UserSerializer, UserUpdateSerializer
from .models import User
from django.core.mail import send_mail
from django.conf import settings

# Импорт stripe будет в функции для лучшей обработки ошибок


@api_view(['POST'])
@permission_classes([AllowAny])
def sign_up(request):
    """
    Регистрация нового пользователя
    POST /api/user/sign-up
    """
    serializer = UserSignUpSerializer(data=request.data)
    
    # Логируем данные запроса для отладки
    print(f"Registration data: {request.data}")
    print(f"Serializer valid: {serializer.is_valid()}")
    if not serializer.is_valid():
        print(f"Validation errors: {serializer.errors}")
    
    if serializer.is_valid():
        try:
            user = serializer.save()
            
            # Отправляем email с подтверждением
            verification_url = f"http://localhost:3000/verify-email?token={user.email_verification_token}"
            subject = 'Подтверждение регистрации'
            message = f"""
            Добро пожаловать, {user.fio}!
            
            Спасибо за регистрацию на нашей платформе.
            
            Пожалуйста, подтвердите ваш email, перейдя по следующей ссылке:
            {verification_url}
            
            Ссылка действительна в течение 24 часов.
            
            Если вы не регистрировались на нашей платформе, просто проигнорируйте это письмо.
            
            С уважением,
            Команда Ezoterika
            """
            
            try:
                send_mail(
                    subject,
                    message,
                    settings.EMAIL_HOST_USER,
                    [user.email],
                    fail_silently=True,
                )
            except Exception as email_error:
                # Логируем ошибку, но не блокируем регистрацию
                print(f"Ошибка отправки email: {email_error}")
            
            return Response({
                'message': 'Пользователь успешно зарегистрирован. Проверьте почту для подтверждения email.',
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


@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    """
    Подтверждение email пользователя
    POST /api/user/verify-email/
    """
    token = request.data.get('token')
    
    if not token:
        return Response({
            'error': 'Токен не предоставлен'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email_verification_token=token)
        
        if user.verify_email_token(token):
            return Response({
                'message': 'Email успешно подтвержден',
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Токен недействителен или истек срок действия'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except User.DoesNotExist:
        return Response({
            'error': 'Пользователь с таким токеном не найден'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': 'Ошибка при подтверждении email',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """
    Запрос на сброс пароля
    POST /api/user/reset-password/
    """
    email = request.data.get('email')
    
    # Логируем данные запроса
    print(f"Password reset request for email: {email}")
    
    if not email:
        return Response({
            'error': 'Email не предоставлен'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        print(f"User found: {user.email}")
        
        # Генерируем токен для сброса пароля
        token = user.generate_password_reset_token()
        
        # Отправляем email с ссылкой на сброс пароля
        reset_url = f"http://localhost:3000/reset-password?token={token}"
        subject = 'Сброс пароля'
        message = f"""
        Здравствуйте, {user.fio}!
        
        Вы запросили сброс пароля для вашего аккаунта.
        
        Для сброса пароля перейдите по следующей ссылке:
        {reset_url}
        
        Ссылка действительна в течение 1 часа.
        
        Если вы не запрашивали сброс пароля, просто проигнорируйте это письмо.
        
        С уважением,
        Команда Ezoterika
        """
        
        try:
            send_mail(
                subject,
                message,
                settings.EMAIL_HOST_USER,
                [user.email],
                fail_silently=True,
            )
        except Exception as email_error:
            print(f"Ошибка отправки email: {email_error}")
        
        return Response({
            'message': 'Ссылка для сброса пароля отправлена на email'
        }, status=status.HTTP_200_OK)
        
    except User.DoesNotExist:
        # Для безопасности не сообщаем, что пользователь не найден
        return Response({
            'message': 'Если такой email существует, на него была отправлена ссылка для сброса пароля'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Ошибка при отправке запроса на сброс пароля',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def confirm_password_reset(request):
    """
    Подтверждение сброса пароля
    POST /api/user/confirm-password-reset/
    """
    token = request.data.get('token')
    new_password = request.data.get('password')
    
    if not token or not new_password:
        return Response({
            'error': 'Токен и новый пароль обязательны'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(password_reset_token=token)
        
        if user.verify_password_reset_token(token):
            # Устанавливаем новый пароль
            user.set_password(new_password)
            user.password_reset_token = None
            user.password_reset_token_expires = None
            user.save()
            
            return Response({
                'message': 'Пароль успешно изменен'
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Токен недействителен или истек срок действия'
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except User.DoesNotExist:
        return Response({
            'error': 'Пользователь с таким токеном не найден'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'error': 'Ошибка при сбросе пароля',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
        print(f"Profile update request data: {request.data}")
        serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
        
        print(f"Serializer is_valid: {serializer.is_valid()}")
        if not serializer.is_valid():
            print(f"Validation errors: {serializer.errors}")
        
        if serializer.is_valid():
            try:
                serializer.save()
                return Response({
                    'message': 'Профиль успешно обновлен',
                    'user': UserSerializer(request.user).data
                }, status=status.HTTP_200_OK)
            except Exception as e:
                print(f"Save error: {e}")
                import traceback
                print(traceback.format_exc())
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
    def post(self, request, *args, **kwargs):
        try:
            return super().post(request, *args, **kwargs)
        except User.DoesNotExist as e:
            # Пользователь из токена не найден
            import traceback
            print(f"Token refresh error: User.DoesNotExist - {str(e)}")
            print(traceback.format_exc())
            return Response({
                'detail': 'Токен обновления недействителен или истек. Пожалуйста, войдите снова.'
            }, status=status.HTTP_401_UNAUTHORIZED)
        except (InvalidToken, TokenError) as e:
            # Невалидный токен
            import traceback
            print(f"Token refresh error: InvalidToken/TokenError - {str(e)}")
            print(traceback.format_exc())
            return Response({
                'detail': str(e) if hasattr(e, '__str__') else 'Токен обновления недействителен.'
            }, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            # Логируем любые другие ошибки для отладки
            import traceback
            print(f"Token refresh error: {type(e).__name__} - {str(e)}")
            print(traceback.format_exc())
            
            # Возвращаем общее сообщение
            return Response({
                'detail': 'Токен обновления недействителен или истек. Пожалуйста, войдите снова.'
            }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    Выход из системы (без blacklist, просто подтверждение)
    POST /api/user/logout/
    """
    # Без blacklist мы просто возвращаем успешный ответ
    # Клиент должен удалить токены на своей стороне
    return Response({
        'message': 'Вы успешно вышли из системы'
    }, status=status.HTTP_200_OK)


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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_checkout_session(request):
    """
    Создание Stripe Checkout сессии для оплаты подписки
    POST /api/user/create-checkout-session/
    """
    price_id = request.data.get('priceId')
    
    print(f"Creating checkout session for priceId: {price_id}, user: {request.user.email}")
    
    if not price_id:
        return Response({
            'error': 'Price ID не предоставлен'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Проверяем, что Stripe установлен
    try:
        import stripe
    except ImportError as e:
        print(f"Stripe import error: {e}")
        return Response({
            'error': 'Stripe не установлен. Установите: pip install stripe',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Маппинг priceId на реальные Stripe Price IDs
    # Для тестирования можно использовать test mode price IDs из Stripe Dashboard
    price_mapping = {
        'price_basic': 'price_YourBasicPriceId',  # Замените на реальный Price ID
        'price_premium': 'price_YourPremiumPriceId',  # Замените на реальный Price ID
        'price_premium_plus': 'price_YourPremiumPlusPriceId',  # Замените на реальный Price ID
    }
    
    stripe_price_id = price_mapping.get(price_id, price_id)
    
    # Проверяем, что ключ Stripe настроен
    if not settings.STRIPE_SECRET_KEY or settings.STRIPE_SECRET_KEY == 'sk_test_51YourSecretKeyHere':
        print("Stripe secret key not configured")
        return Response({
            'error': 'Stripe ключи не настроены. Настройте STRIPE_SECRET_KEY в settings.py'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    try:
        # Инициализируем Stripe
        stripe.api_key = settings.STRIPE_SECRET_KEY
        print(f"Stripe API key set, creating session for price: {stripe_price_id}")
        
        # Создаем Checkout Session
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[
                {
                    'price': stripe_price_id,
                    'quantity': 1,
                },
            ],
            mode='subscription',
            success_url='http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='http://localhost:3000/payment/cancel',
            customer_email=request.user.email,
            metadata={
                'user_id': str(request.user.id),
                'price_id': price_id,
            },
        )
        
        print(f"Checkout session created: {checkout_session.id}")
        
        return Response({
            'sessionId': checkout_session.id,
            'url': checkout_session.url
        }, status=status.HTTP_200_OK)
        
    except stripe.error.StripeError as e:
        print(f"Stripe error: {e}")
        return Response({
            'error': f'Ошибка Stripe: {str(e)}',
            'details': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"General error creating checkout session: {e}")
        import traceback
        traceback.print_exc()
        return Response({
            'error': 'Ошибка при создании сессии оплаты',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)