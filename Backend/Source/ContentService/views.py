from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Post, Comment, PrivacyPolicy
from .serializers import PostSerializer, PostCreateSerializer, PostListSerializer, PostUpdateSerializer, CommentSerializer, CommentCreateSerializer, CommentListSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def get_posts(request):
    """
    Получить список всех опубликованных постов с пагинацией
    GET /api/content/posts/?page=1&page_size=4&category=tarot&search=query
    """
    posts = Post.objects.filter(is_published=True)
    
    # Фильтрация по категории
    category = request.GET.get('category')
    if category:
        posts = posts.filter(category=category)
    
    # Поиск по заголовку и тексту
    search = request.GET.get('search')
    if search:
        posts = posts.filter(
            Q(title__icontains=search) | Q(preview_text__icontains=search)
        )
    
    # Сортировка
    sort_by = request.GET.get('sort', '-created_at')
    if sort_by in ['created_at', '-created_at', 'rating', '-rating', 'views_count', '-views_count']:
        posts = posts.order_by(sort_by)
    
    # Пагинация
    page = int(request.GET.get('page', 1))
    page_size = int(request.GET.get('page_size', 4))
    
    total_count = posts.count()
    total_pages = (total_count + page_size - 1) // page_size  # Округление вверх
    
    start_index = (page - 1) * page_size
    end_index = start_index + page_size
    
    paginated_posts = posts[start_index:end_index]
    
    serializer = PostListSerializer(paginated_posts, many=True)
    
    return Response({
        'posts': serializer.data,
        'total_count': total_count,
        'total_pages': total_pages,
        'current_page': page,
        'page_size': page_size,
        'has_next': page < total_pages,
        'has_previous': page > 1
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_post_detail(request, post_id):
    """
    Получить детали конкретного поста
    GET /api/content/posts/{post_id}/
    """
    post = get_object_or_404(Post, id=post_id, is_published=True)
    
    # Увеличиваем счетчик просмотров
    post.views_count += 1
    post.save(update_fields=['views_count'])
    
    serializer = PostSerializer(post)
    
    return Response({
        'post': serializer.data
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_post(request):
    """
    Создать новый пост
    POST /api/content/posts/create/
    """
    serializer = PostCreateSerializer(data=request.data, context={'request': request})
    
    if serializer.is_valid():
        try:
            post = serializer.save()
            return Response({
                'message': 'Пост успешно создан',
                'post': PostSerializer(post).data
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'error': 'Ошибка при создании поста',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'error': 'Ошибка валидации',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_post(request, post_id):
    """
    Обновить пост
    PATCH /api/content/posts/{post_id}/update/
    """
    post = get_object_or_404(Post, id=post_id, author=request.user)
    serializer = PostUpdateSerializer(post, data=request.data, partial=True)
    
    if serializer.is_valid():
        try:
            serializer.save()
            return Response({
                'message': 'Пост успешно обновлен',
                'post': PostSerializer(post).data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': 'Ошибка при обновлении поста',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    return Response({
        'error': 'Ошибка валидации',
        'details': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_post(request, post_id):
    """
    Удалить пост
    DELETE /api/content/posts/{post_id}/delete/
    """
    post = get_object_or_404(Post, id=post_id, author=request.user)
    
    try:
        post.delete()
        return Response({
            'message': 'Пост успешно удален'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'error': 'Ошибка при удалении поста',
            'details': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_posts(request):
    """
    Получить посты текущего пользователя
    GET /api/content/my-posts/
    """
    posts = Post.objects.filter(author=request.user)
    
    # Фильтрация по статусу публикации
    is_published = request.GET.get('is_published')
    if is_published is not None:
        posts = posts.filter(is_published=is_published.lower() == 'true')
    
    serializer = PostListSerializer(posts, many=True)
    
    return Response({
        'posts': serializer.data,
        'count': posts.count()
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_posts_by_author(request, author_id):
    """
    Получить посты конкретного автора
    GET /api/content/author/{author_id}/posts/
    """
    posts = Post.objects.filter(author_id=author_id, is_published=True)
    serializer = PostListSerializer(posts, many=True)
    
    return Response({
        'posts': serializer.data,
        'count': posts.count(),
        'author_id': author_id
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_posts_by_category(request, category):
    """
    Получить посты по категории
    GET /api/content/category/{category}/posts/
    """
    valid_categories = [choice[0] for choice in Post.CATEGORY_CHOICES]
    
    if category not in valid_categories:
        return Response({
            'error': 'Неверная категория',
            'valid_categories': valid_categories
        }, status=status.HTTP_400_BAD_REQUEST)
    
    posts = Post.objects.filter(category=category, is_published=True)
    serializer = PostListSerializer(posts, many=True)
    
    return Response({
        'posts': serializer.data,
        'category': category,
        'category_display': dict(Post.CATEGORY_CHOICES)[category],
        'count': posts.count()
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_top_posts(request):
    """
    Получить топ посты по рейтингу
    GET /api/content/top-posts/
    """
    limit = int(request.GET.get('limit', 10))
    posts = Post.objects.filter(is_published=True).order_by('-rating', '-views_count')[:limit]
    serializer = PostListSerializer(posts, many=True)
    
    return Response({
        'posts': serializer.data,
        'count': len(serializer.data)
    }, status=status.HTTP_200_OK)


# ========== COMMENTS VIEWS ==========

@api_view(['GET'])
@permission_classes([AllowAny])
def get_comments(request):
    """
    Получить комментарии к посту
    GET /api/content/comments/?post_id=uuid&sort=newest
    """
    post_id = request.GET.get('post_id')
    sort_order = request.GET.get('sort', 'newest')
    
    if not post_id:
        return Response({'error': 'post_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        post = get_object_or_404(Post, id=post_id, is_published=True)
    except:
        return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Получаем только корневые комментарии (не ответы)
    comments = Comment.objects.filter(
        post=post,
        parent__isnull=True,
        is_deleted=False
    )
    
    # Сортировка
    if sort_order == 'oldest':
        comments = comments.order_by('created_at')
    else:  # newest
        comments = comments.order_by('-created_at')
    
    serializer = CommentListSerializer(comments, many=True)
    
    return Response({
        'comments': serializer.data,
        'count': comments.count()
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_comment(request):
    """
    Создать новый комментарий или ответ
    POST /api/content/comments/
    Body: {"text": "Текст комментария", "post_id": "uuid", "parent_id": "uuid" (optional)}
    """
    text = request.data.get('text')
    post_id = request.data.get('post_id')
    parent_id = request.data.get('parent_id')
    
    if not text:
        return Response({'error': 'text is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not post_id and not parent_id:
        return Response({'error': 'post_id or parent_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Если это ответ на комментарий
    if parent_id:
        try:
            parent_comment = get_object_or_404(Comment, id=parent_id, is_deleted=False)
            post = parent_comment.post
        except:
            return Response({'error': 'Parent comment not found'}, status=status.HTTP_404_NOT_FOUND)
    else:
        # Если это новый комментарий к посту
        try:
            post = get_object_or_404(Post, id=post_id, is_published=True)
        except:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Создаем комментарий
    comment_data = {
        'text': text,
        'post_id': post.id,
        'author': request.user
    }
    
    if parent_id:
        comment_data['parent_id'] = parent_id
    
    serializer = CommentCreateSerializer(data=comment_data, context={'request': request})
    
    if serializer.is_valid():
        comment = serializer.save()
        
        # Обновляем счетчик комментариев поста
        post.comments_count = Comment.objects.filter(post=post, is_deleted=False).count()
        post.save()
        
        # Возвращаем созданный комментарий
        response_serializer = CommentSerializer(comment)
        return Response({
            'message': 'Комментарий успешно создан',
            'comment': response_serializer.data
        }, status=status.HTTP_201_CREATED)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def update_delete_comment(request, comment_id):
    """
    Обновить или удалить комментарий
    PUT /api/content/comments/{comment_id}/
    DELETE /api/content/comments/{comment_id}/
    """
    try:
        comment = get_object_or_404(Comment, id=comment_id, is_deleted=False)
    except:
        return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Проверяем, что пользователь может редактировать комментарий
    if comment.author != request.user:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'PUT':
        # Обновление комментария
        text = request.data.get('text')
        if not text:
            return Response({'error': 'text is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        comment.text = text
        comment.save()
        
        serializer = CommentSerializer(comment)
        return Response({
            'message': 'Комментарий успешно обновлен',
            'comment': serializer.data
        }, status=status.HTTP_200_OK)
    
    elif request.method == 'DELETE':
        # Мягкое удаление комментария
        comment.is_deleted = True
        comment.save()
        
        # Обновляем счетчик комментариев поста
        post = comment.post
        post.comments_count = Comment.objects.filter(post=post, is_deleted=False).count()
        post.save()
        
        return Response({
            'message': 'Комментарий успешно удален'
        }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_privacy_policy(request):
    """
    Получить активную политику конфиденциальности
    GET /api/content/privacy-policy/
    """
    try:
        policy = PrivacyPolicy.get_active()
        
        if not policy:
            return Response({
                'error': 'Политика конфиденциальности не найдена'
            }, status=status.HTTP_404_NOT_FOUND)
        
        return Response({
            'id': str(policy.id),
            'title': policy.title,
            'content': policy.content,
            'updated_at': policy.updated_at.isoformat(),
            'created_at': policy.created_at.isoformat()
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'error': 'Ошибка при получении политики конфиденциальности',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)