from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 
                 'phone_number', 'staff_id', 'position', 'is_staff',
                 'security_question_1', 'security_question_2')
        read_only_fields = ('id', 'is_staff')
        extra_kwargs = {
            'password': {'write_only': True},
            'staff_id': {'write_only': True},
            'security_answer_1': {'write_only': True},
            'security_answer_2': {'write_only': True}
        }
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.set_password(password)
        instance.save()
        return instance 

class LoginSerializer(serializers.Serializer):
    staff_id = serializers.CharField()
    password = serializers.CharField(write_only=True)

class OTPRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    method = serializers.ChoiceField(choices=['email', 'phone'])

class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)
    method = serializers.ChoiceField(choices=['email', 'phone'])

class SecurityQuestionSerializer(serializers.Serializer):
    email = serializers.EmailField()
    question_number = serializers.IntegerField(min_value=1, max_value=2)
    answer = serializers.CharField()

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    method = serializers.ChoiceField(choices=['email', 'phone'])

class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        try:
            validate_password(data['password'])
        except ValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})
        return data

class AdminUserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True, required=True)
    security_question_1 = serializers.CharField(required=True)
    security_answer_1 = serializers.CharField(required=True, write_only=True)
    security_question_2 = serializers.CharField(required=True)
    security_answer_2 = serializers.CharField(required=True, write_only=True)
    
    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 
                 'phone_number', 'staff_id', 'position', 'password', 'password_confirm',
                 'security_question_1', 'security_answer_1',
                 'security_question_2', 'security_answer_2')
        extra_kwargs = {
            'staff_id': {'required': True}
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
        validated_data.pop('password_confirm')
        return super().create(validated_data) 