from django.urls import path
from . import views

app_name = 'userservice'

urlpatterns = [
    path('sign-up/', views.sign_up, name='sign_up'),
    path('sign-up', views.sign_up, name='sign_up_no_slash'),
    path('sign-in/', views.sign_in, name='sign_in'),
    path('sign-in', views.sign_in, name='sign_in_no_slash'),
    path('profile/', views.update_profile, name='update_profile'),
    path('profile', views.update_profile, name='update_profile_no_slash'),
    path('history/', views.get_user_history, name='get_user_history'),
    path('history', views.get_user_history, name='get_user_history_no_slash'),
    path('settings/', views.get_user_settings, name='get_user_settings'),
    path('settings', views.get_user_settings, name='get_user_settings_no_slash'),
    path('change-password/', views.change_password, name='change_password'),
    path('change-password', views.change_password, name='change_password_no_slash'),
    path('payment-history/', views.get_payment_history, name='get_payment_history'),
    path('payment-history', views.get_payment_history, name='get_payment_history_no_slash'),
    path('token/refresh/', views.CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('token/refresh', views.CustomTokenRefreshView.as_view(), name='token_refresh_no_slash'),
    path('logout/', views.CustomTokenBlacklistView.as_view(), name='logout'),
    path('logout', views.CustomTokenBlacklistView.as_view(), name='logout_no_slash'),
    path('top-users/', views.get_top_users, name='get_top_users'),
    path('top-users', views.get_top_users, name='get_top_users_no_slash'),
]
