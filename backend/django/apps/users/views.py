from rest_framework.generics import GenericAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from django.utils.crypto import get_random_string
from .models import User
from .serializers import (
    UserSerializer, LoginSerializer, PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer, AdminUserRegistrationSerializer,
    OTPRequestSerializer, OTPVerifySerializer, SecurityQuestionSerializer
)

class AdminUserRegistrationView(GenericAPIView):
    serializer_class = AdminUserRegistrationSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = []  # No authentication required for login
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                # Find user by staff_id
                user = User.objects.get(staff_id__startswith=f"hashed_{User._hash_staff_id(None, serializer.validated_data['staff_id'])}")
                
                # Authenticate with email and password
                user = authenticate(
                    email=user.email,
                    password=serializer.validated_data['password']
                )
                
                if user:
                    # Generate OTP for additional verification
                    otp = user.generate_otp(method='email')
                    
                    # Send OTP via email
                    send_mail(
                        'Login Verification Code',
                        f'Your verification code is: {otp}\nThis code will expire in 5 minutes.',
                        settings.DEFAULT_FROM_EMAIL,
                        [user.email],
                        fail_silently=False,
                    )
                    
                    return Response({
                        'message': 'OTP sent to your email',
                        'email': user.email
                    })
                return Response(
                    {'error': 'Invalid credentials'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            except User.DoesNotExist:
                return Response(
                    {'error': 'Invalid credentials'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OTPRequestView(GenericAPIView):
    serializer_class = OTPRequestSerializer
    permission_classes = []
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                user = User.objects.get(email=serializer.validated_data['email'])
                method = serializer.validated_data['method']
                
                # Generate OTP
                otp = user.generate_otp(method=method)
                
                # Send OTP
                if method == 'email':
                    send_mail(
                        'Verification Code',
                        f'Your verification code is: {otp}\nThis code will expire in 5 minutes.',
                        settings.DEFAULT_FROM_EMAIL,
                        [user.email],
                        fail_silently=False,
                    )
                else:  # phone
                    # TODO: Implement SMS sending
                    pass
                
                return Response({
                    'message': f'OTP sent to your {method}',
                    'email': user.email
                })
            except User.DoesNotExist:
                return Response(
                    {'message': 'If an account exists, an OTP has been sent'},
                    status=status.HTTP_200_OK
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OTPVerifyView(GenericAPIView):
    serializer_class = OTPVerifySerializer
    permission_classes = []
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                user = User.objects.get(email=serializer.validated_data['email'])
                if user.verify_otp(
                    serializer.validated_data['otp'],
                    method=serializer.validated_data['method']
                ):
                    refresh = RefreshToken.for_user(user)
                    return Response({
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                        'user': UserSerializer(user).data
                    })
                return Response(
                    {'error': 'Invalid or expired OTP'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except User.DoesNotExist:
                return Response(
                    {'error': 'Invalid email'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SecurityQuestionView(GenericAPIView):
    serializer_class = SecurityQuestionSerializer
    permission_classes = []
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                user = User.objects.get(email=serializer.validated_data['email'])
                if user.check_security_answer(
                    serializer.validated_data['question_number'],
                    serializer.validated_data['answer']
                ):
                    # Generate OTP for additional verification
                    otp = user.generate_otp(method='email')
                    
                    # Send OTP via email
                    send_mail(
                        'Password Reset Verification Code',
                        f'Your verification code is: {otp}\nThis code will expire in 5 minutes.',
                        settings.DEFAULT_FROM_EMAIL,
                        [user.email],
                        fail_silently=False,
                    )
                    
                    return Response({
                        'message': 'Security question verified. OTP sent to your email.',
                        'email': user.email
                    })
                return Response(
                    {'error': 'Incorrect answer'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except User.DoesNotExist:
                return Response(
                    {'error': 'Invalid email'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestView(GenericAPIView):
    serializer_class = PasswordResetRequestSerializer
    permission_classes = []
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                user = User.objects.get(email=serializer.validated_data['email'])
                method = serializer.validated_data['method']
                
                # Generate OTP
                otp = user.generate_otp(method=method)
                
                # Send OTP
                if method == 'email':
                    send_mail(
                        'Password Reset Verification Code',
                        f'Your verification code is: {otp}\nThis code will expire in 5 minutes.',
                        settings.DEFAULT_FROM_EMAIL,
                        [user.email],
                        fail_silently=False,
                    )
                else:  # phone
                    # TODO: Implement SMS sending
                    pass
                
                return Response({
                    'message': f'Verification code sent to your {method}',
                    'email': user.email
                })
            except User.DoesNotExist:
                return Response(
                    {'message': 'If an account exists, a verification code has been sent'},
                    status=status.HTTP_200_OK
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(GenericAPIView):
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = []
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                user = User.objects.get(email=serializer.validated_data['email'])
                if user.verify_otp(serializer.validated_data['otp'], method='email'):
                    user.set_password(serializer.validated_data['password'])
                    user.save()
                    return Response(
                        {'message': 'Password has been successfully updated'},
                        status=status.HTTP_200_OK
                    )
                return Response(
                    {'error': 'Invalid or expired verification code'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            except User.DoesNotExist:
                return Response(
                    {'error': 'Invalid email'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(GenericAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = self.get_serializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
