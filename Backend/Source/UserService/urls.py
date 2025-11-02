from django.urls import path
from . import views

app_name = 'userservice'

urlpatterns = [
    path('sign-up/', views.sign_up, name='sign_up'),
    path('sign-up', views.sign_up, name='sign_up_no_slash'),
    path('sign-in/', views.sign_in, name='sign_in'),
    path('sign-in', views.sign_in, name='sign_in_no_slash'),
    path('verify-email/', views.verify_email, name='verify_email'),
    path('verify-email', views.verify_email, name='verify_email_no_slash'),
    path('reset-password/', views.reset_password, name='reset_password'),
    path('reset-password', views.reset_password, name='reset_password_no_slash'),
    path('confirm-password-reset/', views.confirm_password_reset, name='confirm_password_reset'),
    path('confirm-password-reset', views.confirm_password_reset, name='confirm_password_reset_no_slash'),
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
    path('logout/', views.logout, name='logout'),
    path('logout', views.logout, name='logout_no_slash'),
    path('top-users/', views.get_top_users, name='get_top_users'),
    path('top-users', views.get_top_users, name='get_top_users_no_slash'),
    path('create-checkout-session/', views.create_checkout_session, name='create_checkout_session'),
    path('create-checkout-session', views.create_checkout_session, name='create_checkout_session_no_slash'),
]
