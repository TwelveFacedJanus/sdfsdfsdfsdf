from django.urls import path
from . import views

app_name = 'contentservice'

urlpatterns = [
    path('posts/', views.get_posts, name='get_posts'),
    path('posts', views.get_posts, name='get_posts_no_slash'),
    path('posts/<uuid:post_id>/', views.get_post_detail, name='get_post_detail'),
    path('posts/<uuid:post_id>', views.get_post_detail, name='get_post_detail_no_slash'),
    path('posts/create/', views.create_post, name='create_post'),
    path('posts/create', views.create_post, name='create_post_no_slash'),
    path('posts/<uuid:post_id>/update/', views.update_post, name='update_post'),
    path('posts/<uuid:post_id>/update', views.update_post, name='update_post_no_slash'),
    path('posts/<uuid:post_id>/delete/', views.delete_post, name='delete_post'),
    path('posts/<uuid:post_id>/delete', views.delete_post, name='delete_post_no_slash'),
    path('my-posts/', views.get_user_posts, name='get_user_posts'),
    path('my-posts', views.get_user_posts, name='get_user_posts_no_slash'),
    path('author/<uuid:author_id>/posts/', views.get_posts_by_author, name='get_posts_by_author'),
    path('author/<uuid:author_id>/posts', views.get_posts_by_author, name='get_posts_by_author_no_slash'),
    path('category/<str:category>/posts/', views.get_posts_by_category, name='get_posts_by_category'),
    path('category/<str:category>/posts', views.get_posts_by_category, name='get_posts_by_category_no_slash'),
    path('top-posts/', views.get_top_posts, name='get_top_posts'),
    path('top-posts', views.get_top_posts, name='get_top_posts_no_slash'),
    
    # Comments URLs
    path('comments/', views.get_comments, name='get_comments'),
    path('comments', views.get_comments, name='get_comments_no_slash'),
    path('comments/create/', views.create_comment, name='create_comment'),
    path('comments/create', views.create_comment, name='create_comment_no_slash'),
    path('comments/<uuid:comment_id>/', views.update_delete_comment, name='update_delete_comment'),
    path('comments/<uuid:comment_id>', views.update_delete_comment, name='update_delete_comment_no_slash'),
    
    # Privacy Policy URLs
    path('privacy-policy/', views.get_privacy_policy, name='get_privacy_policy'),
    path('privacy-policy', views.get_privacy_policy, name='get_privacy_policy_no_slash'),
    
    # Post Rating URLs
    path('posts/<uuid:post_id>/rate/', views.rate_post, name='rate_post'),
    path('posts/<uuid:post_id>/rate', views.rate_post, name='rate_post_no_slash'),
    path('posts/<uuid:post_id>/my-rating/', views.get_user_post_rating, name='get_user_post_rating'),
    path('posts/<uuid:post_id>/my-rating', views.get_user_post_rating, name='get_user_post_rating_no_slash'),
]
