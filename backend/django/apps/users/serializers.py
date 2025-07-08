from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth.models import Group
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model with security considerations"""
    
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 
                 'phone_number', 'position', 'is_staff', 'is_active', 'date_joined',
                 'security_question_1', 'security_question_2')
        read_only_fields = ('id', 'is_staff', 'is_active', 'date_joined', 'staff_id')
        extra_kwargs = {
            'security_question_1': {'read_only': True},
            'security_question_2': {'read_only': True}
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance 

class GroupSerializer(serializers.ModelSerializer):
    """Serializer for Django auth groups"""
    
    class Meta:
        model = Group
        fields = ('id', 'name', 'permissions')
        read_only_fields = ('id',)

class LoginSerializer(serializers.Serializer):
    """Serializer for login with staff_id/username and password"""
    staff_id = serializers.CharField(
        max_length=50,
        required=False,
        help_text="Your staff identification number"
    )
    username = serializers.CharField(
        max_length=150,
        required=False,
        help_text="Your username"
    )
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text="Your password"
    )
    
    def validate(self, data):
        staff_id = data.get('staff_id')
        username = data.get('username')
        
        if not staff_id and not username:
            raise serializers.ValidationError("Either staff_id or username is required")
        
        return data

class OTPRequestSerializer(serializers.Serializer):
    """Serializer for requesting OTP"""
    email = serializers.EmailField(help_text="Email address to send OTP to")
    method = serializers.ChoiceField(
        choices=['email', 'phone'],
        default='email',
        help_text="Method to send OTP (email or phone)"
    )

class OTPVerifySerializer(serializers.Serializer):
    """Serializer for verifying OTP"""
    email = serializers.EmailField(required=False, help_text="Email address associated with the OTP")
    username = serializers.CharField(max_length=150, required=False, help_text="Username associated with the OTP")
    otp = serializers.CharField(
        min_length=6, 
        max_length=6,
        help_text="6-digit OTP code"
    )
    method = serializers.ChoiceField(
        choices=['email', 'phone'],
        default='email',
        help_text="Method used to receive OTP"
    )
    
    def validate(self, data):
        email = data.get('email')
        username = data.get('username')
        
        if not email and not username:
            raise serializers.ValidationError("Either email or username is required")
        
        return data

class SecurityQuestionSerializer(serializers.Serializer):
    """Serializer for security question verification"""
    email = serializers.EmailField(help_text="Email address")
    question_number = serializers.IntegerField(
        min_value=1, 
        max_value=2,
        help_text="Security question number (1 or 2)"
    )
    answer = serializers.CharField(
        max_length=200,
        help_text="Answer to the security question"
    )

class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    email = serializers.EmailField(help_text="Email address to send reset code to")
    method = serializers.ChoiceField(
        choices=['email', 'phone'],
        default='email',
        help_text="Method to send reset code"
    )

class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming password reset"""
    email = serializers.EmailField(help_text="Email address")
    otp = serializers.CharField(
        min_length=6, 
        max_length=6,
        help_text="6-digit verification code"
    )
    password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text="New password"
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text="Confirm new password"
    )
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        try:
            validate_password(data['password'])
        except ValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})
        return data

class AdminUserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for admin user registration"""
    password = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'},
        help_text="Password for the new user"
    )
    password_confirm = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'},
        help_text="Confirm password"
    )
    security_question_1 = serializers.CharField(
        required=True,
        max_length=200,
        help_text="First security question"
    )
    security_answer_1 = serializers.CharField(
        required=True, 
        write_only=True,
        max_length=200,
        help_text="Answer to first security question"
    )
    security_question_2 = serializers.CharField(
        required=True,
        max_length=200,
        help_text="Second security question"
    )
    security_answer_2 = serializers.CharField(
        required=True, 
        write_only=True,
        max_length=200,
        help_text="Answer to second security question"
    )
    
    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 
                 'phone_number', 'staff_id', 'position', 'password', 'password_confirm',
                 'security_question_1', 'security_answer_1',
                 'security_question_2', 'security_answer_2')
        extra_kwargs = {
            'staff_id': {'required': True, 'help_text': 'Unique staff identification number'},
            'email': {'required': True, 'help_text': 'Email address (used for login)'},
            'username': {'required': True, 'help_text': 'Username'},
            'first_name': {'help_text': 'First name'},
            'last_name': {'help_text': 'Last name'},
            'phone_number': {'help_text': 'Phone number'},
            'position': {'help_text': 'Job position/title'}
        }
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        try:
            validate_password(data['password'])
        except ValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})
        return data
    
    def create(self, validated_data):
        # Remove password_confirm from validated_data
        validated_data.pop('password_confirm')
        
        # Extract password and hash it properly
        password = validated_data.pop('password')
        
        # Create user instance
        user = User(**validated_data)
        user.set_password(password)  # This properly hashes the password
        user.is_staff = True  # Ensure managers have staff access
        user.is_active = True  # Ensure user is active
        user.save()
        
        return user 