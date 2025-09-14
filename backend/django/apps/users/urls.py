from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter
from . import views
from .admin_views import AdminUserViewSet, AdminGroupViewSet

app_name = 'users'

# Create a router for ViewSets
router = DefaultRouter()
router.register(r'admin/users', AdminUserViewSet, basename='admin-users')
router.register(r'admin/groups', AdminGroupViewSet, basename='admin-groups')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Authentication flow
    path('login/', views.LoginView.as_view(), name='login'),
    path('login/verify/', views.OTPVerifyView.as_view(), name='login_verify'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # OTP management
    path('otp/request/', views.OTPRequestView.as_view(), name='otp_request'),
    
    # Password reset flow
    path('password/reset/request/', views.PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password/reset/confirm/', views.PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # Security questions
    path('security-questions/', views.SecurityQuestionView.as_view(), name='security_questions'),
    
    # User management
    path('register/', views.AdminUserRegistrationView.as_view(), name='register'),
    path('profile/', views.UserProfileView.as_view(), name='profile'),
] 