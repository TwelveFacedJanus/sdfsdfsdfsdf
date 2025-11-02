from django.urls import path
from . import views

app_name = 'userstoryservice'

urlpatterns = [
    path('', views.get_user_stories, name='get_user_stories'),
    path('create/', views.create_user_story, name='create_user_story'),
    path('<uuid:story_id>/', views.get_user_story_detail, name='get_user_story_detail'),
    path('<uuid:story_id>/delete/', views.delete_user_story, name='delete_user_story'),
    path('category/<str:category>/', views.get_stories_by_category, name='get_stories_by_category'),
]
