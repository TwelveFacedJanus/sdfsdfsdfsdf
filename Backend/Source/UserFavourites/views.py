from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.conf import settings
from UserService.models import Notification
from .models import UserFavourite
from .serializers import UserFavouriteSerializer, UserFavouriteCreateSerializer, UserFavouriteListSerializer, SubscriberSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_subscriptions(request):
    """
    Получить список подписок текущего пользователя
    GET /api/user-favourites/subscriptions/
    """
    subscriptions = UserFavourite.objects.filter(subscriber=request.user)
    serializer = UserFavouriteListSerializer(subscriptions, many=True)
    
    return Response({
        'subscriptions': serializer.data,
        'count': subscriptions.count()
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_subscribers(request):
    """
    Получить список подписчиков текущего пользователя
    GET /api/user-favourites/subscribers/
    """
    subscribers = UserFavourite.objects.filter(subscribed_to=request.user)
    serializer = SubscriberSerializer(subscribers, many=True)
    
    return Response({
        'subscribers': serializer.data,
        'count': subscribers.count()
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def subscribe_to_user(request):
    """
    Подписаться на пользователя
    POST /api/user-favourites/subscribe/
    """
    serializer = UserFavouriteCreateSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        try:
            favourite = serializer.save()
            
            # Создаем уведомление для автора, на которого подписались
            subscribed_to_user = favourite.subscribed_to
            subscriber_user = request.user
            
            # Создаем уведомление
            notification = Notification.objects.create(
                user=subscribed_to_user,
                notification_type='subscription',
                title='Новая подписка',
                message=f'{subscriber_user.fio} подписался(ась) на вас',
                related_user=subscriber_user
            )
            
            # Отправляем email уведомление, если включено
            if subscribed_to_user.notification_email and subscribed_to_user.is_email_verified:
                try:
                    send_mail(
                        subject=f'{subscriber_user.fio} подписался(ась) на вас',
                        message=f'Пользователь {subscriber_user.fio} подписался на вас на платформе Ezoterika.',
                        from_email=settings.DEFAULT_FROM_EMAIL,
                        recipient_list=[subscribed_to_user.email],
                        fail_silently=True,
                    )
                except Exception as email_error:
                    print(f"Error sending email notification: {email_error}")
            
            return Response({
                'message': 'Успешно подписались на пользователя',
                'subscription': UserFavouriteSerializer(favourite).data
            }, status=status.HTTP_201_CREATED)
        except IntegrityError:
            return Response({
                'error': 'Вы уже подписаны на этого пользователя'
            }, status=status.HTTP_400_BAD_REQUEST)
        except ValidationError as e:
            return Response({
                'error': 'Ошибка валидации',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': 'Ошибка при создании подписки',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'error': 'Ошибка валидации',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def unsubscribe_from_user(request, user_id):
    """
    Отписаться от пользователя
    DELETE /api/user-favourites/unsubscribe/{user_id}/
    """
    try:
        favourite = get_object_or_404(
            UserFavourite, 
            subscriber=request.user, 
            subscribed_to_id=user_id
        )
        
        # Сохраняем данные перед удалением для уведомления
        subscribed_to_user = favourite.subscribed_to
        subscriber_user = request.user
        
        favourite.delete()
        
        # Создаем уведомление об отписке
        notification = Notification.objects.create(
            user=subscribed_to_user,
            notification_type='unsubscription',
            title='Отписка',
            message=f'{subscriber_user.fio} отписался(ась) от вас',
            related_user=subscriber_user
        )
        
        # Отправляем email уведомление, если включено
        if subscribed_to_user.notification_email and subscribed_to_user.is_email_verified:
            try:
                send_mail(
                    subject=f'{subscriber_user.fio} отписался(ась) от вас',
                    message=f'Пользователь {subscriber_user.fio} отписался от вас на платформе Ezoterika.',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[subscribed_to_user.email],
                    fail_silently=True,
                )
            except Exception as email_error:
                print(f"Error sending email notification: {email_error}")
        
        return Response({
            'message': 'Успешно отписались от пользователя'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Ошибка при отписке',
            'details': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_subscription_status(request, user_id):
    """
    Проверить статус подписки на пользователя
    GET /api/user-favourites/status/{user_id}/
    """
    try:
        is_subscribed = UserFavourite.objects.filter(
            subscriber=request.user, 
            subscribed_to_id=user_id
        ).exists()
        
        return Response({
            'is_subscribed': is_subscribed,
            'user_id': user_id
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Ошибка при проверке статуса подписки',
            'details': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_subscription_stats(request):
    """
    Получить статистику подписок пользователя
    GET /api/user-favourites/stats/
    """
    try:
        subscriptions_count = UserFavourite.objects.filter(subscriber=request.user).count()
        subscribers_count = UserFavourite.objects.filter(subscribed_to=request.user).count()
        
        return Response({
            'subscriptions_count': subscriptions_count,
            'subscribers_count': subscribers_count,
            'user_fio': request.user.fio
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Ошибка при получении статистики',
            'details': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)