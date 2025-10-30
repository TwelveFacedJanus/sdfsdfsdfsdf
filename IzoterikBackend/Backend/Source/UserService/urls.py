from django.urls import path
from . import views

app_name = 'userservice'

urlpatterns = [
    path('sign-up/', views.sign_up, name='sign_up'),
    path('sign-in/', views.sign_in, name='sign_in'),
    path('profile/', views.update_profile, name='update_profile'),
    path('history/', views.get_user_history, name='get_user_history'),
    path('settings/', views.get_user_settings, name='get_user_settings'),
    path('change-password/', views.change_password, name='change_password'),
    path('payment-history/', views.get_payment_history, name='get_payment_history'),
    path('token/refresh/', views.CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', views.CustomTokenBlacklistView.as_view(), name='logout'),
    path('top-users/', views.get_top_users, name='get_top_users'),
]
