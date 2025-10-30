from django.urls import path
from . import views

app_name = 'userfavourites'

urlpatterns = [
    path('subscriptions/', views.get_user_subscriptions, name='get_user_subscriptions'),
    path('subscribers/', views.get_user_subscribers, name='get_user_subscribers'),
    path('subscribe/', views.subscribe_to_user, name='subscribe_to_user'),
    path('unsubscribe/<uuid:user_id>/', views.unsubscribe_from_user, name='unsubscribe_from_user'),
    path('status/<uuid:user_id>/', views.check_subscription_status, name='check_subscription_status'),
    path('stats/', views.get_subscription_stats, name='get_subscription_stats'),
]
