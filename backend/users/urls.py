from django.urls import path
from .views import SignupView, VerifyEmailView, ResendVerificationView, LoginView, ProfileStatusView

urlpatterns = [
    path('register/', SignupView.as_view(), name='signup'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    path('resend-verification/', ResendVerificationView.as_view(), name='resend_verification'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile-status/', ProfileStatusView.as_view(), name='profile_status'),
]
