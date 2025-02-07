from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLES = (
        ('admin', 'Administrator'),
        ('manager', 'Supply Chain Manager'),
        ('analyst', 'Supply Chain Analyst'),
        ('viewer', 'Viewer'),
    )
    
    company = models.CharField(max_length=100)
    role = models.CharField(max_length=50, choices=ROLES)
    department = models.CharField(max_length=100, blank=True)
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        
    def __str__(self):
        return f"{self.username} - {self.role}"
