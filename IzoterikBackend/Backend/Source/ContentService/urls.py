from django.urls import path
from . import views

app_name = 'contentservice'

urlpatterns = [
    path('posts/', views.get_posts, name='get_posts'),
    path('posts/<uuid:post_id>/', views.get_post_detail, name='get_post_detail'),
    path('posts/create/', views.create_post, name='create_post'),
    path('posts/<uuid:post_id>/update/', views.update_post, name='update_post'),
    path('posts/<uuid:post_id>/delete/', views.delete_post, name='delete_post'),
    path('my-posts/', views.get_user_posts, name='get_user_posts'),
    path('author/<uuid:author_id>/posts/', views.get_posts_by_author, name='get_posts_by_author'),
    path('category/<str:category>/posts/', views.get_posts_by_category, name='get_posts_by_category'),
    path('top-posts/', views.get_top_posts, name='get_top_posts'),
    
    # Comments URLs
    path('comments/', views.get_comments, name='get_comments'),
    path('comments/create/', views.create_comment, name='create_comment'),
    path('comments/<uuid:comment_id>/', views.update_delete_comment, name='update_delete_comment'),
]
