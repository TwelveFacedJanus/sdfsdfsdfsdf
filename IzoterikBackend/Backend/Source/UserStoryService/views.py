from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import UserStory
from .serializers import UserStorySerializer, UserStoryCreateSerializer, UserStoryListSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_stories(request):
    """
    Получить историю действий текущего пользователя
    GET /api/user-story/
    """
    stories = UserStory.objects.filter(user=request.user)
    serializer = UserStoryListSerializer(stories, many=True)
    
    return Response({
        'stories': serializer.data,
        'count': stories.count()
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_user_story(request):
    """
    Создать новую запись в истории пользователя
    POST /api/user-story/
    """
    serializer = UserStoryCreateSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        try:
            story = serializer.save()
            return Response({
                'message': 'Запись в истории успешно создана',
                'story': UserStorySerializer(story).data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'error': 'Ошибка при создании записи в истории',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'error': 'Ошибка валидации',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_story_detail(request, story_id):
    """
    Получить детали конкретной записи истории
    GET /api/user-story/{story_id}/
    """
    story = get_object_or_404(UserStory, id=story_id, user=request.user)
    serializer = UserStorySerializer(story)
    
    return Response({
        'story': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user_story(request, story_id):
    """
    Удалить запись из истории
    DELETE /api/user-story/{story_id}/
    """
    story = get_object_or_404(UserStory, id=story_id, user=request.user)
    
    try:
        story.delete()
        return Response({
            'message': 'Запись в истории успешно удалена'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Ошибка при удалении записи',
            'details': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_stories_by_category(request, category):
    """
    Получить истории по категории
    GET /api/user-story/category/{category}/
    """
    valid_categories = [choice[0] for choice in UserStory.CATEGORY_CHOICES]
    
    if category not in valid_categories:
        return Response({
            'error': 'Неверная категория',
            'valid_categories': valid_categories
        }, status=status.HTTP_400_BAD_REQUEST)
    
    stories = UserStory.objects.filter(user=request.user, category=category)
    serializer = UserStoryListSerializer(stories, many=True)
    
    return Response({
        'stories': serializer.data,
        'category': category,
        'category_display': dict(UserStory.CATEGORY_CHOICES)[category],
        'count': stories.count()
    }, status=status.HTTP_200_OK)