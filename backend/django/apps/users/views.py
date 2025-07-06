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
    """Admin-only endpoint to register new users"""
    serializer_class = AdminUserRegistrationSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                return Response(
                    {
                        'message': 'User created successfully',
                        'user': UserSerializer(user).data
                    }, 
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                # Handle unique constraint errors more gracefully
                error_message = str(e)
                if 'UNIQUE constraint failed: users_user.staff_id' in error_message:
                    return Response(
                        {'error': 'Staff ID already exists. Please use a different Staff ID.'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                elif 'UNIQUE constraint failed: users_user.email' in error_message:
                    return Response(
                        {'error': 'Email already exists. Please use a different email address.'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                elif 'UNIQUE constraint failed: users_user.username' in error_message:
                    return Response(
                        {'error': 'Username already exists. Please choose a different username.'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                else:
                    return Response(
                        {'error': f'Failed to create user: {error_message}'}, 
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(GenericAPIView):
    """Login with staff_id and password, returns OTP challenge"""
    serializer_class = LoginSerializer
    permission_classes = []
    
    def post(self, request):
        print(f"[LOGIN DEBUG] Received login request")
        print(f"[LOGIN DEBUG] Request data: {request.data}")
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            staff_id = serializer.validated_data.get('staff_id')
            username = serializer.validated_data.get('username')
            password = serializer.validated_data['password']
            
            print(f"[LOGIN DEBUG] staff_id: {staff_id}")
            print(f"[LOGIN DEBUG] username: {username}")
            print(f"[LOGIN DEBUG] password provided: {'Yes' if password else 'No'}")
            
            try:
                # Find user by staff_id or username
                user = None
                
                if staff_id:
                    print(f"[LOGIN DEBUG] Searching by staff_id: {staff_id}")
                    # Search by staff_id
                    for u in User.objects.all():
                        print(f"[LOGIN DEBUG] Checking user {u.username} with staff_id check")
                        if u.check_staff_id(staff_id):
                            user = u
                            print(f"[LOGIN DEBUG] Found user by staff_id: {user.username}")
                            break
                elif username:
                    print(f"[LOGIN DEBUG] Searching by username: {username}")
                    # Search by username (for admin users like 'superadmin')
                    try:
                        user = User.objects.get(username=username)
                        print(f"[LOGIN DEBUG] Found user by username: {user.username}")
                    except User.DoesNotExist:
                        print(f"[LOGIN DEBUG] No user found with username: {username}")
                        pass
                
                if not user:
                    print(f"[LOGIN DEBUG] No user found - returning 401")
                    return Response(
                        {'error': 'Invalid credentials'}, 
                        status=status.HTTP_401_UNAUTHORIZED
                    )
                
                print(f"[LOGIN DEBUG] Found user: {user.email}")
                print(f"[LOGIN DEBUG] User is_active: {user.is_active}")
                print(f"[LOGIN DEBUG] User is_staff: {user.is_staff}")
                print(f"[LOGIN DEBUG] User is_superuser: {user.is_superuser}")
                print(f"[LOGIN DEBUG] User password starts with: {user.password[:20]}...")
                
                # Test password verification directly
                password_check = user.check_password(password)
                print(f"[LOGIN DEBUG] Direct password check result: {password_check}")
                
                # Authenticate with email and password
                print(f"[LOGIN DEBUG] Attempting authentication with email: {user.email}")
                authenticated_user = authenticate(
                    username=user.email,
                    password=password
                )
                
                print(f"[LOGIN DEBUG] Authentication result: {'Success' if authenticated_user else 'Failed'}")
                
                if authenticated_user:
                    # Generate OTP for additional security
                    otp = user.generate_otp(method='email')
                    
                    # Send OTP via email
                    try:
                        send_mail(
                            'Login Verification Code',
                            f'Your verification code is: {otp}\nThis code will expire in 5 minutes.',
                            settings.DEFAULT_FROM_EMAIL,
                            [user.email],
                            fail_silently=False,
                        )
                        
                        print(f"[LOGIN DEBUG] OTP sent successfully to {user.email}")
                        return Response({
                            'message': 'OTP sent to your email for verification',
                            'email': user.email,
                            'requires_otp': True
                        })
                    except Exception as e:
                        print(f"[LOGIN DEBUG] Email sending failed: {e}")
                        return Response(
                            {'error': 'Failed to send verification email'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
                
                print(f"[LOGIN DEBUG] Authentication failed - returning 401")
                return Response(
                    {'error': 'Invalid credentials'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
                
            except Exception as e:
                print(f"[LOGIN DEBUG] Exception occurred: {e}")
                return Response(
                    {'error': 'Authentication failed'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            print(f"[LOGIN DEBUG] Serializer validation failed: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class OTPVerifyView(GenericAPIView):
    """Verify OTP and complete login process"""
    serializer_class = OTPVerifySerializer
    permission_classes = []
    
    def post(self, request):
        print(f"[OTP_VERIFY DEBUG] Received OTP verification request")
        print(f"[OTP_VERIFY DEBUG] Request data: {request.data}")
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            try:
                email = serializer.validated_data.get('email')
                username = serializer.validated_data.get('username')
                otp = serializer.validated_data['otp']
                method = serializer.validated_data['method']
                
                print(f"[OTP_VERIFY DEBUG] email: {email}")
                print(f"[OTP_VERIFY DEBUG] username: {username}")
                print(f"[OTP_VERIFY DEBUG] otp: {otp}")
                print(f"[OTP_VERIFY DEBUG] method: {method}")
                
                user = None
                if email:
                    print(f"[OTP_VERIFY DEBUG] Searching by email: {email}")
                    user = User.objects.get(email=email)
                elif username:
                    print(f"[OTP_VERIFY DEBUG] Searching by username: {username}")
                    user = User.objects.get(username=username)
                
                print(f"[OTP_VERIFY DEBUG] Found user: {user.email if user else 'None'}")
                
                if user:
                    print(f"[OTP_VERIFY DEBUG] User last_otp_generation: {user.last_otp_generation}")
                    print(f"[OTP_VERIFY DEBUG] User email_otp_secret: {user.email_otp_secret}")
                    otp_valid = user.verify_otp(otp, method=method)
                    print(f"[OTP_VERIFY DEBUG] OTP verification result: {otp_valid}")
                    
                    if otp_valid:
                        # Generate JWT tokens
                        refresh = RefreshToken.for_user(user)
                        
                        print(f"[OTP_VERIFY DEBUG] OTP verification successful, returning tokens")
                        return Response({
                            'message': 'Login successful',
                            'refresh': str(refresh),
                            'access': str(refresh.access_token),
                            'user': UserSerializer(user).data
                        })
                
                print(f"[OTP_VERIFY DEBUG] OTP verification failed")
                return Response(
                    {'error': 'Invalid or expired OTP'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            except User.DoesNotExist:
                print(f"[OTP_VERIFY DEBUG] User not found")
                return Response(
                    {'error': 'Invalid user'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            print(f"[OTP_VERIFY DEBUG] Serializer validation failed: {serializer.errors}")
            return Response({
                'error': 'OTP verification failed',
                'details': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

class OTPRequestView(GenericAPIView):
    """Request new OTP for existing authenticated session"""
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
                    try:
                        send_mail(
                            'Verification Code',
                            f'Your verification code is: {otp}\nThis code will expire in 5 minutes.',
                            settings.DEFAULT_FROM_EMAIL,
                            [user.email],
                            fail_silently=False,
                        )
                        
                        return Response({
                            'message': f'OTP sent to your {method}',
                            'email': user.email
                        })
                    except Exception as e:
                        return Response(
                            {'error': 'Failed to send OTP'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
                else:  # phone
                    # TODO: Implement SMS sending integration
                    return Response(
                        {'error': 'SMS functionality not yet implemented'},
                        status=status.HTTP_501_NOT_IMPLEMENTED
                    )
                    
            except User.DoesNotExist:
                # For security, don't reveal if email exists
                return Response({
                    'message': 'If an account exists, an OTP has been sent'
                })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SecurityQuestionView(GenericAPIView):
    """Verify security question for password reset"""
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
                    # Generate OTP for password reset
                    otp = user.generate_otp(method='email')
                    
                    try:
                        send_mail(
                            'Password Reset Verification Code',
                            f'Your password reset verification code is: {otp}\nThis code will expire in 5 minutes.',
                            settings.DEFAULT_FROM_EMAIL,
                            [user.email],
                            fail_silently=False,
                        )
                        
                        return Response({
                            'message': 'Security question verified. OTP sent to your email.',
                            'email': user.email
                        })
                    except Exception as e:
                        return Response(
                            {'error': 'Failed to send verification email'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
                
                return Response(
                    {'error': 'Incorrect security answer'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
            except User.DoesNotExist:
                return Response(
                    {'error': 'Invalid email'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request):
        """Get security questions for a user"""
        email = request.query_params.get('email')
        if not email:
            return Response(
                {'error': 'Email parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
            return Response({
                'security_questions': [
                    {'number': 1, 'question': user.security_question_1},
                    {'number': 2, 'question': user.security_question_2}
                ]
            })
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class PasswordResetRequestView(GenericAPIView):
    """Request password reset OTP"""
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
                    try:
                        send_mail(
                            'Password Reset Verification Code',
                            f'Your password reset verification code is: {otp}\nThis code will expire in 5 minutes.',
                            settings.DEFAULT_FROM_EMAIL,
                            [user.email],
                            fail_silently=False,
                        )
                        
                        return Response({
                            'message': f'Password reset code sent to your {method}',
                            'email': user.email
                        })
                    except Exception as e:
                        return Response(
                            {'error': 'Failed to send reset code'},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
                else:  # phone
                    return Response(
                        {'error': 'SMS functionality not yet implemented'},
                        status=status.HTTP_501_NOT_IMPLEMENTED
                    )
                    
            except User.DoesNotExist:
                # For security, don't reveal if email exists
                return Response({
                    'message': 'If an account exists, a verification code has been sent'
                })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetConfirmView(GenericAPIView):
    """Confirm password reset with OTP"""
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
                    
                    return Response({
                        'message': 'Password has been successfully updated'
                    })
                
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
    """Get and update user profile"""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        """Update current user profile"""
        serializer = self.get_serializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Profile updated successfully',
                'user': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
