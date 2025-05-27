from django.contrib.auth.models import AbstractUser
from django.db import models
from django.contrib.auth.hashers import make_password
import hashlib
import pyotp
from datetime import timedelta
from django.utils import timezone

class User(AbstractUser):
    """
    Custom user model for Fontaine Santé
    """
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, blank=True)
    staff_id = models.CharField(max_length=128, unique=True)  # Increased length for hashed value
    position = models.CharField(max_length=100, blank=True)
    
    # Security questions
    security_question_1 = models.CharField(max_length=200)
    security_answer_1 = models.CharField(max_length=200)
    security_question_2 = models.CharField(max_length=200)
    security_answer_2 = models.CharField(max_length=200)
    
    # OTP fields
    email_otp_secret = models.CharField(max_length=32, blank=True)
    phone_otp_secret = models.CharField(max_length=32, blank=True)
    last_otp_generation = models.DateTimeField(null=True, blank=True)
    
    # Make email the username field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'staff_id', 'security_question_1', 'security_answer_1',
                      'security_question_2', 'security_answer_2']
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def _hash_staff_id(self, staff_id):
        """Hash the staff ID using SHA-256"""
        return hashlib.sha256(staff_id.encode()).hexdigest()
    
    def _hash_security_answer(self, answer):
        """Hash security answer using SHA-256"""
        return hashlib.sha256(answer.lower().strip().encode()).hexdigest()
    
    def save(self, *args, **kwargs):
        if self.staff_id and not self.staff_id.startswith('hashed_'):
            self.staff_id = f"hashed_{self._hash_staff_id(self.staff_id)}"
        
        # Hash security answers if they're not already hashed
        if self.security_answer_1 and not self.security_answer_1.startswith('hashed_'):
            self.security_answer_1 = f"hashed_{self._hash_security_answer(self.security_answer_1)}"
        if self.security_answer_2 and not self.security_answer_2.startswith('hashed_'):
            self.security_answer_2 = f"hashed_{self._hash_security_answer(self.security_answer_2)}"
            
        super().save(*args, **kwargs)
    
    def check_staff_id(self, raw_staff_id):
        """Check if the provided staff ID matches the stored hash"""
        if not self.staff_id.startswith('hashed_'):
            return False
        stored_hash = self.staff_id[7:]  # Remove 'hashed_' prefix
        return stored_hash == self._hash_staff_id(raw_staff_id)
    
    def check_security_answer(self, question_number, answer):
        """Check if the provided security answer matches the stored hash"""
        if question_number not in [1, 2]:
            return False
        
        answer_field = f'security_answer_{question_number}'
        stored_answer = getattr(self, answer_field)
        
        if not stored_answer.startswith('hashed_'):
            return False
            
        stored_hash = stored_answer[7:]  # Remove 'hashed_' prefix
        return stored_hash == self._hash_security_answer(answer)
    
    def generate_otp(self, method='email'):
        """Generate OTP for email or phone"""
        if method not in ['email', 'phone']:
            raise ValueError("Method must be either 'email' or 'phone'")
            
        # Generate new secret if needed
        if method == 'email' and not self.email_otp_secret:
            self.email_otp_secret = pyotp.random_base32()
        elif method == 'phone' and not self.phone_otp_secret:
            self.phone_otp_secret = pyotp.random_base32()
            
        # Generate OTP
        secret = self.email_otp_secret if method == 'email' else self.phone_otp_secret
        totp = pyotp.TOTP(secret, interval=300)  # 5 minutes validity
        self.last_otp_generation = timezone.now()
        self.save()
        
        return totp.now()
    
    def verify_otp(self, otp, method='email'):
        """Verify OTP for email or phone"""
        if method not in ['email', 'phone']:
            raise ValueError("Method must be either 'email' or 'phone'")
            
        # Check if OTP is expired (5 minutes)
        if not self.last_otp_generation or \
           timezone.now() - self.last_otp_generation > timedelta(minutes=5):
            return False
            
        secret = self.email_otp_secret if method == 'email' else self.phone_otp_secret
        totp = pyotp.TOTP(secret, interval=300)
        
        return totp.verify(otp)
    
    def __str__(self):
        return self.email 